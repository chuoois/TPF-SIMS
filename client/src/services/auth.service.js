import api from "../lib/axios";
/**
 * Auth Service
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

export const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
