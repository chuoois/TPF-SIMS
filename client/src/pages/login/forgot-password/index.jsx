import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Link } from "react-router-dom"
import Logo from "@/assets/logos/Logo.png"
import { PageHelmet } from "@/components/seo/PageHelmet"

/**
 * Component ForgotPasswordPage
 * Trang quên mật khẩu hệ thống TPF-SIMS.
 *
 * Chức năng:
 * - Nhập email
 * - Điều hướng sang trang đăng nhập
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()

        // TODO: call API forgot-password
        // POST /auth/forgot-password { email }

        setSubmitted(true)
    }

    return (
        <>
            <PageHelmet title="Quên mật khẩu | TPF-SIMS" />

            <div className="flex flex-col gap-6">
                <Card className="overflow-hidden p-0">
                    <CardContent className="grid p-0 md:grid-cols-2">
                        <form
                            className="p-6 md:p-8"
                            onSubmit={handleSubmit}
                        >
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">
                                        Quên mật khẩu
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Nhập email để nhận liên kết đặt lại mật khẩu
                                    </p>
                                </div>

                                {!submitted ? (
                                    <>
                                        <Field>
                                            <FieldLabel htmlFor="email">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Nhập email..."
                                                required
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                            />
                                        </Field>

                                        <Field>
                                            <Button
                                                type="submit"
                                                className="w-full"
                                            >
                                                Gửi lại mật khẩu mới
                                            </Button>
                                        </Field>
                                    </>
                                ) : (
                                    <div className="rounded-md bg-muted p-4 text-sm text-center">
                                        Nếu email tồn tại trong hệ thống,
                                        chúng tôi đã gửi lại mật khẩu mới cho bạn.
                                    </div>
                                )}

                                <div className="text-center text-sm">
                                    <Link
                                        to="/auth/login"
                                        className="underline underline-offset-4"
                                    >
                                        Quay lại đăng nhập
                                    </Link>
                                </div>
                            </FieldGroup>
                        </form>

                        <div className="bg-muted relative hidden md:flex flex-col items-center justify-center p-10 text-center">
                            <img
                                src={Logo}
                                alt="TPF-SIMS Logo"
                                className="h-20 w-auto mb-4"
                            />

                            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                                Hệ thống quản lý nội bộ giúp vận hành hiệu quả,
                                minh bạch và chính xác hơn mỗi ngày.
                            </p>

                            <div className="mt-6 text-xs text-muted-foreground">
                                © 2026 5PGroup
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
