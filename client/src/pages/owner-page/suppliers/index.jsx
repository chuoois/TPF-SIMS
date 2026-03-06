import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Eye } from "lucide-react";

export default function OwnerSuppliers() {
  const [search, setSearch] = useState("");

  // TODO: API
  const suppliers = [];

  return (
    <>
      <PageHelmet title="Nhà cung cấp | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
          <p className="mt-1 text-gray-500">Quản lý nhà cung cấp và xưởng nguồn.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-gray-600 block mb-1">Tìm theo tên, mã, SĐT</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input placeholder="Tên, mã hoặc số điện thoại..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Button variant="default" size="default"><Plus size={16} /> Thêm nhà cung cấp</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách nhà cung cấp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 font-medium">Mã</th>
                    <th className="text-left py-3 px-2 font-medium">Tên</th>
                    <th className="text-left py-3 px-2 font-medium">Người liên hệ</th>
                    <th className="text-left py-3 px-2 font-medium">Số điện thoại</th>
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Địa chỉ</th>
                    <th className="text-right py-3 px-2 font-medium">Công nợ</th>
                    <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                    <th className="text-right py-3 px-2 font-medium w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
                        Chưa có nhà cung cấp. Nhấn &quot;Thêm nhà cung cấp&quot; để tạo mới.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{s.supplier_code}</td>
                        <td className="py-2 px-2">{s.supplier_name}</td>
                        <td className="py-2 px-2">{s.contact_person ?? "—"}</td>
                        <td className="py-2 px-2">{s.phone_number}</td>
                        <td className="py-2 px-2">{s.email ?? "—"}</td>
                        <td className="py-2 px-2 max-w-[180px] truncate" title={s.address}>{s.address ?? "—"}</td>
                        <td className="py-2 px-2 text-right">{s.total_debt ?? "0"}</td>
                        <td className="py-2 px-2">{s.status === 1 ? "Hoạt động" : "Ẩn"}</td>
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
