import { useState, useMemo, useCallback, useEffect } from "react";
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
  Camera,
  Plus,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

// ===================== API SERVICES & HOOKS =====================
import supplierDebtService from "@/services/supplierDebt.service";
import importService from "@/services/import.service";
import { uploadImage } from "@/services/cloudinary.service";
import useCachedFetch from "@/hooks/useCachedFetch";

// ===================== HELPERS =====================
const formatCurrency = (amount) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return dateStr;
  }
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
};

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
const PaymentModal = ({ supplier, onClose, onConfirm, isSubmitting }) => {
  const [amount, setAmount] = useState("");
  const [billPhoto, setBillPhoto] = useState(null);
  const [billFile, setBillFile] = useState(null);
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(amount.replace(/\D/g, ""), 10);
    if (!num || num <= 0) {
      toast.error("Vui lòng nhập số tiền thanh toán hợp lệ!");
      return;
    }
    if (!billFile) {
      toast.error("Vui lòng đính kèm ảnh Bill bằng chứng thanh toán!");
      return;
    }
    onConfirm({ amount: num, note: note.trim() || "Thanh toán nợ nhà cung cấp", billFile });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillFile(file);
      setBillPhoto(URL.createObjectURL(file));
    }
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
            disabled={isSubmitting}
          />
        </div>

        {/* Upload Bill */}
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Camera size={14} /> Ảnh Bill/Chuyển khoản (Bắt buộc)
          </label>
          {!billPhoto ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition border-gray-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                <Plus size={24} className="mb-2" />
                <p className="text-[11px] font-medium">Chọn ảnh chụp màn hình bill</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
            </label>
          ) : (
            <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={billPhoto} alt="Bill Preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setBillFile(null);
                  setBillPhoto(null);
                }}
                disabled={isSubmitting}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition shadow-lg backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Nội dung</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vd: Chuyển khoản đợt 3..."
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-[13px]"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-gray-500 font-bold text-[13px] hover:bg-gray-100 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-green-600 text-white font-bold text-[13px] rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

