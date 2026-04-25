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
};

export default productService;
