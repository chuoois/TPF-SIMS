import { useState, useMemo } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Search, X, Users, Wallet, Calendar, Hammer, Paintbrush, Plus, Eye, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import EmployeeModal from "./EmployeeModal";

/**
 * Accountant Employee Salary
 * Kế toán lương nhân viên (Mock data)
 *
 * Tính lương theo từng loại nhân viên:
 *  - Nhân viên bán hàng: trả lương theo tháng (cộng hưởng phụ cấp nếu có).
 *  - Nhân viên giấy ráp: trả theo ngày công (400.000 VNĐ/ngày).
 *  - Thợ sơn: tính lương theo số lượng sản phẩm hoàn thành.
 */

const formatCurrency = (n) => n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const MOCK_EMPLOYEES = [
    {
        id: "NV001",
        name: "Nguyễn Thị Mai",
        role: "Nhân viên bán hàng",
        type: "SALES",
        base_salary: 10000000,
        days_worked: 26,
        allowance: 1000000, // Phụ cấp ăn trưa, điện thoại
        products_finished: 0,
        status: "Chưa thanh toán",
        month: "03/2026"
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
        status: "Đã thanh toán",
        month: "03/2026"
    },
    {
        id: "NV003",
        name: "Lê Đình Chinh",
        role: "Nhân viên giấy ráp",
        type: "SANDER",
        base_rate: 400000, // 400k/ngày
        days_worked: 22,
        allowance: 0,
        products_finished: 0,
        status: "Chưa thanh toán",
        month: "03/2026"
    },
    {
        id: "NV004",
        name: "Phạm Xuân Đạt",
        role: "Nhân viên giấy ráp",
        type: "SANDER",
        base_rate: 400000, // 400k/ngày
        days_worked: 25,
        allowance: 200000, // Thưởng chuyên cần
        products_finished: 0,
        status: "Chưa thanh toán",
        month: "03/2026"
    },
    {
        id: "NV005",
        name: "Đỗ Hữu Hùng",
        role: "Thợ sơn",
        type: "PAINTER",
        base_rate: 150000, // 150k/sản phẩm hoàn thành
        days_worked: 26,
        allowance: 0,
        products_finished: 120, // Số lượng SP hoàn thành
        status: "Chưa thanh toán",
        month: "03/2026"
    },
    {
        id: "NV006",
        name: "Vũ Tấn Tài",
        role: "Thợ sơn",
        type: "PAINTER",
        base_rate: 200000, // Hàng kỹ, 200k/sản phẩm
        days_worked: 20,
        allowance: 500000, // Hỗ trợ độc hại
        products_finished: 85,
        status: "Đã thanh toán",
        month: "03/2026"
    }
];

// Helpers
const getRoleIcon = (type) => {
    switch (type) {
        case "SALES": return <Users size={14} className="text-blue-600" />;
        case "SANDER": return <Hammer size={14} className="text-amber-600" />;
        case "PAINTER": return <Paintbrush size={14} className="text-green-600" />;
        default: return <Users size={14} />;
    }
};

const calculateTotalSalary = (emp) => {
    let total = 0;
    if (emp.type === "SALES") {
        total = emp.base_salary + emp.allowance;
    } else if (emp.type === "SANDER") {
        total = (emp.base_rate * emp.days_worked) + emp.allowance;
    } else if (emp.type === "PAINTER") {
        total = (emp.base_rate * emp.products_finished) + emp.allowance;
    }
    return total;
};

