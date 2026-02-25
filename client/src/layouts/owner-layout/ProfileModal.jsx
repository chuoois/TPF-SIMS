import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { commonService } from "@/services/common.service";
import { toast } from "react-hot-toast";
import { X, UserCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Modal chỉnh sửa hồ sơ cá nhân – validate với Formik + Yup
 * Created By: ThinhBui
 * Created Date: 20/02/2026
 */

const profileSchema = Yup.object({
    full_name: Yup.string()
        .trim()
        .min(2, "Họ tên phải có ít nhất 2 ký tự")
        .required("Vui lòng nhập họ và tên"),

    phone_number: Yup.string()
        .matches(
            /^(0[3|5|7|8|9])+([0-9]{8})$/,
            "Số điện thoại không hợp lệ (VD: 0901234567)"
        )
        .nullable(),

    dob: Yup.date()
        .max(new Date(), "Ngày sinh không được ở tương lai")
        .nullable()
        .transform((v) => (v instanceof Date && !isNaN(v) ? v : null)),

    gender: Yup.string().oneOf(["0", "1", ""], "Giới tính không hợp lệ"),
});

export const ProfileModal = ({ open, onClose }) => {
    const formik = useFormik({
        initialValues: {
            full_name: "",
            phone_number: "",
            dob: "",
            gender: "",
        },
        validationSchema: profileSchema,
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await commonService.updateProfile({
                    full_name: values.full_name || undefined,
                    phone_number: values.phone_number || undefined,
                    dob: values.dob || undefined,
                    gender: values.gender !== "" ? Number(values.gender) : undefined,
                });
                toast.success("Cập nhật hồ sơ thành công!");
                onClose(true);
            } catch (err) {
                toast.error(
                    err?.response?.data?.message ?? "Cập nhật thất bại, thử lại sau."
                );
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Fetch profile mới nhất mỗi khi modal mở
    useEffect(() => {
        if (!open) return;
        formik.resetForm();

        const loadProfile = async () => {
            try {
                const data = await commonService.getProfile();
                const p = data?.profile ?? {};
                formik.setValues({
                    full_name: p.full_name ?? "",
                    phone_number: p.phone_number ?? "",
                    dob: p.dob ? p.dob.split("T")[0] : "",
                    gender:
                        p.gender !== undefined && p.gender !== null ? String(p.gender) : "",
                });
            } catch {
                toast.error("Không thể tải thông tin hồ sơ");
            }
        };

        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    const FieldError = ({ name }) =>
        formik.touched[name] && formik.errors[name] ? (
            <p className="text-[11px] text-red-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                {formik.errors[name]}
            </p>
        ) : null;

    const inputClass = (name) =>
        formik.touched[name] && formik.errors[name]
            ? "border-red-500 focus-visible:ring-red-500 bg-red-50/10"
            : "border-gray-200";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onClose(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <UserCircle2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-gray-800">Hồ sơ cá nhân</h2>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={formik.handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Họ và tên */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="full_name"
                            className={formik.touched.full_name && formik.errors.full_name ? "text-red-500" : ""}
                        >
                            Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            value={formik.values.full_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Nguyễn Văn A"
                            className={inputClass("full_name")}
                        />
                        <FieldError name="full_name" />
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="phone_number"
                            className={formik.touched.phone_number && formik.errors.phone_number ? "text-red-500" : ""}
                        >
                            Số điện thoại
                        </Label>
                        <Input
                            id="phone_number"
                            name="phone_number"
                            value={formik.values.phone_number}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="0901234567"
                            className={inputClass("phone_number")}
                        />
                        <FieldError name="phone_number" />
                    </div>

                    {/* Ngày sinh */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="dob"
                            className={formik.touched.dob && formik.errors.dob ? "text-red-500" : ""}
                        >
                            Ngày sinh
                        </Label>
                        <Input
                            id="dob"
                            name="dob"
                            type="date"
                            value={formik.values.dob}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={inputClass("dob")}
                        />
                        <FieldError name="dob" />
                    </div>

                    {/* Giới tính */}
                    <div className="space-y-1.5">
                        <Label htmlFor="gender">Giới tính</Label>
                        <select
                            id="gender"
                            name="gender"
                            value={formik.values.gender}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">-- Chọn giới tính --</option>
                            <option value="1">Nam</option>
                            <option value="0">Nữ</option>
                        </select>
                        <FieldError name="gender" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onClose(false)}
                            disabled={formik.isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={formik.isSubmitting}>
                            {formik.isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};