import { OwnerLayout } from "@/layouts/owner-layout/index"
import OwnerAccountManage from "@/pages/owner-page/owner-account-manage"
import OwnerSystemLogManage from "@/pages/owner-page/owner-systemlog-manage"
import OwnerMasterDataManage from "@/pages/owner-page/owner-master-data"

/**
 * Authentication Routes
 * Định nghĩa các đường dẫn của owner:
 *
 * Created By: ThinhBui
 * Created Date: 18/02/2026
 */

export const ownerRoutes = {
    path: "/owner",
    element: <OwnerLayout />,
    children: [
        {
            path: "home",
            element: <div>Home</div>
        },
        {
            path: "dashboard/account-manage",
            element: <OwnerAccountManage />,
        },
        {
            path: "dashboard/system-log",
            element: <OwnerSystemLogManage />,
        },
        {
            path: "dashboard/master-data",
            element: <OwnerMasterDataManage />,
        },
    ],
}
