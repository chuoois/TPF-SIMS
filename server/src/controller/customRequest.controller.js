const { sequelize, CustomRequest, CustomRequestItem, CustomerProfile, UserAccount } = require("../entities");
const systemLogController = require("./systemLog.controller");

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
            const { fk_customer_id, note, items } = req.body;
            const userId = req.user.userId;

            // 1. Tạo Header
            const newRequest = await CustomRequest.create({
                fk_customer_id,
                request_code: "YC-" + Date.now(), // Có thể cải tiến logic tạo mã
                status: 1, // Pending
                note,
                createby: userId
            }, { transaction: t });

            // 2. Tạo chi tiết sản phẩm (Items)
            if (items && items.length > 0) {
                const itemsData = items.map(item => ({
                    ...item,
                    fk_custom_request_id: newRequest.pk_custom_request_id,
                    createby: userId
                }));
                await CustomRequestItem.bulkCreate(itemsData, { transaction: t });
            }

            await t.commit();

            await systemLogController.record(req, "CREATE_CUSTOM_REQUEST", `Tạo yêu cầu đặt riêng mới ID: ${newRequest.pk_custom_request_id}`, "INFO", userId);

            return res.status(201).json({
                message: "Tạo yêu cầu đặt riêng thành công",
                data: newRequest
            });
        } catch (error) {
            await t.rollback();
            console.error("Create custom request error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tạo yêu cầu" });
        }
    }

    /**
     * Lấy danh sách yêu cầu (Có lọc theo trạng thái)
     */
    async getAllRequests(req, res) {
        try {
            const { status, customer_id, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;
            if (customer_id) where.fk_customer_id = customer_id;

            const { count, rows } = await CustomRequest.findAndCountAll({
                where,
                include: [
                    { model: CustomerProfile, as: "customer", attributes: ["full_name", "phone_number"] }
                ],
                order: [["createdate", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset)
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
                    { model: CustomRequestItem, as: "items" }
                ]
            });

            if (!request) {
                return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
            }

            return res.status(200).json({ data: request });
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

            return res.status(200).json({ message: "Cập nhật thành công", data: request });
        } catch (error) {
            console.error("Update request status error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái" });
        }
    }
}

module.exports = new CustomRequestController();
