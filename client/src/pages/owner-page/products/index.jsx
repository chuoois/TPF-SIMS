/**
 * Component OwnerProducts
 * Quản lý Sản phẩm — Cửa hàng Nội thất Gỗ
 *
 * Designed following Kiotviet/MISA layout: 1 unified list, 5 statuses, category & material filtering.
 */

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Package,
  PackageCheck,
  Pencil,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Power,
  Ban,
  Filter,
  Gift,
  TreePine,
  Box,
  Ruler,
  Banknote,
  Info,
  Armchair,
  Bed,
  Lock,
  Monitor,
  Utensils,
  Palette,
  Flower2,
  Briefcase,
  Clock,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";

// ===================== STATIC DATA =====================
const CATEGORIES = [
  "Phòng khách",
  "Phòng thờ",
  "Phòng ngủ",
  "Trang trí",
  "Phòng làm việc",
  "Phòng ăn",
];

const WOOD_TYPES = [
  "Gỗ Hương",
  "Gỗ Gụ",
  "Gỗ Mít",
  "Gỗ Trắc",
  "Gỗ Gõ đỏ",
  "Gỗ Sồi",
  "Gỗ Óc chó",
];

const OTHER_MATERIALS = ["Đồng vàng", "Gốm sứ"];

const COLORS = ["Cánh gián", "Hạt dẻ", "Mun", "Tự nhiên", "Sơn PU", "Để mộc"];

const PRODUCT_STATUSES = [
  "Chưa định giá",
  "Hàng sẵn",
  "Hàng mộc",
  "Hàng khách đặt",
  "Hết hàng",
  "Ngừng kinh doanh",
  "Quà tặng",
];

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
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300",
    description: "Sập thờ trạm khắc tỉ mỉ tinh xảo, chất liệu gỗ mít lõi liền khối.",
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
    rawRetailPrice: 10500000,
    finishedRetailPrice: 13500000,
    unit: "Chiếc",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 3,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300",
    description: "Hàng mộc sẵn tại kho, chờ sơn hoàn thiện.",
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
  // --- BỔ SUNG HÀNG MỘC ---
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
    rawRetailPrice: 35000000,
    finishedRetailPrice: 42000000,
    unit: "Chiếc",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 2,
    isPriced: true,
    img: "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=300",
    description: "Hàng mộc đục tay kỹ, gỗ gụ chọn lọc không rác.",
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
    status: "Ngừng kinh doanh",
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

