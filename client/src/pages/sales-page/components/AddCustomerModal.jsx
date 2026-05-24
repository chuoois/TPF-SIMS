/**
 * Component AddCustomerModal
 * Modal thêm khách hàng nhanh – dùng chung cho các trang bán hàng
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState } from "react";
import { X, User, Phone, Mail, MapPin, Calendar, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import customerService from "@/services/customer.service";
import toast from "react-hot-toast";

const GENDER_OPTIONS = [
  { value: 1, label: "Nam" },
  { value: 2, label: "Nữ" },
  { value: 3, label: "Khác" },
];

const INITIAL_FORM = {
  full_name: "",
  phone_number: "",
  email: "",
  gender: 1, // Mặc định là Nam
  dob: "",
  address: "",
  note: "",
};

const inputBase =
  "w-full text-[13px] rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent";
const inputStyle = {
  border: "1px solid var(--grid-border)",
  color: "var(--text-main)",
};
const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider mb-1.5 block";

export default function AddCustomerModal({ isOpen, onClose, onCustomerAdded }) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "Vui lòng nhập tên";
    
    // Validate SĐT: 10-11 số, bắt đầu bằng 0
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!form.phone_number.trim()) {
      newErrors.phone_number = "Vui lòng nhập SĐT";
    } else if (!phoneRegex.test(form.phone_number.trim())) {
      newErrors.phone_number = "SĐT không đúng định dạng (10 số, bắt đầu bằng 0)";
    }

    if (!form.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await customerService.createCustomer({
        full_name: form.full_name.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim() || null,
        address: form.address.trim(),
        gender: Number(form.gender),
        dob: form.dob || null,
        note: form.note.trim() || null,
      });

      toast.success("Thêm khách hàng thành công");
      
      if (onCustomerAdded) {
        // Trả về đối tượng khách hàng (nằm trong field 'customer' của response)
        const newCustomer = response.data?.customer || response.customer || response;
        onCustomerAdded(newCustomer);
      }
      
      handleClose();
    } catch (error) {
      console.error("Failed to create customer:", error);
      toast.error(error.response?.data?.message || "Lỗi khi thêm khách hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--grid-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "var(--status-focus)",
                color: "var(--brand-primary)",
              }}
            >
              <UserPlus size={16} />
            </div>
            <h2
              className="text-[15px] font-bold"
              style={{ color: "var(--text-main)" }}
            >
              Thêm khách hàng mới
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
            style={{ color: "var(--text-placeholder)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Họ tên */}
          <div>
            <label
              className={labelClass}
              style={{ color: "var(--text-placeholder)" }}
            >
              Họ và tên <span style={{ color: "var(--status-error)" }}>*</span>
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Nhập họ tên khách hàng"
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                className={inputBase}
                style={{
                  ...inputStyle,
                  borderColor: errors.full_name
                    ? "var(--status-error)"
                    : "var(--grid-border)",
                }}
                autoFocus
              />
            </div>
            {errors.full_name && (
              <p
                className="text-[11px] mt-1"
                style={{ color: "var(--status-error)" }}
              >
                {errors.full_name}
              </p>
            )}
          </div>

          {/* SĐT + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-placeholder)" }}
              >
                Số điện thoại{" "}
                <span style={{ color: "var(--status-error)" }}>*</span>
              </label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="tel"
                  placeholder="0xxx xxx xxx"
                  value={form.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  className={inputBase}
                  style={{
                    ...inputStyle,
                    borderColor: errors.phone_number
                      ? "var(--status-error)"
                      : "var(--grid-border)",
                  }}
                />
              </div>
              {errors.phone_number && (
                <p
                  className="text-[11px] mt-1"
                  style={{ color: "var(--status-error)" }}
                >
                  {errors.phone_number}
                </p>
              )}
            </div>
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-placeholder)" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputBase}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Giới tính + Ngày sinh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-placeholder)" }}
              >
                Giới tính
              </label>
              <div className="flex gap-1.5">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => updateField("gender", g.value)}
                    className="flex-1 text-[13px] rounded-lg py-2 transition font-medium cursor-pointer"
                    style={{
                      border: `1px solid ${form.gender === g.value ? "var(--brand-primary)" : "var(--grid-border)"}`,
                      backgroundColor:
                        form.gender === g.value
                          ? "var(--status-focus)"
                          : "transparent",
                      color:
                        form.gender === g.value
                          ? "var(--brand-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-placeholder)" }}
              >
                Ngày sinh
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  className={inputBase}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label
              className={labelClass}
              style={{ color: "var(--text-placeholder)" }}
            >
              Địa chỉ <span style={{ color: "var(--status-error)" }}>*</span>
            </label>
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={inputBase}
                style={{
                  ...inputStyle,
                  borderColor: errors.address ? "var(--status-error)" : "var(--grid-border)"
                }}
              />
            </div>
            {errors.address && (
              <p className="text-[11px] mt-1" style={{ color: "var(--status-error)" }}>
                {errors.address}
              </p>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label
              className={labelClass}
              style={{ color: "var(--text-placeholder)" }}
            >
              Ghi chú
            </label>
            <textarea
              placeholder="Ghi chú về khách hàng..."
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              rows={2}
              className="w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition resize-none bg-transparent"
              style={inputStyle}
            />
          </div>

          {/* Actions */}
          <div
            className="flex justify-end gap-2.5 pt-3 border-t"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-lg cursor-pointer text-[13px]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!form.full_name.trim() || !form.phone_number.trim() || isLoading}
              className="rounded-lg text-[13px] font-bold text-white min-w-[130px] cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              {isLoading ? "Đang xử lý..." : "Thêm khách hàng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
