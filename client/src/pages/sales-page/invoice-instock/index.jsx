/**
 * Component InStockInvoicePage
 * POS-style invoice for in-stock wood products
 *
 * Layout: 2-column split — Cart (left) + Product Catalog (right)
 * Features: Multi-tab invoices, search, category filter, quantity controls
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  X,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  ShoppingCart,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Package,
  PackageCheck,
  Hammer,
  CheckCircle2,
  AlertCircle,
  User,
  Receipt,
  Filter,
  Search,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  Camera,
  ShieldCheck,
  Eye,
  Info,
} from "lucide-react";
import { PrintableInvoice } from "../order-manage/detail";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";

// ===================== STATIC DATA =====================
const WOOD_PRODUCTS = [
  {
    id: 1,
    name: "Bộ bàn ăn gỗ sồi 4 ghế",
    sku: "BA-SOI-4G",
    price: 12500000,
    stock: 8,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "180 x 90 x 75 cm",
    color: "Sồi tự nhiên",
  },
  {
    id: 2,
    name: "Kệ sách gỗ óc chó 5 tầng",
    sku: "KS-OC-5T",
    price: 8900000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng sẵn",
    size: "120 x 35 x 180 cm",
    color: "Óc chó đậm",
  },
  {
    id: 3,
    name: "Bàn làm việc gỗ sồi 3 ngăn",
    sku: "BLV-SOI-3N",
    price: 7200000,
    stock: 12,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng mộc",
    size: "140 x 70 x 75 cm",
    color: "Trắng sồi",
  },
  {
    id: 4,
    name: "Tủ đựng đồ gỗ óc chó",
    sku: "TDD-OC-01",
    price: 9800000,
    stock: 3,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng mộc",
    size: "100 x 45 x 120 cm",
    color: "Nguyên mộc",
  },
  {
    id: 5,
    name: "Ghế ăn gỗ sồi tự nhiên",
    sku: "GA-SOI-TN",
    price: 1850000,
    stock: 25,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "45 x 48 x 90 cm",
    color: "Sồi sáng",
  },
  {
    id: 6,
    name: "Bàn trà đôi mặt đá Marble",
    sku: "BT-MD-06",
    price: 4200000,
    stock: 8,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "D80 & D60 cm",
    color: "Trắng vân mây",
  },
  {
    id: 7,
    name: "Tủ rượu góc gỗ hương",
    sku: "TR-HU-07",
    price: 8900000,
    stock: 0,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng mộc",
    size: "Cao 220",
  },
  {
    id: 8,
    name: "Vách ngăn lam gỗ trang trí",
    sku: "VN-LG-08",
    price: 2500000,
    stock: 15,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "Module 100 x 240",
    color: "Nâu cà phê",
  },
  {
    id: 9,
    name: "Sofa nỉ chữ L cỡ lớn",
    sku: "SF-NL-09",
    price: 15800000,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "280 x 160",
    color: "Xanh Navy",
  },
  {
    id: 10,
    name: "Tủ giày gỗ thông ghép",
    sku: "TG-GT-10",
    price: 1200000,
    stock: 30,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng mộc",
    size: "80 x 120 x 30 cm",
    color: "Nguyên mộc",
  },
  {
    id: 11,
    name: "Tủ giày MDF phủ Melamine",
    sku: "TG-MDF-11",
    price: 1850000,
    stock: 18,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "100 x 110 x 35",
    color: "Trắng + Vân gỗ",
  },
  {
    id: 12,
    name: "Bàn console gỗ óc chó",
    sku: "BC-OC-01",
    price: 6800000,
    stock: 7,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "140 x 40 x 85",
    color: "Cánh gián nhạt",
  },
  {
    id: 13,
    name: "Sofa da thật góc L chữ U",
    sku: "SF-DA-13",
    price: 25000000,
    stock: 3,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "320 x 200",
    color: "Đen tuyền",
  },
  {
    id: 14,
    name: "Bàn trà đôi mặt kính khung sắt",
    sku: "BT-K-14",
    price: 3200000,
    stock: 15,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "Tròn 70",
    color: "Đen mờ",
  },
  {
    id: 15,
    name: "Kệ TV treo tường tối giản",
    sku: "KTV-TT-15",
    price: 4100000,
    stock: 20,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "180 x 35",
    color: "Xám chì",
  },
  {
    id: 16,
    name: "Tủ giày thông minh 3 tầng",
    sku: "TG-TM-16",
    price: 2800000,
    stock: 12,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    size: "90 x 120 x 24",
    color: "Vân sồi",
  },
  {
    id: 17,
    name: "Ghế đôn sofa bọc nhung",
    sku: "GD-BN-17",
    price: 850000,
    stock: 30,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng mộc",
    size: "Tròn 40",
  },
  {
    id: 18,
    name: "Vách ngăn phòng khách cnc",
    sku: "VN-CNC-18",
    price: 5600000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng mộc",
    size: "Module 120x260",
  },

  // Phòng ngủ
  {
    id: 19,
    name: "Giường bọc da đầu giường cao",
    sku: "GBD-19",
    price: 18500000,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng mộc",
    size: "180 x 200",
  },
  {
    id: 20,
    name: "Tủ quần áo cánh lùa kính đen",
    sku: "TQA-L-20",
    price: 21000000,
    stock: 2,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng sẵn",
    size: "240 x 220 x 60",
    color: "Khung đen",
  },
  {
    id: 21,
    name: "Bàn trang điểm gương LED",
    sku: "BTD-LED-21",
    price: 5400000,
    stock: 8,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng sẵn",
    size: "100 x 40 x 75",
    color: "Trắng sứ",
  },
  {
    id: 22,
    name: "Tab đầu giường gỗ tự nhiên",
    sku: "TDG-TN-22",
    price: 1200000,
    stock: 25,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng sẵn",
    size: "45 x 40 x 45",
    color: "Sơn bóng mờ",
  },
  {
    id: 23,
    name: "Giường tầng trẻ em gỗ thông",
    sku: "GT-TE-23",
    price: 9500000,
    stock: 6,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng mộc",
    size: "120 x 200",
  },
  {
    id: 24,
    name: "Ghế thư giãn đọc sách kèm đôn",
    sku: "GTG-24",
    price: 6200000,
    stock: 10,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng sẵn",
    size: "Ghế: 85x85, Đôn: 50x40",
    color: "Ghi sáng",
  },
  {
    id: 25,
    name: "Tủ ngăn kéo để đồ mini",
    sku: "TNK-25",
    price: 3100000,
    stock: 14,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng mộc",
    size: "60 x 80 x 40",
  },
  {
    id: 26,
    name: "Giá treo quần áo khung thép",
    sku: "GTQA-26",
    price: 950000,
    stock: 40,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng mộc",
    size: "150 x 40",
  },

  // Phòng ăn
  {
    id: 27,
    name: "Bộ bàn ăn mặt đá ceramic",
    sku: "BCC-27",
    price: 17800000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "160 x 80",
    color: "Mặt đá xám vân xoáy",
  },
  {
    id: 28,
    name: "Tủ lạnh âm tủ đa năng",
    sku: "TCA-28",
    price: 12500000,
    stock: 3,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "Module 60x60x220",
    color: "Đen nhám",
  },
  {
    id: 29,
    name: "Tủ bếp acrylic bóng gương",
    sku: "TBAC-29",
    price: 28000000,
    stock: 1,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "Theo mặt bằng thực tế",
    color: "Xanh ngọc / Trắng",
  },
  {
    id: 30,
    name: "Ghế ăn bọc da PU cao cấp",
    sku: "GAAP-30",
    price: 1450000,
    stock: 50,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "Chân 45cm",
    color: "Da bò",
  },
  {
    id: 31,
    name: "Đảo bếp di động mặt gỗ",
    sku: "DB-31",
    price: 8900000,
    stock: 7,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng mộc",
    size: "120 x 80",
  },
  {
    id: 32,
    name: "Kệ để rượu treo tường",
    sku: "KDR-32",
    price: 2100000,
    stock: 18,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "80 x 110 x 20",
    color: "Nâu cánh gián",
  },
  {
    id: 33,
    name: "Bàn ăn tròn xoay thông minh",
    sku: "BAT-33",
    price: 15600000,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    size: "Đường kính 1.4m",
    color: "Mặt đá vân mây trắng",
  },

  // Phòng làm việc
  {
    id: 34,
    name: "Ghế công thái học Ergonomic",
    sku: "GCTH-34",
    price: 4500000,
    stock: 22,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng sẵn",
    size: "Tiêu chuẩn Adult",
    color: "Đen / Trắng xám",
  },
  {
    id: 35,
    name: "Bàn nâng hạ chiều cao điện",
    sku: "BNH-35",
    price: 8200000,
    stock: 9,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng sẵn",
    size: "160 x 75",
    color: "Mặt óc chó / Chân đen",
  },
  {
    id: 36,
    name: "Tủ hồ sơ văn phòng 2 cánh",
    sku: "THS-36",
    price: 3600000,
    stock: 16,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng sẵn",
    size: "120 x 200 x 40",
    color: "Ghi chì",
  },
  {
    id: 37,
    name: "Kệ máy in để bàn",
    sku: "KMI-37",
    price: 650000,
    stock: 35,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng mộc",
    size: "50 x 40 x 30",
  },
  {
    id: 38,
    name: "Ghế xoay lưới văn phòng",
    sku: "GXV-38",
    price: 1850000,
    stock: 45,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng sẵn",
    size: "Size L",
    color: "Đen",
  },
  {
    id: 39,
    name: "Hộc tủ di động 3 ngăn kéo",
    sku: "HT-39",
    price: 1550000,
    stock: 28,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng mộc",
    size: "50 x 40 x 30 cm",
    color: "Gỗ thông mộc",
  },
  {
    id: 40,
    name: "Bàn họp chân sắt chữ U",
    sku: "BHC-40",
    price: 9800000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng sẵn",
    size: "240 x 120 x 75 cm",
    color: "Vàng vân gỗ / Chân ghi",
  },
];

const GIFT_PRODUCTS = [
  {
    id: 1001,
    name: "Gối tựa lưng Sofa họa tiết",
    sku: "QT-GOI-01",
    price: 0,
    stock: 50,
    image: "/wood_products.png",
    category: "Quà tặng",
    productType: "Quà tặng",
    size: "45x45 cm",
    color: "Họa tiết Vintage",
  },
  {
    id: 1002,
    name: "Khăn trải bàn ren cao cấp",
    sku: "QT-KHAN-02",
    price: 0,
    stock: 30,
    image: "/wood_products.png",
    category: "Quà tặng",
    productType: "Quà tặng",
    size: "140x180 cm",
    color: "Trắng kem",
  },
  {
    id: 1003,
    name: "Bộ vệ sinh gỗ chuyên dụng",
    sku: "QT-VS-03",
    price: 0,
    stock: 100,
    image: "/wood_products.png",
    category: "Quà tặng",
    productType: "Quà tặng",
    size: "Chai 500ml",
    color: "Trong suốt",
  },
  {
    id: 1004,
    name: "Lót ly gỗ bần (Bộ 6 cái)",
    sku: "QT-LOT-04",
    price: 0,
    stock: 40,
    image: "/wood_products.png",
    category: "Quà tặng",
    productType: "Quà tặng",
    size: "D10 cm",
    color: "Nâu bần",
  },
];

const ITEMS_PER_PAGE = 15;
const CATEGORIES = ["Phòng khách", "Phòng ngủ", "Phòng ăn", "Phòng làm việc", "Quà tặng"];

const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "Nguyễn Văn Hoàng",
    phone: "0901234567",
    address: "123 Giải Phóng, Hai Bà Trưng, Hà Nội",
  },
  {
    id: 2,
    name: "Trần Thị Mai",
    phone: "0912345678",
    address: "456 Kim Mã, Ba Đình, Hà Nội",
  },
  {
    id: 3,
    name: "Lê Minh Tuấn",
    phone: "0923456789",
    address: "789 Nguyễn Trãi, Thanh Xuân, Hà Nội",
  },
  {
    id: 4,
    name: "Phạm Thị Lan",
    phone: "0934567890",
    address: "321 Lạc Long Quân, Tây Hồ, Hà Nội",
  },
  {
    id: 5,
    name: "Võ Đức Anh",
    phone: "0945678901",
    address: "654 Minh Khai, Hai Bà Trưng, Hà Nội",
  },
  {
    id: 6,
    name: "Đặng Thùy Linh",
    phone: "0956789012",
    address: "987 Cầu Giấy, Cầu Giấy, Hà Nội",
  },
  {
    id: 7,
    name: "Bùi Tuấn Anh",
    phone: "0967890123",
    address: "159 Đội Cấn, Ba Đình, Hà Nội",
  },
  {
    id: 8,
    name: "Hoàng Nguyệt Ánh",
    phone: "0978901234",
    address: "753 Lê Duẩn, Hoàn Kiếm, Hà Nội",
  },
  {
    id: 9,
    name: "Đinh Quang Hiếu",
    phone: "0989012345",
    address: "246 Bà Triệu, Hoàn Kiếm, Hà Nội",
  },
  {
    id: 10,
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    address: "135 Trần Duy Hưng, Cầu Giấy, Hà Nội",
  },
];



const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v);

let tabIdCounter = 1;
const createEmptyTab = () => ({
  id: ++tabIdCounter,
  cartItems: [],
  selectedCustomer: null,
  orderNote: "",
  discount: 0,
  depositAmount: 0,
  deliveryMethod: "store", // "store" hoặc "delivery"
  deliveryDate: "",
  processingFee: 0,
});

// ===================== COMPONENT =====================
export default function InStockInvoicePage() {
  const printRef = useRef(null);
  const [printingOrder, setPrintingOrder] = useState(null);
  const [selectedProductForView, setSelectedProductForView] = useState(null);

  const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  useEffect(() => {
    if (printingOrder && printRef.current) {
      const content = printRef.current;
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (printWindow) {
        printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                <title>In hóa đơn</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { margin: 0; padding: 0; }
                    .page-break { page-break-after: always; }
                    .page-break:last-child { page-break-after: auto; }
                </style>
                </head>
                <body>${content.innerHTML}</body>
                </html>
            `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setPrintingOrder(null);
        }, 500);
      } else {
        setPrintingOrder(null);
      }
    }
  }, [printingOrder]);

  const navigate = useNavigate();

  const [tabs, setTabs] = useState([
    {
      id: 1,
      cartItems: [],
      selectedCustomer: null,
      orderNote: "",
      discount: 0,
      depositAmount: 0,
      deliveryMethod: "store",
      deliveryDate: "",
      processingFee: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [productTypeTab, setProductTypeTab] = useState("Hàng mộc");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState(""); // Thêm state tìm kiếm sản phẩm
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerSearchRef = useRef(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  const filteredProducts = useMemo(() => {
    const source = productTypeTab === "Quà tặng" ? GIFT_PRODUCTS : WOOD_PRODUCTS;
    return source.filter((p) => {
      const matchType = productTypeTab === "Quà tặng" ? true : p.productType === productTypeTab;
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);

      const pNameLower = p.name.toLowerCase();
      let pType = "Khác";
      if (pNameLower.includes("bàn") || pNameLower.includes("tab"))
        pType = "Bàn";
      else if (
        pNameLower.includes("ghế") ||
        pNameLower.includes("sofa") ||
        pNameLower.includes("đôn")
      )
        pType = "Ghế";
      else if (
        pNameLower.includes("tủ") ||
        pNameLower.includes("kệ") ||
        pNameLower.includes("hộc") ||
        pNameLower.includes("giá")
      )
        pType = "Tủ";
      else if (pNameLower.includes("giường")) pType = "Giường";

      const matchProductType =
        selectedProductTypes.length === 0 ||
        selectedProductTypes.includes(pType);

      const minP = parseInt(priceRange.min);
      const maxP = parseInt(priceRange.max);
      const matchPrice =
        (isNaN(minP) || p.price >= minP) && (isNaN(maxP) || p.price <= maxP);

      // Lọc theo từ khóa tìm kiếm
      const matchSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());

      return (
        matchType &&
        matchCategory &&
        matchProductType &&
        matchPrice &&
        matchSearch
      );
    });
  }, [
    productTypeTab,
    selectedCategories,
    selectedProductTypes,
    priceRange,
    productSearch,
  ]);

  const customerResults = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return MOCK_CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [customerSearch]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const addTab = () => {
    const newTab = createEmptyTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId)
        setActiveTabId(filtered[filtered.length - 1].id);
      return filtered;
    });
  };

  const addToCart = (product) => {
    const existing = activeTab.cartItems.find((i) => i.id === (product.id + (productTypeTab === "Quà tặng" ? 10000 : 0)));
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`"${product.name}" đã hết hàng trong kho`);
        return;
      }
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === (product.id + (productTypeTab === "Quà tặng" ? 10000 : 0)) ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      if (product.stock <= 0) {
        toast.error(`"${product.name}" đã hết hàng`);
        return;
      }
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: product.id + (productTypeTab === "Quà tặng" ? 10000 : 0),
            name: product.name,
            price: productTypeTab === "Quà tặng" ? 0 : product.price,
            stock: product.stock,
            sku: product.sku,
            quantity: 1,
            note: "",
            warranty: "",
            productType: product.productType,
            images: [],
            isGift: productTypeTab === "Quà tặng",
          },
        ],
      });
    }
  };

  const updateQuantity = (id, delta) => {
    updateActiveTab({
      cartItems: activeTab.cartItems
        .map((i) => {
          if (i.id !== id) return i;
          const newQty = i.quantity + delta;
          if (delta > 0 && newQty > i.stock) {
            toast.error(`Tồn kho chỉ còn ${i.stock}`);
            return i;
          }
          return { ...i, quantity: Math.max(0, newQty) };
        })
        .filter((i) => i.quantity > 0),
    });
  };

  const removeFromCart = (id) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.filter((i) => i.id !== id),
    });
  };

  const setQuantity = (id, qty) => {
    const val = parseInt(qty) || 0;
    if (val <= 0) return removeFromCart(id);
    const item = activeTab.cartItems.find((i) => i.id === id);
    if (item && val > item.stock) {
      toast.error(`Tồn kho chỉ còn ${item.stock}`);
      return;
    }
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, quantity: val } : i,
      ),
    });
  };

  const updateItemNote = (id, note) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, note } : i,
      ),
    });
  };

  const updateItemWarranty = (id, warranty) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, warranty } : i,
      ),
    });
  };

  const updateItemImages = (id, newImages) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, images: [...(i.images || []), ...newImages] } : i,
      ),
    });
  };

  const removeItemImage = (itemId, imgIdx) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === itemId
          ? { ...i, images: i.images.filter((_, idx) => idx !== imgIdx) }
          : i,
      ),
    });
  };

  const subtotal = activeTab.cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const totalPayable = Math.max(
    0,
    subtotal +
      (activeTab.processingFee || 0) -
      activeTab.discount -
      activeTab.depositAmount,
  );
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    if (activeTab.cartItems.length === 0) return;

    if (!activeTab.selectedCustomer) {
      toast.error("Vui lòng nhập hoặc chọn Khách hàng trước khi thanh toán!");
      return;
    }

    const newOrder = {
      code: "HD-" + Math.floor(Math.random() * 1000000),
      customer: {
        name: activeTab.selectedCustomer?.name ,
        phone: activeTab.selectedCustomer?.phone || "",
        address: activeTab.selectedCustomer?.address || "",
      },
      type: "Hàng sẵn",
      salesPerson: "Nhân viên bán hàng",
      products: activeTab.cartItems.map((item) => ({
        name: item.name,
        material: item.category || "Hàng trưng bày",
        size: "",
        qty: item.quantity,
        price: item.price,
        warranty: item.warranty || "12 tháng",
        note: item.note || "",
        images: item.images || [],
      })),
      total: totalPayable,
      subtotal: subtotal,
      processingFee: activeTab.processingFee || 0,
      discount: activeTab.discount,
      deposit: activeTab.depositAmount,
      deliveryDate: activeTab.deliveryDate,
      date: new Date().toISOString(),
    };

    toast.success(`Tạo yêu cầu ${newOrder.code} thành công!`);
    setPrintingOrder(newOrder);

    updateActiveTab({
      cartItems: [],
      selectedCustomer: null,
      orderNote: "",
      discount: 0,
      depositAmount: 0,
      deliveryMethod: "store",
      deliveryDate: "",
      processingFee: 0,
    });
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Bán hàng có sẵn - TPF-SIMS" />

      <div
        className="flex h-full gap-4 -m-4 p-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ═══════════════ LEFT PANEL – CART ═══════════════ */}
        <div
          className="flex flex-col w-[56%] bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* ── Tab Bar ── */}
          <div
            className="flex items-center gap-1.5 px-4 py-2.5 border-b"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  tab.id === activeTabId ? "font-semibold" : "hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor:
                    tab.id === activeTabId
                      ? "var(--status-focus)"
                      : "transparent",
                  color:
                    tab.id === activeTabId
                      ? "var(--brand-primary)"
                      : "var(--text-secondary)",
                }}
              >
                <Receipt size={13} />
                <span>HĐ {idx + 1}</span>
                {tab.cartItems.length > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                    style={{
                      backgroundColor:
                        tab.id === activeTabId
                          ? "var(--brand-primary)"
                          : "var(--grid-border)",
                      color:
                        tab.id === activeTabId
                          ? "#fff"
                          : "var(--text-secondary)",
                    }}
                  >
                    {tab.cartItems.length}
                  </span>
                )}
                {tabs.length > 1 && (
                  <X
                    size={12}
                    className="ml-0.5 cursor-pointer opacity-40 hover:opacity-100"
                    onClick={(e) => closeTab(tab.id, e)}
                  />
                )}
              </button>
            ))}
            <button
              onClick={addTab}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer hover:bg-gray-50"
              style={{ color: "var(--text-placeholder)" }}
              title="Thêm hóa đơn mới"
            >
              <Plus size={14} />
            </button>

            {/* Order type switch — pushed to right */}
          </div>

          {/* ── Cart Content ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab.cartItems.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-2"
                style={{ color: "var(--text-placeholder)" }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-main)" }}
                >
                  <ShoppingCart size={32} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium mt-2">Giỏ hàng trống</p>
                <p className="text-xs">Chọn sản phẩm từ danh mục bên phải</p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "var(--grid-border)" }}
              >
                {activeTab.cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-col px-4 py-3 group hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Index */}
                      <span
                        className="text-xs font-medium w-5 text-center shrink-0"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {idx + 1}
                      </span>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-[13px] font-semibold truncate"
                            style={{ color: "var(--text-main)" }}
                          >
                            {item.name}
                          </p>
                          {item.isGift && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-tight">
                              Quà tặng
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[11px] font-mono"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            {item.sku}
                          </span>
                          <span
                            className="text-[11px]"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            × {item.isGift ? "0đ" : fmt(item.price) + "đ"}
                          </span>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                          style={{
                            border: "1px solid var(--grid-border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.id, e.target.value)}
                          className="w-10 h-7 text-center text-[13px] font-semibold rounded-lg focus:outline-none focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{
                            border: "1px solid var(--grid-border)",
                            color: "var(--text-main)",
                          }}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                          style={{
                            border: "1px solid var(--grid-border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span
                        className="text-[13px] font-bold w-24 text-right shrink-0"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {fmt(item.price * item.quantity)}đ
                      </span>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg items-center justify-center transition cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hidden group-hover:flex shrink-0"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="mt-2 pl-11 flex items-center gap-4">
                      {/* Note */}
                      <div className="flex-1 flex items-center gap-2">
                        <Pencil
                          size={11}
                          style={{ color: "var(--text-placeholder)" }}
                          className="shrink-0"
                        />
                        <input
                          type="text"
                          placeholder="Ghi chú..."
                          value={item.note || ""}
                          onChange={(e) =>
                            updateItemNote(item.id, e.target.value)
                          }
                          className="text-[12px] italic focus:outline-none bg-transparent w-full"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>

                      {/* Warranty */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 bg-white shadow-sm ring-1 ring-black/5 hover:ring-brand-primary/30 transition-shadow">
                        <ShieldCheck
                          size={13}
                          className="text-emerald-500 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-0.5">Bảo hành</span>
                          <input
                            type="text"
                            placeholder="Nhập bảo hành..."
                            value={item.warranty || ""}
                            onChange={(e) =>
                              updateItemWarranty(item.id, e.target.value)
                            }
                            className="text-[11px] font-bold focus:outline-none bg-transparent w-20 placeholder:font-normal placeholder:text-gray-300"
                            style={{ color: "var(--text-main)" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload for Raw Wood */}
                    {item.productType === "Hàng mộc" && (
                      <div className="mt-2 pl-11 space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-dashed border-gray-300 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer group/upload">
                            <Camera
                              size={12}
                              className="text-gray-400 group-hover/upload:text-brand-primary"
                            />
                            <span className="text-[11px] font-medium text-gray-500 group-hover/upload:text-brand-primary">
                              Gửi ảnh khách
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files);
                                if (files.length > 0) {
                                  // Mock: create Object URLs for preview
                                  const urls = files.map((f) =>
                                    URL.createObjectURL(f),
                                  );
                                  updateItemImages(item.id, urls);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {item.images && item.images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.images.map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="relative w-12 h-12 rounded-lg border overflow-hidden group/img"
                              >
                                <img
                                  src={img}
                                  alt="customer"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() =>
                                    removeItemImage(item.id, imgIdx)
                                  }
                                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                >
                                  <X size={12} className="text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="border-t"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* Customer + Note row */}
            <div
              className="flex items-stretch divide-x"
              style={{ borderColor: "var(--grid-border)" }}
            >
              {/* Customer */}
              <div
                className="relative flex items-center gap-2 px-4 py-2.5 w-1/2"
                ref={customerSearchRef}
              >
                <User
                  size={14}
                  style={{ color: "var(--text-placeholder)" }}
                  className="shrink-0"
                />
                {activeTab.selectedCustomer ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {activeTab.selectedCustomer.name}
                    </span>
                    <span
                      className="text-[11px] shrink-0"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {activeTab.selectedCustomer.phone}
                    </span>
                    <button
                      onClick={() => {
                        updateActiveTab({ selectedCustomer: null });
                        setCustomerSearch("");
                      }}
                      className="cursor-pointer shrink-0 ml-auto"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Tìm khách hàng (tên, SĐT)..."
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => {
                        if (customerSearch.trim())
                          setShowCustomerDropdown(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowCustomerDropdown(false), 200);
                      }}
                      className="flex-1 text-[13px] focus:outline-none bg-transparent"
                      style={{ color: "var(--text-main)" }}
                    />
                    <button
                      onClick={() => setShowAddCustomer(true)}
                      className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition hover:bg-gray-100 shrink-0"
                      style={{ color: "var(--brand-primary)" }}
                      title="Thêm khách hàng mới"
                    >
                      <UserPlus size={12} />
                    </button>
                  </div>
                )}

                {/* Customer search dropdown */}
                {showCustomerDropdown && customerSearch.trim() && (
                  <div
                    className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-xl shadow-lg border overflow-hidden z-30"
                    style={{ borderColor: "var(--grid-border)" }}
                  >
                    {customerResults.length > 0 ? (
                      <div className="max-h-[200px] overflow-y-auto">
                        {customerResults.map((c) => (
                          <button
                            key={c.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              updateActiveTab({ selectedCustomer: c });
                              setCustomerSearch("");
                              setShowCustomerDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                              style={{
                                backgroundColor: "var(--status-focus)",
                                color: "var(--brand-primary)",
                              }}
                            >
                              {c.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[13px] font-semibold truncate"
                                style={{ color: "var(--text-main)" }}
                              >
                                {c.name}
                              </p>
                              <p
                                className="text-[11px]"
                                style={{ color: "var(--text-placeholder)" }}
                              >
                                {c.phone}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-center">
                        <p
                          className="text-[13px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          Không tìm thấy khách hàng
                        </p>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowAddCustomer(true);
                            setShowCustomerDropdown(false);
                          }}
                          className="text-[12px] font-semibold mt-1 cursor-pointer"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          + Thêm khách hàng mới
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="flex items-center gap-2 px-4 py-2.5 w-1/2">
                <Pencil
                  size={12}
                  style={{ color: "var(--text-placeholder)" }}
                  className="shrink-0"
                />
                <input
                  type="text"
                  placeholder="Ghi chú..."
                  value={activeTab.orderNote}
                  onChange={(e) =>
                    updateActiveTab({ orderNote: e.target.value })
                  }
                  className="flex-1 text-[13px] focus:outline-none bg-transparent"
                  style={{ color: "var(--text-secondary)" }}
                />
              </div>
            </div>

            {/* Delivery Method */}
            <div
              className="px-4 py-3 space-y-2 border-t"
              style={{
                borderColor: "var(--grid-border)",
              }}
            >
              <p
                className="text-[12px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-placeholder)" }}
              >
                Phương thức nhận hàng
              </p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`deliveryMethod-${activeTab.id}`}
                    value="store"
                    checked={activeTab.deliveryMethod === "store"}
                    onChange={() =>
                      updateActiveTab({ deliveryMethod: "store" })
                    }
                    className="w-3.5 h-3.5 text-green-600 focus:ring-green-500"
                  />
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-main)" }}
                  >
                    Lấy tại cửa hàng
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`deliveryMethod-${activeTab.id}`}
                    value="delivery"
                    checked={activeTab.deliveryMethod === "delivery"}
                    onChange={() =>
                      updateActiveTab({ deliveryMethod: "delivery" })
                    }
                    className="w-3.5 h-3.5 text-green-600 focus:ring-green-500"
                  />
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-main)" }}
                  >
                    Giao tận nơi
                  </span>
                </label>
              </div>

              {activeTab.deliveryMethod === "delivery" && (
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-[13px] shrink-0"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Giao vào ngày:
                  </span>
                  <div className="relative flex-1">
                    <Calendar
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-placeholder)" }}
                    />
                    <input
                      type="date"
                      value={activeTab.deliveryDate || ""}
                      onChange={(e) =>
                        updateActiveTab({ deliveryDate: e.target.value })
                      }
                      className="w-full text-[13px] pl-8 pr-2 py-1.5 focus:outline-none focus:ring-1 rounded-lg bg-white"
                      style={{
                        border: "1px solid var(--grid-border)",
                        color: "var(--text-main)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div
              className="px-4 py-3 space-y-2 border-t"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--grid-header-bg)",
              }}
            >
              <div className="flex justify-between text-[13px]">
                <span style={{ color: "var(--text-secondary)" }}>
                  Tổng ({itemCount} sản phẩm)
                </span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-main)" }}
                >
                  {fmt(subtotal)}đ
                </span>
              </div>
              <div className="flex justify-between text-[13px] items-center">
                <span style={{ color: "var(--text-secondary)" }}>
                  Phí gia công
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    ₫
                  </span>
                  <input
                    type="text"
                    value={
                      activeTab.processingFee
                        ? fmt(activeTab.processingFee)
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      updateActiveTab({
                        processingFee: parseInt(raw) || 0,
                      });
                    }}
                    placeholder="0"
                    className="w-28 text-right text-[13px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 bg-white"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[13px] items-center">
                <span style={{ color: "var(--text-secondary)" }}>Giảm giá</span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    ₫
                  </span>
                  <input
                    type="text"
                    value={activeTab.discount ? fmt(activeTab.discount) : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      updateActiveTab({
                        discount: parseInt(raw) || 0,
                      });
                    }}
                    placeholder="0"
                    className="w-28 text-right text-[13px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 bg-white"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[13px] items-center">
                <span
                  className="font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <CreditCard size={12} className="inline mr-1.5" />
                  Tiền đặt cọc
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    ₫
                  </span>
                  <input
                    type="text"
                    value={
                      activeTab.depositAmount
                        ? fmt(activeTab.depositAmount)
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      updateActiveTab({
                        depositAmount: parseInt(raw) || 0,
                      });
                    }}
                    placeholder="0"
                    className="w-28 text-right text-[13px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 bg-white"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Checkout bar */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p
                  className="text-xs uppercase tracking-wider font-medium"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Tổng thanh toán
                </p>
                <p
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {fmt(totalPayable)}đ
                </p>
              </div>
              <Button
                className="h-11 px-8 text-sm font-bold text-white rounded-xl transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-40"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  boxShadow:
                    activeTab.cartItems.length > 0
                      ? "0 4px 14px rgba(52, 176, 87, 0.25)"
                      : "none",
                }}
                disabled={activeTab.cartItems.length === 0}
                onClick={handleCheckout}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>

        {/* ═══════════════ RIGHT PANEL – PRODUCTS ═══════════════ */}
        <div
          className="flex flex-col w-[44%] bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* ── Product Tabs & Filter ── */}
          <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
            <div className="flex gap-2">
              <div
                className="flex-1 flex rounded-xl overflow-hidden"
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
                className="relative p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center bg-white hover:bg-gray-50 active:scale-95"
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
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
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
                      className={`group flex flex-col rounded-xl transition-all duration-200 text-left cursor-pointer relative overflow-hidden ${
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
                        {/* Hiển thị Kích thước và Màu sắc */}
                        <div className="flex flex-col gap-0.5 mt-1">
                          <span
                            className="text-[10px] font-medium truncate"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Kích thước: {product.size}
                          </span>
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
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {fmt(product.price)}đ
                        </p>

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
      </div>

      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCustomerAdded={(customer) => {
          updateActiveTab({
            selectedCustomer: {
              id: customer.pk_customer_id,
              name: customer.full_name,
              phone: customer.phone_number,
              address: customer.address || "",
            },
          });
        }}
      />

      {/* ── Product Quick View Modal ── */}
      {selectedProductForView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
            style={{ border: "1px solid var(--grid-border)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-900">Chi tiết sản phẩm</h3>
              <button
                onClick={() => setSelectedProductForView(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col md:flex-row p-6 gap-6 max-h-[80vh] overflow-y-auto font-sans text-left">
              {/* Product Image */}
              <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kích thước</p>
                      <p className="text-[13px] font-semibold text-gray-700 mt-0.5">{selectedProductForView.size || "—"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Màu sắc</p>
                      <p className="text-[13px] font-semibold text-gray-700 mt-0.5">
                        {selectedProductForView.productType === "Hàng mộc" ? "Nguyên mộc" : selectedProductForView.color || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Danh mục</p>
                    <p className="text-[13px] font-semibold text-gray-700 mt-0.5">{selectedProductForView.category || "—"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-left">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Giá niêm yết</p>
                    <p className="text-[20px] font-black text-emerald-700 mt-0.5">{fmt(selectedProductForView.price)}đ</p>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <Package size={14} className="text-amber-600" />
                    <span className="text-[13px] font-bold text-amber-700">
                      Tồn kho: {selectedProductForView.stock} sản phẩm
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    addToCart(selectedProductForView);
                    setSelectedProductForView(null);
                  }}
                  className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                >
                  <Plus size={18} />
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Area */}
      <div style={{ display: "none" }}>
        {printingOrder && (
          <div ref={printRef}>
            <PrintableInvoice
              o={printingOrder}
              displayTotal={printingOrder.total}
            />
          </div>
        )}
      </div>

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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] cursor-pointer transition select-none ${
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] cursor-pointer transition select-none ${
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
                      className="w-full text-[13px] pl-3 pr-2 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-1 bg-white"
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
                      className="w-full text-[13px] pl-3 pr-2 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-1 bg-white"
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
                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Thiết lập lại
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-[13px] cursor-pointer font-medium bg-green-500 text-white hover:bg-green-600 transition shadow-md shadow-green-500/20"
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
