import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/logos/Logo.png";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";

/**
 * Component LoginPage
 * Trang đăng nhập hệ thống TPF-SIMS (FAKE LOGIN).
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

export const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

        /**
         * Backend sẽ:
         * - Set accessToken cookie
         * - Set refreshToken cookie
         * - Trả về { message, role }
         */
        const data = await authService.login(values.email, values.password);
        const role = data.role;
        localStorage.setItem("user", JSON.stringify(data.user));
        const roleRedirectMap = {
          OWNER: "/owner/home",
          SALES: "/sales/home",
          ACCOUNTANT: "/accountant/dashboard",
          WORKER: "/worker/home",
        };

        toast.success("Đăng nhập thành công");

        navigate(roleRedirectMap[role] || "/");
      } catch (error) {
        console.error(error);

        toast.error(
          error?.response?.data?.message || "Sai email hoặc mật khẩu",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <PageHelmet title="Đăng nhập | TPF-SIMS" />

      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={formik.handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Chào mừng bạn quay lại</h1>
                  <p className="text-muted-foreground text-balance">
                    Đăng nhập vào tài khoản TPF-SIMS của bạn
                  </p>
                </div>

                {/* EMAIL */}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập email..."
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.email && formik.errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </Field>

                {/* PASSWORD */}
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                    <Link
                      to="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu..."
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pr-10 ${formik.touched.password && formik.errors.password
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {formik.errors.password}
                    </p>
                  )}
                </Field>

                <Field>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            <div className="bg-muted relative hidden md:flex flex-col items-center justify-center p-10 text-center">
              <img
                src={Logo}
                alt="TPF-SIMS Logo"
                className="h-20 w-auto mb-4"
              />

              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                Hệ thống quản lý nội bộ giúp vận hành hiệu quả, minh bạch và
                chính xác hơn mỗi ngày.
              </p>

              <div className="mt-6 text-xs text-muted-foreground">
                © 2026 5PGroup
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
