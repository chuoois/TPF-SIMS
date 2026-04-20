/**
 * CustomerPanel — Right panel of CustomOrderRequirementsPage
 * Includes: Order info header, Customer search, Payment, Delivery
 */

import { useState, useRef, useMemo } from "react";
import {
  X,
  User,
  UserPlus,
  Search,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";
import { fmt, MOCK_CUSTOMERS, generateOrderCode, formatDateTime, inputBase, inputStyle } from "./mockData";

export default function CustomerPanel({
  activeTab,
  updateActiveTab,
  setShowAddCustomer,
  computedTotal,
  displayQuote,
}) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerSearchRef = useRef(null);

  const customerResults = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return MOCK_CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [customerSearch]);

  const updateDelivery = (field, value) => {
    updateActiveTab({
      deliveryInfo: { ...activeTab.deliveryInfo, [field]: value },
    });
  };

  return (
    <div className="flex flex-col w-[44%] bg-white rounded-lg overflow-hidden border border-slate-200">
      {/* Order Info Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b bg-[var(--grid-header-bg)]"
        style={{ borderColor: "var(--grid-border)" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-slate-100 text-slate-400">
            <FileText size={16} />
          </div>
          <div>
            <span className="text-[14px] font-black text-slate-800 tracking-tight">
              {generateOrderCode()}
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              {formatDateTime()}
            </p>
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-lg flex items-center gap-2 border"
          style={{
            backgroundColor: "var(--status-focus)",
            color: "var(--brand-primary)",
            borderColor: "var(--brand-primary)/20"
          }}
        >
          <Clock size={12} strokeWidth={3} className="animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider">Mới tạo</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Mode Toggle */}
        <div className="p-4 border-b border-slate-50 bg-slate-50/30">
          <div className="flex bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => updateActiveTab({ mode: "REQUIREMENT" })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-black transition-all ${activeTab.mode !== "DIRECT_ORDER" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <FileText size={16} /> Ghi nhận yêu cầu
            </button>
            <button
              onClick={() => updateActiveTab({ mode: "DIRECT_ORDER" })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-black transition-all ${activeTab.mode === "DIRECT_ORDER" ? "bg-white text-[var(--brand-primary)] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <CreditCard size={16} /> Tạo đơn ngay
            </button>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="p-5 border-b border-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                <User size={12} strokeWidth={3} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Khách hàng <span className="text-rose-500">*</span>
              </p>
            </div>

            {/* Customer Search Bar */}
            <div className="relative flex items-center gap-1.5 w-[65%]" ref={customerSearchRef}>
              {activeTab.selectedCustomer ? (
                <div className="flex items-center gap-2.5 px-3 py-2 flex-1 min-w-0 rounded-lg bg-indigo-50/50 border border-indigo-100 animate-in zoom-in-95">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-indigo-900 truncate leading-tight">
                      {activeTab.selectedCustomer.name}
                    </p>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
                      {activeTab.selectedCustomer.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      updateActiveTab({ selectedCustomer: null, customerName: "", customerPhone: "" });
                      setCustomerSearch("");
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-all cursor-pointer text-indigo-400 hover:text-rose-500 border border-transparent hover:border-rose-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className={`flex items-center gap-1.5 px-3.5 flex-1 min-w-0 rounded-lg bg-white border transition-all ${
                  showCustomerDropdown ? "ring-4 ring-indigo-500/10 border-indigo-500/30" : "border-slate-200 hover:border-slate-300"
                }`}>
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm khách hàng..."
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => { if (customerSearch.trim()) setShowCustomerDropdown(true); }}
                    onBlur={() => { setTimeout(() => setShowCustomerDropdown(false), 200); }}
                    className="flex-1 text-[13px] py-2.5 focus:outline-none bg-transparent min-w-0 font-bold"
                    style={{ color: "var(--text-main)" }}
                  />
                  <button onClick={() => setShowAddCustomer(true)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shrink-0" title="Thêm mới">
                    <UserPlus size={16} />
                  </button>
                </div>
              )}

              {/* Customer search dropdown */}
              {showCustomerDropdown && customerSearch.trim() && (
                <div className="absolute right-0 top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-[60] ring-1 ring-black/5 animate-in slide-in-from-top-2">
                  {customerResults.length > 0 ? (
                    <div className="max-h-[250px] overflow-y-auto p-1.5 custom-scrollbar">
                      {customerResults.map((c) => (
                        <button key={c.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            updateActiveTab({ selectedCustomer: c, customerName: c.name, customerPhone: c.phone });
                            setCustomerSearch("");
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-black bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {c.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-slate-700 truncate">{c.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{c.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-6 text-center">
                      <p className="text-[13px] font-bold text-slate-400">Không tìm thấy kết quả</p>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); setShowAddCustomer(true); setShowCustomerDropdown(false); }}
                        className="text-[12px] font-black mt-2 cursor-pointer text-indigo-600 hover:underline">
                        + Thêm khách mới
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên hiển thị</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" placeholder="Tên khách hàng" value={activeTab.customerName}
                  onChange={(e) => updateActiveTab({ customerName: e.target.value })}
                  className={`${inputBase} pl-10`} style={{ ...inputStyle, backgroundColor: "white" }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Liên hệ</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="tel" placeholder="Số điện thoại" value={activeTab.customerPhone}
                  onChange={(e) => updateActiveTab({ customerPhone: e.target.value })}
                  className={`${inputBase} pl-10`} style={{ ...inputStyle, backgroundColor: "white" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info Card */}
        {activeTab.mode === "DIRECT_ORDER" && (
          <div className="p-5 border-b border-slate-50 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CreditCard size={12} strokeWidth={3} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Giá trị đơn hàng & Đặt cọc
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Giá trị đơn hàng
                  {computedTotal > 0 && <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 normal-case tracking-normal">Tự động cộng dồn</span>}
                </label>
                <div className="relative">
                  <input type="text" placeholder="VD: 15,000,000"
                    value={displayQuote ? fmt(displayQuote) : ""}
                    onChange={(e) => {
                      if (computedTotal > 0) return;
                      const val = e.target.value.replace(/\D/g, "");
                      updateActiveTab({ expectedQuote: val ? Number(val) : "" });
                    }}
                    disabled={computedTotal > 0}
                    className={`${inputBase} h-12 text-[15px] font-black ${computedTotal > 0 ? "bg-slate-50/70 text-slate-800 cursor-not-allowed border-slate-100" : ""}`}
                    style={{ ...inputStyle, backgroundColor: computedTotal > 0 ? "var(--bg-main)" : "white" }} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">VND</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đặt cọc</label>
                  <div className="relative">
                    <input type="text" placeholder="VD: 5,000,000"
                      value={activeTab.deposit ? fmt(activeTab.deposit) : ""}
                      onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); updateActiveTab({ deposit: val ? Number(val) : "" }); }}
                      className={`${inputBase} font-bold`} style={{ ...inputStyle, backgroundColor: "white" }} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-300">VND</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số tiền còn lại</label>
                  <div className="relative">
                    <input type="text"
                      value={displayQuote > 0 ? (activeTab.deposit ? fmt(Math.max(0, displayQuote - activeTab.deposit)) : fmt(displayQuote)) : ""}
                      disabled placeholder={displayQuote > 0 ? "0" : "Chờ báo giá"}
                      className={`${inputBase} font-bold bg-slate-50/50 ${displayQuote > 0 ? "text-status-focus" : "text-slate-400"} cursor-not-allowed border-slate-100 placeholder:italic placeholder:font-normal`}
                      style={{ backgroundColor: "var(--bg-main)" }} />
                    {displayQuote > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-300">VND</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Info Card */}
        <div className="p-5 border-b border-slate-50 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Truck size={12} strokeWidth={3} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Giao hàng
            </p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-4 text-slate-300" />
              <textarea placeholder="Địa chỉ giao hàng chi tiết..."
                value={activeTab.deliveryInfo.address} onChange={(e) => updateDelivery("address", e.target.value)}
                className={`${inputBase} pl-10 py-3 resize-none min-h-[60px]`} style={{ ...inputStyle, backgroundColor: "white" }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input type="text" placeholder="Quận/Huyện" value={activeTab.deliveryInfo.district}
                  onChange={(e) => updateDelivery("district", e.target.value)} className={inputBase} style={{ ...inputStyle, backgroundColor: "white" }} />
              </div>
              <div className="relative">
                <input type="text" placeholder="Phường/Xã" value={activeTab.deliveryInfo.ward}
                  onChange={(e) => updateDelivery("ward", e.target.value)} className={inputBase} style={{ ...inputStyle, backgroundColor: "white" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Note Section */}
      </div>
    </div>
  );
}
