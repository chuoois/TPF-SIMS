const { randomUUID } = require("crypto");
const { AppDataSource } = require("../config/db");
const {
  ProductRepo,
  WarehouseInventoryRepo,
  OrderRepo,
  OrderItemRepo,
  SystemLogRepo,
} = require("./base.controller");

/**
 * Order Controller
 * Quản lý đơn hàng (Sales, Owner)
 *
 * Created By: DNC
 * Created Date: 26/02/2026
 */

// Helper ghi SystemLog
const writeSystemLog = async (manager, { description, actorAccount }) => {
  const logRepo = manager
    ? manager.getRepository("SystemLog")
    : SystemLogRepo;
  await logRepo.save({
    pk_system_log_id: randomUUID(),
    description,
    modified_by: actorAccount?.fullName ?? actorAccount?.email ?? "unknown",
    userAccount: actorAccount
      ? { pk_user_account_id: actorAccount.id }
      : null,
  });
};

// Sinh order_code: HD + ngày + 6 ký tự hex
const generateOrderCode = () => {
  const now = new Date();
  const dateStr =
    String(now.getFullYear()).slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `HD${dateStr}${rand}`;
};

/**
 * Get Products For Sale (with SKU + inventory info)
 * GET /sales/products?search=
 * Role: SALES, OWNER
 */
