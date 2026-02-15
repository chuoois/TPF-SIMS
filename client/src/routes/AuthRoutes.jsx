import { LoginPage } from "@/pages/login/index"
import { ForgotPasswordPage } from "@/pages/forgot-password/index"
import { AuthLayout } from "@/layouts/auth-layout/index"

/**
 * Authentication Routes
 * Định nghĩa các đường dẫn liên quan đến xác thực:
 * - Login (Đăng nhập)
 * - Register (Đăng ký - Future)
 * - Forgot Password (Quên mật khẩu - Future)
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

export const authRoutes = {
    path: "auth",
    element: <AuthLayout />,
    children: [
        {
            path: "login",
            element: <LoginPage />,
        },
        {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
        },
    ],
}
