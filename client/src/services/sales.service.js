import api from "../lib/axios";

/**
 * Sales Service – Quản lý khách hàng
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */
export const salesService = {
    // GET /sales/customers?search=...
    getCustomers: async (search = "") => {
        const params = search ? { search } : {};
        const res = await api.get("/sales/customers", { params });
        return res.data;
    },

    // GET /sales/customers/:id
    getCustomerById: async (id) => {
        const res = await api.get(`/sales/customers/${id}`);
        return res.data;
    },

    // POST /sales/customers
    createCustomer: async (data) => {
        const res = await api.post("/sales/customers", data);
        return res.data;
    },

    // PUT /sales/customers/:id
    updateCustomer: async (id, data) => {
        const res = await api.put(`/sales/customers/${id}`, data);
        return res.data;
    },

    // PATCH /sales/customers/:id/note
    updateCustomerNote: async (id, note) => {
        const res = await api.patch(`/sales/customers/${id}/note`, { note });
        return res.data;
    },

    // DELETE /sales/customers/:id
    deleteCustomer: async (id) => {
        const res = await api.delete(`/sales/customers/${id}`);
        return res.data;
    },
};