// ===================== SUPPLIER DASHBOARD MODAL =====================
const SupplierDashboardModal = ({ supplier, onClose, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeShipment, setActiveShipment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFullBill, setShowFullBill] = useState(null);

  // Dynamic state loaded from real API
  const [ledger, setLedger] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchLedger = useCallback(async () => {
    if (!supplier?.id) return;
    setIsLoadingDetails(true);
    try {
      const res = await supplierDebtService.getSupplierLedger(supplier.id);
      setLedger(res.ledger || []);
      setImportHistory(res.importHistory || []);
    } catch (err) {
      console.error("Fetch ledger error:", err);
      toast.error("Không thể tải thông tin sổ công nợ nhà cung cấp!");
    } finally {
      setIsLoadingDetails(false);
    }
  }, [supplier?.id]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Derived metrics from real ledger
  const totalIncurred = useMemo(() => {
    return ledger.reduce((acc, t) => (t.change > 0 ? acc + t.change : acc), 0);
  }, [ledger]);

  const totalPaid = useMemo(() => {
    return Math.abs(ledger.reduce((acc, t) => (t.change < 0 ? acc + t.change : acc), 0));
  }, [ledger]);

  const currentDebt = useMemo(() => {
    if (ledger.length === 0) return supplier.debt;
    return Math.max(0, totalIncurred - totalPaid);
  }, [ledger, totalIncurred, totalPaid, supplier.debt]);

  // Handle active shipment details drilldown dynamically
  const [activeShipmentDetails, setActiveShipmentDetails] = useState(null);
  const [isLoadingShipment, setIsLoadingShipment] = useState(false);

  useEffect(() => {
    if (activeShipment?.id) {
      setIsLoadingShipment(true);
      importService.getImportReceiptDetail(activeShipment.id)
        .then(res => {
          setActiveShipmentDetails(res);
        })
        .catch(err => {
          console.error("Get shipment detail error:", err);
          toast.error("Không thể tải chi tiết sản phẩm lô hàng!");
        })
        .finally(() => {
          setIsLoadingShipment(false);
        });
    } else {
      setActiveShipmentDetails(null);
    }
  }, [activeShipment?.id]);

  const handleConfirmPayment = async ({ amount, note, billFile }) => {
    setIsSubmittingPayment(true);
    const loadingToast = toast.loading("Đang ghi nhận thanh toán công nợ...");
    try {
      let uploadedImageUrl = null;
      if (billFile) {
        const uploadRes = await uploadImage(billFile);
        uploadedImageUrl = uploadRes.url;
      }

      await supplierDebtService.addPayment(supplier.id, {
        amount,
        method: "Chuyển khoản",
        note: note || "Thanh toán công nợ nhà cung cấp",
        bill_image: uploadedImageUrl
      });

      toast.success("Đã ghi nhận thanh toán thành công!", { id: loadingToast });
      setShowPaymentModal(false);
      
      // Reload ledger and update parent list
      await fetchLedger();
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi ghi nhận thanh toán", { id: loadingToast });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Thông tin", icon: Building2 },
    { id: "history", label: "Lịch sử nhập hàng", icon: Package },
    { id: "ledger", label: "Sổ công nợ", icon: FileText },
  ];

  return (
    <>
      <ModalContainer
        title={
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-medium whitespace-nowrap">Nhà cung cấp:</span>
            <span className="text-red-600 font-bold whitespace-nowrap">{supplier.name}</span>
            <div className="w-px h-4 bg-gray-200 mx-2 shrink-0" />
            <span className="text-gray-400 font-medium text-[13px] whitespace-nowrap">Tổng nợ:</span>
            <span className={cn("text-[15px] font-bold", currentDebt > 0 ? "text-red-600" : "text-green-600")}>
              {currentDebt > 0 ? formatCurrency(currentDebt) : "0 ₫"}
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
            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
                <p className="text-sm font-medium">Đang tải chi tiết dữ liệu công nợ nhà cung cấp...</p>
              </div>
            ) : (
              <>
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
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{supplier.group || "Phân loại: Xưởng liên kết"}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mã nhà cung cấp</p>
                              <p className="text-[13px] font-bold text-gray-900 font-mono">{supplier.code}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Người liên hệ</p>
                              <p className="text-[13px] font-bold text-gray-900">{supplier.contactPerson || "—"}</p>
                            </div>
                            <div className="space-y-1 flex items-start gap-3 md:col-span-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
                              <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Địa chỉ kinh doanh</p>
                                <p className="text-[13px] font-bold text-gray-800 leading-snug">{supplier.address || "Chưa cập nhật địa chỉ"}</p>
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
                                <p className="text-[13px] font-bold text-gray-900">{supplier.phone || "—"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                                <Mail size={18} />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                                <p className="text-[13px] font-bold text-gray-900">{supplier.email || "—"}</p>
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
                              <span className="text-[14px] font-black text-gray-900">{formatCurrency(totalIncurred)}</span>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="text-[12px] font-medium text-gray-500">Tổng đã thanh toán:</span>
                              <span className="text-[14px] font-black text-green-600">{formatCurrency(totalPaid)}</span>
                            </div>
                            <div className="pt-5 border-t border-green-100 mt-2">
                              <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-1">Dư nợ hiện tại</p>
                              <p className={cn("text-3xl font-black tracking-tight", currentDebt > 0 ? "text-red-500" : "text-green-600")}>
                                {formatCurrency(currentDebt)}
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
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {importHistory.map((h, idx) => (
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
                                <td className="px-6 py-4 text-gray-500 font-medium">{formatDateOnly(h.date)}</td>
                                <td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(h.total)}</td>
                              </tr>
                            ))}
                            {importHistory.length === 0 && (
                              <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">Chưa có lịch sử nhập hàng nào từ nhà cung cấp này.</td>
                              </tr>
                            )}
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

                        {isLoadingShipment ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent" />
                            <p className="text-xs font-medium">Đang tải chi tiết sản phẩm...</p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white animate-in fade-in">
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
                                {(activeShipmentDetails?.lines || []).map((item, idx) => (
                                  <tr key={item.productId || idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-center text-[13px] font-medium text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        {item.productImg && (
                                          <img src={item.productImg} alt="Product" className="w-8 h-8 rounded object-cover border border-gray-100 flex-shrink-0" />
                                        )}
                                        <div>
                                          <p className="font-bold text-gray-900">{item.productName}</p>
                                          {item.productCode && (
                                            <p className="text-[10px] text-gray-400 font-mono">{item.productCode}</p>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-600">{item.qty}</td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-600">{formatCurrency(item.importPrice)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(item.qty * item.importPrice)}</td>
                                  </tr>
                                ))}
                                {(!activeShipmentDetails?.lines || activeShipmentDetails.lines.length === 0) && (
                                  <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">Lô hàng trống hoặc không có thông tin chi tiết mặt hàng.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
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
                        <p className="text-2xl font-bold text-white relative z-10">{formatCurrency(currentDebt)}</p>
                      </div>
                    </div>

                    {/* Payment button */}
                    {currentDebt > 0 && (
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
                              <td className="px-6 py-5 text-gray-500 whitespace-nowrap font-medium">{formatDateTime(t.date)}</td>
                              <td className="px-6 py-5">
                                <div className="flex items-start gap-3">
                                  {t.bill_img && (
                                    <div
                                      className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 cursor-pointer overflow-hidden border border-gray-100 hover:scale-110 transition-transform shadow-xs"
                                      onClick={() => setShowFullBill(t.bill_img)}
                                    >
                                      <img src={t.bill_img} alt="Bill" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-800">{t.note}</p>
                                    <p className="text-[11px] text-gray-400 font-bold mt-0.5">{t.id}</p>
                                  </div>
                                </div>
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
                          {ledger.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">Chưa có giao dịch công nợ nào được ghi nhận.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Full Bill Preview */}
                    {showFullBill && (
                      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowFullBill(null)}>
                        <div className="relative max-w-2xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setShowFullBill(null)} className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300">
                            <X size={24} />
                          </button>
                          <img src={showFullBill} alt="Bill Full" className="max-w-full max-h-full rounded-lg object-contain" />
                        </div>
                      </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-6 text-[11px] text-gray-400">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" /><span className="font-bold">Ghi nợ đầu vào (Nhập hàng)</span></div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /><span className="font-bold">Chi trả đối tác (Cọc / Thanh toán)</span></div>
                    </div>
                  </div>
                )}
              </>
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
          supplier={{ ...supplier, debt: currentDebt }}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleConfirmPayment}
          isSubmitting={isSubmittingPayment}
        />
      )}
    </>
  );
};

// ===================== MAIN COMPONENT =====================
export default function AccountantSupplierDebt() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Dynamic fetch with hook useCachedFetch
  const fetchFn = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined
    };
    return await supplierDebtService.getAllSupplierDebts(params);
  }, [currentPage, itemsPerPage, searchTerm]);

  const cacheKey = `supplier_debts_${searchTerm}_${currentPage}_${itemsPerPage}`;
  const { data: apiResponse, isLoading, refresh } = useCachedFetch(cacheKey, fetchFn);

  const suppliers = apiResponse?.data || [];
  const totalItems = apiResponse?.pagination?.totalItems || 0;
  const totalPages = apiResponse?.pagination?.totalPages || 1;

  // Sync selectedSupplier with updated list when it refreshes
  useEffect(() => {
    if (selectedSupplier) {
      const updated = suppliers.find(s => s.id === selectedSupplier.id);
      if (updated) {
        setSelectedSupplier(updated);
      }
    }
  }, [suppliers, selectedSupplier?.id]);

  // Filter dynamic clients side for date if specified, since ledger date filter requires details
  const filtered = useMemo(() => {
    let result = suppliers;
    // Client-side date filter is optional, in most cases we let the user look up inside the ledger history modal
    return result;
  }, [suppliers]);

  const hasActiveFilters = !!(searchTerm || dateFrom || dateTo);
  const clearAllFilters = () => { 
    setSearchTerm(""); 
    setDateFrom(""); 
    setDateTo(""); 
    setCurrentPage(1); 
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = filtered.map(s => ({
        "Mã NCC": s.code,
        "Nhà cung cấp": s.name,
        "Người liên hệ": s.contactPerson || "—",
        "Số điện thoại": s.phone || "—",
        "Địa chỉ": s.address || "—",
        "Nhóm": s.group,
        "Tổng giá trị nhập (VNĐ)": s.totalImport,
        "Đã thanh toán (VNĐ)": s.totalPaid,
        "Dư nợ (VNĐ)": s.debt,
        "Trạng thái": s.debt > 0 ? "Còn nợ" : "Đã tất toán"
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wscols = [
        { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
      ];
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CongNoThuMua");

      XLSX.writeFile(wb, `CongNoThuMua_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Xuất file Excel thành công!", { style: { fontSize: "14px", fontWeight: "bold" } });
    } catch (error) {
      console.error("Lỗi xuất excel:", error);
      toast.error("Không thể xuất file Excel");
    }
  };

  const totalDebtAmount = useMemo(() => {
    // Dynamic summation for all active items on the page
    return filtered.reduce((sum, s) => sum + Number(s.debt || 0), 0);
  }, [filtered]);

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
              {totalItems} nhà cung cấp · {filtered.filter((s) => s.debt > 0).length} đang có công nợ
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Tổng dư nợ trang hiện tại</p>
              <p className="text-[15px] font-black text-red-600">
                {formatCurrency(totalDebtAmount)}
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="h-9 px-3 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer">
                  Xóa bộ lọc
                </button>
              )}
              <button onClick={handleExportExcel}
                disabled={filtered.length === 0}
                className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold cursor-pointer transition focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                <Download size={14} strokeWidth={2.5} /> Xuất Excel
              </button>
            </div>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
                        <p className="text-sm font-medium">Đang tải dữ liệu công nợ nhà cung cấp...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
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
                        <p className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{s.contactPerson || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px]" style={{ color: "var(--text-main)" }}>{s.phone || "—"}</p>
                        <p className="text-[11px] truncate max-w-[180px]" style={{ color: "var(--text-placeholder)" }}>{s.address || "—"}</p>
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
                  ))
                )}

                {!isLoading && filtered.length === 0 && (
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
                          <button onClick={clearAllFilters} className="text-[13px] font-medium cursor-pointer" style={{ color: "var(--brand-primary)" }}>
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
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t shrink-0" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
              <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                Tổng số bản ghi: <span className="font-bold" style={{ color: "var(--text-main)" }}>{totalItems}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Số bản ghi/trang</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { 
                      setItemsPerPage(Number(e.target.value)); 
                      setCurrentPage(1); 
                    }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none appearance-none"
                    style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                  >
                    {[15, 30, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-bold" style={{ color: "var(--text-main)" }}>
                    {(currentPage - 1) * itemsPerPage + 1} – {Math.min(currentPage * itemsPerPage, totalItems)}
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
          onPaymentSuccess={() => {
            refresh();
          }}
        />
      )}
    </>
  );
}
