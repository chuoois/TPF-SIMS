const employeeController = require("../../../src/controller/employee.controller");
const { Employee } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => ({
  Employee: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe("EmployeeController Unit Tests", () => {
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

  describe("getAllEmployees()", () => {
    it("nên trả về danh sách nhân viên thành công", async () => {
      mockReq.query = { search: "NV", role_type: "Thợ", is_active: "1" };
      Employee.findAll.mockResolvedValue([{ employee_code: "NV01", full_name: "Tho" }]);

      await employeeController.getAllEmployees(mockReq, mockRes);

      expect(Employee.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: [{ employee_code: "NV01", full_name: "Tho" }] });
    });
  });

  describe("getEmployeeById()", () => {
    it("nên trả lỗi 404 nếu không tìm thấy", async () => {
      mockReq.params = { id: 99 };
      Employee.findByPk.mockResolvedValue(null);

      await employeeController.getEmployeeById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên trả về thông tin nhân viên", async () => {
      mockReq.params = { id: 1 };
      Employee.findByPk.mockResolvedValue({ id: 1, full_name: "Test" });

      await employeeController.getEmployeeById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ id: 1, full_name: "Test" });
    });
  });

  describe("createEmployee()", () => {
    it("nên trả lỗi 400 nếu mã nhân viên bị trùng và đang hoạt động", async () => {
      mockReq.body = { employee_code: "NV01" };
      Employee.findOne.mockResolvedValue({ id: 1, is_active: 1 });

      await employeeController.createEmployee(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("đã tồn tại") }));
    });

    it("nên kích hoạt lại nhân viên đã nghỉ việc khi mã trùng", async () => {
      mockReq.body = { employee_code: "NV01", full_name: "NV A", role_name: "Thợ sơn", role_type: "PAINTER", base_rate: 200000 };
      const mockUpdate = jest.fn();
      Employee.findOne.mockResolvedValue({ id: 1, is_active: 0, user_account_id: null, update: mockUpdate });

      await employeeController.createEmployee(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ is_active: 1, full_name: "NV A" }));
      expect(Employee.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("nên tạo mới nhân viên thành công", async () => {
      mockReq.body = { employee_code: "NV02", full_name: "New", role_name: "Thợ Mộc", role_type: "Xưởng" };
      Employee.findOne.mockResolvedValue(null);
      Employee.create.mockResolvedValue({ id: 2, employee_code: "NV02" });

      await employeeController.createEmployee(mockReq, mockRes);

      expect(Employee.create).toHaveBeenCalled();
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe("updateEmployee()", () => {
    it("nên trả lỗi 404 nếu không tồn tại", async () => {
      mockReq.params = { id: 99 };
      Employee.findByPk.mockResolvedValue(null);

      await employeeController.updateEmployee(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên cập nhật thành công", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { full_name: "Updated" };

      const mockUpdate = jest.fn();
      Employee.findByPk.mockResolvedValue({ id: 1, full_name: "Old", update: mockUpdate });

      await employeeController.updateEmployee(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ full_name: "Updated" }));
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("toggleStatus()", () => {
    it("nên đổi trạng thái thành công", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { is_active: 0 };

      const mockUpdate = jest.fn();
      Employee.findByPk.mockResolvedValue({ id: 1, full_name: "Test", update: mockUpdate });

      await employeeController.toggleStatus(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ is_active: 0 }));
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
