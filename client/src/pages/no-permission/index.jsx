import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHelmet } from "@/components/seo/PageHelmet"
/**
 * Component NoPermissionPage
 * Trang không có quyền truy cập 403
 * 
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
export const NoPermissionPage = () => {
    return (
        <>
            <PageHelmet title="Truy cập bị từ chối | TPF-SIMS" />
            <div className="flex min-h-dvh items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-[120px] font-extrabold tracking-tight">
                        403
                    </h1>
                    <p className="mt-4 text-xl font-semibold">
                        Truy cập bị từ chối
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Bạn không có quyền xem nội dung này. <br />
                        Vui lòng quay lại hoặc liên hệ quản trị viên.
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
