import { Navigate } from "react-router-dom";
import OwnerLayout from "../components/layouts/owner-layout/index";
import Dashboard from "../pages/owner-page/dashboard";
import Orders from "../pages/owner-page/orders";
import Products from "../pages/owner-page/products";
import OwnerRequirements from "../pages/owner-page/customer-requirements";
import Suppliers from "../pages/owner-page/suppliers";
import Employees from "../pages/owner-page/employees";

import SystemLogs from "../pages/owner-page/system-logs";
import Coupons from "../pages/owner-page/coupon/index";
import CouponCreate from "../pages/owner-page/coupon/create-coupon";
import ProductCategories from "../pages/owner-page/products/management/CategoriesPage";
import ProductColors from "../pages/owner-page/products/management/ColorsPage";
import ProductRooms from "../pages/owner-page/products/management/RoomsPage";
import ProductMaterials from "../pages/owner-page/products/management/MaterialsPage";
import ManufacturingOrdersPage from "../pages/owner-page/manufacturing-orders";

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
      path: "manufacturing-orders",
      element: <ManufacturingOrdersPage />,
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
      path: "products",
      children: [
        { index: true, element: <Products /> },
        {
          path: "properties",
          children: [
            { path: "categories", element: <ProductCategories /> },
            { path: "colors", element: <ProductColors /> },
            { path: "rooms", element: <ProductRooms /> },
            { path: "materials", element: <ProductMaterials /> },
          ],
        },
      ],
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
      path: "system-logs",
      element: <SystemLogs />,
    },
  ],
};
