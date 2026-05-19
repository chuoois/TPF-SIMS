const { Op } = require("sequelize");
const { Supplier, ManufacturingOrder, ImportReceipt, sequelize } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * Supplier Debt Controller
 * Quản lý công nợ và sổ thanh toán với nhà cung cấp/xưởng bằng cách lưu dữ liệu thanh toán bổ sung dạng JSON trong Supplier.note
 * Tránh tạo thêm bảng/entity mới theo yêu cầu của người dùng.
 * Created By: Antigravity
 * Created Date: 17/05/2026
 */
class SupplierDebtController {
    /**
     * Lấy danh sách tất cả các nhà cung cấp kèm thông tin tổng quát công nợ
     */
    async getAllSupplierDebts(req, res) {
        try {
            const { search, page = 1, limit = 15 } = req.query;
            const offset = (page - 1) * limit;

            const where = { status: 1 }; // Chỉ lấy NCC hoạt động

            if (search) {
                where[Op.or] = [
                    { pk_supplier_id: isNaN(search) ? undefined : search },
                    { supplier_name: { [Op.like]: `%${search}%` } },
                    { phone_number: { [Op.like]: `%${search}%` } },
                    { contact_person: { [Op.like]: `%${search}%` } }
                ].filter(c => c.pk_supplier_id !== undefined || c.supplier_name !== undefined);
            }

            const { count, rows } = await Supplier.findAndCountAll({
                where,
                order: [['createdate', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            // Tính toán động cho từng Supplier
            const data = await Promise.all(rows.map(async (supplier) => {
                // 1. Lấy tất cả ManufacturingOrder của Supplier này
                const moOrders = await ManufacturingOrder.findAll({
                    where: { fk_supplier_id: supplier.pk_supplier_id },
                    attributes: ['pk_manufacturing_order_id', 'deposit_amount', 'order_code']
                });
                const moIds = moOrders.map(mo => mo.pk_manufacturing_order_id);
                const totalDeposit = moOrders.reduce((sum, mo) => sum + Number(mo.deposit_amount || 0), 0);

                // 2. Lấy tất cả ImportReceipt (liên kết qua MO hoặc khớp tên)
                const receipts = await ImportReceipt.findAll({
                    where: {
                        [Op.or]: [
                            moIds.length > 0 ? { fk_manufacturing_order_id: { [Op.in]: moIds } } : null,
                            { supplier_name: supplier.supplier_name }
                        ].filter(Boolean)
                    },
                    attributes: ['total_amount']
                });
                const totalImport = receipts.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

                // 3. Lấy tất cả đợt thanh toán thêm được lưu dạng JSON trong supplier.note
                let payments = [];
                let supplierGroup = "Xưởng liên kết";
                let notesArray = [];
                if (supplier.note) {
                    try {
                        const parsed = JSON.parse(supplier.note);
                        payments = parsed.payments || [];
                        supplierGroup = parsed.group || "Xưởng liên kết";
                        notesArray = parsed.notes ? parsed.notes.split("\n") : [];
                    } catch (e) {
                        // note không phải JSON, treat as text note
                        supplierGroup = supplier.note || "Xưởng liên kết";
                        notesArray = [supplier.note].filter(Boolean);
                    }
                }
                const totalPaidAdditional = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

                // Tổng tiền đã thanh toán = cọc + trả thêm
                const totalPaid = totalDeposit + totalPaidAdditional;
                const debt = totalImport - totalPaid;

                return {
                    id: supplier.pk_supplier_id,
                    code: supplier.tax_code || `NCC-${String(supplier.pk_supplier_id).padStart(3, '0')}`,
                    name: supplier.supplier_name,
                    contactPerson: supplier.contact_person || "",
                    phone: supplier.phone_number || "",
                    email: supplier.email || "",
                    address: supplier.address || "",
                    group: supplierGroup,
                    notes: notesArray,
                    rawNote: supplier.note,
                    totalImport,
                    totalPaid,
                    debt: debt > 0 ? debt : 0
                };
            }));

            return res.status(200).json({
                data,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error("Get all supplier debts error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách công nợ" });
        }
    }

    /**
     * Lấy sổ công nợ chi tiết (Ledger) và Lịch sử nhập hàng của một nhà cung cấp
     */
    async getSupplierLedger(req, res) {
        try {
            const { id } = req.params;

            const supplier = await Supplier.findByPk(id);
            if (!supplier) {
                return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
            }

            // 1. Lấy tất cả các ManufacturingOrder của nhà cung cấp
            const moOrders = await ManufacturingOrder.findAll({
                where: { fk_supplier_id: id },
                attributes: ['pk_manufacturing_order_id', 'order_code', 'deposit_amount', 'createdate']
            });
            const moIds = moOrders.map(mo => mo.pk_manufacturing_order_id);

            // 2. Lấy tất cả phiếu nhập hàng (ImportReceipt)
            const receipts = await ImportReceipt.findAll({
                where: {
                    [Op.or]: [
                        moIds.length > 0 ? { fk_manufacturing_order_id: { [Op.in]: moIds } } : null,
                        { supplier_name: supplier.supplier_name }
                    ].filter(Boolean)
                },
                order: [['import_date', 'DESC'], ['createdate', 'DESC']]
            });

            // 3. Lấy tất cả đợt thanh toán từ note JSON
            let payments = [];
            let supplierNoteText = "";
            if (supplier.note) {
                try {
                    const parsed = JSON.parse(supplier.note);
                    payments = parsed.payments || [];
                    supplierNoteText = parsed.notes || "";
                } catch (e) {
                    supplierNoteText = supplier.note;
                }
            }

            // 4. Tổ hợp thành sổ công nợ (Ledger)
            const ledgerEntries = [];

            // A. Đưa tiền cọc từ ManufacturingOrder vào
            moOrders.forEach(mo => {
                const deposit = Number(mo.deposit_amount || 0);
                if (deposit > 0) {
                    ledgerEntries.push({
                        id: `DEP-${mo.pk_manufacturing_order_id}`,
                        date: mo.createdate,
                        note: `Đặt cọc đơn gia công ${mo.order_code}`,
                        change: -deposit,
                        bill_img: null
                    });
                }
            });

            // B. Đưa các phiếu nhập hàng vào
            receipts.forEach(r => {
                ledgerEntries.push({
                    id: `REC-${r.pk_receipt_id}`,
                    date: r.import_date + " 00:00",
                    note: `Nhập kho lô hàng ${r.receipt_code}${r.note ? ` (${r.note})` : ''}`,
                    change: Number(r.total_amount || 0),
                    bill_img: r.invoice_img
                });
            });

            // C. Đưa các đợt thanh toán thêm vào
            payments.forEach(p => {
                ledgerEntries.push({
                    id: `PAY-${p.pk_payment_id || p.id}`,
                    date: p.payment_date || p.date,
                    note: p.note || `Chuyển khoản thanh toán công nợ`,
                    change: -Number(p.amount || 0),
                    bill_img: p.bill_image || p.bill_img
                });
            });

            // D. Sắp xếp Ledger tăng dần theo thời gian để tính Balance chạy
            ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

            // E. Tính Balance cộng dồn
            let runningBalance = 0;
            const ledger = ledgerEntries.map(entry => {
                runningBalance += entry.change;
                return {
                    ...entry,
                    balance: runningBalance
                };
            });

            // F. Lịch sử nhập hàng hiển thị riêng cho Tab Nhập hàng
            const importHistory = receipts.map(r => ({
                id: r.pk_receipt_id,
                code: r.receipt_code,
                date: r.import_date,
                total: Number(r.total_amount || 0),
                status: "Đã nhập kho"
            }));

            return res.status(200).json({
                supplier: {
                    id: supplier.pk_supplier_id,
                    name: supplier.supplier_name,
                    phone: supplier.phone_number,
                    address: supplier.address,
                    email: supplier.email,
                    notes: [supplierNoteText].filter(Boolean)
                },
                ledger: ledger.reverse(), // Đảo ngược hiển thị cái mới nhất trước trên UI
                importHistory
            });
        } catch (error) {
            console.error("Get supplier ledger error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết công nợ" });
        }
    }

    /**
     * Ghi nhận một đợt thanh toán công nợ mới cho nhà cung cấp
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

            const supplier = await Supplier.findByPk(id, { transaction: t });
            if (!supplier) {
                throw new Error("Không tìm thấy nhà cung cấp");
            }

            // Đọc các thanh toán hiện tại từ note JSON
            let payments = [];
            let supplierNoteText = "";
            let supplierGroup = "Xưởng liên kết";
            if (supplier.note) {
                try {
                    const parsed = JSON.parse(supplier.note);
                    payments = parsed.payments || [];
                    supplierNoteText = parsed.notes || "";
                    supplierGroup = parsed.group || "Xưởng liên kết";
                } catch (e) {
                    supplierNoteText = supplier.note;
                }
            }

            // Ghi nhận thanh toán mới
            const newPayment = {
                pk_payment_id: Date.now(),
                amount: Number(amount),
                payment_date: new Date(),
                method: method || "Chuyển khoản",
                bill_image: bill_image || null,
                note: note || `Thanh toán công nợ cho xưởng`,
                createby: userId
            };
            payments.push(newPayment);

            // Cập nhật lại note dưới dạng JSON
            await supplier.update({
                note: JSON.stringify({
                    notes: supplierNoteText,
                    group: supplierGroup,
                    payments: payments
                })
            }, { transaction: t });

            await t.commit();

            // Ghi log hệ thống
            await systemLogController.record(req, "Thanh toán công nợ NCC", `Đã trả ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho nhà cung cấp ${supplier.supplier_name}`, "INFO", userId);

            return res.status(200).json({
                message: "Ghi nhận thanh toán thành công",
                data: newPayment
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Add supplier payment error:", error);
            return res.status(400).json({ message: error.message || "Lỗi hệ thống khi ghi nhận thanh toán" });
        }
    }
}

module.exports = new SupplierDebtController();
