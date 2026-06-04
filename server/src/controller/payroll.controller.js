const { Op } = require("sequelize");
const { Employee, PayrollPeriod, SalaryRecord, SalaryAdjustment, sequelize } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * Payroll Controller – Quản lý kỳ lương, bản ghi lương, thưởng/phạt
 * Created By: Hieunm
 * Created Date: 25/04/2026
 */

// ─────────────────────────────────────────────────────────────
// HELPER: Tính total_salary cho 1 record (runtime, không lưu DB)
// total = base_rate_snapshot × days_worked + SUM(adjustments.amount)
// ─────────────────────────────────────────────────────────────
const calcTotalSalary = (record) => {
  const base = (record.base_rate_snapshot || 0) * (parseFloat(record.days_worked) || 0);
  const adj = (record.adjustments || []).reduce((sum, a) => sum + (a.amount || 0), 0);
  return base + adj;
};

// ─────────────────────────────────────────────────────────────
// HELPER: Guard – kiểm tra period chưa bị LOCK
// Dùng bên trong controller methods, không phải middleware
// ─────────────────────────────────────────────────────────────
const assertPeriodUnlocked = (period) => {
  if (period?.status === "LOCKED") {
    const err = new Error("Kỳ lương đã được chốt, không thể chỉnh sửa.");
    err.status = 403;
    throw err;
  }
};

const assertPeriodLocked = (period) => {
  if (period?.status !== "LOCKED") {
    const err = new Error("Kỳ lương chưa được chốt, không thể thực hiện thanh toán.");
    err.status = 403;
    throw err;
  }
};

class PayrollController {

  // ══════════════════════════════════════════════════════════
  // PERIOD
  // ══════════════════════════════════════════════════════════