export default function AccountantEmployeeSalary() {
    const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);

    // Delete confirm modal state
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    const filteredEmployees = useMemo(() => {
        let r = employees;
        if (roleFilter !== "ALL") {
            r = r.filter(emp => emp.type === roleFilter);
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
    }, [employees, search, roleFilter]);

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
                </div>

                {/* ── Table card ── */}
                <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    
                    {/* Toolbar: filter & search */}
                    <div className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center gap-3" style={{ borderColor: "var(--grid-border)" }}>
                        <div className="flex-1 flex gap-3 w-full max-w-sm">
                            <button onClick={() => { setEmployeeToEdit(null); setIsModalOpen(true); }}
                                className="h-9 px-3.5 rounded-lg flex items-center gap-1.5 text-[13px] font-bold cursor-pointer hover:opacity-90 transition shrink-0"
                                style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                                <Plus size={15} strokeWidth={2.5} /> Thêm nhân viên
                            </button>
                            <div className="relative w-full">
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
                        
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                            className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer shrink-0"
                            style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)", backgroundColor: "#fff" }}>
                            <option value="ALL">Tất cả bộ phận</option>
                            <option value="SALES">Nhân viên bán hàng</option>
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
                                    <th className="w-24 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => {
                                    const totalSalary = calculateTotalSalary(emp);
                                    let calcFormula = "";
                                    let specData = "";

                                    if (emp.type === "SALES") {
                                        calcFormula = "Lương tháng cố định";
                                        specData = formatCurrency(emp.base_salary);
                                    } else if (emp.type === "SANDER") {
                                        calcFormula = `${formatCurrency(emp.base_rate)} / ngày`;
                                        specData = `${emp.days_worked} ngày công`;
                                    } else if (emp.type === "PAINTER") {
                                        calcFormula = `${formatCurrency(emp.base_rate)} / SP`;
                                        specData = `${emp.products_finished} sản phẩm`;
                                    }

                                    return (
                                        <tr key={emp.id} className="group relative hover:bg-gray-50/50 transition-colors"
                                            style={{ borderBottom: "1px solid var(--grid-border)" }}>
                                            
                                            <td className="px-4 py-3">
                                                <span className="text-[12px] font-bold font-mono px-2 py-1 rounded"
                                                    style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                                                    {emp.id}
                                                </span>
                                            </td>
                                            
                                            <td className="px-4 py-3">
                                                <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                                                    {emp.name}
                                                </p>
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
                                                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                                    {calcFormula}
                                                </span>
                                            </td>
                                            
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>
                                                    {specData}
                                                </span>
                                            </td>
                                            
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                                    {emp.allowance > 0 ? `+ ${formatCurrency(emp.allowance)}` : "—"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <span className="text-[14px] font-bold text-amber-600">
                                                    {formatCurrency(totalSalary)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md border
                                                    ${emp.status === "Đã thanh toán" 
                                                        ? "bg-green-50 text-green-700 border-green-200" 
                                                        : "bg-red-50 text-red-600 border-red-200"}`}>
                                                    {emp.status}
                                                </span>
                                            </td>

                                            {/* Spacer */}
                                            <td className="px-4 py-3"></td>

                                            {/* Hover action */}
                                            <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                    <button onClick={() => { setEmployeeToEdit(emp); setIsModalOpen(true); }}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-blue-50 cursor-pointer transition"
                                                        style={{ color: "var(--brand-primary)" }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                        Sửa
                                                    </button>
                                                    <button onClick={() => setEmployeeToDelete(emp)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold cursor-pointer transition text-red-600 hover:bg-red-50">
                                                        <Trash2 size={14} /> Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                                                    <Users size={28} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-sm font-medium mt-1">
                                                    Không tìm thấy bản ghi lương nào phù hợp.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Footer summary */}
                    <div className="px-6 py-4 border-t flex justify-end gap-6" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                        <div className="text-right">
                            <span className="text-[12px] block mb-0.5" style={{ color: "var(--text-placeholder)" }}>Tổng số nhân viên hiển thị</span>
                            <span className="text-[15px] font-bold" style={{ color: "var(--text-main)" }}>{filteredEmployees.length}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[12px] block mb-0.5" style={{ color: "var(--text-placeholder)" }}>Tổng quỹ lương</span>
                            <span className="text-[16px] font-black text-amber-600">
                                {formatCurrency(filteredEmployees.reduce((sum, emp) => sum + calculateTotalSalary(emp), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <EmployeeModal 
                isOpen={isModalOpen} 
                onClose={() => {setIsModalOpen(false); setEmployeeToEdit(null)}} 
                onSave={handleSaveEmployee} 
                employeeToEdit={employeeToEdit} 
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
