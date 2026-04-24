import axiosInstance from "@/lib/axios";

/**
 * Product Service
 * Dịch vụ xử lý các yêu cầu liên quan đến sản phẩm và giá
 * 
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
const productService = {
  /**
   * Lấy danh sách sản phẩm (có hỗ trợ filter theo category, color, material, sell_type)
   * @param {Object} params - { category_id, color_id, material_id, product_type, sell_type, search, page, limit }
   * @returns {Promise}
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
  async getProductById(id) {
    const response = await axiosInstance.get(`/product/${id}`);
    return response.data;
  },

  /**
   * Helper: Lấy danh sách hàng mộc
   */
  async getRawProducts(params = {}) {
    return this.getAllProducts({ ...params, sell_type: 1 });
  },

  /**
   * Helper: Lấy danh sách hàng sẵn
   */
  async getStockProducts(params = {}) {
    return this.getAllProducts({ ...params, sell_type: 2 });
  },

  /**
   * Helper: Lấy danh sách hàng custom
   */
  async getCustomProducts(params = {}) {
    return this.getAllProducts({ ...params, sell_type: 3 });
  }
};

export default productService;
