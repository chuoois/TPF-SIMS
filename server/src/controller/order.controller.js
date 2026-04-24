const { Op } = require("sequelize");
const { sequelize, Order, OrderItem, OrderHistory, CustomerProfile, Product, ProductPricing, CustomRequest, CustomRequestItem } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * Order Controller - Quản lý đơn hàng
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
class OrderController {
    /**
     * Lấy danh sách đơn hàng (Có lọc và phân trang)
     */
    async getAllOrders(req, res) {
        try {
            const { order_status, customer_id, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const where = { status: 1 }; // Chỉ lấy các đơn hàng chưa bị xóa (active)

            // Lọc theo trạng thái đơn hàng (Ví dụ: 1: Pending, 2: Confirmed...)
            if (order_status) {
                where.order_status = order_status;
            }

            // Lọc theo khách hàng
            if (customer_id) {
                where.fk_customer_id = customer_id;
            }

            // Lọc theo loại đơn hàng (1: Mộc, 2: Sẵn, 3: Custom)
            const { order_type } = req.query;
            if (order_type) {
                where.order_type = order_type;
            }

            const { count, rows } = await Order.findAndCountAll({
                where,
                include: [
                    {
                        model: CustomerProfile,
                        as: "customer",
                        attributes: ["full_name", "phone_number", "customer_code"],
                    },
                ],
                order: [["createdate", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

            return res.status(200).json({
                data: rows,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                },
            });
        } catch (error) {
            console.error("Get all orders error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách đơn hàng" });
        }
    }

    /**
     * Tạo mới đơn hàng và chi tiết sản phẩm
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
                order_status, // Lấy trạng thái từ request nếu có
                order_type,   // 1: Mộc, 2: Sẵn, 3: Custom
                items, // Danh sách sản phẩm [{ fk_product_id, item_name, item_quantity, ... }]
            } = req.body;

            const userId = req.user.userId;
            const currentStatus = order_status || 1; // Mặc định là 1 (Pending) nếu không truyền

            // 1. Tạo đơn hàng (Order)
            const newOrder = await Order.create(
                {
                    fk_customer_id,
                    fk_user_account_id: userId,
                    fulfillment_method,
                    expected_fulfillment_date,
                    note,
                    deposit_amount,
                    address,
                    total_amount,
                    order_status: currentStatus,
                    order_type: order_type || 1, // Mặc định là đơn hàng mộc nếu không truyền
                    status: 1, // Đơn hàng mới luôn ở trạng thái active
                    createby: userId,
                },
                { transaction: t }
            );

            // 2. Lấy thông tin sản phẩm và giá để clone dữ liệu
            const productIds = items.map((item) => item.fk_product_id).filter((id) => id);

            // Lấy thông tin sản phẩm
            const products = await Product.findAll({
                where: { pk_product_id: productIds },
            });

            // Lấy thông tin giá đang áp dụng (status: 1)
            const pricings = await ProductPricing.findAll({
                where: {
                    fk_product_id: productIds,
                    status: 1
                },
            });

            if (items && items.length > 0) {
                const orderItemsData = items.map((item) => {
                    const product = products.find((p) => p.pk_product_id === item.fk_product_id);
                    const pricing = pricings.find((p) => p.fk_product_id === item.fk_product_id);

                    // Xác định is_finished dựa trên order_type nếu item không truyền
                    let final_is_finished = item.is_finished;
                    if (final_is_finished === undefined || final_is_finished === null) {
                        if (order_type == 1) final_is_finished = 0; // Đơn mộc
                        else final_is_finished = 1; // Đơn sẵn hoặc custom
                    }

                    // Xác định giá dựa trên loại sản phẩm và việc có sơn hay không
                    let autoPrice = 0;
                    if (pricing) {
                        if (product && product.product_type === 2) {
                            // Hàng đặt riêng (Custom): Luôn lấy giá hoàn thiện (final_price)
                            autoPrice = pricing.final_price;
                        } else {
                            // Hàng mẫu/sẵn: Lấy theo lựa chọn mộc (raw) hoặc sơn (final)
                            autoPrice = final_is_finished ? pricing.final_price : pricing.raw_price;
                        }
                    }

                    return {
                        ...item,
                        item_name: item.item_name || (product ? product.product_name : "Sản phẩm không xác định"),
                        item_img: item.item_img || (product ? product.product_img : null),
                        // Nếu request không gửi giá, tự động lấy giá từ bảng Pricing
                        item_price: item.item_price || autoPrice,
                        is_finished: final_is_finished ? 1 : 0, // Lưu lại trạng thái mộc/sơn vào đơn hàng
                        fk_order_id: newOrder.pk_order_id,
                        createby: userId,
                        customer_img: Array.isArray(item.customer_img) ? item.customer_img : (item.customer_img ? [item.customer_img] : []),
                        design_img: Array.isArray(item.design_img) ? item.design_img : (item.design_img ? [item.design_img] : []),
                    };
                });

                await OrderItem.bulkCreate(orderItemsData, { transaction: t });
            }

            // 3. Tạo bản ghi lịch sử đơn hàng (OrderHistory)
            await OrderHistory.create(
                {
                    fk_order_id: newOrder.pk_order_id,
                    action: "TẠO_ĐƠN_HÀNG",
                    old_status: null,
                    new_status: currentStatus,
                    changed_by: userId,
                    changed_at: new Date(),
                    note: note || "Đơn hàng được tạo mới từ hệ thống",
                    createby: userId,
                },
                { transaction: t }
            );

            // Nếu mọi thứ ok, commit transaction
            await t.commit();

            // Ghi log hệ thống
            await systemLogController.record(
                req,
                "CREATE_ORDER",
                `Đã tạo đơn hàng mới: ID ${newOrder.pk_order_id} cho khách hàng ID ${fk_customer_id}`,
                "INFO",
                userId
            );

            return res.status(201).json({
                message: "Tạo đơn hàng thành công",
                order: newOrder,
            });
        } catch (error) {
            // Nếu có lỗi, rollback transaction
            await t.rollback();
            console.error("Create order error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tạo đơn hàng" });
        }
    }

    /**
     * Lấy danh sách đơn hàng của một khách hàng cụ thể
     */
    async getOrdersByCustomer(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await Order.findAndCountAll({
                where: { 
                    fk_customer_id: id,
                    status: 1 // Chỉ lấy đơn hàng active
                },
                include: [
                    {
                        model: CustomerProfile,
                        as: "customer",
                        attributes: ["full_name", "phone_number", "customer_code"],
                    },
                ],
                order: [["createdate", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

            return res.status(200).json({
                data: rows,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                },
            });
        } catch (error) {
            console.error("Get orders by customer error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách đơn hàng của khách hàng" });
        }
    }

    /**
     * Chuyển đổi một Yêu cầu đặt riêng (CustomRequest) thành Đơn hàng (Order)
     * Hỗ trợ chuyển đổi toàn bộ danh sách sản phẩm trong yêu cầu
     */
    async convertRequestToOrder(req, res) {
        const t = await sequelize.transaction();
        try {
            const { custom_request_id, fulfillment_method, expected_fulfillment_date, deposit_amount, address } = req.body;
            const userId = req.user.userId;

            // 1. Kiểm tra yêu cầu tồn tại và lấy danh sách sản phẩm (Detail)
            const customRequest = await CustomRequest.findByPk(custom_request_id, {
                include: [{ model: CustomRequestItem, as: "items" }]
            });

            if (!customRequest) {
                return res.status(404).json({ message: "Không tìm thấy yêu cầu đặt riêng" });
            }

            if (customRequest.status === 3) {
                return res.status(400).json({ message: "Yêu cầu này đã được chuyển thành đơn hàng trước đó" });
            }

            if (!customRequest.items || customRequest.items.length === 0) {
                return res.status(400).json({ message: "Yêu cầu này không có sản phẩm nào để chuyển đổi" });
            }

            // 2. Tạo đơn hàng mới (Order Header)
            const newOrder = await Order.create({
                fk_customer_id: customRequest.fk_customer_id,
                fk_user_account_id: userId,
                fulfillment_method: fulfillment_method || "Delivery",
                expected_fulfillment_date: expected_fulfillment_date || null,
                note: `Được tạo từ yêu cầu đặt riêng ID: ${customRequest.request_code || custom_request_id}`,
                deposit_amount: deposit_amount || 0,
                address: address || "",
                total_amount: customRequest.total_estimated_price,
                order_status: 1, // Pending
                order_type: 3,   // Custom Order
                status: 1,
                createby: userId
            }, { transaction: t });

            // 3. Chuyển đổi từng CustomRequestItem sang OrderItem
            for (const reqItem of customRequest.items) {
                const newOrderItem = await OrderItem.create({
                    fk_order_id: newOrder.pk_order_id,
                    fk_product_id: null,
                    item_name: reqItem.item_name,
                    item_quantity: reqItem.item_quantity,
                    item_material: reqItem.item_material,
                    item_size: reqItem.item_size,
                    item_color: reqItem.item_color,
                    item_price: reqItem.item_price,
                    item_note: reqItem.item_note,
                    customer_img: reqItem.customer_img,
                    design_img: reqItem.design_img,
                    is_finished: 1,
                    status: 1,
                    createby: userId
                }, { transaction: t });


            }

            // 5. Cập nhật trạng thái CustomRequest
            await customRequest.update({
                status: 3, // Ordered
                fk_order_id: newOrder.pk_order_id,
                modifieby: userId,
                modifiedate: new Date()
            }, { transaction: t });

            // 6. Ghi lịch sử
            await OrderHistory.create({
                fk_order_id: newOrder.pk_order_id,
                action: "CHUYỂN_TỪ_YÊU_CẦU_CUSTOM",
                new_status: 1,
                changed_by: userId,
                note: `Chuyển đổi ${customRequest.items.length} sản phẩm từ yêu cầu #${custom_request_id}`,
                createby: userId
            }, { transaction: t });

            await t.commit();

            // Ghi log hệ thống
            await systemLogController.record(
                req,
                "CONVERT_CUSTOM_REQUEST",
                `Đã chuyển yêu cầu #${custom_request_id} thành đơn hàng #${newOrder.pk_order_id} (${customRequest.items.length} món)`,
                "INFO",
                userId
            );

            return res.status(201).json({
                message: "Chuyển đổi đơn hàng thành công",
                order: newOrder
            });

        } catch (error) {
            await t.rollback();
            console.error("Convert request error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi chuyển đổi yêu cầu" });
        }
    }
}

module.exports = new OrderController();
