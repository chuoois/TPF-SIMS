import { createContext, useContext, useState, useEffect } from "react";
import authService from "@/services/auth.service";

/**
 * Auth Context
 * Quản lý trạng thái đăng nhập toàn cục
 * 
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục session khi mount
  useEffect(() => {
    const restoreSession = async () => {
      // Chỉ gọi API nếu có hint là user từng đăng nhập (tiết kiệm request)
      const userHint = localStorage.getItem("user");
      if (!userHint) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getProfile();
        setUser(data.user);
      } catch (error) {
        // Nếu là 401 hoặc lỗi profile, coi như chưa đăng nhập
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const minimalUser = { name: data.user.fullName, role: data.user.role };
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(minimalUser));
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};