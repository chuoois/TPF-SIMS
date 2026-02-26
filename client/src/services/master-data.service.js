import api from "../lib/axios";

const API_URL = "/master-data";

export const masterDataService = {
    // Wood Types
    getAllWoodTypes: async (page = 1, limit = 10, search = "") => {
        const response = await api.get(`${API_URL}/wood-types?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    },
    createWoodType: async (data) => {
        const response = await api.post(`${API_URL}/wood-types`, data);
        return response.data;
    },
    updateWoodType: async (id, data) => {
        const response = await api.put(`${API_URL}/wood-types/${id}`, data);
        return response.data;
    },
    deleteWoodType: async (id) => {
        const response = await api.delete(`${API_URL}/wood-types/${id}`);
        return response.data;
    },

    // Product Categories
    getAllCategories: async (page = 1, limit = 10, search = "") => {
        const response = await api.get(`${API_URL}/categories?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    },
    createCategory: async (data) => {
        const response = await api.post(`${API_URL}/categories`, data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await api.put(`${API_URL}/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await api.delete(`${API_URL}/categories/${id}`);
        return response.data;
    },

    // Colors
    getAllColors: async (page = 1, limit = 10, search = "") => {
        const response = await api.get(`${API_URL}/colors?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    },
    createColor: async (data) => {
        const response = await api.post(`${API_URL}/colors`, data);
        return response.data;
    },
    updateColor: async (id, data) => {
        const response = await api.put(`${API_URL}/colors/${id}`, data);
        return response.data;
    },
    deleteColor: async (id) => {
        const response = await api.delete(`${API_URL}/colors/${id}`);
        return response.data;
    },
};
