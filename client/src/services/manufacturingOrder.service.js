import axiosInstance from "@/lib/axios";

/**
 * Manufacturing Order Service
 * Dịch vụ xử lý các yêu cầu liên quan đến phiếu nhập hàng / gia công gửi xưởng
 *
 * Created By: ThinhBui
 * Created Date: 13/05/2026
 */
const manufacturingOrderService = {
  /**
   * Tạo mới một phiếu nhập hàng
   * @param {Object} data - Dữ liệu phiếu (Header + Items)
   * @returns {Promise}
   */
  async createOrder(data) {
    const response = await axiosInstance.post("/manufacturing-order", data);
    return response.data;
  },

  /**
   * Lấy danh sách phiếu nhập hàng (có bộ lọc và phân trang)
   * @param {Object} params - { supplier_id, status, search, page, limit }
   * @returns {Promise}
   */
  async getAllOrders(params = {}) {
    const response = await axiosInstance.get("/manufacturing-order", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một phiếu nhập hàng theo ID
   * @param {number|string} id
   * @returns {Promise}
   */
  async getOrderById(id) {
    const response = await axiosInstance.get(`/manufacturing-order/${id}`);
    return response.data;
  },

  /**
   * Cập nhật trạng thái phiếu nhập hàng
   * @param {number|string} id
   * @param {Object} updateData - { status }
   * @returns {Promise}
   */
  async updateStatus(id, updateData) {
    const response = await axiosInstance.patch(`/manufacturing-order/${id}/status`, updateData);
    return response.data;
  },
};

export default manufacturingOrderService;
