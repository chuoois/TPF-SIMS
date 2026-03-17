
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Eye,
  FileText,
  Phone,
  MapPin,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Factory,
  Mail,
  MoreVertical,
  Calendar
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===================== STATIC DATA =====================
const INITIAL_SUPPLIERS = [
  { id: "NCC001", code: "NCC-TAM", name: "Xưởng gỗ mỹ nghệ Thành Tâm", contactPerson: "Nguyễn Văn Tâm", phone: "0901234567", email: "thanhtam@wood.com", address: "Làng nghề Đồng Kỵ, Từ Sơn, Bắc Ninh", totalImport: 1250000000, debt: 350000000, group: "Xưởng nội thất mỹ nghệ", notes: ["Đối tác chiến lược khu vực phía Bắc", "Cung cấp gỗ sồi chất lượng loại 1"] },
  { id: "NCC002", code: "NCC-HAI", name: "Tổng kho gỗ nguyên liệu Nam Hải", contactPerson: "Trần Thế Hải", phone: "0912345678", email: "namhai@timber.vn", address: "Khu CN Thạch Thất, Hà Nội", totalImport: 4500000000, debt: 0, group: "Tổng kho gỗ nguyên liệu", notes: ["Chuyên gỗ lim và gỗ hương Nam Phi"] },
  { id: "NCC003", code: "NCC-PHAT", name: "Xưởng mộc nội thất Gia Phát", contactPerson: "Lê Văn Phát", phone: "0987654321", email: "giaphat@furniture.com", address: "Làng mộc Hữu Bằng, Thạch Thất, Hà Nội", totalImport: 890000000, debt: 120000000, group: "Xưởng mộc gia công", notes: [] }
];

const MOCK_IMPORT_HISTORY = [
  { id: "PN001", code: "PN-2601", date: "2024-03-01 10:00", total: 150000000, status: "Đã nhập kho" },
  { id: "PN002", code: "PN-2605", date: "2024-03-05 14:30", total: 245000000, status: "Đang về" },
  { id: "PN003", code: "PN-2612", date: "2024-03-12 09:15", total: 89000000, status: "Đã nhập kho" },
];

const MOCK_SHIPMENT_ITEMS = {
  "PN-2601": [
    { id: "I001", name: "Bộ bàn ghế Tần Thủy Hoàng (Gỗ Sồi)", quantity: 5, unitPrice: 15000000, total: 75000000 },
    { id: "I002", name: "Kệ tivi hoa hồng (Gỗ Hương)", quantity: 3, unitPrice: 25000000, total: 75000000 },
  ],
  "PN-2605": [
    { id: "I003", name: "Bộ Minh Quốc Đào (Gỗ Gụ)", quantity: 10, unitPrice: 20000000, total: 200000000 },
    { id: "I004", name: "Tranh mã đáo thành công", quantity: 5, unitPrice: 9000000, total: 45000000 },
  ],
  "PN-2612": [
    { id: "I005", name: "Tủ quần áo 4 cánh", quantity: 2, unitPrice: 30000000, total: 60000000 },
    { id: "I006", name: "Giường ngủ tân cổ điển", quantity: 1, unitPrice: 29000000, total: 29000000 },
  ]
};

const MOCK_PAYMENT_HISTORY = [
  { id: "TXP001", date: "2024-02-15 09:00", note: "Nhập lô gỗ sồi PN-2580", change: 200000000, balance: 200000000 },
  { id: "TXP002", date: "2024-02-20 15:30", note: "Chuyển khoản thanh toán đợt 1", change: -100000000, balance: 100000000 },
  { id: "TXP003", date: "2024-03-01 11:00", note: "Nhập lô gỗ hương PN-2601", change: 150000000, balance: 250000000 },
  { id: "TXP004", date: "2024-03-05 16:00", note: "Tiền mặt thanh toán đợt 2", change: -100000000, balance: 150000000 },
];

// ===================== HELPERS =====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

// ===================== SUB-COMPONENTS =====================
const ModalContainer = ({ title, onClose, children, maxWidth = "max-w-2xl" }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}>
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)" }}>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 text-gray-900">
        {children}
      </div>
    </div>
  </div>
);

