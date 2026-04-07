/**
 * Component AccountantHome
 * Tổng quan Tài chính cho Kế toán - Hiển thị Công nợ và Lương
 *
 * Updated Date: 17/03/2026
 */

import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { 
    Users, 
    ChevronRight, 
    Truck, 
    Wallet, 
    CheckCircle2, 
    Clock, 
    Hammer, 
    Paintbrush 
} from "lucide-react";

// ===================== STATIC DATA =====================
import { HOME_MOCK_DATA as MOCK_DATA } from "../mockData";

// ===================== HELPERS =====================
const formatCurrency = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Tr`;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getStatusColor = (status) => {
  switch (status) {
    case "Hoàn thành":
      return { bg: "var(--status-focus)", text: "var(--status-success)" };
    case "Chờ xử lý":
      return { bg: "#FFF7ED", text: "var(--status-pending)" };
    case "Đang giao":
      return { bg: "#EFF6FF", text: "var(--palette-dark-blue)" };
    case "Hủy":
      return { bg: "#FEF2F2", text: "var(--status-error)" };
    default:
      return { bg: "var(--bg-main)", text: "var(--text-secondary)" };
  }
};

// ===================== COMPONENT =====================
export default function AccountantHome() {
    const { customerDebt, supplierDebt, employeeSalary } = MOCK_DATA;

    return (
        <>
            <PageHelmet title="Tổng quan tài chính - TPF-SIMS" />

            <div
                className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 overflow-y-auto"
                style={{ backgroundColor: "var(--bg-main)" }}
            >
                {/* Header */}
                <div className="mb-6 shrink-0">
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                        Tổng quan tài chính
                    </h1>
                    <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                        Theo dõi công nợ khách hàng, nhà cung cấp và lương nhân viên.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Customer Debt Summary */}
                    <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                <Users size={20} />
                            </div>
                            <h3 className="text-[15px] font-bold text-gray-800">Công nợ khách hàng</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[12px] text-gray-500 font-medium">Tổng dư nợ:</span>
                                <span className="text-[16px] font-black text-red-600">
                                    {new Intl.NumberFormat("vi-VN").format(customerDebt.totalRemainingDebt)}₫
                                </span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="text-gray-400">Đơn đang nợ:</span>
                                <span className="font-bold text-gray-700">{customerDebt.remainingDebtOrders} đơn</span>
                            </div>
                            <Link to="/accountant/customer-debt" className="block text-center mt-2 py-2 text-[12px] font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                Chi tiết công nợ khách
                            </Link>
                        </div>
                    </div>

                    {/* Supplier Debt Summary */}
                    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                <Truck size={20} />
                            </div>
                            <h3 className="text-[15px] font-bold text-gray-800">Công nợ thu mua</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[12px] text-gray-500 font-medium">Tổng tiền nợ:</span>
                                <span className="text-[16px] font-black text-amber-600">
                                    {new Intl.NumberFormat("vi-VN").format(supplierDebt.totalRemainingDebt)}₫
                                </span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="text-gray-400">Nhà cung cấp nợ:</span>
                                <span className="font-bold text-gray-700">{supplierDebt.debtSuppliers} NCC</span>
                            </div>
                            <Link to="/accountant/supplier-debt" className="block text-center mt-2 py-2 text-[12px] font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                Chi tiết công nợ xưởng
                            </Link>
                        </div>
                    </div>

                    {/* Employee Salary Summary */}
                    <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                <Wallet size={20} />
                            </div>
                            <h3 className="text-[15px] font-bold text-gray-800">Lương nhân viên</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[12px] text-gray-500 font-medium">Quỹ lương tháng:</span>
                                <span className="text-[16px] font-black text-blue-600">
                                    {new Intl.NumberFormat("vi-VN").format(employeeSalary.totalFund)}₫
                                </span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="text-gray-400">Đã thanh toán:</span>
                                <span className="font-bold text-green-600">{employeeSalary.paidCount} NV</span>
                            </div>
                            <Link to="/accountant/employee-salary" className="block text-center mt-2 py-2 text-[12px] font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                Chi tiết bảng lương
                            </Link>
                        </div>
                    </div>
                </div>

        {/* ─────────────────────────────────────────
          4.  CÔNG NỢ KHÁCH HÀNG
        ───────────────────────────────────────── */}

        <div
          className="bg-white rounded-2xl shrink-0 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          {/* Header */}
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--grid-border)" }}>
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Users size={18} className="text-blue-500" />
              Công nợ khách hàng
            </h3>
            <Link to="/accountant/customer-debt" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4 p-5 border-b" style={{ borderColor: "var(--grid-border)" }}>
            {[
              { label: "Tổng đơn hàng", value: "5", color: "text-gray-800", sub: "nợ + đã tất toán" },
              { label: "Còn nợ", value: "4 đơn", color: "text-amber-600", sub: new Intl.NumberFormat("vi-VN").format(53700000) + "₫" },
              { label: "Đã tất toán", value: "1 đơn", color: "text-green-600", sub: "Toàn bộ số tiền đã thu" },
            ].map(kpi => (
              <div key={kpi.label} className="flex flex-col gap-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Mini table: top 3 debt orders */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {["Mã đơn", "Khách hàng", "Tổng tiền", "Đã thu", "Còn nợ", "Ngày đặt"].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i >= 2 && i <= 4 ? "text-right" : ""}`} style={{ color: "var(--text-placeholder)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "HD260314A1B2C3", customer: "Nguyễn Văn A", total: 15500000, paid: 5000000, date: "10/03/2026" },
                  { code: "HD260312X7Y8Z9", customer: "Lê Minh C",    total: 25000000, paid: 10000000, date: "05/03/2026" },
                  { code: "HD260313D4E5F6", customer: "Trần Thị B",   total: 8200000,  paid: 3000000, date: "12/03/2026" },
                ].map((row, idx) => {
                  const remaining = row.total - row.paid;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{row.code}</span></td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{row.customer}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{new Intl.NumberFormat("vi-VN").format(row.total)}₫</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{new Intl.NumberFormat("vi-VN").format(row.paid)}₫</td>
                      <td className="px-4 py-2.5 text-right font-bold text-amber-600">{new Intl.NumberFormat("vi-VN").format(remaining)}₫</td>
                      <td className="px-4 py-2.5 text-gray-400 text-[12px]">{row.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─────────────────────────────────────────
          5.  CÔNG NỢ THU MUA (nhà cung cấp)
        ───────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shrink-0 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--grid-border)" }}>
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Truck size={18} className="text-green-600" />
              Công nợ thu mua
            </h3>
            <Link to="/accountant/supplier-debt" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4 p-5 border-b" style={{ borderColor: "var(--grid-border)" }}>
            {[
              { label: "Nhà cung cấp", value: "4", color: "text-gray-800", sub: "đang theo dõi" },
              { label: "Đang có nợ", value: "3 NCC", color: "text-red-600", sub: new Intl.NumberFormat("vi-VN").format(550000000) + "₫" },
              { label: "Đã tất toán", value: "1 NCC", color: "text-green-600", sub: "Tổng kho gỗ Nam Hải" },
            ].map(kpi => (
              <div key={kpi.label} className="flex flex-col gap-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {["Mã NCC", "Nhà cung cấp", "Tổng nhập hàng", "Đã thanh toán", "Còn nợ"].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i >= 2 ? "text-right" : ""}`} style={{ color: "var(--text-placeholder)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "NCC-TAM",  name: "Xưởng gỗ mỹ nghệ Thành Tâm",    totalImport: 1250000000, debt: 350000000 },
                  { code: "NCC-PHAT", name: "Xưởng mộc nội thất Gia Phát",    totalImport: 890000000,  debt: 120000000 },
                  { code: "NCC-MINH", name: "Cơ sở sản xuất gỗ Minh Long",    totalImport: 620000000,  debt: 80000000 },
                  { code: "NCC-HAI",  name: "Tổng kho gỗ nguyên liệu Nam Hải", totalImport: 4500000000, debt: 0 },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                    <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{row.code}</span></td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{row.name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{new Intl.NumberFormat("vi-VN").format(row.totalImport)}₫</td>
                    <td className="px-4 py-2.5 text-right text-green-600 font-semibold">{new Intl.NumberFormat("vi-VN").format(row.totalImport - row.debt)}₫</td>
                    <td className="px-4 py-2.5 text-right">
                      {row.debt > 0
                        ? <span className="font-black text-red-600">{new Intl.NumberFormat("vi-VN").format(row.debt)}₫</span>
                        : <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Đã tất toán</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─────────────────────────────────────────
          6.  LƯƠNG NHÂN VIÊN
        ───────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shrink-0 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--grid-border)" }}>
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Wallet size={18} className="text-amber-500" />
              Lương nhân viên – Tháng 03/2026
            </h3>
            <Link to="/accountant/employee-salary" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4 p-5 border-b" style={{ borderColor: "var(--grid-border)" }}>
            {[
              { label: "Tổng nhân viên", value: "6",  color: "text-gray-800", sub: "3 loại bộ phận" },
              { label: "Chưa thanh toán", value: "4 NV", color: "text-red-600", sub: "Cần chi trả kỳ này" },
              { label: "Đã thanh toán", value: "2 NV", color: "text-green-600", sub: "NV002, NV006" },
              { label: "Tổng quỹ lương", value: new Intl.NumberFormat("vi-VN").format(11000000 + 8500000 + 8800000 + 10200000 + 18000000 + 17500000) + "₫", color: "text-amber-600", sub: "Tháng 03/2026" },
            ].map(kpi => (
              <div key={kpi.label} className="flex flex-col gap-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className={`text-[17px] font-black leading-tight ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {["Mã NV", "Họ tên", "Bộ phận", "Cách tính", "Tổng lương", "Trạng thái"].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right" : i === 5 ? "text-center" : ""}`} style={{ color: "var(--text-placeholder)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "NV001", name: "Nguyễn Thị Mai", role: "Nhân viên bán hàng", type: "SALES",   calc: "Lương tháng cố định",    total: 11000000, status: "Chưa thanh toán" },
                  { id: "NV002", name: "Trần Văn Khoa",  role: "Nhân viên bán hàng", type: "SALES",   calc: "Lương tháng cố định",    total: 8500000,  status: "Đã thanh toán" },
                  { id: "NV003", name: "Lê Đình Chinh",  role: "Nhân viên giấy ráp", type: "SANDER",  calc: "400.000₫ × 22 ngày",     total: 8800000,  status: "Chưa thanh toán" },
                  { id: "NV004", name: "Phạm Xuân Đạt",  role: "Nhân viên giấy ráp", type: "SANDER",  calc: "400.000₫ × 25 ngày",     total: 10200000, status: "Chưa thanh toán" },
                  { id: "NV005", name: "Đỗ Hữu Hùng",   role: "Thợ sơn",            type: "PAINTER", calc: "150.000₫ × 120 SP",      total: 18000000, status: "Chưa thanh toán" },
                  { id: "NV006", name: "Vũ Tấn Tài",    role: "Thợ sơn",            type: "PAINTER", calc: "200.000₫ × 85 SP",       total: 17500000, status: "Đã thanh toán" },
                ].map((emp, idx) => {
                  const isPaid = emp.status === "Đã thanh toán";
                  const RoleIcon = emp.type === "SALES" ? Users : emp.type === "SANDER" ? Hammer : Paintbrush;
                  const roleColor = emp.type === "SALES" ? "text-blue-600" : emp.type === "SANDER" ? "text-amber-600" : "text-green-600";
                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{emp.id}</span></td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{emp.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`flex items-center gap-1 text-[12px] font-medium ${roleColor}`}>
                          <RoleIcon size={13} />{emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-gray-500">{emp.calc}</td>
                      <td className="px-4 py-2.5 text-right font-black text-amber-600">{new Intl.NumberFormat("vi-VN").format(emp.total)}₫</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                          {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ backgroundColor: "var(--grid-header-bg)", borderTop: "1px solid var(--grid-border)" }}>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-[12px] font-black uppercase tracking-wider text-gray-500">Tổng quỹ lương</td>
                  <td className="px-4 py-3 text-right text-[15px] font-black text-amber-600">{new Intl.NumberFormat("vi-VN").format(11000000 + 8500000 + 8800000 + 10200000 + 18000000 + 17500000)}₫</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
