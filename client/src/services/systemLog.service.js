import axiosInstance from "@/lib/axios";

/**
 * SystemLog Service
 * Dịch vụ xử lý các yêu cầu liên quan đến nhật ký hệ thống
 * 
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
const systemLogService = {
  /**
   * Lấy danh sách nhật ký hệ thống
   * @param {object} params - { search, level, fromDate, toDate, page, limit }
   * @returns {Promise}
   */
  async getAllLogs(params) {
    const response = await axiosInstance.get("/system-log", { params });
    return response.data;
  },
};

export default systemLogService;
