const { Op } = require("sequelize");
const {
    sequelize,
    ManufacturingOrder,
    ManufacturingOrderItem,
    Supplier,
    Product,
    CustomRequestItem,
    UserAccount
} = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * ManufacturingOrder Controller - Quản lý phiếu nhập hàng / gia công gửi xưởng
 * Created By: ThinhBui
 * Created Date: 13/05/2026
 */
class ManufacturingOrderController {
    /**
     * Lấy danh sách tất cả các phiếu nhập hàng
     */
    async getAllOrders(req, res) {
        try {
            const { supplier_id, status, search, page = 1, limit = 15 } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (supplier_id) where.fk_supplier_id = supplier_id;
            if (status !== undefined && status !== "") where.status = status;

            if (search) {
                where[Op.or] = [
                    { order_code: { [Op.like]: `%${search}%` } },
                    { note: { [Op.like]: `%${search}%` } },
                    { "$supplier.supplier_name$": { [Op.like]: `%${search}%` } }
                ];
            }

            const { count, rows } = await ManufacturingOrder.findAndCountAll({
                where,
                include: [
                    {
                        model: Supplier,
                        as: "supplier",
                        attributes: ["supplier_name"]
                    },
                    {
                        model: ManufacturingOrderItem,
                        as: "items",
                        attributes: ["pk_manufacturing_order_item_id", "quantity"]
                    }
                ],
                order: [["createdate", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset),
                subQuery: false
            });

            return res.status(200).json({
                data: rows,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page)
                }
            });
        } catch (error) {
            console.error("Get all manufacturing orders error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách phiếu nhập hàng" });
        }
    }

    /**
     * Lấy chi tiết một phiếu nhập hàng
     */
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await ManufacturingOrder.findByPk(id, {
                include: [
                    { model: Supplier, as: "supplier" },
                    {
                        model: ManufacturingOrderItem,
                        as: "items",
                        include: [
                            { model: Product, as: "product", attributes: ["product_name", "sku", "product_img"] },
                            { model: CustomRequestItem, as: "customRequestItem" }
                        ]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy phiếu nhập hàng" });
            }

            return res.status(200).json({ data: order });
        } catch (error) {
            console.error("Get manufacturing order detail error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết phiếu nhập hàng" });
        }
    }

    /**
     * Tạo mới một phiếu nhập hàng từ danh sách sản phẩm được chọn
     */
    async createOrder(req, res) {
        const t = await sequelize.transaction();
        try {
            const {
                fk_supplier_id,
                note,
                deposit_amount,
                expected_delivery_date,
                items // Array of items: { fk_product_id, fk_custom_request_item_id, item_name, quantity, import_price, ... }
            } = req.body;
            const userId = req.user.userId;

            // 1. Sinh mã phiếu tự động
            const now = new Date();
            const dateStr = now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, "0") +
                String(now.getDate()).padStart(2, "0");
            const countToday = await ManufacturingOrder.count({
                where: {
                    order_code: { [Op.like]: `YCNH-${dateStr}-%` }
                }
            });
            const seq = String(countToday + 1).padStart(3, "0");
            const order_code = `YCNH-${dateStr}-${seq}`;

            // 2. Tính tổng tiền
            let total_amount = 0;
            if (items && items.length > 0) {
                total_amount = items.reduce((sum, it) => sum + (Number(it.import_price || 0) * (it.quantity || 1)), 0);
            }

            // 3. Tạo Header
            const newOrder = await ManufacturingOrder.create({
                order_code,
                fk_supplier_id,
                status: 1, // Mới tạo
                total_amount,
                deposit_amount: deposit_amount || 0,
                expected_delivery_date,
                note,
                createby: userId
            }, { transaction: t });

            // 4. Validate Custom Request Items (prevent duplicates)
            const customRequestItemIds = items
                .filter(it => it.fk_custom_request_item_id)
                .map(it => it.fk_custom_request_item_id);

            if (customRequestItemIds.length > 0) {
                const existingItems = await ManufacturingOrderItem.findAll({
                    where: { fk_custom_request_item_id: { [Op.in]: customRequestItemIds } },
                    attributes: ['fk_custom_request_item_id'],
                    transaction: t
                });

                if (existingItems.length > 0) {
                    await t.rollback();
                    return res.status(400).json({ message: "Một số sản phẩm từ yêu cầu khách hàng đã được tạo phiếu nhập trước đó." });
                }
            }

            // 5. Tạo chi tiết sản phẩm
            if (items && items.length > 0) {
                let itemsData = items.map(item => ({
                    fk_manufacturing_order_id: newOrder.pk_manufacturing_order_id,
                    fk_product_id: item.fk_product_id || null,
                    fk_custom_request_item_id: item.fk_custom_request_item_id || null,
                    item_name: item.item_name,
                    item_material: item.item_material,
                    item_size: item.item_size,
                    item_color: item.item_color,
                    item_is_bundle: item.item_is_bundle || 0,
                    item_bundle_items: item.item_bundle_items || null,
                    quantity: item.quantity || 1,
                    import_price: item.import_price || 0,
                    expected_date: item.expected_date || expected_delivery_date,
                    note: item.note,
                    createby: userId
                }));
                // Lấy thông tin từ Product nếu có
                const productIds = itemsData.map(it => it.fk_product_id).filter(Boolean);
                let productsMap = {};
                if (productIds.length > 0) {
                    const products = await Product.findAll({
                        where: { pk_product_id: { [Op.in]: productIds } },
                        attributes: ['pk_product_id', 'is_bundle', 'bundle_items'],
                        transaction: t
                    });
                    products.forEach(p => {
                        productsMap[p.pk_product_id] = p;
                    });
                }

                itemsData = itemsData.map(item => {
                    if (item.fk_product_id && productsMap[item.fk_product_id]) {
                        const prod = productsMap[item.fk_product_id];
                        // Ghi đè hoặc clone dữ liệu bundle từ product nếu chưa có
                        if (prod.is_bundle === 1) {
                            item.item_is_bundle = 1;
                            item.item_bundle_items = item.item_bundle_items || prod.bundle_items;
                        }
                    }
                    return item;
                });

                await ManufacturingOrderItem.bulkCreate(itemsData, { transaction: t });

                // 5. Cập nhật trạng thái các CustomRequestItem nếu có liên kết
                const customRequestItemIdsToUpdate = items
                    .filter(it => it.fk_custom_request_item_id)
                    .map(it => it.fk_custom_request_item_id);

                if (customRequestItemIdsToUpdate.length > 0) {
                    // Cập nhật trạng thái CustomRequestItem (giả sử có trường status hoặc dùng status của CustomRequest)
                    // Hiện tại CustomRequestItem chưa có status riêng rõ ràng ngoài is_finished
                    // Nhưng ta có thể cập nhật fk_supplier_id nếu chưa có
                    await CustomRequestItem.update(
                        { fk_supplier_id: fk_supplier_id, modifiedate: new Date(), modifieby: userId },
                        { where: { pk_custom_request_item_id: { [Op.in]: customRequestItemIdsToUpdate } }, transaction: t }
                    );
                }
            }

            await t.commit();

            await systemLogController.record(req, "CREATE_MANUFACTURING_ORDER", `Tạo phiếu nhập hàng mới ${order_code}`, "INFO", userId);

            return res.status(201).json({
                message: "Tạo phiếu nhập hàng thành công",
                data: newOrder
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Create manufacturing order error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tạo phiếu nhập hàng" });
        }
    }

    /**
     * Cập nhật trạng thái phiếu nhập hàng
     */
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.userId;

            const order = await ManufacturingOrder.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy phiếu nhập hàng" });
            }

            await order.update({
                status,
                modifieby: userId,
                modifiedate: new Date()
            });

            await systemLogController.record(req, "UPDATE_MANUFACTURING_ORDER_STATUS", `Cập nhật trạng thái phiếu ${order.order_code} sang ${status}`, "INFO", userId);

            return res.status(200).json({ message: "Cập nhật trạng thái thành công", data: order });
        } catch (error) {
            console.error("Update manufacturing order status error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái" });
        }
    }
}

module.exports = new ManufacturingOrderController();
