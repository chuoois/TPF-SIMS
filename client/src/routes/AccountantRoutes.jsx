import { Navigate } from "react-router-dom";
import AccountantLayout from "../layouts/accountant-layout/index";
import AccountantHome from "../pages/accountant-page/accountant-home";
import AccountantDashboard from "../pages/accountant-page/accountant-dashboard";
import AccountantProductManage from "../pages/accountant-page/accountant-product";
import AccountantImportManage from "../pages/accountant-page/accountant-import";

/**
 * Accountant Routes
 * Created By: HieuNM – 27/02/2026
 */

export const accountantRoutes = {
    path: "/accountant",
    element: <AccountantLayout />,
    children: [
        { index: true, element: <Navigate to="/accountant/dashboard" replace /> },
        {
            path: "dashboard",
            element: <AccountantHome />,
        },
        {
            path: "old-dashboard",
            element: <AccountantDashboard />,
        },
        {
            path: "products",
            element: <AccountantProductManage />,
        },
        {
            path: "imports",
            element: <AccountantImportManage />,
        },
    ],
};

