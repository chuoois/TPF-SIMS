import axiosInstance from "@/lib/axios";

/**
 * Dashboard Service
 * Dịch vụ lấy dữ liệu tổng quan cho Owner Dashboard
 *
 * Created By: ThinhBui
 * Created Date: 15/05/2026
 */
const dashboardService = {
  /**
   * Lấy toàn bộ dữ liệu dashboard cho Owner
   * @param {Object} params - Query params
   * @param {string} params.period - Khoảng thời gian: today | week | month | year | all
   * @returns {Promise}
   */
  async getOwnerDashboard(params = {}) {
    const response = await axiosInstance.get("/dashboard/owner", { params });
    return response.data;
  },

  /**
   * Lấy dữ liệu tổng quan tài chính cho Kế toán
   * @param {Object} params - Query params (period, selectedMonth, selectedQuarter, selectedYear, startDate, endDate, orderType, costType)
   * @returns {Promise}
   */
  async getAccountantDashboard(params = {}) {
    const response = await axiosInstance.get("/dashboard/accountant", { params });
    return response.data;
  },
};

export default dashboardService;
