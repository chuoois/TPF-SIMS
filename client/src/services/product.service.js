import axiosInstance from "@/lib/axios";

/**
 * Product Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý sản phẩm
 *
 * Created By: ThinhBui
 * Created Date: 25/04/2026
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

  /**
   * Xóa sản phẩm
   * @param {number|string} id
   * @returns {Promise}
   */
  async deleteProduct(id) {
    const response = await axiosInstance.delete(`/product/${id}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin sản phẩm và giá
   * @param {number|string} id
   * @param {object} payload
   * @returns {Promise}
   */
  async updateProduct(id, payload) {
    const response = await axiosInstance.put(`/product/${id}`, payload);
    return response.data;
  },
};

export default productService;
