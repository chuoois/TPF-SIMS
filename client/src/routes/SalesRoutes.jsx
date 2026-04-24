import { SalesLayout } from "@/components/layouts/sales-layout/index";
import SalesCustomerManage from "@/pages/sales-page/customer-manage";
import InStockInvoicePage from "@/pages/sales-page/invoice-instock";
import CustomOrderInvoicePage from "@/pages/sales-page/requirement-custom-order";
import Orders from "../pages/sales-page/orders";
import SalesRequirements from "@/pages/sales-page/sales-requirements";

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
      path: "dashboard/customers",
      element: <SalesCustomerManage />,
    },
    {
      path: "dashboard/invoice-instock",
      element: <InStockInvoicePage />,
    },
    {
      path: "dashboard/requirements-custom-order",
      element: <CustomOrderInvoicePage />,
    },
    {
      path: "dashboard/orders",
      element: <Orders />,
    },
    {
      path: "dashboard/requirements",
      element: <SalesRequirements />,
    },
  ],
};
