import { useState, useMemo } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Users, Search, CheckCircle, Package, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * Accountant Customer Debt
 * Quản lý công nợ khách hàng (Mock data)
 *
 * Created By: AI
 * Updated: 14/03/2026
 */

// --- Mock Data ---
const formatCurrency = (n) => n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const MOCK_DEBTS = [
    {
        id: "1",
        order_code: "HD260314A1B2C3",
        customer_name: "Nguyễn Văn A",
        phone_number: "0901234567",
        total_amount: 15500000,
        deposit_amount: 5000000,
        order_date: "10/03/2026",
    },
    {
        id: "2",
        order_code: "HD260313D4E5F6",
        customer_name: "Trần Thị B",
        phone_number: "0987654321",
        total_amount: 8200000,
        deposit_amount: 3000000,
        order_date: "12/03/2026",
    },
    {
        id: "3",
        order_code: "HD260312X7Y8Z9",
        customer_name: "Lê Minh C",
        phone_number: "0912223334",
        total_amount: 25000000,
        deposit_amount: 10000000,
        order_date: "05/03/2026",
    },
    {
        id: "4",
        order_code: "HD260310P1Q2R3",
        customer_name: "Phạm Xuân D",
        phone_number: "0934445556",
        total_amount: 4500000,
        deposit_amount: 1500000,
        order_date: "01/03/2026",
    },
    {
        id: "5",
        order_code: "HD260305W1X2Y3",
        customer_name: "Hoàng Văn E",
        phone_number: "0966778899",
        total_amount: 10000000,
        deposit_amount: 10000000,
        order_date: "05/03/2026",
    },
];

export default function AccountantCustomerDebt() {
    const [debts, setDebts] = useState(MOCK_DEBTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [viewDebtDetails, setViewDebtDetails] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    const getRemainingAmount = (total, deposit) => Math.max(0, total - deposit);

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
        setIsSettleModalOpen(true);
    };

    const handleConfirmSettle = () => {
        if (!selectedDebt) return;

        setDebts((prevDebts) =>
            prevDebts.map((debt) =>
                debt.id === selectedDebt.id
                    ? { ...debt, deposit_amount: debt.total_amount }
                    : debt
            )
        );

        setIsSettleModalOpen(false);
        setSelectedDebt(null);
        toast.success("Đã thanh toán công nợ thành công!", { style: { fontSize: "14px", fontWeight: "bold" } });
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
                                <X size={18} style={{ color: "var(--text-secondary)" }}/>
                            </button>
                            <h2 className="text-[17px] font-black" style={{ color: "var(--text-main)" }}>Xác nhận thanh toán</h2>
                            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
                                Thu phần tiền còn lại của đơn hàng này.
                            </p>
                        </div>

                        {selectedDebt && (
                            <div className="p-6 space-y-3 flex-1">
                                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--grid-border)" }}>
                                    <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Mã Đơn:</span>
                                    <span className="text-[13px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>{selectedDebt.order_code}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--grid-border)" }}>
                                    <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Khách Hàng:</span>
                                    <span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{selectedDebt.customer_name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--grid-border)" }}>
                                    <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Tổng Tiền:</span>
                                    <span className="text-[14px] font-bold block" style={{ color: "var(--text-main)" }}>{formatCurrency(selectedDebt.total_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--grid-border)" }}>
                                    <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Đã Thu:</span>
                                    <span className="text-[14px] font-bold block" style={{ color: "var(--text-secondary)" }}>{formatCurrency(selectedDebt.deposit_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[13px] font-black uppercase tracking-wide" style={{ color: "var(--brand-primary)" }}>Cần Thu Thêm:</span>
                                    <span className="text-[18px] font-black" style={{ color: "var(--brand-primary)" }}>
                                        {formatCurrency(getRemainingAmount(selectedDebt.total_amount, selectedDebt.deposit_amount))}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <button className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                                style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
                                onClick={() => setIsSettleModalOpen(false)}>Hủy</button>
                            <button className="h-10 px-6 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition"
                                style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                                onClick={handleConfirmSettle}>Xác Nhận Thu Đủ</button>
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
                                <X size={18} style={{ color: "var(--text-secondary)" }}/>
                            </button>
                            <h2 className="text-[17px] font-black flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                                <Users size={20} style={{ color: "var(--brand-primary)" }}/>
                                Lịch sử công nợ khách hàng
                            </h2>
                            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
                                Chi tiết các khoản nợ của khách hàng <span className="font-bold text-gray-900">{viewDebtDetails.customer_name}</span>
                            </p>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border flex flex-col items-center justify-center text-center" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng tiền khách mua</p>
                                    <p className="text-xl font-bold" style={{ color: "var(--text-main)" }}>{formatCurrency(viewDebtDetails.total_amount)}</p>
                                </div>
                                <div className="p-4 rounded-xl border flex flex-col items-center justify-center text-center" style={{ borderColor: "var(--grid-border)", backgroundColor: "rgba(220, 38, 38, 0.05)" }}>
                                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-1">Tổng nợ hiện tại</p>
                                    <p className="text-xl font-black text-red-600">
                                        {formatCurrency(getRemainingAmount(viewDebtDetails.total_amount, viewDebtDetails.deposit_amount))}
                                    </p>
                                </div>
                            </div>

                            {/* Table of specific debts */}
                            <div className="space-y-3">
                                <h3 className="text-[14px] font-bold text-gray-800 border-b pb-2" style={{ borderColor: "var(--grid-border)" }}>Danh sách đơn hàng phát sinh nợ</h3>
                                <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--grid-border)" }}>
                                    <table className="w-full text-left text-[13px]">
                                        <thead className="bg-[#F8FAFC] border-b" style={{ borderColor: "var(--grid-border)" }}>
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-gray-500 uppercase text-[11px] tracking-wider">Mã Đơn</th>
                                                <th className="px-4 py-3 font-bold text-gray-500 uppercase text-[11px] tracking-wider text-center">Ngày đặt</th>
                                                <th className="px-4 py-3 font-bold text-gray-500 text-right uppercase text-[11px] tracking-wider">Giá trị đơn</th>
                                                <th className="px-4 py-3 font-bold text-gray-500 text-right uppercase text-[11px] tracking-wider">Số tiền nợ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                                            <tr className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
                                                        {viewDebtDetails.order_code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-500">{viewDebtDetails.order_date}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(viewDebtDetails.total_amount)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-red-600">
                                                    {formatCurrency(getRemainingAmount(viewDebtDetails.total_amount, viewDebtDetails.deposit_amount))}
                                                </td>
                                            </tr>
                                            {/* Note: since MOCK_DEBTS currently groups debts uniquely by order_code, 
                                                this represents 1 row. When real data is hooked up, mapping through an array of orders here would show 
                                                multiple orders for the single customer. */}
                                        </tbody>
                                        <tfoot className="bg-[#F8FAFC] border-t" style={{ borderColor: "var(--grid-border)" }}>
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-right font-black text-gray-600 text-[13px] uppercase tracking-wide">Tổng Nợ</td>
                                                <td className="px-4 py-3 text-right font-black text-red-600 text-[15px]">
                                                    {formatCurrency(getRemainingAmount(viewDebtDetails.total_amount, viewDebtDetails.deposit_amount))}
                                                </td>
                                            </tr>
                                        </tfoot>
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
        </>
    );
}
