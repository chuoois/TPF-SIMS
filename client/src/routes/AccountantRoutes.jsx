import AccountantLayout from "@/layouts/accountant-layout/index";
import AccountantDashboard from "@/pages/accountant-page/accountant-dashboard";
import AccountantProductManage from "@/pages/accountant-page/accountant-product";

/**
 * Accountant Routes
 * Định nghĩa các đường dẫn của kế toán
 *
 * Created By: HieuNM
 * Created Date: 27/02/2026
 */

export const accountantRoutes = {
    path: "/accountant",
    element: <AccountantLayout />,
    children: [
        {
            path: "dashboard",
            element: <AccountantDashboard />,
        },
        {
            path: "products",
            element: <AccountantProductManage />,
        },
    ],
};
