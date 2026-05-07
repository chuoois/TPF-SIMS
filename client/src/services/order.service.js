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
   * Lấy danh sách đơn hàng có phân trang và lọc
   * @param {Object} params - Các tham số query string
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng trên 1 trang
   * @param {string} params.search - Tìm kiếm mã đơn/tên KH
   * @param {number} params.order_status - Trạng thái đơn hàng
   * @param {number} params.order_type - Loại đơn hàng (1: Mộc, 2: Sẵn, 3: Đặt riêng)
   * @param {string} params.dateFrom - Từ ngày (YYYY-MM-DD)
   * @param {string} params.dateTo - Đến ngày (YYYY-MM-DD)
   * @returns {Promise}
   */
  async getAllOrders(params = {}) {
    const response = await axiosInstance.get("/order", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng theo ID (List Detail)
   * Bao gồm thông tin chung, items, tasks, lịch sử, customer...
   * @param {number|string} id - ID đơn hàng
   * @returns {Promise}
   */
  async getOrderById(id) {
    const response = await axiosInstance.get(`/order/${id}`);
    return response.data;
  },
};

export default orderService;
