import axiosInstance from "@/lib/axios";

/**
 * Product Attribute Service
 * Dịch vụ xử lý các yêu cầu liên quan đến thuộc tính sản phẩm (Danh mục, Màu sắc, Chất liệu, Phòng)
 *
 * Created By: ThinhBui
 * Created Date: 25/04/2026
 */
const productAttributeService = {
  /**
   * Lấy tất cả thuộc tính (Danh mục, Màu sắc, Chất liệu, Phòng)
   * @param {string} search - Từ khóa tìm kiếm chung
   * @returns {Promise<Object>}
   */
  async getAllAttributes(search = "") {
    const response = await axiosInstance.get("/product-attribute/all", {
      params: { search },
    });
    return response.data;
  },

  /**
   * Lấy danh sách thuộc tính phân trang theo loại
   */
  async getAttributeList(type, params = { search: "", page: 1, limit: 10 }) {
    const response = await axiosInstance.get("/product-attribute/all", {
      params: { ...params, type },
    });
    return response.data;
  },

  /**
   * Đồng bộ danh mục
   */
  async syncCategory(name) {
    const response = await axiosInstance.post("/product-attribute/category/sync", { name });
    return response.data;
  },

  /**
   * Đồng bộ màu sắc
   */
  async syncColor(name) {
    const response = await axiosInstance.post("/product-attribute/color/sync", { name });
    return response.data;
  },

  /**
   * Đồng bộ chất liệu
   */
  async syncMaterial(name) {
    const response = await axiosInstance.post("/product-attribute/material/sync", { name });
    return response.data;
  },

  /**
   * Đồng bộ phòng
   */
  async syncRoom(name) {
    const response = await axiosInstance.post("/product-attribute/room/sync", { name });
    return response.data;
  },

  /**
   * Xóa thuộc tính
   */
  async deleteAttribute(type, id) {
    const response = await axiosInstance.delete(`/product-attribute/${type}`, {
      data: { id },
    });
    return response.data;
  },

  /**
   * Xóa nhiều thuộc tính
   */
  async deleteMultipleAttributes(type, ids) {
    const response = await axiosInstance.delete(`/product-attribute/${type}`, {
      data: { ids },
    });
    return response.data;
  },

  /**
   * Lưu thuộc tính (Thêm mới hoặc Cập nhật)
   */
  async saveAttribute(type, data) {
    const response = await axiosInstance.post(`/product-attribute/${type}/save`, data);
    return response.data;
  },
};

export default productAttributeService;
