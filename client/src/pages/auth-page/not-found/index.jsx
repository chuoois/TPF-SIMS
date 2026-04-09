import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHelmet } from "@/components/seo/PageHelmet"
/**
 * Component NotFoundPage
 * Trang không tìm thấy 404
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
export const NotFoundPage = () => {
    return (
        <>
            <PageHelmet title="Không tìm thấy trang | TPF-SIMS" />
            <div className="flex min-h-dvh items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-[120px] font-extrabold tracking-tight">
                        404
                    </h1>
                    <p className="mt-4 text-xl font-semibold">
                        Oops, Không tìm thấy trang!
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Đường dẫn có thể đã bị sai <br />
                        hoặc trang này không còn tồn tại.
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        className="mt-8 px-6"
                    >
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại trang chủ
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    )
}