const getProductsForSale = async (req, res) => {
  try {
    const { search } = req.query;

    let qb = ProductRepo.createQueryBuilder("p")
      .leftJoinAndSelect("p.skus", "sku")
      .leftJoin("sku.warehouseInventories", "inv")
      .addSelect("COALESCE(SUM(inv.quantity_available), 0)", "total_stock")
      .groupBy("p.pk_product_id")
      .addGroupBy("sku.pk_sku_id")
      .orderBy("p.created_at", "DESC");

    if (search) {
      qb = qb.where("p.product_name LIKE :search", {
        search: `%${search}%`,
      });
    }

    const rawProducts = await qb.getRawAndEntities();

    // Ghép dữ liệu raw (total_stock) với entity
    const products = rawProducts.entities.map((product) => {
      // Tìm raw row tương ứng để lấy stock
      const rawRow = rawProducts.raw.find(
        (r) => r.p_pk_product_id === product.pk_product_id
      );

      const skus = product.skus || [];
      const firstSku = skus[0] || null;

      return {
        pk_product_id: product.pk_product_id,
        product_name: product.product_name,
        selling_price: parseFloat(product.selling_price) || 0,
        product_status: product.product_status,
        sku: firstSku
          ? {
              pk_sku_id: firstSku.pk_sku_id,
              sku_code: firstSku.sku_code,
              sku_type: firstSku.sku_type,
              wood_type: firstSku.wood_type,
              size: firstSku.size,
              sku_color: firstSku.sku_color,
            }
          : null,
        stock: parseInt(rawRow?.total_stock) || 0,
      };
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("Get Products For Sale Error:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
  }
};

/**
 * Create In-Stock Order
 * POST /sales/orders/instock
 * Role: SALES, OWNER
 *
 * Body: {
 *   customerId?: string,     // Tùy chọn (khách lẻ = null)
 *   orderNote?: string,
 *   discount?: number,
 *   items: [{ skuId, quantity, unitPrice }]
 * }
 */
const createInStockOrder = async (req, res) => {
  try {
    const { customerId, orderNote, discount = 0, items } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng" });
    }

    // Dùng transaction để đảm bảo tính toàn vẹn
    const result = await AppDataSource.transaction(async (manager) => {
      const invRepo = manager.getRepository("WarehouseInventory");
      const orderRepo = manager.getRepository("Order");
      const orderItemRepo = manager.getRepository("OrderItem");

      // 1. Kiểm tra tồn kho cho từng item
      for (const item of items) {
        if (!item.skuId || !item.quantity || item.quantity <= 0) {
          throw { status: 400, message: "Dữ liệu sản phẩm không hợp lệ" };
        }

        // Lấy tổng tồn kho của SKU
        const inventories = await invRepo
          .createQueryBuilder("inv")
          .where("inv.fk_sku_id = :skuId", { skuId: item.skuId })
          .getMany();

        const totalAvailable = inventories.reduce(
          (sum, inv) => sum + (inv.quantity_available || 0),
          0
        );

        if (totalAvailable < item.quantity) {
          // Lấy tên SKU cho thông báo lỗi
          const skuEntity = await manager.getRepository("Sku").findOne({
            where: { pk_sku_id: item.skuId },
            relations: ["product"],
          });
          const name = skuEntity?.product?.product_name || item.skuId;
          throw {
            status: 400,
            message: `Sản phẩm "${name}" không đủ tồn kho (còn ${totalAvailable}, cần ${item.quantity})`,
          };
        }
      }

      // 2. Tính tổng tiền
      const subtotal = items.reduce(
        (sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 0),
        0
      );
      const totalAmount = Math.max(0, subtotal - discount);

      // 3. Tạo Order
      const orderId = randomUUID();
      const order = orderRepo.create({
        pk_order_id: orderId,
        order_code: generateOrderCode(),
        order_type: "IN_STOCK",
        fk_customer_id: customerId || null,
        customer_note: orderNote || null,
        order_date: new Date(),
        total_amount: totalAmount,
        deposit_amount: 0,
        vat_rate: 0,
        order_status: "COMPLETED",
      });
      await orderRepo.save(order);

      // 4. Tạo OrderItems + Trừ tồn kho
      for (const item of items) {
        // Tạo OrderItem
        const orderItem = orderItemRepo.create({
          pk_order_item_id: randomUUID(),
          fk_order_id: orderId,
          fk_sku_id: item.skuId,
          quantity: item.quantity,
          unit_price: item.unitPrice || 0,
        });
        await orderItemRepo.save(orderItem);

        // Trừ tồn kho (FIFO – trừ từ inventory đầu tiên)
        let remaining = item.quantity;
        const inventories = await invRepo
          .createQueryBuilder("inv")
          .where("inv.fk_sku_id = :skuId", { skuId: item.skuId })
          .orderBy("inv.created_at", "ASC")
          .getMany();

        for (const inv of inventories) {
          if (remaining <= 0) break;
          const deduct = Math.min(inv.quantity_available || 0, remaining);
          inv.quantity_available = (inv.quantity_available || 0) - deduct;
          remaining -= deduct;
          await invRepo.save(inv);
        }
      }

      return { orderId, orderCode: order.order_code, totalAmount };
    });

    // Ghi System Log (ngoài transaction)
    await writeSystemLog(AppDataSource.manager, {
      description: `Tạo hóa đơn bán hàng có sẵn: ${result.orderCode} - Tổng: ${result.totalAmount.toLocaleString("vi-VN")}đ`,
      actorAccount: req.user,
    });

    return res.status(201).json({
      message: "Tạo hóa đơn thành công",
      order: result,
    });
  } catch (error) {
    // Custom error (validation)
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Create InStock Order Error:", error);
    return res.status(500).json({ message: "Lỗi server khi tạo hóa đơn" });
  }
};

/**
 * Create Custom Order (Đơn đặt hàng riêng)
 * POST /sales/orders/custom
 * Role: SALES, OWNER
 *
 * Body: {
 *   customerId: string,          // Bắt buộc (hàng đặt riêng cần KH)
 *   orderNote?: string,
 *   discount?: number,
 *   depositAmount?: number,
 *   vatRate?: number,
 *   deliveryInfo?: { recipientName, recipientPhone, address, district, ward, expectedDate, shippingNote },
 *   items: [{ productName, woodType, size, color, quantity, unitPrice, note }]
 * }
 */
const createCustomOrder = async (req, res) => {
  try {
    const {
      customerId,
      orderNote,
      discount = 0,
      depositAmount = 0,
      vatRate = 0,
      deliveryInfo,
      items,
    } = req.body;

    // Validate
    if (!customerId) {
      return res
        .status(400)
        .json({ message: "Đơn đặt hàng riêng bắt buộc phải có thông tin khách hàng" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng" });
    }

    for (const item of items) {
      if (!item.productName || !item.productName.trim()) {
        return res
          .status(400)
          .json({ message: "Tên sản phẩm không được để trống" });
      }
    }

    const result = await AppDataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository("Order");
      const orderItemRepo = manager.getRepository("OrderItem");

      // 1. Tính tổng tiền
      const subtotal = items.reduce(
        (sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 1),
        0
      );
      const vatAmount = Math.round(subtotal * (vatRate / 100));
      const totalAmount = Math.max(0, subtotal + vatAmount - discount);

      // 2. Ghép địa chỉ giao hàng
      let orderAddress = null;
      if (deliveryInfo) {
        const parts = [
          deliveryInfo.address,
          deliveryInfo.ward,
          deliveryInfo.district,
        ].filter(Boolean);
        orderAddress = parts.join(", ") || null;
      }

      // 3. Tạo Order (CUSTOM – không liên kết Product/SKU)
      const orderId = randomUUID();
      const orderCode = generateOrderCode();
      const order = orderRepo.create({
        pk_order_id: orderId,
        order_code: orderCode,
        order_type: "CUSTOM",
        fk_customer_id: customerId || null,
        customer_note: orderNote || null,
        order_address: orderAddress,
        order_date: new Date(),
        expected_delivery_date: deliveryInfo?.expectedDate || null,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        vat_rate: vatRate,
        order_status: "PENDING",
      });
      await orderRepo.save(order);

      // 4. Tạo OrderItem – lưu thông tin sản phẩm custom trực tiếp
      for (const item of items) {
        const orderItem = orderItemRepo.create({
          pk_order_item_id: randomUUID(),
          fk_order_id: orderId,
          fk_sku_id: null,
          custom_product_name: item.productName.trim(),
          custom_wood_type: item.woodType || null,
          custom_size: item.size || null,
          custom_color: item.color || null,
          custom_note: item.note || null,
          quantity: item.quantity || 1,
          unit_price: item.unitPrice || 0,
        });
        await orderItemRepo.save(orderItem);
      }

      return { orderId, orderCode, totalAmount, depositAmount };
    });

    // Ghi System Log
    await writeSystemLog(AppDataSource.manager, {
      description: `Tạo đơn đặt hàng riêng: ${result.orderCode} - Tổng: ${result.totalAmount.toLocaleString("vi-VN")}đ - Cọc: ${result.depositAmount.toLocaleString("vi-VN")}đ`,
      actorAccount: req.user,
    });

    return res.status(201).json({
      message: "Tạo đơn đặt hàng thành công",
      order: result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Create Custom Order Error:", error);
    return res.status(500).json({ message: "Lỗi server khi tạo đơn đặt hàng" });
  }
};

module.exports = {
  getProductsForSale,
  createInStockOrder,
  createCustomOrder,
};
