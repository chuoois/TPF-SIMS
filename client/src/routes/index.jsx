import { createBrowserRouter, Navigate } from "react-router-dom";
import { NotFoundPage } from "@/pages/not-found";
import { NoPermissionPage } from "@/pages/no-permission";
import { authRoutes } from "./AuthRoutes";
import { ownerRoutes } from "./OwnerRoutes";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Main Router Configuration
 * Cấu hình Router chính cho toàn bộ ứng dụng:
 * - Kết hợp các module route (Auth, Admin, Warehouse...)
 * - Định nghĩa root redirect
 * - Xử lý lỗi 404 Global
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

export const router = createBrowserRouter([
  authRoutes,
  // Protected Routes
  {
    element: <ProtectedRoute />,
    children: [ownerRoutes],
  },

  { path: "/404", element: <NotFoundPage /> },
  { path: "/403", element: <NoPermissionPage /> },
  { path: "*", element: <Navigate to="/404" replace /> },
]);