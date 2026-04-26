import axiosInstance from "@/lib/axios";

/**
 * Account Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý tài khoản và hồ sơ nhân viên
 * 
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
const accountService = {
  /**
   * Lấy danh sách các vai trò (UserRoles)
   * @returns {Promise}
   */
  async getRoles() {
    const response = await axiosInstance.get("/account/roles");
    return response.data;
  },

  /**
   * Lấy danh sách tài khoản kèm phân trang và lọc
   * @param {object} params - { search, role_id, fromDate, toDate, page, limit }
   * @returns {Promise}
   */
  async getAllAccounts(params) {
    const response = await axiosInstance.get("/account", { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết tài khoản theo ID
   * @param {number|string} id 
   * @returns {Promise}
   */
  async getAccountById(id) {
    const response = await axiosInstance.get(`/account/${id}`);
    return response.data;
  },

  /**
   * Tạo mới tài khoản nhân viên (kèm Profile)
   * @param {object} data - { email, password, role_id, full_name, phone_number, dob, gender }
   * @returns {Promise}
   */
  async createAccount(data) {
    const response = await axiosInstance.post("/account", data);
    return response.data;
  },

  /**
   * Cập nhật thông tin tài khoản và hồ sơ
   * @param {number|string} id 
   * @param {object} data - { role_id, full_name, phone_number, dob, gender, password }
   * @returns {Promise}
   */
  async updateAccount(id, data) {
    const response = await axiosInstance.put(`/account/${id}`, data);
    return response.data;
  },

  /**
   * Thay đổi trạng thái tài khoản (Kích hoạt/Khóa)
   * @param {number|string} id 
   * @param {number} status - 1 cho Kích hoạt, 0 cho Khóa
   * @returns {Promise}
   */
  async toggleStatus(id, status) {
    const response = await axiosInstance.patch(`/account/${id}/status`, { status });
    return response.data;
  },

  /**
   * Xóa vĩnh viễn tài khoản
   * @param {number|string} id 
   * @returns {Promise}
   */
  async deleteAccount(id) {
    const response = await axiosInstance.delete(`/account/${id}`);
    return response.data;
  },
};

export default accountService;
