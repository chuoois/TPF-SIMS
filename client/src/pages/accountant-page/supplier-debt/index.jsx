import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  FileText,
  Phone,
  MapPin,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Factory,
  Mail,
  Calendar,
  Truck,
  BadgeDollarSign,
  CheckCircle2,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { cn } from "@/lib/utils";

// ===================== STATIC DATA =====================
const INITIAL_SUPPLIERS = [
  {
    id: "NCC001",
    code: "NCC-TAM",
    name: "Xưởng gỗ mỹ nghệ Thành Tâm",
    contactPerson: "Nguyễn Văn Tâm",
    phone: "0901234567",
    email: "thanhtam@wood.com",
    address: "Làng nghề Đồng Kỵ, Từ Sơn, Bắc Ninh",
    totalImport: 1250000000,
    debt: 350000000,
    group: "Xưởng nội thất mỹ nghệ",
    notes: ["Đối tác chiến lược khu vực phía Bắc", "Cung cấp gỗ sồi chất lượng loại 1"],
  },
  {
    id: "NCC002",
    code: "NCC-HAI",
    name: "Tổng kho gỗ nguyên liệu Nam Hải",
    contactPerson: "Trần Thế Hải",
    phone: "0912345678",
    email: "namhai@timber.vn",
    address: "Khu CN Thạch Thất, Hà Nội",
    totalImport: 4500000000,
    debt: 0,
    group: "Tổng kho gỗ nguyên liệu",
    notes: ["Chuyên gỗ lim và gỗ hương Nam Phi"],
  },
  {
    id: "NCC003",
    code: "NCC-PHAT",
    name: "Xưởng mộc nội thất Gia Phát",
    contactPerson: "Lê Văn Phát",
    phone: "0987654321",
    email: "giaphat@furniture.com",
    address: "Làng mộc Hữu Bằng, Thạch Thất, Hà Nội",
    totalImport: 890000000,
    debt: 120000000,
    group: "Xưởng mộc gia công",
    notes: [],
  },
  {
    id: "NCC004",
    code: "NCC-MINH",
    name: "Cơ sở sản xuất gỗ Minh Long",
    contactPerson: "Hoàng Minh Long",
    phone: "0923456789",
    email: "minhlong@gom.vn",
    address: "KCN Phú Nghĩa, Chương Mỹ, Hà Nội",
    totalImport: 620000000,
    debt: 80000000,
    group: "Xưởng mộc gia công",
    notes: ["Chuyên gỗ óc chó nhập khẩu"],
  },
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
  ],
};

const buildLedger = (debt) => [
  { id: "TXP001", date: "2024-02-15 09:00", note: "Nhập lô gỗ sồi PN-2580", change: 200000000, balance: 200000000 },
  { id: "TXP002", date: "2024-02-20 15:30", note: "Chuyển khoản thanh toán đợt 1", change: -100000000, balance: 100000000 },
  { id: "TXP003", date: "2024-03-01 11:00", note: "Nhập lô gỗ hương PN-2601", change: 150000000, balance: 250000000 },
  { id: "TXP004", date: "2024-03-05 16:00", note: "Tiền mặt thanh toán đợt 2", change: -100000000, balance: debt },
];

// ===================== HELPERS =====================
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

// ===================== MODAL CONTAINER =====================
const ModalContainer = ({ title, onClose, children, maxWidth = "max-w-2xl" }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}>
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)" }}>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 text-gray-900">{children}</div>
    </div>
  </div>
);

