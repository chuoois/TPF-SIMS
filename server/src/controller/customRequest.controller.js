const { Op } = require("sequelize");
const { sequelize, CustomRequest, CustomRequestItem, CustomerProfile, UserAccount, UserRole, Supplier } = require("../entities");
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
                    { "$items.supplier.supplier_name$": { [Op.like]: `%${search}%` } }
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
                        include: [{ model: Supplier, as: "supplier", attributes: ["supplier_name"] }]
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
        try {
            const { id } = req.params;
            const { status, total_estimated_price, note } = req.body;
            const userId = req.user.userId;

            const request = await CustomRequest.findByPk(id);
            if (!request) {
                return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
            }

            await request.update({
                status,
                total_estimated_price: total_estimated_price || request.total_estimated_price,
                note: note || request.note,
                modifieby: userId,
                modifiedate: new Date()
            });

            await systemLogController.record(req, "UPDATE_CUSTOM_REQUEST_STATUS", `Cập nhật trạng thái yêu cầu ID: ${id} sang ${status}`, "INFO", userId);

            // Thông báo cho người tạo yêu cầu (Sales) và các bên liên quan
            if (request.createby) {
                await sendNotification({
                    userId: request.createby,
                    title: "Cập nhật yêu cầu đặt riêng",
                    message: `Yêu cầu ${request.request_code} đã được cập nhật trạng thái mới.`,
                    type: "INFO",
                    link: `/custom-requirements/${id}`,
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
                if (String(mgr.user_account_id) !== String(userId) && String(mgr.user_account_id) !== String(request.createby)) {
                    await sendNotification({
                        userId: mgr.user_account_id,
                        title: "Cập nhật yêu cầu đặt riêng",
                        message: `Yêu cầu ${request.request_code} vừa được cập nhật trạng thái.`,
                        type: "INFO",
                        link: `/custom-requirements/${id}`,
                        createBy: userId
                    });
                }
            }

            return res.status(200).json({ message: "Cập nhật thành công", data: request });
        } catch (error) {
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
                fulfillment_method, payment_method, note, items 
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
                payment_method: payment_method || request.payment_method,
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
