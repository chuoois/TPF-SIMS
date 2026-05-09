const { Op } = require("sequelize");
const {
  sequelize,
  Order,
  OrderItem,
  OrderHistory,
  Product,
  ProductPricing,
  ProductItem,
  ProductMaterial,
  ProductColor,
  CustomerProfile,
  UserAccount,
  UserRole,
} = require("../entities");
const systemLogController = require("./systemLog.controller");
const { sendNotification } = require("../sockets/socketManager");

/**
 * Order Controller - Chỉ bao gồm API Tạo đơn hàng (createOrder)
 * Tuân thủ logic:
 * 1. Chỉ lấy ProductItem ở trạng thái 1 (Sẵn sàng) và chưa gán đơn hàng (fk_order_item_id IS NULL).
 * 2. OrderItem kế thừa thông tin Material, Color, Size, Warranty từ Product master data.
 */
class OrderController {
  /**
   * API Tạo mới đơn hàng
   */
  async createOrder(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        fk_customer_id,
        fulfillment_method,
        expected_fulfillment_date,
        note,
        deposit_amount,
        address,
        total_amount,
        order_status,
        order_type,
        items, // items: [{ fk_product_id, item_quantity, ... }]
      } = req.body;

      const userId = req.user.userId;
      const currentStatus = order_status || 1; // Mặc định là Chờ xác nhận

      // 0. Kiểm tra và lấy thông tin khách hàng (để lấy địa chỉ mặc định)
      const customer = await CustomerProfile.findOne({
        where: { pk_customer_id: fk_customer_id, status: 1 },
      });

      if (!customer) {
        throw new Error("Không tìm thấy khách hàng hoặc khách hàng đã bị xóa.");
      }

      const finalAddress = address || customer.address;

      // 1. Tạo bản ghi Order (Header)
      const newOrder = await Order.create(
        {
          fk_customer_id,
          fk_user_account_id: userId,
          fulfillment_method,
          expected_fulfillment_date,
          note,
          deposit_amount,
          address: finalAddress,
          total_amount,
          order_status: currentStatus,
          order_type: order_type || 1, // 1: Mộc, 2: Sẵn
          status: 1,
          createby: userId,
        },
        { transaction: t },
      );

      // 2. Lấy thông tin Master Data của các sản phẩm để đối chiếu
      const productIds = items.map((i) => i.fk_product_id).filter((id) => id);
      const products = await Product.findAll({
        where: { pk_product_id: productIds, product_status: 1 },
        include: [
          {
            model: ProductMaterial,
            as: "material",
            attributes: ["material_name"],
          },
          { model: ProductColor, as: "color", attributes: ["color_name"] },
          {
            model: ProductPricing,
            as: "pricings",
            where: { status: 1 },
            required: false,
          },
        ],
      });

