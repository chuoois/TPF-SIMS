/**
 * CreateManufacturingOrderModal
 * 2-Step Wizard: Bước 1 — Tick chọn đơn hàng | Bước 2 — Xem lại (read-only) & Tạo phiếu
 * Thông tin SP đã đầy đủ từ sale, chủ chỉ cần chọn và xác nhận.
 */

import { useState, useMemo } from "react";
import {
  X, Check, ChevronLeft, ChevronRight,
  FileStack, Package, Search,
  CheckSquare, Square, Users, Layers,
  TreePine, Palette, Ruler, Plus, Minus,
  ShoppingCart, LayoutGrid, ListTodo,
} from "lucide-react";
import toast from "react-hot-toast";

const ELIGIBLE_TYPES = ["Hàng khách đặt"];
const ELIGIBLE_STATUSES = ["Chờ xử lý", "Chờ sản xuất", "Đang gia công"];

const TYPE_BADGE = {
  "Hàng mộc":       { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Hàng khách đặt": { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" },
};

const STATUS_BADGE = {
  "Chờ xử lý":    { bg: "#EFF6FF", text: "#1D4ED8" },
  "Chờ sản xuất":  { bg: "#FEF3C7", text: "#B45309" },
  "Đang gia công": { bg: "#FEF3C7", text: "#D97706" },
};

function genId() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const existing = JSON.parse(localStorage.getItem("tpf_manufacturing_orders") || "[]");
  const todayPrefix = `PGC-${dateStr}-`;
  const todayOrders = existing.filter((o) => o.id.startsWith(todayPrefix));
  const seq = String(todayOrders.length + 1).padStart(3, "0");
  return `${todayPrefix}${seq}`;
}

