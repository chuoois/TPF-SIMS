import api from "../lib/axios";

/**
 * Common Service – dành cho mọi role đã đăng nhập
 * Created By: ThinhBui
 * Created Date: 20/02/2026
 */
export const commonService = {
    // GET /common/profile
    getProfile: async () => {
        const res = await api.get("/common/profile");
        return res.data;
    },

    // PUT /common/profile
    updateProfile: async (data) => {
        const res = await api.put("/common/profile", data);
        return res.data;
    },

    // PUT /common/change-password
    changePassword: async (data) => {
        const res = await api.put("/common/change-password", data);
        return res.data;
    },
};
