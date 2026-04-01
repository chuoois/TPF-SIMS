import { Navigate } from "react-router-dom";
import OwnerLayout from "../layouts/owner-layout/index";

import Dashboard from "../pages/owner-page/dashboard";
import Orders from "../pages/owner-page/orders";


import Production from "../pages/owner-page/production";
import ProductionDetail from "../pages/owner-page/production/detail";
import Products from "../pages/owner-page/products";
import OwnerRequirements from "../pages/owner-page/customer-requirements";
import OwnerCustomers from "../pages/owner-page/customers";
import Suppliers from "../pages/owner-page/suppliers";
import Employees from "../pages/owner-page/employees";
import Reports from "../pages/owner-page/reports";
import SystemLogs from "../pages/owner-page/system-logs";
import Warranty from "../pages/owner-page/warranty";
import Coupons from "../pages/owner-page/coupon/index";
import CouponCreate from "../pages/owner-page/coupon/create";

export const ownerRoutes = {
  path: "/owner",
  element: <OwnerLayout />,
  children: [
    { index: true, element: <Navigate to="/owner/dashboard" replace /> },
    {
      path: "dashboard",
      element: <Dashboard />,
    },
    {
      path: "orders",
      element: <Orders />,
    },

    {
      path: "coupons",
      element: <Coupons />,
    },
    {
      path: "coupons/create",
      element: <CouponCreate />,
    },
    {
      path: "coupons/:id/edit",
      element: <CouponCreate />,
    },
    {
      path: "requirements",
      element: <OwnerRequirements />,
    },
    {
      path: "production",
      element: <Production />,
    },
    {
      path: "production/:id",
      element: <ProductionDetail />,
    },
    {
      path: "products",
      element: <Products />,
    },
    {
      path: "customers",
      element: <OwnerCustomers />,
    },

    {
      path: "suppliers",
      element: <Suppliers />,
    },
    {
      path: "employees",
      element: <Employees />,
    },
    {
      path: "warranty",
      element: <Warranty />,
    },
    {
      path: "reports",
      element: <Reports />,
    },
    {
      path: "system-logs",
      element: <SystemLogs />,
    },
  ],
};
