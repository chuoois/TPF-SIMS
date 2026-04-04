import { useState, useMemo, useEffect } from "react";
import {
  Pencil,
  Eye,
  X,
  Image as ImageIcon,
  Gift,
  Package,
  Banknote,
  Info,
  Clock,
  ShieldCheck,
  Hammer,
  Trash2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import {
  CATEGORIES,
  WOOD_TYPES,
  OTHER_MATERIALS,
  COLORS,
  PRODUCT_STATUSES,
  UNITS,
} from "./constants";

const INITIAL_PRODUCTS = [
  {
    id: "SP001",
    code: "ST-HS-197x107x108-Mit",
    name: "Sập thờ Mai Điểu chân 20",
    category: "Phòng thờ",
    material: "Gỗ Mít",
    color: "Đục tay",
    dimensions: "197x107x108",
    costPrice: 32000000,
    retailPrice: 45000000,
    unit: "Chiếc",
    productType: "Hàng sẵn",
    status: "Hàng sẵn",
    stock: 2,
    isPriced: true,
    warrantyMonths: 12,
    leadTime: 0,
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300",
    description:
      "Sập thờ trạm khắc tỉ mỉ tinh xảo, chất liệu gỗ mít lõi liền khối.",
    techNotes: {
      leg: "Chân 20",
      apron: "Dạ đục tay Mai Điểu",
      other: "Hàng sạch rác, gỗ chọn vân.",
    },
  },
  {
    id: "SP002",
    code: "BBG-HKD-Tay12-Huong",
    name: "Bộ bàn ghế Quốc Voi 6 món",
    category: "Phòng khách",
    material: "Gỗ Hương",
    color: "Đục tay",
    dimensions: "Tay 12",
    costPrice: 95000000,
    retailPrice: 120000000,
    unit: "Bộ",
    productType: "Hàng khách đặt",
    status: "Hàng khách đặt",
    stock: 0,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=300",
    leadTime: 30,
    description: "Hàng khách đặt theo kích thước riêng, tay 12 vách 4 phân.",
  },
  {
    id: "SP-THO-01",
    code: "TA-HM-160x200x55-XoanDao",
    name: "Tủ áo gỗ xoan đào (Hàng mộc)",
    category: "Phòng ngủ",
    material: "Gỗ xoan đào",
    color: "Để mộc",
    dimensions: "160x200x55",
    costPrice: 8500000,
    laborCost: 1500000,
    materialCost: 500000,
    paintCost: 1200000,
    rawRetailPrice: 10500000,
    finishedRetailPrice: 13500000,
    unit: "Chiếc",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 3,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300",
    leadTime: 7,
    description: "Hàng mộc sẵn tại kho, chờ sơn hoàn thiện.",
    techNotes: {
      leg: "Chân quỳ 12",
      apron: "Dạ trơn, yếm dầy 4 phân",
      other: "Khách có thể kiểm tra mộc trước khi sơn.",
    },
  },
  {
    id: "SP-NEW-01",
    code: "BG-NEW-Huong-01",
    name: "Bộ Ghế Tần Thủy Hoàng (Mới nhập)",
    category: "Phòng khách",
    material: "Gỗ Hương",
    color: "Để mộc",
    dimensions: "Tay 12",
    costPrice: 42000000,
    retailPrice: 0,
    unit: "Bộ",
    productType: "Hàng mộc",
    status: "Chưa định giá",
    stock: 1,
    isPriced: false,
    img: null,
    description: "Hàng mới nhập kho bởi kế toán, chờ chủ cửa hàng định giá.",
  },
  {
    id: "SP-NEW-02",
    code: "ST-NEW-Mit-02",
    name: "Sập thờ Nhị Cấp (Mới nhập)",
    category: "Phòng thờ",
    material: "Gỗ Mít",
    color: "Để mộc",
    dimensions: "197x127x117",
    costPrice: 24000000,
    retailPrice: 0,
    unit: "Chiếc",
    productType: "Hàng sẵn",
    status: "Chưa định giá",
    stock: 2,
    isPriced: false,
    img: null,
    description: "Hàng mới nhập kho, chưa định giá bán lẻ.",
  },
  {
    id: "SP-HM-01",
    code: "ST-HM-197x107-GoGu",
    name: "Sập thờ Mai Điểu (Hàng mộc)",
    category: "Phòng thờ",
    material: "Gỗ Gụ",
    color: "Để mộc",
    dimensions: "197x107x117",
    costPrice: 28000000,
    laborCost: 6000000,
    materialCost: 2000000,
    paintCost: 3500000,
    rawRetailPrice: 35000000,
    finishedRetailPrice: 42000000,
    unit: "Chiếc",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 2,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=300",
    description: "Hàng mộc đục tay kỹ, gỗ gụ chọn lọc không rác.",
    techNotes: {
      leg: "Chân 24",
      apron: "Dạ đục Ngũ Phúc Kim Tiền",
      other: "Mặt sập 2 lá, dầy 2 phân đậu.",
    },
  },
  {
    id: "SP-HM-02",
    code: "BG-HM-TanThuyHoang-Huong",
    name: "Bộ Tần Thủy Hoàng 6 món (Hàng mộc)",
    category: "Phòng khách",
    material: "Gỗ Hương Đá",
    color: "Để mộc",
    dimensions: "Cột 12",
    costPrice: 45000000,
    rawRetailPrice: 58000000,
    finishedRetailPrice: 68000000,
    unit: "Bộ",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 1,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=300",
    description: "Hàng mộc vân đẹp, đục tay chi tiết.",
  },
  {
    id: "SP-HM-03",
    code: "GN-HM-180x200-GoGo",
    name: "Giường ngủ chữ X (Hàng mộc)",
    category: "Phòng ngủ",
    material: "Gỗ Gõ đỏ",
    color: "Để mộc",
    dimensions: "180x200",
    costPrice: 10000000,
    rawRetailPrice: 13000000,
    finishedRetailPrice: 16500000,
    unit: "Chiếc",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 5,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=300",
    description: "Hàng mộc sẵn kho, dát phản dầy.",
  },
  {
    id: "SP-HM-04",
    code: "BA-HM-6Ghe-Soi",
    name: "Bộ bàn ăn 6 ghế chữ Thọ (Hàng mộc)",
    category: "Phòng ăn",
    material: "Gỗ Sồi Nga",
    color: "Để mộc",
    dimensions: "160x80",
    costPrice: 6000000,
    rawRetailPrice: 8000000,
    finishedRetailPrice: 10500000,
    unit: "Bộ",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 3,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1617806118233-ef203e91122b?q=80&w=300",
    description: "Hàng mộc chắc chắn, kiểu dáng hiện đại.",
  },
  {
    id: "SP-HM-05",
    code: "KTV-HM-CotNho-Huong",
    name: "Kệ tivi cột nho 2m4 (Hàng mộc)",
    category: "Phòng khách",
    material: "Gỗ Hương Đá",
    color: "Để mộc",
    dimensions: "240x50x80",
    costPrice: 12000000,
    rawRetailPrice: 15500000,
    finishedRetailPrice: 19000000,
    unit: "Chiếc",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 2,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300",
    description: "Hàng mộc đục cảnh tứ quý, gỗ đều màu.",
  },
  {
    id: "SP003",
    code: "SF-HS-260x180x85-GoDo",
    name: "Sofa nguyên khối chữ L",
    category: "Phòng khách",
    material: "Gỗ Gõ đỏ",
    color: "Nguyên khối",
    dimensions: "260x180x85",
    costPrice: 25000000,
    retailPrice: 35000000,
    unit: "Bộ",
    productType: "Hàng sẵn",
    status: "Hàng sẵn",
    stock: 5,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=300",
    description: "Bộ L mặt nguyên tấm dày 10cm.",
  },
  {
    id: "SP004",
    code: "LB-HS-180m-Huong",
    name: "Lộc bình cao 1m8",
    category: "Trang trí",
    material: "Gỗ Hương",
    color: "Đục máy sửa tay",
    dimensions: "Cao 180cm, ĐK 50",
    costPrice: 18000000,
    retailPrice: 25000000,
    unit: "Cặp",
    productType: "Hàng sẵn",
    status: "Hết hàng",
    stock: 0,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=300",
    description: "Tiện liền khối.",
  },
  {
    id: "SP005",
    code: "GN-HS-180x200-Soi",
    name: "Giường ngủ hoa hồng Tân cổ điển",
    category: "Phòng ngủ",
    material: "Gỗ Sồi",
    color: "Đục máy sửa tay",
    dimensions: "180x200",
    costPrice: 12000000,
    retailPrice: 18500000,
    unit: "Chiếc",
    productType: "Hàng sẵn",
    status: "Hết hàng",
    stock: 0,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=300",
    description: "Mẫu cũ năm ngoái.",
  },
  {
    id: "SP006",
    code: "TDM-HS-60x30-Trac",
    name: "Tượng Đạt Ma sư tổ",
    category: "Trang trí",
    material: "Gỗ Trắc",
    color: "Đục tay",
    dimensions: "Cao 60, Rộng 30",
    costPrice: 5000000,
    retailPrice: 8500000,
    unit: "Pho",
    productType: "Hàng sẵn",
    status: "Quà tặng",
    stock: 1,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300",
    description: "Hàng đục kỹ.",
  },
  {
    id: "SP007",
    code: "BA-HKD-240x95x10-GoDo",
    name: "Bộ bàn ăn 8 ghế nguyên khối",
    category: "Phòng ăn",
    material: "Gỗ Gõ đỏ",
    color: "Nguyên khối",
    dimensions: "240x95x10",
    costPrice: 40000000,
    retailPrice: 55000000,
    unit: "Bộ",
    productType: "Hàng khách đặt",
    status: "Hàng khách đặt",
    stock: 0,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=300",
    description: "Nguyên tấm nguyên khối.",
  },
];

// ===================== HELPERS =====================
const fmtCurrency = (n) => {
  if (n === undefined || n === null || isNaN(n) || n === 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
};

const formatNumberInput = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumberInput = (value) => {
  if (!value) return "";
  return value.toString().replace(/\./g, "").replace(/[^\d]/g, "");
};

const getStatusConfig = (status) => {
  switch (status) {
    case "Chưa định giá":
      return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" }; // Red (warning)
    case "Hàng sẵn":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }; // Green
    case "Hàng mộc":
      return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" }; // Amber
    case "Hàng khách đặt":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }; // Blue
    case "Hết hàng":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }; // Orange
    case "Quà tặng":
      return { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" }; // Purple
    default:
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

// ===================== SUB-COMPONENTS =====================

// ===================== COMPONENT =====================
export default function OwnerProducts() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("tpf_simulated_products");
    if (!saved) {
      // First time: save default products to localStorage
      localStorage.setItem(
        "tpf_simulated_products",
        JSON.stringify(INITIAL_PRODUCTS),
      );
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(saved);
    // Auto-fix any old 'Ngừng kinh doanh' status to 'Hết hàng'
    parsed.forEach((p) => {
      if (p.status === "Ngừng kinh doanh") p.status = "Hết hàng";
    });
    return parsed;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("tpf_simulated_products", JSON.stringify(products));
  }, [products]);

  // Listen for storage changes (from other tabs/pages)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "tpf_simulated_products" && e.newValue) {
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [modal, setModal] = useState({ isOpen: false, view: null, data: null }); // view: 'detail' | 'form'

  const [costPrice, setCostPrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [rawRetailPrice, setRawRetailPrice] = useState(0);
  const [finishedRetailPrice, setFinishedRetailPrice] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [materialCost, setMaterialCost] = useState(0);
  const [paintCost, setPaintCost] = useState(0);
  const [setupCost, setSetupCost] = useState(0);
  const [productType, setProductType] = useState("Hàng sẵn");
  const [productCategory, setProductCategory] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [warrantyContent, setWarrantyContent] = useState("Bảo hành các lỗi kỹ thuật.");
  const [targetMargin, setTargetMargin] = useState(20);
  const [taxPercent, setTaxPercent] = useState(0);
  const [woodType, setWoodType] = useState("");
  const [color, setColor] = useState("");
  const [dimL, setDimL] = useState("");
  const [dimW, setDimW] = useState("");
  const [dimH, setDimH] = useState("");
  const [leadTime, setLeadTime] = useState(0);
  const [techNotes, setTechNotes] = useState({ leg: "", apron: "", other: "" });

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Actions
  const toggleStatus = (id, newStatus) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
    toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Đã xóa sản phẩm thành công!");
    closeModal();
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = (item, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleOpenModal = (view, product = null, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (view === "form") {
      if (product) {
        setCostPrice(product.costPrice || 0);
        setRetailPrice(product.retailPrice || 0);
        setRawRetailPrice(product.rawRetailPrice || 0);
        setFinishedRetailPrice(product.finishedRetailPrice || 0);
        setLaborCost(product.laborCost || 0);
        setMaterialCost(product.materialCost || 0);
        setPaintCost(product.paintCost || 0);
        setSetupCost(product.setupCost || 0);
        setProductType(product.productType || "Hàng sẵn");
        setProductCategory(product.category || "");
        setWarrantyMonths(product.warrantyMonths || 12);
        setWarrantyContent(product.warrantyContent || "Bảo hành các lỗi kỹ thuật.");
        setTargetMargin(product.targetMargin || 20);
        setTaxPercent(product.taxPercent || 0);
        setWoodType(product.material || ""); // Fix: material mapping
        setColor(product.color || "");
        const dims = (product.dimensions || "")
          .split(/[xX*×]/)
          .map((d) => d.trim());
        setDimL(dims[0] || "");
        setDimW(dims[1] || "");
        setDimH(dims[2] || "");
        setLeadTime(product.leadTime || 0);
        setTechNotes(product.techNotes || { leg: "", apron: "", other: "" });
      }
    }

    setModal({ isOpen: true, view, data: product });
  };

  const closeModal = () => setModal({ isOpen: false, view: null, data: null });

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

  const hasActiveFilters = categoryFilter !== "Tất cả" || searchQuery || productTypeFilter !== "Tất cả";
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

  const handleSaveAddEdit = () => {
    const editItem = modal.data;
    if (editItem) {
      // Logic for editing existing product
      let newStatus = editItem.status;
      let isPriced = editItem.isPriced;

      if (editItem.status === "Chưa định giá") {
        isPriced = true;
        // Logic for transitioning status
        if (productType === "Hàng sẵn") {
          newStatus = editItem.stock > 0 ? "Hàng sẵn" : "Hết hàng";
        } else {
          newStatus = "Hàng khách đặt";
        }
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editItem.id
            ? {
              ...p,
              costPrice: Number(costPrice),
              retailPrice: Number(retailPrice),
              rawRetailPrice: Number(rawRetailPrice),
              finishedRetailPrice: Number(finishedRetailPrice),
              laborCost: Number(laborCost),
              materialCost: Number(materialCost),
              paintCost: Number(paintCost),
              setupCost: Number(setupCost),
              productType,
              category: productCategory,
              warrantyMonths: Number(warrantyMonths),
              warrantyContent,
              targetMargin: Number(targetMargin),
              taxPercent: Number(taxPercent),
              woodType,
              color,
              dimensions: [dimL, dimW, dimH].filter(Boolean).join(" × "),
              leadTime: Number(leadTime),
              techNotes: { ...techNotes },
              isPriced: true,
              status: newStatus,
            }
            : p,
        ),
      );
      toast.success("Đã cập nhật thông tin sản phẩm và định giá thành công!");
    }
    closeModal();
  };

  // ===================== UNIFIED MODAL (DETAIL & PRICING) =====================
  const renderProductModal = () => {
    if (!modal.isOpen || !modal.view) return null;
    const editing = modal.view === "form";
    const detailItem = modal.data;
    const editItem = modal.data;
    const sc = detailItem ? getStatusConfig(detailItem.status) : null;

    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={closeModal}
        />
        <div
          className={`bg-white w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-lg shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300`}
          style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              {editing ? (
                editItem?.status === "Chưa định giá" ? (
                  <span className="flex items-center gap-2 text-[var(--status-error)]">
                    <Banknote size={20} /> Định giá sản phẩm mới
                  </span>
                ) : (
                  "Sửa sản phẩm"
                )
              ) : (
                <>
                  Chi tiết sản phẩm
                  <span className="text-[var(--brand-primary)] font-mono text-sm tracking-wider px-2 py-0.5 bg-[var(--brand-primary)]/5 rounded-md ml-2">
                    {detailItem?.code}
                  </span>
                </>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition cursor-pointer text-[var(--text-placeholder)]"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {!editing ? (
              /* ================= DETAIL VIEW ================= */
              <div className="flex gap-6">
                <div className="w-1/3 shrink-0 space-y-3">
                  {detailItem.img ? (
                    <img
                      src={detailItem.img}
                      alt={detailItem.name}
                      className="w-full aspect-square object-cover rounded-xl border"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded-xl border flex flex-col items-center justify-center text-[var(--text-placeholder)]">
                      <ImageIcon size={40} className="mb-2" />
                      <span className="text-sm">Chưa có ảnh</span>
                    </div>
                  )}
                  <div className="flex justify-center">
                    <span
                      className="inline-flex items-center px-3 py-1 text-[13px] font-bold rounded-lg"
                      style={{
                        backgroundColor: sc?.bg,
                        color: sc?.text,
                        border: `1px solid ${sc?.border}`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: sc?.text }}
                      />
                      Trạng thái: {detailItem.status}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-[var(--text-main)] mb-1">
                        {detailItem.name}
                      </h1>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {detailItem.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-[var(--text-secondary)] block text-xs">
                        Loại hàng
                      </span>
                      <span className="font-semibold text-[var(--text-main)]">
                        {detailItem.productType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] block text-xs">
                        Chất liệu
                      </span>
                      <span className="font-semibold text-[var(--text-main)]">
                        {detailItem.material}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] block text-xs">
                        Màu sắc
                      </span>
                      <span className="font-semibold text-[var(--text-main)]">
                        {detailItem.color}
                      </span>
                    </div>
                    {detailItem.status !== "Chưa định giá" && (
                      <div>
                        <span className="text-[var(--text-secondary)] block text-xs italic">
                          Bảo hành
                        </span>
                        <span className="font-bold text-[var(--brand-primary)] flex items-center gap-1">
                          <ShieldCheck size={14} />{" "}
                          {detailItem.warrantyMonths || 12} tháng
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[var(--text-secondary)] block text-xs">
                        Kích thước
                      </span>
                      <span className="font-semibold text-[var(--text-main)]">
                        {detailItem.dimensions}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-main)] rounded-xl grid grid-cols-2 gap-4">
                    {detailItem.productType === "Hàng mộc" ? (
                      <>
                        <div>
                          <span className="text-[var(--text-secondary)] block text-xs mb-1">
                            Giá bán mộc
                          </span>
                          <span className="text-lg font-bold text-[var(--palette-orange)]">
                            {fmtCurrency(detailItem.rawRetailPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)] block text-xs mb-1">
                            Giá bán hoàn thiện
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {fmtCurrency(detailItem.finishedRetailPrice)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-[var(--text-secondary)] block text-xs mb-1">
                          Giá bán lẻ
                        </span>
                        <span
                          className={`text-lg font-bold ${detailItem.status === "Chưa định giá" ? "text-[var(--status-error)]" : "text-[var(--brand-primary)]"}`}
                        >
                          {detailItem.status === "Chưa định giá"
                            ? "Chờ định giá"
                            : fmtCurrency(detailItem.retailPrice)}
                        </span>
                      </div>
                    )}
                    <div className="col-span-2 border-t border-gray-100 mt-2 pt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)] text-xs">
                          Tồn kho hiện tại
                        </span>
                        <span className="text-lg font-bold text-[var(--text-main)]">
                          {detailItem.productType === "Hàng khách đặt"
                            ? "—"
                            : detailItem.stock}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-[var(--status-pending)]/10/50 p-2 rounded-lg border border-[var(--status-pending)]/20/50">
                        <span className="text-[var(--status-pending)] text-xs font-bold flex items-center gap-1">
                          <Clock size={12} /> Hoàn thiện dự kiến
                        </span>
                        <span className="text-[13px] font-black text-[var(--status-pending)]">
                          {detailItem.leadTime || 0} ngày
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-xs font-semibold mb-1">
                      Mô tả
                    </span>
                    <p className="text-sm text-gray-700 bg-[var(--bg-main)] p-3 rounded-lg leading-relaxed">
                      {detailItem.description || "Chưa có mô tả."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= FORM VIEW (Original) ================= */
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column: Image & Barcode */}
                <div className="col-span-1 space-y-4">
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-[var(--bg-main)] hover:bg-[var(--brand-primary)]/5 hover:border-[var(--brand-primary)] transition cursor-pointer relative overflow-hidden group">
                    {editItem?.img ? (
                      <>
                        <img
                          src={editItem.img}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-semibold flex items-center gap-2">
                            <Pencil size={14} /> Đổi ảnh
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon
                          size={40}
                          className="text-[var(--text-placeholder)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors"
                        />
                        <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)] transition-colors">
                          Tải ảnh lên (Max 5MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Form */}
                <div className="col-span-2 space-y-6">
                  {/* Section 1: Thông tin cơ bản */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-placeholder)] flex items-center gap-2">
                      <Info size={14} /> Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Mã sản phẩm <span className="text-[var(--status-error)]">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                          placeholder="VD: BBG-HS-1.8x0.9x0.75-Huong"
                          defaultValue={editItem?.code || ""}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Tên sản phẩm <span className="text-[var(--status-error)]">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                          placeholder="Nhập tên sản phẩm"
                          defaultValue={editItem?.name || ""}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Danh mục sản phẩm{" "}
                          <span className="text-[var(--status-error)]">*</span>
                        </label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white"
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                        >
                          <option value="">Chọn danh mục sản phẩm</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Đơn vị
                        </label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white"
                          defaultValue={editItem?.unit || ""}
                        >
                          <option value="">Chọn đơn vị</option>
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Mô tả chi tiết
                      </label>
                      <textarea
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none min-h-[80px]"
                        placeholder="Nhập mô tả sản phẩm..."
                        defaultValue={editItem?.description || ""}
                      ></textarea>
                    </div>
                  </div>

                  {/* Section 2: Thuộc tính hàng mộc */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Chất liệu
                        </label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
                          value={woodType}
                          onChange={(e) => setWoodType(e.target.value)}
                        >
                          <option value="">Chọn chất liệu</option>
                          {WOOD_TYPES.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Màu sắc
                        </label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                        >
                          <option value="">Chọn màu</option>
                          {COLORS.map((c) => (
                            <option
                              key={c}
                              value={c}
                              selected={editItem?.color === c}
                            >
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Kích thước (D×R×C) (cm)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none text-center"
                            placeholder="Dài"
                            value={dimL}
                            onChange={(e) => setDimL(e.target.value)}
                          />
                          <span className="text-[var(--text-placeholder)] text-xs font-bold">
                            ×
                          </span>
                          <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none text-center"
                            placeholder="Rộng"
                            value={dimW}
                            onChange={(e) => setDimW(e.target.value)}
                          />
                          <span className="text-[var(--text-placeholder)] text-xs font-bold">
                            ×
                          </span>
                          <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none text-center"
                            placeholder="Cao"
                            value={dimH}
                            onChange={(e) => setDimH(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Cấu trúc Chi phí */}
                    <div className="space-y-4 bg-[var(--bg-main)] p-5 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)]">
                          Cấu trúc Chi phí
                        </h3>
                        <select
                          className="border rounded-lg px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)] outline-none bg-white"
                          value={productType}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setProductType(newType);
                            if (newType === "Hàng sẵn") {
                              setLaborCost(0);
                              setMaterialCost(0);
                            }
                          }}
                        >
                          <option value="Hàng sẵn">Hàng sẵn</option>
                          <option value="Hàng mộc">Hàng mộc</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">
                            Giá vốn mộc (đ)
                          </label>
                          <input
                            type="text"
                            className="w-full border rounded-xl px-4 py-2.5 text-lg font-bold outline-none bg-white text-[var(--text-main)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                            value={formatNumberInput(costPrice)}
                            onChange={(e) => {
                              const val = parseNumberInput(e.target.value);
                              setCostPrice(val === "" ? 0 : Number(val));
                            }}
                          />
                        </div>
                      </div>

                      {productType === "Hàng mộc" ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase block">
                              Công hoàn thiện (đ)
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-[var(--brand-primary)] bg-white"
                              value={formatNumberInput(laborCost)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setLaborCost(val === "" ? 0 : Number(val));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase block">
                              Vật tư khác (đ)
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-[var(--brand-primary)] bg-white"
                              value={formatNumberInput(materialCost)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setMaterialCost(val === "" ? 0 : Number(val));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-purple-600 uppercase block">
                              Tiền công Thợ Sơn (đ)
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-purple-700 outline-none focus:ring-1 focus:ring-purple-500 bg-purple-50/30"
                              value={formatNumberInput(paintCost)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setPaintCost(val === "" ? 0 : Number(val));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-blue-400 uppercase block">
                              Vận hành (đ)
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-[var(--brand-primary)] outline-none focus:ring-1 focus:ring-[var(--brand-primary)] bg-white"
                              value={formatNumberInput(setupCost)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setSetupCost(val === "" ? 0 : Number(val));
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase">
                              Vận hành & Giao hàng (đ)
                            </label>
                            <input
                              type="text"
                              className="w-32 border-none p-0 text-lg font-bold text-[var(--brand-primary)] outline-none bg-transparent"
                              value={formatNumberInput(setupCost)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setSetupCost(val === "" ? 0 : Number(val));
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--text-placeholder)] italic">
                            Mặt hàng sẵn không tốn phí gia công
                          </span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--text-placeholder)] uppercase">
                          Tổng giá thành thực tế
                        </span>
                        <span className="text-xl font-black text-[var(--text-main)]">
                          {fmtCurrency(
                            costPrice + laborCost + materialCost + paintCost + setupCost,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Section 4: Thiết lập Giá bán */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)]">
                        Thiết lập Mục tiêu & Thuế
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                            Biên lợi nhuận gộp mong muốn (%)
                          </label>
                          <input
                            type="number"
                            className="w-full border rounded-xl px-4 py-2.5 text-[15px] font-bold outline-none text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 focus:ring-1 focus:ring-[var(--status-success)] transition-all border-[var(--status-success)]/20"
                            value={targetMargin}
                            onChange={(e) => setTargetMargin(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                            Thuế (VAT / Thu nhập) (%)
                          </label>
                          <input
                            type="number"
                            className="w-full border rounded-xl px-4 py-2.5 text-[15px] font-bold outline-none text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 focus:ring-1 focus:ring-[var(--brand-primary)] transition-all border-[var(--brand-primary)]/20"
                            value={taxPercent}
                            onChange={(e) => setTaxPercent(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 bg-[var(--bg-main)] p-5 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                          Giá bán Chính thức
                        </h3>
                      </div>

                      {productType === "Hàng mộc" ? (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                              Giá bán MỘC (đ)
                            </label>
                            <div className="flex flex-col gap-1.5 mb-3 bg-white p-2.5 rounded-xl border border-[var(--palette-orange)]/20 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                                  1. Giá sau lãi (gốc + {targetMargin}%):
                                </span>
                                <span className="text-[11.5px] font-bold text-gray-700">
                                  {fmtCurrency(
                                    Math.round(
                                      (costPrice + setupCost) *
                                      (1 + targetMargin / 100),
                                    ),
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-[var(--brand-primary)] font-medium">
                                  2. Giá gợi ý (đã cộng VAT {taxPercent}%):
                                </span>
                                <button
                                  onClick={() => {
                                    const cost = costPrice + setupCost;
                                    const suggested = Math.round(
                                      cost *
                                      (1 + targetMargin / 100) *
                                      (1 + taxPercent / 100),
                                    );
                                    setRawRetailPrice(suggested);
                                  }}
                                  className="text-[11.5px] font-black text-[var(--palette-orange)] bg-[var(--palette-orange)]/10 px-2.5 py-1 rounded-md cursor-pointer hover:opacity-90 transition shadow-sm active:scale-95"
                                  title="Click để tự động nhập vào ô bên dưới"
                                >
                                  {fmtCurrency(
                                    Math.round(
                                      (costPrice + setupCost) *
                                      (1 + targetMargin / 100) *
                                      (1 + taxPercent / 100),
                                    ),
                                  )}
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-3 text-xl font-black text-[var(--palette-orange)] outline-none focus:ring-2 focus:ring-[var(--palette-orange)]"
                              value={formatNumberInput(rawRetailPrice)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setRawRetailPrice(val === "" ? 0 : Number(val));
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                              Giá bán THÀNH PHẨM (đ)
                            </label>
                            <div className="flex flex-col gap-1.5 mb-3 bg-white p-2.5 rounded-lg border border-[var(--status-success)]/20 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                                  1. Giá sau lãi (gốc + {targetMargin}%):
                                </span>
                                <span className="text-[11.5px] font-bold text-gray-700">
                                  {fmtCurrency(
                                    Math.round(
                                      (costPrice +
                                        laborCost +
                                        materialCost +
                                        paintCost +
                                        setupCost) *
                                      (1 + targetMargin / 100),
                                    ),
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-[var(--brand-primary)] font-medium">
                                  2. Giá gợi ý (đã cộng VAT {taxPercent}%):
                                </span>
                                <button
                                  onClick={() => {
                                    const cost =
                                      costPrice +
                                      laborCost +
                                      materialCost +
                                      paintCost +
                                      setupCost;
                                    const suggested = Math.round(
                                      cost *
                                      (1 + targetMargin / 100) *
                                      (1 + taxPercent / 100),
                                    );
                                    setFinishedRetailPrice(suggested);
                                  }}
                                  className="text-[11.5px] font-black text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-1 rounded-md cursor-pointer hover:opacity-90 transition shadow-sm active:scale-95"
                                  title="Click để tự động nhập vào ô bên dưới"
                                >
                                  {fmtCurrency(
                                    Math.round(
                                      (costPrice +
                                        laborCost +
                                        materialCost +
                                        paintCost +
                                        setupCost) *
                                      (1 + targetMargin / 100) *
                                      (1 + taxPercent / 100),
                                    ),
                                  )}
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              className="w-full border rounded-xl px-4 py-3 text-xl font-black text-[var(--status-success)] outline-none focus:ring-2 focus:ring-[var(--status-success)]"
                              value={formatNumberInput(finishedRetailPrice)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setFinishedRetailPrice(
                                  val === "" ? 0 : Number(val),
                                );
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                              Giá bán lẻ niêm yết (đ)
                            </label>
                          </div>

                          <div className="flex flex-col gap-1.5 mb-1 bg-[var(--brand-primary)]/5 p-2.5 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                                1. Giá sau lãi (gốc + {targetMargin}%):
                              </span>
                              <span className="text-[11.5px] font-bold text-gray-700">
                                {fmtCurrency(
                                  Math.round(
                                    (costPrice + setupCost) *
                                    (1 + targetMargin / 100),
                                  ),
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[var(--brand-primary)] font-medium">
                                2. Giá gợi ý (đã cộng VAT {taxPercent}%):
                              </span>
                              <button
                                onClick={() => {
                                  const cost = costPrice + setupCost;
                                  const suggested = Math.round(
                                    cost *
                                    (1 + targetMargin / 100) *
                                    (1 + taxPercent / 100),
                                  );
                                  setRetailPrice(suggested);
                                }}
                                className="text-[11.5px] font-black text-[var(--brand-primary)] bg-blue-100 px-2.5 py-1 rounded-md cursor-pointer hover:bg-blue-200 hover:text-blue-800 transition shadow-sm active:scale-95"
                                title="Click để tự động nhập vào ô bên dưới"
                              >
                                {fmtCurrency(
                                  Math.round(
                                    (costPrice + setupCost) *
                                    (1 + targetMargin / 100) *
                                    (1 + taxPercent / 100),
                                  ),
                                )}
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-3xl font-black text-[var(--brand-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-blue-100 shadow-sm"
                            value={formatNumberInput(retailPrice)}
                            onChange={(e) => {
                              const val = parseNumberInput(e.target.value);
                              setRetailPrice(val === "" ? 0 : Number(val));
                            }}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {/* THỜI GIAN HOÀN THIỆN (LEAD TIME) */}
                        <div className="flex items-center justify-between p-3 border rounded-xl bg-[var(--status-pending)]/10 border-[var(--status-pending)]/20 shadow-sm shadow-sm">
                          <span className="text-[10px] font-bold text-[var(--status-pending)] uppercase">
                            Hoàn thiện
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-10 border-none p-0 text-center font-bold text-[var(--status-pending)] outline-none bg-transparent"
                              value={leadTime}
                              onChange={(e) => setLeadTime(e.target.value)}
                            />
                            <span className="text-[10px] font-bold text-[var(--status-pending)]/60">
                              ngày
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm">
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                            Tồn kho
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-10 border-none p-0 text-center font-bold text-[var(--text-secondary)] outline-none disabled:bg-transparent"
                              defaultValue={editItem ? editItem.stock : 0}
                              disabled={
                                editItem?.productType === "Hàng khách đặt"
                              }
                            />
                            <span className="text-[10px] font-bold text-[var(--text-placeholder)]">
                              sp
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Bảo hành & Chính sách */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)] flex items-center gap-2">
                        <ShieldCheck size={14} /> Bảo hành & Chính sách
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                            Bảo hành(tháng)
                          </label>
                          <input
                            type="number"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                            placeholder="Số tháng"
                            value={warrantyMonths}
                            onChange={(e) => setWarrantyMonths(e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                            Nội dung bảo hành
                          </label>
                          <textarea
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none min-h-[60px]"
                            placeholder="Mô tả các điều kiện bảo hành, bảo trì..."
                            value={warrantyContent}
                            onChange={(e) => setWarrantyContent(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-[var(--grid-border)] flex items-center justify-between bg-white shrink-0">
            <button
              onClick={(e) => handleConfirmDelete(detailItem, e)}
              className="px-4 py-2 rounded-lg text-[13px] font-bold transition-all border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 flex items-center gap-2"
            >
              <Trash2 size={16} /> Xóa sản phẩm
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition cursor-pointer border border-transparent hover:border-[var(--grid-border)]"
              >
                Đóng
              </button>
              {!editing && (
                <button
                  onClick={() => setModal((prev) => ({ ...prev, view: "form" }))}
                  className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[var(--brand-primary)] hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
                >
                  <Pencil size={16} /> Sửa / Định giá
                </button>
              )}
              {editing && (
                <button
                  onClick={handleSaveAddEdit}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform active:scale-95 ${editItem?.status === "Chưa định giá" ? "bg-[var(--status-error)] hover:opacity-90" : "bg-[var(--brand-primary)] hover:opacity-90"}`}
                >
                  <Banknote size={16} />
                  {editItem?.status === "Chưa định giá"
                    ? "Xác nhận định giá & Mở bán"
                    : "Lưu thay đổi"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
              className={`w-12 h-12 rounded-lg object-cover border bg-white shadow-sm transition-all ${item.status === "Chưa định giá" ? "ring-2 ring-[var(--status-error)] ring-offset-1" : ""}`}
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
      header: "Mã Sản Ph",
      render: (item) => (
        <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 leading-none shadow-sm">
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
      header: "Hoàn thiện",
      render: (item) => (
        <div className="flex items-center gap-1 font-bold text-[var(--status-pending)] bg-[var(--status-pending)]/10 px-2 py-0.5 rounded-md border border-[var(--status-pending)]/20 w-fit">
          <Clock size={12} className="text-[var(--status-pending)]" />
          {item.leadTime || 0} n
        </div>
      ),
    },
    {
      header: "Giá bán",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => {
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

      {renderProductModal()}

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* HEADER & TABS (Top Right Style) */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý sản phẩm
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {filteredProducts.length} sản phẩm ({productTypeFilter === "Tất cả" ? "tất cả loại" : productTypeFilter.toLowerCase()})
            </p>
          </div>

          <div className="flex p-1 rounded-lg" style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}>
            {["Tất cả", "Hàng sẵn", "Hàng mộc", "Hàng khách đặt"].map((type) => (
              <button
                key={type}
                onClick={() => setProductTypeFilter(type)}
                className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: productTypeFilter === type ? "#fff" : "transparent",
                  color: productTypeFilter === type ? "var(--text-main)" : "var(--text-secondary)"
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS BAR (Admin Alerts Style) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap py-1">
          {[
            { id: "Tất cả", label: "Tất cả" },
            { id: "Chưa định giá", label: "Chưa định giá", color: "red", icon: AlertCircle },
            { id: "Hết hàng", label: "Hết hàng", color: "red", icon: AlertCircle },
            { id: "Quà tặng", label: "Quà tặng", color: "purple" }
          ].map((s) => {
            const isActive = statusFilter === s.id;
            const isRedForce = s.color === "red";
            const sc = s.id !== "Tất cả" ? (isRedForce ? { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" } : (s.color === "purple" ? { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" } : { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" })) : null;

            return (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent",
                  color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)",
                  borderColor: isActive ? (sc ? sc.border : "var(--grid-border)") : "transparent"
                }}
              >
                {s.icon && <s.icon size={14} className={isActive ? (isRedForce ? "text-red-500" : "text-[var(--brand-primary)]") : "text-slate-300"} />}
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
          onRowClick={(item) => handleOpenModal("detail", item)}
          rowStyle={(item) => ({
            backgroundColor:
              item.status === "Chưa định giá"
                ? "rgba(229, 72, 77, 0.03)"
                : "transparent",
          })}
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
          searchPlaceholder="Theo Mã sản phẩm, tên sản phẩm..."
          hasActiveFilters={!!hasActiveFilters}
          clearAllFilters={clearFilters}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          rowActions={[
            {
              icon: Eye,
              label: "Xem chi tiết",
              onClick: (item) => handleOpenModal("detail", item),
            },
            {
              icon: Pencil,
              label: "Chỉnh sửa",
              onClick: (item) => handleOpenModal("form", item),
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
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
