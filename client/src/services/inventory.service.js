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
   * Lấy thống kê tổng quan kho hàng cho Dashboard
   * @returns {Promise<{ kpi, lowStockProducts, longStayProducts, recentImports }>}
   */
  async getDashboardStats() {
    const response = await axiosInstance.get("/inventory/dashboard");
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

  /**
   * Cập nhật trạng thái một đơn vị sản phẩm (báo lỗi / bỏ báo lỗi)
   * @param {string} itemSerial - Mã serial của item
   * @param {string} status - AVAILABLE | DEFECTIVE | PENDING_DELIVERY | PROCESSING
   * @param {string} [note] - Ghi chú
   */
  async updateItemStatus(itemSerial, status, note = "") {
    const response = await axiosInstance.patch(`/inventory/item/${encodeURIComponent(itemSerial)}/status`, { status, note });
    return response.data;
  },

  /**
   * Xử lý hàng lỗi: RETURN, SCRAP, WRITE_OFF
   * @param {Object} data - { unitIds, processType, scrapPrice, note }
   */
  async processDefectiveItems(data) {
    const response = await axiosInstance.post("/inventory/defective/process", data);
    return response.data;
  },

  /**
   * Cập nhật định mức tồn kho tối thiểu và ảnh sản phẩm
   * @param {number} productId
   * @param {number|null} minStock
   * @param {string|null} imgUrl - URL ảnh Cloudinary mới (nếu có)
   */
  async updateMinStock(productId, minStock, imgUrl) {
    const body = { minStock };
    if (imgUrl !== undefined) body.imgUrl = imgUrl;
    const response = await axiosInstance.patch(`/inventory/product/${productId}/min-stock`, body);
    return response.data;
  },
};

export default inventoryService;
