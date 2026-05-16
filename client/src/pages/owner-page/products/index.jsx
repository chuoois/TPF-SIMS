import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Pencil,
  Eye,
  Package,
  Trash2,
  AlertCircle,
  ChevronDown,
  Tag,
  ShieldCheck,
<<<<<<< HEAD
  Clock,
  Image as ImageIcon,
=======
  Plus,
  Loader2,
  PackageOpen,
  RefreshCw,
>>>>>>> dev
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import ProductModal from "./ProductModal";
import productAttributeService from "@/services/productAttribute.service";
import productService from "@/services/product.service";

// ===================== HELPERS =====================
const fmtCurrency = (n) => {
  if (n === undefined || n === null || isNaN(n) || n === 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
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
    case "Ngừng kinh doanh":
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
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
<<<<<<< HEAD
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
=======
  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
>>>>>>> dev

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
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

<<<<<<< HEAD
  // Format data from backend to frontend format
  const formatProductData = (p) => {
    let productType = "";
    if (p.product_type === "FINISHED") productType = "Hàng sẵn";
    else if (p.product_type === "RAW") productType = "Hàng mộc";
    else if (p.product_type === "CUSTOM") productType = "Hàng khách đặt";
    else productType = p.sell_type_name || "Sản phẩm"; // fallback

    let status = productType;

    if (p.is_gift === 1) {
      status = "Quà tặng";
    } else if (p.original_price === 0 && status !== "Hàng khách đặt") {
      status = "Chưa định giá";
    } else if (productType === "Hàng sẵn" && p.available_quantity === 0) {
      status = "Hết hàng";
    }

    let sizeObj = p.size;
    if (typeof sizeObj === "string" && sizeObj.startsWith("{")) {
      try {
        sizeObj = JSON.parse(sizeObj);
      } catch (e) {}
    }

    let sizeStr = "";
    if (typeof sizeObj === "object" && sizeObj !== null) {
      sizeStr = [sizeObj.length, sizeObj.width, sizeObj.height]
        .filter((v) => v != null && v !== "")
        .join(" × ");
    } else {
      sizeStr = sizeObj || "";
    }

    return {
      id: p.pk_product_id,
      code: p.sku,
      name: p.product_name,
      category: p.category_name || "Chưa có",
      material: p.material_name || "Chưa có",
      color: p.color_name,
      dimensions: sizeStr,
      productType: productType,
      status: status,
      stock: p.available_quantity,
      warrantyMonths: p.warranty_months,
      img: p.product_img,
      description: p.description,
      retailPrice: p.display_price,
      rawRetailPrice: p.sell_type_name === "Hàng mộc" ? p.original_price : 0,
      finishedRetailPrice:
        p.sell_type_name === "Hàng mộc" ? p.display_price : 0,
      original_price: p.original_price,
      display_price: p.display_price,
    };
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let sell_type = "";
      if (productTypeFilter === "Hàng mộc") sell_type = 1;
      else if (productTypeFilter === "Hàng sẵn") sell_type = 2;
      else if (productTypeFilter === "Hàng khách đặt") sell_type = 4;

      let is_gift = "";
      if (statusFilter === "Quà tặng") is_gift = 1;

      // Because the backend category filter requires an ID, we need to find it from metadata
      let category_id = "";
=======
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
>>>>>>> dev
      if (categoryFilter !== "Tất cả") {
        const cat = metadata.categories?.find(
          (c) => c.category_name === categoryFilter,
        );
<<<<<<< HEAD
        if (cat) category_id = cat.pk_product_category_id;
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sell_type,
        is_gift,
        category_id,
      };

      const res = await productService.getAllProducts(params);
      let formatted = (res.data || []).map(formatProductData);

      // Client-side post-filter for statuses not natively supported by backend parameters
      if (statusFilter === "Chưa định giá") {
        formatted = formatted.filter((p) => p.status === "Chưa định giá");
      } else if (statusFilter === "Hết hàng") {
        formatted = formatted.filter((p) => p.status === "Hết hàng");
      } else if (
        statusFilter === "Hàng sẵn" ||
        statusFilter === "Hàng mộc" ||
        statusFilter === "Hàng khách đặt"
      ) {
        formatted = formatted.filter((p) => p.status === statusFilter);
      }

      setProducts(formatted);
      // Since we post-filter client side, totalItems might be off, but it's acceptable for this iteration
      setTotalItems(res.pagination?.totalItems || formatted.length);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách sản phẩm!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    productTypeFilter,
    statusFilter,
    categoryFilter,
    metadata,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, productTypeFilter]);

  // Actions
  const handleConfirmDelete = (item, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (item.stock > 0 || (item.lots && item.lots.length > 0)) {
      toast.error(
        "Không thể xoá! Sản phẩm đang có tồn kho hoặc đã có lịch sử nhập lô.",
      );
      return;
=======
        if (cat) params.category_id = cat.pk_product_category_id;
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
>>>>>>> dev
    }
  }, [currentPage, itemsPerPage, searchQuery, productTypeFilter, categoryFilter, metadata.categories]);

