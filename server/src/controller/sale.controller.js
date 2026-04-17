const { CustomerProfile } = require("../entities");

/**
 * Sale Controller - Quản lý thông tin khách hàng
 * Created By: Antigravity
 * Created Date: 17/04/2026
 */
class SaleController {
  /**
   * Lấy danh sách khách hàng (chưa xóa)
   */
  async getAllCustomers(req, res) {
    try {
      const customers = await CustomerProfile.findAll({
        where: { status: 1 },
        order: [["createdate", "DESC"]],
      });
      return res.status(200).json(customers);
    } catch (error) {
      console.error("Get all customers error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách khách hàng" });
    }
  }

  /**
   * Lấy chi tiết một khách hàng (nếu chưa xóa)
   */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerProfile.findOne({
        where: { pk_customer_id: id, status: 1 },
      });

      if (!customer) {
        return res.status(404).json({ message: "Không tìm thấy khách hàng hoặc khách hàng đã bị xóa" });
      }

      return res.status(200).json(customer);
    } catch (error) {
      console.error("Get customer by id error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy thông tin khách hàng" });
    }
  }

  /**
   * Tạo mới khách hàng
   */
  async createCustomer(req, res) {
    try {
      const customerData = req.body;
      const userId = req.user.userId;

      const newCustomer = await CustomerProfile.create({
        ...customerData,
        status: 1,
        createby: userId,
      });

      return res.status(201).json({
        message: "Tạo khách hàng thành công",
        customer: newCustomer,
      });
    } catch (error) {
      console.error("Create customer error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi tạo khách hàng" });
    }
  }

  /**
   * Cập nhật thông tin khách hàng
   */
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;

      const customer = await CustomerProfile.findOne({
        where: { pk_customer_id: id, status: 1 },
      });

      if (!customer) {
        return res.status(404).json({ message: "Không tìm thấy khách hàng để cập nhật" });
      }

      await customer.update({
        ...updateData,
        modifiedate: new Date(),
        modifieby: userId,
      });

      return res.status(200).json({
        message: "Cập nhật thông tin khách hàng thành công",
        customer,
      });
    } catch (error) {
      console.error("Update customer error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật khách hàng" });
    }
  }

  /**
   * Xóa khách hàng (Soft Delete)
   */
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const customer = await CustomerProfile.findOne({
        where: { pk_customer_id: id, status: 1 },
      });

      if (!customer) {
        return res.status(404).json({ message: "Không tìm thấy khách hàng để xóa" });
      }

      // Soft delete by setting status to 0
      await customer.update({
        status: 0,
        modifiedate: new Date(),
        modifieby: userId,
      });

      return res.status(200).json({ message: "Xóa khách hàng thành công (Soft Delete)" });
    } catch (error) {
      console.error("Delete customer error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi xóa khách hàng" });
    }
  }
}

module.exports = new SaleController();
