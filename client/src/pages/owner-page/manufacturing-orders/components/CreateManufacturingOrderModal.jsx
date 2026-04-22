/**
 * CreateManufacturingOrderModal
 * 2-Step Wizard: Bước 1 — Tick chọn đơn hàng | Bước 2 — Xem lại (read-only) & Tạo phiếu
 * Thông tin SP đã đầy đủ từ sale, chủ chỉ cần chọn và xác nhận.
 */

import { useState, useMemo, useEffect } from "react";
import {
  X, Check, ChevronLeft, ChevronRight,
  FileStack, Package, Search,
  CheckSquare, Square, Users, Layers,
  TreePine, Palette, Ruler, Plus, Minus,
  ShoppingCart, LayoutGrid, ListTodo,
  PackageCheck, ImagePlus, ClipboardEdit,
  StickyNote, AlertTriangle, Sparkles,
  ChevronDown, Trash2, Calendar, Paintbrush,
} from "lucide-react";

const WOOD_TYPES = ["Gỗ sồi", "Gỗ óc chó", "Gỗ tần bì", "Gỗ cao su", "Gỗ thông", "Gỗ hương"];
const COLORS = ["Tự nhiên", "Nâu đậm", "Nâu nhạt", "Đen", "Trắng ngà", "Ghi xám"];
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";

const ELIGIBLE_TYPES = ["Hàng khách đặt"];
const ELIGIBLE_STATUSES = ["Chờ xử lý", "Chờ sản xuất", "Đang gia công"];

const TYPE_BADGE = {
  "Hàng mộc": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Hàng khách đặt": { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" },
};

const STATUS_BADGE = {
  "Chờ xử lý": { bg: "#EFF6FF", text: "#1D4ED8" },
  "Chờ sản xuất": { bg: "#FEF3C7", text: "#B45309" },
  "Đang gia công": { bg: "#FEF3C7", text: "#D97706" },
};

const INITIAL_SUPPLIERS = [
  { id: "NCC001", code: "NCC-TAM", name: "Xưởng gỗ mỹ nghệ Thành Tâm", contactPerson: "Nguyễn Văn Tâm", phone: "0901234567", address: "Làng nghề Đồng Kỵ, Từ Sơn, Bắc Ninh", specialty: "Chuyên đồ thờ, sập thờ chân 20-24" },
  { id: "NCC002", code: "NCC-HAI", name: "Xưởng mộc gia dụng Nam Hải", contactPerson: "Trần Thế Hải", phone: "0912345678", address: "Khu CN Thạch Thất, Hà Nội", specialty: "Chuyên đóng phôi gỗ mít, xoan đào" },
  { id: "NCC003", code: "NCC-PHAT", name: "Xưởng mộc nội thất Gia Phát", contactPerson: "Lê Văn Phát", phone: "0987654321", address: "Làng mộc Hữu Bằng, Thạch Thất, Hà Nội", specialty: "Chuyên bàn ghế, sofa gỗ hiện đại" }
];

