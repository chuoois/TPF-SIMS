import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import Logo from "@/assets/tp-logo.svg";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

/**
 * Component LoginPage
 * Trang đăng nhập hệ thống TPF-SIMS
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 * Updated: 06/03/2026 – redesign modern SaaS style
 */

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tự động chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRedirectMap = {
        OWNER: "/owner/dashboard",
        SALES: "/sales/dashboard/orders",
        ACCOUNTANT: "/accountant/dashboard",
        WORKER: "/worker/dashboard",
      };
      navigate(roleRedirectMap[user.role] || "/");
    }
  }, [isAuthenticated, user, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
    password: Yup.string()
      .min(6, "Mật khẩu tối thiểu 6 ký tự")
      .required("Vui lòng nhập mật khẩu"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,

    onSubmit: async (values) => {
      try {
        setLoading(true);

        const data = await login(values.email, values.password);
        const role = data.user.role;

        const roleRedirectMap = {
          OWNER: "/owner/dashboard",
          SALES: "/sales/dashboard/orders",
          ACCOUNTANT: "/accountant/dashboard",
          WORKER: "/worker/dashboard",
        };

        toast.success("Đăng nhập thành công");

        navigate(roleRedirectMap[role] || "/");
      } catch (error) {
        console.error("Login Error:", error);

        const message = error?.response?.data?.message || "Sai email hoặc mật khẩu";
        toast.error(message);

        // Throw error để Formik biết là submit thất bại, tránh reset form (nếu có config)
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
  return (
    <>
      <PageHelmet title="Đăng nhập | TPF-SIMS" />

      <div>
        <div
          className="w-full max-w-[960px] grid md:grid-cols-2 rounded-2xl overflow-hidden"
          style={{
            boxShadow:
              "0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {/* LEFT — Illustration Panel */}
          <div
            className="relative hidden md:flex flex-col items-center justify-center p-12 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
            }}
          >
            {/* Abstract decorative circles */}
            <div
              className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
              style={{ backgroundColor: "#fff" }}
            />
            <div
              className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full opacity-10"
              style={{ backgroundColor: "#fff" }}
            />
            <div
              className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full opacity-5"
              style={{ backgroundColor: "#fff" }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon illustration */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <img src={Logo} alt="TPF-SIMS" className="h-12 w-12" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">TPF-SIMS</h2>
              <p className="text-white/80 text-sm max-w-[260px] leading-relaxed">
                Hệ thống quản lý nội bộ giúp vận hành hiệu quả, minh bạch và
                chính xác hơn mỗi ngày.
              </p>

              {/* Feature highlights */}
              <div className="mt-8 flex flex-col gap-3 w-full max-w-[240px]">
                {[
                  "Quản lý đơn hàng thông minh",
                  "Theo dõi sản phẩm & kho",
                  "Báo cáo doanh thu realtime",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-left">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-white/90 text-[13px]">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-white/40 text-xs">
              © 2026 5PGroup
            </div>
          </div>

          {/* RIGHT — Login Form */}
          <div className="bg-white p-8 md:p-10 flex flex-col justify-center">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 md:mb-10">
              <img src={Logo} alt="TPF-SIMS" className="h-9 w-9 rounded-lg" />
              <span className="text-lg font-bold" style={{ color: "#1e293b" }}>
                TPF-SIMS
              </span>
            </div>

            <div className="mb-8">
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: "#0f172a" }}
              >
                Chào mừng bạn quay lại
              </h1>
              <p className="text-sm mt-1.5" style={{ color: "#94a3b8" }}>
                Đăng nhập vào tài khoản TPF-SIMS của bạn
              </p>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* EMAIL */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "#374151" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập email..."
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all duration-200 outline-none"
                    style={{
                      border: `1.5px solid ${formik.touched.email && formik.errors.email ? "#ef4444" : "#e2e8f0"}`,
                      boxShadow: formik.touched.email && formik.errors.email ? "0 0 0 4px rgba(239, 68, 68, 0.15)" : "none",
                      color: "#0f172a",
                      backgroundColor: "#f8fafc",
                    }}
                    onFocus={(e) => {
                      if (!(formik.touched.email && formik.errors.email)) {
                        e.target.style.borderColor = "#22c55e";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(34,197,94,0.15)";
                      } else {
                        e.target.style.borderColor = "#ef4444";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(239, 68, 68, 0.2)";
                      }
                    }}
                    onBlurCapture={(e) => {
                      if (!(formik.touched.email && formik.errors.email)) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      } else {
                        e.target.style.borderColor = "#ef4444";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(239, 68, 68, 0.15)";
                      }
                    }}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs mt-0.5" style={{ color: "#ef4444" }}>
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                    style={{ color: "#374151" }}
                  >
                    Mật khẩu
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs font-medium no-underline transition-colors hover:opacity-80"
                    style={{ color: "#22c55e" }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu..."
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full h-11 pl-10 pr-11 rounded-xl text-sm transition-all duration-200 outline-none"
                    style={{
                      border: `1.5px solid ${formik.touched.password && formik.errors.password ? "#ef4444" : "#e2e8f0"}`,
                      boxShadow: formik.touched.password && formik.errors.password ? "0 0 0 4px rgba(239, 68, 68, 0.15)" : "none",
                      color: "#0f172a",
                      backgroundColor: "#f8fafc",
                    }}
                    onFocus={(e) => {
                      if (!(formik.touched.password && formik.errors.password)) {
                        e.target.style.borderColor = "#22c55e";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(34,197,94,0.15)";
                      } else {
                        e.target.style.borderColor = "#ef4444";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(239, 68, 68, 0.2)";
                      }
                    }}
                    onBlurCapture={(e) => {
                      if (!(formik.touched.password && formik.errors.password)) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      } else {
                        e.target.style.borderColor = "#ef4444";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(239, 68, 68, 0.15)";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                    style={{ color: "#94a3b8" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs mt-0.5" style={{ color: "#ef4444" }}>
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded cursor-pointer accent-[#22c55e]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm cursor-pointer select-none"
                  style={{ color: "#64748b" }}
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "#86efac"
                    : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  boxShadow: loading ? "none" : "0 2px 8px rgba(34,197,94,0.3)",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.target.style.boxShadow = "0 4px 16px rgba(34,197,94,0.4)";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    e.target.style.boxShadow = "0 2px 8px rgba(34,197,94,0.3)";
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Divider */}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
