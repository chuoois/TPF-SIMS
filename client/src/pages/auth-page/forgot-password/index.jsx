import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Logo from "@/assets/tp-logo.svg";
import { PageHelmet } from "@/components/seo/PageHelmet";
import authService from "@/services/auth.service";
import { toast } from "react-hot-toast";

/**
 * Component ForgotPasswordPage
 * Trang quên mật khẩu hệ thống TPF-SIMS.
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 * Updated: 06/03/2026 – redesign modern SaaS style
 */

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      const msg = err?.response?.data?.message || "Lỗi hệ thống khi gửi yêu cầu";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHelmet title="Quên mật khẩu | TPF-SIMS" />

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#f5f6f7" }}
      >
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
                Bảo mật tài khoản của bạn luôn là ưu tiên hàng đầu của chúng
                tôi.
              </p>

              {/* Security features */}
              <div className="mt-8 flex flex-col gap-3 w-full max-w-[240px]">
                {[
                  "Đặt lại mật khẩu an toàn",
                  "Xác thực qua email",
                  "Mã hóa dữ liệu end-to-end",
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

            <div className="absolute bottom-6 text-white/40 text-xs">
              © 2026 5PGroup
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="bg-white p-8 md:p-10 flex flex-col justify-center">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 md:mb-10">
              <img src={Logo} alt="TPF-SIMS" className="h-9 w-9 rounded-lg" />
              <span className="text-lg font-bold" style={{ color: "#1e293b" }}>
                TPF-SIMS
              </span>
            </div>

            {!submitted ? (
              <>
                <div className="mb-8">
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "#0f172a" }}
                  >
                    Quên mật khẩu?
                  </h1>
                  <p
                    className="text-sm mt-1.5 leading-relaxed"
                    style={{ color: "#94a3b8" }}
                  >
                    Nhập địa chỉ email của bạn, chúng tôi sẽ gửi mật khẩu mới
                    cho bạn.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* EMAIL */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "#94a3b8" }}
                      />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        value={email}
                        disabled={loading}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all duration-200 outline-none disabled:opacity-50"
                        style={{
                          border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`,
                          color: "#0f172a",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          if (!error) {
                            e.target.style.borderColor = "#22c55e";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(34,197,94,0.1)";
                          }
                        }}
                        onBlurCapture={(e) => {
                          if (!error) {
                            e.target.style.borderColor = "#e2e8f0";
                            e.target.style.boxShadow = "none";
                          }
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <p
                      className="text-xs text-center"
                      style={{ color: "#ef4444" }}
                    >
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: loading
                        ? "#86efac"
                        : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      boxShadow: loading
                        ? "none"
                        : "0 2px 8px rgba(34,197,94,0.3)",
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        e.target.style.boxShadow =
                          "0 4px 16px rgba(34,197,94,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading)
                        e.target.style.boxShadow =
                          "0 2px 8px rgba(34,197,94,0.3)";
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
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        Gửi mật khẩu mới
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="flex flex-col items-center text-center py-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  <CheckCircle2 size={32} style={{ color: "#22c55e" }} />
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "#0f172a" }}
                >
                  Đã gửi mật khẩu mới!
                </h2>
                <p
                  className="text-sm max-w-[300px] leading-relaxed"
                  style={{ color: "#94a3b8" }}
                >
                  Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mật khẩu
                  mới cho bạn. Vui lòng kiểm tra hộp thư đến.
                </p>
              </div>
            )}

            {/* Back to login */}
            <div className="mt-8 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium no-underline transition-colors hover:opacity-80"
                style={{ color: "#22c55e" }}
              >
                <ArrowLeft size={14} />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