function removeAccents(str) {
  if (!str) return "";
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function getInitials(str) {
  if (!str) return "";
  return removeAccents(str)
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

function genId() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const existing = JSON.parse(localStorage.getItem("tpf_manufacturing_orders") || "[]");
  const todayPrefix = `YCNH-${dateStr}-`;
  const todayOrders = existing.filter((o) => o.id.startsWith(todayPrefix));
  const seq = String(todayOrders.length + 1).padStart(3, "0");
  return `${todayPrefix}${seq}`;
}

// ── Step 2 Sub-component ──
const ReviewItem = ({ item, isCustom }) => {
  const sizeParts = [item.length ? `D${item.length}` : "", item.width ? `R${item.width}` : "", item.height ? `C${item.height}` : ""].filter(Boolean).join(" ");
  const sizeDisplay = item.size || sizeParts;
  const colorFinish = [item.color, item.finish].filter(Boolean).join(" / ");
  const allImages = [...(item.image ? [item.image] : []), ...(item.images || [])];

  return (
    <div className={`flex gap-3 p-3 rounded-xl border-2 border-dashed ${isCustom ? 'border-green-100 bg-green-50/30' : 'border-purple-100 bg-purple-50/30'}`}>
      {allImages.length > 0 && (
        <div className={`w-14 h-14 rounded-lg overflow-hidden border shrink-0 bg-white ${isCustom ? 'border-green-100' : 'border-purple-100'}`}>
          <img src={allImages[0]} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className={`text-[13px] font-bold truncate ${isCustom ? 'text-green-800' : 'text-purple-800'}`}>{item.productName}</p>
          {item.code && <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/50 border border-current opacity-60 shrink-0">{item.code}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {item.material && <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${isCustom ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{item.material}</span>}
          {sizeDisplay && <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${isCustom ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{sizeDisplay}</span>}
          {item.color && <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${isCustom ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{item.color}</span>}
        </div>
        <p className={`mt-1.5 text-[12px] font-medium italic opacity-60 flex items-center gap-1 ${isCustom ? 'text-green-600' : 'text-purple-600'}`}>
          {isCustom ? <><Sparkles size={10} /> Sản phẩm mới chưa có trong danh mục</> : <><Package size={10} /> Sản phẩm từ danh mục có sẵn</>}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-center justify-center px-2">
        <span className={`text-[16px] font-black ${isCustom ? 'text-green-700' : 'text-purple-700'}`}>{item.qty}</span>
        <span className={`text-[11px] ${isCustom ? 'text-green-400' : 'text-purple-400'}`}>{item.unit || "Cái"}</span>
      </div>
    </div>
  );
};

export default function CreateManufacturingOrderModal({ orders, catalogProducts, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "catalog"
  const [selectedProductKeys, setSelectedProductKeys] = useState(new Set()); // "orderId-idx"
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedCatalogProducts, setSelectedCatalogProducts] = useState({}); // { productId: qty }
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [suppSearch, setSuppSearch] = useState("");
  const [orderDates, setOrderDates] = useState({}); // { sourceCode: dateString }
  const [previewImage, setPreviewImage] = useState(null);

  // ── Manual Item Entry State ──
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customItems, setCustomItems] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "", material: "", length: "", width: "", height: "", color: "", qty: 1, note: "", images: [], code: "", isManualCode: false
  });

  useEffect(() => {
    if (newProduct.isManualCode) return;
    const initialsName = getInitials(newProduct.name);
    const initialsMat = getInitials(newProduct.material);
    const initialsColor = getInitials(newProduct.color);
    const generated = [initialsName, initialsMat, initialsColor].filter(Boolean).join("-");
    setNewProduct(prev => ({ ...prev, code: generated }));
  }, [newProduct.name, newProduct.material, newProduct.color, newProduct.isManualCode]);
  const [showWoodDropdown, setShowWoodDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // ── Eligible orders ──
  const eligibleOrders = useMemo(() =>
    (orders || []).filter((o) => ELIGIBLE_TYPES.includes(o.type) && ELIGIBLE_STATUSES.includes(o.status)),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return eligibleOrders;
    return eligibleOrders.filter((o) =>
      o.code.toLowerCase().includes(q) ||
      (o.customerName || o.customer?.name || "").toLowerCase().includes(q) ||
      o.products?.some(p => (p.name || p.productName || "").toLowerCase().includes(q))
    );
  }, [eligibleOrders, search]);

  // ── Catalog products filter ──
  const filteredCatalog = useMemo(() => {
    const q = catSearch.toLowerCase().trim();
    if (!q) return catalogProducts || [];
    return (catalogProducts || []).filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.code || "").toLowerCase().includes(q)
    );
  }, [catalogProducts, catSearch]);

  // ── Suppliers filter ──
  const filteredSuppliers = useMemo(() => {
    const q = suppSearch.toLowerCase().trim();
    if (!q) return INITIAL_SUPPLIERS;
    return INITIAL_SUPPLIERS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      (s.specialty && s.specialty.toLowerCase().includes(q))
    );
  }, [suppSearch]);

  // ── Toggle selection ──
  const toggleProduct = (order, pIdx) => {
    const key = `${order.id}-${pIdx}`;
    setSelectedProductKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleOrder = (order) => {
    const pKeys = (order.products || []).map((_, idx) => `${order.id}-${idx}`);
    const allSelected = pKeys.every(k => selectedProductKeys.has(k));

    setSelectedProductKeys(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pKeys.forEach(k => next.delete(k));
      } else {
        pKeys.forEach(k => next.add(k));
      }
      return next;
    });
  };

  const toggleAll = () => {
    const allEligibleKeys = [];
    filteredOrders.forEach(o => {
      (o.products || []).forEach((_, idx) => allEligibleKeys.push(`${o.id}-${idx}`));
    });

    const isAllSelected = allEligibleKeys.length > 0 && allEligibleKeys.every(k => selectedProductKeys.has(k));

    if (isAllSelected) {
      setSelectedProductKeys(new Set());
    } else {
      setSelectedProductKeys(new Set(allEligibleKeys));
    }
  };

  const selectedOrders = useMemo(() => {
    // Return orders that have AT LEAST one product selected
    const orderIds = new Set();
    selectedProductKeys.forEach(key => {
      const lastDash = key.lastIndexOf("-");
      if (lastDash !== -1) {
        orderIds.add(key.substring(0, lastDash));
      }
    });
    return eligibleOrders.filter(o => orderIds.has(o.id));
  }, [eligibleOrders, selectedProductKeys]);


  const toggleCatalogProduct = (p, delta) => {
    setSelectedCatalogProducts(prev => {
      const next = { ...prev };
      const current = next[p.id] || 0;
      const val = Math.max(0, current + delta);
      if (val === 0) delete next[p.id];
      else next[p.id] = val;
      return next;
    });
  };

  const selectedCatCount = Object.keys(selectedCatalogProducts).length + customItems.length;

  // ── DataTable Preparation ──

  // 1. Orders Tab
  const orderColumns = [
    {
      header: "Mã Đơn",
      key: "code",
      render: (o) => (
        <span className="text-[13px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-800">
          {o.code}
        </span>
      )
    },
    {
      header: "Khách Hàng",
      render: (o) => {
        const customerName = o.customerName || o.customer?.name || "";
        return (
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Users size={12} className="text-slate-400" />
            {customerName || "—"}
          </div>
        );
      }
    },
    {
      header: "Loại",
      render: (o) => {
        const tb = TYPE_BADGE[o.type] || {};
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: tb.bg, color: tb.text, border: `1px solid ${tb.border}` }}>
            {o.type}
          </span>
        );
      }
    },
    {
      header: "Tỉ Lệ Chọn",
      className: "text-center",
      render: (o) => {
        const pKeys = (o.products || []).map((_, idx) => `${o.id}-${idx}`);
        const selectedInOrder = pKeys.filter(k => selectedProductKeys.has(k));
        const isFully = pKeys.length > 0 && selectedInOrder.length === pKeys.length;
        return (
          <span className={`font-bold ${selectedInOrder.length > 0 ? 'text-[var(--brand-primary)]' : 'text-[var(--text-placeholder)]'}`}>
            {selectedInOrder.length}/{o.products?.length || 0} SP
          </span>
        );
      }
    },
    {
      header: "Tổng SL",
      className: "text-right",
      render: (o) => (
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-black" style={{ color: "var(--text-main)" }}>{o.products?.reduce((s, p) => s + (p.qty || p.quantity || 1), 0) || 0}</span>
          <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>chiếc</span>
        </div>
      )
    }
  ];

  const orderDataForTable = useMemo(() => {
    return filteredOrders.map(o => ({
      ...o,
      id: o.id // DataTable needs id
    }));
  }, [filteredOrders]);

  const selectedOrderIds = useMemo(() => {
    // Only rows where ALL products are selected are considered "selected" in DataTable main checkbox context
    return filteredOrders.filter(o => {
      const pKeys = (o.products || []).map((_, idx) => `${o.id}-${idx}`);
      return pKeys.length > 0 && pKeys.every(k => selectedProductKeys.has(k));
    }).map(o => o.id);
  }, [filteredOrders, selectedProductKeys]);

  // 2. Catalog Tab
  const catalogColumns = [
    {
      header: "Ảnh",
      render: (p) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-50">
          <img src={p.img || p.image || "https://placehold.co/100"} alt="" className="w-full h-full object-cover" />
        </div>
      )
    },
    {
      header: "Tên Sản Phẩm",
      render: (p) => (
        <div>
          <p className="text-[13px] font-bold truncate leading-tight mb-0.5" title={p.name}>{p.name}</p>
          <p className="text-[11px] font-mono text-gray-400">{p.code || "CUSTOM"}</p>
        </div>
      )
    },
    {
      header: "Chất Liệu",
      render: (p) => <span className="text-[11px] font-bold text-gray-500">{p.material || "—"}</span>
    },
    {
      header: "Số Lượng",
      className: "w-[120px]",
      render: (p) => {
        const isCustom = !!p.images; // simple way to tell if it's from customItems
        const qty = isCustom ? p.qty : (selectedCatalogProducts[p.id] || 0);
        return (
          <div className="flex items-center gap-2">
            {!isCustom && (
              <>
                <button
                  onClick={() => toggleCatalogProduct(p, -1)}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-500 transition-colors cursor-pointer"
                >
                  <Minus size={12} />
                </button>
                <span className="text-[14px] font-black text-[var(--brand-primary)] min-w-[20px] text-center">{qty}</span>
                <button
                  onClick={() => toggleCatalogProduct(p, 1)}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--brand-primary)] text-white cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </>
            )}
            {isCustom && (
              <div className="flex items-center gap-4 w-full justify-between">
                <span className="text-[14px] font-black text-green-700">{p.qty} {p.unit || "Cái"}</span>
                <button
                  onClick={() => setCustomItems(prev => prev.filter(it => it.id !== p.id))}
                  className="text-red-400 p-1 rounded-md cursor-pointer flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const catalogDataForTable = useMemo(() => {
    const items = filteredCatalog.map(p => ({ ...p, id: p.id }));
    const custom = customItems.map(ci => ({ ...ci, id: ci.id }));
    return [...custom, ...items];
  }, [filteredCatalog, customItems]);

  // 3. Supplier Tab (Step 2)
  const supplierColumns = [
    {
      header: "Nhà Cung Cấp",
      render: (s) => (
        <div className="flex flex-col">
          <span className="font-bold text-[14px] text-slate-700">{s.name}</span>
          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 w-fit mt-1" style={{ color: "var(--text-secondary)" }}>{s.code}</span>
        </div>
      )
    },
    {
      header: "Liên Hệ",
      render: (s) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-slate-600 flex items-center gap-1">
            <Users size={12} className="text-slate-400" />
            {s.contactPerson}
          </span>
          <span className="text-[12px] text-slate-500 font-medium">{s.phone}</span>
        </div>
      )
    },
    {
      header: "Thế Mạnh / Chuyên Môn",
      className: "max-w-[280px]",
      render: (s) => s.specialty ? (
        <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50/50 border border-amber-100/50">
          <StickyNote size={12} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[12px] italic text-amber-700 font-medium leading-tight">
            {s.specialty}
          </p>
        </div>
      ) : <span className="text-gray-300">—</span>
    },
    {
      header: "Địa Chỉ",
      className: "max-w-[200px]",
      render: (s) => (
        <p className="text-[12px] text-slate-500 truncate" title={s.address}>
          {s.address}
        </p>
      )
    }
  ];

  const supplierDataForTable = useMemo(() => {
    const q = suppSearch.toLowerCase().trim();
    if (!q) return INITIAL_SUPPLIERS;
    return INITIAL_SUPPLIERS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      (s.specialty && s.specialty.toLowerCase().includes(q))
    );
  }, [suppSearch]);


  // ── Build items from selected orders (carry ALL product fields as-is) ──
  const buildItems = () => {
    const items = [];
    // 1. From orders
    selectedOrders.forEach(order => {
      (order.products || []).forEach((p, idx) => {
        if (!selectedProductKeys.has(`${order.id}-${idx}`)) return;

        items.push({
          id: Math.random().toString(36).substr(2, 9),
          productName: p.name || p.productName || "",
          material: p.material || p.woodType || "",
          size: p.size || p.specs || "",
          color: p.color || "",
          finish: p.finish || "",
          qty: p.qty || p.quantity || 1,
          unit: p.unit || "Cái",
          note: p.note || "",
          length: p.length || "",
          width: p.width || "",
          height: p.height || "",
          image: p.image || p.img || "",
          customerSampleImage: p.customerSampleImage || "",
          images: p.images || [],
          sourceOrders: [order.code],
          customerDeadline: order.deliveryDate || order.deadline || "",
          sourceOrderDetails: {
            [order.code]: {
              customerName: order.customerName || order.customer?.name || "",
              type: order.type || "",
            }
          },
        });
      });
    });

    // 2. From Catalog
    Object.entries(selectedCatalogProducts).forEach(([pId, qty]) => {
      const p = catalogProducts.find(cp => cp.id === pId);
      if (!p) return;
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        productName: p.name || "",
        material: p.material || "",
        size: p.dimensions || p.size || "",
        color: p.color || "",
        finish: p.finish || "Để mộc",
        qty: qty,
        unit: p.unit || "Cái",
        note: "Sản phẩm nhập thêm (từ danh mục)",
        image: p.img || p.image || "",
        sourceOrders: ["DANH-MUC"],
        sourceOrderDetails: {
          "DANH-MUC": {
            customerName: "Sản phẩm nhập thêm",
            type: "Hàng sẵn",
          }
        },
      });
    });

    // 3. From Custom Entries
    customItems.forEach(ci => {
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        productName: ci.name || "",
        material: ci.material || "",
        size: [ci.length ? `D${ci.length}` : "", ci.width ? `R${ci.width}` : "", ci.height ? `C${ci.height}` : ""].filter(Boolean).join(" "),
        color: ci.color || "",
        finish: "Theo yêu cầu",
        qty: ci.qty || 1,
        unit: "Cái",
        note: ci.note || "Sản phẩm mới nhập thêm",
        image: ci.images?.[0] || "",
        images: ci.images || [],
        sourceOrders: ["MO-TAO"],
        sourceOrderDetails: {
          "MO-TAO": {
            customerName: "Sản phẩm mới",
            type: "Nhập mới",
          }
        },
      });
    });

    return items;
  };

  const items = useMemo(() => step >= 2 ? buildItems() : [], [step, selectedProductKeys, selectedCatalogProducts, customItems]);

  const groupedItems = useMemo(() => {
    if (step < 3) return {};
    const groups = {};
    items.forEach(it => {
      const src = it.sourceOrders?.[0] || "KHAC";
      if (!groups[src]) groups[src] = { items: [], deadline: null, name: "" };
      groups[src].items.push(it);

      if (it.customerDeadline) {
        const d = new Date(it.customerDeadline).getTime();
        if (!groups[src].deadline || d < groups[src].deadline) {
          groups[src].deadline = d;
        }
      }
      if (it.sourceOrderDetails?.[src]) {
        groups[src].name = it.sourceOrderDetails[src].customerName;
      } else if (src === "DANH-MUC") {
        groups[src].name = "Hàng sẵn / Kho";
      } else if (src === "MO-TAO") {
        groups[src].name = "Sản phẩm mới / Nhập tay";
      }
    });
    return groups;
  }, [items, step]);

  // Initialize dates for each group when transitioning to Step 3 (Manual - defaulted to tomorrow)
  useEffect(() => {
    if (step === 3) {
      setOrderDates(prev => {
        const next = { ...prev };
        Object.entries(groupedItems).forEach(([code, group]) => {
          if (!next[code]) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            next[code] = tomorrow.toISOString().split('T')[0];
          }
        });
        return next;
      });
    }
  }, [step, groupedItems]);

  const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
  const totalSelectedFromOrders = selectedProductKeys.size;
  const totalSelectedFromCatalog = Object.values(selectedCatalogProducts).reduce((s, q) => s + q, 0) + customItems.reduce((s, i) => s + i.qty, 0);

  const goToStep2 = () => {
    if (selectedProductKeys.size === 0 && selectedCatCount === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }
    const noProducts = selectedOrders.filter(o => !o.products?.length);
    if (noProducts.length > 0) {
      toast("Lưu ý: " + noProducts.length + " đơn chưa có chi tiết sản phẩm.", {
        icon: <AlertTriangle size={18} className="text-amber-500" />
      });
    }
    setStep(2); // Goes to Supplier step
  };

  const goToStep3 = () => {
    if (!selectedSupplier) {
      toast.error("Vui lòng chọn nhà cung cấp!");
      return;
    }
    setStep(3);
  };

  // ── Save ──
  const handleSave = () => {
    const finalItems = buildItems();
    if (!finalItems.length) {
      toast.error("Yêu cầu không có sản phẩm nào!");
      return;
    }

    // Validation per source order group (Manual check only for existence)
    const errors = [];
    Object.entries(groupedItems).forEach(([code, group]) => {
      if (!orderDates[code]) {
        errors.push(`Vui lòng chọn ngày cho nhóm ${code}`);
      }
    });

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const allSourceOrders = new Set();
    const allSourceOrderDetails = {};
    finalItems.forEach(it => {
      const src = it.sourceOrders?.[0] || "KHAC";
      it.expectedDate = orderDates[src]; // Attach specific date to item

      it.sourceOrders.forEach(o => {
        allSourceOrders.add(o);
        if (it.sourceOrderDetails?.[o]) {
          allSourceOrderDetails[o] = it.sourceOrderDetails[o];
        }
      });
    });

    const newOrder = {
      id: genId(),
      createdAt: new Date().toISOString(),
      createdBy: "Chủ xưởng",
      status: "Mới tạo",
      note: note.trim(),
      supplierId: selectedSupplier?.id,
      supplierName: selectedSupplier?.name,
      // Store the range/summary in the main order for list view
      expectedDate: Object.values(orderDates).sort()[0] || "", // Earliest as primary
      orderDates: orderDates,
      orderIds: Array.from(allSourceOrders),
      sourceOrderDetails: allSourceOrderDetails,
      items: finalItems,
    };
    const existing = JSON.parse(localStorage.getItem("tpf_manufacturing_orders") || "[]");
    localStorage.setItem("tpf_manufacturing_orders", JSON.stringify([newOrder, ...existing]));
    toast.success(`Đã tạo yêu cầu ${newOrder.id} thành công!`);
    onCreated?.(newOrder);
    onClose();
  };

  // helper: get display size
  const getDisplaySize = (item) => {
    if (item.size) return item.size;
    const parts = [
      item.length ? `D${item.length}` : "",
      item.width ? `R${item.width}` : "",
      item.height ? `C${item.height}` : "",
    ].filter(Boolean).join(" ");
    return parts || "";
  };

  // ─────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col rounded-lg overflow-hidden"
        style={{
          width: "min(960px, 98vw)",
          height: "90vh",
          background: "#fff",
          border: "1px solid var(--grid-border)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--grid-border)", background: "var(--grid-header-bg)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--status-focus)" }}>
              <FileStack size={18} style={{ color: "var(--brand-primary)" }} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>
                Tạo yêu cầu nhập hàng mới
              </h2>
              <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                {step === 1 ? (
                  activeTab === "orders"
                    ? `Bước 1/3 — Đã chọn ${selectedOrders.length} đơn (${selectedProductKeys.size} SP)`
                    : `Bước 1/3 — Đã chọn ${selectedCatCount} loại SP (${totalSelectedFromCatalog} chiếc)`
                ) : step === 2 ? (
                  "Bước 2/3 — Chọn nhà cung cấp gia công"
                ) : (
                  "Bước 3/3 — Hẹn ngày giao & Hoàn tất phiếu"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: step >= 1 ? "var(--brand-primary)" : "var(--grid-border)", color: "#fff" }}>1</div>
              <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === 1 ? "var(--text-main)" : "var(--text-placeholder)" }}>Chọn SP</span>

              <div className="w-4 h-[2px] rounded" style={{ background: step >= 2 ? "var(--brand-primary)" : "var(--grid-border)" }} />

              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: step >= 2 ? "var(--brand-primary)" : "var(--grid-border)", color: step >= 2 ? "#fff" : "var(--text-placeholder)" }}>2</div>
              <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === 2 ? "var(--text-main)" : "var(--text-placeholder)" }}>Nhà cung cấp</span>

              <div className="w-4 h-[2px] rounded" style={{ background: step >= 3 ? "var(--brand-primary)" : "var(--grid-border)" }} />

              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: step >= 3 ? "var(--brand-primary)" : "var(--grid-border)", color: step >= 3 ? "#fff" : "var(--text-placeholder)" }}>3</div>
              <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === 3 ? "var(--text-main)" : "var(--text-placeholder)" }}>Hẹn giao</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ml-2 border border-transparent"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ══════════ STEP 1: Select Products ══════════ */}
        {step === 1 && (
          <>
            {/* Tab Switched */}
            <div className="px-5 pt-3 shrink-0">
              <div className="flex p-1 rounded-xl bg-gray-100" style={{ border: "1px solid var(--grid-border)" }}>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold border ${activeTab === 'orders' ? 'bg-white border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'bg-gray-50 border-transparent text-gray-500'}`}
                >
                  <ListTodo size={16} />
                  Chọn từ đơn hàng
                  {selectedOrders.length > 0 && <span className="bg-[var(--brand-primary)] text-white px-1.5 rounded-full text-[10px] ml-1">{selectedOrders.length}</span>}
                </button>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold border ${activeTab === 'catalog' ? 'bg-white border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'bg-gray-50 border-transparent text-gray-500'}`}
                >
                  <LayoutGrid size={16} />
                  Chọn từ sản phẩm
                  {selectedCatCount > 0 && <span className="bg-[var(--brand-primary)] text-white px-1.5 rounded-full text-[10px] ml-1">{selectedCatCount}</span>}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-5 pt-4">
              {activeTab === "orders" ? (
                <DataTable
                  columns={orderColumns}
                  data={orderDataForTable}
                  searchTerm={search}
                  setSearchTerm={setSearch}
                  searchPlaceholder="Mã đơn, tên khách, tên sản phẩm..."
                  selectedIds={selectedOrderIds}
                  setSelectedIds={() => { }} // dummy, we handle selection specifically
                  onSelectOne={(id) => toggleOrder(eligibleOrders.find(o => o.id === id))}
                  onSelectAll={(checked) => {
                    const allKeys = [];
                    filteredOrders.forEach(o => {
                      (o.products || []).forEach((_, idx) => allKeys.push(`${o.id}-${idx}`));
                    });
                    if (!checked) setSelectedProductKeys(new Set());
                    else setSelectedProductKeys(new Set(allKeys));
                  }}
                  renderDetail={(o) => (
                    <div className="flex flex-col gap-2 p-2 bg-slate-50/50 rounded-xl">
                      {o.products?.map((p, pIdx) => {
                        const key = `${o.id}-${pIdx}`;
                        const isPSelected = selectedProductKeys.has(key);
                        return (
                          <div
                            key={key}
                            onClick={() => toggleProduct(o, pIdx)}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent cursor-pointer"
                            style={{
                              background: isPSelected ? "white" : "transparent",
                              borderColor: isPSelected ? "var(--brand-primary)" : "transparent",
                              boxShadow: isPSelected ? "0 2px 8px -2px rgba(0,0,0,0.05)" : "none"
                            }}
                          >
                            <div className="shrink-0">
                              {isPSelected
                                ? <CheckSquare size={16} className="text-[var(--brand-primary)]" />
                                : <Square size={16} className="text-gray-300" />
                              }
                            </div>
                            <div className="w-8 h-8 rounded border overflow-hidden shrink-0 bg-gray-50">
                              <img src={p.image || p.img || "https://placehold.co/40"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-[var(--text-main)] truncate">{p.name || p.productName}</p>
                              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                                {p.material} • {p.size || p.specs || "—"}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-[13px] font-black text-[var(--brand-primary)]">{p.qty || 1}</span>
                              <span className="text-[10px] text-[var(--text-placeholder)] ml-1">{p.unit || "Cái"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  pagination={{
                    total: filteredOrders.length,
                    itemsPerPage: 50,
                    currentPage: 1,
                    setCurrentPage: () => { },
                    setItemsPerPage: () => { }
                  }}
                />
              ) : (
                <DataTable
                  columns={catalogColumns}
                  data={catalogDataForTable}
                  searchTerm={catSearch}
                  setSearchTerm={setCatSearch}
                  searchPlaceholder="Tên, mã sản phẩm..."
                  extraFilters={
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-[13px] font-bold cursor-pointer border border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                    >
                      <Plus size={14} /> Thêm sản phẩm
                    </button>
                  }
                  pagination={{
                    total: catalogDataForTable.length,
                    itemsPerPage: 50,
                    currentPage: 1,
                    setCurrentPage: () => { },
                    setItemsPerPage: () => { }
                  }}
                />
              )}
            </div>

            {/* Footer Step 1 */}
            <div className="px-5 py-4 border-t shrink-0 flex items-center justify-end bg-white" style={{ borderColor: "var(--grid-border)" }}>
              <button
                onClick={goToStep2}
                disabled={selectedProductKeys.size === 0 && selectedCatCount === 0}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-[13px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: "var(--brand-primary)" }}
              >
                Tiếp tục chọn NCC <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}


        {showCustomForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
              {/* Sub-modal Header */}
              <div className="px-4 py-3 border-b bg-[var(--status-focus)]/30 shrink-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-black text-[var(--brand-primary)] uppercase tracking-tight flex items-center gap-2">
                    <Package size={14} /> Nhập thông tin sản phẩm mới
                  </h4>
                  <button onClick={() => setShowCustomForm(false)} className="text-gray-400 cursor-pointer p-1 rounded-full"><X size={16} /></button>
                </div>
              </div>

              {/* Sub-modal Body */}
              <div className="p-4 flex-1">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-[var(--text-placeholder)] uppercase mb-1 ml-0.5 tracking-wider">Tên sản phẩm *</label>
                    <input
                      placeholder="Tên sản phẩm..."
                      className="w-full px-3 py-1.5 text-[12px] rounded-md border border-gray-200 focus:border-[var(--brand-primary)] outline-none bg-gray-50/20"
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-[var(--text-placeholder)] uppercase mb-1 ml-0.5 tracking-wider">Mã sản phẩm</label>
                    <input
                      placeholder="Mã tự động..."
                      className="w-full px-3 py-1.5 text-[12px] font-mono rounded-md border border-gray-200 focus:border-[var(--brand-primary)] outline-none bg-gray-50/20"
                      value={newProduct.code}
                      onChange={e => setNewProduct({ ...newProduct, code: e.target.value, isManualCode: true })}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-[var(--text-placeholder)] uppercase mb-1 ml-0.5 tracking-wider">Chất liệu</label>
                    <input
                      type="text"
                      placeholder="..."
                      className="w-full px-3 py-1.5 text-[12px] rounded-md border border-gray-200 focus:border-[var(--brand-primary)] outline-none bg-gray-50/20"
                      value={newProduct.material}
                      onChange={e => {
                        setNewProduct({ ...newProduct, material: e.target.value });
                        setShowWoodDropdown(true);
                      }}
                      onFocus={() => setShowWoodDropdown(true)}
                      onBlur={() => setTimeout(() => setShowWoodDropdown(false), 200)}
                    />
                    {showWoodDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-xl z-50 overflow-hidden border-slate-100 ring-1 ring-black/5">
                        <div className="max-h-32 overflow-y-auto p-0.5">
                          {WOOD_TYPES.filter(w => w.toLowerCase().includes(newProduct.material.toLowerCase())).map(w => (
                            <div
                              key={w}
                              className="px-2.5 py-1.5 text-[12px] cursor-pointer rounded font-bold text-slate-700"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNewProduct({ ...newProduct, material: w });
                                setShowWoodDropdown(false);
                              }}
                            >
                              {w}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-bold text-[var(--text-placeholder)] uppercase mb-1 ml-0.5 tracking-wider">Màu sắc</label>
                    <input
                      type="text"
                      placeholder="..."
                      className="w-full px-3 py-1.5 text-[12px] rounded-md border border-gray-200 focus:border-[var(--brand-primary)] outline-none bg-gray-50/20"
                      value={newProduct.color}
                      onChange={e => {
                        setNewProduct({ ...newProduct, color: e.target.value });
                        setShowColorDropdown(true);
                      }}
                      onFocus={() => setShowColorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowColorDropdown(false), 200)}
                    />
                    {showColorDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-xl z-50 overflow-hidden border-slate-100 ring-1 ring-black/5">
                        <div className="max-h-32 overflow-y-auto p-0.5">
                          {COLORS.filter(c => c.toLowerCase().includes(newProduct.color.toLowerCase())).map(c => (
                            <div
                              key={c}
                              className="px-2.5 py-1.5 text-[12px] cursor-pointer rounded font-bold text-slate-700"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNewProduct({ ...newProduct, color: c });
                                setShowColorDropdown(false);
                              }}
                            >
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[var(--text-placeholder)] uppercase mb-1 ml-0.5 tracking-wider">KT (D-R-C) & Số lượng</label>
                    <div className="flex items-center gap-1.5">
                      {[
                        { l: 'D', f: 'length' }, { l: 'R', f: 'width' }, { l: 'C', f: 'height' }
                      ].map(d => (
                        <input key={d.f} placeholder={d.l} type="number" className="w-[50px] px-1 py-1.5 text-[12px] text-center rounded-md border border-gray-200 outline-none bg-gray-50/20 focus:border-[var(--brand-primary)]"
                          value={newProduct[d.f]} onChange={e => setNewProduct({ ...newProduct, [d.f]: e.target.value })}
                        />
                      ))}
                      <div className="flex-1" />
                      <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5">
                        <button onClick={() => setNewProduct({ ...newProduct, qty: Math.max(1, newProduct.qty - 1) })} className="cursor-pointer p-1 rounded-sm text-gray-400 border-none bg-transparent flex items-center justify-center"><Minus size={12} /></button>
                        <span className="text-[12px] font-black min-w-[25px] text-center text-[var(--brand-primary)]">{newProduct.qty}</span>
                        <button onClick={() => setNewProduct({ ...newProduct, qty: newProduct.qty + 1 })} className="cursor-pointer p-1 rounded-sm text-gray-400 border-none bg-transparent flex items-center justify-center"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[var(--text-placeholder)] uppercase mb-1 ml-0.5 tracking-wider">Ghi chú kỹ thuật</label>
                    <textarea
                      placeholder="Yêu cầu riêng biệt..."
                      className="w-full px-3 py-1.5 text-[12px] rounded-md border border-gray-200 outline-none h-14 resize-none bg-gray-50/20 focus:border-[var(--brand-primary)]"
                      value={newProduct.note}
                      onChange={e => setNewProduct({ ...newProduct, note: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between px-0.5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--brand-primary)] uppercase cursor-pointer">
                      <ImagePlus size={14} />
                      Ảnh minh họa
                      <input type="file" multiple className="hidden" onChange={e => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = ev => setNewProduct(prev => ({ ...prev, images: [...prev.images, ev.target.result] }));
                          reader.readAsDataURL(file);
                        });
                      }} />
                    </label>
                    {newProduct.images.length > 0 && <span className="text-[10px] text-gray-400 font-bold">Đã chọn {newProduct.images.length}</span>}
                  </div>

                  {newProduct.images.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-dashed border-gray-200">
                      {newProduct.images.map((img, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-md overflow-hidden border shadow-sm bg-white shrink-0 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div
                            onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-modal Footer */}
              <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-gray-50 shrink-0">
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="text-[13px] font-bold text-gray-400 px-6 py-2 rounded-lg cursor-pointer border border-transparent bg-transparent"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (!newProduct.name) return toast.error("Vui lòng nhập tên sản phẩm");
                    setCustomItems([...customItems, { ...newProduct, id: Date.now() }]);
                    setNewProduct({ name: "", material: "", length: "", width: "", height: "", color: "", qty: 1, note: "", images: [], code: "", isManualCode: false });
                    setShowCustomForm(false);
                    toast.success("Đã thêm sản phẩm");
                  }}
                  className="bg-[var(--brand-primary)] text-white text-[13px] font-bold px-8 py-2 rounded-lg cursor-pointer border-none"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ STEP 2: Select Supplier ══════════ */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-hidden flex flex-col p-5">
              <DataTable
                columns={supplierColumns}
                data={supplierDataForTable.map(s => ({ ...s, id: s.id }))}
                searchTerm={suppSearch}
                setSearchTerm={setSuppSearch}
                searchPlaceholder="Tìm tên xưởng, mã NCC, người liên hệ..."
                selectedIds={selectedSupplier ? [selectedSupplier.id] : []}
                setSelectedIds={() => { }} // Enable checkbox column
                onSelectOne={(id) => {
                  const s = INITIAL_SUPPLIERS.find(it => it.id === id);
                  setSelectedSupplier(s);
                }}
                onRowClick={(s) => setSelectedSupplier(s)}
                pagination={{
                  total: supplierDataForTable.length,
                  itemsPerPage: INITIAL_SUPPLIERS.length,
                  currentPage: 1,
                  setCurrentPage: () => { },
                  setItemsPerPage: () => { }
                }}
              />
            </div>

            {/* Footer Step 3 */}
            <div className="px-5 py-4 border-t shrink-0 flex items-center justify-end gap-3 bg-white" style={{ borderColor: "var(--grid-border)" }}>
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1.5 px-8 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer border"
                style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
              >
                <ChevronLeft size={16} /> Quay lại
              </button>
              <button
                onClick={goToStep3}
                disabled={!selectedSupplier}
                className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-[13px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: "var(--brand-primary)" }}
              >
                Tiếp tục hẹn giao <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ══════════ STEP 3: Schedule Delivery & Finalize ══════════ */}
        {step === 3 && (
          <>
            <div className="flex-1 overflow-hidden flex flex-col p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                {/* Left: Product Summary */}
                <div className="flex flex-col h-full overflow-hidden">
                  <h3 className="text-[13px] font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Package size={16} className="text-[var(--brand-primary)]" />
                    Chia nhóm theo đơn gốc để hẹn ngày
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    {Object.entries(groupedItems).map(([code, group]) => {
                      const pickedDate = orderDates[code] || "";

                      return (
                        <div key={code} className="space-y-3">
                          {/* Group Header & Date Picker */}
                          <div className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 transition-all hover:bg-white hover:border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{code === "DANH-MUC" || code === "MO-TAO" ? "Nhập bổ sung" : `Đơn gốc: ${code}`}</p>
                                <p className="text-[14px] font-bold text-gray-800">{group.name}</p>
                              </div>
                              {group.deadline && (
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Hạn khách giao</p>
                                  <p className="text-[12px] font-black text-rose-600">{new Date(group.deadline).toLocaleDateString("vi-VN")}</p>
                                </div>
                              )}
                            </div>

                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-white focus:border-[var(--brand-primary)] outline-none transition-all text-[14px] font-bold uppercase text-gray-800"
                                value={pickedDate}
                                onChange={(e) => setOrderDates(prev => ({ ...prev, [code]: e.target.value }))}
                              />
                            </div>
                          </div>

                          {/* Items in this group */}
                          <div className="grid grid-cols-1 gap-2 pl-4">
                            {group.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 rounded-xl border border-white bg-white/40">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border bg-white shrink-0">
                                  <img src={item.image || "https://placehold.co/40"} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold truncate leading-tight uppercase tracking-tight text-gray-600">{item.productName}</p>
                                </div>
                                <div className="shrink-0 text-[12px] font-black text-gray-400">×{item.qty}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Date & Supplier Summary */}
                <div className="space-y-6">

                  <div className="p-5 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/30 relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nhà cung cấp đã chọn</p>
                        <p className="text-[16px] font-bold text-gray-800 truncate">{selectedSupplier?.name}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{selectedSupplier?.phone} • {selectedSupplier?.contactPerson}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ghi chú chung cho xưởng</label>
                      <textarea
                        placeholder="Yêu cầu chung cho cả chuyến hàng này..."
                        className="w-full px-4 py-3 text-[13px] rounded-xl border border-gray-100 outline-none focus:border-[var(--brand-primary)] bg-white h-24 resize-none transition-all shadow-inner"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <ListTodo size={16} />
                        <span className="text-[11px] font-black uppercase">Hướng dẫn</span>
                      </div>
                      <p className="text-[12px] text-gray-500 leading-relaxed italic">
                        Anh hãy nhìn hạn giao khách của từng đơn rồi tự điền ngày mong muốn xưởng trả hàng. Hệ thống không còn tự động tính toán để anh linh hoạt nhất.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Step 3 */}
            <div className="px-5 py-4 border-t shrink-0 flex items-center justify-end gap-3 bg-white" style={{ borderColor: "var(--grid-border)" }}>
              <button
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-1.5 px-8 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer border"
                style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
              >
                <ChevronLeft size={16} /> Quay lại
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-[13px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: "var(--brand-primary)" }}
              >
                <Check size={18} /> HOÀN TẤT & LẬP PHIẾU
              </button>
            </div>
          </>
        )}
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-8"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer border-none"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
