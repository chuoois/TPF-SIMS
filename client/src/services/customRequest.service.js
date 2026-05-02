import axiosInstance from "@/lib/axios";

/**
 * Custom Request Service
 * Dịch vụ xử lý các yêu cầu liên quan đến phiếu yêu cầu đặt hàng riêng (Header + Items)
 *
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
const customRequestService = {
  /**
   * Tạo mới một phiếu yêu cầu đặt riêng
   * @param {Object} data - Dữ liệu phiếu yêu cầu (Header + Items)
   * @returns {Promise}
   */
  async createRequest(data) {
    const response = await axiosInstance.post("/custom-request", data);
    return response.data;
  },

  /**
   * Lấy danh sách phiếu yêu cầu (có bộ lọc và phân trang)
   * @param {Object} params - { status, customer_id, page, limit }
   * @returns {Promise}
   */
  async getAllRequests(params = {}) {
    const response = await axiosInstance.get("/custom-request", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một phiếu yêu cầu theo ID
   * @param {number|string} id
   * @returns {Promise}
   */
  async getRequestById(id) {
    const response = await axiosInstance.get(`/custom-request/${id}`);
    return response.data;
  },

  /**
   * Cập nhật trạng thái hoặc báo giá cho phiếu yêu cầu
   * @param {number|string} id
   * @param {Object} updateData - { status, total_estimated_price, note }
   * @returns {Promise}
   */
  async updateStatus(id, updateData) {
    const response = await axiosInstance.patch(`/custom-request/${id}/status`, updateData);
    return response.data;
  },
  /**
   * Cập nhật thông tin chi tiết của phiếu yêu cầu (Owner/Admin)
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise}
   */
  async updateRequest(id, data) {
    const response = await axiosInstance.put(`/custom-request/${id}`, data);
    return response.data;
  },
};

export default customRequestService;
