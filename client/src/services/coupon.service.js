import axiosInstance from "@/lib/axios";

/**
 * Coupon Service
 * Dịch vụ xử lý các yêu cầu liên quan đến quản lý mã giảm giá
 *
 * Created By: ThinhBui
 * Created Date: 07/05/2026
 */
const couponService = {
  /**
   * Lấy danh sách mã giảm giá (có search + phân trang)
   * @param {Object} params - { search, page, limit }
   * @returns {Promise<{ data: Array, pagination: Object }>}
   */
  async getAllCoupons(params = {}) {
    const response = await axiosInstance.get("/coupon", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết mã giảm giá theo ID
   * @param {number|string} id
   * @returns {Promise}
   */
  async getCouponById(id) {
    const response = await axiosInstance.get(`/coupon/${id}`);
    return response.data;
  },

  /**
   * Tạo mã giảm giá mới
   * @param {Object} payload - { coupon_code, coupon_name, description, discount_percent, start_date, end_date, productIds }
   * @returns {Promise}
   */
  async createCoupon(payload) {
    const response = await axiosInstance.post("/coupon", payload);
    return response.data;
  },

  /**
   * Cập nhật mã giảm giá
   * @param {number|string} id
   * @param {Object} payload
   * @returns {Promise}
   */
  async updateCoupon(id, payload) {
    const response = await axiosInstance.put(`/coupon/${id}`, payload);
    return response.data;
  },

  /**
   * Xóa mã giảm giá (đơn lẻ hoặc hàng loạt)
   * @param {Object} payload - { id } hoặc { ids: [] }
   * @returns {Promise}
   */
  async deleteCoupon(payload) {
    const response = await axiosInstance.delete("/coupon", { data: payload });
    return response.data;
  },
};

export default couponService;
