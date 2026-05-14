import { useState, useMemo } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Users, Search, CheckCircle, Package, X, ChevronLeft, ChevronRight, Eye, Camera, DollarSign, Calendar, FileText, Plus, Image as ImageIcon, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

/**
 * Accountant Customer Debt
 * Quản lý công nợ khách hàng (Mock data)
 *
 * Created By: HieuNM
 * Updated: 14/03/2026
 */

// --- Mock Data ---
const formatCurrency = (n) => n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

import { MOCK_DEBTS } from "../mockData";

export default function AccountantCustomerDebt() {
    const [debts, setDebts] = useState(MOCK_DEBTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [viewDebtDetails, setViewDebtDetails] = useState(null);
    const [payAmount, setPayAmount] = useState("");
    const [billPhoto, setBillPhoto] = useState(null);
    const [paymentNote, setPaymentNote] = useState("");
    const [showFullBill, setShowFullBill] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    const getRemainingAmount = (total, deposit) => Math.max(0, total - deposit);

    const handleExportExcel = () => {
        try {
            const dataToExport = filteredDebts.map(debt => {
                const remaining = getRemainingAmount(debt.total_amount, debt.deposit_amount);
                const isSettled = remaining <= 0;
                return {
                    "Mã Đơn": debt.order_code,
                    "Khách Hàng": debt.customer_name,
                    "Số Điện Thoại": debt.phone_number,
                    "Tổng Tiền": debt.total_amount,
                    "Đã Thanh Toán": debt.deposit_amount,
                    "Còn Nợ": remaining,
                    "Ngày Đặt": debt.order_date,
                    "Trạng Thái": isSettled ? "Đã thanh toán" : "Còn nợ"
                };
            });

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wscols = [
                { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
            ws['!cols'] = wscols;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CongNoKhachHang");

            XLSX.writeFile(wb, `CongNoKhachHang_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success("Xuất file Excel thành công!", { style: { fontSize: "14px", fontWeight: "bold" } });
        } catch (error) {
            console.error("Lỗi xuất excel:", error);
            toast.error("Không thể xuất file Excel");
        }
    };

    const filteredDebts = useMemo(() => {
        let r = debts;

        if (statusFilter === "DEBT") {
            r = r.filter(d => getRemainingAmount(d.total_amount, d.deposit_amount) > 0);
        } else if (statusFilter === "SETTLED") {
            r = r.filter(d => getRemainingAmount(d.total_amount, d.deposit_amount) <= 0);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            r = r.filter(
                (d) =>
                    d.order_code.toLowerCase().includes(q) ||
                    d.customer_name.toLowerCase().includes(q) ||
                    d.phone_number.includes(q)
            );
        }
        return r;
    }, [debts, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredDebts.length / itemsPerPage) || 1;
    const paginated = filteredDebts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalDebt = debts.reduce((acc, d) => acc + getRemainingAmount(d.total_amount, d.deposit_amount), 0);

    const handleOpenSettleModal = (debt) => {
        setSelectedDebt(debt);
        setPayAmount(getRemainingAmount(debt.total_amount, debt.deposit_amount));
        setBillPhoto(null);
        setPaymentNote("");
        setIsSettleModalOpen(true);
    };

    const handleConfirmSettle = () => {
        if (!selectedDebt || !payAmount || !billPhoto) {
            toast.error("Vui lòng nhập số tiền và đính kèm ảnh Bill bằng chứng!", { style: { fontSize: "14px", fontWeight: "bold" } });
            return;
        }

        const amountNum = Number(payAmount);
        if (amountNum <= 0) {
            toast.error("Số tiền không hợp lệ!");
            return;
        }

        const remaining = getRemainingAmount(selectedDebt.total_amount, selectedDebt.deposit_amount);
        if (amountNum > remaining) {
            toast.error("Số tiền thanh toán vượt quá dư nợ hiện tại!");
            return;
        }

        const newPayment = {
            date: new Date().toLocaleDateString("vi-VN"),
            amount: amountNum,
            bill_img: billPhoto, // Trong thực tế là URL, ở đây mock bằng preview
            note: paymentNote || (amountNum === remaining ? "Tất toán công nợ" : "Thanh toán một phần")
        };

        setDebts((prevDebts) =>
            prevDebts.map((debt) =>
                debt.id === selectedDebt.id
                    ? {
                        ...debt,
                        deposit_amount: debt.deposit_amount + amountNum,
                        payment_history: [...(debt.payment_history || []), newPayment]
                    }
                    : debt
            )
        );

        setIsSettleModalOpen(false);
        setSelectedDebt(null);
        toast.success(amountNum === remaining ? "Đã tất toán công nợ thành công!" : "Đã ghi nhận thanh toán một phần!", { style: { fontSize: "14px", fontWeight: "bold" } });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Mock preview URL
            setBillPhoto(URL.createObjectURL(file));
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
                            {filteredDebts.length} khoản công nợ · {debts.filter(d => getRemainingAmount(d.total_amount, d.deposit_amount) > 0).length} đơn đang nợ
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
                                {paginated.map((debt) => {
                                    const remaining = getRemainingAmount(debt.total_amount, debt.deposit_amount);
                                    const isSettled = remaining === 0;

                                    return (
                                        <tr key={debt.id} className="group hover:bg-gray-50/50 transition-colors relative"
                                            style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: isSettled ? "#F0FDF4" : "transparent" }}>
                                            {/* Mã Đơn */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                                                    {debt.order_code}
                                                </span>
                                            </td>
                                            {/* Khách hàng */}
                                            <td className="px-4 py-3 text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
                                                {debt.customer_name}
                                            </td>
                                            {/* Số điện thoại */}
                                            <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                                {debt.phone_number}
                                            </td>
                                            {/* Tổng tiền */}
                                            <td className="px-4 py-3 text-right text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                                                {formatCurrency(debt.total_amount)}
                                            </td>
                                            {/* Đã thanh toán */}
                                            <td className="px-4 py-3 text-right text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                                                {formatCurrency(debt.deposit_amount)}
                                            </td>
                                            {/* Còn nợ */}
                                            <td className="px-4 py-3 text-right text-[13px] font-bold" style={{ color: isSettled ? "#15803D" : "#D97706" }}>
                                                {formatCurrency(remaining)}
                                            </td>
                                            {/* Ngày đặt */}
                                            <td className="px-4 py-3 text-center text-[12px]" style={{ color: "var(--text-secondary)" }}>
                                                {debt.order_date}
                                            </td>
                                            {/* Spacer */}
                                            <td className="px-4 py-3"></td>
                                            {/* Actions */}
                                            <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                    <button onClick={() => setViewDebtDetails(debt)}
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
                                {paginated.length === 0 && (
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
                    {filteredDebts.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                Tổng: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filteredDebts.length}</span> khoản
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
                                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredDebts.length)}
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
                                    <span className="font-black text-blue-900 text-[15px]">
                                        {formatCurrency(getRemainingAmount(selectedDebt.total_amount, selectedDebt.deposit_amount))}
                                    </span>
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
                                <CheckCircle size={14} /> Xác Nhận Thanh Toán
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
                                Chi tiết các khoản nợ của khách hàng <span className="font-bold text-gray-900">{viewDebtDetails.customer_name}</span>
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
                                        {formatCurrency(getRemainingAmount(viewDebtDetails.total_amount, viewDebtDetails.deposit_amount))}
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
                                    {viewDebtDetails.payment_history && viewDebtDetails.payment_history.length > 0 ? (
                                        viewDebtDetails.payment_history.map((pay, pIdx) => (
                                            <div key={pIdx} className="flex gap-4 p-3 rounded-xl border bg-white shadow-sm transition-all hover:bg-gray-50/50" style={{ borderColor: "var(--grid-border)" }}>
                                                {/* Bill Thumbnail */}
                                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border cursor-pointer relative group"
                                                    style={{ borderColor: "var(--grid-border)" }}
                                                    onClick={() => setShowFullBill(pay.bill_img)}>
                                                    <img src={pay.bill_img} alt="Bill" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Search size={14} className="text-white" />
                                                    </div>
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <span className="text-[14px] font-black text-green-700">+{formatCurrency(pay.amount)}</span>
                                                        <span className="text-[11px] font-bold text-gray-400">{pay.date}</span>
                                                    </div>
                                                    <p className="text-[12px] text-gray-600 line-clamp-2 italic leading-snug">
                                                        {pay.note || "Không có ghi chú"}
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
                                                        {viewDebtDetails.order_code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(viewDebtDetails.total_amount)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-red-600">
                                                    {formatCurrency(getRemainingAmount(viewDebtDetails.total_amount, viewDebtDetails.deposit_amount))}
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
