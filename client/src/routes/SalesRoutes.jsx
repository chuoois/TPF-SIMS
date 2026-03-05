import { SalesLayout } from "@/layouts/sales-layout/index";
import SalesCustomerManage from "@/pages/sales-page/customer-manage";
import InStockInvoicePage from "@/pages/sales-page/invoice-instock";
import CustomOrderInvoicePage from "@/pages/sales-page/invoice-custom-order";
import OrderManagePage from "@/pages/sales-page/order-manage";
import SalesDashboardHome from "@/pages/sales-page/home";

/**
 * Sales Routes
 * Định nghĩa các đường dẫn của nhân viên bán hàng (SALES/OWNER)
 *
 * Created By: DNC
 * Created Date: 24/02/2026
 */

export const salesRoutes = {
  path: "sales",
  element: <SalesLayout />,
  children: [
    {
      path: "home",
      element: <SalesDashboardHome />,
    },
    {
      path: "dashboard/customers",
      element: <SalesCustomerManage />,
    },
    {
      path: "dashboard/invoice-instock",
      element: <InStockInvoicePage />,
    },
    {
      path: "dashboard/invoice-custom-order",
      element: <CustomOrderInvoicePage />,
    },
    {
      path: "dashboard/orders",
      element: <OrderManagePage />,
    },
  ],
};
