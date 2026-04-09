/**
 * Component FooterAuth
 * Footer hiển thị điều khoản dịch vụ và chính sách bảo mật
 * cho các trang xác thực (Login / Forgot Password).
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
export const FooterAuth = () => {
    return (
        <footer className="mt-6 text-center text-sm text-muted-foreground">
            Bằng cách nhấn tiếp tục, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-foreground">
                Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="underline hover:text-foreground">
                Chính sách bảo mật
            </a>.
        </footer>
    )
}