const INITIAL_INVENTORY_LOGS = [
  {
    id: "LOG001",
    timestamp: "2026-03-17T14:30:00",
    type: "Nhập kho",
    productName: "Sập thờ Mai Điểu chân 20",
    productCode: "ST-HS-197x107x108-Mit",
    productImg: "https://placehold.co/100x100?text=SapTho",
    change: +2,
    balance: 2,
    reference: "PN-2603-001",
    authorizedBy: "Kế toán (Linh)",
  },
  {
    id: "LOG002",
    timestamp: "2026-03-17T15:45:00",
    type: "Xuất bán",
    productName: "Tủ áo gỗ xoan đào (Hàng mộc)",
    productCode: "TA-HM-160x200x55-XoanDao",
    productImg: "https://placehold.co/100x100?text=TuAoTho",
    change: -1,
    balance: 3,
    reference: "DH-2603-0012",
    authorizedBy: "NV. Bán hàng",
  },
  {
    id: "LOG003",
    timestamp: "2026-03-17T16:20:00",
    type: "Kiểm kho",
    productName: "Sofa nguyên khối chữ L (Mộc)",
    productCode: "SF-HS-260x180x85-GoDo",
    productImg: "https://placehold.co/100x100?text=Sofa",
    change: -1,
    balance: 5,
    reference: "Kiểm kho định kỳ",
    authorizedBy: "Bác chủ (Admin)",
    note: "Hàng bị xước sơn, chuyển kho bảo hành",
  },
  {
    id: "LOG004",
    timestamp: "2026-03-16T09:00:00",
    type: "Nhập kho",
    productName: "Lộc bình cao 1m8",
    productCode: "LB-HS-180m-Huong",
    productImg: null,
    change: +1,
    balance: 1,
    reference: "PN-2603-002",
    authorizedBy: "Kế toán (Linh)",
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

const MarginDisplay = ({ cost, price, label = "Lợi nhuận" }) => {
  if (!price || price <= 0) return null;
  const profit = price - cost;
  const margin = (profit / price) * 100;
  
  let colorClass = "text-red-500";
  if (margin >= 30) colorClass = "text-emerald-600";
  else if (margin >= 15) colorClass = "text-amber-600";
  
  return (
    <div className="mt-1.5 flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] font-bold ${colorClass}`}>
          {label}: {fmtCurrency(profit)}
        </span>
        <span className="text-gray-300">|</span>
        <span className={`text-[11px] font-black ${colorClass}`}>
          {margin.toFixed(1)}%
        </span>
      </div>
      {margin < 15 && (
        <span className="text-[10px] font-bold text-red-400 italic">Biên thấp!</span>
      )}
    </div>
  );
};

const ProfitabilityIndicator = ({ cost, profit }) => {
  if (!cost || cost <= 0) return null;
  
  // If price is 0, profit will be exactly -cost. Show "Chờ định giá" instead of -100%
  if (Math.abs(profit + cost) < 1) {
    return (
      <div className="flex flex-col items-end opacity-30">
        <div className="text-[10px] font-bold uppercase text-gray-400">Chờ định giá</div>
        <div className="text-[14px] font-black text-gray-300">--%</div>
      </div>
    );
  }

  const roi = (profit / cost) * 100;
  
  // Only show if it's "Good" (>= 50%)
  if (roi < 50) return null;

  return (
    <div className="flex flex-col items-end">
      <div className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
        Tỷ suất Tốt
      </div>
      <div className="text-[14px] font-black text-emerald-600">
        {roi.toFixed(1)}%
      </div>
    </div>
  );
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
    case "Ngừng kinh doanh":
      return { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" }; // Gray
    default:
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

// ===================== SUB-COMPONENTS =====================

const CategoriesTab = ({ categories, onAdd, onEdit, onDelete }) => {
  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("phòng khách"))
      return <Armchair size={18} className="text-orange-500" />;
    if (n.includes("phòng thờ"))
      return <Monitor size={18} className="text-red-500" />;
    if (n.includes("phòng ngủ"))
      return <Bed size={18} className="text-blue-500" />;
    if (n.includes("trang trí"))
      return <Flower2 size={18} className="text-purple-500" />;
    if (n.includes("làm việc"))
      return <Briefcase size={18} className="text-gray-600" />;
    if (n.includes("phòng ăn") || n.includes("bếp"))
      return <Utensils size={18} className="text-emerald-500" />;
    return <Box size={18} className="text-blue-500" />;
  };

  return (
    <div
      className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "var(--grid-border)" }}
      >
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">
            Danh mục sản phẩm
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
            Quản lý các nhóm hàng hóa trong kho
          </p>
        </div>
        <button
          onClick={onAdd}
          className="h-9 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 shadow-sm"
          style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left relative text-[13px]">
          <thead
            className="sticky top-0 z-10"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 w-16">
                STT
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Tên nhóm
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center w-32">
                Số hàng
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c, i) => (
              <tr
                key={c}
                className="hover:bg-gray-50/50 transition-colors group"
                style={{ borderBottom: "1px solid var(--grid-border)" }}
              >
                <td className="px-6 py-4 font-medium text-gray-400">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(c)}
                    </div>
                    <span className="font-bold text-gray-900 text-[14px]">
                      {c}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
                    10 món
                  </span>
                </td>
                <td className="px-6 py-4 relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end gap-1.5 translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => onEdit(c)}
                      className="h-8 px-3 text-[12px] font-bold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-200 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <Pencil size={14} /> Sửa
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="h-8 px-3 text-[12px] font-bold text-gray-600 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <X size={14} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PropertiesTab = ({
  woods,
  onAddWood,
  onEditWood,
  onDeleteWood,
  otherMaterials,
  onAddOtherMaterial,
  onEditOtherMaterial,
  onDeleteOtherMaterial,
  colors,
  onAddColor,
  onEditColor,
  onDeleteColor,
}) => {
  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* 1. CHẤT LIỆU (Gỗ & Khác) */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Nhóm Gỗ */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-5 py-3 border-b flex items-center justify-between shrink-0 bg-gray-50/50">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900">Chất liệu Gỗ</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Các loại gỗ tự nhiên</p>
            </div>
            <button onClick={onAddWood} className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-bold bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm">
              <Plus size={14} /> Thêm loại gỗ
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[250px]">
            <table className="w-full text-left text-[13px]">
              <tbody className="divide-y divide-gray-50">
                {woods.map((w, i) => (
                  <tr key={w} className="hover:bg-gray-50/30 group transition-colors">
                    <td className="px-5 py-2.5 font-medium text-gray-400 w-10">{i + 1}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <TreePine size={14} className="text-emerald-600" />
                        <span className="font-bold text-gray-700">{w}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEditWood(w)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"><Pencil size={13} /></button>
                        <button onClick={() => onDeleteWood(w)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"><X size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chất liệu khác */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-5 py-3 border-b flex items-center justify-between shrink-0 bg-gray-50/50">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900">Chất liệu khác</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Da, đá, kính, đồng...</p>
            </div>
            <button onClick={onAddOtherMaterial} className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-bold bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm">
              <Plus size={14} /> Thêm
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[250px]">
            <table className="w-full text-left text-[13px]">
              <tbody className="divide-y divide-gray-50">
                {otherMaterials.map((m, i) => (
                  <tr key={m} className="hover:bg-gray-50/30 group transition-colors">
                    <td className="px-5 py-2.5 font-medium text-gray-400 w-10">{i + 1}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Box size={14} className="text-blue-500" />
                        <span className="font-bold text-gray-700">{m}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEditOtherMaterial(m)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"><Pencil size={13} /></button>
                        <button onClick={() => onDeleteOtherMaterial(m)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"><X size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. NGOẠI QUAN (Màu sắc) */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Màu sắc */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-5 py-3 border-b flex items-center justify-between shrink-0 bg-gray-50/50">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900">Màu sắc</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Màu sơn hoàn thiện</p>
            </div>
            <button onClick={onAddColor} className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-bold bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm">
              <Plus size={14} /> Thêm màu
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-[13px]">
              <tbody className="divide-y divide-gray-50">
                {colors.map((c, i) => (
                  <tr key={c} className="hover:bg-gray-50/30 group transition-colors">
                    <td className="px-5 py-2.5 font-medium text-gray-400 w-10">{i + 1}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: c.toLowerCase().includes("gián") ? "#8B4513" : c.toLowerCase().includes("mun") ? "#1a1a1a" : "#DEB887" }} />
                        <span className="font-bold text-gray-700">{c}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEditColor(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"><Pencil size={13} /></button>
                        <button onClick={() => onDeleteColor(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"><X size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== COMPONENT =====================
export default function OwnerProducts() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [inventoryLogs, setInventoryLogs] = useState(INITIAL_INVENTORY_LOGS);

  // Filter States
  const [activeTab, setActiveTab] = useState("products"); // products | categories | properties | inventory_log
  const [searchQuery, setSearchQuery] = useState("");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [materialFilter, setMaterialFilter] = useState("Tất cả");

  // Mock State for Cats & Props
  const [categories, setCategories] = useState(CATEGORIES);
  const [woods, setWoods] = useState(WOOD_TYPES);
  const [otherMaterials, setOtherMaterials] = useState(OTHER_MATERIALS);
  const [colors, setColors] = useState(COLORS);

  // Simple Input Modal State
  const [simpleModal, setSimpleModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    value: "",
    originalValue: null,
  });

  const handleOpenSimpleModal = (type, title, originalValue = null) => {
    setSimpleModal({
      isOpen: true,
      type,
      title,
      value: originalValue || "",
      originalValue,
    });
  };

  const handleSaveSimpleModal = () => {
    if (!simpleModal.value.trim()) return;
    const { type, value, originalValue } = simpleModal;

    if (type === "category") {
      if (originalValue) {
        setCategories(categories.map((c) => (c === originalValue ? value : c)));
      } else {
        setCategories([...categories, value]);
      }
    } else if (type === "wood") {
      if (originalValue) {
        setWoods(woods.map((w) => (w === originalValue ? value : w)));
      } else {
        setWoods([...woods, value]);
      }
    } else if (type === "material") {
      if (originalValue) {
        setOtherMaterials(otherMaterials.map((m) => (m === originalValue ? value : m)));
      } else {
        setOtherMaterials([...otherMaterials, value]);
      }
    } else if (type === "color") {
      if (originalValue) {
        setColors(colors.map((c) => (c === originalValue ? value : c)));
      } else {
        setColors([...colors, value]);
      }
    }
    setSimpleModal({
      isOpen: false,
      type: "",
      title: "",
      value: "",
      originalValue: null,
    });
  };

  const handleDeleteCategory = (c) => {
    if (products.some((p) => p.category === c)) {
      alert(`Không thể xóa nhóm "${c}" vì đang có sản phẩm thuộc nhóm này.`);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm "${c}"?`)) {
      setCategories(categories.filter((x) => x !== c));
    }
  };

  const handleDeleteWood = (w) => {
    if (products.some((p) => p.material === w)) {
      alert(`Không thể xóa loại gỗ "${w}" vì đang có sản phẩm thuộc loại này.`);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa loại gỗ "${w}"?`)) {
      setWoods(woods.filter((x) => x !== w));
    }
  };

  const handleDeleteMaterial = (m) => {
    if (products.some((p) => p.material === m)) {
      alert(
        `Không thể xóa chất liệu "${m}" vì đang có sản phẩm sử dụng chất liệu này.`,
      );
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa chất liệu "${m}"?`)) {
      setOtherMaterials(otherMaterials.filter((x) => x !== m));
    }
  };

  const handleDeleteColor = (c) => {
    if (products.some((p) => p.color === c)) {
      alert(
        `Không thể xóa màu sắc "${c}" vì đang có sản phẩm áp dụng màu này.`,
      );
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa màu sắc "${c}"?`)) {
      setColors(colors.filter((x) => x !== c));
    }
  };


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [costPrice, setCostPrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [rawRetailPrice, setRawRetailPrice] = useState(0);
  const [finishedRetailPrice, setFinishedRetailPrice] = useState(0);
  const [productType, setProductType] = useState("Hàng sẵn");
  const [productCategory, setProductCategory] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState(12);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftItem, setGiftItem] = useState(null);

  // Actions
  const toggleStatus = (id, newStatus) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (newStatus === "Ngừng kinh doanh") {
      if (product.productType === "Hàng mộc" || product.productType === "Hàng khách đặt") {
        toast.error(`Không thể ngừng kinh doanh sản phẩm loại "${product.productType}" khi đang trong quá trình sản xuất/hoàn thiện.`);
        return;
      }
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
    toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
  };

  const handleOpenEdit = (product, e) => {
    e.stopPropagation();
    setEditItem(product);
    setCostPrice(product.costPrice || 0);
    setRetailPrice(product.retailPrice || 0);
    setRawRetailPrice(product.rawRetailPrice || 0);
    setFinishedRetailPrice(product.finishedRetailPrice || 0);
    setProductType(product.productType || "Hàng sẵn");
    setProductCategory(product.category || "");
    setWarrantyMonths(product.warrantyMonths || 12);
    setShowAddEditModal(true);
  };

  const handleOpenDetail = (product, e) => {
    e.stopPropagation();
    setDetailItem(product);
    setShowDetailModal(true);
  };

  const handleOpenGift = (product, e) => {
    e.stopPropagation();
    setGiftItem(product);
    setShowGiftModal(true);
  };

  // Filter logic
  const statusCounts = useMemo(() => {
    const counts = {
      "Tất cả": products.length,
      "Hàng sẵn": 0,
      "Đặt theo mẫu": 0,
      "Hết hàng": 0,
      "Ngừng kinh doanh": 0,
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
    if (categoryFilter !== "Tất cả") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (materialFilter !== "Tất cả") {
      result = result.filter((p) => p.material === materialFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, statusFilter, categoryFilter, materialFilter, searchQuery]);

  const filteredLogs = useMemo(() => {
    let result = inventoryLogs;

    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.productName.toLowerCase().includes(q) ||
          l.productCode.toLowerCase().includes(q) ||
          l.reference.toLowerCase().includes(q) ||
          l.authorizedBy.toLowerCase().includes(q),
      );
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [inventoryLogs, logSearchQuery]);

  const hasActiveFilters =
    categoryFilter !== "Tất cả" ||
    materialFilter !== "Tất cả" ||
    searchQuery;

  const clearFilters = () => {
    setCategoryFilter("Tất cả");
    setMaterialFilter("Tất cả");
    setSearchQuery("");
  };

  useEffect(() => {
    setTimeout(() => setCurrentPage(1), 0);
  }, [searchQuery, statusFilter, categoryFilter, materialFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSaveAddEdit = () => {
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
          newStatus = "Đặt theo mẫu";
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
                productType,
                category: productCategory,
                warrantyMonths: Number(warrantyMonths),
                isPriced: true,
                status: newStatus,
              }
            : p,
        ),
      );
      toast.success("Đã cập nhật thông tin sản phẩm và định giá thành công!");
    } else {
      // Simple mock for adding new product
      toast.success("Đã thêm sản phẩm mới thành công!");
    }
    setShowAddEditModal(false);
  };

  // 1. ADD / EDIT MODAL (Simplified mock form)
  const renderAddEditModal = () => {
    if (!showAddEditModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/80">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              {editItem?.status === "Chưa định giá" ? (
                <span className="flex items-center gap-2 text-red-600">
                  <Banknote size={20} /> Định giá sản phẩm mới
                </span>
              ) : editItem ? (
                "Sửa sản phẩm"
              ) : (
                "Thêm mới sản phẩm"
              )}
            </h2>
            <button
              onClick={() => setShowAddEditModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column: Image & Barcode */}
              <div className="col-span-1 space-y-4">
                <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer relative overflow-hidden group">
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
                        className="text-gray-400 mb-2 group-hover:text-blue-500 transition-colors"
                      />
                      <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Info size={14} /> Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Mã SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: BBG-HS-1.8x0.9x0.75-Huong"
                        defaultValue={editItem?.code || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nhập tên sản phẩm"
                        defaultValue={editItem?.name || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Danh mục sản phẩm{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                      >
                        <option value="">Chọn danh mục SP</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Đơn vị tính
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: Chiếc, Bộ"
                        defaultValue={editItem?.unit || ""}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Mô tả chi tiết
                    </label>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                      placeholder="Nhập mô tả sản phẩm..."
                      defaultValue={editItem?.description || ""}
                    ></textarea>
                  </div>
                </div>

                {/* Section 2: Thuộc tính hàng mộc */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Chất liệu
                      </label>
                      <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Chọn loại gỗ hoặc chất liệu</option>
                        <optgroup label="Chất liệu Gỗ">
                          {woods.map((w) => (
                            <option
                              key={w}
                              value={w}
                              selected={editItem?.material === w}
                            >
                              {w}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Vật liệu phối hợp">
                          {otherMaterials.map((m) => (
                            <option
                              key={m}
                              value={m}
                              selected={editItem?.material === m}
                            >
                              {m}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Màu sắc
                      </label>
                      <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Chọn màu sắc</option>
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
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Kích thước (D×R×C) (cm)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Dài x Rộng x Cao (cm)"
                        defaultValue={editItem?.dimensions || ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Thương mại */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block">
                          Giá nhập (đ)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-[15px] font-black outline-none bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={formatNumberInput(costPrice)}
                            onChange={(e) => {
                              const val = parseNumberInput(e.target.value);
                              setCostPrice(val === "" ? 0 : Number(val));
                            }}
                            placeholder="0"
                          />
                        </div>
                    </div>

                    {productType === "Hàng mộc" ? (
                      <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
                          <div className="p-3 rounded-xl border-2 border-orange-100 space-y-2 bg-orange-50/20">
                            <label className="block text-xs font-bold text-orange-700">Giá bán MỘC (đ)</label>
                            <input
                              type="text"
                              className="w-full border-none p-0 text-lg font-black text-orange-600 bg-transparent outline-none"
                              value={formatNumberInput(rawRetailPrice)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setRawRetailPrice(val === "" ? 0 : Number(val));
                              }}
                            />
                            <div className="flex items-center justify-between border-t border-orange-100 pt-2">
                              <MarginDisplay cost={costPrice} price={rawRetailPrice} label="Lợi nhuận gộp" />
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border-2 border-emerald-100 space-y-2 bg-emerald-50/20">
                            <label className="block text-xs font-bold text-emerald-700">Giá bán HOÀN THIỆN (đ)</label>
                            <input
                              type="text"
                              className="w-full border-none p-0 text-lg font-black text-emerald-600 bg-transparent outline-none"
                              value={formatNumberInput(finishedRetailPrice)}
                              onChange={(e) => {
                                const val = parseNumberInput(e.target.value);
                                setFinishedRetailPrice(val === "" ? 0 : Number(val));
                              }}
                            />
                            <div className="flex items-center justify-between border-t border-emerald-100 pt-2">
                              <MarginDisplay cost={costPrice} price={finishedRetailPrice} label="Lợi nhuận gộp" />
                            </div>
                          </div>
                      </div>
                    ) : (
                      <div className="col-span-2 p-4 border-2 border-blue-100 rounded-2xl bg-blue-50/30 space-y-3">
                        <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider">Giá bán lẻ (đ)</label>
                        <input
                          type="text"
                          className="w-full border-none p-0 text-3xl font-black text-blue-600 bg-transparent outline-none"
                          value={formatNumberInput(retailPrice)}
                          onChange={(e) => {
                            const val = parseNumberInput(e.target.value);
                            setRetailPrice(val === "" ? 0 : Number(val));
                          }}
                          placeholder="0"
                        />
                        <div className="flex items-center justify-between border-t border-blue-100 pt-3">
                          <MarginDisplay cost={costPrice} price={retailPrice} label="Lãi dự kiến" />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Loại sản phẩm
                      </label>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                      >
                        <option value="Hàng sẵn">Hàng sẵn</option>
                        <option value="Hàng mộc">Hàng mộc</option>
                        <option value="Hàng khách đặt">Hàng khách đặt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                        <ShieldCheck size={14} className="text-blue-500" />
                        Bảo hành (tháng)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={warrantyMonths}
                        onChange={(e) => setWarrantyMonths(e.target.value)}
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tồn kho ban đầu
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                        defaultValue={editItem ? editItem.stock : 0}
                        disabled={editItem?.productType === "Hàng khách đặt"}
                        title="Hàng khách đặt không quản lý kho theo mẫu"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50/80">
            <button
              onClick={() => setShowAddEditModal(false)}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSaveAddEdit}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform active:scale-95 ${editItem?.status === "Chưa định giá" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <Banknote size={16} />
              {editItem?.status === "Chưa định giá" ? "Xác nhận định giá & Mở bán" : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 2. GIFT MODAL
  const renderGiftModal = () => {
    if (!showGiftModal || !giftItem) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Chuyển thành Quà tặng?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn chuyển sản phẩm{" "}
              <strong>"{giftItem.name}"</strong> thành Quà tặng không? Các sản
              phẩm quà tặng sẽ không được bán trực tiếp mà dùng để tặng kèm đơn
              hàng khác.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowGiftModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  toggleStatus(giftItem.id, "Quà tặng");
                  setShowGiftModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition cursor-pointer"
              >
                Chuyển đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. DETAIL MODAL
  const renderDetailModal = () => {
    if (!showDetailModal || !detailItem) return null;
    const sc = getStatusConfig(detailItem.status);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Chi tiết sản phẩm
              <span className="text-blue-600 font-mono text-sm tracking-wider px-2 py-0.5 bg-blue-50 rounded-md ml-2">
                {detailItem.code}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {detailItem?.status === "Chưa định giá" ? (
                <>
                  <button
                    onClick={(e) => {
                      setShowDetailModal(false);
                      handleOpenEdit(detailItem, e);
                    }}
                    className="h-8 px-3 rounded-lg text-[12px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={(e) => {
                      setShowDetailModal(false);
                      handleOpenEdit(detailItem, e);
                    }}
                    className="h-8 px-3 rounded-lg text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Banknote size={14} />
                    Định giá ngay
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    setShowDetailModal(false);
                    handleOpenEdit(detailItem, e);
                  }}
                  className="h-8 px-3 rounded-lg text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Pencil size={14} />
                  Sửa
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex gap-6">
              <div className="w-1/3 shrink-0 space-y-3">
                {detailItem.img ? (
                  <img
                    src={detailItem.img}
                    alt={detailItem.name}
                    className="w-full aspect-square object-cover rounded-xl border"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 rounded-xl border flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={40} className="mb-2" />
                    <span className="text-sm">Chưa có ảnh</span>
                  </div>
                )}

                <div className="flex justify-center">
                  <span
                    className="inline-flex items-center px-3 py-1 text-[13px] font-bold rounded-lg"
                    style={{
                      backgroundColor: sc.bg,
                      color: sc.text,
                      border: `1px solid ${sc.border}`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: sc.text }}
                    />
                    Trạng thái: {detailItem.status}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                      {detailItem.name}
                    </h1>
                    <p className="text-sm text-gray-500">{detailItem.category}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Mã SKU</span>
                    <span className="text-[13px] font-bold font-mono text-blue-600">
                      {detailItem.code}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Phân loại
                    </span>
                    <span className="font-semibold text-gray-900">
                      {detailItem.productType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Chất liệu</span>
                    <span className="font-semibold text-gray-900">
                      {detailItem.material}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Màu sắc</span>
                    <span className="font-semibold text-gray-900">
                      {detailItem.color}
                    </span>
                  </div>
                  {detailItem.status !== "Chưa định giá" && (
                    <div>
                      <span className="text-gray-500 block text-xs italic">Bảo hành</span>
                      <span className="font-bold text-blue-700 flex items-center gap-1">
                        <ShieldCheck size={14} /> {detailItem.warrantyMonths || 12} tháng
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Kích thước
                    </span>
                    <span className="font-semibold text-gray-900">
                      {detailItem.dimensions}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl grid grid-cols-2 gap-4">
                  {detailItem.productType === "Hàng mộc" ? (
                    <>
                      <div>
                        <span className="text-gray-500 block text-xs mb-1">
                          Giá bán mộc
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          {fmtCurrency(detailItem.rawRetailPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs mb-1">
                          Giá bán hoàn thiện
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {fmtCurrency(detailItem.finishedRetailPrice)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">
                        Giá bán lẻ
                      </span>
                      <span className={`text-lg font-bold ${detailItem.status === "Chưa định giá" ? "text-red-500" : "text-blue-600"}`}>
                        {detailItem.status === "Chưa định giá" ? "Chờ định giá" : fmtCurrency(detailItem.retailPrice)}
                      </span>
                    </div>
                  )}
                  {detailItem.costPrice && (
                    <div className={detailItem.productType === "Hàng mộc" ? "col-span-2 border-t pt-2" : ""}>
                      <span className="text-gray-500 block text-xs mb-1">
                        Giá nhập (vốn)
                      </span>
                      <span className="text-[15px] font-bold text-gray-700">
                        {fmtCurrency(detailItem.costPrice)}
                      </span>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-gray-100 mt-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">
                        Tồn kho hiện tại
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {detailItem.productType === "Hàng khách đặt"
                          ? "—"
                          : detailItem.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block text-xs font-semibold mb-1">
                    Mô tả chi tiết
                  </span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">
                    {detailItem.description || "Chưa có mô tả."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===================== MAIN UI =====================
  return (
    <>
      <PageHelmet title="Quản lý sản phẩm | TPF-SIMS" />

      {renderAddEditModal()}
      {renderDetailModal()}
      {renderGiftModal()}

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý danh mục hàng hóa
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {activeTab === "products"
                ? `${filteredProducts.length} sản phẩm`
                : activeTab === "categories"
                  ? `${categories.length} danh mục`
                  : `${woods.length + otherMaterials.length + colors.length} thuộc tính`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* SUB-NAVIGATION TABS */}
            <div
              className="flex p-1 rounded-xl"
              style={{
                backgroundColor: "var(--grid-header-bg)",
                border: "1px solid var(--grid-border)",
              }}
            >
              {[
                { id: "products", label: "Danh sách sản phẩm" },
                { id: "categories", label: "Danh mục" },
                { id: "properties", label: "Thuộc tính" },
                { id: "inventory_log", label: "Nhật ký kho" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      activeTab === tab.id ? "#fff" : "transparent",
                    color:
                      activeTab === tab.id
                        ? "var(--text-main)"
                        : "var(--text-secondary)",
                    boxShadow:
                      activeTab === tab.id
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2"></div>
          </div>
        </div>

        {activeTab === "products" && (
          <>
            {/* STATUS BAR FILTER */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap px-1">
              {["Tất cả", ...PRODUCT_STATUSES].map((s) => {
                const isActive = statusFilter === s;
                const sc = s !== "Tất cả" ? getStatusConfig(s) : null;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
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
                      border: isActive
                        ? `1.5px solid ${sc ? sc.border : "var(--grid-border)"}`
                        : "1.5px solid transparent",
                    }}
                  >
                    {s !== "Tất cả" && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: sc
                            ? sc.text
                            : "var(--text-secondary)",
                          opacity: isActive ? 1 : 0.5,
                        }}
                      />
                    )}
                    {s}
                    <span className="text-[11px] opacity-70 bg-black/5 px-1.5 rounded-md ml-1">
                      {statusCounts[s] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH & FILTER LIST CARD */}
            <div
              className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {/* Search Header */}
              <div
                className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3"
                style={{ borderColor: "var(--grid-border)" }}
              >
                <div className="relative w-full max-w-md shrink-0">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Theo mã SKU, tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                    style={{
                      border: "1px solid var(--grid-border)",
                      backgroundColor: "var(--bg-main)",
                      color: "var(--text-main)",
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Filter
                      size={14}
                      style={{ color: "var(--text-placeholder)" }}
                    />

                    {/* Category Filter */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 px-3 pr-8 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                      style={{
                        border:
                          categoryFilter !== "Tất cả"
                            ? "1px solid var(--brand-primary)"
                            : "1px solid var(--grid-border)",
                        backgroundColor:
                          categoryFilter !== "Tất cả"
                            ? "var(--status-focus)"
                            : "var(--bg-main)",
                        color:
                          categoryFilter !== "Tất cả"
                            ? "var(--brand-primary)"
                            : "var(--text-main)",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 8px center",
                      }}
                    >
                      <option value="Tất cả">Danh mục sản phẩm</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* Material Filter */}
                    <select
                      value={materialFilter}
                      onChange={(e) => setMaterialFilter(e.target.value)}
                      className="h-9 px-3 pr-8 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                      style={{
                        border:
                          materialFilter !== "Tất cả"
                            ? "1px solid var(--brand-primary)"
                            : "1px solid var(--grid-border)",
                        backgroundColor:
                          materialFilter !== "Tất cả"
                            ? "var(--status-focus)"
                            : "var(--bg-main)",
                        color:
                          materialFilter !== "Tất cả"
                            ? "var(--brand-primary)"
                            : "var(--text-main)",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 8px center",
                      }}
                    >
                      <option value="Tất cả">Tất cả chất liệu</option>
                      <optgroup label="Chất liệu Gỗ">
                        {woods.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Vật liệu phối hợp">
                        {otherMaterials.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="h-9 px-3 rounded-lg text-[13px] font-medium flex-shrink-0 flex items-center gap-1.5 cursor-pointer transition hover:opacity-80"
                      style={{
                        color: "var(--status-error)",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                      }}
                    >
                      <X size={14} /> Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left relative text-[13px]">
                  <thead
                    className="sticky top-0 z-10"
                    style={{
                      backgroundColor: "var(--grid-header-bg)",
                      borderBottom: "1px solid var(--grid-border)",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center w-[50px]"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        STT
                      </th>
                      <th
                        className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Ảnh
                      </th>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Mã SKU
                      </th>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Tên sản phẩm
                      </th>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Chất liệu
                      </th>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Loại SP
                      </th>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Giá bán
                      </th>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Tồn
                      </th>
                      <th
                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedProducts.map((p, idx) => {
                      const sc = getStatusConfig(p.status);
                      const isStopped = p.status === "Ngừng kinh doanh";
                      return (
                        <tr
                          key={p.id}
                          onClick={(e) => handleOpenDetail(p, e)}
                          className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                          style={{
                            opacity: isStopped ? 0.6 : 1,
                            borderBottom: "1px solid var(--grid-border)",
                          }}
                        >
                          <td
                            className="px-4 py-4 text-center text-[13px] font-medium"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="px-6 py-4 w-16">
                            {p.img ? (
                              <img
                                src={p.img}
                                alt={p.name}
                                className="w-12 h-12 rounded-lg object-cover border bg-white shadow-sm"
                                style={{
                                  filter: isStopped
                                    ? "grayscale(100%)"
                                    : "none",
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 border text-gray-300">
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 leading-none shadow-sm">
                              <p
                                className="text-[12px] font-bold font-mono"
                                style={{ color: "var(--text-main)" }}
                              >
                                {p.code}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p
                              className="text-[13px] font-semibold text-gray-900 line-clamp-1 mb-0.5"
                              style={{
                                textDecoration: isStopped
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {p.name}
                            </p>
                            <span
                              className="text-[11px] font-medium"
                              style={{ color: "var(--text-placeholder)" }}
                            >
                              {p.category}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="text-gray-700 font-medium">
                                {p.material}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-[13px]">
                                {p.productType}
                              </span>
                              {p.status !== "Chưa định giá" && (
                                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-1 bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-100 self-start">
                                  <ShieldCheck size={10} /> BH: {p.warrantyMonths || 12}T
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {p.status === "Chưa định giá" ? (
                              <span className="text-[12px] font-bold text-red-500 italic">
                                Chờ định giá
                              </span>
                            ) : p.productType === "Hàng mộc" ? (
                              <div className="flex flex-col items-end">
                                <span className="text-[12px] font-bold text-orange-600">
                                  {fmtCurrency(p.rawRetailPrice)} (Mộc)
                                </span>
                                <span className="text-[12px] font-bold text-green-600">
                                  {fmtCurrency(p.finishedRetailPrice)} (HT)
                                </span>
                              </div>
                            ) : (
                              <p
                                className="text-[13px] font-bold"
                                style={{ color: "var(--text-main)" }}
                              >
                                {fmtCurrency(p.retailPrice)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {p.productType === "Hàng sẵn" ? (
                              <span
                                className={`font-bold ${p.stock === 0 ? "text-red-600" : "text-gray-900"}`}
                              >
                                {p.stock}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 relative">
                            <span
                              className="inline-flex items-center px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap"
                              style={{
                                backgroundColor: sc.bg,
                                color: sc.text,
                                border: `1px solid ${sc.border}`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full mr-1.5"
                                style={{ backgroundColor: sc.text }}
                              />
                              {p.status}
                            </span>

                            {/* Hover Actions */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none group-hover:pointer-events-auto">
                              <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100 pointer-events-auto">
                                {p.status === "Chưa định giá" ? (
                                  <>
                                    <button
                                      onClick={(e) => handleOpenEdit(p, e)}
                                      className="h-8 px-3 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold text-gray-700 border border-gray-200"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={(e) => handleOpenEdit(p, e)}
                                      className="h-8 px-3 rounded-lg flex items-center justify-center transition cursor-pointer bg-red-600 hover:bg-red-700 gap-1.5 text-[12px] font-bold text-white shadow-sm"
                                    >
                                      <Banknote size={14} />
                                      Định giá
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => handleOpenEdit(p, e)}
                                    className="h-8 px-3 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold text-gray-700"
                                  >
                                    Sửa
                                  </button>
                                )}

                                {p.status !== "Quà tặng" &&
                                  p.status !== "Ngừng kinh doanh" &&
                                  p.productType === "Hàng sẵn" &&
                                  p.status !== "Chưa định giá" && (
                                    <button
                                      onClick={(e) => handleOpenGift(p, e)}
                                      className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-purple-50 gap-1.5 text-[12px] font-bold text-purple-600"
                                    >
                                      Quà
                                    </button>
                                  )}

                                {p.status !== "Chưa định giá" && (
                                  p.status !== "Ngừng kinh doanh" ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleStatus(p.id, "Ngừng kinh doanh");
                                      }}
                                      className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-red-50 text-[12px] font-bold text-red-600"
                                    >
                                      Dừng
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleStatus(
                                          p.id,
                                          p.productType === "Hàng sẵn"
                                            ? p.stock > 0
                                              ? "Hàng sẵn"
                                              : "Hết hàng"
                                            : "Đặt theo mẫu",
                                        );
                                      }}
                                      className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-green-50 text-[12px] font-bold text-green-700"
                                    >
                                      Mở
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {paginatedProducts.length === 0 && (
                      <tr>
                        <td colSpan="9" className="py-24 text-center">
                          <div
                            className="flex flex-col items-center gap-2"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center"
                              style={{ backgroundColor: "var(--bg-main)" }}
                            >
                              <Package
                                size={28}
                                strokeWidth={1.5}
                                style={{ color: "var(--text-placeholder)" }}
                              />
                            </div>
                            <p className="text-sm font-medium mt-1">
                              {searchQuery
                                ? `Không tìm thấy sản phẩm "${searchQuery}"`
                                : "Chưa có sản phẩm nào"}
                            </p>
                            {hasActiveFilters && (
                              <button
                                onClick={clearFilters}
                                className="text-[13px] font-medium cursor-pointer"
                                style={{ color: "var(--brand-primary)" }}
                              >
                                Xóa bộ lọc
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {filteredProducts.length > 0 && (
                <div
                  className="px-6 py-3 border-t shrink-0 flex items-center justify-between"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "var(--bg-main)",
                  }}
                >
                  <div
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Tổng số bản ghi:{" "}
                    <span
                      className="font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {filteredProducts.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Số bản ghi/trang
                      </span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none"
                        style={{
                          borderColor: "var(--grid-border)",
                          backgroundColor: "#fff",
                          color: "var(--text-main)",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 8px center",
                        }}
                      >
                        {[15, 30, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      className="text-[13px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
                        {(currentPage - 1) * itemsPerPage + 1} -{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredProducts.length,
                        )}
                      </span>{" "}
                      bản ghi
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((pg) => Math.max(1, pg - 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                        style={{ color: "var(--text-main)" }}
                      >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((pg) => Math.min(totalPages, pg + 1))
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                        style={{ color: "var(--text-main)" }}
                      >
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* CÁC TAB KHÁC */}
        {activeTab === "categories" && (
          <CategoriesTab
            categories={categories}
            onAdd={() =>
              handleOpenSimpleModal("category", "Thêm danh mục sản phẩm")
            }
            onEdit={(c) =>
              handleOpenSimpleModal("category", "Sửa danh mục sản phẩm", c)
            }
            onDelete={handleDeleteCategory}
          />
        )}
        {activeTab === "properties" && (
          <PropertiesTab
            woods={woods}
            onAddWood={() => handleOpenSimpleModal("wood", "Thêm loại gỗ")}
            onEditWood={(w) => handleOpenSimpleModal("wood", "Sửa loại gỗ", w)}
            onDeleteWood={handleDeleteWood}
            otherMaterials={otherMaterials}
            onAddOtherMaterial={() =>
              handleOpenSimpleModal("material", "Thêm chất liệu khác")
            }
            onEditOtherMaterial={(m) =>
              handleOpenSimpleModal("material", "Sửa chất liệu khác", m)
            }
            onDeleteOtherMaterial={handleDeleteMaterial}
            colors={colors}
            onAddColor={() => handleOpenSimpleModal("color", "Thêm màu sắc")}
            onEditColor={(c) =>
              handleOpenSimpleModal("color", "Sửa màu sắc", c)
            }
            onDeleteColor={handleDeleteColor}
          />
        )}
        {activeTab === "inventory_log" && (
          <div
            className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
            style={{
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            {/* Log Search Header */}
            <div
              className="px-5 py-4 border-b flex items-center justify-between gap-4"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="relative w-full max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm theo mã SKU, tên SP, mã đơn..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                />
                {logSearchQuery && (
                  <button
                    onClick={() => setLogSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="text-[12px] text-gray-400 font-medium italic">
                Hiển thị {filteredLogs.length} biến động gần nhất
              </div>
            </div>

            {/* Log Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-[13px]">
                <thead
                  className="sticky top-0 z-10 bg-white border-b"
                  style={{ borderColor: "var(--grid-border)" }}
                >
                  <tr>
                    <th className="px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                      Hoạt động
                    </th>
                    <th className="px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider text-center">
                      Biến động
                    </th>
                    <th className="px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider text-center">
                      Số dư cuối
                    </th>
                    <th className="px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                      Tham chiếu
                    </th>
                    <th className="px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                      Người thực hiện
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.map((log) => {
                    const isPlus = log.change > 0;
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">
                              {new Date(log.timestamp).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(log.timestamp).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1`}
                            style={{
                              backgroundColor:
                                log.type === "Nhập kho"
                                  ? "#F0FDF4"
                                  : log.type === "Xuất bán"
                                    ? "#EFF6FF"
                                    : "#F3F4F6",
                              color:
                                log.type === "Nhập kho"
                                  ? "#15803D"
                                  : log.type === "Xuất bán"
                                    ? "#1D4ED8"
                                    : "#6B7280",
                            }}
                          >
                            {log.type === "Nhập kho" ? (
                              <PackageCheck size={12} />
                            ) : (
                              <Package size={12} />
                            )}
                            {log.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border overflow-hidden shrink-0">
                              {log.productImg ? (
                                <img
                                  src={log.productImg}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon size={20} className="text-gray-300" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-gray-900 truncate">
                                {log.productName}
                              </span>
                              <span className="text-[11px] font-mono text-gray-400">
                                {log.productCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`text-[14px] font-bold ${isPlus ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {isPlus ? "+" : ""}
                            {log.change}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {log.balance}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-blue-600 font-bold hover:underline cursor-pointer">
                            {log.reference}
                          </div>
                          {log.note && (
                            <p className="text-[11px] text-gray-400 italic mt-0.5">
                              {log.note}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100">
                              {log.authorizedBy.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-600">
                              {log.authorizedBy}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-20 text-center text-gray-400 italic"
                      >
                        Không tìm thấy lịch sử biến động nào...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SIMPLE INPUT MODAL (MỚI) */}
      {simpleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSimpleModal({ ...simpleModal, isOpen: false })}
          ></div>
          <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-spin-in p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-bold text-gray-900">
                {simpleModal.title}
              </h3>
              <button
                onClick={() =>
                  setSimpleModal({ ...simpleModal, isOpen: false })
                }
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên
              </label>
              <input
                type="text"
                autoFocus
                className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-[15px]"
                placeholder="Nhập tên..."
                value={simpleModal.value}
                onChange={(e) =>
                  setSimpleModal({ ...simpleModal, value: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSaveSimpleModal()}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setSimpleModal({ ...simpleModal, isOpen: false })
                }
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSimpleModal}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition hover:opacity-90 shadow-sm"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
