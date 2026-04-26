import axiosInstance from "@/lib/axios";

/**
 * Inventory Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý kho hàng của kế toán
 *
 * Created Date: 2026-04-26
 */
const inventoryService = {
  /**
   * Lấy danh sách sản phẩm trong kho (có search, filter và phân trang)
   * @param {Object} params - { search, category, typeFilter, page, limit }
   * @returns {Promise<{ data: Array, pagination: Object }>}
   */
  async getInventoryProducts(params = {}) {
    const response = await axiosInstance.get("/inventory/product", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết các đơn vị sản phẩm của 1 sản phẩm
   * @param {number|string} productId 
   * @returns {Promise<Array>}
   */
  async getProductItems(productId) {
    const response = await axiosInstance.get(`/inventory/product/${productId}/items`);
    return response.data;
  },
};

export default inventoryService;
