import axiosInstance from "@/lib/axios";

/**
 * Employee Service
 * Created By: Hieunm
 * Created Date: 26/04/2026
 * Dich vu quan ly nhan vien xưởng
 */
const employeeService = {
  /**
   * Lấy danh sách nhân viên
   * @param {object} params - { search, role_type, is_active }
   */
  async getAllEmployees(params) {
    const response = await axiosInstance.get("/employee", { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết nhân viên
   * @param {number} id 
   */
  async getEmployeeById(id) {
    const response = await axiosInstance.get(`/employee/${id}`);
    return response.data;
  },

  /**
   * Tạo mới nhân viên
   * @param {object} data - { employee_code, full_name, role_name, role_type, base_rate, user_account_id }
   */
  async createEmployee(data) {
    const response = await axiosInstance.post("/employee", data);
    return response.data;
  },

  /**
   * Cập nhật thông tin nhân viên
   * @param {number} id 
   * @param {object} data - { full_name, role_name, role_type, base_rate }
   */
  async updateEmployee(id, data) {
    const response = await axiosInstance.put(`/employee/${id}`, data);
    return response.data;
  },

  /**
   * Bật/tắt trạng thái nhân viên
   * @param {number} id 
   * @param {number} is_active - 1 hoặc 0
   */
  async toggleStatus(id, is_active) {
    const response = await axiosInstance.patch(`/employee/${id}/status`, { is_active });
    return response.data;
  },
};

export default employeeService;
