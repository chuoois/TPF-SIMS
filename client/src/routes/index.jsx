import { createBrowserRouter, Navigate } from "react-router-dom";
import { NotFoundPage } from "@/pages/auth-page/not-found";
import { NoPermissionPage } from "@/pages/auth-page/no-permission";
import { authRoutes } from "./AuthRoutes";
import { ownerRoutes } from "./OwnerRoutes";
import { salesRoutes } from "./SalesRoutes";
import { accountantRoutes } from "./AccountantRoutes";
import { workerRoutes } from "./WorkerRoutes";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  authRoutes,
  // Protected Routes
  {
    element: <ProtectedRoute allowedRoles={["OWNER"]} />,
    children: [ownerRoutes],
  },
  {
    element: <ProtectedRoute allowedRoles={["ACCOUNTANT", "OWNER"]} />,
    children: [accountantRoutes],
  },
  {
    element: <ProtectedRoute allowedRoles={["WORKER", "OWNER"]} />,
    children: [workerRoutes],
  },
  {
    element: <ProtectedRoute allowedRoles={["SALES", "OWNER"]} />,
    children: [salesRoutes],
  },
  { path: "/404", element: <NotFoundPage /> },
  { path: "/403", element: <NoPermissionPage /> },
  { path: "*", element: <Navigate to="/404" replace /> },
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },
]);
