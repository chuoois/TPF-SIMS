import { Navigate } from "react-router-dom";
import OwnerLayout from "../layouts/owner-layout/index";

import Dashboard from "../pages/owner-page/dashboard";
import Orders from "../pages/owner-page/orders";
import OrderDetail from "../pages/owner-page/orders/detail";

import Production from "../pages/owner-page/production";
import ProductionDetail from "../pages/owner-page/production/detail";
import Products from "../pages/owner-page/products";
import Customers from "../pages/owner-page/customers";
import Suppliers from "../pages/owner-page/suppliers";
import Employees from "../pages/owner-page/employees";
import Reports from "../pages/owner-page/reports";


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
      path: "orders/:id",
      element: <OrderDetail />,
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
      element: <Customers />,
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
      path: "reports",
      element: <Reports />,
    },
  ],
};