<<<<<<< HEAD
  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success("Đã xóa sản phẩm thành công!");
      fetchProducts(); // Tải lại danh sách
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Lỗi khi xóa sản phẩm!",
      );
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };
=======
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, productTypeFilter]);

  // Client-side status filter (applied after API data)
  const filteredProducts = useMemo(() => {
    if (statusFilter === "Tất cả") return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      "Tất cả": products.length,
      "Chưa định giá": 0,
      "Hết hàng": 0,
      "Quà tặng": 0,
    };
    products.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return counts;
  }, [products]);
>>>>>>> dev

  const hasActiveFilters =
    categoryFilter !== "Tất cả" ||
    searchQuery ||
    productTypeFilter !== "Tất cả";

  const clearFilters = () => {
    setCategoryFilter("Tất cả");
    setSearchQuery("");
    setStatusFilter("Tất cả");
    setProductTypeFilter("Tất cả");
  };

<<<<<<< HEAD
  const handleSave = async (updated, message) => {
    try {
      // Find IDs from metadata
      const categoryId = metadata.categories?.find((c) => c.category_name === updated.category)?.pk_product_category_id;
      const materialId = metadata.materials?.find((m) => m.material_name === updated.material)?.pk_product_material_id;
      const colorId = metadata.colors?.find((c) => c.color_name === updated.color)?.pk_product_color_id;

      // Map productType string back to ENUM
      let product_type = "FINISHED";
      if (updated.productType === "Hàng mộc") product_type = "RAW";
      else if (updated.productType === "Hàng khách đặt") product_type = "CUSTOM";

      const payload = {
        product_name: updated.name || updated.product_name,
        sku: updated.code || updated.sku,
        fk_category_id: categoryId || null,
        fk_material_id: materialId || null,
        fk_color_id: colorId || null,
        description: updated.description,
        warranty_months: updated.warrantyMonths,
        product_type: product_type,
        size: JSON.stringify({
          length: updated.dimL || "",
          width: updated.dimW || "",
          height: updated.dimH || "",
        }),
        // Pricing
        cost_price: updated.costPrice !== undefined ? updated.costPrice : updated.original_price,
        raw_price: updated.rawRetailPrice,
        final_price: updated.retailPrice || updated.finishedRetailPrice || updated.display_price,
      };

      await productService.updateProduct(updated.id, payload);
      toast.success(message || "Đã cập nhật sản phẩm thành công!");
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật sản phẩm!"
      );
    }
