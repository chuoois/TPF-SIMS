import { useState, useEffect } from "react";
import { X, Paintbrush, Plus } from "lucide-react";

const formatNumber = (num) => {
  if (!num) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

const parseNumber = (str) => {
  if (!str) return "";
  return str.toString().replace(/\D/g, "");
};

export default function AddProductModal({ isOpen, onClose, employee, onAdd }) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");

  useEffect(() => {
    if (isOpen) {
      setProductName("");
      setPrice("");
      setQty("1");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedPrice = Number(price) || 0;
    const parsedQty = Math.max(1, Number(qty) || 1);
    if (!productName.trim() || parsedPrice <= 0) return;
    onAdd({
      productName: productName.trim(),
      price: parsedPrice,
      qty: parsedQty,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition"
          >
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex items-center gap-2">
            <Paintbrush size={18} className="text-green-600" />
            <h2 className="text-[16px] font-black" style={{ color: "var(--text-main)" }}>
              Cộng sản phẩm sơn
            </h2>
          </div>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Thêm sản phẩm vào bảng lương của <span className="font-bold">{employee?.name}</span>
          </p>
        </div>

        {/* Form */}
        <form id="add-product-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              autoFocus
              className="w-full h-10 px-3 rounded-xl border text-[13px] focus:outline-none focus:ring-2 transition bg-gray-50/50"
              placeholder="Ví dụ: Tủ gỗ sồi, Ghế gỗ teak..."
              style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
            />
          </div>

          {/* Price + Qty in grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                Đơn giá / sản phẩm (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formatNumber(price)}
                onChange={(e) => setPrice(parseNumber(e.target.value))}
                required
                className="w-full h-10 px-3 rounded-xl border text-[13px] focus:outline-none focus:ring-2 transition bg-gray-50/50 outline-none"
                placeholder="Ví dụ: 150.000"
                style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                Số lượng
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border text-[13px] focus:outline-none focus:ring-2 transition bg-gray-50/50 outline-none"
                placeholder="1"
                style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
              />
            </div>
          </div>

          {/* Preview */}
          {price && Number(price) > 0 && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
              <span className="text-[12px] text-green-700 font-medium">
                {Number(qty) || 1} SP × {new Intl.NumberFormat("vi-VN").format(Number(price))}₫
              </span>
              <span className="text-[14px] font-black text-green-700">
                = {new Intl.NumberFormat("vi-VN").format((Number(price) || 0) * (Number(qty) || 1))}₫
              </span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
            style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
          >
            Hủy
          </button>
          <button
            form="add-product-form"
            type="submit"
            className="h-10 px-5 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition flex items-center gap-1.5"
            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Cộng vào lương
          </button>
        </div>
      </div>
    </div>
  );
}
