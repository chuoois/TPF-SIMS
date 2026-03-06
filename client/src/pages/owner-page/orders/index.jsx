import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, FileOutput, FileInput } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "customer", label: "Đơn khách", icon: FileOutput },
  { id: "export", label: "Đơn xuất xưởng", icon: FileOutput },
  { id: "import", label: "Đơn nhập xưởng", icon: FileInput },
];

export default function OwnerOrders() {
  const [activeTab, setActiveTab] = useState("customer");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  // TODO: API - danh sách đơn theo tab và filter
  const orders = [];
  const exportOrders = [];
  const importOrders = [];

  return (
    <>
      <PageHelmet title="Đơn hàng | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="mt-1 text-gray-500">Danh sách đơn hàng khách, đơn xuất và nhập xưởng.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {TABS.map((tab) => {
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

        {/* Filter (cho Đơn khách) */}
        {activeTab === "customer" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex items-center gap-2 min-w-[200px]">
                  <label className="text-sm text-gray-600 whitespace-nowrap">Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="pending_owner">Chờ chủ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="in_production">Đang sản xuất</option>
                    <option value="shipped">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Từ ngày</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Đến ngày</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-gray-600 block mb-1">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      placeholder="Mã đơn, tên khách..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button variant="default" size="default">
                  <Filter size={16} />
                  Lọc
                </Button>
                <Button variant="outline" size="default" onClick={() => { setStatusFilter(""); setDateFrom(""); setDateTo(""); setSearch(""); }}>
                  Đặt lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bảng theo tab */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {activeTab === "customer" && "Danh sách đơn khách"}
              {activeTab === "export" && "Danh sách đơn xuất xưởng"}
              {activeTab === "import" && "Danh sách đơn nhập xưởng"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "customer" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium">Mã đơn</th>
                      <th className="text-left py-3 px-2 font-medium">Khách hàng</th>
                      <th className="text-left py-3 px-2 font-medium">Ngày đặt</th>
                      <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                      <th className="text-right py-3 px-2 font-medium">Giá kiến nghị</th>
                      <th className="text-right py-3 px-2 font-medium">Final price</th>
                      <th className="text-right py-3 px-2 font-medium">Đặt cọc</th>
                      <th className="text-right py-3 px-2 font-medium w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          Chưa có đơn hàng. Khi có dữ liệu sẽ hiển thị tại đây.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <Link to={`/owner/orders/${o.id}`} className="text-primary hover:underline font-medium">
                              {o.order_code}
                            </Link>
                          </td>
                          <td className="py-2 px-2">{o.customer_name}</td>
                          <td className="py-2 px-2">{o.order_date}</td>
                          <td className="py-2 px-2">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              {o.order_status}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">{o.suggested_price}</td>
                          <td className="py-2 px-2 text-right">{o.final_price ?? "—"}</td>
                          <td className="py-2 px-2 text-right">{o.deposit_amount}</td>
                          <td className="py-2 px-2 text-right">
                            <Button variant="outline" size="xs" asChild>
                              <Link to={`/owner/orders/${o.id}`}><Eye size={14} /> Xem</Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "export" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium">Mã phiếu</th>
                      <th className="text-left py-3 px-2 font-medium">Ngày xuất</th>
                      <th className="text-left py-3 px-2 font-medium">Loại</th>
                      <th className="text-left py-3 px-2 font-medium">Đơn hàng</th>
                      <th className="text-right py-3 px-2 font-medium">Số mặt hàng</th>
                      <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                      <th className="text-right py-3 px-2 font-medium w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          Chưa có đơn xuất xưởng.
                        </td>
                      </tr>
                    ) : (
                      exportOrders.map((e) => (
                        <tr key={e.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{e.export_code}</td>
                          <td className="py-2 px-2">{e.export_date}</td>
                          <td className="py-2 px-2">{e.export_type}</td>
                          <td className="py-2 px-2">{e.order_code ?? "—"}</td>
                          <td className="py-2 px-2 text-right">{e.total_items}</td>
                          <td className="py-2 px-2">{e.status}</td>
                          <td className="py-2 px-2 text-right">
                            <Button variant="outline" size="xs"><Eye size={14} /> Xem</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "import" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium">Mã phiếu</th>
                      <th className="text-left py-3 px-2 font-medium">Nhà cung cấp</th>
                      <th className="text-left py-3 px-2 font-medium">Ngày nhập</th>
                      <th className="text-right py-3 px-2 font-medium">Tổng tiền</th>
                      <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                      <th className="text-right py-3 px-2 font-medium w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Chưa có đơn nhập xưởng.
                        </td>
                      </tr>
                    ) : (
                      importOrders.map((i) => (
                        <tr key={i.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{i.import_code}</td>
                          <td className="py-2 px-2">{i.supplier_name}</td>
                          <td className="py-2 px-2">{i.import_date}</td>
                          <td className="py-2 px-2 text-right">{i.total_amount}</td>
                          <td className="py-2 px-2">{i.status}</td>
                          <td className="py-2 px-2 text-right">
                            <Button variant="outline" size="xs"><Eye size={14} /> Xem</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* Phân trang placeholder */}
            <div className="flex justify-end mt-4 text-sm text-gray-500">
              Hiển thị 0–0 / 0
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
