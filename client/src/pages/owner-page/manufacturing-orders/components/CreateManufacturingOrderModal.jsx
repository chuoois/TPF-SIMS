/**
 * CreateManufacturingOrderModal
 * 2-Step Wizard: Bước 1 — Tick chọn đơn hàng | Bước 2 — Xem lại (read-only) & Tạo phiếu
 * Thông tin SP đã đầy đủ từ sale, chủ chỉ cần chọn và xác nhận.
 */

import { useState, useMemo, useEffect } from "react";
import {
  X, Check, ChevronLeft, ChevronRight,
  FileStack, Package, Search, Building2,
  CheckSquare, Square, Users, Layers,
  TreePine, Palette, Ruler, Plus, Minus,
  ShoppingCart, LayoutGrid, ListTodo,
  PackageCheck, ImagePlus, ClipboardEdit,
  StickyNote, AlertTriangle, Sparkles,
  ChevronDown, Trash2, Calendar, Paintbrush,
  Upload, Image as ImageIcon,
} from "lucide-react";
import { formatDateVN } from "@/lib/dateUtils";


// UI Constants for autocomplete
const ELIGIBLE_TYPES = ["Hàng khách đặt"];
const ELIGIBLE_STATUSES = ["Chờ xử lý", "Chờ sản xuất", "Đang gia công"];

import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import manufacturingOrderService from "@/services/manufacturingOrder.service";
import productAttributeService from "@/services/productAttribute.service";


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

// Helper: get display size
const getDisplaySize = (item) => {
  const size = item.item_size || item.size || item.dimensions;
  if (!size) return "—";
  if (typeof size === "string") return size;
  
  const { length, width, height } = size;
  const parts = [
    length ? `D${length}` : "",
    width ? `R${width}` : "",
    height ? `C${height}` : "",
  ]
    .filter(Boolean)
    .join(" × ");
  return parts || "—";
};


// genId function removed as it is now handled by the backend


