import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_MAP = {
  1: { label: "Hoạt động", class: "bg-emerald-100 text-emerald-800" },
  0: { label: "Nghỉ", class: "bg-gray-100 text-gray-800" },
  "-1": { label: "Khóa", class: "bg-red-100 text-red-800" },
};

export default function OwnerEmployees() {
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // TODO: API - GET /api/owner/accounts
  const accounts = [];

  return (
    <>
      <PageHelmet title="Quản lý tài khoản | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <p className="mt-1 text-gray-500">Danh sách tài khoản và trạng thái (Hoạt động / Nghỉ / Khóa).</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Vai trò</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="OWNER">Chủ cửa hàng</option>
                  <option value="SALES">Sales</option>
                  <option value="ACCOUNTANT">Kế toán</option>
                  <option value="WORKER">Công nhân</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="1">Hoạt động</option>
                  <option value="0">Nghỉ</option>
                  <option value="-1">Khóa</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-gray-600 block mb-1">Tìm theo email, tên</label>
                <Input placeholder="Email hoặc họ tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="default" size="default"><Plus size={16} /> Thêm tài khoản</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Họ tên</th>
                    <th className="text-left py-3 px-2 font-medium">Vai trò</th>
                    <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                    <th className="text-left py-3 px-2 font-medium">Số điện thoại</th>
                    <th className="text-left py-3 px-2 font-medium">Ngày tạo</th>
                    <th className="text-right py-3 px-2 font-medium w-36">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Chưa có tài khoản nào (ngoài tài khoản hiện tại). Nhấn &quot;Thêm tài khoản&quot; để tạo.
                      </td>
                    </tr>
                  ) : (
                    accounts.map((a) => {
                      const st = STATUS_MAP[String(a.status)] ?? STATUS_MAP["1"];
                      return (
                        <tr key={a.pk_user_account_id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{a.email}</td>
                          <td className="py-2 px-2">{a.profile?.full_name ?? "—"}</td>
                          <td className="py-2 px-2">{a.role?.role_name ?? a.role?.role_code}</td>
                          <td className="py-2 px-2">
                            <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", st.class)}>
                              {st.label}
                            </span>
                          </td>
                          <td className="py-2 px-2">{a.profile?.phone_number ?? "—"}</td>
                          <td className="py-2 px-2">{a.timestamp ? new Date(a.timestamp).toLocaleDateString("vi-VN") : "—"}</td>
                          <td className="py-2 px-2 text-right">
                            <Button variant="ghost" size="xs"><Pencil size={14} /> Sửa</Button>
                            <Button variant="ghost" size="xs"><UserCog size={14} /> Đổi trạng thái</Button>
                          </td>
                        </tr>
                      );
                    })
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
