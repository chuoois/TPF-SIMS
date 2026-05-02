import axiosInstance from "@/lib/axios";

/**
 * Supplier Service
 */
const supplierService = {
  /**
   * Lấy danh sách tất cả nhà cung cấp
   * @returns {Promise}
   */
  async getAllSuppliers() {
    const response = await axiosInstance.get("/supplier");
    return response.data;
  },
};

export default supplierService;
