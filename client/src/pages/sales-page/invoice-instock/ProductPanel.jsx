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
import { fmt, CATEGORIES } from "./mockData";

export default function ProductPanel({
  productTypeTab,
  setProductTypeTab,
  productSearch,
  setProductSearch,
  selectedCategories,
  setSelectedCategories,
  selectedProductTypes,
  setSelectedProductTypes,
  priceRange,
  setPriceRange,
  currentPage,
  setCurrentPage,
  totalPages,
  paginatedProducts,
  addToCart,
}) {
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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
              {["Hàng mộc", "Hàng sẵn", "Quà tặng"].map((tab) => (
                <button
                  key={tab}
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
                  selectedCategories.length > 0 ||
                  selectedProductTypes.length > 0 ||
                  priceRange.min ||
                  priceRange.max
                    ? "var(--brand-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <Filter size={20} />
              {(selectedCategories.length > 0 ||
                selectedProductTypes.length > 0 ||
                priceRange.min ||
                priceRange.max) && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
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
        {(selectedCategories.length > 0 ||
          selectedProductTypes.length > 0 ||
          priceRange.min ||
          priceRange.max) && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 items-center">
            <span className="text-[12px] font-medium text-gray-500 mr-1">
              Đang lọc:
            </span>
            {selectedCategories.map((cat) => (
              <div
                key={cat}
                className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg text-[12px] font-medium flex items-center gap-1.5"
              >
                {cat}
                <button
                  onClick={() => {
                    setSelectedCategories((prev) =>
                      prev.filter((c) => c !== cat),
                    );
                    setCurrentPage(1);
                  }}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {selectedProductTypes.map((type) => (
              <div
                key={type}
                className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg text-[12px] font-medium flex items-center gap-1.5"
              >
                {type}
                <button
                  onClick={() => {
                    setSelectedProductTypes((prev) =>
                      prev.filter((t) => t !== type),
                    );
                    setCurrentPage(1);
                  }}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {(priceRange.min || priceRange.max) && (
              <div className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-[12px] font-medium flex items-center gap-1.5">
                {priceRange.min ? fmt(priceRange.min) : 0}đ -{" "}
                {priceRange.max ? fmt(priceRange.max) : "∞"}
                <button
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
              onClick={() => {
                setSelectedCategories([]);
                setSelectedProductTypes([]);
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
          {paginatedProducts.length === 0 ? (
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
              {paginatedProducts.map((product) => {
                const outOfStock = product.stock <= 0;
                const lowStock = product.stock > 0 && product.stock <= 5;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className={`group flex flex-col rounded-lg transition-all duration-200 text-left cursor-pointer relative overflow-hidden ${
                      outOfStock
                        ? "opacity-50 cursor-not-allowed grayscale"
                        : "hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5"
                    }`}
                    style={{ border: "1px solid var(--grid-border)" }}
                  >
                    {/* Stock badge */}
                    <div
                      className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: outOfStock
                          ? "#FEE2E2"
                          : lowStock
                            ? "#FEF3C7"
                            : "var(--status-focus)",
                        color: outOfStock
                          ? "var(--status-error)"
                          : lowStock
                            ? "var(--status-pending)"
                            : "var(--status-success)",
                      }}
                    >
                      {outOfStock ? "Hết hàng" : `Kho: ${product.stock}`}
                    </div>

                    {/* Discount badge */}
                    {product.discount > 0 && (
                      <div
                        className="absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: "#EF4444",
                          color: "#fff",
                        }}
                      >
                        -{product.discount}%
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-2.5 space-y-1">
                      <p
                        className="text-[12px] font-semibold line-clamp-2 leading-snug min-h-[2.25rem]"
                        style={{ color: "var(--text-main)" }}
                      >
                        {product.name}
                      </p>
                      {/* Hiển thị Màu sắc */}
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span
                          className="text-[10px] font-medium truncate"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          Màu sắc:{" "}
                          {product.productType === "Hàng mộc"
                            ? "Nguyên mộc"
                            : product.color}
                        </span>

                      </div>
                      {product.discount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] line-through text-gray-400">
                            {fmt(product.price)}đ
                          </span>
                          <span
                            className="text-[13px] font-bold"
                            style={{ color: "#EF4444" }}
                          >
                            {fmt(
                              Math.round(
                                product.price * (1 - product.discount / 100),
                              ),
                            )}
                            đ
                          </span>
                        </div>
                      ) : (
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {fmt(product.price)}đ
                        </p>
                      )}

                      {/* Quick View Button */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
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
                  </button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans text-left">
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
                onClick={() => setSelectedProductForView(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col md:flex-row p-6 gap-6 max-h-[80vh] overflow-y-auto">
              {/* Product Image */}
              <div className="w-full md:w-1/2 aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                <img
                  src={selectedProductForView.image}
                  alt={selectedProductForView.name}
                  className="w-full h-full object-cover"
                />
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
                        {selectedProductForView.productType === "Hàng mộc"
                          ? "Nguyên mộc"
                          : selectedProductForView.color || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Kích thước
                      </p>
                      <p
                        className="text-[13px] font-semibold text-gray-700 mt-0.5 truncate"
                        title={(() => {
                          const match = selectedProductForView.description?.match(
                            /Kích thước[\s:]([^\.]+)/i,
                          );
                          return match ? match[1].trim() : "—";
                        })()}
                      >
                        {(() => {
                          const match = selectedProductForView.description?.match(
                            /Kích thước[\s:]([^\.]+)/i,
                          );
                          return match ? match[1].trim() : "—";
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Danh mục
                    </p>
                    <p className="text-[13px] font-semibold text-gray-700 mt-0.5">
                      {selectedProductForView.category || "—"}
                    </p>
                  </div>

                  {selectedProductForView.discount > 0 ? (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-left">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        Giá niêm yết (Giảm {selectedProductForView.discount}%)
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[14px] line-through text-emerald-600/60 font-medium">
                          {fmt(selectedProductForView.price)}đ
                        </span>
                        <span className="text-[20px] font-black text-red-600">
                          {fmt(
                            Math.round(
                              selectedProductForView.price *
                                (1 - selectedProductForView.discount / 100),
                            ),
                          )}
                          đ
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-left">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        Giá niêm yết
                      </p>
                      <p className="text-[20px] font-black text-emerald-700 mt-0.5">
                        {fmt(selectedProductForView.price)}đ
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <Package size={14} className="text-amber-600" />
                    <span className="text-[13px] font-bold text-amber-700">
                      Tồn kho: {selectedProductForView.stock} sản phẩm
                    </span>
                  </div>

                  {selectedProductForView.description && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Mô tả sản phẩm
                      </p>
                      <p className="text-[13px] text-gray-600 leading-relaxed italic">
                        "{selectedProductForView.description
                          .replace(/Kích thước[\s\S]*/i, "")
                          .trim()}"
                      </p>
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
              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider block">
                  Danh mục
                </label>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-[13px] cursor-pointer transition select-none ${
                          isActive
                            ? "border-green-500 bg-green-50/50"
                            : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isActive && (
                            <CheckCircle2 size={12} strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`flex-1 ${isActive ? "font-medium text-green-700" : "text-gray-600"}`}
                        >
                          {cat}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isActive}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories((prev) => [...prev, cat]);
                            } else {
                              setSelectedCategories((prev) =>
                                prev.filter((c) => c !== cat),
                              );
                            }
                            setCurrentPage(1);
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider block">
                  Loại sản phẩm
                </label>
                <div className="flex flex-col gap-2">
                  {["Bàn", "Ghế", "Tủ", "Giường", "Khác"].map((type) => {
                    const isActive = selectedProductTypes.includes(type);
                    return (
                      <label
                        key={type}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-[13px] cursor-pointer transition select-none ${
                          isActive
                            ? "border-green-500 bg-green-50/50"
                            : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isActive && (
                            <CheckCircle2 size={12} strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`flex-1 ${isActive ? "font-medium text-green-700" : "text-gray-600"}`}
                        >
                          {type}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isActive}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductTypes((prev) => [
                                ...prev,
                                type,
                              ]);
                            } else {
                              setSelectedProductTypes((prev) =>
                                prev.filter((t) => t !== type),
                              );
                            }
                            setCurrentPage(1);
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

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
                  setSelectedProductTypes([]);
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
