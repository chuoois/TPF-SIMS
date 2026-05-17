import axiosInstance from "@/lib/axios";

/**
 * Supplier Debt Service
 * Dịch vụ xử lý các yêu cầu liên quan đến công nợ nhà cung cấp
 * Created By: Antigravity
 * Created Date: 17/05/2026
 */
const supplierDebtService = {
  /**
   * Lấy danh sách công nợ
   * @param {Object} params - { search, page, limit }
   */
  async getAllSupplierDebts(params = {}) {
    const response = await axiosInstance.get("/supplier-debt", { params });
    return response.data;
  },

  /**
   * Lấy sổ công nợ chi tiết (Ledger) và lịch sử nhập
   * @param {number|string} supplierId 
   */
  async getSupplierLedger(supplierId) {
    const response = await axiosInstance.get(`/supplier-debt/${supplierId}/ledger`);
    return response.data;
  },

  /**
   * Ghi nhận thanh toán mới
   * @param {number|string} supplierId 
   * @param {Object} paymentData - { amount, method, note, bill_image }
   */
  async addPayment(supplierId, paymentData) {
    const response = await axiosInstance.post(`/supplier-debt/${supplierId}/payment`, paymentData);
    return response.data;
  },
};

export default supplierDebtService;
