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
  DollarSign,
  Info,
  Armchair,
  Bed,
  Monitor,
  Utensils,
  Palette,
  Flower2,
  Briefcase,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";

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
  "Hàng sẵn",
  "Hàng mộc",
  "Hàng đặt",
  "Hết hàng",
  "Ngừng kinh doanh",
  "Quà tặng",
];

const INITIAL_PRODUCTS = [
  {
    id: "SP001",
    code: "SP-PT-001",
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
    img: "https://placehold.co/100x100?text=SapTho",
    description:
      "Sập thờ trạm khắc tỉ mỉ tinh xảo, chất liệu gỗ mít lõi liền khối.",
  },
  {
    id: "SP002",
    code: "SP-PK-001",
    name: "Bộ bàn ghế Quốc Voi 6 món",
    category: "Phòng khách",
    material: "Gỗ Hương",
    color: "Đục tay",
    dimensions: "Tay 12",
    costPrice: 95000000,
    retailPrice: 120000000,
    unit: "Bộ",
    productType: "Hàng đặt",
    status: "Hàng đặt",
    stock: 0,
    img: "https://placehold.co/100x100?text=QuocVoi",
    description: "Hàng đặt theo kích thước riêng, tay 12 vách 4 phân.",
  },
  {
    id: "SP-THO-01",
    code: "SP-THO-001",
    name: "Tủ áo gỗ xoan đào (Hàng mộc)",
    category: "Phòng ngủ",
    material: "Gỗ xoan đào",
    color: "Để mộc",
    dimensions: "160x200x55",
    costPrice: 8500000,
    retailPrice: 12500000,
    unit: "Chiếc",
    productType: "Hàng mộc",
    status: "Hàng mộc",
    stock: 3,
    img: "https://placehold.co/100x100?text=TuAoTho",
    description: "Hàng mộc sẵn tại kho, chờ sơn hoàn thiện.",
  },
  {
    id: "SP003",
    code: "SP-PK-002",
    name: "Sofa nguyên khối chữ L (Mộc)",
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
    img: "https://placehold.co/100x100?text=Sofa",
    description: "Bộ L mặt nguyên tấm dày 10cm.",
  },
  {
    id: "SP004",
    code: "SP-TT-001",
    name: "Lộc bình cao 1m8",
    category: "Trang trí",
    material: "Gỗ Hương",
    color: "Đục máy sửa tay",
    dimensions: "Cao 1m8, ĐK 50",
    costPrice: 18000000,
    retailPrice: 25000000,
    unit: "Cặp",
    productType: "Hàng sẵn",
    status: "Hết hàng",
    stock: 0,
    img: null,
    description: "Tiện liền khối.",
  },
  {
    id: "SP005",
    code: "SP-PN-001",
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
    img: "https://placehold.co/100x100?text=GiuongNgu",
    description: "Mẫu cũ năm ngoái.",
  },
  {
    id: "SP006",
    code: "SP-TT-002",
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
    img: "https://placehold.co/100x100?text=DatMa",
    description: "Hàng đục kỹ.",
  },
  {
    id: "SP007",
    code: "SP-PA-001",
    name: "Bộ bàn ăn 8 ghế nguyên khối",
    category: "Phòng ăn",
    material: "Gỗ Gõ đỏ",
    color: "Nguyên khối",
    dimensions: "240x95x10",
    costPrice: 40000000,
    retailPrice: 55000000,
    unit: "Bộ",
    productType: "Hàng đặt",
    status: "Hàng đặt",
    stock: 0,
    img: "https://placehold.co/100x100?text=BanAn",
    description: "Nguyên tấm nguyên khối.",
  },
];