export default function CreateManufacturingOrderModal({ orders, catalogProducts, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "catalog"
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [selectedCatalogProducts, setSelectedCatalogProducts] = useState({}); // { productId: qty }
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

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

  // ── Toggle selection ──
  const toggleOrder = (orderId) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const selectedOrders = useMemo(() =>
    eligibleOrders.filter(o => selectedOrderIds.has(o.id)),
    [eligibleOrders, selectedOrderIds]
  );

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

  const selectedCatCount = Object.keys(selectedCatalogProducts).length;

  // ── Build items from selected orders (carry ALL product fields as-is) ──
  const buildItems = () => {
    const items = [];
    // 1. From orders
    selectedOrders.forEach(order => {
      (order.products || []).forEach(p => {
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

    return items;
  };

  const items = useMemo(() => step === 2 ? buildItems() : [], [step, selectedOrderIds, selectedCatalogProducts]);
  const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
  const totalSelectedFromOrders = selectedOrders.reduce((s, o) => s + (o.products?.length || 0), 0);
  const totalSelectedFromCatalog = Object.values(selectedCatalogProducts).reduce((s, q) => s + q, 0);

  // ── Go to step 2 ──
  const goToStep2 = () => {
    if (selectedOrderIds.size === 0 && selectedCatCount === 0) {
      toast.error("Vui lòng chọn ít nhất 1 đơn hàng hoặc 1 sản phẩm!");
      return;
    }
    const noProducts = selectedOrders.filter(o => !o.products?.length);
    if (noProducts.length > 0) {
      toast("Lưu ý: " + noProducts.length + " đơn chưa có chi tiết sản phẩm.", { icon: "⚠️" });
    }
    setStep(2);
  };

  // ── Save ──
  const handleSave = () => {
    const finalItems = buildItems();
    if (!finalItems.length) {
      toast.error("Phiếu không có sản phẩm nào!");
      return;
    }

    const allSourceOrders = new Set();
    const allSourceOrderDetails = {};
    finalItems.forEach(it => {
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
      orderIds: Array.from(allSourceOrders),
      sourceOrderDetails: allSourceOrderDetails,
      items: finalItems,
    };
    const existing = JSON.parse(localStorage.getItem("tpf_manufacturing_orders") || "[]");
    localStorage.setItem("tpf_manufacturing_orders", JSON.stringify([newOrder, ...existing]));
    toast.success(`Đã tạo phiếu ${newOrder.id} thành công!`);
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
        className="relative flex flex-col rounded-2xl overflow-hidden"
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
                Tạo phiếu gia công mới
              </h2>
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                {step === 1 ? (
                  activeTab === "orders" 
                    ? `Bước 1/2 — Đã chọn ${selectedOrderIds.size} đơn (${totalSelectedFromOrders} SP)`
                    : `Bước 1/2 — Đã chọn ${selectedCatCount} loại SP (${totalSelectedFromCatalog} chiếc)`
                ) : "Bước 2/2 — Xem lại sản phẩm và xác nhận"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: "var(--brand-primary)", color: "#fff" }}>1</div>
              <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === 1 ? "var(--text-main)" : "var(--text-placeholder)" }}>Chọn đơn</span>
              <div className="w-6 h-[2px] rounded" style={{ background: step >= 2 ? "var(--brand-primary)" : "var(--grid-border)" }} />
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: step >= 2 ? "var(--brand-primary)" : "var(--grid-border)", color: step >= 2 ? "#fff" : "var(--text-placeholder)" }}>2</div>
              <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === 2 ? "var(--text-main)" : "var(--text-placeholder)" }}>Xác nhận</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 ml-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ══════════ STEP 1: Select Orders / Catalog ══════════ */}
        {step === 1 && (
          <>
            {/* Tab Switched */}
            <div className="px-5 pt-3 shrink-0">
               <div className="flex p-1 rounded-xl bg-gray-100" style={{ border: "1px solid var(--grid-border)" }}>
                 <button
                   onClick={() => setActiveTab("orders")}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'orders' ? 'bg-white shadow text-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <ListTodo size={16} />
                   Chọn từ đơn hàng
                   {selectedOrderIds.size > 0 && <span className="bg-[var(--brand-primary)] text-white px-1.5 rounded-full text-[10px] ml-1">{selectedOrderIds.size}</span>}
                 </button>
                 <button
                   onClick={() => setActiveTab("catalog")}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'catalog' ? 'bg-white shadow text-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <LayoutGrid size={16} />
                   Chọn từ danh mục
                   {selectedCatCount > 0 && <span className="bg-[var(--brand-primary)] text-white px-1.5 rounded-full text-[10px] ml-1">{selectedCatCount}</span>}
                 </button>
               </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tab Content: Orders */}
              {activeTab === "orders" ? (
                <>
                  {/* Search + Select All */}
                  <div className="px-5 pt-4 pb-2 shrink-0 flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo mã đơn, tên khách, tên sản phẩm..."
                        className="w-full pl-9 pr-4 py-2 text-[13px] rounded-lg outline-none border focus:border-[var(--brand-primary)]"
                        style={{ borderColor: "var(--grid-border)" }}
                      />
                    </div>
                    <button
                      onClick={toggleAll}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold cursor-pointer transition border whitespace-nowrap"
                      style={{
                        borderColor: "var(--grid-border)",
                        color: selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0 ? "var(--brand-primary)" : "var(--text-secondary)",
                        background: selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0 ? "var(--status-focus)" : "#fff",
                      }}
                    >
                      {selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0
                        ? <><CheckSquare size={14} /> Bỏ chọn tất cả</>
                        : <><Square size={14} /> Chọn tất cả ({filteredOrders.length})</>
                      }
                    </button>
                  </div>

                  {/* Order list */}
                  <div className="flex-1 overflow-y-auto px-5 pb-4 custom-scrollbar">
                    {filteredOrders.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <Package size={48} strokeWidth={1} />
                        <p className="text-[13px]">Không tìm thấy đơn hàng phù hợp</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 pt-2">
                        {filteredOrders.map(o => {
                          const isSelected = selectedOrderIds.has(o.id);
                          const customerName = o.customerName || o.customer?.name || "";
                          const tb = TYPE_BADGE[o.type] || {};
                          return (
                            <div
                              key={o.id}
                              onClick={() => toggleOrder(o.id)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:border-[var(--brand-primary)]"
                              style={{
                                border: `1.5px solid ${isSelected ? "var(--brand-primary)" : "var(--grid-border)"}`,
                                background: isSelected ? "var(--status-focus)" : "#fff",
                              }}
                            >
                              <div className="shrink-0">
                                {isSelected
                                  ? <CheckSquare size={20} style={{ color: "var(--brand-primary)" }} />
                                  : <Square size={20} style={{ color: "var(--grid-border)" }} />
                                }
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-[13px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: isSelected ? "rgba(255,255,255,0.7)" : "#F3F4F6", color: "var(--text-main)" }}>
                                    {o.code}
                                  </span>
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: tb.bg, color: tb.text, border: `1px solid ${tb.border}` }}>
                                    {o.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[12px]">
                                  {customerName && (
                                    <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--text-main)" }}>
                                      <Users size={12} style={{ color: "var(--text-placeholder)" }} />
                                      {customerName}
                                    </span>
                                  )}
                                  <span style={{ color: "var(--text-placeholder)" }}>•</span>
                                  <span style={{ color: "var(--text-secondary)" }}>
                                    {o.products?.length || 0} sản phẩm
                                  </span>
                                  {o.products?.length > 0 && (
                                    <>
                                      <span style={{ color: "var(--text-placeholder)" }}>•</span>
                                      <span className="truncate max-w-[250px]" style={{ color: "var(--text-placeholder)" }}>
                                        {o.products.map(p => p.name).join(", ")}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 text-center">
                                <div className="text-[16px] font-black" style={{ color: isSelected ? "var(--brand-primary)" : "var(--text-secondary)" }}>
                                  {o.products?.reduce((s, p) => s + (p.qty || p.quantity || 1), 0) || 0}
                                </div>
                                <div className="text-[10px]" style={{ color: "var(--text-placeholder)" }}>chiếc</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Catalog Content */}
                  <div className="px-5 pt-4 pb-2 shrink-0">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="Tìm sản phẩm theo tên, mã sản phẩm..."
                        className="w-full pl-9 pr-4 py-2 text-[13px] rounded-lg outline-none border focus:border-[var(--brand-primary)]"
                        style={{ borderColor: "var(--grid-border)" }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 pb-4 custom-scrollbar">
                    {filteredCatalog.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <LayoutGrid size={48} strokeWidth={1} />
                        <p className="text-[13px]">Không tìm thấy sản phẩm trong danh mục</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {filteredCatalog.map(p => {
                          const qty = selectedCatalogProducts[p.id] || 0;
                          return (
                            <div
                              key={p.id}
                              className={`flex gap-3 p-3 rounded-xl transition-all border ${qty > 0 ? 'bg-[var(--status-focus)] border-[var(--brand-primary)] shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden border shrink-0 bg-gray-50">
                                <img src={p.img || p.image || "https://placehold.co/100"} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <p className="text-[13px] font-bold truncate leading-tight mb-0.5" title={p.name}>{p.name}</p>
                                  <p className="text-[11px] font-mono text-gray-400">{p.code}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-[11px] font-bold text-gray-400">{p.material}</span>
                                  <div className="flex items-center gap-2">
                                    {qty > 0 && (
                                       <>
                                         <button
                                           onClick={() => toggleCatalogProduct(p, -1)}
                                           className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                                         >
                                           <Minus size={12} />
                                         </button>
                                         <span className="text-[14px] font-black text-[var(--brand-primary)] min-w-[16px] text-center">{qty}</span>
                                       </>
                                    )}
                                    <button
                                      onClick={() => toggleCatalogProduct(p, 1)}
                                      className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Step 1 */}
            <div className="px-5 py-4 border-t shrink-0 flex items-center justify-between bg-white" style={{ borderColor: "var(--grid-border)" }}>
              <div className="flex items-center gap-4">
                <div className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>
                  {activeTab === "orders" ? `${eligibleOrders.length} đơn đủ ĐK` : `${catalogProducts?.length || 0} SP sẵn có`}
                </div>
                {totalQty > 0 && (
                   <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--brand-primary)] px-2 py-1 rounded bg-[var(--status-focus)] animate-in fade-in slide-in-from-left-2">
                     <ShoppingCart size={14} />
                     Tổng cộng: {totalQty} chiếc
                   </div>
                )}
              </div>
              <button
                onClick={goToStep2}
                disabled={selectedOrderIds.size === 0 && selectedCatCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:translate-x-0.5 active:scale-95"
                style={{ background: "var(--brand-primary)" }}
              >
                Tiếp tục xem lại <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ══════════ STEP 2: Review (read-only) & Confirm ══════════ */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Summary bar */}
              <div className="px-5 pt-4 pb-3 shrink-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {selectedOrderIds.size > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold" style={{ background: "var(--status-focus)", color: "var(--brand-primary)" }}>
                      <ListTodo size={14} />
                      Gom từ {selectedOrderIds.size} đơn hàng
                    </div>
                  )}
                  {selectedCatCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold" style={{ background: "#F5F3FF", color: "#5B21B6" }}>
                      <LayoutGrid size={14} />
                      {selectedCatCount} loại SP từ danh mục
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold" style={{ background: "#F0FDF4", color: "#166534" }}>
                    <Package size={14} />
                    {items.length} dòng hàng • {totalQty} chiếc
                  </div>
                </div>
              </div>

              {/* Product cards — grouped by source order / catalog */}
              <div className="flex-1 overflow-y-auto px-5 pb-4 custom-scrollbar">
                <div className="flex flex-col gap-6">
                  {/* Phase 1: Customer Orders */}
                  {selectedOrders.map(order => {
                    const customerName = order.customerName || order.customer?.name || "";
                    const tb = TYPE_BADGE[order.type] || {};
                    const orderItems = items.filter(it => it.sourceOrders.includes(order.code));
                    if (orderItems.length === 0) return null;

                    return (
                      <div key={order.id} className="animate-in fade-in slide-in-from-bottom-2">
                        {/* Order group header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[12px] font-mono font-bold px-2 py-1 rounded-lg" style={{ background: "#F3F4F6", color: "var(--text-main)" }}>
                            {order.code}
                          </span>
                          {customerName && (
                            <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--text-main)" }}>
                              <Users size={12} style={{ color: "var(--text-placeholder)" }} />
                              {customerName}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: tb.bg, color: tb.text, border: `1px solid ${tb.border}` }}>
                            {order.type}
                          </span>
                        </div>

                        {/* Products in this order */}
                        <div className="flex flex-col gap-2">
                          {orderItems.map((item) => {
                            const allImages = [
                              ...(item.image ? [item.image] : []),
                              ...(item.customerSampleImage ? [item.customerSampleImage] : []),
                              ...(item.images || []),
                            ];
                            const sizeDisplay = getDisplaySize(item);
                            const colorFinish = [item.color, item.finish].filter(Boolean).join(" / ");

                            return (
                              <div
                                key={item.id}
                                className="flex gap-3 p-3 rounded-xl shadow-sm border border-gray-100 bg-white"
                              >
                                {/* Thumbnail */}
                                {allImages.length > 0 && (
                                  <div
                                    className="w-14 h-14 rounded-lg overflow-hidden border shrink-0 cursor-pointer hover:ring-2 hover:ring-[var(--brand-primary)] transition"
                                    style={{ borderColor: "var(--grid-border)" }}
                                    onClick={() => setPreviewImage(allImages[0])}
                                  >
                                    <img src={allImages[0]} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold mb-1.5" style={{ color: "var(--text-main)" }}>
                                    {item.productName}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.material && (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#FEF3C7", color: "#92400E" }}>
                                        <TreePine size={10} /> {item.material}
                                      </span>
                                    )}
                                    {sizeDisplay && (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#EFF6FF", color: "#1E40AF" }}>
                                        <Ruler size={10} /> {sizeDisplay}
                                      </span>
                                    )}
                                    {colorFinish && (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#F3E8FF", color: "#6D28D9" }}>
                                        <Palette size={10} /> {colorFinish}
                                      </span>
                                    )}
                                  </div>
                                  {item.note && (
                                    <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                      📝 {item.note}
                                    </p>
                                  )}
                                </div>

                                {/* Quantity */}
                                <div className="shrink-0 flex flex-col items-center justify-center px-2">
                                  <span className="text-[16px] font-black" style={{ color: "var(--brand-primary)" }}>{item.qty}</span>
                                  <span className="text-[10px]" style={{ color: "var(--text-placeholder)" }}>{item.unit}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Phase 2: Catalog Products */}
                  {selectedCatCount > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="text-[12px] font-bold px-2 py-1 rounded-lg" style={{ background: "#F5F3FF", color: "#5B21B6" }}>
                            BỔ SUNG TỪ DANH MỤC
                          </span>
                          <span className="text-[11px] ml-auto" style={{ color: "var(--text-placeholder)" }}>
                            {selectedCatCount} sản phẩm
                          </span>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          {items.filter(it => it.sourceOrders.includes("DANH-MUC")).map((item) => {
                             const sizeDisplay = getDisplaySize(item);
                             const colorFinish = [item.color, item.finish].filter(Boolean).join(" / ");
                             return (
                               <div
                                 key={item.id}
                                 className="flex gap-3 p-3 rounded-xl border-2 border-dashed border-purple-100 bg-purple-50/30"
                               >
                                 {/* Thumbnail */}
                                 {item.image && (
                                   <div
                                     className="w-14 h-14 rounded-lg overflow-hidden border border-purple-100 shrink-0 cursor-pointer"
                                     onClick={() => setPreviewImage(item.image)}
                                   >
                                     <img src={item.image} alt="" className="w-full h-full object-cover" />
                                   </div>
                                 )}

                                 {/* Info */}
                                 <div className="flex-1 min-w-0">
                                   <p className="text-[13px] font-bold mb-1.5 px-0.5 rounded" style={{ color: "#4C1D95" }}>
                                     {item.productName}
                                   </p>
                                   <div className="flex flex-wrap gap-1.5">
                                     {item.material && (
                                       <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#EDE9FE", color: "#5B21B6" }}>
                                          {item.material}
                                       </span>
                                     )}
                                     {sizeDisplay && (
                                       <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#EDE9FE", color: "#5B21B6" }}>
                                          {sizeDisplay}
                                       </span>
                                     )}
                                   </div>
                                   <p className="mt-1.5 text-[11px] font-medium italic opacity-60 text-purple-700">
                                      📦 Sản phẩm bổ sung kho
                                   </p>
                                 </div>

                                 {/* Quantity */}
                                 <div className="shrink-0 flex flex-col items-center justify-center px-2">
                                   <span className="text-[16px] font-black text-purple-700">{item.qty}</span>
                                   <span className="text-[10px] text-purple-400">{item.unit}</span>
                                 </div>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-end gap-4 px-4 py-3 rounded-xl shadow-sm" style={{ background: "var(--status-focus)", border: "1px solid var(--grid-border)" }}>
                    <span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>Tổng cộng phiếu:</span>
                    <span className="text-[20px] font-black" style={{ color: "var(--brand-primary)" }}>{totalQty}</span>
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>chiếc / {items.length} dòng sản phẩm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Step 2 */}
            <div className="px-5 py-4 border-t shrink-0 flex flex-col gap-3 bg-white" style={{ borderColor: "var(--grid-border)" }}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho xưởng (VD: Giao trước 20/05, ưu tiên đơn khách đặt...)"
                className="w-full border rounded-lg p-2.5 text-[12px] outline-none h-14 resize-none focus:border-[var(--brand-primary)] transition"
                style={{ borderColor: "var(--grid-border)" }}
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition border"
                  style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
                >
                  <ChevronLeft size={16} /> Quay lại chọn đơn
                </button>
                <button
                  onClick={handleSave}
                  disabled={items.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: "var(--brand-primary)" }}
                >
                  <Check size={16} /> LẬP PHIẾU GIA CÔNG ({totalQty} chiếc)
                </button>
              </div>
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
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full rounded-xl shadow-2xl" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 cursor-pointer transition"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
