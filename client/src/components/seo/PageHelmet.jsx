/**
 * Component PageHelmet
 * Thiết lập tiêu đề trang cho hệ thống TPF-SIMS.
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
import { useEffect } from "react"


export const PageHelmet = ({ title }) => {
    useEffect(() => {
        document.title = title
    }, [title])

    return null
}