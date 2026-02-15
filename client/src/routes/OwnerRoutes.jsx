import { LoginPage } from "@/pages/login/index"
import { OwnerLayout } from "@/layouts/owner-layout/index"

/**
 * Authentication Routes
 * Định nghĩa các đường dẫn của owner:
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

export const ownerRoutes = {
    path: "owner",
    element: <OwnerLayout />,
    children: [
        {
            path: "home",
            element: <div>Home</div>,
        },
    ],
}
