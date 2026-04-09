import { Outlet } from "react-router-dom"
import { FooterAuth } from "./FooterAuth"

/**
 * Component AuthLayout
 * Layout dùng chung cho các trang xác thực
 * (Login / Forgot Password).
 *
 * Bao gồm:
 * - Nội dung chính render qua Outlet
 * - FooterAuth hiển thị điều khoản & chính sách
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
export const AuthLayout = () => {
    return (
        <div className="bg-muted min-h-svh flex flex-col items-center p-6 md:p-10">
            <div className="flex flex-1 w-full items-center justify-center">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <Outlet />
                </div>
            </div>
            <FooterAuth />
        </div>
    )
}
