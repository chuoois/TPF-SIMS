import { SalesLayout } from "@/layouts/sales-layout/index";
import SalesCustomerManage from "@/pages/sales-page/customer-manage";

/**
 * Sales Routes
 * Định nghĩa các đường dẫn của nhân viên bán hàng (SALES/OWNER)
 *
 * Created By: ThinhBui
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
  ],
};
