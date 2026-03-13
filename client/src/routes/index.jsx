import { createBrowserRouter, Navigate } from "react-router-dom";
import { NotFoundPage } from "@/pages/not-found";
import { NoPermissionPage } from "@/pages/no-permission";
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
    element: <ProtectedRoute />,

    children: [ownerRoutes, accountantRoutes, workerRoutes],
  },
  salesRoutes,
  { path: "/404", element: <NotFoundPage /> },
  { path: "/403", element: <NoPermissionPage /> },
  { path: "*", element: <Navigate to="/404" replace /> },
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },
]);
