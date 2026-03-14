import axiosInstance from "@/lib/axios";

/**
 * Auth Service
 * Dịch vụ xử lý các yêu cầu liên quan đến xác thực
 * 
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */
const authService = {
  /**
   * Đăng nhập
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise}
   */
  async login(email, password) {
    const response = await axiosInstance.post("/auth/login", { email, password });
    return response.data;
  },

  /**
   * Đăng xuất
   * @returns {Promise}
   */
  async logout() {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  /**
   * Làm mới token
   * @returns {Promise}
   */
  async refreshToken() {
    const response = await axiosInstance.post("/auth/refresh-token");
    return response.data;
  },

  /**
   * Quên mật khẩu
   * @param {string} email 
   * @returns {Promise}
   */
  async forgotPassword(email) {
    const response = await axiosInstance.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise}
   */
  async getProfile() {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
  },
};

export default authService;
