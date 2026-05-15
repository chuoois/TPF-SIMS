import { useState, useMemo, useEffect } from "react";
import {
  Pencil,
  Eye,
  Package,
  Trash2,
  AlertCircle,
  ChevronDown,
  Tag,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import ProductModal from "./ProductModal";
import productAttributeService from "@/services/productAttribute.service";

const INITIAL_PRODUCTS = [
  {
    id: "SP001",
    code: "ST-HS-197x107x108-Mit",
    name: "Sập thờ Mai Điểu chân 20",
    category: "Phòng thờ",
    material: "Gỗ Mít",
    color: "Cánh gián",
    dimensions: "197x107x108",
    costPrice: 32000000,
    paintCost: 2500000,
    retailPrice: 48000000,
    productType: "Hàng sẵn",
    status: "Hàng sẵn",
    stock: 2,
    isPriced: true,
    warrantyMonths: 120,
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=600",
    description:
      "Sập thờ trạm khắc tỉ mỉ tinh xảo, chất liệu gỗ mít lõi liền khối chọn lọc.",
    techNotes: {
      leg: "Chân 20",
      apron: "Dạ đục tay Mai Điểu",
      other: "Hàng sạch rác, gỗ chọn vân.",
    },
    lots: [
      {
        lotId: "LOT-SP001-1",
        importDate: "2025-10-10",
        importPrice: 30000000,
        initialQuantity: 1,
      },
      {
        lotId: "LOT-SP001-2",
        importDate: "2026-01-20",
        importPrice: 32000000,
        initialQuantity: 1,
      },
    ],
  },
  {
    id: "SP002",
    code: "TA-HM-160x200x55-XoanDao",
    name: "Tủ áo gỗ Xoan Đào (3 cánh)",
    category: "Phòng ngủ",
    material: "Gỗ xoan đào",
    color: "Để mộc",
    dimensions: "160x200x55",
    costPrice: 8500000,
    paintCost: 1200000,
    rawRetailPrice: 11000000,
    finishedRetailPrice: 14500000,
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 3,
    isPriced: true,
    warrantyMonths: 36,
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600",
    description:
      "Hàng mộc sẵn tại kho, có thể lấy ngay hoặc sơn hoàn thiện trong 7 ngày.",
    lots: [
      {
        lotId: "LOT-002",
        importDate: "2026-02-10",
        importPrice: 8500000,
        initialQuantity: 3,
      },
    ],
  },
  {
    id: "SP003",
    code: "BBG-HKD-Tay12-Huong",
    name: "Bộ bàn ghế Quốc Voi (Khách đặt)",
    category: "Phòng khách",
    material: "Gỗ Hương",
    color: "Mun",
    dimensions: "Tay 12 - 6 món",
    costPrice: 95000000,
    paintCost: 0,
    retailPrice: 125000000,
    productType: "Hàng khách đặt",
    status: "Hàng khách đặt",
    stock: 0,
    isPriced: true,
    warrantyMonths: 60,
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=600",
    description:
      "Hàng đặt theo yêu cầu của Anh Hùng (Thanh Hóa). Đục tay sắc nét.",
    lots: [
      {
        lotId: "LOT-003",
        importDate: "2026-02-15",
        importPrice: 95000000,
        initialQuantity: 1,
      },
    ],
  },
  {
    id: "SP004",
    code: "BG-NEW-Huong-CDG",
    name: "Bộ Ghế Âu Á Chương Cuốn Thư",
    category: "Phòng khách",
    material: "Gỗ Hương",
    color: "Để mộc",
    dimensions: "Tay 10 - 6 món",
    costPrice: 18000000,
    paintCost: 0,
    retailPrice: 0,
    productType: "Hàng mộc",
    status: "Chưa định giá",
    stock: 1,
    isPriced: false,
    warrantyMonths: 24,
    img: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=600",
    description:
      "Hàng mới nhập kho sáng nay, gỗ đều màu, không rác. Cần định giá bán lẻ.",
    lots: [
      {
        lotId: "LOT-004",
        importDate: "2026-04-09",
        importPrice: 18000000,
        initialQuantity: 1,
      },
    ],
  },
  {
    id: "SP005",
    code: "QT-DK-01",
    name: "Đế kê tượng gỗ Hương",
    category: "Trang trí",
    material: "Gỗ Hương",
    color: "Cánh gián",
    dimensions: "30x30x20",
    costPrice: 450000,
    paintCost: 0,
    retailPrice: 0,
    productType: "Hàng sẵn",
    status: "Quà tặng",
    stock: 15,
    isPriced: true,
    warrantyMonths: 12,
    img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=600",
    description:
      "Sản phẩm dùng làm quà tặng kèm khi khách mua hóa đơn trên 50tr.",
    lots: [
      {
        lotId: "LOT-005",
        importDate: "2026-01-01",
        importPrice: 450000,
        initialQuantity: 20,
      },
    ],
  },
  {
    id: "SP006",
    code: "GHE-HH-TEST",
    name: "Ghế đa năng gỗ Sồi",
    category: "Phòng khách",
    material: "Gỗ Sồi",
    color: "Tự nhiên",
    dimensions: "50x50x100",
    costPrice: 1200000,
    paintCost: 200000,
    retailPrice: 2000000,
    productType: "Hàng sẵn",
    status: "Hết hàng",
    stock: 0,
    isPriced: true,
    warrantyMonths: 12,
    img: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=600",
    description: "Sản phẩm đang tạm hết hàng, tuần sau sẽ nhập lô mới.",
    lots: [
      {
        lotId: "LOT-006",
        importDate: "2025-11-20",
        importPrice: 1200000,
        initialQuantity: 10,
        remainingQuantity: 0,
      },
    ],
  },
];

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
    default:
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

// ===================== COMPONENT =====================
export default function OwnerProducts() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("tpf_simulated_products_v2");
    if (!saved) {
      localStorage.setItem(
        "tpf_simulated_products_v2",
        JSON.stringify(INITIAL_PRODUCTS),
      );
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(saved);

    let needsUpdate = false;
    const merged = parsed.map((p) => {
      const defaultProduct = INITIAL_PRODUCTS.find((dp) => dp.id === p.id);

      if (p.productType === "Hàng khách đặt") {
        if (!p.isPriced || p.status === "Chưa định giá") {
          p.isPriced = true;
          p.status = "Hàng khách đặt";
          needsUpdate = true;
        }
      }

      // Backfill pricing fields từ INITIAL_PRODUCTS nếu chưa có
      if (defaultProduct) {
        const pricingFields = ["paintCost"];
        pricingFields.forEach((field) => {
          if (p[field] === undefined && defaultProduct[field] !== undefined) {
            p[field] = defaultProduct[field];
            needsUpdate = true;
          }
        });
      }

      if (!p.lots) {
        if (defaultProduct && defaultProduct.lots) {
          needsUpdate = true;
          return { ...p, lots: defaultProduct.lots };
        }
      }
      return p;
    });

    if (!merged.some((p) => p.id === "SP006")) {
      const sp006 = INITIAL_PRODUCTS.find((p) => p.id === "SP006");
      if (sp006) {
        merged.push(sp006);
        needsUpdate = true;
      }
    }

    merged.forEach((p) => {
      if (p.status === "Ngừng kinh doanh") {
        p.status = "Hết hàng";
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      localStorage.setItem("tpf_simulated_products_v2", JSON.stringify(merged));
    }

    return merged;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("tpf_simulated_products_v2", JSON.stringify(products));
  }, [products]);

  // Listen for storage changes (from other tabs/pages)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "tpf_simulated_products_v2" && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await productAttributeService.getAllAttributes();
        setMetadata(data);
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    };
    fetchMetadata();
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Modal state: { product, mode: 'view' | 'edit' }
  const [modalState, setModalState] = useState({ product: null, mode: "view" });

  const openModal = (product, mode = "view") =>
    setModalState({ product, mode });
  const closeModal = () => setModalState({ product: null, mode: "view" });

  // Actions
  const handleConfirmDelete = (item, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (item.stock > 0 || (item.lots && item.lots.length > 0)) {
      toast.error(
        "Không thể xoá! Sản phẩm đang có tồn kho hoặc đã có lịch sử nhập lô.",
      );
      return;
    }
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    toast.success("Đã xóa sản phẩm thành công!");
  };

  // Filter logic
  const statusCounts = useMemo(() => {
    const counts = {
      "Tất cả": products.length,
      "Hàng sẵn": 0,
      "Đặt theo mẫu": 0,
      "Hết hàng": 0,
      "Quà tặng": 0,
    };
    products.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (statusFilter !== "Tất cả") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (productTypeFilter !== "Tất cả") {
      result = result.filter((p) => p.productType === productTypeFilter);
    }
    if (categoryFilter !== "Tất cả") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, statusFilter, productTypeFilter, categoryFilter, searchQuery]);

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

  useEffect(() => {
    setTimeout(() => setCurrentPage(1), 0);
  }, [searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===================== HANDLE SAVE =====================
  const handleSave = (updated, message) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    toast.success(message || "Đã cập nhật sản phẩm thành công!");
    closeModal();
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
              className={`w-12 h-12 rounded-lg object-cover border bg-white transition-all ${item.status === "Chưa định giá" ? "ring-2 ring-[var(--status-error)] ring-offset-1" : ""}`}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--bg-main)] border text-gray-300">
              <ImageIcon size={18} />
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
          <p
            className="text-[12px] font-bold font-mono"
            style={{ color: "var(--text-main)" }}
          >
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
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--status-error)]/10 text-[var(--status-error)] text-[9px] font-black uppercase tracking-tighter border border-[var(--status-error)]/20 animate-in fade-in zoom-in duration-500">
                <AlertCircle size={10} /> Cần định giá
              </span>
            )}
          </div>
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-placeholder)" }}
          >
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
          <p
            className="text-[13px] font-bold"
            style={{ color: "var(--text-main)" }}
          >
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
        item.productType === "Hàng sẵn" ? (
          <span
            className={`font-bold ${item.stock === 0 ? "text-[var(--status-error)]" : "text-[var(--text-main)]"}`}
          >
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
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: sc.text }}
            />
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
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filteredProducts.length} sản phẩm (
              {productTypeFilter === "Tất cả"
                ? "tất cả loại"
                : productTypeFilter.toLowerCase()}
              )
            </p>
          </div>

          <div
            className="flex p-1 rounded-lg"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              border: "1px solid var(--grid-border)",
            }}
          >
            {["Tất cả", "Hàng sẵn", "Hàng mộc", "Hàng khách đặt"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setProductTypeFilter(type)}
                  className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      productTypeFilter === type ? "#fff" : "transparent",
                    color:
                      productTypeFilter === type
                        ? "var(--text-main)"
                        : "var(--text-secondary)",
                  }}
                >
                  {type}
                </button>
              ),
            )}
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap py-1">
          {[
            { id: "Tất cả", label: "Tất cả" },
            {
              id: "Chưa định giá",
              label: "Chưa định giá",
              color: "red",
              icon: AlertCircle,
            },
            {
              id: "Hết hàng",
              label: "Hết hàng",
              color: "red",
              icon: AlertCircle,
            },
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
                  backgroundColor: isActive
                    ? sc
                      ? sc.bg
                      : "#fff"
                    : "transparent",
                  color: isActive
                    ? sc
                      ? sc.text
                      : "var(--brand-primary)"
                    : "var(--text-secondary)",
                  borderColor: isActive
                    ? sc
                      ? sc.border
                      : "var(--grid-border)"
                    : "transparent",
                }}
              >
                {s.icon && (
                  <s.icon
                    size={14}
                    className={
                      isActive
                        ? isRedForce
                          ? "text-red-500"
                          : "text-[var(--brand-primary)]"
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

        {/* DATA TABLE */}
        <DataTable
          columns={columns}
          data={paginatedProducts}
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
              showIf: (item) =>
                item.stock === 0 && (!item.lots || item.lots.length === 0),
            },
          ]}
          bulkActions={[
            {
              label: "XÓA HÀNG LOẠT",
              icon: Trash2,
              onClick: () => {
                const invalidDeletes = products
                  .filter((p) => selectedIds.includes(p.id))
                  .some((p) => p.stock > 0 || (p.lots && p.lots.length > 0));

                if (invalidDeletes) {
                  toast.error(
                    "Lỗi: Tồn tại sản phẩm đang có tồn kho hoặc lịch sử kiện hàng trong danh sách chọn!",
                  );
                  return;
                }

                setProducts((prev) =>
                  prev.filter((p) => !selectedIds.includes(p.id)),
                );
                setSelectedIds([]);
                toast.success(
                  `Đã xóa ${selectedIds.length} sản phẩm đã chọn thành công!`,
                );
              },
              requireConfirm: true,
              confirmTitle: "Xóa hàng loạt sản phẩm?",
              confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đang chọn? Hành động này không thể hoàn tác.`,
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
            total: filteredProducts.length,
            currentPage,
            setCurrentPage,
            itemsPerPage,
            setItemsPerPage,
          }}
        />
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${itemToDelete?.name}" (${itemToDelete?.code}) không? Hành động này không thể hoàn tác.`}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={() => handleDeleteProduct(itemToDelete?.id)}
      />
    </>
  );
}