      if (items && items.length > 0) {
        for (const item of items) {
          // Sửa lỗi so sánh === thành == để tránh lỗi kiểu dữ liệu (string vs number)
          const product = products.find(
            (p) => p.pk_product_id == item.fk_product_id,
          );
          if (!product && item.fk_product_id) {
            throw new Error(
              `Sản phẩm ID ${item.fk_product_id} không tồn tại hoặc đã ngừng kinh doanh.`,
            );
          }

          const pricing = product?.pricings?.[0];

          // Xác định trạng thái Sơn/Mộc dựa trên loại đơn hàng nếu item không truyền
          let final_is_finished = item.is_finished;
          if (final_is_finished === undefined || final_is_finished === null) {
            final_is_finished = order_type == 1 ? 0 : 1;
          }

          // Tự động lấy giá từ Pricing nếu request không gửi giá cụ thể
          let autoPrice = item.item_price;
          if (!autoPrice && pricing) {
            autoPrice = final_is_finished
              ? pricing.final_price
              : pricing.raw_price;
          }

          // 3. Tạo OrderItem - Kế thừa (Clone) thông tin từ Product master data
          const newOrderItem = await OrderItem.create(
            {
              fk_order_id: newOrder.pk_order_id,
              fk_product_id: item.fk_product_id,
              item_name:
                item.item_name ||
                product?.product_name ||
                "Sản phẩm không xác định",
              item_img: item.item_img || product?.product_img,
              item_quantity: item.item_quantity || 1,
              item_price: autoPrice || 0,
              // Tuân thủ Product: Lấy Material, Color, Size, Warranty từ Product nếu item trống
              item_material:
                item.item_material || product?.material?.material_name,
              item_color: item.item_color || product?.color?.color_name,
              item_size: item.item_size || product?.size,
              item_warranty: item.item_warranty || product?.warranty_months,
              item_note: item.item_note,
              is_finished: final_is_finished ? 1 : 0,
              customer_img: Array.isArray(item.customer_img)
                ? item.customer_img
                : [],
              design_img: Array.isArray(item.design_img) ? item.design_img : [],
              createby: userId,
            },
            { transaction: t },
          );

          // 4. GIỮ CHỖ (ALLOCATION) - Chỉ lấy ProductItem "Sẵn sàng" và "Chưa có chủ"
          // Áp dụng cho: Đơn mộc (1), Đơn sẵn (2)
          if ([1, 2].includes(Number(order_type)) && item.fk_product_id) {
            const quantityNeeded = item.item_quantity || 1;

            const availableItems = await ProductItem.findAll({
              where: {
                fk_product_id: item.fk_product_id,
                item_status: 1, // 1: Sẵn sàng
                fk_order_item_id: null, // Quan trọng: Chưa gán cho đơn hàng nào
              },
              order: [["createdate", "ASC"]], // FIFO: Ưu tiên hàng nhập kho cũ nhất
              limit: quantityNeeded,
              transaction: t,
            });

            if (availableItems.length < quantityNeeded) {
              throw new Error(
                `Sản phẩm ${product?.product_name} không đủ số lượng sẵn sàng trong kho. (Cần ${quantityNeeded}, hiện có ${availableItems.length})`,
              );
            }

            // Cập nhật trạng thái từng món hàng chi tiết sang "Chờ giao" và gán vào OrderItem
            for (const productItem of availableItems) {
              await productItem.update(
                {
                  item_status: 2, // 2: Chờ giao
                  fk_order_item_id: newOrderItem.pk_order_item_id,
                  modifieby: userId,
                  modifiedate: new Date(),
                },
                { transaction: t },
              );
            }
          }
        }
      }

      // 5. Ghi lịch sử đơn hàng
      await OrderHistory.create(
        {
          fk_order_id: newOrder.pk_order_id,
          action: "TẠO_ĐƠN_HÀNG",
          new_status: currentStatus,
          changed_by: userId,
          note: note || "Đơn hàng được tạo mới thành công",
          createby: userId,
        },
        { transaction: t },
      );

      await t.commit();

      // Ghi log hệ thống
      await systemLogController.record(
        req,
        "CREATE_ORDER",
        `Tạo đơn hàng #${newOrder.pk_order_id}`,
        "INFO",
        userId,
      );

      // 6. Gửi thông báo real-time
      await sendNotification({
        userId: userId, // Thông báo cho người tạo
        title: "Tạo đơn hàng thành công",
        message: `Đơn hàng #${newOrder.pk_order_id} của khách ${customer.full_name} đã được tạo.`,
        type: "SUCCESS",
        link: `/orders/${newOrder.pk_order_id}`,
        createBy: userId,
      });

      // Gửi cho chủ cửa hàng (Admin/Owner)
      const admins = await UserAccount.findAll({
        include: [
          {
            model: UserRole,
            as: "role",
            where: {
              role_code: { [Op.in]: ["ADMIN", "OWNER"] },
            },
          },
        ],
        where: { status: 1 },
      });

      for (const admin of admins) {
        // Không gửi thêm nếu admin chính là người tạo (đã nhận thông báo SUCCESS ở trên)
        if (String(admin.user_account_id) !== String(userId)) {
          await sendNotification({
            userId: admin.user_account_id,
            title: "Thông báo đơn hàng mới",
            message: `Sales ${req.user.email} vừa tạo đơn hàng #${newOrder.pk_order_id} cho khách ${customer.full_name}.`,
            type: "INFO",
            link: `/orders/${newOrder.pk_order_id}`,
            createBy: userId,
          });
        }
      }

      return res.status(201).json({
        message: "Tạo đơn hàng thành công",
        order: newOrder,
      });
    } catch (error) {
      if (t && !t.finished) await t.rollback();
      console.error("Create order error:", error);
      return res
        .status(400)
        .json({ message: error.message || "Lỗi hệ thống khi tạo đơn hàng" });
    }
  }
}

module.exports = new OrderController();
