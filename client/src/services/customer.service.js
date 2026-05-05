import axiosInstance from "@/lib/axios";

/**
 * Customer Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý khách hàng
 * 
 * Created By: ThinhBui
 * Created Date: 17/04/2026
 */
const customerService = {
  /**
   * Lấy tất cả khách hàng (có search, filter và phân trang)
   * @param {Object} params - { search, gender, page, limit }
   * @returns {Promise}
   */
  async getAllCustomers(params = {}) {
    const response = await axiosInstance.get("/customer/customers", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết khách hàng theo ID (có phân trang đơn hàng)
   * @param {number|string} id 
   * @param {Object} params - { page, limit }
   * @returns {Promise}
   */
  async getCustomerById(id, params = {}) {
    const response = await axiosInstance.get(`/customer/customers/${id}`, { params });
    return response.data;
  },

  /**
   * Tạo khách hàng mới
   * @param {Object} customerData 
   * @returns {Promise}
   */
  async createCustomer(customerData) {
    const response = await axiosInstance.post("/customer/customers", customerData);
    return response.data;
  },

  /**
   * Cập nhật thông tin khách hàng
   * @param {number|string} id 
   * @param {Object} updateData 
   * @returns {Promise}
   */
  async updateCustomer(id, updateData) {
    const response = await axiosInstance.put(`/customer/customers/${id}`, updateData);
    return response.data;
  },

  /**
   * Xóa khách hàng (Soft Delete)
   * @param {number|string} id 
   * @returns {Promise}
   */
  async deleteCustomer(id) {
    const response = await axiosInstance.delete(`/customer/customers/${id}`);
    return response.data;
  },
};

export default customerService;
