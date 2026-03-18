import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Download,
   Search,
   Filter,
   Printer,
   CalendarDays,
   FileSpreadsheet,
   ChevronLeft,
   ChevronRight,
   TrendingDown,
   TrendingUp,
   PackageSearch
} from "lucide-react";
import { cn } from "@/lib/utils";

const REPORT_CATEGORIES = [
   { id: "sales", label: "Báo cáo Bán Hàng (Doanh thu & Lãi gộp)" },
   { id: "inventory", label: "Báo cáo Xuất Nhập Tồn (Kho)" },
   { id: "debt_customer", label: "Tổng Hợp Công Nợ Khách Hàng" },
   { id: "debt_supplier", label: "Tổng Hợp Công Nợ Nhà Cung Cấp" },
   { id: "cashflow", label: "Sổ Quỹ Thu Chi (Tiền Mặt/Ngân Hàng)" },
];

// Mock Data for Sales Report
const MOCK_SALES_DATA = [
   { id: "HD00102", date: "08/03/2026", customer: "Nguyễn Văn A", grossSales: 25000000, discount: 500000, netSales: 24500000, cogs: 18000000, grossProfit: 6500000, compensation: 0 },
   { id: "DH-SAN-005", date: "13/03/2026", customer: "Hoàng Văn Thái (Hủy đơn/Thu cọc)", grossSales: 4200000, discount: 0, netSales: 0, cogs: 0, grossProfit: 1000000, compensation: 1000000 },
   { id: "DH-SAN-004", date: "09/03/2026", customer: "Phạm Thành Nam", grossSales: 45000000, discount: 0, netSales: 45000000, cogs: 32000000, grossProfit: 13000000, compensation: 0 },
   { id: "DH-SAN-002", date: "11/03/2026", customer: "Lê Thị Lan (Lấy ngay)", grossSales: 5200000, discount: 0, netSales: 5200000, cogs: 3500000, grossProfit: 1700000, compensation: 0 },
   { id: "HD00104", date: "07/03/2026", customer: "Công ty Nội Thất An Trần", grossSales: 120000000, discount: 5000000, netSales: 115000000, cogs: 82000000, grossProfit: 33000000, compensation: 0 },
   { id: "HD00106", date: "06/03/2026", customer: "Khách lẻ tại shop", grossSales: 4200000, discount: 200000, netSales: 4000000, cogs: 2800000, grossProfit: 1200000, compensation: 0 },
   { id: "HD00107", date: "05/03/2026", customer: "Dự án Biệt thự Vinhome", grossSales: 350000000, discount: 15000000, netSales: 335000000, cogs: 240000000, grossProfit: 95000000, compensation: 0 },
];

const MOCK_INVENTORY_DATA = [
   { id: "SP001", name: "Sofa Góc Da L", category: "Sofa", unit: "Bộ", openingStock: 10, importQty: 5, exportQty: 12, closingStock: 3, stockValue: 36000000 },
   { id: "SP002", name: "Sập Gụ Tủ Chè", category: "Đồ Gỗ Mỹ Nghệ", unit: "Bộ", openingStock: 5, importQty: 2, exportQty: 4, closingStock: 3, stockValue: 120000000 },
   { id: "SP003", name: "Kệ Tivi Sồi Mỹ", category: "Kệ Tivi", unit: "Cái", openingStock: 15, importQty: 10, exportQty: 8, closingStock: 17, stockValue: 34000000 },
   { id: "SP004", name: "Bàn Trà Oval", category: "Bàn Trà", unit: "Cái", openingStock: 8, importQty: 0, exportQty: 6, closingStock: 2, stockValue: 3000000 },
   { id: "SP005", name: "Tủ Quần Áo 4C", category: "Tủ Quần Áo", unit: "Cái", openingStock: 6, importQty: 5, exportQty: 7, closingStock: 4, stockValue: 24000000 },
];

