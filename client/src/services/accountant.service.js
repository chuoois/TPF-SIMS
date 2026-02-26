import api from "../lib/axios";

const API_URL = "/accountant";

/**
 * Accountant Service
 * Giao tiếp với backend cho module Kế toán
 *
 * Created By: ThinhBui
 * Created Date: 27/02/2026
 */
export const accountantService = {
    // Dashboard
    getDashboardStats: async () => {
        const response = await api.get(`${API_URL}/dashboard/stats`);
        return response.data;
    },

    // Products
    getAllProducts: async (page = 1, limit = 10, search = "", categoryId = "") => {
        const params = new URLSearchParams({ page, limit, search });
        if (categoryId) params.append("categoryId", categoryId);
        const response = await api.get(`${API_URL}/products?${params.toString()}`);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(`${API_URL}/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`${API_URL}/products/${id}`);
        return response.data;
    },

    // Import Stock (batch)
    importStock: async (warehouseId, lines) => {
        const response = await api.post(`${API_URL}/import-stock`, { warehouseId, lines });
        return response.data;
    },

    // Warehouses
    getWarehouses: async () => {
        const response = await api.get(`${API_URL}/warehouses`);
        return response.data;
    },
};
