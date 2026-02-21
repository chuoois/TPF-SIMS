import api from "../lib/axios";

/**
 * Owner Service
 * Created By: ThinhBui
 * Created Date: 18/02/2026
 */
export const ownerService = {
    // Create Account (and Profile)
    createAccount: async (data) => {
        const res = await api.post("/owner/accounts", data);
        return res.data;
    },

    // Get All Accounts
    getAllAccounts: async () => {
        const res = await api.get("/owner/accounts");
        return res.data;
    },

    // Get Account By ID
    getAccountById: async (id) => {
        const res = await api.get(`/owner/accounts/${id}`);
        return res.data;
    },

    // Update Account
    updateAccount: async (id, data) => {
        const res = await api.put(`/owner/accounts/${id}`, data);
        return res.data;
    },

    // Delete Account
    deleteAccount: async (id) => {
        const res = await api.delete(`/owner/accounts/${id}`);
        return res.data;
    },

    // Update Account Status
    updateAccountStatus: async (id, status) => {
        const res = await api.patch(`/owner/accounts/${id}/status`, { status });
        return res.data;
    },

    // Get System Logs
    getSystemLogs: async (page = 1, limit = 20) => {
        const res = await api.get(`/owner/logs?page=${page}&limit=${limit}`);
        return res.data;
    },
};
