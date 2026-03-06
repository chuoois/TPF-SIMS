import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, TrendingUp, Users, Building2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const REPORT_TABS = [
  { id: "revenue", label: "Doanh thu", icon: TrendingUp },
  { id: "debt_customer", label: "Công nợ khách", icon: Users },
  { id: "debt_supplier", label: "Công nợ NCC", icon: Building2 },
  { id: "inventory", label: "Tồn kho", icon: Package },
];

export default function OwnerReports() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // TODO: API theo từng loại báo cáo
  const revenueData = [];
  const debtCustomerData = [];
  const debtSupplierData = [];
  const inventoryData = [];

  return (
    <>
      <PageHelmet title="Báo cáo | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
          <p className="mt-1 text-gray-500">Báo cáo doanh thu, công nợ và tồn kho.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:bg-white/60"
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter theo thời gian */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              {(activeTab === "revenue" || activeTab === "inventory") && (
                <>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Tháng</label>
                    <Input type="month" value={month ? `${year}-${month.padStart(2, "0")}` : ""} onChange={(e) => { const [y, m] = (e.target.value || "").split("-"); setYear(y || ""); setMonth(m || ""); }} className="w-[160px]" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Hoặc từ ngày – đến ngày</label>
                    <div className="flex gap-2">
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px]" />
                      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px]" />
                    </div>
                  </div>
                </>
              )}
              <Button variant="default" size="default"><BarChart3 size={16} /> Xem báo cáo</Button>
              <Button variant="outline" size="default">Xuất Excel</Button>
            </div>
          </CardContent>
        </Card>

        {/* Nội dung báo cáo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {activeTab === "revenue" && "Báo cáo doanh thu"}
              {activeTab === "debt_customer" && "Công nợ khách hàng"}
              {activeTab === "debt_supplier" && "Công nợ nhà cung cấp"}
              {activeTab === "inventory" && "Báo cáo tồn kho"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "revenue" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Tổng doanh thu</p>
                    <p className="text-xl font-bold">0 ₫</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Số đơn</p>
                    <p className="text-xl font-bold">0</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Bảng chi tiết theo ngày/tháng sẽ hiển thị khi có dữ liệu.</p>
              </div>
            )}
            {activeTab === "debt_customer" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium">Khách hàng</th>
                      <th className="text-right py-3 px-2 font-medium">Tổng nợ</th>
                      <th className="text-right py-3 px-2 font-medium">Số đơn chưa thanh toán</th>
                      <th className="text-right py-3 px-2 font-medium w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debtCustomerData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">Chưa có công nợ khách.</td>
                      </tr>
                    ) : (
                      debtCustomerData.map((r) => (
                        <tr key={r.customer_id} className="border-b">
                          <td className="py-2 px-2">{r.customer_name}</td>
                          <td className="py-2 px-2 text-right">{r.total_debt}</td>
                          <td className="py-2 px-2 text-right">{r.unpaid_orders}</td>
                          <td className="py-2 px-2 text-right"><Button variant="outline" size="xs">Xem đơn</Button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "debt_supplier" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium">Nhà cung cấp</th>
                      <th className="text-right py-3 px-2 font-medium">Tổng nợ</th>
                      <th className="text-right py-3 px-2 font-medium w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debtSupplierData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-500">Chưa có công nợ NCC.</td>
                      </tr>
                    ) : (
                      debtSupplierData.map((r) => (
                        <tr key={r.supplier_id} className="border-b">
                          <td className="py-2 px-2">{r.supplier_name}</td>
                          <td className="py-2 px-2 text-right">{r.total_debt}</td>
                          <td className="py-2 px-2 text-right"><Button variant="outline" size="xs">Xem phiếu</Button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "inventory" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium">Mã SKU</th>
                      <th className="text-left py-3 px-2 font-medium">Sản phẩm</th>
                      <th className="text-left py-3 px-2 font-medium">Biến thể</th>
                      <th className="text-right py-3 px-2 font-medium">Tồn</th>
                      <th className="text-right py-3 px-2 font-medium">Đặt trước</th>
                      <th className="text-right py-3 px-2 font-medium">Tối thiểu</th>
                      <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">Chưa có dữ liệu tồn kho.</td>
                      </tr>
                    ) : (
                      inventoryData.map((r) => (
                        <tr key={r.sku_id} className="border-b">
                          <td className="py-2 px-2 font-medium">{r.sku_code}</td>
                          <td className="py-2 px-2">{r.product_name}</td>
                          <td className="py-2 px-2">{r.variant_name}</td>
                          <td className="py-2 px-2 text-right">{r.stock_quantity}</td>
                          <td className="py-2 px-2 text-right">{r.quantity_reserved}</td>
                          <td className="py-2 px-2 text-right">{r.min_stock_level}</td>
                          <td className="py-2 px-2">{r.sku_status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
