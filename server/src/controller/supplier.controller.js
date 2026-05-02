const { Supplier } = require("../entities");

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
}

module.exports = new SupplierController();
