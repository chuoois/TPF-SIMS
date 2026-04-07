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
  Archive,
  Tag,
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
      }
    ]
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
    price: 120000000,
    unit: "Bộ",
    productType: "Hàng khách đặt",
    status: "Hàng khách đặt",
    stock: 0,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=300",
    leadTime: 30,
    description: "Hàng khách đặt theo kích thước riêng, tay 12 vách 4 phân.",
    lots: [
      {
        lotId: "LOT-SP002-1",
        importDate: "2026-02-15",
        importPrice: 95000000,
        initialQuantity: 1,
      }
    ]
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
    lots: [
      {
        lotId: "LOT-THO-1",
        importDate: "2026-02-10",
        importPrice: 8500000,
        initialQuantity: 3,
      }
    ]
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
    lots: [
      {
        lotId: "LOT-001",
        importDate: "2026-03-15",
        importPrice: 40000000,
        initialQuantity: 2,
      },
      {
        lotId: "LOT-002",
        importDate: "2026-04-05",
        importPrice: 42000000,
        initialQuantity: 1,
      }
    ]
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
    lots: [
      {
        lotId: "LOT-003",
        importDate: "2026-04-01",
        importPrice: 24000000,
        initialQuantity: 2,
      }
    ]
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
    lots: [
      {
        lotId: "LOT-HM01-1",
        importDate: "2025-11-05",
        importPrice: 26000000,
        initialQuantity: 1,
      },
      {
        lotId: "LOT-HM01-2",
        importDate: "2026-03-01",
        importPrice: 28000000,
        initialQuantity: 1,
      }
    ]
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
    
    // Auto-sync missing data structure (like lots) from initial data
    let needsUpdate = false;
    const merged = parsed.map(p => {
      // ── LOGIC MODERNIZATION: Hàng khách đặt không cần định giá ──
      if (p.productType === "Hàng khách đặt") {
        if (!p.isPriced || p.status === "Chưa định giá") {
          p.isPriced = true;
          p.status = "Hàng khách đặt";
          needsUpdate = true;
        }
      }

      if (!p.lots) {
        const defaultProduct = INITIAL_PRODUCTS.find(dp => dp.id === p.id);
        if (defaultProduct && defaultProduct.lots) {
          needsUpdate = true;
          return { ...p, lots: defaultProduct.lots };
        }
      }
      return p;
    });

    // Auto-fix any old 'Ngừng kinh doanh' status to 'Hết hàng'
    merged.forEach((p) => {
      if (p.status === "Ngừng kinh doanh") {
        p.status = "Hết hàng";
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      localStorage.setItem("tpf_simulated_products", JSON.stringify(merged));
    }
    
    return merged;
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

  const [modal, setModal] = useState({ isOpen: false, view: null, data: null }); // view: 'detail' | 'form' | 'pricing'

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
  const [productStatus, setProductStatus] = useState("");
  const [leadTime, setLeadTime] = useState(0);
  const [techNotes, setTechNotes] = useState({ leg: "", apron: "", other: "" });

  // — Labor Calculation (New: Based on Daily Wage) —
  const [dailyWage, setDailyWage] = useState(350000);
  const [laborDays, setLaborDays] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Auto-suggest warranty based on woodType
  useEffect(() => {
    if (!woodType || modal.view !== "form") return;
    
    try {
      const savedSettingsStr = localStorage.getItem("tpf_warranty_settings");
      if (savedSettingsStr) {
        const settings = JSON.parse(savedSettingsStr);
        const mat = woodType.toLowerCase();
        
        const matchedRule = settings.materialRules.find(r => 
          mat.includes(r.material.toLowerCase())
        );
        
        if (matchedRule) {
          setWarrantyMonths(matchedRule.months);
          // Only update content if it's empty or default
          if (!warrantyContent || warrantyContent === "Bảo hành các lỗi kỹ thuật.") {
            setWarrantyContent(settings.defaultTerms);
          }
        } else {
           // Default if no wood match -> use finish warranty
           setWarrantyMonths(settings.finishWarrantyMonths || 6);
        }
      }
    } catch (e) {
      console.error("Error loading warranty settings:", e);
    }
  }, [woodType, modal.view]);

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
    if (item.stock > 0 || (item.lots && item.lots.length > 0)) {
      toast.error("Không thể xoá! Sản phẩm đang có tồn kho hoặc đã có lịch sử nhập lô.");
      return;
    }
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleOpenModal = (view, product = null, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (view === "form" || view === "pricing") {
      if (product) {
        // Lấy giá vốn theo lô nhập MỚI NHẤT
        let latestCost = product.costPrice || product.importPrice || 0;
        if (product.lots && product.lots.length > 0) {
          const sorted = [...product.lots].sort((a, b) =>
            new Date(b.importDate) - new Date(a.importDate)
          );
          latestCost = sorted[0].importPrice || latestCost;
        }
        setCostPrice(latestCost);
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
        setWoodType(product.material || product.materialType || ""); // Fix: mapping from accountant materialType
        setColor(product.color || "");
        const dims = (product.dimensions || "")
          .split(/[xX*×]/)
          .map((d) => d.trim());
        setDimL(dims[0] || "");
        setDimW(dims[1] || "");
        setDimH(dims[2] || "");
        setProductStatus(product.status || "");
        setLeadTime(product.leadTime || 0);
        setTechNotes(product.techNotes || { leg: "", apron: "", other: "" });

        // Initialize Labor Calculation
        setDailyWage(product.dailyWage || 350000);
        setLaborDays(product.laborDays || 0);
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
      if (productType === "Hàng sẵn" && Number(retailPrice) < Number(costPrice)) {
        toast.error("Cảnh báo: Giá bán đang thấp hơn giá vốn nhập gần nhất!");
        return;
      }
      if (productType === "Hàng mộc") {
        if (Number(rawRetailPrice) < Number(costPrice)) {
          toast.error("Cảnh báo: Giá bán mộc đang thấp hơn giá vốn nhập gần nhất!");
          return;
        }
        const totalCosts = Number(costPrice) + Number(laborCost) + Number(materialCost) + Number(paintCost) + Number(setupCost);
        if (Number(finishedRetailPrice) < totalCosts) {
          toast.error("Cảnh báo: Giá bán hoàn thiện đang thấp hơn tổng chi phí (Vốn + Mộc + Vật tư + Sơn + Vận hành)!");
          return;
        }
      }

      // Logic for editing existing product
      let newStatus = productStatus || editItem.status;
      let isPriced = editItem.isPriced;

      let rPrice = Number(retailPrice);
      let rrPrice = Number(rawRetailPrice);
      let frPrice = Number(finishedRetailPrice);

      if (newStatus === "Quà tặng") {
         rPrice = 0;
         rrPrice = 0;
         frPrice = 0;
         isPriced = true;
      } else if (productType === "Hàng khách đặt") {
        isPriced = true; 
        newStatus = "Hàng khách đặt";
      } else if (newStatus === "Chưa định giá") {
        isPriced = true;
      }

      if (editItem.stock === 0 && newStatus !== "Quà tặng" && productType !== "Hàng khách đặt") {
        newStatus = "Hết hàng";
      } else if (newStatus === "Chưa định giá" || newStatus === "Hết hàng" || newStatus === "Hàng khách đặt") {
        newStatus = productType === "Hàng sẵn" ? "Hàng sẵn" : (productType === "Hàng mộc" ? "Hàng mộc" : "Hàng khách đặt");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editItem.id
            ? {
              ...p,
              costPrice: Number(costPrice),
              retailPrice: rPrice,
              rawRetailPrice: rrPrice,
              finishedRetailPrice: frPrice,
              price: rPrice || rrPrice || 0, 
              status: newStatus,
              isPriced: true,
              laborCost: Number(laborCost),
              materialCost: Number(materialCost),
              paintCost: Number(paintCost),
              setupCost: Number(setupCost),
              dailyWage: Number(dailyWage),
              laborDays: Number(laborDays),
              productType,
              category: productCategory,
              warrantyMonths: Number(warrantyMonths),
              warrantyContent,
              targetMargin: Number(targetMargin),
              taxPercent: Number(taxPercent),
              woodType,
              material: woodType,
              color,
              dimensions: [dimL, dimW, dimH].filter(Boolean).join(" × "),
              leadTime: Number(leadTime),
              techNotes: { ...techNotes },
            }
            : p,
        ),
      );
      toast.success("Đã cập nhật thông tin sản phẩm và định giá thành công!");
    }
    closeModal();
  };

  // ===================== UNIFIED MODAL (DETAIL & EDIT & PRICING) =====================
  const renderProductModal = () => {
    if (!modal.isOpen || !modal.view) return null;
    const editing = modal.view === "form";
    const pricing = modal.view === "pricing";
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
              {pricing ? (
                editItem?.status === "Chưa định giá" ? (
                  <span className="flex items-center gap-2 text-[var(--status-error)]">
                    <Banknote size={20} /> Định giá sản phẩm mới
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-emerald-700">
                    <Tag size={18} /> Định giá sản phẩm
                  </span>
                )
              ) : editing ? (
                "Sửa thông tin sản phẩm"
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
            {!editing && !pricing ? (
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

                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col gap-4">
                    {detailItem.status === "Quà tặng" ? (
                      <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                         <div>
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">Trạng thái định giá</span>
                          <span className="text-2xl font-black text-purple-700">MIỄN PHÍ</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="px-3 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black shadow-sm mb-1">HÀNG QUÀ TẶNG</div>
                           <span className="text-[10px] text-purple-400 font-bold italic text-right leading-tight">Giá bán mặc định = 0đ<br/>Chỉ theo dõi giá vốn</span>
                        </div>
                      </div>
                    ) : detailItem.productType === "Hàng khách đặt" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Giá nhập hàng</span>
                           <span className="text-xl font-black text-emerald-700">{fmtCurrency(detailItem.costPrice)}</span>
                        </div>
                        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">Giá bán đã chốt</span>
                          <span className="text-xl font-black text-amber-700">{fmtCurrency(detailItem.retailPrice)}</span>
                        </div>
                      </div>
                    ) : detailItem.productType === "Hàng mộc" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[var(--text-secondary)] block text-[10px] font-bold uppercase mb-1">
                            Giá bán mộc
                          </span>
                          <span className="text-lg font-black text-[var(--palette-orange)]">
                            {fmtCurrency(detailItem.rawRetailPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)] block text-[10px] font-bold uppercase mb-1">
                            Giá bán hoàn thiện
                          </span>
                          <span className="text-lg font-black text-emerald-600">
                            {fmtCurrency(detailItem.finishedRetailPrice)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[10px] font-bold uppercase mb-1">
                          Giá bán niêm yết
                        </span>
                        <span
                          className={`text-2xl font-black ${detailItem.status === "Chưa định giá" ? "text-[var(--status-error)] animate-pulse" : "text-[var(--brand-primary)]"}`}
                        >
                          {detailItem.status === "Chưa định giá"
                            ? "CHỜ ĐỊNH GIÁ"
                            : fmtCurrency(detailItem.retailPrice)}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-slate-200/50 mt-2 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)] text-xs font-medium">
                          Tồn kho thực tế tại cửa hàng
                        </span>
                        <span className="text-lg font-black text-[var(--text-main)]">
                          {detailItem.status === "Hàng khách đặt"
                            ? "—"
                            : `${detailItem.stock} ${detailItem.unit || "SP"}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-slate-200/60 shadow-sm">
                        <span className="text-slate-500 text-[11px] font-black flex items-center gap-1.5 uppercase tracking-wide italic">
                          <Banknote size={14} className="text-emerald-500" /> Tổng giá thành (Gốc + Gia công + Vận hành)
                        </span>
                        <span className="text-[14px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                          {fmtCurrency(Number(detailItem.costPrice || 0) + Number(detailItem.laborCost || 0) + Number(detailItem.materialCost || 0) + Number(detailItem.paintCost || 0) + Number(detailItem.setupCost || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-slate-200/60 shadow-sm">
                        <span className="text-[var(--status-pending)] text-[11px] font-black flex items-center gap-1.5 uppercase tracking-wide">
                          <Clock size={14} /> Thời gian hoàn thiện
                        </span>
                        <span className="text-[14px] font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
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
            ) : editing ? (
              /* ================= EDIT FORM VIEW (Info only) ================= */
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1 md:col-span-2">
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
                        <label className="block text-xs font-bold text-emerald-600 mb-1">
                          Tồn kho thực tế
                        </label>
                        <div className="w-full bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm font-black text-emerald-700 flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                            <span className="text-lg leading-none">{editItem?.stock !== undefined ? editItem.stock : 0}</span>
                            <span className="text-xs font-medium bg-emerald-200/50 px-2 py-0.5 rounded text-emerald-800">{editItem?.unit || "SP"}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Mã Sản Phẩm <span className="text-[var(--status-error)]">*</span>
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
                          Danh mục sản phẩm <span className="text-[var(--status-error)]">*</span>
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
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Trạng thái hiển thị
                        </label>
                        <select
                          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition-all font-bold ${
                            productStatus === "Quà tặng"
                              ? "bg-purple-50 border-purple-200 text-purple-700 focus:ring-purple-500/20"
                              : "bg-white border-gray-200 focus:ring-indigo-500/20"
                          }`}
                          value={productStatus}
                          onChange={(e) => setProductStatus(e.target.value)}
                        >
                          {PRODUCT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
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

                  {/* Section 2: Thuộc tính sản phẩm (Kế toán khai báo) */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          Chất liệu 
                        </label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-slate-50 text-slate-700 cursor-not-allowed appearance-none"
                          value={woodType}
                          disabled
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
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-slate-50 text-slate-700 cursor-not-allowed appearance-none"
                          value={color}
                          disabled
                        >
                          <option value="">Chọn màu</option>
                          {COLORS.map((c) => (
                            <option
                              key={c}
                              value={c}
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
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none text-center bg-slate-50 text-slate-700 cursor-not-allowed"
                            placeholder="Dài"
                            value={dimL}
                            readOnly
                          />
                          <span className="text-[var(--text-placeholder)] text-xs font-bold">
                            ×
                          </span>
                          <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none text-center bg-slate-50 text-slate-700 cursor-not-allowed"
                            placeholder="Rộng"
                            value={dimW}
                            readOnly
                          />
                          <span className="text-[var(--text-placeholder)] text-xs font-bold">
                            ×
                          </span>
                          <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none text-center bg-slate-50 text-slate-700 cursor-not-allowed"
                            placeholder="Cao"
                            value={dimH}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: THÔNG TIN GIÁ (Dành cho Hàng khách đặt) */}
                  {productType === "Hàng khách đặt" && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-6 bg-amber-50/20 p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                           <div className="space-y-2">
                              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest">Giá vốn nhập (VNĐ)</label>
                              <input
                                 type="text"
                                 className="w-full border-2 border-emerald-100 rounded-xl px-4 py-3 text-xl font-black text-emerald-700 outline-none focus:border-emerald-500 shadow-sm bg-white"
                                 value={formatNumberInput(costPrice)}
                                 onChange={(e) => {
                                   const val = parseNumberInput(e.target.value);
                                   setCostPrice(val === "" ? 0 : Number(val));
                                 }}
                                 placeholder="Nhập giá nhập..."
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest">Giá bán khách (VNĐ)</label>
                              <input
                                 type="text"
                                 className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-xl font-black text-amber-700 outline-none focus:border-amber-500 shadow-sm bg-white"
                                 value={formatNumberInput(retailPrice)}
                                 onChange={(e) => {
                                   const val = parseNumberInput(e.target.value);
                                   setRetailPrice(val === "" ? 0 : Number(val));
                                 }}
                                 placeholder="Nhập giá bán..."
                              />
                           </div>
                           <div className="absolute top-2 right-4 text-[10px] font-bold text-amber-400/50 uppercase tracking-tighter italic">Dữ liệu hàng đặt</div>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            ) : pricing ? (
              /* ================= PRICING FORM VIEW ================= */
              <div className="space-y-6">
                {/* Product summary header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {editItem?.img ? (
                    <img src={editItem.img} alt={editItem.name} className="w-14 h-14 rounded-lg object-cover border shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gray-100 border text-gray-300"><ImageIcon size={20} /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[var(--text-main)] truncate">{editItem?.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">{editItem?.code}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Loại hàng</span>
                    <span className="text-xs font-bold text-[var(--text-main)]">{editItem?.productType}</span>
                  </div>
                </div>

                {/* Section: Cấu trúc Chi phí */}
                <div className="space-y-5 bg-gradient-to-b from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  {/* Tiêu đề & Chọn Phân loại */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 relative z-10">
                    <h3 className={`text-sm font-black flex items-center gap-2 uppercase tracking-wide ${productStatus === 'Quà tặng' ? 'text-purple-700' : 'text-slate-800'}`}>
                      <Banknote size={16} className={productStatus === 'Quà tặng' ? 'text-purple-600' : 'text-emerald-600'} /> 
                      {productStatus === 'Quà tặng' ? "Giá trị đầu tư quà tặng" : "Cấu trúc Chi phí"}
                    </h3>
                    <div className="flex items-center gap-2 bg-white px-1 py-1 rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Phân loại</span>
                      <select
                        className="border-none rounded-md px-2 py-1 text-xs font-bold text-slate-800 outline-none bg-slate-100 cursor-not-allowed appearance-none"
                        value={productType}
                        disabled
                      >
                        <option value="Hàng sẵn">Hàng sẵn</option>
                        <option value="Hàng mộc">Hàng mộc</option>
                      </select>
                    </div>
                  </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                        {/* Box Giá Vốn Mộc */}
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm relative group overflow-hidden transition-all hover:shadow-md">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                          <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center flex-wrap gap-1">
                            Giá nhập <span className="text-[10px] font-medium normal-case text-emerald-700 italic bg-emerald-50 px-2 py-0.5 rounded-full ml-1">tự động từ lô mới nhất</span>
                          </label>
                          <div className="flex items-baseline gap-1">
                            <input
                              type="text"
                              className="w-full bg-slate-50 text-emerald-800 border-none rounded px-3 py-2 text-2xl font-black outline-none cursor-not-allowed shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
                              value={formatNumberInput(costPrice)}
                              readOnly
                            />
                            <span className="text-slate-400 font-bold">VNĐ</span>
                          </div>
                        </div>
                        
                        {/* Box Lịch Sử Nhập Lô */}
                        {editItem?.lots && editItem.lots.length > 0 ? (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col h-full">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                               <div className="flex items-center gap-1">
                                 <Clock size={12} className="text-slate-400"/> Lịch sử nhập lô
                               </div>
                               <span className="bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded text-[9px]">Tổng: {editItem.lots.length} lô</span>
                            </label>
                            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[70px] max-h-[160px] pr-1">
                                <table className="w-full text-left text-xs">
                                  <thead className="sticky top-0 bg-white/95 backdrop-blur-sm text-[10px] text-slate-400 uppercase z-10 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                                    <tr>
                                      <th className="font-semibold p-1.5 pb-2">Ngày nhập</th>
                                      <th className="font-semibold p-1.5 pb-2 text-center" title="Số lượng còn lại / Số lượng nhập ban đầu">Tồn / Nhập</th>
                                      <th className="font-semibold p-1.5 pb-2 text-right">Giá lô (đ)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {(() => {
                                      let remainingStock = editItem?.stock || 0;
                                      const sortedLots = [...editItem.lots].sort((a, b) => new Date(b.importDate) - new Date(a.importDate));
                                       
                                      const lotsWithRemaining = sortedLots.map((lot) => {
                                        const qty = lot.initialQuantity || lot.units?.length || 0;
                                        const remaining = Math.min(remainingStock, qty);
                                        remainingStock = Math.max(0, remainingStock - remaining);
                                        return { ...lot, remaining, qty };
                                      });

                                      return lotsWithRemaining.map((lot, idx) => (
                                        <tr key={lot.lotId} className={`group transition-colors ${lot.remaining > 0 ? "hover:bg-emerald-50/50" : "hover:bg-slate-50 opacity-60 grayscale-[50%]"}`}>
                                          <td className="p-1.5 text-slate-600 font-medium">
                                               {new Date(lot.importDate).toLocaleDateString("vi-VN")}
                                               {lot.remaining === 0 && <span className="ml-1.5 text-[8px] uppercase font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">Hết</span>}
                                          </td>
                                          <td className="p-1.5 text-center">
                                              <div className="flex items-center justify-center gap-0.5">
                                                 <span className={`font-black ${lot.remaining > 0 ? "text-emerald-600" : "text-slate-400"}`}>{lot.remaining}</span>
                                                 <span className="text-slate-300 text-[10px] font-medium">/ {lot.qty}</span>
                                              </div>
                                          </td>
                                          <td className={`p-1.5 text-right font-bold ${lot.remaining > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                                             {idx === 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 -translate-y-0.5 shadow-sm" title="Lô nhập mới nhất"></span>}
                                             {fmtCurrency(lot.importPrice).replace('₫','')}
                                          </td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center h-full">
                              <Archive size={20} className="text-slate-300 mb-1" />
                              <span className="text-[10px] text-slate-400 font-medium">Chưa có lịch sử lô hàng cũ</span>
                          </div>
                        )}
                      </div>

                      {/* Section 3: Cấu trúc Chi phí thực tế (Chỉ cho hàng mộc hoặc để theo dõi) */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Cấu trúc Chi phí thực tế (đ)
                          </h3>
                          {productType === "Hàng sẵn" && (
                            <span className="text-[10px] font-medium text-slate-400 italic border border-slate-200 bg-white px-3 py-1 rounded-full shadow-sm">
                              Mặt hàng sẵn bỏ qua chi phí gia công mộc/sơn
                            </span>
                          )}
                        </div>

                        {/* Các Chi phí gia công (chỉ cho hàng mộc) */}
                        {productType === "Hàng mộc" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                            {/* Công cụ tính công thợ (theo số ngày x lương ngày) */}
                            <div className="col-span-2 space-y-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                               <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                                     <Clock size={12} className="text-blue-500" /> Phân bổ công thợ ráp (Trả lương ngày)
                                  </label>
                                  <div className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black">CĂN CỨ TÍNH</div>
                               </div>
                               <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Lương ngày chuẩn (đ)</label>
                                    <input
                                      type="text"
                                      className="w-full border-b border-slate-200 px-1 py-1 text-[13px] font-black text-slate-700 outline-none focus:border-blue-500 bg-transparent"
                                      value={formatNumberInput(dailyWage)}
                                      onChange={(e) => {
                                        const wage = parseNumberInput(e.target.value);
                                        setDailyWage(wage);
                                        setLaborCost(wage * laborDays);
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Số công hoàn thiện</label>
                                    <div className="flex items-center gap-1 border-b border-slate-200">
                                      <input
                                        type="number"
                                        step="0.1"
                                        className="w-full px-1 py-1 text-[13px] font-black text-slate-700 outline-none focus:border-blue-500 bg-transparent"
                                        value={laborDays}
                                        onChange={(e) => {
                                          const days = parseFloat(e.target.value) || 0;
                                          setLaborDays(days);
                                          setLaborCost(dailyWage * days);
                                        }}
                                      />
                                      <span className="text-[10px] font-bold text-slate-300">CÔNG</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100">
                                    <label className="text-[9px] font-black text-blue-600 uppercase block">Thành tiền (đ)</label>
                                    <p className="text-[14px] font-black text-blue-700 mt-0.5">{fmtCurrency(laborCost).replace('₫','')}</p>
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                               <div className="flex items-center justify-between">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase block">Tiền vật tư phụ</label>
                                 <button
                                   onClick={() => setMaterialCost(Math.round(Number(costPrice) * 0.05))}
                                   className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded hover:bg-emerald-100 transition-colors border border-emerald-100"
                                 >
                                   GỢI Ý (5%)
                                 </button>
                               </div>
                              <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 bg-white transition-all shadow-sm"
                                value={formatNumberInput(materialCost)}
                                onChange={(e) => {
                                  const val = parseNumberInput(e.target.value);
                                  setMaterialCost(val === "" ? 0 : Number(val));
                                }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-indigo-500 uppercase block">Tiền sơn PU</label>
                              <input
                                type="text"
                                className="text-indigo-700 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-indigo-50/30 transition-all shadow-sm"
                                value={formatNumberInput(paintCost)}
                                onChange={(e) => {
                                  const val = parseNumberInput(e.target.value);
                                  setPaintCost(val === "" ? 0 : Number(val));
                                }}
                              />
                            </div>
                            <div className="space-y-1.5">
                                                             <div className="flex items-center justify-between">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase block">Chi phí vận hành</label>
                                 <div className="flex gap-1">
                                   <button
                                     onClick={() => {
                                       const totalDirect = Number(costPrice) + Number(laborCost) + Number(materialCost) + Number(paintCost);
                                       setSetupCost(Math.round(totalDirect * 0.05));
                                     }}
                                     className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors border border-indigo-100"
                                     title="Mức đề xuất (do không mất tiền thuê nhà)"
                                   >
                                     5%
                                   </button>
                                   <button
                                     onClick={() => {
                                       const totalDirect = Number(costPrice) + Number(laborCost) + Number(materialCost) + Number(paintCost);
                                       setSetupCost(Math.round(totalDirect * 0.10));
                                     }}
                                     className="text-[9px] font-black text-indigo-500 bg-white px-2 py-0.5 rounded hover:bg-slate-50 transition-colors border border-slate-200"
                                   >
                                     10%
                                   </button>
                                 </div>
                               </div>

                              <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 bg-white transition-all shadow-sm"
                                value={formatNumberInput(setupCost)}
                                onChange={(e) => {
                                  const val = parseNumberInput(e.target.value);
                                  setSetupCost(val === "" ? 0 : Number(val));
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div className="space-y-1.5 flex-1">
                                                             <div className="flex items-center justify-between">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase block">Chi phí vận hành</label>
                                 <div className="flex gap-1">
                                   <button
                                     onClick={() => {
                                       const totalDirect = Number(costPrice) + Number(laborCost) + Number(materialCost) + Number(paintCost);
                                       setSetupCost(Math.round(totalDirect * 0.05));
                                     }}
                                     className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors border border-indigo-100"
                                     title="Mức đề xuất (do không mất tiền thuê nhà)"
                                   >
                                     5%
                                   </button>
                                   <button
                                     onClick={() => {
                                       const totalDirect = Number(costPrice) + Number(laborCost) + Number(materialCost) + Number(paintCost);
                                       setSetupCost(Math.round(totalDirect * 0.10));
                                     }}
                                     className="text-[9px] font-black text-indigo-500 bg-white px-2 py-0.5 rounded hover:bg-slate-50 transition-colors border border-slate-200"
                                   >
                                     10%
                                   </button>
                                 </div>
                               </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  className="w-1/3 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 bg-white transition-all shadow-sm"
                                  value={formatNumberInput(setupCost)}
                                  onChange={(e) => {
                                    const val = parseNumberInput(e.target.value);
                                    setSetupCost(val === "" ? 0 : Number(val));
                                  }}
                                />
                                <span className="text-[10px] text-slate-400 italic">Dùng để tính giá thành thực tế cho hàng sẵn</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tổng cộng */}
                        <div className="pt-4 flex items-center justify-between border-t border-slate-200/80">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                            Tổng Giá Thành Thực Tế
                          </span>
                          <div className="flex items-baseline gap-1 bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-md">
                            <span className="text-2xl font-black tracking-tight">
                              {formatNumberInput(costPrice + laborCost + materialCost + paintCost + setupCost)}
                            </span>
                            <span className="text-xs font-bold text-slate-400">VNĐ</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Thiết lập Giá bán */}
                      {(productStatus === "Quà tặng" || productStatus === "Hàng khách đặt" || productType === "Hàng khách đặt") ? (
                        <div className="space-y-4">
                          <div className={`p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center gap-3 ${
                            productStatus === "Quà tặng" 
                              ? "bg-purple-50 border-purple-200 text-purple-800" 
                              : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}>
                            {productStatus === "Quà tặng" ? <Gift size={32} className="text-purple-400" /> : <Package size={32} className="text-amber-400" />}
                            <div>
                              <p className="font-bold tracking-wide uppercase text-sm">
                                {productStatus === "Quà tặng" ? "HÀNG QUÀ TẶNG - MIỄN PHÍ GIÁ LẺ" : "HÀNG KHÁCH ĐẶT - GIÁ CHỐT CỐ ĐỊNH"}
                              </p>
                              <p className="opacity-70 text-[11px] mt-1 font-medium italic">
                                {productStatus === "Quà tặng" 
                                  ? "Hệ thống tự động gán giá bán lẻ về 0 để hạch toán quà tặng." 
                                  : "Giá bán đã được chốt theo đơn hàng. Bạn chỉ cần nhập chi phí thực tế ở trên để theo dõi lãi lỗ."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
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
                                        {fmtCurrency(Math.round(costPrice * (1 + targetMargin / 100)))}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[var(--brand-primary)] font-medium">
                                        2. Giá gợi ý (đã cộng VAT {taxPercent}%):
                                      </span>
                                      <button
                                        onClick={() => {
                                          const suggested = Math.round(costPrice * (1 + targetMargin / 100) * (1 + taxPercent / 100));
                                          setRawRetailPrice(suggested);
                                        }}
                                        className="text-[11.5px] font-black text-[var(--palette-orange)] bg-[var(--palette-orange)]/10 px-2.5 py-1 rounded-md cursor-pointer hover:opacity-90 transition shadow-sm active:scale-95"
                                      >
                                        {fmtCurrency(Math.round(costPrice * (1 + targetMargin / 100) * (1 + taxPercent / 100)))}
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
                                        {fmtCurrency(Math.round((costPrice + laborCost + materialCost + paintCost) * (1 + targetMargin / 100)))}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[var(--brand-primary)] font-medium">
                                        2. Giá gợi ý (đã cộng VAT {taxPercent}%):
                                      </span>
                                      <button
                                        onClick={() => {
                                          const cost = costPrice + laborCost + materialCost + paintCost;
                                          const suggested = Math.round(cost * (1 + targetMargin / 100) * (1 + taxPercent / 100));
                                          setFinishedRetailPrice(suggested);
                                        }}
                                        className="text-[11.5px] font-black text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-1 rounded-md cursor-pointer hover:opacity-90 transition shadow-sm active:scale-95"
                                      >
                                        {fmtCurrency(Math.round((costPrice + laborCost + materialCost + paintCost) * (1 + targetMargin / 100) * (1 + taxPercent / 100)))}
                                      </button>
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    className="w-full border rounded-xl px-4 py-3 text-xl font-black text-[var(--status-success)] outline-none focus:ring-2 focus:ring-[var(--status-success)]"
                                    value={formatNumberInput(finishedRetailPrice)}
                                    onChange={(e) => {
                                      const val = parseNumberInput(e.target.value);
                                      setFinishedRetailPrice(val === "" ? 0 : Number(val));
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
                                      {fmtCurrency(Math.round(costPrice * (1 + targetMargin / 100)))}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-[var(--brand-primary)] font-medium">
                                      2. Giá gợi ý (đã cộng VAT {taxPercent}%):
                                    </span>
                                    <button
                                      onClick={() => {
                                        const suggested = Math.round(costPrice * (1 + targetMargin / 100) * (1 + taxPercent / 100));
                                        setRetailPrice(suggested);
                                      }}
                                      className="text-[11.5px] font-black text-[var(--brand-primary)] bg-blue-100 px-2.5 py-1 rounded-md cursor-pointer hover:bg-blue-200 hover:text-blue-800 transition shadow-sm active:scale-95"
                                    >
                                      {fmtCurrency(Math.round(costPrice * (1 + targetMargin / 100) * (1 + taxPercent / 100)))}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="flex items-center justify-between p-3 border rounded-xl bg-[var(--status-pending)]/10 border-[var(--status-pending)]/20 shadow-sm">
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
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 5: Bảo hành & Chính sách */}
                      <div className="space-y-4 pt-4 border-t border-gray-100 pb-10">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" /> 
                            Bảo hành & Chính sách
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-12 gap-4 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                          <div className="col-span-4">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-wide">
                              Thời hạn (Tháng)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                className="w-full border-2 border-white rounded-xl px-4 py-3 text-lg font-black text-blue-700 outline-none focus:border-blue-500 shadow-sm bg-white"
                                value={warrantyMonths}
                                onChange={(e) => setWarrantyMonths(e.target.value)}
                              />
                              <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                            </div>
                          </div>
                          <div className="col-span-8">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-wide">
                              Chi tiết điều khoản cam kết
                            </label>
                            <textarea
                              className="w-full border-2 border-white rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-blue-500 min-h-[120px] shadow-sm bg-white leading-relaxed"
                              placeholder="Mô tả các điều kiện bảo hành, bảo trì..."
                              value={warrantyContent}
                              onChange={(e) => setWarrantyContent(e.target.value)}
                            />
                            <p className="mt-2 text-[10px] text-slate-400 italic">
                               * Nội dung này sẽ được in trực tiếp lên Phiếu Bảo Hành khi bán hàng.
                            </p>
                          </div>
                        </div>
                      </div>
                  </div>
              </div>
            ) : null}
            </div>

            <div className="px-6 py-4 border-t border-[var(--grid-border)] flex items-center justify-between bg-white shrink-0">
              {(!detailItem || (detailItem.stock === 0 && (!detailItem.lots || detailItem.lots.length === 0))) ? (
                <button
                  onClick={(e) => handleConfirmDelete(detailItem, e)}
                  className="px-4 py-2 rounded-lg text-[13px] font-bold transition-all border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 flex items-center gap-2"
                >
                  <Trash2 size={16} /> Xóa sản phẩm
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition cursor-pointer border border-transparent hover:border-[var(--grid-border)]"
                >
                  Đóng
                </button>
                {!editing && !pricing && detailItem?.status !== "Hết hàng" && (
                  <>
                    <button
                      onClick={() => handleOpenModal("form", detailItem)}
                      className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 transition-all flex items-center gap-2 border border-[var(--brand-primary)]/20"
                    >
                      <Pencil size={15} /> Sửa thông tin
                    </button>
                    {detailItem?.productType !== "Hàng khách đặt" && (
                      <button
                        onClick={() => handleOpenModal("pricing", detailItem)}
                        className={`px-5 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all shadow-sm flex items-center gap-2 ${detailItem?.status === "Chưa định giá" ? "bg-[var(--status-error)] hover:opacity-90 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700"}`}
                      >
                        <Tag size={15} /> {detailItem?.status === "Chưa định giá" ? "Định giá ngay" : "Định giá"}
                      </button>
                    )}
                  </>
                )}
                {editing && (
                  <button
                    onClick={handleSaveAddEdit}
                    className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[var(--brand-primary)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform active:scale-95"
                  >
                    <Pencil size={16} /> Lưu thông tin
                  </button>
                )}
                {pricing && (
                  <button
                    onClick={handleSaveAddEdit}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform active:scale-95 ${editItem?.status === "Chưa định giá" ? "bg-[var(--status-error)] hover:opacity-90" : "bg-emerald-600 hover:bg-emerald-700"}`}
                  >
                    <Tag size={16} />
                    {editItem?.status === "Chưa định giá"
                      ? "Xác nhận định giá & Mở bán"
                      : "Lưu định giá"}
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
      header: "MÃ SẢN PHẨM",
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
        if (item.status === "Quà tặng") {
          return (
            <div className="flex flex-col items-end">
               <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
                 Quà tặng
               </span>
               <span className="text-[11px] font-bold text-purple-500 mt-1 italic">Miễn phí</span>
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
          searchPlaceholder="Theo Mã Sản Phẩm, tên sản phẩm..."
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
              label: "Sửa thông tin",
              onClick: (item) => handleOpenModal("form", item),
              showIf: (item) => item.status !== "Hết hàng",
            },
            {
              icon: Tag,
              label: "Định giá",
              onClick: (item) => handleOpenModal("pricing", item),
              showIf: (item) => item.status !== "Hết hàng" && item.productType !== "Hàng khách đặt",
            },
            {
              icon: Trash2,
              label: "Xóa sản phẩm",
              onClick: (item) => handleConfirmDelete(item),
              className: "text-red-500 hover:bg-red-50",
              showIf: (item) => item.stock === 0 && (!item.lots || item.lots.length === 0)
            },
          ]}
          bulkActions={[
            {
              label: "XÓA HÀNG LOẠT",
              icon: Trash2,
              onClick: () => {
                const invalidDeletes = products.filter(p => selectedIds.includes(p.id))
                  .some(p => p.stock > 0 || (p.lots && p.lots.length > 0));

                if (invalidDeletes) {
                  toast.error("Lỗi: Tồn tại sản phẩm đang có tồn kho hoặc lịch sử kiện hàng trong danh sách chọn!");
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
