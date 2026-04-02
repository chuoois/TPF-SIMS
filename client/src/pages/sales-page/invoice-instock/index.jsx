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
import { ImagePlus, XCircle } from "lucide-react";
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
  ToggleLeft,
  ToggleRight,
  Clock,
} from "lucide-react";
import { PrintableInvoice } from "../order-manage/detail";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";

// ===================== STATIC DATA =====================
const SYSTEM_WARRANTY = "12 tháng"; // Cấu hình bảo hành từ hệ thống
const WOOD_FINISHING_RATE = 1.35; // Giá hoàn thiện = giá thô × 1.35 (bao gồm dịch vụ sơn, xử lý, hoàn thiện)

const WOOD_PRODUCTS = [
  {
    id: 1,
    name: "Bộ bàn ăn gỗ sồi 4 ghế",
    sku: "BA-SOI-4G",
    price: 12500000,
    discount: 10,
    stock: 8,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng sẵn",
    color: "Sồi tự nhiên",
    leadTime: 0,
    description: "Bộ bàn ăn 6 ghế chất liệu gỗ sồi Nga tự nhiên, xử lý chống mối mọt, thiết kế hiện đại phù hợp cho phòng ăn gia đình. Kích thước (Bàn): 180 x 90 x 75 cm.",
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
    color: "Óc chó đậm",
    leadTime: 0,
    description: "Kệ sách 5 tầng bền bỉ, vân gỗ óc chó sang trọng, tạo điểm nhấn cho không gian làm việc hoặc phòng khách. Kích thước: 120 x 35 x 180 cm.",
  },
  {
    id: 3,
    name: "Bàn làm việc gỗ sồi 3 ngăn",
    sku: "BLV-SOI-3N",
    price: 7200000,
    discount: 12,
    stock: 12,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng mộc",
    color: "Trắng sồi",
    leadTime: 7,
    description: "Bàn làm việc sơn trắng sồi thanh lịch, tích hợp 3 ngăn kéo tiện lợi cho việc lưu trữ hồ sơ, văn phòng phẩm. Kích thước: 140 x 70 x 75 cm.",
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
    color: "Nguyên mộc",
    leadTime: 7,
    description: "Kích thước: 100 x 45 x 120 cm.",
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
    color: "Sồi sáng",
    description: "Kích thước: 45 x 48 x 90 cm.",
  },
  {
    id: 6,
    name: "Bàn trà đôi mặt đá Marble",
    sku: "BT-MD-06",
    price: 4200000,
    discount: 15,
    stock: 8,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    color: "Trắng vân mây",
    description: "Kích thước mặt bàn: D80 & D60 cm.",
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
    description: "Kích thước: Cao 220 cm.",
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
    color: "Nâu cà phê",
    description: "Kích thước: Module 100 x 240 cm.",
  },
  {
    id: 9,
    name: "Sofa nỉ chữ L cỡ lớn",
    sku: "SF-NL-09",
    price: 15800000,
    discount: 5,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng sẵn",
    color: "Xanh Navy",
    description: "Kích thước: 280 x 160 cm.",
  },
  {
    id: 10,
    name: "Tủ giày gỗ thông ghép",
    sku: "TG-GT-10",
    price: 1200000,
    discount: 10,
    stock: 30,
    image: "/wood_products.png",
    category: "Phòng khách",
    productType: "Hàng mộc",
    color: "Nguyên mộc",
    description: "Kích thước: 80 x 120 x 30 cm.",
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
    color: "Trắng + Vân gỗ",
    description: "Kích thước: 100 x 110 x 35 cm.",
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
    color: "Cánh gián nhạt",
    description: "Kích thước: 140 x 40 x 85 cm.",
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
    color: "Đen tuyền",
    description: "Kích thước: 320 x 200 cm.",
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
    color: "Đen mờ",
    description: "Kích thước: Tròn 70 cm.",
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
    color: "Xám chì",
    description: "Kích thước: 180 x 35 cm.",
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
    color: "Vân sồi",
    description: "Kích thước: 90 x 120 x 24 cm.",
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
    description: "Kích thước: Tròn 40 cm.",
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
    description: "Kích thước: Module 120x260 cm.",
  },

  // Phòng ngủ
  {
    id: 19,
    name: "Giường bọc da đầu giường cao",
    sku: "GBD-19",
    price: 18500000,
    discount: 7,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng mộc",
    description: "Kích thước lọt lòng: 180 x 200 cm.",
  },
  {
    id: 20,
    name: "Tủ quần áo cánh lùa kính đen",
    sku: "TQA-L-20",
    price: 21000000,
    discount: 8,
    stock: 2,
    image: "/wood_products.png",
    category: "Phòng ngủ",
    productType: "Hàng sẵn",
    color: "Khung đen",
    description: "Kích thước: 240 x 220 x 60 cm.",
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
    color: "Trắng sứ",
    description: "Kích thước: 100 x 40 x 75 cm.",
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
    color: "Sơn bóng mờ",
    description: "Kích thước: 45 x 40 x 45 cm.",
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
    description: "Kích thước tầng: 120 x 200 cm.",
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
    color: "Ghi sáng",
    description: "Kích thước Ghế: 85x85 cm. Kích thước Đôn: 50x40 cm.",
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
    description: "Kích thước: 60 x 80 x 40 cm.",
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
    description: "Kích thước: 150 x 40 cm.",
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
    color: "Mặt đá xám vân xoáy",
    description: "Kích thước bàn: 160 x 80 cm.",
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
    color: "Đen nhám",
    description: "Kích thước: Module 60x60x220 cm.",
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
    color: "Xanh ngọc / Trắng",
    description: "Kích thước tủ bếp: Theo mặt bằng thực tế.",
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
    color: "Da bò",
    description: "Sản phẩm ghế chân cao 45cm.",
  },
  {
    id: 31,
    name: "Đảo bếp di động mặt gỗ",
    sku: "DB-31",
    price: 8900000,
    discount: 15,
    stock: 7,
    image: "/wood_products.png",
    category: "Phòng ăn",
    productType: "Hàng mộc",
    description: "Kích thước mặt đảo: 120 x 80 cm.",
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
    color: "Nâu cánh gián",
    description: "Kích thước: 80 x 110 x 20 cm.",
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
    color: "Mặt đá vân mây trắng",
    description: "Kích thước bàn xoay: Đường kính 1.4m.",
  },

  // Phòng làm việc
  {
    id: 34,
    name: "Ghế công thái học Ergonomic",
    sku: "GCTH-34",
    price: 4500000,
    discount: 20,
    stock: 22,
    image: "/wood_products.png",
    category: "Phòng làm việc",
    productType: "Hàng sẵn",
    color: "Đen / Trắng xám",
    description: "Kích thước: Tiêu chuẩn Adult.",
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
    color: "Mặt óc chó / Chân đen",
    description: "Kích thước mặt bàn: 160 x 75 cm.",
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
    color: "Ghi chì",
    description: "Kích thước: 120 x 200 x 40 cm.",
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
    description: "Kích thước: 50 x 40 x 30 cm.",
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
    color: "Đen",
    description: "Tải trọng cao. Kích thước: Size L.",
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
    color: "Gỗ thông mộc",
    description: "Kích thước: 50 x 40 x 30 cm.",
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
    color: "Vàng vân gỗ / Chân ghi",
    description: "Kích thước bàn họp lớn: 240 x 120 x 75 cm.",
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
    color: "Họa tiết Vintage",
    description:
      "Gối tựa lưng êm ái với họa tiết Vintage độc đáo, mang lại sự thoải mái và vẻ đẹp cổ điển cho bộ sofa nhà bạn. Kích thước: 45x45 cm.",
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
    color: "Trắng kem",
    description: "Kích thước khăn: 140x180 cm.",
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
    color: "Trong suốt",
    description: "Chai dung tích 500ml.",
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
    color: "Nâu bần",
    description: "Kích thước lót ly: D10 cm.",
  },
];

