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

  /**
   * Tạo nhà cung cấp mới
   * @param {Object} data 
   * @returns {Promise}
   */
  async createSupplier(data) {
    const response = await axiosInstance.post("/supplier", data);
    return response.data;
  },

  /**
   * Cập nhật thông tin nhà cung cấp
   * @param {number|string} id 
   * @param {Object} data 
   * @returns {Promise}
   */
  async updateSupplier(id, data) {
    const response = await axiosInstance.put(`/supplier/${id}`, data);
    return response.data;
  },

  /**
   * Xóa mềm nhà cung cấp
   * @param {number|string} id 
   * @returns {Promise}
   */
  async deleteSupplier(id) {
    const response = await axiosInstance.delete(`/supplier/${id}`);
    return response.data;
  },
};

export default supplierService;
