import { Navigate } from "react-router-dom";
import AccountantLayout from "../components/layouts/accountant-layout/index";
import AccountantHome from "../pages/accountant-page/accountant-home";
import AccountantDashboard from "../pages/accountant-page/accountant-dashboard";
import AccountantProductManage from "../pages/accountant-page/accountant-product";
import AccountantImportManage from "../pages/accountant-page/accountant-import";
import AccountantCustomerDebt from "../pages/accountant-page/customer-debt";
import AccountantSupplierDebt from "../pages/accountant-page/supplier-debt";
import AccountantEmployeeSalary from "../pages/accountant-page/employee-salary";

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
        {
            path: "customer-debt",
            element: <AccountantCustomerDebt />,
        },
        {
            path: "supplier-debt",
            element: <AccountantSupplierDebt />,
        },
        {
            path: "employee-salary",
            element: <AccountantEmployeeSalary />,
        },
    ],
};

