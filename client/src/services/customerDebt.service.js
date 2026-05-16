import axiosInstance from "@/lib/axios";

/**
 * Customer Debt Service
 * Dịch vụ xử lý các yêu cầu liên quan đến công nợ khách hàng
 */
const customerDebtService = {
  /**
   * Lấy danh sách công nợ
   * @param {Object} params - { search, status, page, limit }
   */
  async getAllCustomerDebts(params = {}) {
    const response = await axiosInstance.get("/customer-debt", { params });
    return response.data;
  },

  /**
   * Ghi nhận thanh toán mới
   * @param {number|string} orderId 
   * @param {Object} paymentData - { amount, method, note, bill_image }
   */
  async addPayment(orderId, paymentData) {
    const response = await axiosInstance.post(`/customer-debt/${orderId}/payment`, paymentData);
    return response.data;
  },

  /**
   * Lấy lịch sử thanh toán chi tiết
   * @param {number|string} orderId 
   */
  async getPaymentHistory(orderId) {
    const response = await axiosInstance.get(`/customer-debt/${orderId}/history`);
    return response.data;
  }
};

export default customerDebtService;
