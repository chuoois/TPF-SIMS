import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Pencil,
  Eye,
  Package,
  Trash2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Tag,
  ShieldCheck,
  Plus,
  Loader2,
  PackageOpen,
  RefreshCw,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import ImageZoomModal from "@/components/control/ImageZoomModal";
import ProductModal from "./ProductModal";
import productAttributeService from "@/services/productAttribute.service";
import productService from "@/services/product.service";

// ===================== HELPERS =====================
const fmtCurrency = (n) => {
  if (n === undefined || n === null || isNaN(n) || n === 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
};

const isLowStock = (item) => {
  const threshold = item.minStock;
  if (threshold === undefined || threshold === null || threshold <= 0) {
    return false;
  }
  return item.stock > 0 && item.stock <= threshold;
};

const getStatusConfig = (status) => {
  switch (status) {
    case "Chưa định giá":
      return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
    case "Hàng sẵn":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    case "Hàng mộc":
      return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
    case "Hàng khách đặt":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
    case "Hết hàng":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
    case "Quà tặng":
      return { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

const PRODUCT_TYPE_MAP_REVERSE = {
  "Tất cả": "",
  "Hàng sẵn": "FINISHED",
  "Hàng mộc": "RAW",
  "Hàng khách đặt": "CUSTOM",
};

// ===================== COMPONENT =====================
export default function OwnerProducts() {
  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [zoomImage, setZoomImage] = useState(null); // { src: '', alt: '' }

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [roomFilter, setRoomFilter] = useState("Tất cả");
  const [productTypeFilter, setProductTypeFilter] = useState("Tất cả");

  const [metadata, setMetadata] = useState({
    categories: [],
    colors: [],
    materials: [],
    rooms: [],
  });

  // Pagination (server-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Modal state
  const [modalState, setModalState] = useState({ product: null, mode: "view" });

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await productAttributeService.getAllAttributes();
        setMetadata(data);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (productTypeFilter !== "Tất cả") {
        params.product_type = PRODUCT_TYPE_MAP_REVERSE[productTypeFilter];
      }
      // Lọc category theo ID
      if (categoryFilter !== "Tất cả") {
        const cat = metadata.categories?.find(
          (c) => c.category_name === categoryFilter,
        );
        if (cat) params.category_id = cat.pk_product_category_id;
      }
      // Lọc room theo ID
      if (roomFilter !== "Tất cả") {
        const rm = metadata.rooms?.find(
          (r) => r.room_name === roomFilter,
        );
        if (rm) params.room_id = rm.pk_product_room_id;
      }
      // Lọc sắp hết hàng (server-side)
      if (statusFilter === "Sắp hết hàng") {
        params.low_stock = true;
      }

      const result = await productService.getOwnerProducts(params);
      setProducts(result.data || []);
      setTotalItems(result.pagination?.totalItems || 0);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err?.response?.data?.message || "Không thể tải danh sách sản phẩm");
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, productTypeFilter, categoryFilter, roomFilter, statusFilter, metadata.categories, metadata.rooms]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, roomFilter, productTypeFilter]);

  // Client-side status filter (applied after API data)
  // Sắp hết hàng is now server-side, so skip client filtering for it
  const filteredProducts = useMemo(() => {
    if (statusFilter === "Tất cả" || statusFilter === "Sắp hết hàng") return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      "Tất cả": products.length,
      "Sắp hết hàng": 0,
      "Chưa định giá": 0,
      "Hết hàng": 0,
      "Quà tặng": 0,
    };
    products.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status]++;
      if (isLowStock(p)) counts["Sắp hết hàng"]++;
    });
    return counts;
  }, [products]);

  const hasActiveFilters =
    categoryFilter !== "Tất cả" ||
    roomFilter !== "Tất cả" ||
    searchQuery ||
    productTypeFilter !== "Tất cả";

  const hasAnyFilter =
    hasActiveFilters ||
    statusFilter !== "Tất cả";

  const clearFilters = () => {
    setCategoryFilter("Tất cả");
    setRoomFilter("Tất cả");
    setSearchQuery("");
    setStatusFilter("Tất cả");
    setProductTypeFilter("Tất cả");
  };

  // Modal handlers
  const openModal = (product, mode = "view") =>
    setModalState({ product, mode });
  const closeModal = () => setModalState({ product: null, mode: "view" });

  // Delete handlers
  const handleConfirmDelete = (item, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (item.stock > 0) {
      toast.error("Không thể xoá! Sản phẩm đang có tồn kho.");
      return;
    }
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success("Đã xóa sản phẩm vĩnh viễn thành công!");
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  // Save handler (create / update)
  const handleSave = async () => {
    closeModal();
    fetchProducts();
  };

  // ===================== TABLE COLUMNS =====================
  const columns = [
    {
      header: "STT",
      headerClassName: "w-[50px] text-center",
      className: "text-center text-[13px] font-medium",
      render: (_item, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
    },
    {
      header: "Ảnh",
      headerClassName: "w-[80px]",
      render: (item) => (
        <div className="relative w-12 h-12 shrink-0">
          {item.img ? (
            <img
              src={item.img}
              alt={item.name}
              onClick={(e) => {
                e.stopPropagation();
                setZoomImage({ src: item.img, alt: `${item.name} (${item.code})` });
              }}
              className={`w-12 h-12 rounded-lg object-cover border bg-white transition-all hover:scale-105 active:scale-95 cursor-zoom-in hover:shadow-md ${item.status === "Chưa định giá" ? "ring-2 ring-[var(--status-error)] ring-offset-1" : ""}`}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--bg-main)] border text-gray-300">
              <Package size={18} />
            </div>
          )}
          {item.status === "Chưa định giá" && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--status-error)] rounded-full border-2 border-white animate-pulse flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "MÃ SẢN PHẨM",
      render: (item) => (
        <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 leading-none">
          <p className="text-[12px] font-bold font-mono" style={{ color: "var(--text-main)" }}>
            {item.code}
          </p>
        </div>
      ),
    },
    {
      header: "Tên sản phẩm",
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-[var(--text-main)] line-clamp-1">
              {item.name}
            </p>
            {item.status === "Chưa định giá" && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--status-error)]/10 text-[var(--status-error)] text-[9px] font-black uppercase tracking-tighter border border-[var(--status-error)]/20">
                <AlertCircle size={10} /> Cần định giá
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium" style={{ color: "var(--text-placeholder)" }}>
            {item.category}
          </span>
        </div>
      ),
    },
    {
      header: "Chất liệu",
      render: (item) => (
        <div className="text-gray-700 font-medium">{item.material}</div>
      ),
    },
    {
      header: "Loại hàng",
      render: (item) => {
        let typeClass = "bg-gray-100 text-gray-700 border-gray-200";
        if (item.productType === "Hàng sẵn") {
          typeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        } else if (item.productType === "Hàng mộc") {
          typeClass = "bg-amber-50 text-amber-700 border-amber-200";
        } else if (item.productType === "Hàng khách đặt") {
          typeClass = "bg-blue-50 text-blue-700 border-blue-200";
        }
        
        return (
          <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold border ${typeClass} whitespace-nowrap`}>
            {item.productType}
          </span>
        );
      },
    },
    {
      header: "Bảo hành",
      headerClassName: "text-center w-[90px] whitespace-nowrap",
      className: "text-center w-[90px] whitespace-nowrap",
      render: (item) => (
        item.status !== "Chưa định giá" && item.status !== "Quà tặng" ? (
          <span className="text-[12px] text-gray-600 font-medium whitespace-nowrap">
            {item.warrantyMonths || 12} tháng
          </span>
        ) : (
          <span className="text-[var(--text-placeholder)]">—</span>
        )
      ),
    },
    {
      header: "Giá bán",
      headerClassName: "text-left w-[140px] whitespace-nowrap",
      className: "text-left w-[140px] whitespace-nowrap",
      render: (item) => {
        if (item.status === "Quà tặng") {
          return (
            <div className="flex flex-col items-start">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-700 border border-purple-200">
                Quà tặng
              </span>
              <span className="text-[11px] font-bold text-purple-500 mt-1 italic">
                Miễn phí
              </span>
            </div>
          );
        }
        if (item.status === "Hàng khách đặt") {
          return (
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-tighter">
              Giá chốt theo đơn
            </span>
          );
        }
        if (item.status === "Chưa định giá") {
          return (
            <span className="text-[12px] font-bold text-[var(--status-error)] italic">
              Chờ định giá
            </span>
          );
        }
        if (item.productType === "Hàng mộc") {
          return (
            <div className="flex flex-col items-start">
              <span className="text-[12px] font-bold text-[var(--palette-orange)]">
                {fmtCurrency(item.rawRetailPrice)} (Mộc)
              </span>
              <span className="text-[12px] font-bold text-green-600">
                {fmtCurrency(item.finishedRetailPrice)} (HT)
              </span>
            </div>
          );
        }
        return (
          <span className="text-[13px] font-bold text-left block" style={{ color: "var(--text-main)" }}>
            {fmtCurrency(item.retailPrice)}
          </span>
        );
      },
    },
    {
      header: "Tồn",
      headerClassName: "text-center w-[110px] whitespace-nowrap",
      className: "text-center w-[110px] whitespace-nowrap",
      render: (item) => {
        if (item.productType === "Hàng khách đặt") {
          return <span className="text-[var(--text-placeholder)]">—</span>;
        }
        return (
          <div className="flex flex-col items-center justify-center">
            <span className={`font-bold ${item.stock === 0 ? "text-[var(--status-error)]" : "text-[var(--text-main)]"}`}>
              {item.stock}
            </span>
            {item.minStock > 0 && (
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
                Định mức: {item.minStock}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Trạng thái",
      render: (item) => {
        const sc = getStatusConfig(item.status);
        const hideMainStatus = ["Hàng sẵn", "Hàng mộc", "Hàng khách đặt"].includes(item.status);
        
        return (
          <div className="flex flex-col gap-1 w-[130px]">
            {!hideMainStatus && (
              <span
                className="inline-flex items-center justify-center w-full px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap gap-1.5"
                style={{
                  backgroundColor: sc.bg,
                  color: sc.text,
                  border: `1px solid ${sc.border}`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.text }} />
                {item.status}
              </span>
            )}
            {isLowStock(item) && (
              <span 
                className="inline-flex items-center justify-center w-full px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-tighter border border-amber-200 gap-1"
                title={`Định mức tối thiểu: ${item.minStock}`}
              >
                <AlertTriangle size={10} /> Sắp hết hàng ({item.minStock})
              </span>
            )}
          </div>
        );
      },
    },
  ];

  // ===================== MAIN UI =====================
  return (
    <>
      <PageHelmet title="Quản lý sản phẩm | TPF-SIMS" />

      <ProductModal
        product={modalState.product}
        mode={modalState.mode}
        onClose={closeModal}
        onSave={handleSave}
        onSwitchMode={(mode) => setModalState((s) => ({ ...s, mode }))}
        onDelete={(item) => {
          closeModal();
          handleConfirmDelete(item);
        }}
        metadata={metadata}
      />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* HEADER & TABS */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý sản phẩm
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {totalItems} sản phẩm (
              {productTypeFilter === "Tất cả" ? "tất cả loại" : productTypeFilter.toLowerCase()})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex p-1 rounded-lg"
              style={{
                backgroundColor: "var(--grid-header-bg)",
                border: "1px solid var(--grid-border)",
              }}
            >
              {["Tất cả", "Hàng sẵn", "Hàng mộc", "Hàng khách đặt"].map((type) => (
                <button
                  key={type}
                  onClick={() => setProductTypeFilter(type)}
                  className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: productTypeFilter === type ? "#fff" : "transparent",
                    color: productTypeFilter === type ? "var(--text-main)" : "var(--text-secondary)",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap py-1">
          {[
            { id: "Tất cả", label: "Tất cả" },
            { id: "Sắp hết hàng", label: "Sắp hết hàng", color: "amber", icon: AlertTriangle },
            { id: "Chưa định giá", label: "Chưa định giá", color: "red", icon: AlertCircle },
            { id: "Hết hàng", label: "Hết hàng", color: "red", icon: AlertCircle },
            { id: "Quà tặng", label: "Quà tặng", color: "purple" },
          ].map((s) => {
            const isActive = statusFilter === s.id;
            const isRedForce = s.color === "red";
            const sc =
              s.id !== "Tất cả"
                ? isRedForce
                  ? { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }
                  : s.color === "amber"
                    ? { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" }
                    : s.color === "purple"
                      ? { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }
                      : { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" }
                : null;

            return (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent",
                  color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)",
                  borderColor: isActive ? (sc ? sc.border : "var(--grid-border)") : "transparent",
                }}
              >
                {s.icon && (
                  <s.icon
                    size={14}
                    className={
                      isActive
                        ? isRedForce ? "text-red-500" : "text-[var(--brand-primary)]"
                        : "text-slate-300"
                    }
                  />
                )}
                {s.label}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {statusCounts[s.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition cursor-pointer"
            >
              <RefreshCw size={14} /> Thử lại
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--brand-primary)]" />
            <span className="ml-3 text-[var(--text-secondary)] font-medium">Đang tải sản phẩm...</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && products.length === 0 && !hasAnyFilter && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <PackageOpen size={56} className="text-slate-300" />
            <p className="text-lg font-semibold text-slate-400">Chưa có sản phẩm nào</p>
          </div>
        )}

        {/* DATA TABLE */}
        {!loading && !error && (products.length > 0 || hasAnyFilter) && (
          <DataTable
            columns={columns}
            data={filteredProducts}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            searchPlaceholder="Theo Mã Sản Phẩm, tên sản phẩm..."
            hasActiveFilters={!!hasActiveFilters}
            clearAllFilters={clearFilters}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onRowClick={(item) => openModal(item, "view")}
            rowActions={[
              {
                icon: Eye,
                label: "Xem chi tiết",
                onClick: (item) => openModal(item, "view"),
              },
              {
                icon: Tag,
                label: "Định giá",
                onClick: (item) => openModal(item, "pricing"),
                showIf: (item) => item.productType !== "Hàng khách đặt",
              },
              {
                icon: Pencil,
                label: "Sửa thông tin",
                onClick: (item) => openModal(item, "edit"),
              },
              {
                icon: Trash2,
                label: "Xóa sản phẩm",
                onClick: (item) => handleConfirmDelete(item),
                className: "text-red-500 hover:bg-red-50",
                showIf: (item) => item.stock === 0,
              },
            ]}
            bulkActions={[
              {
                label: "XÓA HÀNG LOẠT",
                icon: Trash2,
                onClick: async () => {
                  const invalidDeletes = products
                    .filter((p) => selectedIds.includes(p.id))
                    .some((p) => p.stock > 0);

                  if (invalidDeletes) {
                    toast.error("Lỗi: Tồn tại sản phẩm đang có tồn kho trong danh sách chọn!");
                    return;
                  }

                  try {
                    await Promise.all(selectedIds.map((id) => productService.deleteProduct(id)));
                    setSelectedIds([]);
                    toast.success(`Đã xóa vĩnh viễn ${selectedIds.length} sản phẩm!`);
                    fetchProducts();
                  } catch (err) {
                    toast.error(err?.response?.data?.message || "Lỗi khi xóa hàng loạt");
                  }
                },
                requireConfirm: true,
                confirmTitle: "Xóa hàng loạt sản phẩm?",
                confirmMessage: `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} sản phẩm đang chọn? Hành động này không thể hoàn tác!`,
              },
            ]}
            extraFilters={
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 px-3 pr-9 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                    style={{
                      border: "1px solid var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  >
                    <option value="Tất cả">Danh mục sản phẩm</option>
                    {(metadata.categories || []).map((c) => (
                      <option key={c.category_name} value={c.category_name}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 pointer-events-none opacity-50 text-gray-400"
                    strokeWidth={2.5}
                  />
                </div>

                <div className="relative flex items-center">
                  <select
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    className="h-10 px-3 pr-9 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                    style={{
                      border: "1px solid var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  >
                    <option value="Tất cả">Khu vực</option>
                    {(metadata.rooms || []).map((r) => (
                      <option key={r.room_name} value={r.room_name}>
                        {r.room_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 pointer-events-none opacity-50 text-gray-400"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            }
            pagination={{
              total: (statusFilter === "Tất cả" || statusFilter === "Sắp hết hàng") ? totalItems : filteredProducts.length,
              currentPage,
              setCurrentPage,
              itemsPerPage,
              setItemsPerPage,
            }}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa sản phẩm vĩnh viễn"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${itemToDelete?.name}" (${itemToDelete?.code}) không? Hành động này không thể hoàn tác!`}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={() => handleDeleteProduct(itemToDelete?.id)}
      />

      <ImageZoomModal
        isOpen={!!zoomImage}
        src={zoomImage?.src}
        alt={zoomImage?.alt}
        onClose={() => setZoomImage(null)}
      />
    </>
  );
}
