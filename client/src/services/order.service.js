import axiosInstance from "@/lib/axios";

/**
 * Order Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý đơn hàng
 *
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
const orderService = {
  /**
   * Tạo mới đơn hàng
   * @param {Object} orderData - Dữ liệu đơn hàng (Header + Items)
   * @returns {Promise}
   */
  async createOrder(orderData) {
    const response = await axiosInstance.post("/order", orderData);
    return response.data;
  },

  /**
   * Lấy danh sách đơn hàng
   * @param {Object} params - { search, status, type, page, limit }
   * @returns {Promise}
   */
  async getAllOrders(params = {}) {
    const response = await axiosInstance.get("/order", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   * @param {number|string} id
   * @returns {Promise}
   */
  async getOrderDetail(id) {
    const response = await axiosInstance.get(`/order/${id}`);
    return response.data;
  },
};

export default orderService;
