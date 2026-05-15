import axiosInstance from "@/lib/axios";

/**
 * Import Service
 * Dịch vụ xử lý các yêu cầu liên quan đến Nhập Hàng (Import Receipt)
 *
 * Created By: HieuNM
 * Created Date: 15/05/2026
 */
const importService = {
  /**
   * Lấy danh sách ManufacturingOrder đang chờ nhập hàng (cho panel trái CreateImportModal)
   * @param {Object} params - { search }
   * @returns {Promise<{ data: Array }>}
   */
  async getImportRequests(params = {}) {
    const response = await axiosInstance.get("/import/requests", { params });
    return response.data;
  },

  /**
   * Tạo phiếu nhập kho mới
   * Body cần: { importDate, supplier, note, invoiceImgUrl, lines, manufacturingOrderId }
   * Ảnh phải được upload lên Cloudinary trước, chỉ gửi URL về đây
   * @param {Object} data
   * @returns {Promise<{ message, receipt }>}
   */
  async createImportReceipt(data) {
    const response = await axiosInstance.post("/import/receipt", data);
    return response.data;
  },

  /**
   * Lấy danh sách phiếu nhập kho (có search, date filter, phân trang)
   * @param {Object} params - { search, date, page, limit }
   * @returns {Promise<{ data: Array, pagination: Object }>}
   */
  async getImportReceipts(params = {}) {
    const response = await axiosInstance.get("/import/receipt", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một phiếu nhập kho
   * @param {number|string} id - pk_receipt_id
   * @returns {Promise<Object>}
   */
  async getImportReceiptDetail(id) {
    const response = await axiosInstance.get(`/import/receipt/${id}`);
    return response.data;
  },
};

export default importService;
