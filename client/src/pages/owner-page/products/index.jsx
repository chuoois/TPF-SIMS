import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, Layers, FolderTree, Pencil, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "variants", label: "Biến thể", icon: Layers },
  { id: "categories", label: "Danh mục", icon: FolderTree },
];

export default function OwnerProducts() {
  const [activeTab, setActiveTab] = useState("products");
  const [productTypeFilter, setProductTypeFilter] = useState(""); // ALL | RAW | FINISHED
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [woodFilter, setWoodFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [variantSearch, setVariantSearch] = useState("");

  // TODO: API
  const products = [];
  const variants = [];
  const categories = [];

  return (
    <>
      <PageHelmet title="Sản phẩm | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="mt-1 text-gray-500">Quản lý sản phẩm thô, hoàn thiện; danh mục và biến thể.</p>
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

        {/* Tab Sản phẩm */}
        {activeTab === "products" && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Loại</label>
                    <select
                      value={productTypeFilter}
                      onChange={(e) => setProductTypeFilter(e.target.value)}
                      className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="">Tất cả</option>
                      <option value="RAW">Sản phẩm thô</option>
                      <option value="FINISHED">Sản phẩm hoàn thiện</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Danh mục</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="flex h-9 min-w-[160px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="">Tất cả</option>
                      {/* TODO: map categories */}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm text-gray-600 block mb-1">Tìm theo tên</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        placeholder="Tên sản phẩm..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="default">Thêm danh mục</Button>
                  <Button variant="default" size="default"><Plus size={16} /> Thêm sản phẩm</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-2 font-medium">Mã</th>
                        <th className="text-left py-3 px-2 font-medium">Tên</th>
                        <th className="text-left py-3 px-2 font-medium w-14">Ảnh</th>
                        <th className="text-left py-3 px-2 font-medium">Danh mục</th>
                        <th className="text-left py-3 px-2 font-medium">Loại</th>
                        <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                        <th className="text-right py-3 px-2 font-medium w-28">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            Chưa có sản phẩm. Nhấn &quot;Thêm sản phẩm&quot; để tạo mới.
                          </td>
                        </tr>
                      ) : (
                        products.map((p) => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">{p.code}</td>
                            <td className="py-2 px-2">{p.product_name}</td>
                            <td className="py-2 px-2">{p.product_img ? <img src={p.product_img} alt="" className="w-10 h-10 object-cover rounded" /> : "—"}</td>
                            <td className="py-2 px-2">{p.category_name}</td>
                            <td className="py-2 px-2">{p.product_type === "RAW" ? "Thô" : "Hoàn thiện"}</td>
                            <td className="py-2 px-2">{p.product_status}</td>
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
              </CardContent>
            </Card>
          </>
        )}

        {/* Tab Biến thể */}
        {activeTab === "variants" && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Sản phẩm</label>
                    <select className="flex h-9 min-w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="">Tất cả</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Loại gỗ</label>
                    <select value={woodFilter} onChange={(e) => setWoodFilter(e.target.value)} className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="">Tất cả</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Màu</label>
                    <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="">Tất cả</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm text-gray-600 block mb-1">Tìm theo tên</label>
                    <Input placeholder="Tên biến thể..." value={variantSearch} onChange={(e) => setVariantSearch(e.target.value)} />
                  </div>
                  <Button variant="outline" size="default">Thêm loại gỗ</Button>
                  <Button variant="outline" size="default">Thêm màu</Button>
                  <Button variant="default" size="default"><Plus size={16} /> Thêm biến thể</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-2 font-medium">Mã SKU</th>
                        <th className="text-left py-3 px-2 font-medium">Sản phẩm</th>
                        <th className="text-left py-3 px-2 font-medium">Loại gỗ</th>
                        <th className="text-left py-3 px-2 font-medium">Màu</th>
                        <th className="text-right py-3 px-2 font-medium">Giá bán</th>
                        <th className="text-right py-3 px-2 font-medium">Tồn</th>
                        <th className="text-right py-3 px-2 font-medium w-28">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            Chưa có biến thể. Thêm sản phẩm và tạo biến thể (loại gỗ, màu).
                          </td>
                        </tr>
                      ) : (
                        variants.map((v) => (
                          <tr key={v.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">{v.sku_code}</td>
                            <td className="py-2 px-2">{v.product_name}</td>
                            <td className="py-2 px-2">{v.wood_type_name}</td>
                            <td className="py-2 px-2">{v.color_name}</td>
                            <td className="py-2 px-2 text-right">{v.selling_price}</td>
                            <td className="py-2 px-2 text-right">{v.stock_quantity}</td>
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
              </CardContent>
            </Card>
          </>
        )}

        {/* Tab Danh mục */}
        {activeTab === "categories" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Danh mục sản phẩm</CardTitle>
              <Button variant="default" size="default"><Plus size={16} /> Thêm danh mục</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium">Mã</th>
                      <th className="text-left py-3 px-2 font-medium">Tên</th>
                      <th className="text-left py-3 px-2 font-medium">Trạng thái</th>
                      <th className="text-right py-3 px-2 font-medium w-28">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          Chưa có danh mục. Nhấn &quot;Thêm danh mục&quot; để tạo (VD: Phòng khách, Phòng thờ).
                        </td>
                      </tr>
                    ) : (
                      categories.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{c.category_code}</td>
                          <td className="py-2 px-2">{c.category_name}</td>
                          <td className="py-2 px-2">{c.status === 1 ? "Hoạt động" : "Ẩn"}</td>
                          <td className="py-2 px-2 text-right">
                            <Button variant="ghost" size="xs"><Pencil size={14} /> Sửa</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