// ── Step 2 Sub-component ──
const ReviewItem = ({ item, isCustom }) => {
  const sizeDisplay = getDisplaySize(item);

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
        {(item.isBundle === 1 || item.item_is_bundle === 1 || item.is_bundle === 1) && item.bundleItems && (
          <div className="mt-2 text-[11px] bg-white/50 p-1.5 rounded-lg border border-dashed border-gray-200">
            <strong>Gồm:</strong> {item.bundleItems.map(b => `${b.quantity}x ${b.name}`).join(", ")}
          </div>
        )}
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

export default function CreateManufacturingOrderModal({ orders, catalogProducts, suppliers, onClose, onCreated }) {

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
  const [itemConfigs, setItemConfigs] = useState({}); // { itemId: { price, expectedDate } }
  const [deposit, setDeposit] = useState(0);

  const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v || 0) + " ₫";

  const [attributes, setAttributes] = useState({ categories: [], colors: [], materials: [], rooms: [] });

  useEffect(() => {
    productAttributeService.getAllAttributes().then(res => {
      // The API returns the data object directly
      if (res && res.categories) {
        setAttributes({
          categories: res.categories?.map(c => c.category_name) || [],
          colors: res.colors?.map(c => c.color_name) || [],
          materials: res.materials?.map(m => m.material_name) || [],
          rooms: res.rooms?.map(r => r.room_name) || []
        });
      }
    }).catch(err => console.error("Failed to load attributes:", err));
  }, []);

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customItems, setCustomItems] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "", material: "", length: "", width: "", height: "", color: "", qty: 1, note: "", images: [], code: "", isManualCode: false,
    isBundle: 0, bundleItems: [], category: "", room: ""
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  const handleSwitchTab = (tab) => {
    if (tab === activeTab) return;
    
    // Nếu đang chọn bên này mà chuyển sang bên kia, xóa sạch lựa chọn cũ để tránh lặp/lẫn dữ liệu
    if (tab === "catalog" && selectedProductKeys.size > 0) {
      setSelectedProductKeys(new Set());
      toast("Đã xóa các lựa chọn theo Nhà cung cấp");
    } else if (tab === "orders" && selectedCatCount > 0) {
      setSelectedCatalogProducts({});
      setCustomItems([]);
      toast("Đã xóa các lựa chọn theo Sản phẩm");
    }
    
    setActiveTab(tab);
  };

  // ── Eligible orders (CustomRequests) ──
  const eligibleOrders = useMemo(() =>
    (orders || []).filter((o) => {
      // 3: Ordered/Confirmed status
      return o.status === 3 || o.status === "3";
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return eligibleOrders;
    return eligibleOrders.filter((o) =>
      (o.request_code || "").toLowerCase().includes(q) ||
      (o.customer?.full_name || "").toLowerCase().includes(q) ||
      (o.customer?.phone_number || "").includes(q) ||
      o.items?.some(it => (it.item_name || "").toLowerCase().includes(q))
    );
  }, [eligibleOrders, search]);


  // ── Catalog products filter ──
  const filteredCatalog = useMemo(() => {
    const q = catSearch.toLowerCase().trim();
    if (!q) return catalogProducts || [];
    return (catalogProducts || []).filter((p) =>
      (p.product_name || p.name || "").toLowerCase().includes(q) ||
      (p.sku || p.code || "").toLowerCase().includes(q)
    );
  }, [catalogProducts, catSearch]);


  // ── Suppliers filter ──
  const filteredSuppliersForStep1 = useMemo(() => {
    const q = suppSearch.toLowerCase().trim();
    const base = (suppliers || []).map(s => {
      // Map backend fields to frontend expected fields
      const normalizedS = {
        ...s,
        id: s.pk_supplier_id,
        name: s.supplier_name,
        code: `NCC#${s.pk_supplier_id}`,
        phone: s.phone_number,
        contactPerson: s.contact_person,
        address: s.address
      };


      // 1. Nhóm sản phẩm từ yêu cầu khách hàng (CustomRequest) đã gán cho NCC này
      const orderItems = [];
      eligibleOrders.forEach(order => {
        (order.items || []).forEach(it => {
          if (String(it.fk_supplier_id) === String(s.pk_supplier_id)) {
            orderItems.push({
              ...it,
              id: it.pk_custom_request_item_id,
              name: it.item_name,
              material: it.item_material,
              size: it.item_size,
              qty: it.item_quantity,
              unit: it.item_unit || "Cái",
              image: it.item_img,
              color: it.item_color || "",
              isBundle: it.item_is_bundle || 0,
              bundleItems: it.item_bundle_items || null,
              hasManufacturingOrder: !!it.manufacturingDetail,
              deliveryDate: it.expected_supplier_date ? it.expected_supplier_date.split("T")[0] : "",
              importPrice: it.item_cost_price || 0,
              fk_custom_request_item_id: it.pk_custom_request_item_id,
              fk_product_id: it.fk_product_id || null,
              sourceOrder: order.request_code,
              sourceOrderData: order
            });
          }
        });
      });

      return {
        ...normalizedS,
        products: orderItems
      };



    });

    if (!q) return base;
    return base.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q))
    );
  }, [catalogProducts, suppSearch]);

  // ── Toggle selection ──
  const toggleProduct = (supplier, product) => {
    const key = `${supplier.id}-${product.id}`;
    setSelectedProductKeys(prev => {
      const next = new Set(prev);
      
      // Ràng buộc: Một yêu cầu nhập hàng chỉ gửi cho 1 NCC duy nhất
      // Nếu chọn sản phẩm của NCC khác, xóa các lựa chọn của NCC trước đó
      const existingKeys = Array.from(next);
      if (existingKeys.length > 0) {
        const firstKeySupplierId = existingKeys[0].split('-')[0];
        if (firstKeySupplierId !== supplier.id) {
          next.clear();
        }
      }

      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSupplierRow = (supplier) => {
    const pKeys = (supplier.products || [])
      .filter(p => !p.hasManufacturingOrder)
      .map(p => `${supplier.id}-${p.id}`);
    const allSelected = pKeys.length > 0 && pKeys.every(k => selectedProductKeys.has(k));

    setSelectedProductKeys(prev => {
      const next = new Set(prev);
      
      // Xóa NCC khác nếu có
      const existingKeys = Array.from(next);
      if (existingKeys.length > 0) {
        const firstKeySupplierId = existingKeys[0].split('-')[0];
        if (firstKeySupplierId !== supplier.id) {
          next.clear();
        }
      }

      if (allSelected) {
        pKeys.forEach(k => next.delete(k));
      } else {
        pKeys.forEach(k => next.add(k));
      }
      return next;
    });
  };

  const toggleAllSuppliers = (checked) => {
    if (checked === false) {
      setSelectedProductKeys(new Set());
      return;
    }
    // Với logic mới (1 NCC/phiếu), toggle all có lẽ không nên áp dụng cho toàn bộ danh sách NCC
    // mà chỉ nên áp dụng cho NCC đang được mở rộng. 
    // Tuy nhiên để giữ tính nhất quán, ta có thể để người dùng chọn NCC nào thì NCC đó được chọn tất cả SP.
    toast.error("Vui lòng chọn sản phẩm theo từng nhà cung cấp");
  };

  const selectedSuppliersFromStep1 = useMemo(() => {
    const supplierIds = new Set();
    selectedProductKeys.forEach(key => {
      const lastDash = key.lastIndexOf("-");
      if (lastDash !== -1) {
        supplierIds.add(key.substring(0, lastDash));
      }
    });
    return (suppliers || []).filter(s => supplierIds.has(s.id));

  }, [selectedProductKeys]);


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

  // 1. Suppliers Tab (New Version of Orders Tab)
  const supplierColumnsStep1 = [
    {
      header: "Mã NCC",
      key: "code",
      render: (s) => (
        <span className="text-[13px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-800">
          {s.code}
        </span>
      )
    },
    {
      header: "Tên Nhà Cung Cấp",
      render: (s) => (
        <div className="flex items-center gap-1 font-semibold text-slate-700">
          <Building2 size={12} className="text-slate-400" />
          {s.name}
        </div>
      )
    },
    {
      header: "Số Sản Phẩm Cung Cấp",
      render: (s) => (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
          {s.products?.filter(p => !p.hasManufacturingOrder).length || 0} loại
        </span>
      )
    },
    {
      header: "Tỉ Lệ Chọn",
      className: "text-center",
      render: (s) => {
        const availableProducts = (s.products || []).filter(p => !p.hasManufacturingOrder);
        const pKeys = availableProducts.map(p => `${s.id}-${p.id}`);
        const selectedInRow = pKeys.filter(k => selectedProductKeys.has(k));
        return (
          <span className={`font-bold ${selectedInRow.length > 0 ? 'text-[var(--brand-primary)]' : 'text-[var(--text-placeholder)]'}`}>
            {selectedInRow.length}/{availableProducts.length || 0} SP
          </span>
        );
      }
    },
    {
      header: "Tổng Số Sản Phẩm",
      className: "text-right",
      render: (s) => (
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-black" style={{ color: "var(--text-main)" }}>
            {s.products?.filter(p => !p.hasManufacturingOrder).length || 0}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>chiếc</span>
        </div>
      )
    }
  ];

  const supplierDataForStep1 = useMemo(() => {
    return filteredSuppliersForStep1.map(s => ({
      ...s,
      id: s.id
    }));
  }, [filteredSuppliersForStep1]);

  const selectedSupplierRowIds = useMemo(() => {
    return filteredSuppliersForStep1.filter(s => {
      const pKeys = (s.products || [])
        .filter(p => !p.hasManufacturingOrder)
        .map(p => `${s.id}-${p.id}`);
      return pKeys.length > 0 && pKeys.every(k => selectedProductKeys.has(k));
    }).map(s => s.id);
  }, [filteredSuppliersForStep1, selectedProductKeys]);

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
    const items = (catalogProducts || []).map(p => ({
      ...p,
      id: p.pk_product_id || p.id,
      name: p.product_name || p.name,
      code: p.sku || p.code || "CUSTOM",
      image: p.product_img || p.image || p.img,
      material: p.material_name || p.material || "—"
    }));
    const custom = customItems.map(ci => ({ ...ci, id: ci.id }));
    return [...custom, ...items];
  }, [catalogProducts, customItems]);


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
    const base = (suppliers || []).map(s => ({
      ...s,
      id: s.pk_supplier_id,
      name: s.supplier_name,
      code: `NCC#${s.pk_supplier_id}`,
      phone: s.phone_number,
      contactPerson: s.contact_person,
      address: s.address
    }));
    if (!q) return base;
    return base.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.contactPerson?.toLowerCase().includes(q) ||
      (s.specialty && s.specialty.toLowerCase().includes(q))
    );
  }, [suppSearch, suppliers]);



  // ── Build items from selected suppliers (carry ALL product fields as-is) ──
  const buildItems = () => {
    const items = [];
    // 1. From Suppliers Step 1
    filteredSuppliersForStep1.forEach(supplier => {
      (supplier.products || []).forEach(p => {
        if (!selectedProductKeys.has(`${supplier.id}-${p.id}`)) return;

        // Cross-reference: tìm đơn khách hàng chứa sản phẩm này
        let sourceKey = supplier.code || supplier.id;
        let sourceDetail = {
          customerName: supplier.name,
          type: "Hàng nhập xưởng",
        };

        const matchedOrder = p.sourceOrderData || eligibleOrders.find(order =>
          (order.items || []).some(op => {
            const opName = (op.item_name || op.productName || "").toLowerCase().trim();
            const pName = (p.product_name || p.name || p.productName || "").toLowerCase().trim();
            const opId = op.fk_product_id || op.id;
            const pId = p.pk_product_id || p.id;
            return (opName && pName && opName === pName) || (opId && pId && opId === pId);
          })
        );

        if (matchedOrder) {
          sourceKey = matchedOrder.request_code || matchedOrder.code || matchedOrder.id;
          sourceDetail = {
            customerName: matchedOrder.customer?.full_name || matchedOrder.customerName || matchedOrder.customer?.name || "Khách lẻ",
            type: "Hàng khách đặt",
            deadline: matchedOrder.expected_fulfillment_date || matchedOrder.deliveryDate,
          };
        }


        items.push({
          id: Math.random().toString(36).substr(2, 9),
          productName: p.name || p.productName || "",
          material: p.material || p.woodType || "",
          size: p.size || p.specs || p.dimensions || "",
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
          importPrice: p.importPrice || p.price || 0,
          deliveryDate: p.deliveryDate || matchedOrder?.deadline || "",
          customerDeadline: matchedOrder?.deadline || p.deliveryDate || "",
          isBundle: p.isBundle || 0,
          bundleItems: p.bundleItems || null,
          fk_custom_request_item_id: p.fk_custom_request_item_id,
          fk_product_id: p.fk_product_id,
          sourceOrders: [sourceKey],
          sourceOrderDetails: {
            [sourceKey]: sourceDetail,
          },
        });
      });
    });

    // 2. From Catalog
    Object.entries(selectedCatalogProducts).forEach(([pId, qty]) => {
      const p = catalogProducts.find(cp => String(cp.pk_product_id || cp.id) === String(pId));
      if (!p) return;
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        productName: p.product_name || p.name || "",
        material: p.material_name || p.material || "",
        size: p.dimensions || p.size || "",
        color: p.color_name || p.color || "",
        finish: p.finish || "Để mộc",
        qty: qty,
        unit: p.unit || "Cái",
        note: "Sản phẩm nhập thêm (từ danh mục)",
        image: p.product_img || p.img || p.image || "",
        importPrice: p.importPrice || p.display_price || p.price || 0,
        deliveryDate: p.deliveryDate || "",
        customerDeadline: p.deliveryDate || "",
        fk_product_id: p.pk_product_id || p.id,
        isBundle: p.is_bundle || p.isBundle || 0,
        bundleItems: p.bundle_items || p.bundleItems || null,
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
        note: [ci.category && `Danh mục: ${ci.category}`, ci.room && `Phòng: ${ci.room}`, ci.note].filter(Boolean).join(" - ") || "Sản phẩm mới nhập thêm",
        image: ci.images?.[0] || "",
        images: ci.images || [],
        isBundle: ci.isBundle || 0,
        bundleItems: ci.bundleItems || null,
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

  // Initialize dates for each group when transitioning to Step 3 (Read-only display)
  useEffect(() => {
    if (step === 3) {
      setOrderDates(prev => {
        const next = { ...prev };
        Object.entries(groupedItems).forEach(([code, group]) => {
          if (!next[code]) {
            if (group.deadline) {
              next[code] = new Date(group.deadline).toISOString().split('T')[0];
            } else {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              next[code] = tomorrow.toISOString().split('T')[0];
            }
          }
        });
        return next;
      });

      // Initialize per-item configs
      setItemConfigs(prev => {
        const next = { ...prev };
        items.forEach(it => {
          if (!next[it.id]) {
            const src = it.sourceOrders?.[0] || "KHAC";
            const groupDeadline = groupedItems[src]?.deadline;
            const defaultDate = groupDeadline
              ? new Date(groupDeadline).toISOString().split('T')[0]
              : new Date(Date.now() + 86400000).toISOString().split('T')[0];
            next[it.id] = { price: 0, expectedDate: defaultDate };
          }
        });
        return next;
      });
    }
  }, [step, groupedItems, items]);

  const totalImportAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.importPrice || 0) * (item.qty || 1);
    }, 0);
  }, [items]);

  const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
  const totalSelectedFromOrders = selectedProductKeys.size;
  const totalSelectedFromCatalog = Object.values(selectedCatalogProducts).reduce((s, q) => s + q, 0) + customItems.reduce((s, i) => s + i.qty, 0);

  const handleNext = () => {
    if (step === 1) {
      const items = buildItems();
      if (items.length === 0) {
        toast.error("Vui lòng chọn ít nhất một sản phẩm");
        return;
      }

      // Tự động nhận diện nhà cung cấp nếu tất cả SP thuộc về 1 NCC
      const supplierIds = new Set();
      selectedProductKeys.forEach(key => {
        const [suppId] = key.split("-");
        supplierIds.add(suppId);
      });

      if (supplierIds.size === 1 && Object.keys(selectedCatalogProducts).length === 0 && customItems.length === 0) {
        const autoId = Array.from(supplierIds)[0];
        const found = suppliers.find(s => String(s.pk_supplier_id || s.id) === String(autoId));
        if (found) {
          setSelectedSupplier({
            ...found,
            id: found.pk_supplier_id || found.id,
            name: found.supplier_name || found.name,
            code: `NCC#${found.pk_supplier_id || found.id}`
          });
          setStep(3); // Nhảy thẳng sang bước review
          return;
        }
      }

      setStep(2);
    } else if (step === 2) {
      if (!selectedSupplier) {
        toast.error("Vui lòng chọn nhà cung cấp!");
        return;
      }
      setStep(3);
    }
  };

  // ── Save ──
  const handleSave = async () => {
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

    try {
      const payloadItems = finalItems.map(it => {
        const src = it.sourceOrders?.[0] || "KHAC";
        // Map to backend schema
        return {
          fk_product_id: it.fk_product_id ? Number(it.fk_product_id) : null,
          fk_custom_request_item_id: it.fk_custom_request_item_id ? Number(it.fk_custom_request_item_id) : null,
          item_name: it.productName,
          item_material: it.material,
          item_size: it.size,
          item_color: it.color,
          item_is_bundle: it.isBundle || 0,
          item_bundle_items: it.bundleItems || null,
          quantity: it.qty,
          import_price: it.importPrice,
          expected_date: orderDates[src],
          note: it.note
        };
      });

      const payload = {
        fk_supplier_id: selectedSupplier?.pk_supplier_id || selectedSupplier?.id,
        note: note.trim(),
        deposit_amount: deposit,
        expected_delivery_date: Object.values(orderDates).sort()[0] || "",
        items: payloadItems
      };

      await manufacturingOrderService.createOrder(payload);
      toast.success(`Đã tạo yêu cầu nhập hàng thành công!`);
      onCreated?.();
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo phiếu nhập hàng");
    }
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
                    ? `Bước 1/2 — Đã chọn ${selectedSuppliersFromStep1.length} NCC (${selectedProductKeys.size} SP)`
                    : `Bước 1/3 — Đã chọn ${selectedCatCount} loại SP (${totalSelectedFromCatalog} chiếc)`
                ) : step === 2 ? (
                  "Bước 2/3 — Chọn nhà cung cấp gia công"
                ) : (
                  activeTab === "orders"
                    ? "Bước 2/2 — Hẹn ngày giao & Hoàn tất phiếu"
                    : "Bước 3/3 — Hẹn ngày giao & Hoàn tất phiếu"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {activeTab === "orders" ? (
                <>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                    style={{ background: step >= 1 ? "var(--brand-primary)" : "var(--grid-border)", color: "#fff" }}>1</div>
                  <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === 1 ? "var(--text-main)" : "var(--text-placeholder)" }}>Chọn SP & NCC</span>

                  <div className="w-4 h-[2px] rounded" style={{ background: step >= 3 ? "var(--brand-primary)" : "var(--grid-border)" }} />

                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                    style={{ background: step >= 3 ? "var(--brand-primary)" : "var(--grid-border)", color: step >= 3 ? "#fff" : "var(--text-placeholder)" }}>2</div>
                  <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === 3 ? "var(--text-main)" : "var(--text-placeholder)" }}>Hẹn giao</span>
                </>
              ) : (
                <>
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
                </>
              )}
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
                  onClick={() => handleSwitchTab("orders")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold border ${activeTab === 'orders' ? 'bg-white border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'bg-gray-50 border-transparent text-gray-500'}`}
                >
                  <Building2 size={16} />
                  Chọn từ nhà cung cấp
                  {selectedSuppliersFromStep1.length > 0 && <span className="bg-[var(--brand-primary)] text-white px-1.5 rounded-full text-[10px] ml-1">{selectedSuppliersFromStep1.length}</span>}
                </button>
                <button
                  onClick={() => handleSwitchTab("catalog")}
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
                  columns={supplierColumnsStep1}
                  data={supplierDataForStep1}
                  searchTerm={suppSearch}
                  setSearchTerm={setSuppSearch}
                  searchPlaceholder="Mã NCC, tên nhà cung cấp, SĐT..."
                  selectedIds={selectedSupplierRowIds}
                  setSelectedIds={(ids) => {
                    if (ids?.length === 0) setSelectedProductKeys(new Set());
                  }}
                  onSelectOne={(id) => toggleSupplierRow(filteredSuppliersForStep1.find(s => s.id === id))}
                  onSelectAll={(checked) => toggleAllSuppliers(checked)}
                  hideSelectionToolbar={true}
                  selectionMode="single"
                  renderDetail={(s) => (
                    <div className="flex flex-col gap-2 p-2 bg-slate-50/50 rounded-xl">
                      {s.products?.filter(p => !p.hasManufacturingOrder).map((p, pIdx) => {
                        const key = `${s.id}-${p.id}`;
                        const isPSelected = selectedProductKeys.has(key);
                        return (
                          <div
                            key={key}
                            onClick={() => { toggleProduct(s, p); }}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent cursor-pointer"
                            style={{
                              background: isPSelected ? "white" : "transparent",
                              borderColor: isPSelected ? "var(--brand-primary)" : "transparent",
                              boxShadow: isPSelected ? "0 2px 8px -2px rgba(0,0,0,0.05)" : "none"
                            }}
                          >
                            <div className="shrink-0">
                              {isPSelected ? (
                                <CheckSquare size={16} className="text-[var(--brand-primary)]" />
                              ) : (
                                <Square size={16} className="text-gray-300" />
                              )}
                            </div>
                            <div className="w-8 h-8 rounded border overflow-hidden shrink-0 bg-gray-50">
                              <img src={p.product_img || p.image || p.img || "https://placehold.co/40"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-[12px] font-bold text-[var(--text-main)] truncate">{p.name || p.product_name || p.productName}</p>
                                {p.sourceOrder && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-700 uppercase tracking-tighter">
                                    {p.sourceOrder}
                                  </span>
                                )}
                                {!p.sourceOrder && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-500 uppercase tracking-tighter">
                                    Danh mục
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                                {p.material_name || p.material} • {getDisplaySize(p) || p.specs || "—"}
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
                onClick={handleNext}

                disabled={selectedProductKeys.size === 0 && selectedCatCount === 0}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-[13px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                style={{ background: "var(--brand-primary)" }}
              >
                {(activeTab === "orders" && selectedSuppliersFromStep1.length > 0)
                  ? "Tiếp tục hẹn giao"
                  : "Tiếp tục chọn NCC"} 
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}


        {showCustomForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowCustomForm(false)} />
            <div className="bg-white w-full max-w-[700px] max-h-[90vh] rounded-lg flex flex-col relative shadow-2xl overflow-hidden border border-slate-200">
              {/* Sub-modal Header */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Plus size={16} className="text-[var(--brand-primary)]" /> Thêm sản phẩm mới
                </h2>
                <button onClick={() => setShowCustomForm(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Sub-modal Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="flex gap-6">
                  {/* Left: Image upload */}
                  <div className="w-[160px] shrink-0 space-y-3">
                    <label className="block cursor-pointer group relative">
                      {newProduct.images.length > 0 ? (
                        <img src={newProduct.images[0]} alt="Ảnh SP" className="w-full aspect-square object-cover rounded-xl border group-hover:opacity-70 transition" />
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 rounded-xl border flex flex-col items-center justify-center text-slate-300 group-hover:bg-gray-200 transition">
                          <Upload size={28} className="mb-1" />
                          <span className="text-xs">Chọn ảnh</span>
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                        <Upload size={20} className="text-white" />
                      </div>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = ev => setNewProduct(prev => ({ ...prev, images: [...prev.images, ev.target.result] }));
                          reader.readAsDataURL(file);
                        });
                      }} />
                    </label>
                    {newProduct.images.length > 1 && (
                      <div className="flex flex-wrap gap-1.5">
                        {newProduct.images.map((img, idx) => (
                          <div key={idx} className="relative w-10 h-10 rounded-lg overflow-hidden border bg-white shrink-0 group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <div onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                              className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
                              <X size={10} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Form fields */}
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Tên sản phẩm *</label>
                        <input placeholder="Nhập tên sản phẩm" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white"
                          value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Mã sản phẩm</label>
                        <input placeholder="Mã tự động..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white"
                          value={newProduct.code} onChange={e => setNewProduct({ ...newProduct, code: e.target.value, isManualCode: true })} />
                      </div>
                  <div className="relative">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Chất liệu</label>
                    <input
                      type="text"
                      placeholder="Chọn hoặc nhập chất liệu..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white"
                      value={newProduct.material}
                      onChange={e => {
                        setNewProduct({ ...newProduct, material: e.target.value });
                        setShowWoodDropdown(true);
                      }}
                      onFocus={() => setShowWoodDropdown(true)}
                      onBlur={() => setTimeout(() => setShowWoodDropdown(false), 200)}
                    />
                    {showWoodDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-100">
                        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                          {attributes.materials.filter(w => w.toLowerCase().includes(newProduct.material.toLowerCase())).map(w => (
                            <div
                              key={w}
                              className="px-3 py-2 text-sm cursor-pointer rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNewProduct({ ...newProduct, material: w });
                                setShowWoodDropdown(false);
                              }}
                            >
                              {w}
                            </div>
                          ))}
                          {attributes.materials.filter(w => w.toLowerCase().includes(newProduct.material.toLowerCase())).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-400 italic">Thêm mới: "{newProduct.material}"</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Màu sắc</label>
                    <input
                      type="text"
                      placeholder="Chọn hoặc nhập màu sắc..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white"
                      value={newProduct.color}
                      onChange={e => {
                        setNewProduct({ ...newProduct, color: e.target.value });
                        setShowColorDropdown(true);
                      }}
                      onFocus={() => setShowColorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowColorDropdown(false), 200)}
                    />
                    {showColorDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-100">
                        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                          {attributes.colors.filter(c => c.toLowerCase().includes(newProduct.color.toLowerCase())).map(c => (
                            <div
                              key={c}
                              className="px-3 py-2 text-sm cursor-pointer rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNewProduct({ ...newProduct, color: c });
                                setShowColorDropdown(false);
                              }}
                            >
                              {c}
                            </div>
                          ))}
                          {attributes.colors.filter(c => c.toLowerCase().includes(newProduct.color.toLowerCase())).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-400 italic">Thêm mới: "{newProduct.color}"</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative col-span-1">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Danh mục</label>
                    <input
                      placeholder="Chọn hoặc nhập danh mục..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white"
                      value={newProduct.category}
                      onChange={e => {
                        setNewProduct({ ...newProduct, category: e.target.value });
                        setShowCategoryDropdown(true);
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                    />
                    {showCategoryDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-100">
                        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                          {attributes.categories.filter(c => c.toLowerCase().includes(newProduct.category.toLowerCase())).map(c => (
                            <div
                              key={c}
                              className="px-3 py-2 text-sm cursor-pointer rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNewProduct({ ...newProduct, category: c });
                                setShowCategoryDropdown(false);
                              }}
                            >
                              {c}
                            </div>
                          ))}
                          {attributes.categories.filter(c => c.toLowerCase().includes(newProduct.category.toLowerCase())).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-400 italic">Thêm mới: "{newProduct.category}"</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative col-span-1">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Phòng</label>
                    <input
                      placeholder="Chọn hoặc nhập phòng..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white"
                      value={newProduct.room}
                      onChange={e => {
                        setNewProduct({ ...newProduct, room: e.target.value });
                        setShowRoomDropdown(true);
                      }}
                      onFocus={() => setShowRoomDropdown(true)}
                      onBlur={() => setTimeout(() => setShowRoomDropdown(false), 200)}
                    />
                    {showRoomDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-100">
                        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                          {attributes.rooms.filter(r => r.toLowerCase().includes(newProduct.room.toLowerCase())).map(r => (
                            <div
                              key={r}
                              className="px-3 py-2 text-sm cursor-pointer rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNewProduct({ ...newProduct, room: r });
                                setShowRoomDropdown(false);
                              }}
                            >
                              {r}
                            </div>
                          ))}
                          {attributes.rooms.filter(r => r.toLowerCase().includes(newProduct.room.toLowerCase())).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-400 italic">Thêm mới: "{newProduct.room}"</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Số lượng *</label>
                    <div className="flex items-center gap-1.5 h-[38px]">
                      <div className="flex items-center gap-0.5 bg-gray-50 border border-slate-200 rounded-lg px-2 py-1.5 h-full">
                        <button
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, qty: Math.max(1, newProduct.qty - 1) })}
                          className="cursor-pointer p-1 hover:bg-gray-200 rounded text-slate-500 border-none bg-transparent flex items-center justify-center transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-black min-w-[30px] text-center text-[var(--brand-primary)]">{newProduct.qty}</span>
                        <button
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, qty: newProduct.qty + 1 })}
                          className="cursor-pointer p-1 hover:bg-gray-200 rounded text-slate-500 border-none bg-transparent flex items-center justify-center transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Kích thước (Dân dụng D × R × C) cm
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Dài"
                        className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-center transition bg-white"
                        value={newProduct.length}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setNewProduct({ ...newProduct, length: val });
                        }}
                      />
                      <span className="text-slate-400 font-bold">×</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Rộng"
                        className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-center transition bg-white"
                        value={newProduct.width}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setNewProduct({ ...newProduct, width: val });
                        }}
                      />
                      <span className="text-slate-400 font-bold">×</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Cao"
                        className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-center transition bg-white"
                        value={newProduct.height}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setNewProduct({ ...newProduct, height: val });
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Ghi chú kỹ thuật</label>
                    <textarea
                      placeholder="Nhập yêu cầu kỹ thuật riêng biệt..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] min-h-[72px] resize-none transition bg-white"
                      value={newProduct.note}
                      onChange={e => setNewProduct({ ...newProduct, note: e.target.value })}
                    />
                  </div>

                  {/* Bundle Toggle & List */}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] cursor-pointer mb-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                        checked={newProduct.isBundle === 1}
                        onChange={(e) => {
                          const isBundle = e.target.checked ? 1 : 0;
                          setNewProduct({ ...newProduct, isBundle, bundleItems: isBundle ? [{ name: "", quantity: 1, size: { length: "", width: "", height: "" } }] : [] });
                        }}
                      />
                      Sản phẩm này là một BỘ (gồm nhiều món nhỏ)
                    </label>

                    {newProduct.isBundle === 1 && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                        {newProduct.bundleItems.map((b, bidx) => (
                          <div key={bidx} className="flex gap-2 items-start">
                            <input 
                              placeholder="Tên món (VD: Bàn ăn)"
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[var(--brand-primary)] outline-none bg-white"
                              value={b.name}
                              onChange={(e) => {
                                const newBundle = [...newProduct.bundleItems];
                                newBundle[bidx].name = e.target.value;
                                setNewProduct({ ...newProduct, bundleItems: newBundle });
                              }}
                            />
                            <div className="flex gap-1.5 w-[160px] shrink-0">
                              {['length', 'width', 'height'].map(dim => (
                                <input key={dim} placeholder={dim === 'length' ? 'D' : dim === 'width' ? 'R' : 'C'} 
                                  type="text"
                                  inputMode="decimal"
                                  className="w-full px-2 py-2 text-xs text-center rounded-lg border border-slate-200 focus:border-[var(--brand-primary)] outline-none bg-white"
                                  value={b.size[dim]} 
                                  onChange={e => {
                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                    const newBundle = [...newProduct.bundleItems];
                                    newBundle[bidx].size[dim] = val;
                                    setNewProduct({ ...newProduct, bundleItems: newBundle });
                                  }}
                                />
                              ))}
                            </div>
                            <input 
                              type="text" 
                              inputMode="numeric"
                              placeholder="SL"
                              className="w-14 px-2 py-2 text-sm text-center rounded-lg border border-slate-200 focus:border-[var(--brand-primary)] outline-none bg-white"
                              value={b.quantity}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                const newBundle = [...newProduct.bundleItems];
                                newBundle[bidx].quantity = val;
                                setNewProduct({ ...newProduct, bundleItems: newBundle });
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const newBundle = newProduct.bundleItems.filter((_, i) => i !== bidx);
                                setNewProduct({ ...newProduct, bundleItems: newBundle });
                              }}
                              className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg cursor-pointer shrink-0 border border-slate-100 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, bundleItems: [...newProduct.bundleItems, { name: "", quantity: 1, size: { length: "", width: "", height: "" } }] })}
                          className="flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 cursor-pointer self-start transition"
                        >
                          <Plus size={14} /> Thêm món con
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-modal Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newProduct.name) return toast.error("Vui lòng nhập tên sản phẩm");
                setCustomItems([...customItems, { ...newProduct, id: Date.now() }]);
                setNewProduct({ name: "", material: "", length: "", width: "", height: "", color: "", qty: 1, note: "", images: [], code: "", isManualCode: false, isBundle: 0, bundleItems: [], category: "", room: "" });
                setShowCustomForm(false);
                toast.success("Đã thêm sản phẩm");
              }}
              className="px-6 py-2 bg-[var(--brand-primary)] hover:opacity-90 active:scale-[0.98] text-white rounded-lg text-sm font-semibold transition shadow-md shadow-[var(--brand-primary)]/10 cursor-pointer border-none"
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
                selectionMode="single"
                hideSelectionToolbar={true}
                onSelectOne={(id) => {
                  const s = (suppliers || []).find(it => it.id === id);
                  setSelectedSupplier(s);
                }}
                onRowClick={(s) => setSelectedSupplier(s)}
                pagination={{
                  total: supplierDataForTable.length,
                  itemsPerPage: (suppliers || []).length || 15,

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
                onClick={handleNext}

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
                {/* Left: Product list with per-item date & price */}
                <div className="flex flex-col h-full overflow-hidden">
                  <h3 className="text-[13px] font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Package size={16} className="text-[var(--brand-primary)]" />
                    Danh sách sản phẩm — Hẹn ngày & Giá nhập
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {items.map((item) => {
                      return (
                        <div key={item.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-3">
                          {/* Product info row */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border bg-gray-50 shrink-0">
                              <img src={item.image || "https://placehold.co/40"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-black uppercase tracking-tight text-gray-800 truncate">{item.productName}</p>
                              <p className="text-[10px] text-gray-500 font-bold">{item.material} • {getDisplaySize(item)}</p>
                            </div>
                            <div className="shrink-0 text-[14px] font-black text-[var(--brand-primary)]">×{item.qty}</div>
                          </div>
                          {/* Date & Price row (read-only) */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ngày hẹn giao</label>
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50/50">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-[13px] font-black text-gray-700">
                                  {formatDateVN(item.deliveryDate) || "Chưa xác định"}

                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá nhập</label>
                              <div className="px-3 py-2 rounded-lg border border-indigo-100 bg-indigo-50/30">
                                <span className="text-[13px] font-black text-indigo-700">
                                  {item.importPrice ? fmt(item.importPrice) : "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bundle detail display in Step 3 */}
                          {item.isBundle === 1 && item.bundleItems && (
                            <div className="mt-3 p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Layers size={12} /> Thành phần trong bộ
                              </p>
                              <div className="grid grid-cols-1 gap-1.5">
                                {item.bundleItems.map((bi, bidx) => (
                                  <div key={bidx} className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-slate-600 truncate mr-2">{bi.name}</span>
                                    <span className="font-bold text-indigo-600 shrink-0">×{bi.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Supplier Summary, Deposit, Total */}
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
                      {/* Tổng tiền nhập */}
                      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 mb-4">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Tổng tiền nhập hàng</label>
                        <p className="text-[20px] font-black text-indigo-700">{fmt(totalImportAmount)}</p>
                      </div>

                      {/* Tiền cọc */}
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 mb-4">
                        <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Tiền cọc nhập hàng</label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full pr-8 py-1 text-[18px] font-black text-emerald-700 bg-transparent outline-none border-none"
                            value={deposit ? new Intl.NumberFormat("vi-VN").format(deposit) : ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                              setDeposit(val ? parseInt(val, 10) : 0);
                            }}
                            placeholder="0"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-[14px]">₫</span>
                        </div>
                      </div>

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
                        Nhập giá nhập và chọn ngày hẹn giao cho từng sản phẩm. Tiền cọc là số tiền đặt trước cho xưởng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Step 3 */}
            <div className="px-5 py-4 border-t shrink-0 flex items-center justify-end gap-3 bg-white" style={{ borderColor: "var(--grid-border)" }}>
              <button
                onClick={() => {
                  // Kiểm tra nếu đơn hàng này thỏa mãn điều kiện tự động chọn xưởng (skip bước 2)
                  const supplierIds = new Set();
                  selectedProductKeys.forEach(key => {
                    const [suppId] = key.split("-");
                    supplierIds.add(suppId);
                  });

                  const isAutoSelected = supplierIds.size === 1 && Object.keys(selectedCatalogProducts).length === 0 && customItems.length === 0;

                  if (isAutoSelected) {
                    setStep(1);
                  } else {
                    setStep(2);
                  }
                }}
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