// ===================== PAYMENT MODAL =====================
const PaymentModal = ({ supplier, onClose, onConfirm }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(amount.replace(/\D/g, ""), 10);
    if (!num || num <= 0) return;
    onConfirm({ amount: num, note: note.trim() || "Thanh toán nợ nhà cung cấp" });
  };

  const formatted = amount
    ? parseInt(amount.replace(/\D/g, ""), 10).toLocaleString("vi-VN")
    : "";

  return (
    <ModalContainer title="Ghi nhận thanh toán" onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Dư nợ hiện tại</p>
          <p className="text-2xl font-black text-amber-600">{formatCurrency(supplier.debt)}</p>
          <p className="text-[12px] text-gray-500 font-medium">{supplier.name}</p>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Số tiền thanh toán (VNĐ)</label>
          <input
            autoFocus
            type="text"
            value={formatted}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[15px] font-bold text-right"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Nội dung</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vd: Chuyển khoản đợt 3..."
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold text-[13px] hover:bg-gray-100 rounded-xl transition cursor-pointer">
            Hủy
          </button>
          <button type="submit" className="px-6 py-2.5 bg-green-600 text-white font-bold text-[13px] rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition cursor-pointer flex items-center gap-2">
            <CheckCircle2 size={16} />
            Xác nhận thanh toán
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

// ===================== SUPPLIER DASHBOARD MODAL =====================
const SupplierDashboardModal = ({ supplier, onClose, onPayment }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeShipment, setActiveShipment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const ledger = buildLedger(supplier.debt);
  const shipmentItems = activeShipment ? MOCK_SHIPMENT_ITEMS[activeShipment.code] || [] : [];
  const totalIncurred = ledger.reduce((acc, t) => (t.change > 0 ? acc + t.change : acc), 0);
  const totalPaid = Math.abs(ledger.reduce((acc, t) => (t.change < 0 ? acc + t.change : acc), 0));

  const tabs = [
    { id: "profile", label: "Thông tin", icon: Building2 },
    { id: "history", label: "Lịch sử nhập hàng", icon: Package },
    { id: "ledger", label: "Sổ công nợ", icon: FileText },
  ];

  const handleConfirmPayment = ({ amount, note }) => {
    onPayment(supplier.id, amount, note);
    setShowPaymentModal(false);
  };

  return (
    <>
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
          {!activeShipment && (
            <div className="flex items-center gap-1 border-b border-gray-100 mb-6 shrink-0">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 text-[13px] font-bold transition-all relative cursor-pointer ${
                    activeTab === t.id ? "text-green-600 bg-green-50/30" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
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
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-7 rounded-2xl border border-gray-100 bg-white shadow-xs">
                      <div className="flex items-center gap-3 mb-6">
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
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Người liên hệ</p>
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

                    {supplier.notes && supplier.notes.length > 0 && (
                      <div className="p-7 rounded-2xl border border-gray-100 bg-white shadow-xs">
                        <h5 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          Ghi chú nội bộ
                        </h5>
                        <div className="space-y-3">
                          {supplier.notes.map((note, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[13px] text-gray-700 font-medium">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Financial overview */}
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
                          <p className={cn("text-3xl font-black tracking-tight", supplier.debt > 0 ? "text-red-500" : "text-green-600")}>
                            {formatCurrency(supplier.debt)}
                          </p>
                        </div>
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
                      <tbody className="divide-y divide-gray-100">
                        {MOCK_IMPORT_HISTORY.map((h, idx) => (
                          <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
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
                              <span className={`px-3 py-1 rounded-full text-[11px] font-black ${h.status === "Đã nhập kho" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
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
                      <button onClick={() => setActiveShipment(null)} className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-red-600 transition group cursor-pointer">
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
                              <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
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

            {/* TAB 3: LEDGER */}
            {activeTab === "ledger" && !activeShipment && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-white border-2 border-gray-50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Tổng tiền nhập hàng</p>
                    <p className="text-2xl font-bold text-gray-900 relative z-10">{formatCurrency(totalIncurred)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border-2 border-gray-50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Đã thanh toán (−)</p>
                    <p className="text-2xl font-bold text-gray-900 relative z-10">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-green-600 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-2 relative z-10">Nợ hiện tại</p>
                    <p className="text-2xl font-bold text-white relative z-10">{formatCurrency(supplier.debt)}</p>
                  </div>
                </div>

                {/* Payment button */}
                {supplier.debt > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="h-10 px-5 bg-green-600 hover:bg-green-700 text-white font-bold text-[13px] rounded-xl flex items-center gap-2 shadow-lg shadow-green-100 transition cursor-pointer"
                    >
                      <BadgeDollarSign size={16} />
                      Ghi nhận thanh toán
                    </button>
                  </div>
                )}

                {/* Ledger table */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#F8FAFC] border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-center w-[50px]">STT</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider whitespace-nowrap">Ngày giao dịch</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider">Nội dung giao dịch</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right whitespace-nowrap">Tiền nhập hàng</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right whitespace-nowrap">Đã thanh toán (−)</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right whitespace-nowrap">Dư nợ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ledger.map((t, idx) => (
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
                          <td className="px-6 py-5 text-right font-black text-[15px] text-gray-900">{formatCurrency(t.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-6 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" /><span className="font-bold">Ghi nợ đầu vào</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /><span className="font-bold">Chi trả đối tác</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-400 shrink-0">
            <Factory size={14} className="text-gray-300" />
            <p className="font-medium italic">Nguồn dữ liệu: TPF-SIMS Warehouse & Finance</p>
            <div className="w-px h-3 bg-gray-200" />
            <p>ID Đối tác: {supplier.id}</p>
          </div>
        </div>
      </ModalContainer>

      {showPaymentModal && (
        <PaymentModal
          supplier={supplier}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
};

// ===================== MAIN COMPONENT =====================
export default function AccountantSupplierDebt() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const filtered = useMemo(() => {
    let result = suppliers;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.phone || "").includes(q) ||
          (s.code || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [suppliers, searchTerm]);

  const hasActiveFilters = !!(searchTerm || dateFrom || dateTo);
  const clearAllFilters = () => { setSearchTerm(""); setDateFrom(""); setDateTo(""); setCurrentPage(1); };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePayment = (supplierId, amount, note) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId
          ? { ...s, debt: Math.max(0, s.debt - amount) }
          : s
      )
    );
    // Reflect update in selected supplier
    setSelectedSupplier((prev) =>
      prev && prev.id === supplierId ? { ...prev, debt: Math.max(0, prev.debt - amount) } : prev
    );
  };

  return (
    <>
      <PageHelmet title="Công nợ thu mua | Kế toán – TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-1">
          <div>
            <h1 className="text-[22px] font-bold flex items-center gap-2.5" style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}>
              <Truck size={24} style={{ color: "var(--brand-primary)" }} />
              Công nợ thu mua
            </h1>
            <p className="text-[13px] mt-1 font-medium italic" style={{ color: "var(--text-placeholder)" }}>
              {filtered.length} nhà cung cấp · {suppliers.filter((s) => s.debt > 0).length} đang có công nợ
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Tổng dư nợ</p>
              <p className="text-[15px] font-black text-red-600">
                {formatCurrency(suppliers.reduce((s, x) => s + x.debt, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)" }}>
          {/* Toolbar */}
          <div className="px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                <input
                  type="text"
                  placeholder="Tìm mã NCC, tên nhà cung cấp, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 pl-9 pr-3 rounded-lg text-[13px] border focus:outline-none shadow-xs" style={{ borderColor: dateFrom ? "var(--brand-primary)" : "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" }} />
                </div>
                <span className="text-gray-400 text-xs font-bold">~</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none shadow-xs" style={{ borderColor: dateTo ? "var(--brand-primary)" : "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" }} />
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="h-9 px-3 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer">
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {["STT", "Mã NCC", "Nhà cung cấp", "Thông tin liên hệ", "Nhóm", "Công nợ"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                    style={{ borderBottom: "1px solid var(--grid-border)" }}
                  >
                    <td className="px-4 py-3 text-[13px] font-bold" style={{ color: "var(--text-placeholder)" }}>
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold font-mono" style={{ color: "var(--text-main)" }}>{s.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{s.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{s.contactPerson}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px]" style={{ color: "var(--text-main)" }}>{s.phone}</p>
                      <p className="text-[11px] truncate max-w-[180px]" style={{ color: "var(--text-placeholder)" }}>{s.address}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">{s.group}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.debt > 0 ? (
                        <span className="text-[14px] font-black text-red-600">{formatCurrency(s.debt)}</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">Đã tất toán</span>
                      )}
                    </td>

                    {/* Hover action */}
                    <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        className="h-8 px-3 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center gap-1.5 text-[12px] font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer"
                      >
                        <Eye size={14} /> Hồ sơ
                      </button>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                          <Truck size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm ? `Không tìm thấy nhà cung cấp "${searchTerm}"` : "Chưa có dữ liệu"}
                        </p>
                        {searchTerm && (
                          <button onClick={() => setSearchTerm("")} className="text-[13px] font-medium cursor-pointer" style={{ color: "var(--brand-primary)" }}>
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

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t shrink-0" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
              <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                Tổng số bản ghi: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filtered.length}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Số bản ghi/trang</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none appearance-none"
                    style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                  >
                    {[15, 30, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-bold" style={{ color: "var(--text-main)" }}>
                    {(currentPage - 1) * itemsPerPage + 1} – {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}bản ghi
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 rounded p-1 cursor-pointer" style={{ color: "var(--text-main)" }}>
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 rounded p-1 cursor-pointer" style={{ color: "var(--text-main)" }}>
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Modal */}
      {selectedSupplier && (
        <SupplierDashboardModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onPayment={handlePayment}
        />
      )}
    </>
  );
}