// ===================== HELPERS =====================
const fmtCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

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
    case "Hàng sẵn":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }; // Green
    case "Hàng mộc":
      return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" }; // Amber
    case "Hàng đặt":
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
      {/* Loại gỗ */}
      <div
        className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--grid-border)" }}
        >
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">Loại gỗ</h2>
            <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
              Danh mục các loại gỗ tự nhiên
            </p>
          </div>
          <button
            onClick={onAddWood}
            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold transition hover:bg-gray-100 border border-gray-200 cursor-pointer"
          >
            <Plus size={14} /> Thêm gỗ
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
                  Tên gỗ
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {woods.map((w, i) => (
                <tr
                  key={w}
                  className="hover:bg-gray-50/50 transition-colors group"
                  style={{ borderBottom: "1px solid var(--grid-border)" }}
                >
                  <td className="px-6 py-4 font-medium text-gray-400">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center border border-green-100/50">
                        <TreePine size={16} className="text-green-600" />
                      </div>
                      <span className="font-bold text-gray-900">{w}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end gap-1.5 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onEditWood(w)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteWood(w)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chất liệu khác */}
      <div
        className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden"
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
              Chất liệu khác
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
              Đồng, gốm, sứ, nhựa...
            </p>
          </div>
          <button
            onClick={onAddOtherMaterial}
            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold transition hover:bg-gray-100 border border-gray-200 cursor-pointer"
          >
            <Plus size={14} /> Thêm
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
                  Tên
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {otherMaterials.map((m, i) => (
                <tr
                  key={m}
                  className="hover:bg-gray-50/50 transition-colors group"
                  style={{ borderBottom: "1px solid var(--grid-border)" }}
                >
                  <td className="px-6 py-4 font-medium text-gray-400">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                        <Box size={16} className="text-emerald-600" />
                      </div>
                      <span className="font-bold text-gray-900">{m}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end gap-1.5 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onEditOtherMaterial(m)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteOtherMaterial(m)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Màu sắc */}
      <div
        className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--grid-border)" }}
        >
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">Màu sắc</h2>
            <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
              Bảng màu hoàn thiện sản phẩm
            </p>
          </div>
          <button
            onClick={onAddColor}
            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold transition hover:bg-gray-100 border border-gray-200 cursor-pointer"
          >
            <Plus size={14} /> Thêm màu
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
                  Tên màu
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right w-28">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {colors.map((c, i) => (
                <tr
                  key={c}
                  className="hover:bg-gray-50/50 transition-colors group"
                  style={{ borderBottom: "1px solid var(--grid-border)" }}
                >
                  <td className="px-6 py-4 font-medium text-gray-400">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100/50">
                        <Palette size={16} className="text-orange-600" />
                      </div>
                      <span className="font-bold text-gray-900">{c}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end gap-1.5 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onEditColor(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteColor(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===================== COMPONENT =====================
export default function OwnerProducts() {
  const [activeTab, setActiveTab] = useState("products"); // products | categories | properties
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

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
        setOtherMaterials(
          otherMaterials.map((m) => (m === originalValue ? value : m)),
        );
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

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [materialFilter, setMaterialFilter] = useState("Tất cả");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [costPrice, setCostPrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftItem, setGiftItem] = useState(null);

  // Actions
  const toggleStatus = (id, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
  };

  const handleOpenEdit = (product, e) => {
    e.stopPropagation();
    setEditItem(product);
    setCostPrice(product.costPrice || 0);
    setRetailPrice(product.retailPrice || 0);
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

  const hasActiveFilters =
    categoryFilter !== "Tất cả" || materialFilter !== "Tất cả" || searchQuery;

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

  // ===================== RENDER MODALS =====================

  // 1. ADD / EDIT MODAL (Simplified mock form)
  const renderAddEditModal = () => {
    if (!showAddEditModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/80">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-main)" }}
            >
              {editItem ? "Sửa sản phẩm" : "Thêm mới sản phẩm"}
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
                        Mã SP (SKU) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: SP001"
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
                      <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Chọn danh mục SP</option>
                        {CATEGORIES.map((c) => (
                          <option
                            key={c}
                            value={c}
                            selected={editItem?.category === c}
                          >
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
                        <optgroup label="Nhóm Gỗ">
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
                        <optgroup label="Chất liệu khác">
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
                        Kích thước (D×R×C)
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
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Giá nhập (VNĐ)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formatNumberInput(costPrice)}
                        onChange={(e) => {
                          const val = parseNumberInput(e.target.value);
                          setCostPrice(val === "" ? 0 : Number(val));
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formatNumberInput(retailPrice)}
                        onChange={(e) => {
                          const val = parseNumberInput(e.target.value);
                          setRetailPrice(val === "" ? 0 : Number(val));
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Loại sản phẩm
                      </label>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        defaultValue={editItem?.productType || "Hàng sẵn"}
                      >
                        <option value="Hàng sẵn">Hàng sẵn</option>
                        <option value="Hàng mộc">Hàng mộc</option>
                        <option value="Hàng đặt">Hàng đặt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tồn kho ban đầu
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                        defaultValue={editItem ? editItem.stock : 0}
                        disabled={editItem?.productType === "Hàng đặt"}
                        title="Hàng đặt không quản lý kho theo mẫu"
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
              onClick={() => {
                setShowAddEditModal(false); /* mock submit */
              }}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer flex items-center gap-2"
            >
              Lưu
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
            <button
              onClick={() => setShowDetailModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
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
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {detailItem.name}
                  </h1>
                  <p className="text-sm text-gray-500">{detailItem.category}</p>
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
                  <div>
                    <span className="text-gray-500 block text-xs mb-1">
                      Giá bán
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {fmtCurrency(detailItem.retailPrice)}
                    </span>
                  </div>
                  {detailItem.costPrice && (
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">
                        Giá nhập
                      </span>
                      <span className="text-lg font-bold text-gray-700">
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
                        {detailItem.productType === "Hàng đặt"
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
                    placeholder="Theo mã số, tên sản phẩm..."
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
                      <optgroup label="Nhóm Gỗ">
                        {woods.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Chất liệu khác">
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
                        Mã SP
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
                            <p
                              className="text-[13px] font-bold font-mono"
                              style={{ color: "var(--text-main)" }}
                            >
                              {p.code}
                            </p>
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
                            <span className="font-medium text-gray-700">
                              {p.productType}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p
                              className="text-[13px] font-bold"
                              style={{ color: "var(--text-main)" }}
                            >
                              {fmtCurrency(p.retailPrice)}
                            </p>
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
                                <button
                                  onClick={(e) => handleOpenEdit(p, e)}
                                  className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold text-gray-700"
                                >
                                  Sửa
                                </button>

                                {p.status !== "Quà tặng" &&
                                  p.status !== "Ngừng kinh doanh" &&
                                  p.productType === "Hàng sẵn" && (
                                    <button
                                      onClick={(e) => handleOpenGift(p, e)}
                                      className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-purple-50 gap-1.5 text-[12px] font-bold text-purple-600"
                                    >
                                      Quà
                                    </button>
                                  )}

                                {p.status !== "Ngừng kinh doanh" ? (
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
