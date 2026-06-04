const { Op } = require("sequelize");
const { CustomerProfile } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * Customer Controller - Quản lý thông tin khách hàng
 * Created By: ThinhBui
 * Created Date: 22/04/2026
 */
class CustomerController {
  /**
   * Lấy danh sách khách hàng (chưa xóa)
   */
  async getAllCustomers(req, res) {
    try {
      const { search, gender, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = { status: 1 };

      // Tìm kiếm (Search)
      if (search) {
        where[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { customer_code: { [Op.like]: `%${search}%` } },
          { phone_number: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      // Lọc (Filter)
      if (typeof gender !== 'undefined' && gender !== null && gender !== "") {
        where.gender = gender;
      }

      const { count, rows } = await CustomerProfile.findAndCountAll({
        where,
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
        }
      });
    } catch (error) {
      console.error("Get all customers error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách khách hàng" });
    }
  }

  /**
   * Lấy chi tiết một khách hàng (nếu chưa xóa) bao gồm lịch sử đơn hàng
   */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 5 } = req.query; // Mặc định 5 đơn hàng mỗi trang
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { Order, OrderItem } = require("../entities");
      
      // 1. Lấy thông tin khách hàng
      const customer = await CustomerProfile.findOne({
        where: { pk_customer_id: id, status: 1 },
      });

      if (!customer) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy khách hàng hoặc khách hàng đã bị xóa" });
      }

      // 2. Lấy danh sách đơn hàng có phân trang
      const { count, rows: orders } = await Order.findAndCountAll({
        where: { fk_customer_id: id, status: 1 },
        include: [
          {
            model: OrderItem,
            as: "items",
            where: { status: 1 },
            required: false,
          },
        ],
        order: [["createdate", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true, // Tránh đếm sai khi có include N:M hoặc 1:N
      });

      // 3. Trả về dữ liệu gộp bao gồm thông tin phân trang
      return res.status(200).json({
        ...customer.toJSON(),
        orders: orders,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        }
      });
    } catch (error) {
      console.error("Get customer by id error:", error);
      return res
        .status(500)
        .json({ message: "Lỗi hệ thống khi lấy thông tin khách hàng" });
    }
  }

  /**
   * Tạo mới khách hàng
   */
  async createCustomer(req, res) {
    try {
      let { customer_code, ...customerData } = req.body;
      const userId = req.user.userId;

      // Kiểm tra trùng số điện thoại (chỉ kiểm tra với các khách hàng đang hoạt động, status: 1)
      if (customerData.phone_number) {
        customerData.phone_number = customerData.phone_number.trim();
        const existingCustomer = await CustomerProfile.findOne({
          where: {
            phone_number: customerData.phone_number,
            status: 1,
          },
        });

        if (existingCustomer) {
          return res.status(400).json({
            message: "Số điện thoại này đã được đăng ký bởi một khách hàng khác.",
          });
        }
      }

      // Nếu không có mã khách hàng, tự động tạo
      if (!customer_code) {
        const count = await CustomerProfile.count();
        customer_code = `KH${String(count + 1).padStart(4, "0")}`;
      }

      const newCustomer = await CustomerProfile.create({
        ...customerData,
        customer_code,
        status: 1,
        createby: userId,
      });

      // Ghi log tạo khách hàng
      await systemLogController.record(req, "Tạo khách hàng", `Đã tạo khách hàng mới: ${newCustomer.full_name} (${newCustomer.customer_code || 'N/A'})`, "INFO", userId);

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

      // Kiểm tra trùng số điện thoại với khách hàng khác (chỉ kiểm tra với các khách hàng đang hoạt động, status: 1)
      if (updateData.phone_number) {
        updateData.phone_number = updateData.phone_number.trim();
        const existingCustomer = await CustomerProfile.findOne({
          where: {
            phone_number: updateData.phone_number,
            status: 1,
            pk_customer_id: { [Op.ne]: id },
          },
        });

        if (existingCustomer) {
          return res.status(400).json({
            message: "Số điện thoại này đã được đăng ký bởi một khách hàng khác.",
          });
        }
      }

      await customer.update({
        ...updateData,
        modifiedate: new Date(),
        modifieby: userId,
      });

      // Ghi log cập nhật khách hàng
      await systemLogController.record(req, "Cập nhật khách hàng", `Đã cập nhật thông tin khách hàng: ${customer.full_name} (ID: ${id})`, "INFO", userId);

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

      // Ghi log xóa khách hàng
      await systemLogController.record(req, "Xóa khách hàng", `Đã xóa khách hàng: ${customer.full_name} (ID: ${id})`, "WARN", userId);

      return res.status(200).json({ message: "Xóa khách hàng thành công (Soft Delete)" });
    } catch (error) {
      console.error("Delete customer error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi xóa khách hàng" });
    }
  }
}

module.exports = new CustomerController();
