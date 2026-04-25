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
   * @returns {Promise<Object>}
   */
  async getAllAttributes() {
    const response = await axiosInstance.get("/product-attribute/all");
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
};

export default productAttributeService;
