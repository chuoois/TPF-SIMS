import { useState, useMemo, useEffect } from "react";
import CreatePeriodModal from "./CreatePeriodModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
    Search, X, Users, Wallet, Calendar, Hammer, Paintbrush, Plus, Trash2,
    CheckCircle2, Clock, BriefcaseBusiness, ChevronDown, CalendarPlus, XCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmployeeModal from "./EmployeeModal";
import AddProductModal from "./AddProductModal";
import { cn } from "@/lib/utils"; // Assuming cn utility is available

/**
 * Accountant Employee Salary
 * Types: SALES, ACCOUNTANT, SANDER, PAINTER
 */

const formatCurrency = (n) => n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const getCurrentMonth = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${mm}/${now.getFullYear()}`;
};

const CURRENT_MONTH = getCurrentMonth(); // "03/2026"

const MOCK_EMPLOYEES = [
    {
        id: "NV001",
        name: "Nguyễn Thị Mai",
        role: "Nhân viên bán hàng",
        type: "SALES",
        base_salary: 10000000,
        days_worked: 26,
        allowance: 1000000,
        products_finished: 0,
        products_log: [],
        status: "Chưa thanh toán",
        month: CURRENT_MONTH,
        payment_date: ""
    },
    {
        id: "NV002",
        name: "Trần Văn Khoa",
        role: "Nhân viên bán hàng",
        type: "SALES",
        base_salary: 8000000,
        days_worked: 24,
        allowance: 500000,
        products_finished: 0,
        products_log: [],
        status: "Đã thanh toán",
        month: CURRENT_MONTH,
        payment_date: "15/03/2024"
    },
    {
        id: "KT001",
        name: "Lê Thị Hương",
        role: "Kế toán",
        type: "ACCOUNTANT",
        base_salary: 12000000,
        days_worked: 26,
        allowance: 500000,
        products_finished: 0,
        products_log: [],
        status: "Chưa thanh toán",
        month: CURRENT_MONTH,
        payment_date: ""
    },
    {
        id: "NV003",
        name: "Lê Đình Chinh",
        role: "Nhân viên giấy ráp",
        type: "SANDER",
        base_rate: 400000,
        days_worked: 22,
        allowance: 0,
        products_finished: 0,
        products_log: [],
        status: "Chưa thanh toán",
        month: CURRENT_MONTH,
        payment_date: ""
    },
    {
        id: "NV004",
        name: "Phạm Xuân Đạt",
        role: "Nhân viên giấy ráp",
        type: "SANDER",
        base_rate: 400000,
        days_worked: 25,
        allowance: 200000,
        products_finished: 0,
        products_log: [],
        status: "Chưa thanh toán",
        month: CURRENT_MONTH,
        payment_date: ""
    },
    {
        id: "NV005",
        name: "Đỗ Hữu Hùng",
        role: "Thợ sơn",
        type: "PAINTER",
        base_rate: 150000,
        days_worked: 26,
        allowance: 0,
        products_finished: 0,
        products_log: [
            { productName: "Tủ gỗ sồi A1", price: 150000, qty: 40 },
            { productName: "Ghế gỗ teak", price: 120000, qty: 35 },
            { productName: "Kệ sách đôi", price: 180000, qty: 45 },
        ],
        status: "Chưa thanh toán",
        month: CURRENT_MONTH,
        payment_date: ""
    },
    {
        id: "NV006",
        name: "Vũ Tấn Tài",
        role: "Thợ sơn",
        type: "PAINTER",
        base_rate: 200000,
        days_worked: 20,
        allowance: 500000,
        products_finished: 0,
        products_log: [
            { productName: "Bàn ăn gỗ thông", price: 200000, qty: 50 },
            { productName: "Ghế bar", price: 200000, qty: 35 },
        ],
        status: "Đã thanh toán",
        month: CURRENT_MONTH,
        payment_date: "20/03/2024"
    }
].map(emp => {
    // Sync products_finished from log if log exists
    if (emp.products_log?.length) {
        emp.products_finished = emp.products_log.reduce((s, p) => s + (p.qty || 1), 0);
    }
    return emp;
});

const getRoleIcon = (type) => {
    switch (type) {
        case "SALES": return <Users size={14} className="text-blue-600" />;
        case "ACCOUNTANT": return <BriefcaseBusiness size={14} className="text-purple-600" />;
        case "SANDER": return <Hammer size={14} className="text-amber-600" />;
        case "PAINTER": return <Paintbrush size={14} className="text-green-600" />;
        default: return <Users size={14} />;
    }
};

const calculateTotalSalary = (emp) => {
    let total = 0;
    if (emp.type === "SALES") {
        total = emp.base_salary + emp.allowance;
    } else if (emp.type === "ACCOUNTANT") {
        total = emp.base_salary + emp.allowance;
    } else if (emp.type === "SANDER") {
        total = (emp.base_rate * emp.days_worked) + emp.allowance;
    } else if (emp.type === "PAINTER") {
        // Sum each log entry individually (supports per-product price)
        const logTotal = (emp.products_log || []).reduce((s, p) => s + (p.price * (p.qty || 1)), 0);
        // Fallback to base_rate * products_finished if no log
        const fallback = logTotal > 0 ? logTotal : (emp.base_rate * emp.products_finished);
        total = fallback + emp.allowance;
    }
    return total;
};

export default function AccountantEmployeeSalary() {
    const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [monthFilter, setMonthFilter] = useState("ALL");

    // Get unique months for filter
    const uniqueMonths = useMemo(() => {
        const months = employees.map(emp => emp.month);
        return ["ALL", ...new Set(months)];
    }, [employees]);

    // Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);

    // Delete
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Add product modal (for painter)
    const [addProductTarget, setAddProductTarget] = useState(null); // employee object

    // Painter log expand
    const [expandedPainter, setExpandedPainter] = useState(null);

    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);


    const handleCreatePeriod = (newPeriod) => {
        // Clone existing unique employees (distinct by name/id) to the new period
        const uniqueEntries = Array.from(new Map(employees.map(emp => [emp.id, emp])).values());

        const newEntries = uniqueEntries.map(emp => ({
            ...emp,
            month: newPeriod,
            status: "Chưa thanh toán",
            payment_date: "",
            products_log: [],
            products_finished: 0,
            days_worked: emp.type === "PAINTER" ? 0 : (emp.base_rate ? 0 : 26),
        }));

        setEmployees(prev => [...prev, ...newEntries]);
        setMonthFilter(newPeriod);
        toast.success(`Đã tạo thành công kỳ lương ${newPeriod}`, { icon: "📅" });
    };

    const filteredEmployees = useMemo(() => {
        let r = employees;
        if (roleFilter !== "ALL") {
            r = r.filter(emp => emp.type === roleFilter);
        }
        if (monthFilter !== "ALL") {
            r = r.filter(emp => emp.month === monthFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(
                (emp) =>
                    emp.id.toLowerCase().includes(q) ||
                    emp.name.toLowerCase().includes(q)
            );
        }
        return r;
    }, [employees, search, roleFilter, monthFilter]);

    const handleSaveEmployee = (empData) => {
        if (employeeToEdit) {
            setEmployees(prev => prev.map(e => e.id === empData.id ? empData : e));
            toast.success("Cập nhật thông tin nhân viên thành công!", { style: { fontSize: "14px", fontWeight: "bold" } });
        } else {
            setEmployees(prev => [empData, ...prev]);
            toast.success("Thêm nhân viên mới thành công!", { style: { fontSize: "14px", fontWeight: "bold" } });
        }
        setIsModalOpen(false);
        setEmployeeToEdit(null);
    };

    const handleDeleteEmployee = () => {
        if (!employeeToDelete) return;
        setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
        toast.success(`Đã xóa nhân viên ${employeeToDelete.name}`, { style: { fontSize: "14px", fontWeight: "bold" } });
        setEmployeeToDelete(null);
    };

    const handleToggleStatus = (empId) => {
        const emp = employees.find(e => e.id === empId);
        if (!emp) return;

        const newStatus = emp.status === "Đã thanh toán" ? "Chưa thanh toán" : "Đã thanh toán";
        const newPaymentDate = newStatus === "Đã thanh toán" ? format(new Date(), "dd/MM/yyyy", { locale: vi }) : "";

        setEmployees(prev => prev.map(e =>
            e.id === empId ? { ...e, status: newStatus, payment_date: newPaymentDate } : e
        ));

        toast.success(
            newStatus === "Đã thanh toán"
                ? `✅ Đã xác nhận thanh toán cho ${emp.name}`
                : `🔄 Đã đổi trạng thái về Chưa thanh toán`,
            { style: { fontSize: "13px" } }
        );
    };

    // Add product to painter
    const handleAddProduct = ({ productName, price, qty }) => {
        setEmployees(prev => prev.map(e => {
            if (e.id !== addProductTarget?.id) return e;
            const newLog = [...(e.products_log || []), { productName, price, qty }];
            const newTotal = newLog.reduce((s, p) => s + (p.qty || 1), 0);
            return { ...e, products_log: newLog, products_finished: newTotal };
        }));
        toast.success(
            `Đã cộng ${qty} sản phẩm "${productName}" (${formatCurrency(price * qty)}) cho ${addProductTarget?.name}`,
            { style: { fontSize: "13px" } }
        );
        setAddProductTarget(null);
    };

    // Footer stats
    const totals = useMemo(() => {
        const all = filteredEmployees;
        const unpaid = all.filter(e => e.status === "Chưa thanh toán");
        const paid = all.filter(e => e.status === "Đã thanh toán");
        return {
            total: all.reduce((s, e) => s + calculateTotalSalary(e), 0),
            unpaid: unpaid.reduce((s, e) => s + calculateTotalSalary(e), 0),
            paid: paid.reduce((s, e) => s + calculateTotalSalary(e), 0),
            count: all.length,
        };
    }, [filteredEmployees]);

    const TH = ({ children, right, center }) => (
        <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${right ? "text-right" : center ? "text-center" : ""}`}
            style={{ color: "var(--text-placeholder)" }}>{children}</th>
    );

    return (
        <>
            <PageHelmet title="Lương nhân viên | Kế toán" />
            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                            <Wallet size={22} style={{ color: "var(--brand-primary)" }} />
                            Lương nhân viên
                        </h1>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            Quản lý và tính toán lương cho nhân viên theo từng tháng, bộ phận.
                        </p>
                    </div>

                    {/* Summary chips */}
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-center min-w-[120px]">
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Tổng quỹ lương</p>
                            <p className="text-[15px] font-black text-amber-600">
                                {formatCurrency(totals.total)}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-green-50 border border-green-100 text-center min-w-[120px]">
                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Đã thanh toán</p>
                            <p className="text-[15px] font-black text-green-600">
                                {formatCurrency(totals.paid)}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-center min-w-[120px]">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Chưa thanh toán</p>
                            <p className="text-[15px] font-black text-red-600">
                                {formatCurrency(totals.unpaid)}
                            </p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 mx-1" />
                        <div className="flex items-center gap-2 text-[13px] font-semibold px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: "var(--bg-card, #f5f5f5)", color: "var(--text-secondary)" }}>
                            <Calendar size={14} />
                            Kỳ lương: {monthFilter === "ALL" ? "Tất cả" : monthFilter}
                        </div>
                    </div>
                </div>


                {/* ── Table card ── */}
                <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

                    {/* Toolbar */}
                    <div className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center gap-3" style={{ borderColor: "var(--grid-border)" }}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsPeriodModalOpen(true)}
                                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-[13px] font-bold flex items-center gap-2 hover:bg-blue-700 transition cursor-pointer whitespace-nowrap">
                                <CalendarPlus size={16} />
                                Tạo kỳ lương mới
                            </button>
                            <button onClick={() => { setEmployeeToEdit(null); setIsModalOpen(true); }}
                                className="h-9 px-3.5 rounded-lg flex items-center gap-1.5 text-[13px] font-bold cursor-pointer hover:opacity-90 transition shrink-0"
                                style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                                <Plus size={15} strokeWidth={2.5} /> Thêm nhân viên
                            </button>
                            <div className="relative w-full max-w-sm">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm theo mã NV, tên..."
                                    className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                    style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }} />
                                {search && (
                                    <button onClick={() => setSearch("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                                        style={{ color: "var(--text-placeholder)" }}><X size={14} /></button>
                                )}
                            </div>
                        </div>

                        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                            className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer shrink-0"
                            style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)", backgroundColor: "#fff" }}>
                            <option value="ALL">Tất cả các tháng</option>
                            {uniqueMonths.filter(m => m !== "ALL").sort((a, b) => {
                                const [m1, y1] = a.split("/");
                                const [m2, y2] = b.split("/");
                                return new Date(y2, m2 - 1) - new Date(y1, m1 - 1);
                            }).map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>

                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                            className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer shrink-0"
                            style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)", backgroundColor: "#fff" }}>
                            <option value="ALL">Tất cả bộ phận</option>
                            <option value="SALES">Nhân viên bán hàng</option>
                            <option value="ACCOUNTANT">Kế toán</option>
                            <option value="SANDER">Nhân viên giấy ráp</option>
                            <option value="PAINTER">Thợ sơn</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left relative">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                <tr>
                                    <TH>Mã NV</TH>
                                    <TH>Họ Tên</TH>
                                    <TH>Bộ Phận</TH>
                                    <TH>Kỳ Lương</TH>
                                    <TH right>Cách Tính / Đơn Giá</TH>
                                    <TH right>Thông Số Cụ Thể</TH>
                                    <TH right>Phụ Cấp / Thưởng</TH>
                                    <TH right>Tổng Lương</TH>
                                    <TH center>Trạng Thái</TH>
                                    <TH center>Ngày TT</TH>
                                    <th className="w-28 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => {
                                    const totalSalary = calculateTotalSalary(emp);
                                    let calcFormula = "";
                                    let specData = "";
                                    const isPainter = emp.type === "PAINTER";
                                    const isExpanded = expandedPainter === emp.id;

                                    if (emp.type === "SALES" || emp.type === "ACCOUNTANT") {
                                        calcFormula = "Lương tháng cố định";
                                        specData = formatCurrency(emp.base_salary);
                                    } else if (emp.type === "SANDER") {
                                        calcFormula = `${formatCurrency(emp.base_rate)} / ngày`;
                                        specData = `${emp.days_worked} ngày công`;
                                    } else if (emp.type === "PAINTER") {
                                        const logTotal = (emp.products_log || []).reduce((s, p) => s + (p.price * (p.qty || 1)), 0);
                                        calcFormula = logTotal > 0 ? "Đơn giá khác nhau / SP" : `${formatCurrency(emp.base_rate)} / SP`;
                                        specData = `${emp.products_finished} sản phẩm`;
                                    }

                                    return (
                                        <>
                                            <tr key={emp.id} className="group relative hover:bg-gray-50/50 transition-colors"
                                                style={{ borderBottom: isExpanded ? "none" : "1px solid var(--grid-border)" }}>

                                                <td className="px-4 py-3">
                                                    <span className="text-[12px] font-bold font-mono px-2 py-1 rounded"
                                                        style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                                                        {emp.id}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{emp.name}</p>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                                                        {getRoleIcon(emp.type)}
                                                        {emp.role}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 text-[12px]" style={{ color: "var(--text-placeholder)" }}>
                                                        <Calendar size={13} /> {emp.month}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{calcFormula}</span>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className="text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>{specData}</span>
                                                        {isPainter && emp.products_log?.length > 0 && (
                                                            <button onClick={() => setExpandedPainter(isExpanded ? null : emp.id)}
                                                                className="ml-1 p-0.5 rounded hover:bg-gray-100 cursor-pointer transition"
                                                                title="Xem chi tiết sản phẩm">
                                                                <ChevronDown size={13} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                                    style={{ color: "var(--text-placeholder)" }} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                                        {emp.allowance > 0 ? `+ ${formatCurrency(emp.allowance)}` : "—"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-[14px] font-bold text-amber-600">{formatCurrency(totalSalary)}</span>
                                                </td>

                                                {/* Clickable status badge */}
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => handleToggleStatus(emp.id)}
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md border cursor-pointer transition hover:opacity-80",
                                                            emp.status === "Đã thanh toán"
                                                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                                        )}>
                                                        {emp.status === "Đã thanh toán"
                                                            ? <CheckCircle2 size={11} />
                                                            : <Clock size={11} />}
                                                        {emp.status}
                                                    </button>
                                                </td>

                                                <td className="px-4 py-3 text-center text-[12px] font-medium text-gray-600">
                                                    {emp.payment_date || "-"}
                                                </td>

                                                {/* Hover action */}
                                                <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <div className="flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                        {isPainter && (
                                                            <button onClick={() => setAddProductTarget(emp)}
                                                                className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-green-50 cursor-pointer transition text-green-700"
                                                                title="Cộng sản phẩm mới">
                                                                <Plus size={13} strokeWidth={2.5} /> Cộng SP
                                                            </button>
                                                        )}
                                                        <button onClick={() => { setEmployeeToEdit(emp); setIsModalOpen(true); }}
                                                            className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-blue-50 cursor-pointer transition"
                                                            style={{ color: "var(--brand-primary)" }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                                            Sửa
                                                        </button>
                                                        <button onClick={() => setEmployeeToDelete(emp)}
                                                            className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold cursor-pointer transition text-red-600 hover:bg-red-50">
                                                            <Trash2 size={14} /> Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Painter product log expanded row */}
                                            {isPainter && isExpanded && (
                                                <tr key={`${emp.id}-log`} className="bg-gray-50/30">
                                                    <td colSpan={11} className="px-6 py-4">
                                                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                                                            <table className="w-full text-left text-[12px]">
                                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                                    <tr>
                                                                        <th className="px-4 py-2 font-bold text-gray-500 uppercase text-[10px] tracking-wider text-center w-[40px]">STT</th>
                                                                        <th className="px-4 py-2 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Tên mặt hàng/Sản phẩm</th>
                                                                        <th className="px-4 py-2 font-bold text-gray-500 uppercase text-[10px] tracking-wider text-center">Số lượng</th>
                                                                        <th className="px-4 py-2 font-bold text-gray-500 uppercase text-[10px] tracking-wider text-right">Đơn giá sơn</th>
                                                                        <th className="px-4 py-2 font-bold text-gray-500 uppercase text-[10px] tracking-wider text-right">Thành tiền</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {(emp.products_log || []).map((log, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                            <td className="px-4 py-2.5 text-center text-gray-400 font-medium">{idx + 1}</td>
                                                                            <td className="px-4 py-2.5 font-bold text-gray-900">{log.productName}</td>
                                                                            <td className="px-4 py-2.5 text-center font-bold text-gray-600">{log.qty}</td>
                                                                            <td className="px-4 py-2.5 text-right font-medium text-gray-600">{formatCurrency(log.price)}</td>
                                                                            <td className="px-4 py-2.5 text-right font-black text-gray-900">{formatCurrency(log.price * log.qty)}</td>
                                                                        </tr>
                                                                    ))}
                                                                    {emp.products_log?.length === 0 && (
                                                                        <tr>
                                                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">Chưa có dữ liệu sản phẩm chi tiết</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                                <tfoot className="bg-gray-50/50 font-bold border-t border-gray-100">
                                                                    <tr>
                                                                        <td colSpan={4} className="px-4 py-2 text-right text-gray-500 text-[11px] uppercase tracking-wider">Tổng cộng sản phẩm</td>
                                                                        <td className="px-4 py-2 text-right text-amber-600 text-[13px]">
                                                                            {formatCurrency((emp.products_log || []).reduce((s, p) => s + p.price * (p.qty || 1), 0))}
                                                                        </td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}

                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                                                    <Users size={28} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-sm font-medium mt-1">Không tìm thấy bản ghi lương nào phù hợp.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            {/* Create Period Modal */}
            <CreatePeriodModal
                isOpen={isPeriodModalOpen}
                onClose={() => setIsPeriodModalOpen(false)}
                onCreate={handleCreatePeriod}
            />

            {/* Employee Add/Edit Modal */}
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEmployeeToEdit(null); }}
                onSave={handleSaveEmployee}
                employeeToEdit={employeeToEdit}
            />

            {/* Add Product Modal (Painter) */}
            <AddProductModal
                isOpen={!!addProductTarget}
                onClose={() => setAddProductTarget(null)}
                employee={addProductTarget}
                onAdd={handleAddProduct}
            />

            {/* Confirm Delete Modal */}
            {employeeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEmployeeToDelete(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">Xóa nhân viên?</h2>
                            <p className="text-[13px] text-gray-500">
                                Bạn có chắc chắn muốn xóa nhân viên <span className="font-bold text-gray-900">{employeeToDelete.name}</span> khỏi danh sách lương?
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 border-t border-gray-100">
                            <button onClick={() => setEmployeeToDelete(null)}
                                className="h-10 px-5 rounded-xl text-[13px] font-bold border border-gray-200 text-gray-600 hover:bg-white cursor-pointer transition">
                                Hủy
                            </button>
                            <button onClick={handleDeleteEmployee}
                                className="h-10 px-5 rounded-xl text-[13px] font-bold bg-red-600 cursor-pointer text-white hover:bg-red-700 transition">
                                Có, xóa nhân viên
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
