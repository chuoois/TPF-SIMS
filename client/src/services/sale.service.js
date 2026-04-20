import axiosInstance from "@/lib/axios";

/**
 * Sale Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý bán hàng và khách hàng
 * 
 * Created By: Antigravity
 * Created Date: 17/04/2026
 */
const saleService = {
  /**
   * Lấy tất cả khách hàng (chưa xóa)
   * @returns {Promise}
   */
  async getAllCustomers() {
    const response = await axiosInstance.get("/sale/customers");
    return response.data;
  },

  /**
   * Lấy chi tiết khách hàng theo ID
   * @param {number|string} id 
   * @returns {Promise}
   */
  async getCustomerById(id) {
    const response = await axiosInstance.get(`/sale/customers/${id}`);
    return response.data;
  },

  /**
   * Tạo khách hàng mới
   * @param {Object} customerData 
   * @returns {Promise}
   */
  async createCustomer(customerData) {
    const response = await axiosInstance.post("/sale/customers", customerData);
    return response.data;
  },

  /**
   * Cập nhật thông tin khách hàng
   * @param {number|string} id 
   * @param {Object} updateData 
   * @returns {Promise}
   */
  async updateCustomer(id, updateData) {
    const response = await axiosInstance.put(`/sale/customers/${id}`, updateData);
    return response.data;
  },

  /**
   * Xóa khách hàng (Soft Delete)
   * @param {number|string} id 
   * @returns {Promise}
   */
  async deleteCustomer(id) {
    const response = await axiosInstance.delete(`/sale/customers/${id}`);
    return response.data;
  },
};

export default saleService;
