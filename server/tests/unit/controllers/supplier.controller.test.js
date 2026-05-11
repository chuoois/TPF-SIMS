const supplierController = require("../../../src/controller/supplier.controller");
const { Supplier } = require("../../../src/entities");

jest.mock("../../../src/entities", () => ({
  Supplier: {
    findAll: jest.fn(),
  },
}));

describe("SupplierController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllSuppliers()", () => {
    it("nên lấy danh sách nhà cung cấp thành công", async () => {
      Supplier.findAll.mockResolvedValue([{ supplier_id: 1, supplier_name: "NCC A" }]);
      
      await supplierController.getAllSuppliers(mockReq, mockRes);
      
      expect(Supplier.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: [{ supplier_id: 1, supplier_name: "NCC A" }] });
    });

    it("nên trả về lỗi 500 khi DB lỗi", async () => {
      Supplier.findAll.mockRejectedValue(new Error("DB Error"));
      
      await supplierController.getAllSuppliers(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
