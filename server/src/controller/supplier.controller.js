const { Supplier } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * Supplier Controller - Quản lý nhà cung cấp/xưởng sản xuất
 */
class SupplierController {
    /**
     * Lấy danh sách tất cả nhà cung cấp
     */
    async getAllSuppliers(req, res) {
        try {
            const suppliers = await Supplier.findAll({
                where: { status: 1 },
                order: [["supplier_name", "ASC"]]
            });
            return res.status(200).json({ data: suppliers });
        } catch (error) {
            console.error("Get all suppliers error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách nhà cung cấp" });
        }
    }

    /**
     * Tạo nhà cung cấp mới
     */
    async createSupplier(req, res) {
        try {
            const { supplier_name, contact_person, phone_number, email, address, tax_code, note } = req.body;
            const userId = req.user?.userId;

            const newSupplier = await Supplier.create({
                supplier_name,
                contact_person,
                phone_number,
                email,
                address,
                tax_code,
                note,
                status: 1
            });

            // Ghi log hệ thống
            if (userId) {
                await systemLogController.record(req, "Tạo nhà cung cấp", `Đã tạo nhà cung cấp mới: ${supplier_name}`, "INFO", userId);
            }

            return res.status(201).json({
                message: "Tạo nhà cung cấp thành công",
                data: newSupplier
            });
        } catch (error) {
            console.error("Create supplier error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tạo nhà cung cấp" });
        }
    }

    /**
     * Cập nhật thông tin nhà cung cấp
     */
    async updateSupplier(req, res) {
        try {
            const { id } = req.params;
            const { supplier_name, contact_person, phone_number, email, address, tax_code, note } = req.body;
            const userId = req.user?.userId;

            const supplier = await Supplier.findByPk(id);
            if (!supplier) {
                return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
            }

            await supplier.update({
                supplier_name,
                contact_person,
                phone_number,
                email,
                address,
                tax_code,
                note,
                modifiedate: new Date()
            });

            // Ghi log hệ thống
            if (userId) {
                await systemLogController.record(req, "Cập nhật nhà cung cấp", `Đã cập nhật nhà cung cấp: ${supplier.supplier_name}`, "INFO", userId);
            }

            return res.status(200).json({
                message: "Cập nhật thông tin nhà cung cấp thành công",
                data: supplier
            });
        } catch (error) {
            console.error("Update supplier error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật nhà cung cấp" });
        }
    }

    /**
     * Xóa mềm nhà cung cấp (status = 0)
     */
    async deleteSupplier(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;

            const supplier = await Supplier.findByPk(id);
            if (!supplier) {
                return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
            }

            await supplier.update({
                status: 0,
                modifiedate: new Date()
            });

            // Ghi log hệ thống
            if (userId) {
                await systemLogController.record(req, "Xóa nhà cung cấp", `Đã xóa nhà cung cấp: ${supplier.supplier_name}`, "WARNING", userId);
            }

            return res.status(200).json({
                message: "Xóa nhà cung cấp thành công"
            });
        } catch (error) {
            console.error("Delete supplier error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi xóa nhà cung cấp" });
        }
    }
}

module.exports = new SupplierController();
