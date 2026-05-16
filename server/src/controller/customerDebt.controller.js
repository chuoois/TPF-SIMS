const { Op } = require("sequelize");
const { Order, CustomerProfile, OrderHistory, sequelize } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * Customer Debt Controller
 * Quản lý công nợ và thanh toán của khách hàng
 * Created By: Antigravity
 * Created Date: 16/05/2026
 */
class CustomerDebtController {
    /**
     * Lấy danh sách các đơn hàng có công nợ (chưa thanh toán hết)
     */
    async getAllCustomerDebts(req, res) {
        try {
            const { search, status, page = 1, limit = 15 } = req.query;
            const offset = (page - 1) * limit;

            // Điều kiện mặc định: đơn chưa thanh toán hết hoặc đã thanh toán hết (tùy status)
            // Công thức: total_amount > (deposit_amount + received_amount)
            const where = { status: 1 };

            if (status === "DEBT") {
                where[Op.and] = [
                    sequelize.literal("total_amount > (deposit_amount + received_amount)")
                ];
            } else if (status === "SETTLED") {
                where[Op.and] = [
                    sequelize.literal("total_amount <= (deposit_amount + received_amount)")
                ];
            }

            if (search) {
                where[Op.or] = [
                    { pk_order_id: isNaN(search) ? undefined : search },
                    { '$customer.full_name$': { [Op.like]: `%${search}%` } },
                    { '$customer.phone_number$': { [Op.like]: `%${search}%` } }
                ];
                // Loại bỏ undefined
                where[Op.or] = (where[Op.or] || []).filter(c => Object.values(c)[0] !== undefined);
                if (where[Op.or].length === 0) delete where[Op.or];
            }

            const { count, rows } = await Order.findAndCountAll({
                where,
                include: [
                    {
                        model: CustomerProfile,
                        as: 'customer',
                        attributes: ['full_name', 'phone_number', 'address']
                    }
                ],
                attributes: [
                    'pk_order_id', 'total_amount', 'deposit_amount', 'received_amount', 
                    'createdate', 'order_status', 'deposit_resolution'
                ],
                order: [['createdate', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                subQuery: false
            });

            return res.status(200).json({
                data: rows,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error("Get all customer debts error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách công nợ" });
        }
    }

    /**
     * Ghi nhận một đợt thanh toán mới cho đơn hàng
     */
    async addPayment(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { amount, method, note, bill_image } = req.body;
            const userId = req.user.userId;

            if (!amount || amount <= 0) {
                throw new Error("Số tiền thanh toán phải lớn hơn 0");
            }

            const order = await Order.findByPk(id, { transaction: t });
            if (!order) {
                throw new Error("Không tìm thấy đơn hàng");
            }

            const currentPaid = Number(order.deposit_amount) + Number(order.received_amount);
            const total = Number(order.total_amount);
            const remaining = total - currentPaid;

            if (amount > remaining) {
                // Cho phép thanh toán dư một chút nếu cần, nhưng thường thì nên chặn
                // throw new Error("Số tiền thanh toán vượt quá số nợ còn lại");
            }

            // 1. Cập nhật số tiền đã thu trong Order
            const newReceivedAmount = Number(order.received_amount) + Number(amount);
            await order.update({
                received_amount: newReceivedAmount,
                modifiedate: new Date(),
                modifieby: userId
            }, { transaction: t });

            // 2. Ghi lịch sử thanh toán vào OrderHistory (Lưu JSON vào note)
            const paymentDetails = {
                amount: Number(amount),
                method: method || "Tiền mặt/Chuyển khoản",
                bill_image: bill_image || null,
                timestamp: new Date()
            };

            await OrderHistory.create({
                fk_order_id: id,
                action: "Thanh toán",
                note: JSON.stringify({
                    display: `Khách thanh toán đợt mới: ${new Intl.NumberFormat('vi-VN').format(amount)}đ. ${note || ""}`,
                    details: paymentDetails
                }),
                changed_by: userId,
                createby: userId,
                createdate: new Date()
            }, { transaction: t });

            // 3. Nếu đã thanh toán hết, có thể tự động cập nhật status hoặc note gì đó
            if (newReceivedAmount + Number(order.deposit_amount) >= total) {
                // Có thể update order_status nếu logic yêu cầu, nhưng ở đây ta chỉ ghi nhận thanh toán
            }

            await t.commit();

            // Ghi log hệ thống
            await systemLogController.record(req, "Thanh toán công nợ", `Đã thu ${amount}đ cho đơn hàng #${id}`, "INFO", userId);

            return res.status(200).json({
                message: "Ghi nhận thanh toán thành công",
                received_amount: newReceivedAmount
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Add payment error:", error);
            return res.status(400).json({ message: error.message || "Lỗi hệ thống khi ghi nhận thanh toán" });
        }
    }

    /**
     * Lấy lịch sử thanh toán chi tiết của một đơn hàng
     */
    async getPaymentHistory(req, res) {
        try {
            const { id } = req.params;

            const histories = await OrderHistory.findAll({
                where: {
                    fk_order_id: id,
                    action: "Thanh toán"
                },
                order: [['createdate', 'DESC']]
            });

            // Parse JSON trong note
            const formatted = histories.map(h => {
                let details = {};
                let displayNote = h.note;
                try {
                    const parsed = JSON.parse(h.note);
                    details = parsed.details || {};
                    displayNote = parsed.display || h.note;
                } catch (e) {
                    // Không phải JSON, để nguyên
                }
                return {
                    id: h.pk_order_history_id,
                    date: h.createdate,
                    amount: details.amount || 0,
                    method: details.method,
                    bill_image: details.bill_image,
                    note: displayNote,
                    changed_by: h.changed_by
                };
            });

            return res.status(200).json({ data: formatted });
        } catch (error) {
            console.error("Get payment history error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy lịch sử thanh toán" });
        }
    }
}

module.exports = new CustomerDebtController();