const SupplierDashboardModal = ({ supplier, onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeShipment, setActiveShipment] = useState(null);

  const shipmentItems = activeShipment ? MOCK_SHIPMENT_ITEMS[activeShipment.code] || [] : [];
  const totalIncurred = MOCK_PAYMENT_HISTORY.reduce((acc, t) => (t.change > 0 ? acc + t.change : acc), 0);
  const totalPaid = Math.abs(MOCK_PAYMENT_HISTORY.reduce((acc, t) => (t.change < 0 ? acc + t.change : acc), 0));

  const tabs = [
    { id: "profile", label: "Thông tin", icon: Building2 },
    { id: "history", label: "Lịch sử nhập hàng", icon: Package },
    { id: "ledger", label: "Công nợ", icon: FileText },
  ];

  return (
    <ModalContainer
      title={
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-medium whitespace-nowrap">Nhà cung cấp:</span>
          <span className="text-red-600 font-bold whitespace-nowrap">{supplier.name}</span>
          <div className="w-px h-4 bg-gray-200 mx-2 shrink-0" />
          <span className="text-gray-400 font-medium text-[13px] whitespace-nowrap">Tổng nợ:</span>
          <span className={cn("text-[15px] font-bold", supplier.debt > 0 ? "text-red-600" : "text-green-600")}>
            {supplier.debt > 0 ? formatCurrency(supplier.debt) : "0 ₫"}
          </span>
        </div>
      }
      onClose={onClose}
      maxWidth="max-w-5xl"
    >
      <div className="flex flex-col h-full min-h-[550px]">
        {/* Navigation Tabs - Professional Style */}
        {!activeShipment && (
          <div className="flex items-center gap-1 border-b border-gray-100 mb-6 shrink-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-[13px] font-bold transition-all relative cursor-pointer ${activeTab === t.id ? "text-green-600 bg-green-50/30" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <t.icon size={16} />
                {t.label}
                {activeTab === t.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 animate-in fade-in slide-in-from-bottom-1" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && !activeShipment && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Hồ sơ chi tiết */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-7 rounded-2xl border border-gray-100 bg-white shadow-xs">
                    <div className="flex items-center gap-3 mb-6 font-sans">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h5 className="text-[14px] font-bold text-gray-900">Hồ sơ nhà cung cấp</h5>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{supplier.group || "Phân loại: Chưa xác định"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mã nhà cung cấp</p>
                        <p className="text-[13px] font-bold text-gray-900 font-mono">{supplier.code}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tên nhà cung cấp</p>
                        <p className="text-[13px] font-bold text-gray-900">{supplier.contactPerson}</p>
                      </div>
                      <div className="space-y-1 flex items-start gap-3 md:col-span-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Địa chỉ kinh doanh</p>
                          <p className="text-[13px] font-bold text-gray-800 leading-snug">{supplier.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-7 rounded-2xl border border-gray-100 bg-white shadow-xs">
                    <h5 className="text-[12px] font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      Thông tin liên hệ
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                          <p className="text-[13px] font-bold text-gray-900">{supplier.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                          <p className="text-[13px] font-bold text-gray-900">{supplier.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section in Dashboard */}
                  <div className="p-7 rounded-2xl border border-gray-100 bg-white shadow-xs">
                    <h5 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      Ghi chú nội bộ
                    </h5>
                    <div className="space-y-3">
                      {supplier.notes && supplier.notes.length > 0 ? (
                        supplier.notes.map((note, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[13px] text-gray-700 font-medium">
                            {note}
                          </div>
                        ))
                      ) : (
                        <p className="text-[13px] text-gray-400 italic">Chưa có ghi chú nào.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Tổng quan tài chính */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl border border-green-100 bg-green-50/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <FileText size={80} />
                    </div>

                    <h5 className="text-[11px] font-black text-green-500 uppercase tracking-widest mb-6 border-b border-green-100 pb-3">Tổng quan công nợ</h5>

                    <div className="space-y-5 relative z-10">
                      <div className="flex justify-between items-end">
                        <span className="text-[12px] font-medium text-gray-500">Tổng giá trị nhập:</span>
                        <span className="text-[14px] font-black text-gray-900">{formatCurrency(supplier.totalImport)}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[12px] font-medium text-gray-500">Tổng đã thanh toán:</span>
                        <span className="text-[14px] font-black text-green-600">{formatCurrency(supplier.totalImport - supplier.debt)}</span>
                      </div>

                      <div className="pt-5 border-t border-green-100 mt-2">
                        <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-1">Dư nợ hiện tại</p>
                        <p className="text-3xl font-black text-green-600 tracking-tight">{formatCurrency(supplier.debt)}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-red-50/50 flex items-center gap-2 text-[11px] text-gray-400 italic">
                      <Eye size={12} />
                      * Xem chi tiết tại tab Công nợ
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === "history" && (
            <div className="animate-in fade-in duration-300">
              {!activeShipment ? (
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#F8FAFC] border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider text-center w-[50px]">STT</th>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider">Mã lô nhập</th>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider">Ngày nhập</th>
                        <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase text-[11px] tracking-wider">Tổng tiền</th>
                        <th className="px-6 py-4 font-bold text-gray-500 text-center uppercase text-[11px] tracking-wider">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {MOCK_IMPORT_HISTORY.map((h, idx) => (
                        <tr key={h.id} className="hover:bg-red-50/20 transition-colors">
                          <td className="px-4 py-4 text-center text-[13px] font-medium text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setActiveShipment(h)}
                              className="font-black font-mono text-green-600 hover:scale-105 transition-transform cursor-pointer flex items-center gap-2 group"
                            >
                              {h.code}
                              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-medium">{h.date}</td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(h.total)}</td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-black ${h.status === "Đã nhập kho" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                }`}
                            >
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setActiveShipment(null)}
                      className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-red-600 transition group cursor-pointer"
                    >
                      <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                      Danh sách lô hàng
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Mã lô hàng</p>
                        <p className="text-[13px] font-black text-gray-900">{activeShipment.code}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Giá trị lô</p>
                        <p className="text-[15px] font-black text-green-600">{formatCurrency(activeShipment.total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#F8FAFC] border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider text-center w-[50px]">STT</th>
                          <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider">Tên mặt hàng</th>
                          <th className="px-6 py-4 font-bold text-gray-500 text-center uppercase text-[11px] tracking-wider">Số lượng</th>
                          <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase text-[11px] tracking-wider">Đơn giá nhập</th>
                          <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase text-[11px] tracking-wider">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {shipmentItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-center text-[13px] font-medium text-gray-500">{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900 underline decoration-gray-200 decoration-offset-4">{item.name}</td>
                            <td className="px-6 py-4 text-center font-bold text-gray-600">{item.quantity}</td>
                            <td className="px-6 py-4 text-right font-medium text-gray-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEDGER (Professional Accounting) */}
          {activeTab === "ledger" && !activeShipment && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-white border-2 border-gray-50 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10"> Tổng tiền nhập hàng</p>
                  <p className="text-2xl font-bold text-gray-900 relative z-10">{formatCurrency(totalIncurred)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border-2 border-gray-50 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Đã thanh toán (-)</p>
                  <p className="text-2xl font-bold text-gray-900 relative z-10">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-green-600 text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                  <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-2 relative z-10">Nợ hiện tại</p>
                  <p className="text-2xl font-bold text-white relative z-10">{formatCurrency(supplier.debt)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F8FAFC] border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-center w-[50px]">STT</th>
                      <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider whitespace-nowrap">Ngày giao dịch</th>
                      <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider">Nội dung giao dịch</th>
                      <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right whitespace-nowrap">Tổng tiền nhập hàng</th>
                      <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right whitespace-nowrap">Đã thanh toán (-)</th>
                      <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right whitespace-nowrap">Nợ hiện tại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {MOCK_PAYMENT_HISTORY.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-5 text-center text-[13px] font-medium text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-5 text-gray-500 whitespace-nowrap font-medium">{t.date}</td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-gray-800">{t.note}</p>
                          <p className="text-[11px] text-gray-400 font-bold mt-0.5">{t.id}</p>
                        </td>
                        <td className="px-6 py-5 text-right font-black">
                          {t.change > 0 ? (
                            <span className="text-red-600">{formatCurrency(t.change)}</span>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right font-black">
                          {t.change < 0 ? (
                            <span className="text-green-600">{formatCurrency(Math.abs(t.change))}</span>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right font-black text-[15px] text-gray-900">
                          {formatCurrency(t.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Audit Trail */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1.5 font-medium italic">
              <Factory size={14} className="text-gray-300" />
              Nguồn dữ liệu: TPF-SIMS Warehouse & Finance
            </p>
            <div className="w-px h-3 bg-gray-200" />
            <p>ID Đối tác: {supplier.id}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              <span className="font-bold">Ghi nợ đầu vào</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span className="font-bold">Chi trả đối tác</span>
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

const SupplierActionModal = ({ supplier, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(
    supplier || {
      id: `NCC${Date.now()}`,
      code: "NCC-NEW",
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      group: "",
      totalImport: 0,
      debt: 0,
      notes: [],
    }
  );

  const [newNote, setNewNote] = useState("");
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setFormData((prev) => ({
      ...prev,
      notes: [...(prev.notes || []), newNote.trim()],
    }));
    setNewNote("");
  };

  const handleStartEditNote = (index) => {
    setEditingNoteIndex(index);
    setEditingNoteText(formData.notes[index]);
  };

  const handleSaveEditNote = () => {
    if (!editingNoteText.trim()) return;
    const updatedNotes = [...formData.notes];
    updatedNotes[editingNoteIndex] = editingNoteText.trim();
    setFormData((prev) => ({ ...prev, notes: updatedNotes }));
    setEditingNoteIndex(null);
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = formData.notes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, notes: updatedNotes }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalContainer
      title={supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Mã nhà cung cấp</label>
            <input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="NCC-XXX"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-mono text-[13px] font-bold"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Tên nhà cung cấp</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên xưởng, tổng kho..."
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px] font-bold"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Người liên hệ</label>
            <input
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Tên đại diện kinh doanh"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px] font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Nhóm nhà cung cấp</label>
            <select
              name="group"
              value={formData.group}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px] font-medium appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat"
            >
              <option value="">-- Chọn nhóm --</option>
              <option value="Xưởng mộc gia công">Xưởng mộc gia công</option>
              <option value="Tổng kho gỗ nguyên liệu">Tổng kho gỗ nguyên liệu</option>
              <option value="Xưởng nội thất mỹ nghệ">Xưởng nội thất mỹ nghệ</option>
              <option value="Cửa hàng kim khí">Cửa hàng kim khí</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Số điện thoại</label>
            <div className="relative">
              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09xx xxx xxx"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px] font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px] font-medium"
              />
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Địa chỉ</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-3.5 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Địa chỉ cụ thể của xưởng/kho..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px] font-medium resize-none"
              />
            </div>
          </div>
        </div>

        {/* Note Management Section */}
        <div className="border-t pt-6 space-y-4">
          <h5 className="text-[12px] font-bold text-gray-900 flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            Quản lý ghi chú nội bộ
          </h5>

          <div className="flex gap-2">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Thêm ghi chú mới về nhà cung cấp này..."
              className="flex-1 h-10 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none text-[13px]"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNote())}
            />
            <Button
              type="button"
              onClick={handleAddNote}
              className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus size={16} /> Thêm
            </Button>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {formData.notes && formData.notes.length > 0 ? (
              formData.notes.map((note, index) => (
                <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-all">
                  {editingNoteIndex === index ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="flex-1 h-8 px-2 rounded border focus:outline-none text-[13px]"
                        autoFocus
                      />
                      <button onClick={handleSaveEditNote} className="text-green-600 font-bold text-[12px]">Lưu</button>
                      <button onClick={() => setEditingNoteIndex(null)} className="text-gray-400 font-bold text-[12px]">Hủy</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[13px] text-gray-700 font-medium">{note}</p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEditNote(index)}
                          className="p-1 hover:text-blue-600 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(index)}
                          className="p-1 hover:text-red-600 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 text-[12px] italic border-2 border-dashed border-gray-100 rounded-xl">
                Chưa có ghi chú nào về đối tác này
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          {supplier ? (
            <button
              type="button"
              onClick={() => onDelete(supplier.id)}
              className="px-6 py-2.5 text-red-600 font-bold text-[13px] hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              Xoá nhà cung cấp
            </button>
          ) : <div />}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-500 font-bold text-[13px] hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-green-600 text-white font-bold text-[13px] rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition cursor-pointer"
            >
              {supplier ? "Cập nhật thông tin" : "Tạo mới nhà cung cấp"}
            </button>
          </div>
        </div>
      </form>
    </ModalContainer>
  );
};


// ===================== MAIN COMPONENT =====================
export default function OwnerSuppliers() {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";

  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modals state
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [modalType, setModalType] = useState(null); // 'dashboard' | 'action'

  // Filter & Search
  const filtered = useMemo(() => {
    let result = suppliers;

    // Tab filter
    if (currentTab === "debt") {
      result = result.filter((s) => s.debt > 0);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.phone || "").includes(q) ||
          (s.code || "").toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      // Supposing we have a timestamp for supplier creation/joining
      result = result.filter((s) => !s.joinDate || new Date(s.joinDate) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((s) => !s.joinDate || new Date(s.joinDate) <= to);
    }

    return result;
  }, [suppliers, searchTerm, dateFrom, dateTo, currentTab]);

  const hasActiveFilters = !!(searchTerm || dateFrom || dateTo);

  const clearAllFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedSuppliers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaveSupplier = (data) => {
    if (selectedSupplier) {
      setSuppliers(suppliers.map(s => s.id === data.id ? data : s));
    } else {
      setSuppliers([...suppliers, data]);
    }
    closeModal();
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá nhà cung cấp này?")) {
      setSuppliers(suppliers.filter(s => s.id !== id));
      closeModal();
    }
  };

  const openModal = (supplier, type) => {
    setSelectedSupplier(supplier);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedSupplier(null);
    setModalType(null);
  };

  return (
    <>
      <PageHelmet title="Quản lý nhà cung cấp - Chủ cửa hàng | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-1">
          <div>
            <h1
              className="text-[22px] font-bold flex items-center gap-2.5"
              style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}
            >
              <Factory size={24} style={{ color: "var(--brand-primary)" }} />
              Quản lý nhà cung cấp
            </h1>
            <p
              className="text-[13px] mt-1 font-medium italic"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filtered.length} nguồn hàng đối tác đang hợp tác
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => openModal(null, "action")}
              className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-green-100 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={18} />
              Thêm nhà cung cấp
            </Button>
          </div>
        </div>



        {/* Main Content Card */}
        <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)" }}>
          {/* Search Header */}
          <div
            className="px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Tìm mã NCC, tên nhà cung cấp, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 pl-9 pr-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                    style={{
                      borderColor: dateFrom
                        ? "var(--brand-primary)"
                        : "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-bold">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                  style={{
                    borderColor: dateTo
                      ? "var(--brand-primary)"
                      : "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  <th
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-16"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    STT
                  </th>
                  <th
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Mã NCC
                  </th>
                  <th
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Nhà cung cấp
                  </th>
                  <th
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Thông tin liên hệ
                  </th>
                  <th
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSuppliers.map((s, idx) => {
                  return (
                    <tr
                      key={s.id}
                      className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                    >
                      <td className="px-4 py-3" style={{ color: "var(--text-placeholder)" }}>
                        <p className="text-[13px] font-bold">{(currentPage - 1) * itemsPerPage + idx + 1}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-bold font-mono"
                          style={{ color: "var(--text-main)" }}
                        >
                          {s.code}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {s.name}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          <Building2 size={12} className="inline mr-1" />{s.group}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px]"
                          style={{ color: "var(--text-main)" }}
                        >
                          {s.phone}
                        </p>
                        <p
                          className="text-[11px] truncate max-w-[180px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {s.address}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] text-gray-500 truncate max-w-[200px]" title={s.notes && s.notes.length > 0 ? s.notes[s.notes.length - 1] : ""}>
                          {s.notes && s.notes.length > 0 ? s.notes[s.notes.length - 1] : <span className="text-gray-300 italic">—</span>}
                        </p>
                      </td>

                      {/* Hover Actions */}
                      <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                        <button
                          onClick={() => openModal(s, "dashboard")}
                          className="h-8 px-3 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center gap-1.5 text-[12px] font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer"
                        >
                          <Eye size={14} /> Hồ sơ
                        </button>
                        <button
                          onClick={() => openModal(s, "action")}
                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-green-600 hover:border-green-200 transition cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedSuppliers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-24 text-center">
                      <div
                        className="flex flex-col items-center gap-2"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-main)" }}
                        >
                          <Factory size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm
                            ? `Không tìm thấy nhà cung cấp "${searchTerm}"`
                            : "Chưa có nhà cung cấp nào"}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-[13px] font-medium cursor-pointer"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-3 border-t shrink-0"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--bg-main)",
              }}
            >
              <div
                className="text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Tổng số bản ghi:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {filtered.length}
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Items per page indicator */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Số bản ghi/trang
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to page 1 when changing items per page
                    }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none"
                    style={{
                      borderColor: "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {[15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range Info */}
                <div
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  bản ghi
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalType === "dashboard" && selectedSupplier && (
        <SupplierDashboardModal supplier={selectedSupplier} onClose={closeModal} />
      )}
      {modalType === "action" && (
        <SupplierActionModal
          supplier={selectedSupplier}
          onClose={closeModal}
          onSave={handleSaveSupplier}
          onDelete={handleDeleteSupplier}
        />
      )}
    </>
  );
}