  /**
   * GET /api/payroll/periods
   * Lấy danh sách tất cả kỳ lương (mới nhất trước)
   */
  async getAllPeriods(req, res) {
    try {
      const periods = await PayrollPeriod.findAll({
        order: [["period_id", "DESC"]],
      });

      // Thêm summary (tổng quỹ lương, số lượng đã/chưa trả) cho mỗi kỳ
      const periodsWithSummary = await Promise.all(
        periods.map(async (p) => {
          const records = await SalaryRecord.findAll({
            where: { fk_period_id: p.period_id },
            include: [{ model: SalaryAdjustment, as: "adjustments" }],
          });
          const totalFund = records.reduce((s, r) => s + calcTotalSalary(r), 0);
          const paidCount = records.filter((r) => r.status === "PAID").length;
          const pendingCount = records.length - paidCount;

          return {
            ...p.toJSON(),
            summary: {
              totalEmployees: records.length,
              totalFund,
              paidCount,
              pendingCount,
            },
          };
        })
      );

      return res.status(200).json({ data: periodsWithSummary });
    } catch (error) {
      console.error("Get all periods error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách kỳ lương" });
    }
  }

  /**
   * GET /api/payroll/periods/:id
   * Chi tiết 1 kỳ lương kèm toàn bộ bản ghi lương + adjustments
   */
  async getPeriodById(req, res) {
    try {
      const { id } = req.params;

      const period = await PayrollPeriod.findByPk(id);
      if (!period) {
        return res.status(404).json({ message: "Không tìm thấy kỳ lương" });
      }

      const records = await SalaryRecord.findAll({
        where: { fk_period_id: id },
        include: [
          { model: Employee, as: "employee" },
          { model: SalaryAdjustment, as: "adjustments", order: [["createdate", "ASC"]] },
        ],
        order: [["record_id", "ASC"]],
      });

      const recordsWithTotal = records.map((r) => ({
        ...r.toJSON(),
        total_salary: calcTotalSalary(r.toJSON()),
      }));

      const totalFund = recordsWithTotal.reduce((s, r) => s + r.total_salary, 0);
      const paidFund = recordsWithTotal.filter(r => r.status === "PAID").reduce((s, r) => s + r.total_salary, 0);
      const pendingFund = totalFund - paidFund;

      return res.status(200).json({
        data: {
          ...period.toJSON(),
          summary: {
            totalEmployees: records.length,
            totalFund,
            paidFund,
            pendingFund,
            paidCount: records.filter(r => r.status === "PAID").length,
            pendingCount: records.filter(r => r.status === "PENDING").length,
          },
          records: recordsWithTotal,
        },
      });
    } catch (error) {
      console.error("Get period by id error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết kỳ lương" });
    }
  }

  /**
   * POST /api/payroll/periods
   * Tạo kỳ lương mới → auto clone danh sách nhân viên đang làm việc
   * Body: { period_month: "05/2026", note? }
   */
  async createPeriod(req, res) {
    try {
      const { period_month, note } = req.body;
      const currentUserId = req.user?.userId;

      if (!period_month) {
        return res.status(400).json({ message: "Thiếu thông tin period_month (VD: 05/2026)" });
      }

      // Kiểm tra kỳ lương tháng này đã tồn tại chưa
      const existing = await PayrollPeriod.findOne({ where: { period_month } });
      if (existing) {
        return res.status(400).json({ message: `Kỳ lương tháng ${period_month} đã tồn tại` });
      }

      // Lấy tất cả nhân viên đang hoạt động
      const activeEmployees = await Employee.findAll({ where: { is_active: 1 } });
      if (activeEmployees.length === 0) {
        return res.status(400).json({ message: "Không có nhân viên nào đang làm việc để tạo kỳ lương" });
      }

      const result = await sequelize.transaction(async (t) => {
        // Tạo kỳ lương
        const period = await PayrollPeriod.create(
          {
            period_month,
            status: "DRAFT",
            note: note || null,
            createby: currentUserId,
            createdate: new Date(),
          },
          { transaction: t }
        );

        // Clone nhân viên vào bảng lương:
        // Chỉ copy employeeId + base_rate (snapshot), KHÔNG copy days_worked/allowance
        const recordsToCreate = activeEmployees.map((emp) => ({
          fk_period_id: period.period_id,
          fk_employee_id: emp.employee_id,
          base_rate_snapshot: emp.base_rate, // Snapshot tại thời điểm tạo kỳ
          days_worked: 0,
          overtime_hours: 0,
          status: "PENDING",
          createdate: new Date(),
        }));

        await SalaryRecord.bulkCreate(recordsToCreate, { transaction: t });

        return period;
      });

      await systemLogController.record(
        req, "CREATE_PAYROLL_PERIOD",
        `Đã tạo kỳ lương tháng ${period_month} với ${activeEmployees.length} nhân viên`,
        "INFO", currentUserId
      );

      return res.status(201).json({
        message: `Đã tạo kỳ lương tháng ${period_month} thành công`,
        data: { period_id: result.period_id, period_month, totalEmployees: activeEmployees.length },
      });
    } catch (error) {
      console.error("Create period error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi tạo kỳ lương" });
    }
  }

  /**
   * POST /api/payroll/periods/:id/lock
   * Chốt lương – LOCK toàn bộ kỳ, không cho sửa gì nữa
   */
  async lockPeriod(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;

      const period = await PayrollPeriod.findByPk(id);
      if (!period) {
        return res.status(404).json({ message: "Không tìm thấy kỳ lương" });
      }
      if (period.status === "LOCKED") {
        return res.status(400).json({ message: `Kỳ lương tháng ${period.period_month} đã được chốt trước đó` });
      }

      await period.update({
        status: "LOCKED",
        locked_at: new Date(),
        locked_by: currentUserId,
        modifiedate: new Date(),
        modifieby: currentUserId,
      });

      await systemLogController.record(
        req, "LOCK_PAYROLL_PERIOD",
        `Đã chốt kỳ lương tháng ${period.period_month} (ID: ${id})`,
        "INFO", currentUserId
      );

      return res.status(200).json({
        message: `Đã chốt kỳ lương tháng ${period.period_month} thành công. Dữ liệu đã được khóa.`,
      });
    } catch (error) {
      console.error("Lock period error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi chốt kỳ lương" });
    }
  }

  // ══════════════════════════════════════════════════════════
  // SALARY RECORD
  // ══════════════════════════════════════════════════════════

  /**
   * POST /api/payroll/periods/:id/records
   * Thêm một nhân viên vào kỳ lương đã tồn tại (dành cho nhân viên mới vào)
   */
  async addRecordToPeriod(req, res) {
    try {
      const { id } = req.params; // period_id
      const { fk_employee_id } = req.body;

      if (!fk_employee_id) {
        return res.status(400).json({ message: "Vui lòng chọn nhân viên" });
      }

      const period = await PayrollPeriod.findByPk(id);
      if (!period) {
        return res.status(404).json({ message: "Không tìm thấy kỳ lương" });
      }

      assertPeriodUnlocked(period);

      // Kiểm tra nhân viên đã có trong kỳ này chưa
      const existing = await SalaryRecord.findOne({
        where: { fk_period_id: id, fk_employee_id },
      });
      if (existing) {
        return res.status(400).json({ message: "Nhân viên này đã có trong bảng lương của kỳ này" });
      }

      const employee = await Employee.findByPk(fk_employee_id);
      if (!employee) {
        return res.status(404).json({ message: "Không tìm thấy thông tin nhân viên" });
      }

      const record = await SalaryRecord.create({
        fk_period_id: id,
        fk_employee_id,
        base_rate_snapshot: employee.base_rate,
        days_worked: 0,
        overtime_hours: 0,
        status: "PENDING",
        createdate: new Date(),
      });

      return res.status(201).json({
        message: "Đã thêm nhân viên vào kỳ lương thành công",
        data: record,
      });
    } catch (error) {
      if (error.status === 403) return res.status(403).json({ message: error.message });
      console.error("Add record to period error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi thêm nhân viên vào kỳ lương" });
    }
  }

  /**
   * DELETE /api/payroll/records/:id
   * Xóa nhân viên khỏi hệ thống lương:
   * - Xóa record hiện tại + mọi SalaryRecord khác của cùng nhân viên ở các kỳ chưa LOCK
   * - Set Employee.is_active = 0 (không xuất hiện ở các kỳ tạo mới)
   * Records ở các kỳ LOCKED được giữ nguyên để bảo toàn lịch sử lương đã chốt.
   */
  async deleteRecord(req, res) {
    try {
      const { id } = req.params; // record_id
      const currentUserId = req.user?.userId;

      const record = await SalaryRecord.findByPk(id, {
        include: [
          { model: PayrollPeriod, as: "period" },
          { model: Employee, as: "employee" },
        ],
      });

      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi lương" });
      }

      assertPeriodUnlocked(record.period);

      const employeeId = record.fk_employee_id;
      const employeeName = record.employee?.full_name;

      await sequelize.transaction(async (t) => {
        // Xóa records của nhân viên ở mọi kỳ chưa LOCK (bao gồm record hiện tại)
        const unlockedPeriods = await PayrollPeriod.findAll({
          where: { status: { [Op.ne]: "LOCKED" } },
          attributes: ["period_id"],
          transaction: t,
        });
        const unlockedPeriodIds = unlockedPeriods.map((p) => p.period_id);

        if (unlockedPeriodIds.length > 0) {
          await SalaryRecord.destroy({
            where: {
              fk_employee_id: employeeId,
              fk_period_id: { [Op.in]: unlockedPeriodIds },
            },
            transaction: t,
          });
        }

        // Vô hiệu hóa nhân viên để không bị clone vào các kỳ tạo mới
        await Employee.update(
          {
            is_active: 0,
            modifiedate: new Date(),
            modifieby: currentUserId,
          },
          { where: { employee_id: employeeId }, transaction: t }
        );
      });

      await systemLogController.record(
        req, "DELETE_EMPLOYEE_FROM_PAYROLL",
        `Đã xóa nhân viên ${employeeName} (ID: ${employeeId}) khỏi hệ thống lương và đánh dấu nghỉ việc`,
        "WARN", currentUserId
      );

      return res.status(200).json({
        message: "Đã xóa nhân viên khỏi hệ thống lương và đánh dấu nghỉ việc",
      });
    } catch (error) {
      if (error.status === 403) return res.status(403).json({ message: error.message });
      console.error("Delete record error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi xóa nhân viên khỏi hệ thống lương" });
    }
  }

  /**
   * PATCH /api/payroll/records/:id
   * Cập nhật ngày công / OT / đơn giá cho 1 bản ghi lương
   * Body: { days_worked?, overtime_hours?, base_rate_snapshot? }
   */
  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const { days_worked, overtime_hours, base_rate_snapshot } = req.body;

      const record = await SalaryRecord.findByPk(id, {
        include: [{ model: PayrollPeriod, as: "period" }],
      });

      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi lương" });
      }

      // Guard: không cho sửa nếu kỳ đã LOCK
      assertPeriodUnlocked(record.period);

      await record.update({
        days_worked: days_worked ?? record.days_worked,
        overtime_hours: overtime_hours ?? record.overtime_hours,
        ...(base_rate_snapshot !== undefined && { base_rate_snapshot: Number(base_rate_snapshot) }),
        modifiedate: new Date(),
      });

      // Trả về total_salary đã tính
      const updated = await SalaryRecord.findByPk(id, {
        include: [{ model: SalaryAdjustment, as: "adjustments" }],
      });

      return res.status(200).json({
        message: "Cập nhật ngày công thành công",
        data: { ...updated.toJSON(), total_salary: calcTotalSalary(updated.toJSON()) },
      });
    } catch (error) {
      if (error.status === 403) {
        return res.status(403).json({ message: error.message });
      }
      console.error("Update record error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật bản ghi lương" });
    }
  }

  /**
   * PATCH /api/payroll/records/:id/increment-day
   * Điểm danh nhanh: cộng 1 ngày công
   */
  async incrementDaysWorked(req, res) {
    try {
      const { id } = req.params;

      const record = await SalaryRecord.findByPk(id, {
        include: [{ model: PayrollPeriod, as: "period" }],
      });

      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi lương" });
      }

      // Guard: không cho sửa nếu kỳ đã LOCK
      assertPeriodUnlocked(record.period);

      const newDays = (parseFloat(record.days_worked) || 0) + 1;

      await record.update({
        days_worked: newDays,
        modifiedate: new Date(),
      });

      return res.status(200).json({
        message: "Điểm danh thành công (+1 ngày công)",
        data: { record_id: id, days_worked: newDays },
      });
    } catch (error) {
      if (error.status === 403) {
        return res.status(403).json({ message: error.message });
      }
      console.error("Increment days error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi điểm danh" });
    }
  }

  /**
   * PATCH /api/payroll/records/:id/pay
   * Xác nhận đã thanh toán lương cho 1 nhân viên
   */
  async payRecord(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;

      const record = await SalaryRecord.findByPk(id, {
        include: [
          { model: PayrollPeriod, as: "period" },
          { model: Employee, as: "employee" },
        ],
      });

      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi lương" });
      }

      // Guard: yêu cầu kỳ lương phải LOCKED mới được thanh toán
      assertPeriodLocked(record.period);

      if (record.status === "PAID") {
        return res.status(400).json({ message: "Bản ghi này đã được thanh toán trước đó" });
      }

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      await record.update({
        status: "PAID",
        payment_date: today,
        paid_by: currentUserId,
        modifiedate: new Date(),
      });

      return res.status(200).json({
        message: `Đã xác nhận thanh toán lương cho ${record.employee?.full_name}`,
        data: { record_id: record.record_id, payment_date: today, status: "PAID" },
      });
    } catch (error) {
      if (error.status === 403) {
        return res.status(403).json({ message: error.message });
      }
      console.error("Pay record error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi xác nhận thanh toán" });
    }
  }

  /**
   * PATCH /api/payroll/records/:id/unpay
   * Hủy trạng thái đã thanh toán (chỉ khi kỳ chưa LOCK)
   */
  async unpayRecord(req, res) {
    try {
      const { id } = req.params;

      const record = await SalaryRecord.findByPk(id, {
        include: [{ model: PayrollPeriod, as: "period" }],
      });

      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi lương" });
      }

      // Guard: yêu cầu kỳ lương phải LOCKED
      assertPeriodLocked(record.period);


      await record.update({
        status: "PENDING",
        payment_date: null,
        paid_by: null,
        modifiedate: new Date(),
      });

      return res.status(200).json({ message: "Đã hủy trạng thái thanh toán" });
    } catch (error) {
      if (error.status === 403) {
        return res.status(403).json({ message: error.message });
      }
      console.error("Unpay record error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi hủy trạng thái thanh toán" });
    }
  }

  // ══════════════════════════════════════════════════════════
  // SALARY ADJUSTMENT (Thưởng / Phạt / Phụ cấp)
  // ══════════════════════════════════════════════════════════

  /**
   * POST /api/payroll/records/:id/adjustments
   * Thêm khoản thưởng/phạt/phụ cấp vào 1 bản ghi lương
   * Body: { type: "BONUS"|"ALLOWANCE"|"PENALTY", description, amount }
   */
  async addAdjustment(req, res) {
    try {
      const { id } = req.params; // record_id
      const { type, description, amount } = req.body;
      const currentUserId = req.user?.userId;

      const record = await SalaryRecord.findByPk(id, {
        include: [{ model: PayrollPeriod, as: "period" }],
      });

      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi lương" });
      }

      assertPeriodUnlocked(record.period);

      if (!type || !description || amount === undefined) {
        return res.status(400).json({ message: "Thiếu thông tin: type, description, amount" });
      }

      // PENALTY: amount tự động đổi sang âm nếu người dùng nhập dương
      const finalAmount = type === "PENALTY" ? -Math.abs(amount) : Math.abs(amount);

      const adjustment = await SalaryAdjustment.create({
        fk_record_id: id,
        type,
        description,
        amount: finalAmount,
        createby: currentUserId,
        createdate: new Date(),
      });

      return res.status(201).json({
        message: "Đã thêm khoản điều chỉnh thành công",
        data: adjustment,
      });
    } catch (error) {
      if (error.status === 403) {
        return res.status(403).json({ message: error.message });
      }
      console.error("Add adjustment error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi thêm khoản điều chỉnh" });
    }
  }

  /**
   * DELETE /api/payroll/adjustments/:id
   * Xóa 1 khoản thưởng/phạt
   */
  async deleteAdjustment(req, res) {
    try {
      const { id } = req.params; // adjustment_id
      const currentUserId = req.user?.userId;

      const adjustment = await SalaryAdjustment.findByPk(id, {
        include: [{
          model: SalaryRecord, as: "record",
          include: [{ model: PayrollPeriod, as: "period" }],
        }],
      });

      if (!adjustment) {
        return res.status(404).json({ message: "Không tìm thấy khoản điều chỉnh" });
      }

      assertPeriodUnlocked(adjustment.record?.period);

      await adjustment.destroy();

      return res.status(200).json({ message: "Đã xóa khoản điều chỉnh thành công" });
    } catch (error) {
      if (error.status === 403) {
        return res.status(403).json({ message: error.message });
      }
      console.error("Delete adjustment error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi xóa khoản điều chỉnh" });
    }
  }
}

module.exports = new PayrollController();
