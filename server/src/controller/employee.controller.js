const { Op } = require("sequelize");
const { Employee } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * Employee Controller – Quản lý nhân viên xưởng
 * Created By: Hieunm
 * Created Date: 25/04/2026
 */
class EmployeeController {
  /**
   * Lấy danh sách nhân viên (có tìm kiếm, lọc theo role_type, is_active)
   */
  async getAllEmployees(req, res) {
    try {
      const { search, role_type, is_active } = req.query;

      const where = {};

      if (search) {
        where[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { employee_code: { [Op.like]: `%${search}%` } },
        ];
      }
      if (role_type) {
        where.role_type = role_type;
      }
      if (is_active !== undefined && is_active !== "") {
        where.is_active = parseInt(is_active);
      }

      const employees = await Employee.findAll({
        where,
        order: [["employee_code", "ASC"]],
      });

      return res.status(200).json({ data: employees });
    } catch (error) {
      console.error("Get all employees error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách nhân viên" });
    }
  }

  /**
   * Lấy chi tiết 1 nhân viên
   */
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id);
      if (!employee) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }
      return res.status(200).json(employee);
    } catch (error) {
      console.error("Get employee by id error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy thông tin nhân viên" });
    }
  }

  /**
   * Tạo nhân viên mới
   * Body: { employee_code, full_name, role_name, role_type, base_rate, user_account_id? }
   */
  async createEmployee(req, res) {
    try {
      const { employee_code, full_name, role_name, role_type, base_rate, user_account_id } = req.body;
      const currentUserId = req.user?.userId;

      // Kiểm tra mã nhân viên trùng
      const existing = await Employee.findOne({ where: { employee_code } });
      if (existing) {
        if (existing.is_active === 1) {
          return res.status(400).json({ message: `Mã nhân viên "${employee_code}" đã tồn tại` });
        }

        // Reactivate nhân viên đã nghỉ việc — cập nhật thông tin mới
        await existing.update({
          full_name,
          role_name,
          role_type,
          base_rate: base_rate || 0,
          is_active: 1,
          user_account_id: user_account_id ?? existing.user_account_id,
          modifiedate: new Date(),
          modifieby: currentUserId,
        });

        await systemLogController.record(
          req, "REACTIVATE_EMPLOYEE",
          `Đã kích hoạt lại nhân viên: ${full_name} (${employee_code})`,
          "INFO", currentUserId
        );

        return res.status(200).json({ message: "Kích hoạt lại nhân viên thành công", data: existing });
      }

      const employee = await Employee.create({
        employee_code,
        full_name,
        role_name,
        role_type,
        base_rate: base_rate || 0,
        is_active: 1,
        user_account_id: user_account_id || null,
        createby: currentUserId,
        createdate: new Date(),
      });

      await systemLogController.record(
        req, "CREATE_EMPLOYEE",
        `Đã thêm nhân viên: ${full_name} (${employee_code})`,
        "INFO", currentUserId
      );

      return res.status(201).json({ message: "Thêm nhân viên thành công", data: employee });
    } catch (error) {
      console.error("Create employee error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi tạo nhân viên" });
    }
  }

  /**
   * Cập nhật thông tin nhân viên (tên, lương ngày, vai trò)
   * Body: { full_name, role_name, role_type, base_rate }
   */
  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const { full_name, role_name, role_type, base_rate } = req.body;
      const currentUserId = req.user?.userId;

      const employee = await Employee.findByPk(id);
      if (!employee) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }

      await employee.update({
        full_name: full_name ?? employee.full_name,
        role_name: role_name ?? employee.role_name,
        role_type: role_type ?? employee.role_type,
        base_rate: base_rate ?? employee.base_rate,
        modifiedate: new Date(),
        modifieby: currentUserId,
      });

      await systemLogController.record(
        req, "UPDATE_EMPLOYEE",
        `Đã cập nhật nhân viên: ${employee.full_name} (ID: ${id})`,
        "INFO", currentUserId
      );

      return res.status(200).json({ message: "Cập nhật nhân viên thành công", data: employee });
    } catch (error) {
      console.error("Update employee error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật nhân viên" });
    }
  }

  /**
   * Bật/tắt trạng thái nhân viên (đang làm / đã nghỉ)
   * Body: { is_active: 1 | 0 }
   */
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const currentUserId = req.user?.userId;

      const employee = await Employee.findByPk(id);
      if (!employee) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }

      await employee.update({
        is_active,
        modifiedate: new Date(),
        modifieby: currentUserId,
      });

      const statusLabel = is_active ? "kích hoạt" : "vô hiệu hóa";
      await systemLogController.record(
        req, "TOGGLE_EMPLOYEE_STATUS",
        `Đã ${statusLabel} nhân viên: ${employee.full_name} (ID: ${id})`,
        is_active ? "INFO" : "WARN", currentUserId
      );

      return res.status(200).json({ message: `Đã ${statusLabel} nhân viên thành công` });
    } catch (error) {
      console.error("Toggle employee status error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi thay đổi trạng thái nhân viên" });
    }
  }
}

module.exports = new EmployeeController();
