import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { commonService } from "@/services/common.service";
import { toast } from "react-hot-toast";
import { X, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * NGOÀI component để tránh unmount/remount (mất focus)
 */
const PasswordInput = ({
    id, name, value, label, required: isRequired,
    show, error, touched, onToggle, onChange, onBlur,
}) => (
    <div className="space-y-1.5 uppercase-labels">
        <Label htmlFor={id} className={touched && error ? "text-red-500" : ""}>
            {label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
            <Input
                id={id}
                name={name}
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                className={`pr-10 transition-all ${touched && error ? "border-red-500 focus-visible:ring-red-500 bg-red-50/10" : "border-gray-200"}`}
            />
            <button
                type="button"
                onClick={onToggle}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
        {touched && error && (
            <p className="text-[11px] text-red-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>
        )}
    </div>
);

// ─── Yup Schema ────────────────────────────────────────────────────────────────
const changePasswordSchema = Yup.object({
    oldPassword: Yup.string().required("Vui lòng nhập mật khẩu hiện tại"),

    newPassword: Yup.string()
        .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
        .notOneOf(
            [Yup.ref("oldPassword")],
            "Mật khẩu mới không được trùng mật khẩu hiện tại"
        )
        .required("Vui lòng nhập mật khẩu mới"),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
        .required("Vui lòng xác nhận mật khẩu mới"),
});

/**
 * Modal đổi mật khẩu – validate với Formik + Yup
 * Created By: ThinhBui
 * Created Date: 20/02/2026
 */
export const ChangePasswordModal = ({ open, onClose }) => {
    const [show, setShow] = useState({ old: false, new: false, confirm: false });
    const toggleShow = (field) =>
        setShow((prev) => ({ ...prev, [field]: !prev[field] }));

    const formik = useFormik({
        initialValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: changePasswordSchema,
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await commonService.changePassword({
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword,
                });
                toast.success("Đổi mật khẩu thành công!");
                resetForm();
                setShow({ old: false, new: false, confirm: false });
                onClose();
            } catch (err) {
                toast.error(
                    err?.response?.data?.message ?? "Đổi mật khẩu thất bại, thử lại sau."
                );
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleClose = () => {
        formik.resetForm();
        setShow({ old: false, new: false, confirm: false });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-gray-800">Đổi mật khẩu</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={formik.handleSubmit} className="px-6 py-5 space-y-4">
                    <PasswordInput
                        id="oldPassword"
                        name="oldPassword"
                        value={formik.values.oldPassword}
                        label="Mật khẩu hiện tại"
                        required
                        show={show.old}
                        error={formik.errors.oldPassword}
                        touched={formik.touched.oldPassword}
                        onToggle={() => toggleShow("old")}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        value={formik.values.newPassword}
                        label="Mật khẩu mới"
                        required
                        show={show.new}
                        error={formik.errors.newPassword}
                        touched={formik.touched.newPassword}
                        onToggle={() => toggleShow("new")}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formik.values.confirmPassword}
                        label="Xác nhận mật khẩu mới"
                        required
                        show={show.confirm}
                        error={formik.errors.confirmPassword}
                        touched={formik.touched.confirmPassword}
                        onToggle={() => toggleShow("confirm")}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={formik.isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={formik.isSubmitting}>
                            {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xác nhận
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
