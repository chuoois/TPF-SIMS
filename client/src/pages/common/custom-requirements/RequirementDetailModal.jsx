/**
 * RequirementDetailModal — Chi tiết yêu cầu kỹ thuật (UNIFIED)
 * Handles both Sales and Owner roles with specific permissions.
 */

import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Camera,
  Layers,
  Package,
  FileText,
  AlertCircle,
  MapPin,
  CheckCircle,
  Ruler,
  Save,
  UploadCloud,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { STATUS_CONFIG } from "@/constants/customRequest.constants";
import supplierService from "@/services/supplier.service";
import customRequestService from "@/services/customRequest.service";
import productAttributeService from "@/services/productAttribute.service";
import { uploadMultipleImages } from "@/services/cloudinary.service";
import { formatDateVN } from "@/lib/dateUtils";

const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ===================== IMAGE VIEWER =====================
export const ImageViewer = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 animate-in fade-in duration-200">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt="Enlarged"
        className="max-w-full max-h-full object-contain rounded-lg animate-in zoom-in duration-300 border border-white/10"
      />
    </div>
  );
};

// ===================== DETAIL MODAL =====================
export default function RequirementDetailModal({ req, onClose, onEnlarge, onOpenCancel, onRefresh, userRole = 'sales' }) {
  const [itemSpecs, setItemSpecs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable Header Fields
  const [depositAmount, setDepositAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isFullPayment, setIsFullPayment] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [totalCostPrice, setTotalCostPrice] = useState(0);

  // Dropdown options
  const [materialOptions, setMaterialOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState({ index: null, type: null });

  const calculateSuggested = (total) => {
    if (!total || total <= 0) return { amount: 0, percentage: 50 };
    return { amount: total * 0.5, percentage: 50 };
  };

  // Permission Logic
  // Sales sửa được khi "Chờ tiếp nhận" (Status 1)
  // Owner sửa được khi "Đã tiếp nhận" (Status 2)
  const canEdit = isEditing && (
    (userRole === 'sales' && req?.status === "Chờ tiếp nhận") ||
    (userRole === 'owner' && req?.status === "Đã tiếp nhận")
  );

  // Owner mới được sửa Supplier & Workshop Date
  const canEditProduction = canEdit && userRole === 'owner';

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const cached = localStorage.getItem("tpf_cached_attributes");
        if (cached) {
          const parsed = JSON.parse(cached);
          setMaterialOptions(parsed.materials || []);
          setColorOptions(parsed.colors || []);
        }
        const res = await productAttributeService.getAllAttributes();
        const materials = res.materials?.map((m) => m.material_name) || [];
        const colors = res.colors?.map((c) => c.color_name) || [];
        setMaterialOptions(materials);
        setColorOptions(colors);
        localStorage.setItem("tpf_cached_attributes", JSON.stringify({ materials, colors }));
      } catch (error) {
        console.error("Failed to fetch product attributes:", error);
      }
    };
    fetchAttributes();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const cached = localStorage.getItem("tpf_cached_suppliers");
        if (cached) setSuppliers(JSON.parse(cached));
        const res = await supplierService.getAllSuppliers();
        setSuppliers(res.data || []);
        localStorage.setItem("tpf_cached_suppliers", JSON.stringify(res.data || []));
      } catch (err) {
        console.error("Fetch suppliers error:", err);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (req) {

      setDepositAmount(Math.round(Number(req.depositAmount || 0)));
      setTotalAmount(Math.round(Number(req.totalAmount || 0)));
      setIsFullPayment(req.depositAmount >= req.totalAmount && req.totalAmount > 0);
      setDeliveryDate(formatDateVN(req.deliveryDate, "yyyy-MM-dd"));
      setDeliveryMethod(req.deliveryMethod || "");
      setNotes(req.notes || "");

      setItemSpecs(
        req.items.map((item) => ({
          id: item.id,
          name: item.name,
          material: item.material || "",
          color: item.color || "",
          quantity: item.qty || item.quantity || 1,
          price: Math.round(Number(item.item_price || item.price || item.quotedPrice || 0)),
          costPrice: Math.round(Number(item.item_cost_price || item.cost_price || item.costPrice || 0)),
          length: item.specs?.length || "",
          width: item.specs?.width || "",
          height: item.specs?.height || "",
          dimensions: item.specs?.dimensions || "",
          hardware: item.specs?.hardware || "",
          note: item.specs?.note || "",
          designImages: item.designImages || [],
          fk_supplier_id: item.fk_supplier_id ? String(item.fk_supplier_id) : "",
          expectedWorkshopDate: formatDateVN(item.expectedWorkshopDate, "yyyy-MM-dd"),
          item_is_bundle: Number(item.item_is_bundle || 0),
          item_bundle_items: item.item_bundle_items || [],
        })),
      );
      setIsEditing(false);
    }
  }, [req]);

  // Tự động tính tổng tiền từ đơn giá từng sản phẩm
  useEffect(() => {
    if (!canEdit) return;
    const newTotal = itemSpecs.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    if (newTotal !== totalAmount) {
      setTotalAmount(newTotal);
    }
  }, [itemSpecs, canEdit]);

  // Tự động cập nhật tiền cọc khi thay đổi tổng tiền hoặc chế độ trả đủ
  useEffect(() => {
    if (!canEdit) return;
    if (isFullPayment) {
      setDepositAmount(totalAmount);
    } else {
      const suggested = calculateSuggested(totalAmount);
      setDepositAmount(suggested.amount);
    }
  }, [totalAmount, isFullPayment, canEdit]);

  // Tự động tính tổng giá nhập (Owner only)
  useEffect(() => {
    if (userRole !== 'owner') return;
    const newTotalCost = itemSpecs.reduce((sum, item) => sum + (Number(item.costPrice) || 0) * (Number(item.quantity) || 1), 0);
    setTotalCostPrice(newTotalCost);
  }, [itemSpecs, userRole]);

  const handleUpdateItemSpec = (index, field, value) => {
    if (!canEdit) return;
    const newSpecs = [...itemSpecs];
    newSpecs[index][field] = value;
    setItemSpecs(newSpecs);
  };

  const handleSaveAll = async () => {
    if (!deliveryMethod) {
      toast.error("Vui lòng chọn Phương thức giao hàng");
      return;
    }
    setIsSaving(true);
    const loadingToast = toast.loading("Đang lưu thay đổi...");
    try {
      const itemsWithImages = await Promise.all(
        itemSpecs.map(async (spec) => {
          let finalDesignImages = [...(spec.designImages || [])];
          const newFiles = finalDesignImages.filter(img => typeof img !== 'string');
          const existingUrls = finalDesignImages.filter(img => typeof img === 'string');

          if (newFiles.length > 0) {
            const uploadedResults = await uploadMultipleImages(newFiles);
            finalDesignImages = [...existingUrls, ...uploadedResults.map(res => res.url)];
          }

          return { ...spec, finalDesignImages };
        })
      );

      const updateData = {
        deposit_amount: Number(depositAmount),
        total_amount: Number(totalAmount),
        expected_fulfillment_date: deliveryDate,
        fulfillment_method: deliveryMethod,
        note: notes,
        items: itemsWithImages.map(spec => ({
          id: spec.id,
          item_material: spec.material,
          item_color: spec.color,
          item_quantity: spec.quantity,
          item_price: spec.price,
          item_cost_price: userRole === 'owner' ? Number(spec.costPrice) : undefined,
          item_note: spec.note,
          fk_supplier_id: spec.fk_supplier_id || null,
          expected_supplier_date: spec.expectedWorkshopDate || null,
          design_img: spec.finalDesignImages,
          item_size: {
            unit: "cm",
            length: Number(spec.length) || 0,
            width: Number(spec.width) || 0,
            height: Number(spec.height) || 0
          }
        }))
      };

      await customRequestService.updateRequest(req.id, updateData);
      setIsEditing(false);
      onRefresh?.();
      toast.success("Cập nhật yêu cầu thành công", { id: loadingToast });
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Lỗi khi cập nhật yêu cầu", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDesignImages = (index, files) => {
    if (!canEdit || !files || files.length === 0) return;
    const newSpecs = [...itemSpecs];
    const newFilesArray = Array.from(files);
    newSpecs[index].designImages = [...(newSpecs[index].designImages || []), ...newFilesArray];
    setItemSpecs(newSpecs);
  };

  const handleRemoveDesignImage = (index, imgIndex) => {
    if (!canEdit) return;
    const newSpecs = [...itemSpecs];
    newSpecs[index].designImages = newSpecs[index].designImages.filter((_, i) => i !== imgIndex);
    setItemSpecs(newSpecs);
  };

  const handleUpdateStatus = async (newStatus, successMsg) => {
    try {
      await customRequestService.updateStatus(req.id, { status: newStatus });
      toast.success(successMsg);
      onRefresh?.();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  if (!req) return null;
  const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG["Chờ tiếp nhận"];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <style>{noScrollbarStyle}</style>
      <div className="bg-white w-full max-w-7xl max-h-[90vh] rounded-lg flex flex-col overflow-hidden relative border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-gray-900 leading-none">Chi tiết yêu cầu thiết kế</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[12px] font-medium font-mono">{req.code}</span>
                <span className="px-2.5 py-1 rounded-md text-[12px] font-medium border" style={{ backgroundColor: statusConfig.bg, color: statusConfig.text, borderColor: statusConfig.border }}>{req.status}</span>
                {!canEdit && (req.status === "Chờ tiếp nhận" || req.status === "Đã tiếp nhận") && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    <AlertCircle size={10} /> Chế độ xem
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 p-6">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><User size={14} /> Khách hàng</h3>
                <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-2">
                  <p className="text-[14px] font-bold text-gray-900 leading-tight">{req.customer}</p>
                  <div className="flex items-center gap-2 text-[12px] text-gray-600"><Phone size={12} className="text-gray-400" /> {req.phone}</div>
                  <div className="flex items-start gap-2 text-[12px] text-gray-600"><MapPin size={12} className="text-gray-400 mt-0.5" /> <span className="leading-snug">{req.address || "Chưa cung cấp địa chỉ"}</span></div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Package size={14} /> Giao hàng</h3>
                <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-4">
                  <div className={`space-y-2 p-3 rounded-lg transition-all ${canEditProduction ? 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <p className={`text-[10px] font-bold uppercase ${canEditProduction ? 'text-[#34B057]' : 'text-gray-400'}`}>Phương thức <span className="text-red-500">*</span></p>
                    <div className="flex flex-col gap-2">
                      {['store', 'delivery'].map(m => (
                        <label key={m} className={`flex items-center gap-2 ${canEditProduction ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input type="radio" disabled={!canEditProduction} checked={deliveryMethod === m} onChange={() => setDeliveryMethod(m)} className="w-3.5 h-3.5 text-[#34B057] focus:ring-0" />
                          <span className={`text-[13px] ${deliveryMethod === m ? "font-bold text-[#34B057]" : "text-gray-600"}`}>{m === 'store' ? 'Lấy tại cửa hàng' : 'Giao tận nơi'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={`space-y-1.5 p-3 rounded-lg transition-all ${canEditProduction ? 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <p className={`text-[10px] font-bold uppercase ${canEditProduction ? 'text-[#34B057]' : 'text-gray-400'}`}>Ngày giao (Dự kiến)</p>
                    <input type="date" readOnly={!canEditProduction} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className={`w-full border rounded-lg text-[13px] font-bold px-3 py-2 transition-colors ${canEditProduction ? 'bg-white border-[#34B057]/20 text-gray-700 focus:border-[#34B057] cursor-pointer' : 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed'}`} />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><CheckCircle size={14} /> Thanh toán (đ)</h3>
                <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-4">
                  <div className={`space-y-1 p-3 rounded-lg transition-all ${canEditProduction ? 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-[10px] font-bold uppercase ${canEditProduction ? 'text-[#34B057]' : 'text-gray-400'}`}>Tổng tiền</p>
                      {canEditProduction && (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="w-3 h-3 rounded text-[#34B057]" checked={isFullPayment} onChange={(e) => setIsFullPayment(e.target.checked)} />
                          <span className="text-[11px] font-bold text-[#34B057]">Trả đủ</span>
                        </label>
                      )}
                    </div>
                    <input type="text" readOnly={!canEditProduction} value={totalAmount === 0 ? "" : totalAmount.toLocaleString("vi-VN")} onChange={(e) => setTotalAmount(Number(e.target.value.replace(/\D/g, "")))} className={`w-full text-[18px] font-bold bg-transparent border-none focus:ring-0 p-0 ${canEditProduction ? 'text-[#34B057] border-b border-[#34B057]/10 cursor-text' : 'text-gray-400 cursor-not-allowed'}`} />
                  </div>
                  <div className={`space-y-1 p-3 rounded-lg transition-all ${canEditProduction && !isFullPayment ? 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <p className={`text-[10px] font-bold uppercase ${canEditProduction && !isFullPayment ? 'text-[#34B057]' : 'text-gray-400'}`}>Tiền cọc</p>
                    <input type="text" readOnly={!canEditProduction || isFullPayment} value={depositAmount === 0 ? "" : depositAmount.toLocaleString("vi-VN")} onChange={(e) => setDepositAmount(Number(e.target.value.replace(/\D/g, "")))} className={`w-full text-[16px] font-bold bg-transparent border-none focus:ring-0 p-0 ${canEditProduction && !isFullPayment ? 'text-gray-700 border-b border-gray-100 cursor-text' : 'text-gray-400 cursor-not-allowed'}`} />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 ${canEdit ? 'text-[#34B057]' : 'text-gray-400'}`}><FileText size={14} /> Ghi chú</h3>
                <textarea value={notes} readOnly={!canEdit} onChange={(e) => setNotes(e.target.value)} className={`w-full h-24 p-3 rounded-xl border text-[12px] resize-none transition-all ${canEdit ? 'border-[#34B057]/20 bg-[#EAF6EE]/30 text-gray-700 focus:ring-2 focus:ring-[#34B057]/20 cursor-text' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'}`} placeholder={canEdit ? "Nhập ghi chú chung..." : ""} />
              </section>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2"><Layers size={18} className="text-[#34B057]" /> Chi tiết Kỹ thuật <span className="ml-2 px-2 py-0.5 bg-[#EAF6EE] text-[#34B057] text-[11px] rounded-full">{itemSpecs.length} sản phẩm</span></h3>
              </div>

              <div className="space-y-8 pb-10">
                {itemSpecs.map((spec, index) => (
                  <div key={spec.id} className={`flex flex-col gap-6 p-6 rounded-2xl border border-gray-100 bg-white transition-all ${canEdit ? 'hover:border-[#34B057]/30' : ''}`}>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image column */}
                      <div className="w-full md:w-64 space-y-4 shrink-0">
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><User size={12} /> Ảnh mẫu</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {(req.items[index]?.customerImages || []).length > 0 ? (
                              (req.items[index]?.customerImages || []).map((img, i) => (
                                <div key={i} className={`aspect-square rounded-lg border border-gray-100 overflow-hidden cursor-zoom-in ${i === 0 ? 'col-span-2 aspect-video' : ''}`} onClick={() => onEnlarge(img)}>
                                  <img src={img} className="w-full h-full object-cover" />
                                </div>
                              ))
                            ) : (
                              <div className="col-span-2 py-4 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon size={20} className="mb-1 opacity-50" />
                                <span className="text-[10px] font-medium italic">Chưa có ảnh mẫu</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-gray-100">
                          <h5 className="text-[11px] font-bold text-[#34B057] uppercase flex items-center gap-1.5"><Layers size={12} /> Bản thiết kế 3D</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {spec.designImages.length > 0 ? (
                              spec.designImages.map((img, i) => {
                                const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                                return (
                                  <div key={i} className="relative aspect-square rounded-lg border border-green-100 overflow-hidden">
                                    <img src={src} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onEnlarge(src)} />
                                    {canEditProduction && <button onClick={() => handleRemoveDesignImage(index, i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X size={14} /></button>}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="col-span-2 py-4 border border-dashed border-green-100/50 rounded-lg bg-green-50/30 flex flex-col items-center justify-center text-green-600/50">
                                <ImageIcon size={20} className="mb-1 opacity-50" />
                                <span className="text-[10px] font-medium italic">Chưa có bản thiết kế 3D</span>
                              </div>
                            )}
                            {canEditProduction && (
                              <label className="col-span-2 flex flex-col items-center justify-center py-4 border border-dashed border-[#34B057]/40 rounded-lg bg-[#EAF6EE]/50 text-[#34B057] cursor-pointer hover:bg-[#EAF6EE]">
                                <UploadCloud size={18} /> <span className="text-[11px] font-bold mt-1">Tải ảnh 3D</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleAddDesignImages(index, e.target.files)} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Spec fields */}
                      <div className="flex-1 space-y-5">
                        <div className="border-b border-gray-50 pb-4">
                          <h4 className="text-[17px] font-bold text-gray-900 mb-4">{spec.name}</h4>

                          {Number(spec.item_is_bundle) === 1 && (
                            <span className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold">
                              <Package size={11} /> Bộ sản phẩm
                            </span>
                          )}

                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                              <EditableSpecItem label="Chất liệu" value={spec.material} readOnly={!canEdit} onFocus={() => canEdit && setActiveDropdown({ index, type: 'material' })} onBlur={() => setTimeout(() => setActiveDropdown({ index: null, type: null }), 200)} onChange={(v) => handleUpdateItemSpec(index, "material", v)} options={activeDropdown.index === index && activeDropdown.type === 'material' ? materialOptions : null} onSelect={(v) => handleUpdateItemSpec(index, "material", v)} />
                              <EditableSpecItem label="Màu sắc" value={spec.color} readOnly={!canEdit} onFocus={() => canEdit && setActiveDropdown({ index, type: 'color' })} onBlur={() => setTimeout(() => setActiveDropdown({ index: null, type: null }), 200)} onChange={(v) => handleUpdateItemSpec(index, "color", v)} options={activeDropdown.index === index && activeDropdown.type === 'color' ? colorOptions : null} onSelect={(v) => handleUpdateItemSpec(index, "color", v)} />
                              <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Số lượng</p><div className="text-[14px] font-bold text-gray-700">{spec.quantity}</div></div>
                            </div>

                            <div className={`p-3.5 rounded-xl grid grid-cols-2 gap-6 border transition-all ${canEditProduction ? 'bg-[#EAF6EE]/30 border-[#34B057]/20' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                              <div className="space-y-1">
                                <label className={`text-[10px] font-bold uppercase block ${canEditProduction ? 'text-[#34B057]' : 'text-gray-400'}`}>Đơn giá bán (đ)</label>
                                <input
                                  type="text"
                                  readOnly={!canEditProduction}
                                  value={spec.price === 0 ? "" : spec.price.toLocaleString("vi-VN")}
                                  onChange={(e) => handleUpdateItemSpec(index, "price", Number(e.target.value.replace(/\D/g, "")))}
                                  className={`w-full bg-transparent border-none focus:ring-0 text-[16px] font-black p-0 ${canEditProduction ? 'text-[#34B057] border-b border-[#34B057]/10 cursor-text' : 'text-gray-400 cursor-not-allowed'}`}
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-1 border-l border-gray-200 pl-6">
                                <label className={`text-[10px] font-bold uppercase block ${canEditProduction ? 'text-amber-600' : 'text-gray-400'}`}>Giá vốn / Nhập (đ)</label>
                                <input
                                  type="text"
                                  readOnly={!canEditProduction}
                                  value={spec.costPrice === 0 ? "" : spec.costPrice.toLocaleString("vi-VN")}
                                  onChange={(e) => handleUpdateItemSpec(index, "costPrice", Number(e.target.value.replace(/\D/g, "")))}
                                  className={`w-full bg-transparent border-none focus:ring-0 text-[16px] font-black p-0 ${canEditProduction ? 'text-amber-600 border-b border-amber-100 cursor-text' : 'text-gray-400 cursor-not-allowed'}`}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* === BUNDLE: danh sách món === */}
                          {Number(spec.item_is_bundle) === 1 ? (
                            <div className="col-span-2 space-y-3 p-4 rounded-xl border bg-amber-50/30 border-amber-100">
                              <p className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-2">
                                <Package size={14} /> Bộ sản phẩm ({(spec.item_bundle_items || []).length} món)
                              </p>
                              <div className="space-y-2">
                                {(spec.item_bundle_items || []).map((sub, si) => {
                                  const size = sub.size || {};
                                  const dims = [size.length, size.width, size.height].filter(v => v && v > 0);
                                  const sizeStr = dims.length > 0 ? dims.join(' × ') + ` ${size.unit || 'cm'}` : null;
                                  return (
                                    <div key={si} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-amber-100">
                                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black shrink-0">{si + 1}</div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-gray-800 truncate">{sub.name}</p>
                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                          <span className="text-[11px] text-gray-500">SL: <b className="text-gray-700">{sub.quantity}</b></span>
                                          {sizeStr && (
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                              <Ruler size={10} className="text-gray-400" /> <b className="text-gray-700">{sizeStr}</b>
                                            </span>
                                          )}
                                          {size.note && <span className="text-[11px] text-gray-400 italic">({size.note})</span>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {(spec.item_bundle_items || []).length === 0 && (
                                  <div className="py-3 text-center text-[12px] text-amber-500 italic">Chưa có thông tin các món trong bộ</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* === ĐƠN LẺ: kích thước === */
                            <div className={`space-y-3 p-4 rounded-xl border ${canEdit ? 'bg-[#EAF6EE]/50 border-[#34B057]/10' : 'bg-gray-50/50 border-gray-100'}`}>
                              <p className={`text-[10px] font-bold uppercase flex items-center gap-2 ${canEdit ? 'text-[#34B057]' : 'text-gray-400'}`}><Ruler size={14} /> Kích thước (D x R x C)</p>
                              <div className="flex items-center gap-2">
                                {['length', 'width', 'height'].map((f, i) => (
                                  <div key={f} className="flex-1 flex items-center gap-1">
                                    <input type="number" readOnly={!canEdit} value={spec[f]} onChange={(e) => handleUpdateItemSpec(index, f, e.target.value)} className={`w-full border rounded-lg text-center text-[13px] font-bold py-2 transition-all ${canEdit ? 'bg-white border-[#34B057]/20 text-gray-700 cursor-text' : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`} />
                                    {i < 2 && <span className="text-gray-300">×</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* === PHÂN BỔ SẢN XUẤT — hiển thị cho cả đơn lẻ VÀ bộ sản phẩm === */}
                          <div className={`space-y-3 p-4 rounded-xl border transition-all ${Number(spec.item_is_bundle) === 1 ? 'col-span-2' : ''} ${canEditProduction ? 'bg-amber-50/30 border-amber-100' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                            <p className={`text-[10px] font-bold uppercase flex items-center gap-2 ${canEditProduction ? 'text-amber-600' : 'text-gray-400'}`}><Camera size={14} /> Phân bổ sản xuất</p>
                            <div className="flex flex-col gap-3">
                              <div className={`bg-white p-2.5 rounded-lg border ${canEditProduction ? 'border-amber-100' : 'border-gray-50'}`}>
                                <label className={`text-[9px] font-bold uppercase ${canEditProduction ? 'text-amber-600' : 'text-gray-400'}`}>Xưởng / Nhà cung cấp</label>
                                <select
                                  disabled={!canEditProduction}
                                  value={spec.fk_supplier_id}
                                  onChange={(e) => handleUpdateItemSpec(index, "fk_supplier_id", e.target.value)}
                                  className={`w-full bg-transparent border-none text-[13px] font-bold p-0 mt-0.5 ${canEditProduction ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                                >
                                  <option value="">Chọn xưởng...</option>
                                  {suppliers.map(s => (
                                    <option key={s.pk_supplier_id} value={String(s.pk_supplier_id)}>{s.supplier_name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className={`bg-white p-2.5 rounded-lg border ${canEditProduction ? 'border-amber-100' : 'border-gray-50'}`}>
                                <label className={`text-[9px] font-bold uppercase ${canEditProduction ? 'text-amber-600' : 'text-gray-400'}`}>Ngày xong dự kiến</label>
                                <input
                                  type="date"
                                  readOnly={!canEditProduction}
                                  value={spec.expectedWorkshopDate}
                                  onChange={(e) => handleUpdateItemSpec(index, "expectedWorkshopDate", e.target.value)}
                                  className={`w-full bg-transparent border-none text-[13px] font-bold p-0 mt-0.5 ${canEditProduction ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all ${canEdit ? 'bg-[#EAF6EE]/20 border-[#34B057]/10' : 'bg-gray-50/20 border-gray-100 opacity-60'}`}>
                          <label className={`text-[10px] font-bold uppercase block mb-1 flex items-center gap-2 ${canEdit ? 'text-[#34B057]' : 'text-gray-400'}`}><FileText size={14} /> Yêu cầu kỹ thuật</label>
                          <textarea readOnly={!canEdit} value={spec.note} onChange={(e) => handleUpdateItemSpec(index, "note", e.target.value)} className={`w-full bg-transparent border-none text-[13px] p-0 resize-none italic ${canEdit ? 'text-gray-700 cursor-text' : 'text-gray-400 cursor-not-allowed'}`} rows={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lưu ý</span>
            <span className="text-[12px] text-gray-500 italic">Kiểm tra thông số trước khi {userRole === 'owner' ? 'tiếp nhận' : 'lưu'}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Sales buttons */}
            {userRole === 'sales' && req.status === "Chờ tiếp nhận" && (
              !isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[13px] font-bold hover:bg-indigo-100 flex items-center gap-2"><FileText size={16} /> Chỉnh sửa</button>
                  <button onClick={() => handleUpdateStatus(0, "Đã hủy yêu cầu")} className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-[13px] font-bold hover:bg-red-50 flex items-center gap-2"><AlertCircle size={16} /> Hủy yêu cầu</button>
                </>
              ) : (
                <>
                  <button onClick={handleSaveAll} disabled={isSaving} className="px-6 py-2 bg-[#34B057] text-white rounded-lg text-[13px] font-bold hover:bg-[#2d9a4c] flex items-center gap-2 disabled:opacity-50">{isSaving ? 'Đang lưu...' : <><Save size={16} /> Lưu</>}</button>
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-white text-gray-500 border border-gray-200 rounded-lg text-[13px] font-bold hover:bg-gray-50">Hủy</button>
                </>
              )
            )}

            {/* Owner buttons */}
            {userRole === 'owner' && (
              req.status === "Chờ tiếp nhận" ? (
                <>
                  <button onClick={() => handleUpdateStatus(2, "Đã tiếp nhận yêu cầu")} className="px-6 py-2 bg-[#34B057] text-white rounded-lg text-[13px] font-bold hover:bg-[#2d9a4c] flex items-center gap-2"><CheckCircle size={16} /> Tiếp nhận</button>
                  <button onClick={() => handleUpdateStatus(0, "Đã hủy yêu cầu")} className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-[13px] font-bold hover:bg-red-50 flex items-center gap-2"><AlertCircle size={16} /> Hủy bỏ</button>
                </>
              ) : req.status === "Đã tiếp nhận" ? (
                !isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[13px] font-bold hover:bg-indigo-100 flex items-center gap-2"><FileText size={16} /> Cập nhật kỹ thuật</button>
                    <button onClick={() => handleUpdateStatus(3, "Đã hoàn thành yêu cầu")} className="px-6 py-2 bg-[#34B057] text-white rounded-lg text-[13px] font-bold hover:bg-[#2d9a4c] flex items-center gap-2"><CheckCircle size={16} /> Hoàn thành</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSaveAll} disabled={isSaving} className="px-6 py-2 bg-[#34B057] text-white rounded-lg text-[13px] font-bold hover:bg-[#2d9a4c] flex items-center gap-2 disabled:opacity-50">{isSaving ? 'Đang lưu...' : <><Save size={16} /> Lưu thay đổi</>}</button>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-white text-gray-500 border border-gray-200 rounded-lg text-[13px] font-bold hover:bg-gray-50">Hủy</button>
                  </>
                )
              ) : null
            )}

            {!isEditing && <button onClick={onClose} className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors">Đóng</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= HELPER =============
const EditableSpecItem = ({ label, value, onChange, options, onSelect, onFocus, onBlur, readOnly }) => (
  <div className={`relative transition-all ${readOnly ? 'opacity-60' : ''}`}>
    <label className={`text-[10px] font-bold uppercase block mb-1 ${readOnly ? 'text-gray-400' : 'text-[#34B057]'}`}>{label}</label>
    <input type="text" value={value} onFocus={onFocus} onBlur={onBlur} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} className={`w-full bg-transparent border-none focus:ring-0 text-[13px] font-bold p-0 border-b transition-all ${readOnly ? 'text-gray-400 border-gray-100 cursor-not-allowed' : 'text-gray-700 border-[#34B057]/30 focus:border-[#34B057] cursor-text'}`} />
    {options && (
      <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg z-50 max-h-40 overflow-y-auto border-gray-100 shadow-lg">
        {options.filter(o => o.toLowerCase().includes(value.toLowerCase())).map(o => (
          <div key={o} onMouseDown={() => onSelect(o)} className="px-3 py-2 text-[12px] hover:bg-[#EAF6EE] hover:text-[#34B057] cursor-pointer transition-colors">{o}</div>
        ))}
      </div>
    )}
  </div>
);