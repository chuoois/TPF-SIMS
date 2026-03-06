import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Eye, UserPlus } from "lucide-react";

export default function OwnerProduction() {
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // TODO: API - danh sách production_order
  const productionOrders = [];

  return (
    <>
      <PageHelmet title="Quản lý sản xuất | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sản xuất</h1>
            <p className="mt-1 text-gray-500">Lệnh sản xuất, tiến độ và giao việc.</p>
          </div>
          <Button variant="default" size="default">
            <Plus size={16} />
            Tạo lệnh sản xuất
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-9 min-w-[160px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="IN_PROGRESS">Đang sản xuất</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="ON_HOLD">Tạm hoãn</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Từ ngày</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Đến ngày</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
              </div>
              <Button variant="default" size="default"><Filter size={16} /> Lọc</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách lệnh sản xuất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 font-medium">Mã lệnh</th>
                    <th className="text-left py-3 px-2 font-medium">Đơn hàng</th>
                    <th className="text-left py-3 px-2 font-medium">Sản phẩm</th>
                    <th className="text-right py-3 px-2 font-medium">SL KH</th>
                    <th className="text-right py-3 px-2 font-medium">Đã hoàn thành</th>
                    <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                    <th className="text-left py-3 px-2 font-medium">Người phụ trách</th>
                    <th className="text-left py-3 px-2 font-medium">Ngày bắt đầu</th>
                    <th className="text-right py-3 px-2 font-medium w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {productionOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
                        Chưa có lệnh sản xuất. Nhấn &quot;Tạo lệnh sản xuất&quot; để tạo mới.
                      </td>
                    </tr>
                  ) : (
                    productionOrders.map((po) => (
                      <tr key={po.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{po.production_code}</td>
                        <td className="py-2 px-2">{po.order_code ? <Link to={`/owner/orders/${po.order_id}`} className="text-primary hover:underline">{po.order_code}</Link> : "—"}</td>
                        <td className="py-2 px-2">{po.variant_name ?? po.product_name}</td>
                        <td className="py-2 px-2 text-right">{po.quantity_planned}</td>
                        <td className="py-2 px-2 text-right">{po.quantity_completed}</td>
                        <td className="py-2 px-2">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{po.status}</span>
                        </td>
                        <td className="py-2 px-2">{po.assigned_worker_name ?? "—"}</td>
                        <td className="py-2 px-2">{po.start_date ?? "—"}</td>
                        <td className="py-2 px-2 text-right">
                          <Button variant="outline" size="xs"><Eye size={14} /> Xem</Button>
                          <Button variant="ghost" size="xs"><UserPlus size={14} /> Giao việc</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 text-sm text-gray-500">Hiển thị 0–0 / 0</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
