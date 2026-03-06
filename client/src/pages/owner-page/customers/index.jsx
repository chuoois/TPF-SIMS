import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Eye } from "lucide-react";

export default function OwnerCustomers() {
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  // TODO: API
  const customers = [];

  return (
    <>
      <PageHelmet title="Khách hàng | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
          <p className="mt-1 text-gray-500">Danh sách khách hàng và phân loại (Lẻ / Sỉ / Quen).</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Loại khách</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="LE">Lẻ</option>
                  <option value="SI">Sỉ</option>
                  <option value="QUEN">Quen</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-gray-600 block mb-1">Tìm theo tên, SĐT</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input placeholder="Tên hoặc số điện thoại..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Button variant="default" size="default"><Plus size={16} /> Thêm khách hàng</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 font-medium">Mã</th>
                    <th className="text-left py-3 px-2 font-medium">Họ tên</th>
                    <th className="text-left py-3 px-2 font-medium">Số điện thoại</th>
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Địa chỉ</th>
                    <th className="text-left py-3 px-2 font-medium">Loại</th>
                    <th className="text-right py-3 px-2 font-medium">Số đơn</th>
                    <th className="text-right py-3 px-2 font-medium">Công nợ</th>
                    <th className="text-right py-3 px-2 font-medium w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
                        Chưa có khách hàng. Nhấn &quot;Thêm khách hàng&quot; để tạo mới.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{c.customer_code}</td>
                        <td className="py-2 px-2">{c.full_name}</td>
                        <td className="py-2 px-2">{c.phone_number}</td>
                        <td className="py-2 px-2">{c.email ?? "—"}</td>
                        <td className="py-2 px-2 max-w-[180px] truncate" title={c.address}>{c.address ?? "—"}</td>
                        <td className="py-2 px-2">{c.customer_type === "LE" ? "Lẻ" : c.customer_type === "SI" ? "Sỉ" : "Quen"}</td>
                        <td className="py-2 px-2 text-right">{c.total_orders ?? 0}</td>
                        <td className="py-2 px-2 text-right">{c.total_debt ?? "0"}</td>
                        <td className="py-2 px-2 text-right">
                          <Button variant="ghost" size="xs"><Eye size={14} /></Button>
                          <Button variant="ghost" size="xs"><Pencil size={14} /></Button>
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
