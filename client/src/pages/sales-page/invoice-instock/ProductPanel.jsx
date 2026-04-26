/**
 * ProductPanel — Right panel of InStockInvoicePage
 * Includes: Product tabs, Search, Filter, Product grid, Pagination,
 *           Filter Drawer, Product Quick View Modal
 */

import { useState } from "react";
import {
  X,
  Plus,
  Package,
  PackageCheck,
  Hammer,
  CheckCircle2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, PRODUCT_TYPES } from "./mockData";
import CustomCheckbox from "@/components/control/CustomCheckbox";

export default function ProductPanel({
  productTypeTab,
  setProductTypeTab,
  productSearch,
  setProductSearch,
  metadata,
  selectedCategories,
  setSelectedCategories,
  selectedColors,
  setSelectedColors,
  selectedMaterials,
  setSelectedMaterials,
  selectedRooms,
  setSelectedRooms,
  priceRange,
  setPriceRange,
  currentPage,
  setCurrentPage,
  totalPages,
  products,
  addToCart,
  isLoading,
}) {
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const activeFilterCount =
    selectedCategories.length +
    selectedColors.length +
    selectedMaterials.length +
    selectedRooms.length +
    (priceRange.min || priceRange.max ? 1 : 0);

  return (
    <>
      <div
        className="flex flex-col w-[44%] bg-white rounded-lg overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {/* ── Product Tabs & Filter ── */}
        <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
          <div className="flex gap-2">
            <div
              className="flex-1 flex rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--grid-border)",
                backgroundColor: "var(--bg-main)",
              }}
            >
              {[PRODUCT_TYPES.RAW, PRODUCT_TYPES.INSTOCK, PRODUCT_TYPES.GIFT].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setProductTypeTab(tab);
                    setCurrentPage(1);
                  }}
                  className="flex-1 py-2.5 text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor:
                      productTypeTab === tab
                        ? "var(--brand-primary)"
                        : "transparent",
                    color:
                      productTypeTab === tab
                        ? "#fff"
                        : "var(--text-secondary)",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="relative p-2.5 rounded-lg transition cursor-pointer flex items-center justify-center bg-white hover:bg-gray-50 active:scale-95"
              style={{
                border: "1px solid var(--grid-border)",
                color:
                  activeFilterCount > 0
                    ? "var(--brand-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <Filter size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="relative w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-placeholder)" }}
            />
            <input
              type="text"
              placeholder="Tên sản phẩm..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-[13px] pl-8 py-2 rounded-lg focus:outline-none focus:ring-1"
              style={{
                border: "1px solid var(--grid-border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-main)",
              }}
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Active Filters Display ── */}
        {activeFilterCount > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 items-center">
            <span className="text-[12px] font-medium text-gray-500 mr-1">
              Đang lọc:
            </span>
            {[
              { list: selectedCategories, setter: setSelectedCategories, type: "Danh mục", meta: metadata.categories, idKey: "pk_product_category_id", nameKey: "category_name" },
              { list: selectedColors, setter: setSelectedColors, type: "Màu", meta: metadata.colors, idKey: "pk_product_color_id", nameKey: "color_name" },
              { list: selectedMaterials, setter: setSelectedMaterials, type: "Chất liệu", meta: metadata.materials, idKey: "pk_product_material_id", nameKey: "material_name" },
              { list: selectedRooms, setter: setSelectedRooms, type: "Phòng", meta: metadata.rooms, idKey: "pk_product_room_id", nameKey: "room_name" },
            ].map((group) =>
              group.list.map((id) => {
                const item = group.meta.find((m) => m[group.idKey] === id);
                return (
                  <div
                    key={`${group.type}-${id}`}
                    className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg text-[12px] font-medium flex items-center gap-1.5"
                  >
                    {item ? item[group.nameKey] : id}
                    <button
                      type="button"
                      onClick={() => {
                        group.setter((prev) => prev.filter((i) => i !== id));
                        setCurrentPage(1);
                      }}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}

            {(priceRange.min || priceRange.max) && (
              <div className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-[12px] font-medium flex items-center gap-1.5">
                {priceRange.min ? fmt(priceRange.min) : 0}đ -{" "}
                {priceRange.max ? fmt(priceRange.max) : "∞"}
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange({ min: "", max: "" });
                    setCurrentPage(1);
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedColors([]);
                setSelectedMaterials([]);
                setSelectedRooms([]);
                setPriceRange({ min: "", max: "" });
                setCurrentPage(1);
              }}
              className="text-[12px] text-red-500 hover:text-red-700 font-medium px-1 underline cursor-pointer ml-1"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* ── Product Grid ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
               <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-sm font-medium text-gray-400">Đang tải sản phẩm...</p>
            </div>
          ) : products.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-2"
              style={{ color: "var(--text-placeholder)" }}
            >
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-main)" }}
              >
                <Package size={28} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">Không tìm thấy sản phẩm</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {products.map((product) => {
                const stock = product.available_quantity || 0;
                const outOfStock = stock <= 0 && productTypeTab !== PRODUCT_TYPES.CUSTOM;
                const lowStock = stock > 0 && stock <= 5;

                return (
                  <div
                    key={product.pk_product_id}
                    onClick={() => !outOfStock && addToCart(product)}
                    className={`group flex flex-col rounded-lg transition-all duration-200 text-left relative overflow-hidden ${
                      outOfStock
                        ? "opacity-50 cursor-not-allowed grayscale"
                        : "hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 cursor-pointer"
                    }`}
                    style={{ border: "1px solid var(--grid-border)" }}
                  >
                    {/* Stock badge */}
                    {outOfStock ? (
                      <div
                        className="absolute top-2 right-2 z-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-600"
                      >
                        Hết hàng
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 z-1 flex flex-col gap-1 items-end">
                        {(product.is_gift == 1 || product.product_name?.toLowerCase().includes("quà tặng")) && (
                          <div className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-sm">
                            QUÀ TẶNG
                          </div>
                        )}
                        <div
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm"
                          style={{
                            backgroundColor: lowStock
                                ? "#FEF3C7"
                                : "var(--status-focus)",
                            color: lowStock
                                ? "var(--status-pending)"
                                : "var(--status-success)",
                          }}
                        >
                          Kho: {stock}
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                      {product.product_img ? (
                        <img
                          src={product.product_img}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <Package size={32} className="text-gray-400" />
                          <span className="text-[10px] font-bold uppercase mt-1">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2.5 space-y-1">
                      <p
                        className="text-[12px] font-semibold line-clamp-2 leading-snug min-h-[2.25rem]"
                        style={{ color: "var(--text-main)" }}
                      >
                        {product.product_name}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span
                          className="text-[10px] font-medium truncate"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          Chất liệu: {product.material_name || "—"}
                        </span>
                        <span
                          className="text-[10px] font-medium truncate"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          Màu sắc: {product.color_name || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {product.discount_percent > 0 ? (
                          <div className="flex items-center gap-2">
                            <p
                              className="text-[13px] font-bold"
                              style={{ color: "var(--brand-primary)" }}
                            >
                              {fmt(product.display_price)}đ
                            </p>
                            <p className="text-[11px] text-gray-400 line-through">
                              {fmt(product.original_price)}đ
                            </p>
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded">
                              -{product.discount_percent}%
                            </span>
                          </div>
                        ) : (
                          <p
                            className="text-[13px] font-bold"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            {fmt(product.display_price)}đ
                          </p>
                        )}
                      </div>

                      {/* Quick View Button */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductForView(product);
                          }}
                          className="p-1.5 rounded-lg bg-white/90 shadow-sm border border-gray-100 text-gray-500 hover:text-brand-primary hover:scale-110 transition cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 0 && (
          <div
            className="flex items-center justify-center gap-2 py-2.5 border-t"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-50"
              style={{
                border: "1px solid var(--grid-border)",
                color: "var(--text-secondary)",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-lg text-[12px] font-medium transition cursor-pointer"
                  style={{
                    backgroundColor:
                      currentPage === page
                        ? "var(--brand-primary)"
                        : "transparent",
                    color:
                      currentPage === page ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-50"
              style={{
                border: "1px solid var(--grid-border)",
                color: "var(--text-secondary)",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Product Quick View Modal ── */}
      {selectedProductForView && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans text-left">
          <div
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
            style={{ border: "1px solid var(--grid-border)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-900">
                Chi tiết sản phẩm
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProductForView(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col md:flex-row p-6 gap-6 max-h-[80vh] overflow-y-auto">
              {/* Product Image */}
              <div className="w-full md:w-1/2 aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shadow-inner flex items-center justify-center">
                {selectedProductForView.image ? (
                  <img
                    src={selectedProductForView.image}
                    alt={selectedProductForView.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <Package size={48} className="text-gray-400" />
                    <span className="text-[12px] font-bold uppercase mt-2">Sản phẩm chưa có ảnh</span>
                  </div>
                )}
              </div>

              {/* Product Specs */}
              <div className="w-full md:w-1/2 space-y-5">
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
                    {selectedProductForView.name}
                  </h2>
                  <p className="text-[13px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                    SKU: {selectedProductForView.sku}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Màu sắc
                      </p>
                      <p className="text-[13px] font-semibold text-gray-700 mt-0.5">
                         {selectedProductForView.color_name || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Kích thước
                      </p>
                      <p className="text-[13px] font-semibold text-gray-700 mt-0.5 truncate">
                        {selectedProductForView.size ? `${selectedProductForView.size.width}x${selectedProductForView.size.height}x${selectedProductForView.size.length} ${selectedProductForView.size.unit}` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Danh mục
                      </p>
                      <p className="text-[13px] font-semibold text-gray-700 mt-0.5">
                        {selectedProductForView.category_name || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Chất liệu
                      </p>
                      <p className="text-[13px] font-semibold text-gray-700 mt-0.5">
                        {selectedProductForView.material_name || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-left">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Giá bán ({selectedProductForView.sell_type_name})
                    </p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <p className="text-[20px] font-black text-emerald-700">
                        {fmt(selectedProductForView.display_price)}đ
                      </p>
                      {selectedProductForView.discount_percent > 0 && (
                        <p className="text-[14px] font-medium text-gray-400 line-through">
                          {fmt(selectedProductForView.original_price)}đ
                        </p>
                      )}
                    </div>
                    {selectedProductForView.discount_percent > 0 && (
                      <div className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-bold rounded">
                        TIẾT KIỆM {selectedProductForView.discount_percent}% (Coupon: {selectedProductForView.coupon_code})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <Package size={14} className="text-amber-600" />
                    <span className="text-[13px] font-bold text-amber-700">
                      Tồn kho: {selectedProductForView.available_quantity} sản phẩm
                    </span>
                  </div>

                  {/* Product Description */}
                  {selectedProductForView.description && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Mô tả sản phẩm
                      </p>
                      <div className="text-[13px] text-gray-600 leading-relaxed max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedProductForView.description.split('\n').map((line, i) => (
                          <p key={i} className={line.trim() ? "mb-1" : "h-2"}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    addToCart(selectedProductForView);
                    setSelectedProductForView(null);
                  }}
                  className="w-full h-12 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                >
                  <Plus size={18} />
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter Drawer ── */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative w-[320px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-gray-800 flex items-center gap-2">
                <Filter size={18} className="text-green-500" /> Lọc sản phẩm
              </h2>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {[
                { list: selectedCategories, setter: setSelectedCategories, label: "Danh mục", meta: metadata.categories, idKey: "pk_product_category_id", nameKey: "category_name" },
                { list: selectedColors, setter: setSelectedColors, label: "Màu sắc", meta: metadata.colors, idKey: "pk_product_color_id", nameKey: "color_name" },
                { list: selectedMaterials, setter: setSelectedMaterials, label: "Chất liệu", meta: metadata.materials, idKey: "pk_product_material_id", nameKey: "material_name" },
                { list: selectedRooms, setter: setSelectedRooms, label: "Phòng / Khu vực", meta: metadata.rooms, idKey: "pk_product_room_id", nameKey: "room_name" },
              ].map((group) => (
                <div key={group.label} className="space-y-3">
                  <label className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider block">
                    {group.label}
                  </label>
                  <div className="flex flex-col gap-2">
                    {group.meta.map((item) => {
                      const id = item[group.idKey];
                      const name = item[group.nameKey];
                      const isActive = group.list.includes(id);
                      return (
                        <label
                          key={id}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-[13px] cursor-pointer transition select-none ${
                            isActive
                              ? "border-green-500 bg-green-50/50"
                              : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                          }`}
                        >
                          <CustomCheckbox
                            checked={isActive}
                            onChange={(checked) => {
                              if (checked) {
                                group.setter((prev) => [...prev, id]);
                              } else {
                                group.setter((prev) => prev.filter((i) => i !== id));
                              }
                              setCurrentPage(1);
                            }}
                          />
                          <span
                            className={`flex-1 ${isActive ? "font-medium text-green-700" : "text-gray-600"}`}
                          >
                            {name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider block">
                  Khoảng giá (VNĐ)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Từ..."
                      value={priceRange.min ? fmt(priceRange.min) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPriceRange((p) => ({ ...p, min: raw }));
                        setCurrentPage(1);
                      }}
                      className="w-full text-[13px] pl-3 pr-2 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-1 bg-white"
                      style={{
                        border: "1px solid var(--grid-border)",
                        color: "var(--text-main)",
                      }}
                    />
                  </div>
                  <span className="text-gray-400 font-medium">-</span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Đến..."
                      value={priceRange.max ? fmt(priceRange.max) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPriceRange((p) => ({ ...p, max: raw }));
                        setCurrentPage(1);
                      }}
                      className="w-full text-[13px] pl-3 pr-2 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-1 bg-white"
                      style={{
                        border: "1px solid var(--grid-border)",
                        color: "var(--text-main)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedColors([]);
                  setSelectedMaterials([]);
                  setSelectedRooms([]);
                  setPriceRange({ min: "", max: "" });
                  setCurrentPage(1);
                }}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-medium border cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Thiết lập lại
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-[13px] cursor-pointer font-medium bg-green-500 text-white hover:bg-green-600 transition shadow-md shadow-green-500/20"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
