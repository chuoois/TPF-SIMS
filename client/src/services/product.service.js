import axiosInstance from "@/lib/axios";

/**
 * Product Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý sản phẩm
 *
 * Created By: ThinhBui
 * Created Date: 25/04/2026
 * Modified Date: 15/05/2026
 */
const productService = {
  /**
   * Lấy danh sách sản phẩm (có search, filter và phân trang)
   * @param {Object} params - { search, category_id, color_id, material_id, room_id, sell_type, page, limit }
   * @returns {Promise<{ data: Array, pagination: Object }>}
   */
  async getAllProducts(params = {}) {
    const response = await axiosInstance.get("/product", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {number|string} id
   * @returns {Promise}
   */
  async getProductDetail(id) {
    const response = await axiosInstance.get(`/product/${id}`);
    return response.data;
  },

  // ======================== OWNER ENDPOINTS ========================

  /**
   * Lấy danh sách sản phẩm cho Owner (bao gồm inactive, chưa định giá)
   * @param {Object} params - { search, category_id, product_type, product_status, is_gift, page, limit }
   * @returns {Promise<{ data: Array, pagination: Object }>}
   */
  async getOwnerProducts(params = {}) {
    const response = await axiosInstance.get("/product/owner", { params });
    return response.data;
  },

  /**
   * Tạo sản phẩm mới (Chỉ Owner)
   * @param {Object} data - Product data + pricing
   * @returns {Promise<{ message: string, data: Object }>}
   */
  async createProduct(data) {
    const response = await axiosInstance.post("/product", data);
    return response.data;
  },

  /**
   * Cập nhật sản phẩm (Chỉ Owner)
   * @param {number|string} id - Product ID
   * @param {Object} data - Updated fields + pricing
   * @returns {Promise<{ message: string, data: Object }>}
   */
  async updateProduct(id, data) {
    const response = await axiosInstance.put(`/product/${id}`, data);
    return response.data;
  },

  /**
   * Xóa/Vô hiệu hóa sản phẩm (Soft-delete, chỉ Owner)
   * @param {number|string} id - Product ID
   * @returns {Promise<{ message: string }>}
   */
  async deleteProduct(id) {
    const response = await axiosInstance.delete(`/product/${id}`);
    return response.data;
  },
};

export default productService;
