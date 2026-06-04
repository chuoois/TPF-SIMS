const payrollController = require("../../../src/controller/payroll.controller");
const { Employee, PayrollPeriod, SalaryRecord, SalaryAdjustment, sequelize } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => {
  const mockTransaction = { commit: jest.fn(), rollback: jest.fn(), finished: false };
  return {
    sequelize: {
      transaction: jest.fn(async (cb) => {
        return await cb(mockTransaction);
      }),
    },
    Employee: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
    },
    PayrollPeriod: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    SalaryRecord: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      bulkCreate: jest.fn(),
      destroy: jest.fn(),
    },
    SalaryAdjustment: {
      create: jest.fn(),
      findByPk: jest.fn(),
    },
  };
});

describe("PayrollController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { userId: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("createPeriod()", () => {
    it("nên trả lỗi 400 nếu kỳ lương đã tồn tại", async () => {
      mockReq.body = { period_month: "05/2026" };
      PayrollPeriod.findOne.mockResolvedValue({ period_id: 1 });

      await payrollController.createPeriod(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("nên tạo kỳ lương thành công và clone nhân viên", async () => {
      mockReq.body = { period_month: "05/2026" };
      PayrollPeriod.findOne.mockResolvedValue(null);
      
      Employee.findAll.mockResolvedValue([{ employee_id: 1, base_rate: 1000 }]); // 1 nhân viên active
      
      PayrollPeriod.create.mockResolvedValue({ period_id: 10 });

      await payrollController.createPeriod(mockReq, mockRes);

      expect(PayrollPeriod.create).toHaveBeenCalled();
      expect(SalaryRecord.bulkCreate).toHaveBeenCalled();
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe("addRecordToPeriod()", () => {
    it("nên trả lỗi 403 nếu kỳ lương đã LOCKED", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { fk_employee_id: 2 };
      
      PayrollPeriod.findByPk.mockResolvedValue({ status: "LOCKED" });

      await payrollController.addRecordToPeriod(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("đã được chốt") }));
    });

    it("nên thêm nhân viên vào kỳ lương thành công", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { fk_employee_id: 2 };
      
      PayrollPeriod.findByPk.mockResolvedValue({ status: "DRAFT" });
      SalaryRecord.findOne.mockResolvedValue(null); // Chưa tồn tại trong kỳ
      Employee.findByPk.mockResolvedValue({ base_rate: 500 });

      await payrollController.addRecordToPeriod(mockReq, mockRes);

      expect(SalaryRecord.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe("lockPeriod()", () => {
    it("nên chốt lương thành công", async () => {
      mockReq.params = { id: 1 };
      
      const mockUpdate = jest.fn();
      PayrollPeriod.findByPk.mockResolvedValue({ status: "DRAFT", update: mockUpdate });

      await payrollController.lockPeriod(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "LOCKED" }));
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("payRecord()", () => {
    it("nên trả lỗi 403 nếu kỳ chưa khóa", async () => {
      mockReq.params = { id: 10 };
      
      SalaryRecord.findByPk.mockResolvedValue({
        status: "PENDING",
        period: { status: "DRAFT" }
      });

      await payrollController.payRecord(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("nên thanh toán thành công nếu kỳ đã khóa", async () => {
      mockReq.params = { id: 10 };
      
      const mockUpdate = jest.fn();
      SalaryRecord.findByPk.mockResolvedValue({
        status: "PENDING",
        period: { status: "LOCKED" },
        update: mockUpdate
      });

      await payrollController.payRecord(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "PAID" }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getAllPeriods()", () => {
    it("nên lấy danh sách kỳ lương thành công", async () => {
      PayrollPeriod.findAll.mockResolvedValue([{
        toJSON: () => ({ period_id: 1 })
      }]);
      SalaryRecord.findAll.mockResolvedValue([
        { status: "PAID", base_rate_snapshot: 100, days_worked: 1, adjustments: [] },
        { status: "PENDING", base_rate_snapshot: 200, days_worked: 1, adjustments: [] }
      ]);

      await payrollController.getAllPeriods(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data[0].summary.paidCount).toBe(1);
    });
  });

  describe("getPeriodById()", () => {
    it("nên trả về chi tiết kỳ lương", async () => {
      mockReq.params = { id: 1 };
      PayrollPeriod.findByPk.mockResolvedValue({ toJSON: () => ({ period_id: 1 }) });
      SalaryRecord.findAll.mockResolvedValue([
        { toJSON: () => ({ status: "PAID", base_rate_snapshot: 100, days_worked: 1, adjustments: [] }) }
      ]);

      await payrollController.getPeriodById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteRecord()", () => {
    it("nên xóa nhân viên khỏi mọi kỳ chưa LOCK và đánh dấu nghỉ việc", async () => {
      mockReq.params = { id: 1 };
      SalaryRecord.findByPk.mockResolvedValue({
        fk_employee_id: 42,
        period: { status: "DRAFT" },
        employee: { full_name: "NV A" },
      });
      PayrollPeriod.findAll.mockResolvedValue([{ period_id: 10 }, { period_id: 11 }]);

      await payrollController.deleteRecord(mockReq, mockRes);

      expect(SalaryRecord.destroy).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ fk_employee_id: 42 }),
      }));
      expect(Employee.update).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: 0 }),
        expect.objectContaining({ where: { employee_id: 42 } })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("nên trả 403 khi kỳ đã LOCK", async () => {
      mockReq.params = { id: 1 };
      SalaryRecord.findByPk.mockResolvedValue({
        fk_employee_id: 42,
        period: { status: "LOCKED" },
        employee: { full_name: "NV A" },
      });

      await payrollController.deleteRecord(mockReq, mockRes);

      expect(SalaryRecord.destroy).not.toHaveBeenCalled();
      expect(Employee.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe("updateRecord() & incrementDaysWorked()", () => {
    it("nên cập nhật bản ghi lương", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { days_worked: 20 };
      const mockUpdate = jest.fn();
      SalaryRecord.findByPk
        .mockResolvedValueOnce({ period: { status: "DRAFT" }, update: mockUpdate })
        .mockResolvedValueOnce({ toJSON: () => ({ base_rate_snapshot: 100, days_worked: 20, adjustments: [] }) });

      await payrollController.updateRecord(mockReq, mockRes);
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ days_worked: 20 }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("nên điểm danh cộng ngày công", async () => {
      mockReq.params = { id: 1 };
      const mockUpdate = jest.fn();
      SalaryRecord.findByPk.mockResolvedValue({ period: { status: "DRAFT" }, days_worked: 10, update: mockUpdate });

      await payrollController.incrementDaysWorked(mockReq, mockRes);
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ days_worked: 11 }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("unpayRecord()", () => {
    it("nên hủy thanh toán", async () => {
      mockReq.params = { id: 1 };
      const mockUpdate = jest.fn();
      SalaryRecord.findByPk.mockResolvedValue({ period: { status: "LOCKED" }, update: mockUpdate });

      await payrollController.unpayRecord(mockReq, mockRes);
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "PENDING" }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Adjustments", () => {
    it("nên thêm adjustment thành công", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { type: "PENALTY", description: "Muon", amount: 100 };
      SalaryRecord.findByPk.mockResolvedValue({ period: { status: "DRAFT" } });
      
      await payrollController.addAdjustment(mockReq, mockRes);
      
      expect(SalaryAdjustment.create).toHaveBeenCalledWith(expect.objectContaining({ amount: -100 }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("nên xóa adjustment thành công", async () => {
      mockReq.params = { id: 1 };
      const mockDestroy = jest.fn();
      SalaryAdjustment.findByPk.mockResolvedValue({ record: { period: { status: "DRAFT" } }, destroy: mockDestroy });
      
      await payrollController.deleteAdjustment(mockReq, mockRes);
      expect(mockDestroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
