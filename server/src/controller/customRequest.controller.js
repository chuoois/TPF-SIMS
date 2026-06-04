const { Op } = require("sequelize");
const { sequelize, CustomRequest, CustomRequestItem, CustomerProfile, UserAccount, UserRole, Supplier, Order, OrderItem, OrderHistory, OrderItemProcessing, ManufacturingOrderItem } = require("../entities");
const systemLogController = require("./systemLog.controller");
const { sendNotification } = require("../sockets/socketManager");

/**
 * CustomRequest Controller - Quản lý phiếu yêu cầu đặt hàng riêng
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
class CustomRequestController {
    /**
     * Tạo mới một phiếu yêu cầu kèm danh sách sản phẩm
     */
    async createRequest(req, res) {
        const t = await sequelize.transaction();
        try {
            const {
                fk_customer_id, note, address,
                order_status, order_type, items
            } = req.body;
            const userId = req.user.userId;

            // 1. Tạo Header
            const newRequest = await CustomRequest.create({
                fk_customer_id,
                request_code: "YC-" + Date.now(),
                address,
                status: order_status || 1,
                order_type: order_type || 3,
                note,
                createby: userId
            }, { transaction: t });

            // 2. Tạo chi tiết sản phẩm (Items)
            if (items && items.length > 0) {
                const itemsData = items.map(item => ({
                    ...item,
                    item_is_bundle: item.item_is_bundle || 0,
                    item_bundle_items: item.item_is_bundle ? item.item_bundle_items : null,
                    fk_custom_request_id: newRequest.pk_custom_request_id,
                    createby: userId
                }));
                await CustomRequestItem.bulkCreate(itemsData, { transaction: t });
            }

            await t.commit();

            await systemLogController.record(req, "CREATE_CUSTOM_REQUEST", `Tạo yêu cầu đặt riêng mới ID: ${newRequest.pk_custom_request_id}`, "INFO", userId);

            // 3. Gửi thông báo real-time
            await sendNotification({
                userId: userId,
                title: "Ghi nhận yêu cầu thành công",
                message: `Yêu cầu đặt riêng ${newRequest.request_code} đã được tạo thành công.`,
                type: "SUCCESS",
                link: `/custom-requirements/${newRequest.pk_custom_request_id}`,
                createBy: userId
            });

            // Gửi cho Admin/Owner
            const recipients = await UserAccount.findAll({
                include: [{
                    model: UserRole,
                    as: "role",
                    where: {
                        role_code: { [Op.in]: ["ADMIN", "OWNER"] }
                    }
                }],
                where: { status: 1 }
            });

            for (const recipient of recipients) {
                if (String(recipient.user_account_id) !== String(userId)) {
                    await sendNotification({
                        userId: recipient.user_account_id,
                        title: "Yêu cầu đặt riêng mới",
                        message: `Sales ${req.user.email} vừa tạo yêu cầu đặt riêng mới ${newRequest.request_code}.`,
                        type: "INFO",
                        link: `/custom-requirements/${newRequest.pk_custom_request_id}`,
                        createBy: userId
                    });
                }
            }

            return res.status(201).json({
                message: "Tạo yêu cầu đặt riêng thành công",
                data: newRequest
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Create custom request error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tạo yêu cầu" });
        }
    }

    /**
     * Lấy danh sách yêu cầu (Có lọc theo trạng thái)
     */
    async getAllRequests(req, res) {
        try {
            const { status, customer_id, search, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const where = {};

            // Handle status (could be 0, 1, 2, 3 or '0','1','2','3')
            if (status !== undefined && status !== "" && status !== "Tất cả") {
                where.status = status;
            }

            if (customer_id) where.fk_customer_id = customer_id;

            // Search by code or customer info
            if (search) {
                where[Op.or] = [
                    { request_code: { [Op.like]: `%${search}%` } },
                    { "$customer.full_name$": { [Op.like]: `%${search}%` } },
                    { "$customer.phone_number$": { [Op.like]: `%${search}%` } },
                    { "$items.item_name$": { [Op.like]: `%${search}%` } }
                ];
            }

            // Refined Date filtering
            if (dateFrom || dateTo) {
                const dateCond = {};
                if (dateFrom) dateCond[Op.gte] = `${dateFrom} 00:00:00`;
                if (dateTo) dateCond[Op.lte] = `${dateTo} 23:59:59`;
                where.createdate = dateCond;
            }

            const { count, rows } = await CustomRequest.findAndCountAll({
                where,
                include: [
                    {
                        model: CustomerProfile,
                        as: "customer",
                        attributes: ["full_name", "phone_number"]
                    },
                    {
                        model: CustomRequestItem,
                        as: "items",
                        include: [
                            { model: Supplier, as: "supplier", attributes: ["supplier_name"] },
                            { model: ManufacturingOrderItem, as: "manufacturingDetail", attributes: ["pk_manufacturing_order_item_id"] }
                        ]
                    }
                ],
                order: [["createdate", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset),
                subQuery: false
            });

            // Also get counts for each status for the filter bar
            const statusCounts = await CustomRequest.findAll({
                attributes: [
                    "status",
                    [sequelize.fn("COUNT", sequelize.col("pk_custom_request_id")), "count"]
                ],
                group: ["status"],
                raw: true
            });

            // Convert to a more usable format for frontend
            const countsMap = {
                all: count,
            };
            statusCounts.forEach(sc => {
                countsMap[sc.status] = parseInt(sc.count);
            });

            const isOwner = req.user.roleCode === "OWNER" || req.user.roleCode === "ADMIN";

            // Security: Remove item_cost_price if not owner/admin
            const filteredRows = rows.map(row => {
                const plainRow = row.get({ plain: true });
                if (!isOwner && plainRow.items) {
                    plainRow.items = plainRow.items.map(item => {
                        const { item_cost_price, ...rest } = item;
                        return rest;
                    });
                }
                return plainRow;
            });

            return res.status(200).json({
                data: filteredRows,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page)
                },
                statusCounts: countsMap
            });
        } catch (error) {
            console.error("Get all requests error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách yêu cầu" });
        }
    }

    /**
     * Lấy chi tiết một yêu cầu và các sản phẩm bên trong
     */
    async getRequestById(req, res) {
        try {
            const { id } = req.params;
            const request = await CustomRequest.findByPk(id, {
                include: [
                    { model: CustomerProfile, as: "customer" },
                    {
                        model: CustomRequestItem,
                        as: "items",
                        include: [{ model: Supplier, as: "supplier", attributes: ["supplier_name"] }]
                    }
                ]
            });

            if (!request) {
                return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
            }

            const isOwner = req.user.roleCode === "OWNER" || req.user.roleCode === "ADMIN";
            const plainRequest = request.get({ plain: true });

            // Security: Remove item_cost_price if not owner/admin
            if (!isOwner && plainRequest.items) {
                plainRequest.items = plainRequest.items.map(item => {
                    const { item_cost_price, ...rest } = item;
                    return rest;
                });
            }

            return res.status(200).json({ data: plainRequest });
        } catch (error) {
            console.error("Get request detail error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết yêu cầu" });
        }
    }

    /**
     * Cập nhật trạng thái yêu cầu (Xác nhận/Báo giá)
     */
    async updateStatus(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { status, total_estimated_price, note } = req.body;
            const userId = req.user.userId;

            const request = await CustomRequest.findByPk(id, {
                include: [
                    { model: CustomRequestItem, as: "items" },
                    { model: CustomerProfile, as: "customer" }
                ],
                transaction: t
            });

            if (!request) {
                await t.rollback();
                return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
            }

            const oldStatus = request.status;

            // 1. Cập nhật trạng thái yêu cầu
            await request.update({
                status,
                total_estimated_price: total_estimated_price || request.total_estimated_price,
                note: note || request.note,
                modifieby: userId,
                modifiedate: new Date()
            }, { transaction: t });

            // 2. LOGIC: Tự động tạo Order khi chuyển sang Hoàn thành (status 3)
            let createdOrderId = null;
            if (Number(status) === 3 && Number(oldStatus) !== 3 && !request.fk_order_id) {
                // A. Tạo Order Header
                const newOrder = await Order.create({
                    order_code: `DH-${Date.now()}`,
                    fk_customer_id: request.fk_customer_id,
                    fk_user_account_id: request.createby, // Gán cho người tạo yêu cầu (thường là Sales)
                    fulfillment_method: request.fulfillment_method || "Giao tận nhà",
                    expected_fulfillment_date: request.expected_fulfillment_date,
                    note: request.note,
                    deposit_amount: request.deposit_amount || 0,
                    received_amount: 0,
                    address: request.address || (request.customer ? request.customer.address : ""),
                    total_amount: request.total_amount || request.total_estimated_price,
                    order_status: 1, // 1: Chờ sản xuất
                    order_type: 3,   // 3: Đơn hàng đặt riêng
                    status: 1,
                    createby: userId,
                }, { transaction: t });

                createdOrderId = newOrder.pk_order_id;

                // B. Tạo Order Items
                if (request.items && request.items.length > 0) {
                    for (const reqItem of request.items) {
                        const newOrderItem = await OrderItem.create({
                            fk_order_id: newOrder.pk_order_id,
                            fk_product_id: reqItem.fk_product_id,
                            fk_custom_request_item_id: reqItem.pk_custom_request_item_id,
                            item_name: reqItem.item_name,
                            item_img: reqItem.item_img,
                            item_quantity: reqItem.item_quantity,
                            item_price: reqItem.item_price,
                            item_material: reqItem.item_material,
                            item_color: reqItem.item_color,
                            item_size: reqItem.item_size,
                            item_note: reqItem.item_note,
                            item_is_bundle: reqItem.item_is_bundle,
                            item_bundle_items: reqItem.item_bundle_items,
                            customer_img: reqItem.customer_img,
                            design_img: reqItem.design_img,
                            is_finished: reqItem.is_finished,
                            item_warranty: reqItem.item_warranty || 12,
                            import_status: 0, // Hàng khách đặt riêng → chưa về kho
                            createby: userId,
                        }, { transaction: t });

                        // C. Nếu item đã gán xưởng (Supplier) -> Tạo luôn bản ghi gia công
                        if (reqItem.fk_supplier_id) {
                            await OrderItemProcessing.create({
                                fk_order_item_id: newOrderItem.pk_order_item_id,
                                processing_status: 1, // Chờ gia công
                                quantity: reqItem.item_quantity,
                                createby: userId,
                                createdate: new Date()
                            }, { transaction: t });
                        }
                    }
                }

                // D. Cập nhật liên kết ngược lại CustomRequest
                await request.update({ fk_order_id: newOrder.pk_order_id }, { transaction: t });

                // E. Ghi lịch sử đơn hàng
                await OrderHistory.create({
                    fk_order_id: newOrder.pk_order_id,
                    action: "Tạo từ yêu cầu đặt riêng",
                    new_status: 1,
                    changed_by: userId,
                    note: `Đơn hàng được tạo tự động từ yêu cầu thiết kế ${request.request_code}`,
                    createby: userId,
                }, { transaction: t });
            }

            await t.commit();

            await systemLogController.record(req, "UPDATE_CUSTOM_REQUEST_STATUS", `Cập nhật trạng thái yêu cầu ID: ${id} sang ${status}`, "INFO", userId);

            // 3. Thông báo cho người tạo yêu cầu (Sales) và các bên liên quan
            if (request.createby) {
                await sendNotification({
                    userId: request.createby,
                    title: "Cập nhật yêu cầu đặt riêng",
                    message: `Yêu cầu ${request.request_code} đã được cập nhật trạng thái mới${createdOrderId ? ' và đã tạo đơn hàng' : ''}.`,
                    type: "INFO",
                    link: `/custom-requirements/${id}`,
                    createBy: userId
                });
            }

            // Nếu đã tạo đơn hàng -> Thông báo thêm về đơn hàng mới
            if (createdOrderId) {
                await sendNotification({
                    userId: request.createby,
                    title: "Đơn hàng mới từ yêu cầu",
                    message: `Yêu cầu ${request.request_code} đã được chuyển thành đơn hàng #${createdOrderId}.`,
                    type: "SUCCESS",
                    link: `/orders/${createdOrderId}`,
                    createBy: userId
                });
            }

            // Đồng thời gửi cho Admin/Owner để theo dõi
            const managers = await UserAccount.findAll({
                include: [{
                    model: UserRole,
                    as: "role",
                    where: {
                        role_code: { [Op.in]: ["ADMIN", "OWNER"] }
                    }
                }],
                where: { status: 1 }
            });

            for (const mgr of managers) {
                const isActor = String(mgr.user_account_id) === String(userId);
                const isCreator = String(mgr.user_account_id) === String(request.createby);

                if (!isActor && !isCreator) {
                    await sendNotification({
                        userId: mgr.user_account_id,
                        title: "Cập nhật yêu cầu đặt riêng",
                        message: `Yêu cầu ${request.request_code} vừa được cập nhật trạng thái${createdOrderId ? ' (Đã tạo đơn hàng)' : ''}.`,
                        type: "INFO",
                        link: `/custom-requirements/${id}`,
                        createBy: userId
                    });
                }
            }

            return res.status(200).json({
                message: createdOrderId ? "Cập nhật thành công và đã tạo đơn hàng" : "Cập nhật thành công",
                data: request,
                orderId: createdOrderId
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Update request status error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái" });
        }
    }

    /**
     * Cập nhật thông tin chi tiết của yêu cầu (Dành cho Owner/Admin)
     */
    async updateRequest(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                deposit_amount, total_amount, expected_fulfillment_date,
                fulfillment_method, note, items
            } = req.body;
            const userId = req.user.userId;

            const request = await CustomRequest.findByPk(id);
            if (!request) {
                return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
            }

            // Cho phép cập nhật khi đang chờ tiếp nhận (status 1 - Sales) hoặc đã tiếp nhận (status 2 - Owner)
            if (request.status !== 1 && request.status !== 2) {
                return res.status(400).json({ message: "Yêu cầu ở trạng thái này không thể cập nhật chi tiết" });
            }

            const isOwner = req.user.roleCode === "OWNER" || req.user.roleCode === "ADMIN";

            // 1. Cập nhật Header
            await request.update({
                deposit_amount: deposit_amount !== undefined ? deposit_amount : request.deposit_amount,
                total_amount: total_amount !== undefined ? total_amount : request.total_amount,
                total_estimated_price: total_amount !== undefined ? total_amount : request.total_estimated_price,
                expected_fulfillment_date: expected_fulfillment_date || request.expected_fulfillment_date,
                fulfillment_method: fulfillment_method || request.fulfillment_method,
                note: note || request.note,
                modifieby: userId,
                modifiedate: new Date()
            }, { transaction: t });

            // 2. Cập nhật Items (Chỉ cập nhật supplier và workshop date)
            if (items && items.length > 0) {
                for (const item of items) {
                    const updateItemData = {
                        item_material: item.item_material,
                        item_color: item.item_color,
                        item_quantity: item.item_quantity,
                        item_price: item.item_price,
                        item_note: item.item_note,
                        item_size: item.item_size,
                        item_is_bundle: item.item_is_bundle,
                        item_bundle_items: item.item_bundle_items,
                        fk_supplier_id: item.fk_supplier_id,
                        expected_supplier_date: item.expected_supplier_date,
                        design_img: item.design_img !== undefined ? item.design_img : undefined,
                        item_warranty: item.item_warranty,
                        modifieby: userId,
                        modifiedate: new Date()
                    };

                    if (isOwner && item.item_cost_price !== undefined) {
                        updateItemData.item_cost_price = item.item_cost_price;
                    }

                    await CustomRequestItem.update(updateItemData, {
                        where: {
                            pk_custom_request_item_id: item.id,
                            fk_custom_request_id: id
                        },
                        transaction: t
                    });
                }
            }

            await t.commit();

            await systemLogController.record(req, "UPDATE_CUSTOM_REQUEST", `Cập nhật thông tin yêu cầu ID: ${id}`, "INFO", userId);

            return res.status(200).json({ message: "Cập nhật yêu cầu thành công", data: request });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Update custom request error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật yêu cầu" });
        }
    }
}

module.exports = new CustomRequestController();