const MOCK_DEBT_CUSTOMER_DATA = [
   { id: "KH045", name: "Anh Hưng (Q7)", phone: "0901234567", openingDebt: 5000000, arisingDebt: 15000000, paidAmount: 0, closingDebt: 20000000 },
   { id: "KH012", name: "Chị Lan Anh", phone: "0987654321", openingDebt: 0, arisingDebt: 4500000, paidAmount: 2000000, closingDebt: 2500000 },
   { id: "KH088", name: "Công ty Nội Thất An Trần", phone: "0912345678", openingDebt: 15000000, arisingDebt: 115000000, paidAmount: 50000000, closingDebt: 80000000 },
   { id: "KH099", name: "Dự án Biệt thự Vinhome", phone: "0999888777", openingDebt: 0, arisingDebt: 335000000, paidAmount: 200000000, closingDebt: 135000000 },
];

const MOCK_CASHFLOW_DATA = [
   { id: "PT00101", date: "08/03/2026", type: "Thu", category: "Khách trả nợ", ref: "KH088", description: "Công ty Nội Thất An Trần trả đợt 1", inAmount: 50000000, outAmount: 0, method: "Chuyển khoản" },
   { id: "PT00104", date: "13/03/2026", type: "Thu", category: "Thu nhập khác", ref: "DH-SAN-005", description: "Thu hồi tiền cọc đơn DH-SAN-005 (Bồi thường)", inAmount: 1000000, outAmount: 0, method: "Chuyển khoản" },
   { id: "PT00105", date: "11/03/2026", type: "Thu", category: "Bán hàng", ref: "DH-SAN-002", description: "Bán hàng thu đủ đơn DH-SAN-002", inAmount: 5200000, outAmount: 0, method: "Tiền mặt" },
   { id: "PC00201", date: "08/03/2026", type: "Chi", category: "Thanh toán NCC", ref: "NCC005", description: "Trả tiền Gỗ An Cường", inAmount: 0, outAmount: 120000000, method: "Chuyển khoản" },
   { id: "PT00102", date: "07/03/2026", type: "Thu", category: "Khách trả nợ", ref: "KH012", description: "Chị Lan Anh đặt cọc", inAmount: 2000000, outAmount: 0, method: "Tiền mặt" },
   { id: "PC00202", date: "07/03/2026", type: "Chi", category: "Chi phí vận hành", ref: "-", description: "Tiền điện nước tháng 2", inAmount: 0, outAmount: 2500000, method: "Ủy nhiệm chi" },
   { id: "PT00103", date: "05/03/2026", type: "Thu", category: "Khách trả nợ", ref: "KH099", description: "Dự án Biệt thự Vinhome tạm ứng", inAmount: 200000000, outAmount: 0, method: "Chuyển khoản" },
];

const MOCK_DEBT_SUPPLIER_DATA = [
   { id: "NCC001", name: "Xưởng gỗ Thành Tâm", phone: "0901234567", openingDebt: 150000000, arisingDebt: 320000000, paidAmount: 120000000, closingDebt: 350000000 },
   { id: "NCC002", name: "Tổng kho gỗ Nam Hải", phone: "0912345678", openingDebt: 0, arisingDebt: 4500000000, paidAmount: 4500000000, closingDebt: 0 },
   { id: "NCC003", name: "Xưởng nội thất Gia Phát", phone: "0987654321", openingDebt: 50000000, arisingDebt: 150000000, paidAmount: 80000000, closingDebt: 120000000 },
];

const formatCurrency = (val) => new Intl.NumberFormat("vi-VN").format(val);

