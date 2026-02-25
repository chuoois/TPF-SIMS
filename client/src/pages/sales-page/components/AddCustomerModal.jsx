/**
 * Component AddCustomerModal
 * Modal thêm khách hàng nhanh – dùng chung cho các trang bán hàng
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState } from "react";
import { X, User, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { salesService } from "@/services/sales.service";
import toast from "react-hot-toast";

const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

const CUSTOMER_TYPES = [
  { value: "Cá nhân", label: "Cá nhân" },
  { value: "Doanh nghiệp", label: "Doanh nghiệp" },
];

const INITIAL_FORM = {
  full_name: "",
  phone_number: "",
  email: "",
  address: "",
  gender: "",
  dob: "",
  customer_type: "Cá nhân",
  note: "",
};

export default function AddCustomerModal({ isOpen, onClose, onCustomerAdded }) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }

    try {
      setLoading(true);
      const res = await salesService.createCustomer({
        fullName: form.full_name.trim(),
        phoneNumber: form.phone_number.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        gender: form.gender || null,
        dob: form.dob || null,
        customerType: form.customer_type || null,
        note: form.note.trim() || null,
      });

      const customer = res.data?.customer || res.customer || res.data || res;

      toast.success(
        `Đã thêm khách hàng "${customer.full_name || form.full_name}" thành công!`,
      );

      // Trả về khách hàng vừa tạo
      if (onCustomerAdded) {
        onCustomerAdded(customer);
      }

      // Reset & đóng
      setForm({ ...INITIAL_FORM });
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Không thể thêm khách hàng. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ ...INITIAL_FORM });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <User size={18} />
            <h2 className="text-base font-bold">Thêm khách hàng mới</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tên + Loại KH */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Họ và tên *
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Nhập họ tên khách hàng"
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Loại KH
              </label>
              <select
                value={form.customer_type}
                onChange={(e) => updateField("customer_type", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring bg-white appearance-none"
              >
                {CUSTOMER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SĐT + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  placeholder="0xxx xxx xxx"
                  value={form.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Giới tính + Ngày sinh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Giới tính
              </label>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => updateField("gender", g.value)}
                    className={`flex-1 text-sm rounded-lg py-2 border transition font-medium ${
                      form.gender === g.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Ngày sinh
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Địa chỉ
            </label>
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring placeholder-gray-400"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Ghi chú
            </label>
            <textarea
              placeholder="Ghi chú về khách hàng..."
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.full_name.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[120px]"
            >
              {loading ? "Đang lưu..." : "Thêm khách hàng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