const ITEMS_PER_PAGE = 15;
const CATEGORIES = [
  "Phòng khách",
  "Phòng ngủ",
  "Phòng ăn",
  "Phòng làm việc",
  "Quà tặng",
];

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
  storePickupDate: "", // yyyy-mm-dd — để trống = lấy ngay, có ngày = hẹn lấy
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
      storePickupDate: "",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [productTypeTab, setProductTypeTab] = useState("Hàng mộc");
  const [woodPriceMode, setWoodPriceMode] = useState("finished"); // "finished" | "raw"
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
    const source =
      productTypeTab === "Quà tặng" ? GIFT_PRODUCTS : WOOD_PRODUCTS;
    return source.filter((p) => {
      const matchType =
        productTypeTab === "Quà tặng" ? true : p.productType === productTypeTab;
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
    const isWood = product.productType === "Hàng mộc";
    const isGift = productTypeTab === "Quà tặng";
    const cartItemId = `${product.id + (isGift ? 10000 : 0)}${isWood ? `-${woodPriceMode}` : ""}`;

    const existing = activeTab.cartItems.find((i) => i.id === cartItemId);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`"${product.name}" đã hết hàng trong kho`);
        return;
      }
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      if (product.stock <= 0) {
        toast.error(`"${product.name}" đã hết hàng`);
        return;
      }
      const isWood = product.productType === "Hàng mộc";
      const isGift = productTypeTab === "Quà tặng";
      let itemPrice = product.price;
      if (isGift) itemPrice = 0;
      else if (isWood && woodPriceMode === "finished")
        itemPrice = Math.round(product.price * WOOD_FINISHING_RATE);

      // Hàng mộc giá hoàn thiện: hỗ trợ giá cũ + giá đã giảm
      const isWoodFinished = isWood && woodPriceMode === "finished";
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: cartItemId,
            name: product.name,
            price: product.discount
                ? Math.round(itemPrice * (1 - product.discount / 100))
                : itemPrice,
            stock: product.stock,
            sku: product.sku,
            quantity: 1,
            note: "",
            productType: product.productType,
            images: [],
            isGift,
            priceMode: isWood ? woodPriceMode : null,
            // Dual pricing cho Hàng mộc hoàn thiện
            oldPrice: isWoodFinished ? itemPrice : null,
            discountPrice: isWoodFinished ? (product.discount ? Math.round(itemPrice * (1 - product.discount / 100)) : itemPrice) : null,
            leadTime: product.leadTime || 0,
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

  const updateItemPrices = (id, field, value) => {
    const raw = value.replace(/\D/g, "");
    const numVal = parseInt(raw) || 0;
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id
          ? {
              ...i,
              [field]: numVal,
              // Cập nhật price = discountPrice để tính tổng đúng
              ...(field === "discountPrice" ? { price: numVal } : {}),
            }
          : i,
      ),
    });
  };

  // Bảo hành do hệ thống cấu hình, không cho sales chỉnh

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

  const maxLeadTime = useMemo(() => {
    return activeTab.cartItems.reduce((max, item) => {
      const lt = item.priceMode === "raw" ? 0 : (item.leadTime || 0);
      return Math.max(max, lt);
    }, 0);
  }, [activeTab.cartItems]);

  const workshopStats = useMemo(() => {
    try {
      const stored = localStorage.getItem("tpf_simulated_orders");
      if (!stored) return { count: 0, level: "Bình thường", buffer: 0 };
      const orders = JSON.parse(stored);
      // Đếm các đơn đang chờ gia công hoặc đang gia công
      const activeProduction = orders.filter(o => 
        (o.status === "Đang gia công" || o.status === "Chờ xử lý") && 
        (o.type === "Hàng mộc" || o.type === "Hàng khách đặt")
      );
      const count = activeProduction.length;
      if (count > 8) return { count, level: "Quá tải", buffer: 7, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      if (count > 4) return { count, level: "Khá bận", buffer: 3, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      return { count, level: "Bình thường", buffer: 0, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    } catch (e) { return { count: 0, level: "Bình thường", buffer: 0 }; }
  }, [activeTab.cartItems]);

  const needsWorkshop = useMemo(() => {
    return activeTab.cartItems.some(item => {
      if (item.priceMode === "raw") return false;
      return item.productType === "Hàng mộc" || 
             item.productType === "Hàng khách đặt" || 
             (item.leadTime && item.leadTime > 0);
    });
  }, [activeTab.cartItems]);

  const expectedReadyDate = useMemo(() => {
    if (!needsWorkshop || maxLeadTime === 0) return null;
    const totalDays = maxLeadTime + workshopStats.buffer;
    const d = new Date();
    d.setDate(d.getDate() + totalDays);
    return d.toISOString().split("T")[0];
  }, [maxLeadTime, workshopStats.buffer, needsWorkshop]);

  const totalPayable = Math.max(
    0,
    subtotal - activeTab.discount - activeTab.depositAmount,
  );
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    if (activeTab.cartItems.length === 0) return;

    if (!activeTab.selectedCustomer) {
      toast.error("Vui lòng nhập hoặc chọn Khách hàng trước khi thanh toán!");
      return;
    }

    // Validate: giao tận nơi nhưng chưa chọn ngày giao
    if (activeTab.deliveryMethod === "delivery" && !activeTab.deliveryDate) {
      toast.error("Vui lòng chọn ngày giao hàng!");
      return;
    }

    const newOrder = {
      code: "HD-" + Math.floor(Math.random() * 1000000),
      customer: {
        name: activeTab.selectedCustomer?.name,
        phone: activeTab.selectedCustomer?.phone || "",
        address: activeTab.selectedCustomer?.address || "",
      },
      type: activeTab.cartItems.some(i => i.productType === "Hàng mộc") ? "Hàng mộc" : "Hàng sẵn",
      salesPerson: "Nhân viên bán hàng",
      products: activeTab.cartItems.map((item) => ({
        name: item.name,
        material: item.category || "Hàng trưng bày",
        size: "",
        qty: item.quantity,
        price: item.price,
        warranty: item.isGift ? "Không bảo hành" : SYSTEM_WARRANTY,
        note: item.note || "",
        images: item.images || [],
        leadTime: item.leadTime || 0,
      })),
      total: totalPayable,
      subtotal: subtotal,
      discount: activeTab.discount,
      deposit: activeTab.depositAmount,
      leadTime: maxLeadTime,
      expectedReadyDate: expectedReadyDate,
      deliveryMethod: activeTab.deliveryMethod,
      // Hẹn ngày lấy hoặc lấy luôn (Hôm nay)
      deliveryDate:
        activeTab.deliveryMethod === "store"
          ? activeTab.storePickupDate || new Date().toISOString().split("T")[0]
          : activeTab.deliveryDate,
      storePickupDate:
        activeTab.deliveryMethod === "store"
          ? activeTab.storePickupDate || null
          : null,
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
      storePickupDate: "",
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

                      {/* Warranty – Read-only system config */}
                      {!item.isGift && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                          <ShieldCheck
                            size={12}
                            className="text-emerald-500 shrink-0"
                          />
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Bảo hành: {SYSTEM_WARRANTY}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* === Hàng mộc hoàn thiện: Giá cũ / Giá đã giảm + Upload ảnh === */}
                    {item.productType === "Hàng mộc" &&
                      item.priceMode === "finished" && (
                        <div className="mt-2 pl-11 space-y-2">
                          {/* Dual pricing */}

                          {/* Image upload */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {(item.images || []).map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group/img"
                              >
                                <img
                                  src={
                                    typeof img === "string"
                                      ? img
                                      : URL.createObjectURL(img)
                                  }
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() =>
                                    removeItemImage(item.id, imgIdx)
                                  }
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition cursor-pointer shadow"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition">
                              <ImagePlus size={18} className="text-gray-400" />
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.length) {
                                    updateItemImages(
                                      item.id,
                                      Array.from(e.target.files),
                                    );
                                  }
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
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
              className="px-4 py-3 space-y-3 border-t"
              style={{
                borderColor: "var(--grid-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-[12px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Giao hàng
                </p>
                {needsWorkshop && maxLeadTime > 0 && (
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${workshopStats.bg} ${workshopStats.color} ${workshopStats.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${workshopStats.level === 'Quá tải' ? 'bg-red-500' : workshopStats.level === 'Khá bận' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    Xưởng {workshopStats.level}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`deliveryMethod-${activeTab.id}`}
                    value="store"
                    checked={activeTab.deliveryMethod === "store"}
                    onChange={() =>
                      updateActiveTab({
                        deliveryMethod: "store",
                        deliveryDate: "",
                      })
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
                      updateActiveTab({
                        deliveryMethod: "delivery",
                        storePickupDate: "",
                      })
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

              {/* ── Lấy tại cửa hàng: date picker tùy chọn ── */}
              {activeTab.deliveryMethod === "store" && (
                <div
                  className="ml-1 pl-4 space-y-2"
                  style={{ borderLeft: "2px solid var(--grid-border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[12.5px] shrink-0"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Ngày hẹn lấy:
                    </span>
                    <div className="relative flex-1">
                      <Calendar
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-placeholder)" }}
                      />
                      <input
                        type="date"
                        value={activeTab.storePickupDate || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          updateActiveTab({
                            storePickupDate: e.target.value,
                          })
                        }
                        className="w-full text-[12.5px] pl-8 pr-2 py-1.5 focus:outline-none focus:ring-1 rounded-lg bg-white"
                        style={{
                          border: "1px solid var(--grid-border)",
                          color: "var(--text-main)",
                        }}
                      />
                    </div>
                  </div>
                  <p
                    className="text-[11px] italic"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    {activeTab.storePickupDate
                      ? `Khách hẹn lấy tại cửa hàng ngày ${activeTab.storePickupDate.split("-").reverse().join("/")}`
                      : "Để trống nếu khách lấy ngay tại cửa hàng"}
                  </p>
                  {expectedReadyDate && (
                    <p className={`text-[10px] font-bold flex items-center gap-1 ml-1 ${workshopStats.buffer > 0 ? 'text-amber-600 animate-pulse' : 'text-blue-600'}`}>
                      <AlertCircle size={10} />
                      Gợi ý xưởng xong: {expectedReadyDate.split("-").reverse().join("/")} 
                      {workshopStats.buffer > 0 && ` (+${workshopStats.buffer}n chờ xưởng)`}
                    </p>
                  )}
                </div>
              )}

              {/* ── Giao tận nơi — date picker ── */}
              {activeTab.deliveryMethod === "delivery" && (
                <div className="flex items-center gap-2 mt-1">
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
                      min={new Date().toISOString().split("T")[0]}
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
                  {expectedReadyDate && (
                    <p className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${workshopStats.buffer > 0 ? 'text-amber-600 animate-pulse' : 'text-blue-600'}`}>
                      <AlertCircle size={10} />
                      Gợi ý xưởng xong: {expectedReadyDate.split("-").reverse().join("/")} 
                      {workshopStats.buffer > 0 && ` (+${workshopStats.buffer}n chờ xưởng)`}
                    </p>
                  )}
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

            {/* Toggle chọn loại giá cho Hàng mộc */}
            {productTypeTab === "Hàng mộc" && (
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{
                  border: "1px solid var(--grid-border)",
                  backgroundColor: "var(--bg-main)",
                }}
              >
                <button
                  onClick={() => setWoodPriceMode("finished")}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      woodPriceMode === "finished"
                        ? "var(--brand-primary)"
                        : "transparent",
                    color:
                      woodPriceMode === "finished"
                        ? "#fff"
                        : "var(--text-secondary)",
                  }}
                >
                  <PackageCheck size={14} />
                  Giá hoàn thiện
                </button>
                <button
                  onClick={() => setWoodPriceMode("raw")}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      woodPriceMode === "raw"
                        ? "var(--brand-primary)"
                        : "transparent",
                    color:
                      woodPriceMode === "raw"
                        ? "#fff"
                        : "var(--text-secondary)",
                  }}
                >
                  <Hammer size={14} />
                  Giá thô
                </button>
              </div>
            )}

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
                          {product.leadTime > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> Hoàn thiện: {product.leadTime} ngày
                            </span>
                          )}
                        </div>
                        {product.discount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] line-through text-gray-400">
                              {fmt(
                                product.productType === "Hàng mộc" &&
                                  woodPriceMode === "finished"
                                  ? Math.round(
                                      product.price * WOOD_FINISHING_RATE,
                                    )
                                  : product.price,
                              )}
                              đ
                            </span>
                            <span
                              className="text-[13px] font-bold"
                              style={{ color: "#EF4444" }}
                            >
                              {fmt(
                                Math.round(
                                  (product.productType === "Hàng mộc" &&
                                  woodPriceMode === "finished"
                                    ? product.price * WOOD_FINISHING_RATE
                                    : product.price) *
                                    (1 - product.discount / 100),
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
                            {product.productType === "Hàng mộc"
                              ? fmt(
                                  woodPriceMode === "finished"
                                    ? Math.round(
                                        product.price * WOOD_FINISHING_RATE,
                                      )
                                    : product.price,
                                )
                              : fmt(product.price)}
                            đ
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Màu sắc
                      </p>
                      <p className="text-[13px] font-semibold text-gray-700 mt-0.5">
                        {selectedProductForView.productType === "Hàng mộc"
                          ? "Nguyên mộc"
                          : selectedProductForView.color || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Kích thước
                      </p>
                      <p
                        className="text-[13px] font-semibold text-gray-700 mt-0.5 truncate"
                        title={(() => {
                          const match = selectedProductForView.description?.match(
                            /Kích thước[:\s]([^\.]+)/i,
                          );
                          return match ? match[1].trim() : "—";
                        })()}
                      >
                        {(() => {
                          const match = selectedProductForView.description?.match(
                            /Kích thước[:\s]([^\.]+)/i,
                          );
                          return match ? match[1].trim() : "—";
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Danh mục
                    </p>
                    <p className="text-[13px] font-semibold text-gray-700 mt-0.5">
                      {selectedProductForView.category || "—"}
                    </p>
                  </div>

                  {selectedProductForView.discount > 0 ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-left">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        {selectedProductForView.productType === "Hàng mộc"
                          ? woodPriceMode === "finished"
                            ? "Giá hoàn thiện"
                            : "Giá thô"
                          : "Giá niêm yết"}{" "}
                        (Giảm {selectedProductForView.discount}%)
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[14px] line-through text-emerald-600/60 font-medium">
                          {fmt(
                            selectedProductForView.productType === "Hàng mộc" &&
                              woodPriceMode === "finished"
                              ? Math.round(
                                  selectedProductForView.price *
                                    WOOD_FINISHING_RATE,
                                )
                              : selectedProductForView.price,
                          )}
                          đ
                        </span>
                        <span className="text-[20px] font-black text-red-600">
                          {fmt(
                            Math.round(
                              (selectedProductForView.productType ===
                                "Hàng mộc" && woodPriceMode === "finished"
                                ? selectedProductForView.price *
                                  WOOD_FINISHING_RATE
                                : selectedProductForView.price) *
                                (1 - selectedProductForView.discount / 100),
                            ),
                          )}
                          đ
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-left">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        {selectedProductForView.productType === "Hàng mộc"
                          ? woodPriceMode === "finished"
                            ? "Giá hoàn thiện"
                            : "Giá thô"
                          : "Giá niêm yết"}
                      </p>
                      <p className="text-[20px] font-black text-emerald-700 mt-0.5">
                        {fmt(
                          selectedProductForView.productType === "Hàng mộc" &&
                            woodPriceMode === "finished"
                            ? Math.round(
                                selectedProductForView.price *
                                  WOOD_FINISHING_RATE,
                              )
                            : selectedProductForView.price,
                        )}
                        đ
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <Package size={14} className="text-amber-600" />
                    <span className="text-[13px] font-bold text-amber-700">
                      Tồn kho: {selectedProductForView.stock} sản phẩm
                    </span>
                  </div>

                  {selectedProductForView.description && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
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
