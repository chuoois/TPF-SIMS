import { useState, useMemo, useCallback, useEffect } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Users, Search, CheckCircle, Package, X, ChevronLeft, ChevronRight, Eye, Camera, DollarSign, Calendar, FileText, Plus, Image as ImageIcon, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import customerDebtService from "@/services/customerDebt.service";
import { uploadImage } from "@/services/cloudinary.service";
import useCachedFetch from "@/hooks/useCachedFetch";
import { formatShortDateVN } from "@/lib/dateUtils";

/**
 * Accountant Customer Debt
 * Quản lý công nợ khách hàng
 */

const formatCurrency = (n) => n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

export default function AccountantCustomerDebt() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("DEBT");
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [viewDebtDetails, setViewDebtDetails] = useState(null);
    const [payAmount, setPayAmount] = useState("");
    const [billPhoto, setBillPhoto] = useState(null);
    const [billFile, setBillFile] = useState(null);
    const [paymentNote, setPaymentNote] = useState("");
    const [showFullBill, setShowFullBill] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    const fetchFn = useCallback(async () => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery || undefined,
            status: statusFilter === "ALL" ? undefined : statusFilter
        };
        return await customerDebtService.getAllCustomerDebts(params);
    }, [currentPage, itemsPerPage, searchQuery, statusFilter]);

    const cacheKey = `customer_debts_${searchQuery}_${statusFilter}_${currentPage}_${itemsPerPage}`;
    const { data: apiResponse, isLoading, refresh } = useCachedFetch(cacheKey, fetchFn);

    const debts = apiResponse?.data || [];
    const totalItems = apiResponse?.pagination?.totalItems || 0;
    const totalPages = apiResponse?.pagination?.totalPages || 1;

    const getRemainingAmount = (order) => {
        const total = Number(order.total_amount) || 0;
        const deposit = Number(order.deposit_amount) || 0;
        const received = Number(order.received_amount) || 0;
        return Math.max(0, total - (deposit + received));
    };

    const handleExportExcel = () => {
        try {
            const dataToExport = debts.map(debt => {
                const remaining = getRemainingAmount(debt);
                const isSettled = remaining <= 0;
                return {
                    "Mã Đơn": `DH-${debt.pk_order_id}`,
                    "Khách Hàng": debt.customer?.full_name || "—",
                    "Số Điện Thoại": debt.customer?.phone_number || "—",
                    "Tổng Tiền": Number(debt.total_amount),
                    "Đã Thanh Toán": Number(debt.deposit_amount) + Number(debt.received_amount),
                    "Còn Nợ": remaining,
                    "Ngày Đặt": formatShortDateVN(debt.createdate),
                    "Trạng Thái": isSettled ? "Đã thanh toán" : "Còn nợ"
                };
            });

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wscols = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
            ws['!cols'] = wscols;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CongNoKhachHang");
            XLSX.writeFile(wb, `CongNoKhachHang_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success("Xuất file Excel thành công!");
        } catch (error) {
            console.error("Lỗi xuất excel:", error);
            toast.error("Không thể xuất file Excel");
        }
    };

    const totalDebt = useMemo(() => {
        // Lưu ý: totalDebt này chỉ tính trên trang hiện tại nếu API không trả về total sum
        // Trong thực tế nên để API trả về tổng dư nợ toàn hệ thống
        return debts.reduce((acc, d) => acc + getRemainingAmount(d), 0);
    }, [debts]);

    const handleOpenSettleModal = (debt) => {
        setSelectedDebt(debt);
        setPayAmount(getRemainingAmount(debt));
        setBillPhoto(null);
        setBillFile(null);
        setPaymentNote("");
        setIsSettleModalOpen(true);
    };

    const handleConfirmSettle = async () => {
        if (!selectedDebt || !payAmount) {
            toast.error("Vui lòng nhập số tiền thanh toán!");
            return;
        }

        const amountNum = Number(payAmount);
        if (amountNum <= 0) {
            toast.error("Số tiền không hợp lệ!");
            return;
        }

        const remaining = getRemainingAmount(selectedDebt);
        if (amountNum > remaining + 1000) { // Cho phép sai lệch nhỏ
            toast.error("Số tiền thanh toán vượt quá dư nợ hiện tại!");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Đang xử lý thanh toán...");

        try {
            let uploadedImageUrl = null;
            if (billFile) {
                const uploadRes = await uploadImage(billFile);
                uploadedImageUrl = uploadRes.url;
            }

            await customerDebtService.addPayment(selectedDebt.pk_order_id, {
                amount: amountNum,
                method: "Chuyển khoản/Tiền mặt",
                note: paymentNote,
                bill_image: uploadedImageUrl
            });

            toast.success("Đã ghi nhận thanh toán thành công!", { id: loadingToast });
            setIsSettleModalOpen(false);
            refresh();
        } catch (error) {
            console.error("Payment error:", error);
            toast.error(error.response?.data?.message || "Lỗi khi ghi nhận thanh toán", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBillFile(file);
            setBillPhoto(URL.createObjectURL(file));
        }
    };

    const handleViewDetails = async (debt) => {
        setViewDebtDetails(debt);
        setIsLoadingHistory(true);
        try {
            const res = await customerDebtService.getPaymentHistory(debt.pk_order_id);
            setPaymentHistory(res.data || []);
        } catch (error) {
            console.error("Get history error:", error);
            toast.error("Không thể tải lịch sử thanh toán");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    return (
        <>
            <PageHelmet title="Công nợ khách hàng | Kế toán" />
            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
                {/* ── Header ── */}
                <div className="flex items-center justify-between shrink-0 px-1">
                    <div>
                        <h1 className="text-[22px] font-bold flex items-center gap-2.5" style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}>
                            <Users size={24} style={{ color: "var(--brand-primary)" }} />
                            Công nợ khách hàng
                        </h1>
                        <p className="text-[13px] mt-1 font-medium italic" style={{ color: "var(--text-placeholder)" }}>
                            {totalItems} khoản công nợ · {apiResponse?.activeDebtCount || "..."} đơn đang nợ
                        </p>
                    </div>

                    {/* Summary chips */}
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-center">
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Tổng dư nợ</p>
                            <p className="text-[15px] font-black text-red-600">
                                {formatCurrency(totalDebt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Table card ── */}
                <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    {/* Toolbar */}
                    <div className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center gap-3" style={{ borderColor: "var(--grid-border)" }}>
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative w-full max-w-sm">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                                <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    placeholder="Tìm mã đơn, tên KH, SĐT..."
                                    className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                    style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }} />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                                        style={{ color: "var(--text-placeholder)" }}><X size={14} /></button>
                                )}
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="h-9 px-3 pr-8 rounded-lg text-[13px] border cursor-pointer appearance-none outline-none focus:ring-2 transition flex-shrink-0"
                                style={{
                                    borderColor: "var(--grid-border)",
                                    backgroundColor: "var(--bg-main)",
                                    color: "var(--text-main)",
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "right 10px center",
                                }}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="DEBT">Còn nợ</option>
                                <option value="SETTLED">Đã thanh toán</option>
                            </select>
                        </div>
                        <button onClick={handleExportExcel}
                            className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold cursor-pointer transition focus:ring-2"
                            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                            <Download size={14} strokeWidth={2.5} /> Xuất Excel
                        </button>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left relative">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                <tr>
                                    {["Mã Đơn", "Khách Hàng", "Số Điện Thoại"].map((h, i) => (
                                        <th key={i} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>{h}</th>
                                    ))}
                                    {["Tổng Tiền", "Đã Thanh Toán", "Còn Nợ"].map((h, i) => (
                                        <th key={i} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-placeholder)" }}>{h}</th>
                                    ))}
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-placeholder)" }}>Ngày Đặt</th>
                                    <th className="w-24 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                                <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-100 rounded-full animate-spin"></div>
                                                <p className="text-[14px] font-medium mt-2">Đang tải dữ liệu...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : debts.map((debt) => {
                                    const remaining = getRemainingAmount(debt);
                                    const isSettled = remaining === 0;

                                    return (
                                        <tr key={debt.pk_order_id} className="group hover:bg-gray-50/50 transition-colors relative"
                                            style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: isSettled ? "#F0FDF4" : "transparent" }}>
                                            {/* Mã Đơn */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                                                    DH-{debt.pk_order_id}
                                                </span>
                                            </td>
                                            {/* Khách hàng */}
                                            <td className="px-4 py-3 text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
                                                {debt.customer?.full_name || "—"}
                                            </td>
                                            {/* Số điện thoại */}
                                            <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                                {debt.customer?.phone_number || "—"}
                                            </td>
                                            {/* Tổng tiền */}
                                            <td className="px-4 py-3 text-right text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                                                {formatCurrency(debt.total_amount)}
                                            </td>
                                            {/* Đã thanh toán */}
                                            <td className="px-4 py-3 text-right text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                                                {formatCurrency(Number(debt.deposit_amount) + Number(debt.received_amount))}
                                            </td>
                                            {/* Còn nợ */}
                                            <td className="px-4 py-3 text-right text-[13px] font-bold" style={{ color: isSettled ? "#15803D" : "#D97706" }}>
                                                {formatCurrency(remaining)}
                                            </td>
                                            {/* Ngày đặt */}
                                            <td className="px-4 py-3 text-center text-[12px]" style={{ color: "var(--text-secondary)" }}>
                                                {formatShortDateVN(debt.createdate)}
                                            </td>
                                            {/* Spacer */}
                                            <td className="px-4 py-3"></td>
                                            {/* Actions */}
                                            <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                        <button onClick={() => handleViewDetails(debt)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition"
                                                        style={{ color: "var(--text-secondary)" }}>
                                                        <Eye size={14} /> Chi tiết
                                                    </button>
                                                    {!isSettled ? (
                                                        <button onClick={() => handleOpenSettleModal(debt)}
                                                            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-blue-50 cursor-pointer transition"
                                                            style={{ color: "var(--brand-primary)" }}>
                                                            <CheckCircle size={14} /> Thanh Toán
                                                        </button>
                                                    ) : (
                                                        <span className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold cursor-default"
                                                            style={{ color: "#15803D", backgroundColor: "#F0FDF4" }}>
                                                            <CheckCircle size={14} /> Đã tất toán
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!isLoading && debts.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                                                    <Package size={28} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-[14px] font-medium mt-1">
                                                    {searchQuery ? `Không tìm thấy "${searchQuery}"` : "Không có công nợ nào"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                Tổng: <span className="font-bold" style={{ color: "var(--text-main)" }}>{totalItems}</span> khoản
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Bản ghi/trang</span>
                                    <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer appearance-none outline-none"
                                        style={{
                                            borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)",
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                                        }}>
                                        {[15, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                    <span className="font-bold" style={{ color: "var(--text-main)" }}>
                                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)}
                                    </span> khoản
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
                                        style={{ color: "var(--text-main)" }}><ChevronLeft size={16} strokeWidth={2.5} /></button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
                                        style={{ color: "var(--text-main)" }}><ChevronRight size={16} strokeWidth={2.5} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Settle Debt Modal */}
            {isSettleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsSettleModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 shrink-0 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
                            <button onClick={() => setIsSettleModalOpen(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition">
                                <X size={18} style={{ color: "var(--text-secondary)" }} />
                            </button>
                            <h2 className="text-[17px] font-black" style={{ color: "var(--text-main)" }}>Ghi nhận thanh toán</h2>
                            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
                                Nhập số tiền thu và đính kèm bằng chứng.
                            </p>
                        </div>

                        {selectedDebt && (
                            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
                                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex justify-between items-center text-[13px]">
                                    <span className="font-bold text-blue-800">Dư nợ hiện tại:</span>
                                        {formatCurrency(getRemainingAmount(selectedDebt))}
                                </div>

                                {/* Số tiền thu */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                        <DollarSign size={12} /> Số tiền thu lần này (₫)
                                    </label>
                                    <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl text-[15px] font-black border focus:outline-none focus:ring-2 transition"
                                        style={{ borderColor: "var(--grid-border)", color: "var(--brand-primary)" }} placeholder="0" />
                                </div>

                                {/* Upload Bill */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                        <Camera size={12} /> Ảnh Bill/Chuyển khoản (Bắt buộc)
                                    </label>
                                    {!billPhoto ? (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition"
                                            style={{ borderColor: "var(--grid-border)" }}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Plus size={24} className="mb-2 text-gray-400" />
                                                <p className="text-[12px] text-gray-500 font-medium">Bấm để chọn hoặc kéo thả ảnh</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    ) : (
                                        <div className="relative group rounded-xl overflow-hidden border" style={{ borderColor: "var(--grid-border)" }}>
                                            <img src={billPhoto} alt="Bill Preview" className="w-full h-40 object-cover" />
                                            <button onClick={() => setBillPhoto(null)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition shadow-lg backdrop-blur-sm">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Ghi chú */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                        <FileText size={12} /> Ghi chú thanh toán
                                    </label>
                                    <textarea value={paymentNote} onChange={e => setPaymentNote(e.target.value)}
                                        className="w-full p-3 rounded-xl text-[13px] border focus:outline-none focus:ring-2 transition min-h-[80px]"
                                        style={{ borderColor: "var(--grid-border)" }} placeholder="Ví dụ: Chuyển khoản Vietcombank..." />
                                </div>
                            </div>
                        )}

                        <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <button className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                                style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
                                onClick={() => setIsSettleModalOpen(false)}>Hủy</button>
                            <button className="h-10 px-6 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition flex items-center gap-2"
                                style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                                onClick={handleConfirmSettle}>
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin"></div>
                                ) : (
                                    <CheckCircle size={14} />
                                )}
                                {isSubmitting ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Debt Details Modal */}
            {viewDebtDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewDebtDetails(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 shrink-0 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
                            <button onClick={() => setViewDebtDetails(null)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition">
                                <X size={18} style={{ color: "var(--text-secondary)" }} />
                            </button>
                            <h2 className="text-[17px] font-black flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                                <Users size={20} style={{ color: "var(--brand-primary)" }} />
                                Lịch sử công nợ khách hàng
                            </h2>
                            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
                                Chi tiết các khoản nợ của khách hàng <span className="font-bold text-gray-900">{viewDebtDetails.customer?.full_name || "—"}</span>
                            </p>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng tiền khách mua</p>
                                    <p className="text-xl font-bold" style={{ color: "var(--text-main)" }}>{formatCurrency(viewDebtDetails.total_amount)}</p>
                                </div>
                                <div className="p-4 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm" style={{ borderColor: "var(--grid-border)", backgroundColor: "rgba(220, 38, 38, 0.05)" }}>
                                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-1">Tổng nợ hiện tại</p>
                                    <p className="text-xl font-black text-red-600">
                                        {formatCurrency(getRemainingAmount(viewDebtDetails))}
                                    </p>
                                </div>
                            </div>

                            {/* Payment History Listing */}
                            <div className="space-y-3">
                                <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-blue-500" />
                                    Lịch sử các đợt thanh toán
                                </h3>
                                <div className="space-y-3">
                                    {isLoadingHistory ? (
                                        <div className="py-12 text-center">
                                            <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-100 rounded-full animate-spin mx-auto"></div>
                                            <p className="text-[13px] text-gray-400 mt-2">Đang tải lịch sử...</p>
                                        </div>
                                    ) : paymentHistory.length > 0 ? (
                                        paymentHistory.map((pay, pIdx) => (
                                            <div key={pay.pk_history_id || pIdx} className="flex gap-4 p-3 rounded-xl border bg-white shadow-sm transition-all hover:bg-gray-50/50" style={{ borderColor: "var(--grid-border)" }}>
                                                {/* Bill Thumbnail */}
                                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border cursor-pointer relative group"
                                                    style={{ borderColor: "var(--grid-border)" }}
                                                    onClick={() => pay.bill_image && setShowFullBill(pay.bill_image)}>
                                                    {pay.bill_image ? (
                                                        <img src={pay.bill_image} alt="Bill" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                    {pay.bill_image && (
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <Search size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <span className="text-[14px] font-black text-green-700">+{formatCurrency(pay.amount)}</span>
                                                        <span className="text-[11px] font-bold text-gray-400">{formatShortDateVN(pay.date)}</span>
                                                    </div>
                                                    <p className="text-[12px] text-gray-600 line-clamp-2 italic leading-snug">
                                                        {pay.note || "Thanh toán đợt"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: "var(--grid-border)" }}>
                                            <p className="text-[13px] text-gray-400 font-medium">Chưa có lịch sử thanh toán</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table of specific debts (Details of items/orders) */}
                            <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                                <h3 className="text-[14px] font-bold text-gray-800 border-b pb-2 flex items-center gap-2" style={{ borderColor: "var(--grid-border)" }}>
                                    <FileText size={16} className="text-orange-500" />
                                    Thông tin đơn hàng phát sinh nợ
                                </h3>
                                <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                                    <table className="w-full text-left text-[13px]">
                                        <thead className="bg-[#F8FAFC] border-b" style={{ borderColor: "var(--grid-border)" }}>
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-gray-500 uppercase text-[11px] tracking-wider">Mã Đơn</th>
                                                <th className="px-4 py-3 font-bold text-gray-500 text-right uppercase text-[11px] tracking-wider">Giá trị đơn</th>
                                                <th className="px-4 py-3 font-bold text-gray-500 text-right uppercase text-[11px] tracking-wider">Còn nợ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                                            <tr className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
                                                        DH-{viewDebtDetails.pk_order_id}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(viewDebtDetails.total_amount)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-red-600">
                                                    {formatCurrency(getRemainingAmount(viewDebtDetails))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex items-center justify-end" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <button className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                                style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
                                onClick={() => setViewDebtDetails(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Full Image Preview Modal */}
            {showFullBill && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowFullBill(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowFullBill(null)}
                            className="absolute -top-10 right-0 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition">
                            <X size={24} />
                        </button>
                        <img src={showFullBill} alt="Full Bill Proof" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    </div>
                </div>
            )}
        </>
    );
}