export default function OwnerReports() {
   const [searchParams, setSearchParams] = useSearchParams();
   const typeParam = searchParams.get("type");

   const [activeReport, setActiveReport] = useState(typeParam || "sales");
   const [dateRange, setDateRange] = useState("this_month");
   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(15);

   // Sync state if URL param changes
   useEffect(() => {
      if (typeParam && typeParam !== activeReport) {
         setActiveReport(typeParam);
         setCurrentPage(1);
      }
   }, [typeParam]);

   // Lấy danh sách dữ liệu tương ứng với báo cáo hiện tại
   const getCurrentDataList = () => {
      switch (activeReport) {
         case "sales": return MOCK_SALES_DATA;
         case "inventory": return MOCK_INVENTORY_DATA;
         case "debt_customer": return MOCK_DEBT_CUSTOMER_DATA;
         case "debt_supplier": return MOCK_DEBT_SUPPLIER_DATA;
         case "cashflow": return MOCK_CASHFLOW_DATA;
         default: return [];
      }
   };

   const currentList = getCurrentDataList();

   // Xử lý phân trang
   const totalItems = currentList.length;
   const totalPages = Math.ceil(totalItems / itemsPerPage);

   const paginatedData = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return currentList.slice(start, start + itemsPerPage);
   }, [currentList, currentPage]);

   // Handle thay đổi Tab
   const handleTabChange = (e) => {
      const newType = e.target.value;
      setActiveReport(newType);
      setCurrentPage(1);
      setSearchParams({ type: newType });
   };

   // Tính tổng cho báo cáo bán hàng (có thể tính trên toàn bộ hoặc chỉ trang hiện tại, ở đây tính trên toàn bộ)
   const salesTotals = useMemo(() => {
      return MOCK_SALES_DATA.reduce((acc, curr) => {
         acc.grossSales += curr.grossSales;
         acc.discount += curr.discount;
         acc.netSales += curr.netSales;
         acc.cogs += curr.cogs;
         acc.compensation += (curr.compensation || 0);
         acc.grossProfit += curr.grossProfit;
         return acc;
      }, { grossSales: 0, discount: 0, netSales: 0, cogs: 0, grossProfit: 0, compensation: 0 });
   }, []);

   const inventoryTotals = useMemo(() => {
      return MOCK_INVENTORY_DATA.reduce((acc, curr) => {
         acc.openingStock += curr.openingStock;
         acc.importQty += curr.importQty;
         acc.exportQty += curr.exportQty;
         acc.closingStock += curr.closingStock;
         acc.stockValue += curr.stockValue;
         return acc;
      }, { openingStock: 0, importQty: 0, exportQty: 0, closingStock: 0, stockValue: 0 });
   }, []);

   const debtCustomerTotals = useMemo(() => {
      return MOCK_DEBT_CUSTOMER_DATA.reduce((acc, curr) => {
         acc.openingDebt += curr.openingDebt;
         acc.arisingDebt += curr.arisingDebt;
         acc.paidAmount += curr.paidAmount;
         acc.closingDebt += curr.closingDebt;
         return acc;
      }, { openingDebt: 0, arisingDebt: 0, paidAmount: 0, closingDebt: 0 });
   }, []);

   const debtSupplierTotals = useMemo(() => {
      return MOCK_DEBT_SUPPLIER_DATA.reduce((acc, curr) => {
         acc.openingDebt += curr.openingDebt;
         acc.arisingDebt += curr.arisingDebt;
         acc.paidAmount += curr.paidAmount;
         acc.closingDebt += curr.closingDebt;
         return acc;
      }, { openingDebt: 0, arisingDebt: 0, paidAmount: 0, closingDebt: 0 });
   }, []);

   const cashflowTotals = useMemo(() => {
      return MOCK_CASHFLOW_DATA.reduce((acc, curr) => {
         acc.inAmount += curr.inAmount;
         acc.outAmount += curr.outAmount;
         return acc;
      }, { inAmount: 0, outAmount: 0 });
   }, []);

   return (
      <>
         <PageHelmet title="Báo Cáo Thống Kê | TPF-SIMS" />
         <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8fafc] -m-6 p-4 md:p-6 overflow-hidden">

            {/* Header & Filter Bar (Excel Style) */}
            <div className="bg-white border text-sm border-slate-200 rounded-t-xl shadow-sm flex flex-col shrink-0">

               {/* Top Title & Actions */}
               <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileSpreadsheet size={24} strokeWidth={2} />
                     </div>
                     <div>
                        <h1 className="text-[16px] font-bold text-slate-900 leading-tight">Báo Cáo Thống Kê</h1>
                        <p className="text-[13px] text-slate-500 font-medium">Bảng kê chi tiết dữ liệu </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">

                     <Button className="h-9 px-3 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                        <Download size={16} /> Xuất Excel
                     </Button>
                  </div>
               </div>

               {/* Report Selection & Filters */}
               <div className="p-4 flex flex-col xl:flex-row gap-4 xl:items-center justify-between bg-slate-50/50">

                  <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                     {/* Chọn loại báo cáo */}
                     <div className="relative min-w-[280px]">
                        <select
                           className="w-full h-10 pl-3 pr-10 rounded-lg text-[13px] font-bold text-slate-900 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none cursor-pointer"
                           value={activeReport}
                           onChange={handleTabChange}
                           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                        >
                           {REPORT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                     </div>

                     {/* Chọn thời gian */}
                     <div className="relative min-w-[160px]">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <select
                           className="w-full h-10 pl-9 pr-10 rounded-lg text-[13px] font-semibold text-slate-700 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none cursor-pointer"
                           value={dateRange}
                           onChange={(e) => setDateRange(e.target.value)}
                           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                        >
                           <option value="today">Hôm nay</option>
                           <option value="yesterday">Hôm qua</option>
                           <option value="this_week">Tuần này</option>
                           <option value="this_month">Tháng này</option>
                           <option value="last_month">Tháng trước</option>
                        </select>
                     </div>
                  </div>

                  {/* Search & Extra Filter */}
                  <div className="flex items-center gap-2 shrink-0">
                     <div className="relative w-full sm:w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                           placeholder="Tìm kiếm chứng từ, khách hàng..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-9 h-10 rounded-lg bg-white border-slate-300 text-[13px] shadow-sm"
                        />
                     </div>
                     <Button variant="outline" className="h-10 px-3 rounded-lg border-slate-300 bg-white"><Filter size={16} className="text-slate-600" /></Button>
                  </div>

               </div>
            </div>

            {/* Data Grid Area */}
            <div className="flex-1 bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm overflow-hidden flex flex-col">

               {activeReport === "sales" && (
                  <>
                     <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                           <thead className="sticky top-0 z-10">
                              <tr className="bg-slate-100 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[50px] text-center">STT</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[120px]">Chứng từ</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[100px] text-center">Ngày ghi</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200">Khách Hàng</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[140px]">Tổng tiền bán hàng</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[120px]">CK / Giảm giá</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px] bg-amber-50/50">Doanh thu bồi thường (Cọc)</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px]">Doanh thu sau giảm giá</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px]">Giá Vốn (COGS)</th>
                                 <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px] bg-slate-200/50">Lợi Nhuận Gộp</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-200">
                              {paginatedData.map((row, idx) => (
                                 <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="py-3 px-4 text-[13px] text-slate-500 font-medium text-center border-r border-slate-100">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                    <td className="py-3 px-4 text-[13px] font-bold text-blue-600 border-r border-slate-100 cursor-pointer group-hover:underline text-center">{row.id}</td>
                                    <td className="py-3 px-4 text-[13px] text-slate-600 font-medium border-r border-slate-100 text-center">{row.date}</td>
                                    <td className="py-3 px-4 text-[13px] text-slate-800 font-semibold border-r border-slate-100">{row.customer}</td>
                                    <td className="py-3 px-4 text-[13px] text-slate-900 font-bold text-right border-r border-slate-100">{formatCurrency(row.grossSales)}</td>
                                    <td className="py-3 px-4 text-[13px] text-rose-600 font-semibold text-right border-r border-slate-100">{row.discount > 0 ? `-${formatCurrency(row.discount)}` : 0}</td>
                                    <td className="py-3 px-4 text-[13px] text-amber-600 font-bold text-right border-r border-slate-100 bg-amber-50/30">{row.compensation > 0 ? formatCurrency(row.compensation) : "-"}</td>
                                    <td className="py-3 px-4 text-[13px] text-slate-900 font-black text-right border-r border-slate-100">{formatCurrency(row.netSales)}</td>
                                    <td className="py-3 px-4 text-[13px] text-slate-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.cogs)}</td>
                                    <td className="py-3 px-4 text-[13px] text-emerald-600 font-black text-right border-r border-slate-100 bg-slate-50/50">{formatCurrency(row.grossProfit)}</td>
                                 </tr>
                              ))}
                           </tbody>
                           <tfoot className="sticky bottom-0 z-10 bg-emerald-50 shadow-[0_-1px_0_0_#cbd5e1]">
                              <tr>
                                 <td colSpan={5} className="py-3 px-4 text-[13px] font-black text-slate-800 border-r border-slate-300/30 text-right uppercase">Tổng Cộng:</td>
                                 <td className="py-3 px-4 text-[14px] font-black text-slate-900 text-right border-r border-slate-300/30">{formatCurrency(salesTotals.grossSales)}</td>
                                 <td className="py-3 px-4 text-[13px] font-bold text-rose-600 text-right border-r border-slate-300/30">-{formatCurrency(salesTotals.discount)}</td>
                                 <td className="py-3 px-4 text-[14px] font-black text-amber-700 text-right border-r border-slate-300/30 bg-amber-100/30">{formatCurrency(salesTotals.compensation)}</td>
                                 <td className="py-3 px-4 text-[14px] font-black text-slate-900 text-right border-r border-slate-300/30">{formatCurrency(salesTotals.netSales)}</td>
                                 <td className="py-3 px-4 text-[13px] font-bold text-slate-700 text-right border-r border-slate-300/30">{formatCurrency(salesTotals.cogs)}</td>
                                 <td className="py-3 px-4 text-[14px] font-black text-emerald-700 text-right border-r border-slate-300/30 bg-emerald-100/50">{formatCurrency(salesTotals.grossProfit)}</td>
                              </tr>
                           </tfoot>
                        </table>
                     </div>
                  </>
               )}

               {activeReport === "inventory" && (
                  <div className="flex-1 overflow-auto">
                     <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="sticky top-0 z-10">
                           <tr className="bg-slate-100 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[50px] text-center">STT</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[100px]">Mã Hàng</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200">Tên Sản Phẩm</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[120px]">Nhóm</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-center w-[80px]">ĐVT</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[100px]">Tồn Đầu Kỳ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[100px]">Nhập Trong Kỳ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[100px]">Xuất Trong Kỳ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[100px] bg-slate-200/50">Tồn Cuối Kỳ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px]">Giá Trị Tồn Kho</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                           {paginatedData.map((row, idx) => (
                              <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                                 <td className="py-3 px-4 text-[13px] text-slate-500 font-medium text-center border-r border-slate-100">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                 <td className="py-3 px-4 text-[13px] font-bold text-blue-600 border-r border-slate-100 cursor-pointer group-hover:underline">{row.id}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-800 font-semibold border-r border-slate-100">{row.name}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-medium border-r border-slate-100">{row.category}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-medium text-center border-r border-slate-100">{row.unit}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.openingStock)}</td>
                                 <td className="py-3 px-4 text-[13px] text-emerald-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.importQty)}</td>
                                 <td className="py-3 px-4 text-[13px] text-rose-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.exportQty)}</td>
                                 <td className="py-3 px-4 text-[13px] text-indigo-700 font-black text-right border-r border-slate-100 bg-slate-50/50">{formatCurrency(row.closingStock)}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-900 font-bold text-right border-r border-slate-100">{formatCurrency(row.stockValue)}</td>
                              </tr>
                           ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-10 bg-emerald-50 shadow-[0_-1px_0_0_#cbd5e1]">
                           <tr>
                              <td colSpan={5} className="py-3 px-4 text-[13px] font-black text-slate-800 border-r border-slate-300/30 text-right uppercase">Tổng Cộng:</td>
                              <td className="py-3 px-4 text-[14px] font-black text-slate-700 text-right border-r border-slate-300/30">{formatCurrency(inventoryTotals.openingStock)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-emerald-700 text-right border-r border-slate-300/30">{formatCurrency(inventoryTotals.importQty)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-rose-700 text-right border-r border-slate-300/30">{formatCurrency(inventoryTotals.exportQty)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-indigo-800 text-right border-r border-slate-300/30 bg-emerald-100/50">{formatCurrency(inventoryTotals.closingStock)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-slate-900 text-right border-r border-slate-300/30">{formatCurrency(inventoryTotals.stockValue)}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               )}

               {activeReport === "debt_customer" && (
                  <div className="flex-1 overflow-auto">
                     <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="sticky top-0 z-10">
                           <tr className="bg-slate-100 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[50px] text-center">STT</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[100px] text-center">Mã KH</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-left">Tên Khách Hàng</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[120px] text-center">Điện thoại</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px]">Nợ Đầu Kỳ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[150px]">Tiền Khách Mua Nợ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[150px]">Tiền Khách Đã Trả</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px] bg-slate-200/50">Nợ Cuối Kỳ</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                           {paginatedData.map((row, idx) => (
                              <tr key={row.id} className="hover:blue-50/50 transition-colors group">
                                 <td className="py-3 px-4 text-[13px] text-slate-500 font-medium text-center border-r border-slate-100">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                 <td className="py-3 px-4 text-[13px] font-bold text-blue-600 border-r border-slate-100 cursor-pointer group-hover:underline text-center">{row.id}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-800 font-semibold border-r border-slate-100 text-left">{row.name}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-medium border-r border-slate-100 text-center">{row.phone}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.openingDebt)}</td>
                                 <td className="py-3 px-4 text-[13px] text-rose-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.arisingDebt)}</td>
                                 <td className="py-3 px-4 text-[13px] text-emerald-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.paidAmount)}</td>
                                 <td className="py-3 px-4 text-[13px] text-orange-600 font-black text-right border-r border-slate-100 bg-slate-50/50">{formatCurrency(row.closingDebt)}</td>
                              </tr>
                           ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-10 bg-emerald-50 shadow-[0_-1px_0_0_#cbd5e1]">
                           <tr>
                              <td colSpan={4} className="py-3 px-4 text-[13px] font-black text-slate-800 border-r border-slate-300/30 text-right uppercase">Tổng Cộng:</td>
                              <td className="py-3 px-4 text-[14px] font-black text-slate-700 text-right border-r border-slate-300/30">{formatCurrency(debtCustomerTotals.openingDebt)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-rose-700 text-right border-r border-slate-300/30">{formatCurrency(debtCustomerTotals.arisingDebt)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-emerald-700 text-right border-r border-slate-300/30">{formatCurrency(debtCustomerTotals.paidAmount)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-orange-700 text-right border-r border-slate-300/30 bg-emerald-100/50">{formatCurrency(debtCustomerTotals.closingDebt)}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               )}

               {activeReport === "debt_supplier" && (
                  <div className="flex-1 overflow-auto">
                     <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="sticky top-0 z-10">
                           <tr className="bg-slate-100 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[50px] text-center">STT</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[100px] text-center">Mã NCC</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-left">Tên Nhà Cung Cấp</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[120px] text-center">Điện thoại</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px]">Nợ Đầu Kỳ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[150px]">Phát Sinh Tăng (Nhập Hàng)</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[150px]">Phát Sinh Giảm (Đã Trả)</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px] bg-slate-200/50">Nợ Phải Trả</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                           {paginatedData.map((row, idx) => (
                              <tr key={row.id} className="hover:blue-50/50 transition-colors group">
                                 <td className="py-3 px-4 text-[13px] text-slate-500 font-medium text-center border-r border-slate-100">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                 <td className="py-3 px-4 text-[13px] font-bold text-blue-600 border-r border-slate-100 cursor-pointer group-hover:underline text-center">{row.id}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-800 font-semibold border-r border-slate-100 text-left">{row.name}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-medium border-r border-slate-100 text-center">{row.phone}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.openingDebt)}</td>
                                 <td className="py-3 px-4 text-[13px] text-rose-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.arisingDebt)}</td>
                                 <td className="py-3 px-4 text-[13px] text-emerald-600 font-semibold text-right border-r border-slate-100">{formatCurrency(row.paidAmount)}</td>
                                 <td className="py-3 px-4 text-[13px] text-red-600 font-black text-right border-r border-slate-100 bg-slate-50/50">{formatCurrency(row.closingDebt)}</td>
                              </tr>
                           ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-10 bg-emerald-50 shadow-[0_-1px_0_0_#cbd5e1]">
                           <tr>
                              <td colSpan={4} className="py-3 px-4 text-[13px] font-black text-slate-800 border-r border-slate-300/30 text-right uppercase">Tổng Cộng:</td>
                              <td className="py-3 px-4 text-[14px] font-black text-slate-700 text-right border-r border-slate-300/30">{formatCurrency(debtSupplierTotals.openingDebt)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-rose-700 text-right border-r border-slate-300/30">{formatCurrency(debtSupplierTotals.arisingDebt)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-emerald-700 text-right border-r border-slate-300/30">{formatCurrency(debtSupplierTotals.paidAmount)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-red-700 text-right border-r border-slate-300/30 bg-emerald-100/50">{formatCurrency(debtSupplierTotals.closingDebt)}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               )}

               {activeReport === "cashflow" && (
                  <div className="flex-1 overflow-auto">
                     <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="sticky top-0 z-10">
                           <tr className="bg-slate-100 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[50px] text-center">STT</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[120px] text-center">Số Chứng Từ</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[100px] text-center">Ngày ghi</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[100px] text-center">Loại Phiếu</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[160px]">Hạng Mục Thu/Chi</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px]">Số Tiền Thu</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-right w-[140px]">Số Tiền Chi</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 w-[120px] text-center">P.Thức</th>
                              <th className="py-3 px-4 text-[12px] font-bold text-slate-700 uppercase whitespace-nowrap border-r border-slate-200 text-left">Mô tả</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                           {paginatedData.map((row, idx) => (
                              <tr key={row.id} className="hover:blue-50/50 transition-colors group">
                                 <td className="py-3 px-4 text-[13px] text-slate-500 font-medium text-center border-r border-slate-100">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                 <td className="py-3 px-4 text-[13px] font-bold text-blue-600 border-r border-slate-100 cursor-pointer group-hover:underline text-center">{row.id}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-medium border-r border-slate-100 text-center">{row.date}</td>
                                 <td className="py-3 px-4 text-[13px] font-bold border-r border-slate-100 text-center">
                                    <span className={cn(
                                       "px-2 py-0.5 rounded text-[12px]",
                                       row.type === "Thu" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    )}>{row.type}</span>
                                 </td>
                                 <td className="py-3 px-4 text-[13px] text-slate-800 font-medium border-r border-slate-100">{row.category}</td>
                                 <td className="py-3 px-4 text-[13px] text-emerald-600 font-bold text-right border-r border-slate-100">{row.inAmount > 0 ? formatCurrency(row.inAmount) : "-"}</td>
                                 <td className="py-3 px-4 text-[13px] text-rose-600 font-bold text-right border-r border-slate-100">{row.outAmount > 0 ? formatCurrency(row.outAmount) : "-"}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-medium border-r border-slate-100 text-center">{row.method}</td>
                                 <td className="py-3 px-4 text-[13px] text-slate-600 font-medium border-r border-slate-100 text-left">{row.description}</td>
                              </tr>
                           ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-10 bg-emerald-50 shadow-[0_-1px_0_0_#cbd5e1]">
                           <tr>
                              <td colSpan={5} className="py-3 px-4 text-[13px] font-black text-slate-800 border-r border-slate-300/30 text-right uppercase">Tổng Cộng :</td>
                              <td className="py-3 px-4 text-[14px] font-black text-emerald-700 text-right border-r border-slate-300/30">{formatCurrency(cashflowTotals.inAmount)}</td>
                              <td className="py-3 px-4 text-[14px] font-black text-rose-700 text-right border-r border-slate-300/30">{formatCurrency(cashflowTotals.outAmount)}</td>
                              <td colSpan={2} className="py-3 px-4 text-[14px] font-black text-slate-900 border-r border-slate-300/30 text-right">
                                 Dư quỹ: <span className={cashflowTotals.inAmount - cashflowTotals.outAmount >= 0 ? "text-emerald-700" : "text-rose-700"}>{formatCurrency(cashflowTotals.inAmount - cashflowTotals.outAmount)}</span>
                              </td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               )}

               {/* Pagination Footer */}
               {totalPages > 0 && (
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
                           {totalItems}
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
                              {Math.min(currentPage * itemsPerPage, totalItems)}
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
      </>
   );
}