=======
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
      toast.success("Đã vô hiệu hóa sản phẩm thành công!");
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
>>>>>>> dev
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = {
      "Tất cả": totalItems,
      "Hàng sẵn": 0,
      "Đặt theo mẫu": 0,
      "Hết hàng": 0,
      "Quà tặng": 0,
      "Chưa định giá": 0,
    };
    products.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [products, totalItems]);

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
              className={`w-12 h-12 rounded-lg object-cover border bg-white transition-all ${item.status === "Chưa định giá" ? "ring-2 ring-[var(--status-error)] ring-offset-1" : ""}`}
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
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--text-main)] text-[13px]">
            {item.productType}
          </span>
          {item.status !== "Chưa định giá" && (
            <span className="text-[10px] text-[var(--brand-primary)] font-bold flex items-center gap-0.5 mt-1 bg-[var(--brand-primary)]/5 px-1.5 py-0.5 rounded-sm border border-blue-100 self-start">
              <ShieldCheck size={10} /> BH: {item.warrantyMonths || 12}T
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Giá bán",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => {
        if (item.status === "Quà tặng") {
          return (
            <div className="flex flex-col items-end">
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
            <div className="flex flex-col items-end">
              <span className="text-[13px] font-black text-amber-600">
                {fmtCurrency(item.retailPrice)}
              </span>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter mt-0.5">
                (Giá chốt theo đơn)
              </span>
            </div>
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
            <div className="flex flex-col items-end">
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
          <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
            {fmtCurrency(item.retailPrice)}
          </p>
        );
      },
    },
    {
      header: "Tồn",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) =>
        item.productType !== "Hàng khách đặt" ? (
          <span className={`font-bold ${item.stock === 0 ? "text-[var(--status-error)]" : "text-[var(--text-main)]"}`}>
            {item.stock}
          </span>
        ) : (
          <span className="text-[var(--text-placeholder)]">—</span>
        ),
    },
    {
      header: "Trạng thái",
      render: (item) => {
        const sc = getStatusConfig(item.status);
        return (
          <span
            className="inline-flex items-center justify-center w-[130px] px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap gap-1.5"
            style={{
              backgroundColor: sc.bg,
              color: sc.text,
              border: `1px solid ${sc.border}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.text }} />
            {item.status}
          </span>
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
<<<<<<< HEAD
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {totalItems} sản phẩm (
              {productTypeFilter === "Tất cả"
                ? "tất cả loại"
                : productTypeFilter.toLowerCase()}
              )
=======
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {totalItems} sản phẩm (
              {productTypeFilter === "Tất cả" ? "tất cả loại" : productTypeFilter.toLowerCase()})
>>>>>>> dev
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Nút thêm sản phẩm mới */}
            <button
              onClick={() => setModalState({ product: {}, mode: "create" })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all active:scale-95 cursor-pointer"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>

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
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <PackageOpen size={56} className="text-slate-300" />
            <p className="text-lg font-semibold text-slate-400">Chưa có sản phẩm nào</p>
            <p className="text-sm text-slate-400">Bấm "Thêm sản phẩm" để tạo sản phẩm mới</p>
            <button
              onClick={() => setModalState({ product: {}, mode: "create" })}
              className="flex items-center gap-2 mt-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition active:scale-95 cursor-pointer"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              <Plus size={16} /> Thêm sản phẩm đầu tiên
            </button>
          </div>
        )}

        {/* DATA TABLE */}
<<<<<<< HEAD
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
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
              showIf: (item) => item.status !== "Hết hàng",
            },
            {
              icon: Trash2,
              label: "Xóa sản phẩm",
              onClick: (item) => handleConfirmDelete(item),
              className: "text-red-500 hover:bg-red-50",
            },
          ]}
          bulkActions={[
            {
              label: "XÓA HÀNG LOẠT",
              icon: Trash2,
              onClick: () => {
                toast.error("Chức năng xóa hàng loạt tạm thời vô hiệu hóa!");
              },
              requireConfirm: true,
              confirmTitle: "Xóa hàng loạt sản phẩm?",
              confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đang chọn?`,
            },
          ]}
          extraFilters={
            <>
              <div className="relative flex items-center">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 px-3 pr-9 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                  style={{
                    border:
                      categoryFilter !== "Tất cả"
                        ? "1px solid var(--brand-primary)"
                        : "1px solid var(--grid-border)",
                    backgroundColor:
                      categoryFilter !== "Tất cả"
                        ? "var(--status-focus)"
                        : "#fff",
                    color:
                      categoryFilter !== "Tất cả"
                        ? "var(--brand-primary)"
                        : "var(--text-main)",
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
                  className="absolute right-3 pointer-events-none opacity-50"
                  style={{
                    color:
                      categoryFilter !== "Tất cả"
                        ? "var(--brand-primary)"
                        : "var(--text-main)",
                  }}
                  strokeWidth={2.5}
                />
              </div>
            </>
          }
          pagination={{
            total: totalItems,
            currentPage,
            setCurrentPage,
            itemsPerPage,
            setItemsPerPage,
          }}
        />
=======
        {!loading && !error && products.length > 0 && (
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
                showIf: (item) => item.status !== "Hết hàng",
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
                    toast.success(`Đã vô hiệu hóa ${selectedIds.length} sản phẩm!`);
                    fetchProducts();
                  } catch (err) {
                    toast.error(err?.response?.data?.message || "Lỗi khi xóa hàng loạt");
                  }
                },
                requireConfirm: true,
                confirmTitle: "Xóa hàng loạt sản phẩm?",
                confirmMessage: `Bạn có chắc chắn muốn vô hiệu hóa ${selectedIds.length} sản phẩm đang chọn?`,
              },
            ]}
            extraFilters={
              <>
                <div className="relative flex items-center">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 px-3 pr-9 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                    style={{
                      border: categoryFilter !== "Tất cả" ? "1px solid var(--brand-primary)" : "1px solid var(--grid-border)",
                      backgroundColor: categoryFilter !== "Tất cả" ? "var(--status-focus)" : "#fff",
                      color: categoryFilter !== "Tất cả" ? "var(--brand-primary)" : "var(--text-main)",
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
                    className="absolute right-3 pointer-events-none opacity-50"
                    style={{
                      color: categoryFilter !== "Tất cả" ? "var(--brand-primary)" : "var(--text-main)",
                    }}
                    strokeWidth={2.5}
                  />
                </div>
              </>
            }
            pagination={{
              total: statusFilter === "Tất cả" ? totalItems : filteredProducts.length,
              currentPage,
              setCurrentPage,
              itemsPerPage,
              setItemsPerPage,
            }}
          />
        )}
>>>>>>> dev
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
<<<<<<< HEAD
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${itemToDelete?.name}" (${itemToDelete?.code}) không?`}
=======
        title="Xác nhận vô hiệu hóa sản phẩm"
        message={`Bạn có chắc chắn muốn vô hiệu hóa sản phẩm "${itemToDelete?.name}" (${itemToDelete?.code}) không? Sản phẩm sẽ không hiển thị trong bán hàng.`}
>>>>>>> dev
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={() => handleDeleteProduct(itemToDelete?.id)}
      />
    </>
  );
}
