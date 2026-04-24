/**
 * Component CustomOrderInvoicePage
 * Custom wood product orders — made-to-order items
 *
 * Layout: 2-column — Product list (left) + Customer & Delivery info (right)
 * Features: Multi-tab orders, custom item form, delivery details, deposit
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */
import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  CheckCircle2,
  Hammer,
  PackageCheck,
  Star,
  Camera,
  CreditCard,
  ClipboardEdit,
  TreePine,
  Palette,
  Ruler,
  Info,
  
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";
import WorkshopStatusModal from "@/pages/sales-page/components/WorkshopStatusModal";
import OrderItemsPanel from "./OrderItemsPanel";
import CustomerPanel from "./CustomerPanel";
import { fmt, generateOrderCode, createEmptyTab, inputBase } from "./mockData";

// ===================== COMPONENT =====================
export default function CustomOrderRequirementsPage() {
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem("tpf_custom_order_draft_tabs");
    return saved ? JSON.parse(saved) : [createEmptyTab()];
  });
  const [activeTabId, setActiveTabId] = useState(() => {
    const savedId = localStorage.getItem("tpf_custom_order_draft_active_id");
    if (savedId) {
      const parsed = Number(savedId);
      return isNaN(parsed) ? savedId : parsed;
    }
    return tabs.length > 0 ? tabs[0].id : null;
  });
  
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || createEmptyTab();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);


  // Save drafts to localStorage
  useEffect(() => {
    localStorage.setItem("tpf_custom_order_draft_tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem("tpf_custom_order_draft_active_id", activeTabId);
    }
  }, [activeTabId]);

  // Direct Order Conf Modal
  const [showDirectOrderModal, setShowDirectOrderModal] = useState(false);
  const [directOrderForm, setDirectOrderForm] = useState({
    finalPrice: "",
    finalDeposit: ""
  });

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  // Tab management
  const addTab = () => {
    const t = createEmptyTab();
    setTabs((p) => [...p, t]);
    setActiveTabId(t.id);
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

  // Cart operations
  const updateQuantity = (id, delta) => {
    updateActiveTab({
      cartItems: activeTab.cartItems
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0),
    });
  };

  const removeFromCart = (id) =>
    updateActiveTab({
      cartItems: activeTab.cartItems.filter((i) => i.id !== id),
    });

  const setQuantity = (id, qty) => {
    const val = parseInt(qty) || 0;
    if (val <= 0) return removeFromCart(id);
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, quantity: val } : i,
      ),
    });
  };

  // Computed values
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const computedTotal = activeTab.cartItems.reduce((sum, i) => sum + (Number(i.expectedPrice) || 0) * i.quantity, 0);
  const displayQuote = computedTotal > 0 ? computedTotal : activeTab.expectedQuote;

  // Checkout
  const handleCreateOrder = (isDirect = false) => {
    if (activeTab.cartItems.length === 0) return;
    if (!activeTab.customerName.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }
    if (!activeTab.customerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (isDirect) {
      setDirectOrderForm({
        finalPrice: displayQuote || "",
        finalDeposit: activeTab.deposit || ""
      });
      setShowDirectOrderModal(true);
    } else {
      toast.success(
        `Gửi yêu cầu thiết kế ${generateOrderCode()} cho xưởng thành công!`,
      );
      if (tabs.length <= 1) {
        updateActiveTab(createEmptyTab());
      } else {
        closeTab(activeTabId, { stopPropagation: () => {} });
      }
    }
  };

  const handleConfirmDirectOrder = () => {
    if (!directOrderForm.finalPrice) {
      toast.error("Vui lòng nhập giá trị đơn hàng chính thức!");
      return;
    }
    toast.success(
      `Tạo đơn hàng trực tiếp ${generateOrderCode()} thành công!`,
    );
    setShowDirectOrderModal(false);
    if (tabs.length <= 1) {
      updateActiveTab(createEmptyTab());
    } else {
      closeTab(activeTabId, { stopPropagation: () => {} });
    }
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Yêu cầu đặt riêng - TPF-SIMS" />

      <div
        className="flex h-full gap-4 -m-4 p-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ═══════════════ LEFT — ORDER ITEMS ═══════════════ */}
        <OrderItemsPanel
          tabs={tabs}
          activeTabId={activeTabId}
          activeTab={activeTab}
          setActiveTabId={setActiveTabId}
          addTab={addTab}
          closeTab={closeTab}
          updateActiveTab={updateActiveTab}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          setQuantity={setQuantity}
          itemCount={itemCount}
          computedTotal={computedTotal}
          handleCreateOrder={handleCreateOrder}
          setViewingItem={setViewingItem}
        />

        {/* ═══════════════ RIGHT — CUSTOMER & DELIVERY ═══════════════ */}
        <CustomerPanel
          activeTab={activeTab}
          updateActiveTab={updateActiveTab}
          setShowAddCustomer={setShowAddCustomer}
          computedTotal={computedTotal}
          displayQuote={displayQuote}
        />
      </div>

      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCustomerAdded={(customer) => {
          updateActiveTab({
            selectedCustomer: {
              name: customer.full_name,
              phone: customer.phone_number,
            },
            customerName: customer.full_name,
            customerPhone: customer.phone_number,
          });
        }}
      />

      {/* ── Custom Item Quick View Modal ── */}
      {viewingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-500 border border-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <Hammer size={24} />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-slate-800 leading-none">Chi tiết sản phẩm đặt riêng</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Thông số kỹ thuật & yêu cầu của khách</p>
                </div>
              </div>
              <button onClick={() => setViewingItem(null)} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white text-slate-300 hover:text-slate-900 transition-all cursor-pointer">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar space-y-8 font-sans">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Image Section */}
                <div className="w-full md:w-[45%] space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hình ảnh mẫu</p>
                  {viewingItem.images && viewingItem.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {viewingItem.images.map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-100 relative group">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300">
                      <Camera size={32} strokeWidth={1} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Không có ảnh mẫu</span>
                    </div>
                  )}
                </div>

                {/* Specs Section */}
                <div className="w-full md:w-[55%] space-y-6 text-left">
                  <div className="space-y-2">
                    <h2 className="text-[26px] font-black text-slate-800 leading-tight">{viewingItem.productName}</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[11px] font-black uppercase tracking-wider">Hàng thiết kế riêng</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-2 group hover:border-[var(--brand-primary)] transition-colors hover:shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                          <TreePine size={14} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chất liệu</span>
                      </div>
                      <span className="text-[13px] font-black text-slate-700 pl-1">{viewingItem.woodType || "—"}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-2 group hover:border-[var(--brand-primary)] transition-colors hover:shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <Palette size={14} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Màu sắc</span>
                      </div>
                      <span className="text-[13px] font-black text-slate-700 pl-1">{viewingItem.color || "—"}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-2 group hover:border-[var(--brand-primary)] transition-colors hover:shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Ruler size={14} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kích thước</span>
                      </div>
                      <span className="text-[13px] font-black text-slate-700 pl-1">{viewingItem.size || "—"}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-2 group hover:border-[var(--brand-primary)] transition-colors hover:shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                          <PackageCheck size={14} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng</span>
                      </div>
                      <span className="text-[13px] font-black text-slate-700 pl-1">{viewingItem.quantity || 1} Sản phẩm</span>
                    </div>
                  </div>

                  {activeTab.mode === "DIRECT_ORDER" && viewingItem.expectedPrice && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-5">
                        <CreditCard size={64} strokeWidth={2} />
                      </div>
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Đơn giá</span>
                          <span className="text-[18px] font-black text-emerald-700 leading-none">{fmt(viewingItem.expectedPrice)} VNĐ</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Section */}
              {viewingItem.note && (
                <div className="p-6 rounded-lg bg-slate-50 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ClipboardEdit size={80} strokeWidth={1} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <ClipboardEdit size={18} />
                    </div>
                    <span className="text-[12px] font-black text-indigo-900 uppercase tracking-[0.2em]">Yêu cầu bổ sung kỹ thuật</span>
                  </div>
                  <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic relative z-10 bg-white/50 p-4 rounded-lg">
                    "{viewingItem.note}"
                  </p>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 flex justify-end">
              <Button onClick={() => setViewingItem(null)}
                className="h-11 rounded-lg px-12 font-black uppercase tracking-wider text-white active:scale-95 transition-all"
                style={{ backgroundColor: "var(--brand-primary)" }}>
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Direct Order Confirmation Modal ── */}
      {showDirectOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-slate-800 leading-none">Xác nhận tạo đơn hàng</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tạo trực tiếp không qua chủ</p>
                </div>
              </div>
              <button onClick={() => setShowDirectOrderModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-slate-300 hover:text-slate-900 transition-all cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-start gap-2.5">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[12px] font-bold text-blue-800/80 leading-relaxed italic">
                  Vì bạn đang tạo đơn hàng trực tiếp, vui lòng xác nhận lại giá.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Giá trị đơn hàng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="VD: 15,000,000"
                      value={directOrderForm.finalPrice ? fmt(directOrderForm.finalPrice) : ""}
                      onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); setDirectOrderForm(p => ({ ...p, finalPrice: val ? Number(val) : "" })); }}
                      className={`${inputBase} bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 transition-all font-bold text-slate-800 h-12`} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">VND</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Đã thu tiền cọc</label>
                  <div className="relative">
                    <input type="text" placeholder="VD: 5,000,000"
                      value={directOrderForm.finalDeposit ? fmt(directOrderForm.finalDeposit) : ""}
                      onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); setDirectOrderForm(p => ({ ...p, finalDeposit: val ? Number(val) : "" })); }}
                      className={`${inputBase} bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 transition-all font-bold text-slate-800 h-12`} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">VND</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button onClick={() => setShowDirectOrderModal(false)}
                className="flex-1 h-11 rounded-lg font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-[12px] uppercase tracking-wider cursor-pointer">
                Trở lại
              </button>
              <button onClick={handleConfirmDirectOrder}
                className="flex-1 h-11 rounded-lg font-black text-white bg-emerald-500 hover:bg-emerald-600 border border-transparent transition-all text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20">
                Chốt Đơn Lập Tức
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
