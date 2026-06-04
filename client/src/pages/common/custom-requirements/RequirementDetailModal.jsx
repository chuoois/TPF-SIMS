/**
 * RequirementDetailModal — Chi tiết yêu cầu kỹ thuật (UNIFIED)
 * Handles both Sales and Owner roles with specific permissions.
 */

import React, { useState, useEffect } from "react";
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
  Plus,
  Trash2,
  Store,
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditing) {
      setErrors({});
    }
  }, [isEditing]);

  const validateField = (field, value, specIndex = null, subIndex = null) => {
    if (!isEditing) return "";

    let errorMsg = "";
    if (userRole === 'owner') {
      if (specIndex === null) {
        if (field === "deliveryMethod") {
          if (!value) errorMsg = "Vui lòng chọn phương thức giao hàng";
        } else if (field === "deliveryDate") {
          if (!value) {
            errorMsg = "Vui lòng chọn ngày giao dự kiến";
          } else {
            const delD = new Date(value);
            delD.setHours(0, 0, 0, 0);
            for (let i = 0; i < itemSpecs.length; i++) {
              if (itemSpecs[i].expectedWorkshopDate) {
                const wsD = new Date(itemSpecs[i].expectedWorkshopDate);
                wsD.setHours(0, 0, 0, 0);
                if (wsD >= delD) {
                  errorMsg = `Ngày giao phải sau ngày xong xưởng của "${itemSpecs[i].name || i + 1}" (${itemSpecs[i].expectedWorkshopDate})`;
                  break;
                }
              }
            }
          }
        } else if (field === "totalAmount") {
          if (!value || Number(value) <= 0) errorMsg = "Tổng tiền phải lớn hơn 0";
        } else if (field === "depositAmount") {
          if (value === undefined || value === null || value === "") {
            errorMsg = "Tiền cọc không được để trống";
          } else if (Number(value) < 0) {
            errorMsg = "Tiền cọc không được nhỏ hơn 0";
          }
        }
      } else {
        const spec = itemSpecs[specIndex];
        if (subIndex === null) {
          if (field === "material") {
            if (!value || !value.trim()) errorMsg = "Vui lòng nhập chất liệu";
          } else if (field === "color") {
            if (!value || !value.trim()) errorMsg = "Vui lòng nhập màu sắc";
          } else if (field === "quantity") {
            if (!value || Number(value) <= 0) errorMsg = "Số lượng phải lớn hơn 0";
          } else if (field === "price") {
            if (!value || Number(value) <= 0) errorMsg = "Đơn giá bán phải lớn hơn 0";
          } else if (field === "costPrice") {
            if (!value || Number(value) <= 0) {
              errorMsg = "Giá vốn phải lớn hơn 0";
            } else if (Number(value) > Number(spec.price)) {
              errorMsg = "Giá vốn không được lớn hơn giá bán";
            }
          } else if (field === "item_warranty") {
            if (value === undefined || value === null || value === "") {
              errorMsg = "Bảo hành không được để trống";
            } else if (Number(value) < 0) {
              errorMsg = "Bảo hành không được < 0";
            }
          } else if (field === "fk_supplier_id") {
            if (!value) errorMsg = "Vui lòng chọn xưởng";
          } else if (field === "expectedWorkshopDate") {
            if (!value) {
              errorMsg = "Vui lòng nhập ngày xong xưởng";
            } else if (deliveryDate) {
              const wsD = new Date(value);
              const delD = new Date(deliveryDate);
              wsD.setHours(0, 0, 0, 0);
              delD.setHours(0, 0, 0, 0);
              if (wsD >= delD) {
                errorMsg = `Ngày xong xưởng phải trước ngày giao dự kiến`;
              }
            }
          }
        } else {
          if (field === "bundle_name") {
            if (!value || !value.trim()) errorMsg = "Vui lòng nhập tên món";
          } else if (field === "bundle_quantity") {
            if (!value || Number(value) <= 0) errorMsg = "Số lượng phải > 0";
          }
        }
      }
    }

    const key = specIndex === null
      ? field
      : subIndex === null
        ? `specs.${specIndex}.${field}`
        : `specs.${specIndex}.bundle.${subIndex}.${field}`;

    setErrors(prev => {
      const next = { ...prev };
      if (errorMsg) {
        next[key] = errorMsg;
      } else {
        delete next[key];
      }
      return next;
    });

    return errorMsg;
  };

  const validateAll = () => {
    if (userRole !== 'owner') return { isValid: true, errors: {} };

    const newErrors = {};

    // Ưu tiên kiểm tra Phân bổ sản xuất trước
    for (let i = 0; i < itemSpecs.length; i++) {
      const spec = itemSpecs[i];
      if (!spec.fk_supplier_id) newErrors[`specs.${i}.fk_supplier_id`] = "Vui lòng chọn xưởng";
      if (!spec.expectedWorkshopDate) {
        newErrors[`specs.${i}.expectedWorkshopDate`] = "Vui lòng nhập ngày xong xưởng";
      } else if (deliveryDate) {
        const wsD = new Date(spec.expectedWorkshopDate);
        const delD = new Date(deliveryDate);
        wsD.setHours(0, 0, 0, 0);
        delD.setHours(0, 0, 0, 0);
        if (wsD >= delD) {
          newErrors[`specs.${i}.expectedWorkshopDate`] = `Ngày xong xưởng phải trước ngày giao dự kiến `;
        }
      }
    }


    if (!deliveryMethod) newErrors["deliveryMethod"] = "Vui lòng chọn phương thức giao hàng";
    if (!deliveryDate) {
      newErrors["deliveryDate"] = "Vui lòng chọn ngày giao dự kiến";
    } else {
      const delD = new Date(deliveryDate);
      delD.setHours(0, 0, 0, 0);
      for (let i = 0; i < itemSpecs.length; i++) {
        if (itemSpecs[i].expectedWorkshopDate) {
          const wsD = new Date(itemSpecs[i].expectedWorkshopDate);
          wsD.setHours(0, 0, 0, 0);
          if (wsD >= delD) {
            newErrors["deliveryDate"] = `Ngày giao phải sau ngày xong xưởng của "${itemSpecs[i].name || i + 1}" (${itemSpecs[i].expectedWorkshopDate})`;
            break;
          }
        }
      }
    }
    if (!totalAmount || Number(totalAmount) <= 0) newErrors["totalAmount"] = "Tổng tiền phải lớn hơn 0";
    if (depositAmount === undefined || depositAmount === null || depositAmount === "") {
      newErrors["depositAmount"] = "Tiền cọc không được để trống";
    } else if (Number(depositAmount) < 0) {
      newErrors["depositAmount"] = "Tiền cọc không được nhỏ hơn 0";
    }


    for (let i = 0; i < itemSpecs.length; i++) {
      const spec = itemSpecs[i];

      if (!spec.material || !spec.material.trim()) newErrors[`specs.${i}.material`] = "Vui lòng nhập chất liệu";
      if (!spec.color || !spec.color.trim()) newErrors[`specs.${i}.color`] = "Vui lòng nhập màu sắc";
      if (!spec.quantity || Number(spec.quantity) <= 0) newErrors[`specs.${i}.quantity`] = "Số lượng phải lớn hơn 0";
      if (!spec.price || Number(spec.price) <= 0) newErrors[`specs.${i}.price`] = "Đơn giá bán phải lớn hơn 0";

      if (!spec.costPrice || Number(spec.costPrice) <= 0) {
        newErrors[`specs.${i}.costPrice`] = "Giá vốn phải lớn hơn 0";
      } else if (Number(spec.costPrice) > Number(spec.price)) {
        newErrors[`specs.${i}.costPrice`] = "Giá vốn không được lớn hơn giá bán";
      }

      if (Number(spec.item_is_bundle) !== 1) {
        // Không validate dài rộng cao
      } else {
        if (!spec.item_bundle_items || spec.item_bundle_items.length === 0) {
          newErrors[`specs.${i}.bundle`] = "Bộ sản phẩm phải có ít nhất 1 món";
        } else {
          for (let j = 0; j < spec.item_bundle_items.length; j++) {
            const sub = spec.item_bundle_items[j];
            if (!sub.name || !sub.name.trim()) newErrors[`specs.${i}.bundle.${j}.bundle_name`] = "Vui lòng nhập tên món";
            if (!sub.quantity || Number(sub.quantity) <= 0) newErrors[`specs.${i}.bundle.${j}.bundle_quantity`] = "Số lượng phải > 0";

            const size = sub.size || {};
            // Không validate dài rộng cao
          }
        }
      }

      if (spec.item_warranty === undefined || spec.item_warranty === null || spec.item_warranty === "") {
        newErrors[`specs.${i}.item_warranty`] = "Bảo hành không được để trống";
      } else if (Number(spec.item_warranty) < 0) {
        newErrors[`specs.${i}.item_warranty`] = "Bảo hành không được < 0";
      }



    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

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

  // Quyền sửa thông tin chung (Giao hàng, Thanh toán, Ghi chú, Bản thiết kế 3D)
  // → Chỉ Owner khi "Đã tiếp nhận"
  const canEditHeader = canEdit && userRole === 'owner';

  // Quyền sửa thông tin kỹ thuật sản phẩm (chất liệu, màu, kích thước, đơn giá, note)
  // → Sales khi "Chờ tiếp nhận", Owner khi "Đã tiếp nhận"
  const canEditSpec = canEdit;

  // Quyền sửa các thông tin quản lý (Xưởng, Giá vốn, Ngày xong xưởng) - Chỉ dành cho Owner
  const canEditManagement = canEdit && userRole === 'owner';

  // Chưa bấm chỉnh sửa → mờ toàn bộ nội dung (cả Sales lẫn Owner)
  const isInactive = !isEditing;

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
          item_warranty: item.item_warranty || 12,
        })),
      );
      setIsEditing(false);
    }
  }, [req]);

  // Tự động tính tổng tiền từ đơn giá từng sản phẩm
  useEffect(() => {
    if (!canEditSpec) return;
    const newTotal = itemSpecs.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    if (newTotal !== totalAmount) {
      setTotalAmount(newTotal);
    }
  }, [itemSpecs, canEditSpec]);

  // Tự động cập nhật tiền cọc khi thay đổi tổng tiền hoặc chế độ trả đủ
  useEffect(() => {
    if (!canEditHeader) return;
    if (isFullPayment) {
      setDepositAmount(totalAmount);
    } else {
      const suggested = calculateSuggested(totalAmount);
      setDepositAmount(suggested.amount);
    }
  }, [totalAmount, isFullPayment, canEditHeader]);

  // Tự động tính tổng giá nhập (Owner only)
  useEffect(() => {
    if (userRole !== 'owner') return;
    const newTotalCost = itemSpecs.reduce((sum, item) => sum + (Number(item.costPrice) || 0) * (Number(item.quantity) || 1), 0);
    setTotalCostPrice(newTotalCost);
  }, [itemSpecs, userRole]);

  const handleUpdateItemSpec = (index, field, value) => {
    if (!canEditSpec) return;
    const newSpecs = [...itemSpecs];
    newSpecs[index][field] = value;
    setItemSpecs(newSpecs);
  };

  const handleAddBundleSubItem = (itemIndex) => {
    if (!canEditSpec) return;
    const newSpecs = [...itemSpecs];
    const bundleItems = [...(newSpecs[itemIndex].item_bundle_items || [])];
    bundleItems.push({
      name: "Sản phẩm mới",
      quantity: 1,
      size: { length: 0, width: 0, height: 0, unit: "cm", note: "" }
    });
    newSpecs[itemIndex].item_bundle_items = bundleItems;
    setItemSpecs(newSpecs);
  };

  const handleUpdateBundleSubItem = (itemIndex, subIndex, field, value) => {
    if (!canEditSpec) return;
    const newSpecs = [...itemSpecs];
    const bundleItems = [...(newSpecs[itemIndex].item_bundle_items || [])];

    if (field.startsWith("size.")) {
      const sizeField = field.split(".")[1];
      bundleItems[subIndex].size = { ...bundleItems[subIndex].size, [sizeField]: value };
    } else {
      bundleItems[subIndex][field] = value;
    }

    newSpecs[itemIndex].item_bundle_items = bundleItems;
    setItemSpecs(newSpecs);
  };

  const handleRemoveBundleSubItem = (itemIndex, subIndex) => {
    if (!canEditSpec) return;
    const newSpecs = [...itemSpecs];
    const bundleItems = [...(newSpecs[itemIndex].item_bundle_items || [])];
    bundleItems.splice(subIndex, 1);
    newSpecs[itemIndex].item_bundle_items = bundleItems;
    setItemSpecs(newSpecs);
  };

  const handleSaveAll = async () => {
    if (userRole === 'owner') {
      const { isValid, errors: formErrors } = validateAll();
      if (!isValid) {
        const firstError = Object.values(formErrors)[0];
        toast.error(firstError || "Vui lòng kiểm tra và sửa các thông tin bị lỗi hiển thị trên form!");
        return;
      }
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
          item_is_bundle: spec.item_is_bundle,
          item_bundle_items: spec.item_bundle_items,
          item_warranty: spec.item_warranty,
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
    if (!canEditHeader || !files || files.length === 0) return;
    const newSpecs = [...itemSpecs];
    const newFilesArray = Array.from(files);
    newSpecs[index].designImages = [...(newSpecs[index].designImages || []), ...newFilesArray];
    setItemSpecs(newSpecs);
  };

  const handleRemoveDesignImage = (index, imgIndex) => {
    if (!canEditHeader) return;
    const newSpecs = [...itemSpecs];
    newSpecs[index].designImages = newSpecs[index].designImages.filter((_, i) => i !== imgIndex);
    setItemSpecs(newSpecs);
  };

  const handleUpdateStatus = async (newStatus, successMsg) => {
    // Chỉ validate phương thức giao hàng khi xác nhận hoàn thành (xác nhận giao hàng)
    if (newStatus === 3) {
      const { isValid, errors: formErrors } = validateAll();
      if (!isValid) {
        const firstError = Object.values(formErrors)[0];
        toast.error(firstError || "Vui lòng kiểm tra và sửa các thông tin bị lỗi hiển thị trên form!");
        return;
      }
    }

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
          <div className={`max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 p-6 transition-all duration-500 ${isInactive ? 'opacity-100 pointer-events-none select-none' : ''}`}>
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
                  <div className={`space-y-2 p-3 rounded-lg transition-all ${canEditHeader ? errors["deliveryMethod"] ? 'bg-red-50/20 border border-red-300' : 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <p className={`text-[10px] font-bold uppercase ${canEditHeader ? errors["deliveryMethod"] ? 'text-red-500' : 'text-[#34B057]' : 'text-gray-400'}`}>Phương thức</p>
                    <div className="flex flex-col gap-2">
                      {['Lấy tại cửa hàng', 'Giao tận nhà'].map(m => (
                        <label key={m} className={`flex items-center gap-2 ${canEditHeader ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input
                            type="radio"
                            disabled={!canEditHeader}
                            checked={deliveryMethod === m}
                            onChange={() => {
                              setDeliveryMethod(m);
                              validateField("deliveryMethod", m);
                            }}
                            className="w-3.5 h-3.5 text-[#34B057] focus:ring-0"
                          />
                          <span className={`text-[13px] ${deliveryMethod === m ? "font-bold text-[#34B057]" : "text-gray-600"}`}>{m}</span>
                        </label>
                      ))}
                    </div>
                    {errors["deliveryMethod"] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors["deliveryMethod"]}</p>}
                  </div>
                  <div className={`space-y-1.5 p-3 rounded-lg transition-all ${canEditHeader ? errors["deliveryDate"] ? 'bg-red-50/20 border border-red-300' : 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <p className={`text-[10px] font-bold uppercase ${canEditHeader ? errors["deliveryDate"] ? 'text-red-500' : 'text-[#34B057]' : 'text-gray-400'}`}>Ngày giao (Dự kiến)</p>
                    <input
                      type="date"
                      readOnly={!canEditHeader}
                      value={deliveryDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setDeliveryDate(newDate);
                        validateField("deliveryDate", newDate);
                      }}
                      onBlur={() => validateField("deliveryDate", deliveryDate)}
                      className={`w-full border rounded-lg text-[13px] font-bold px-3 py-2 transition-colors ${errors["deliveryDate"] ? 'border-red-300' : 'border-[#34B057]/20'} ${canEditHeader ? 'bg-white text-gray-700 focus:border-[#34B057] cursor-pointer' : 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed'}`}
                    />
                    {errors["deliveryDate"] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors["deliveryDate"]}</p>}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><CheckCircle size={14} /> Thanh toán (đ)</h3>
                <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-4">
                  <div className={`space-y-1 p-3 rounded-lg transition-all ${canEditHeader ? errors["totalAmount"] ? 'bg-red-50/20 border border-red-300' : 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-[10px] font-bold uppercase ${canEditHeader ? errors["totalAmount"] ? 'text-red-500' : 'text-[#34B057]' : 'text-gray-400'}`}>Tổng tiền</p>
                      {canEditHeader && (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="w-3 h-3 rounded text-[#34B057]" checked={isFullPayment} onChange={(e) => setIsFullPayment(e.target.checked)} />
                          <span className="text-[11px] font-bold text-[#34B057]">Trả đủ</span>
                        </label>
                      )}
                    </div>
                    <input
                      type="text"
                      readOnly={!canEditHeader}
                      value={totalAmount === 0 ? "" : totalAmount.toLocaleString("vi-VN")}
                      onChange={(e) => {
                        const v = Number(e.target.value.replace(/\D/g, ""));
                        setTotalAmount(v);
                        validateField("totalAmount", v);
                      }}
                      onBlur={() => validateField("totalAmount", totalAmount)}
                      className={`w-full text-[18px] font-bold bg-transparent border-none focus:ring-0 p-0 ${canEditHeader ? errors["totalAmount"] ? 'text-red-500 border-b border-red-500/30' : 'text-[#34B057] border-b border-[#34B057]/10' : 'text-gray-400'} cursor-text`}
                    />
                    {errors["totalAmount"] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors["totalAmount"]}</p>}
                  </div>
                  <div className={`space-y-1 p-3 rounded-lg transition-all ${canEditHeader && !isFullPayment ? errors["depositAmount"] ? 'bg-red-50/20 border border-red-300' : 'bg-[#EAF6EE]/40 border border-[#34B057]/20' : 'opacity-60'}`}>
                    <p className={`text-[10px] font-bold uppercase ${canEditHeader && !isFullPayment ? errors["depositAmount"] ? 'text-red-500' : 'text-[#34B057]' : 'text-gray-400'}`}>Tiền cọc</p>
                    <input
                      type="text"
                      readOnly={!canEditHeader || isFullPayment}
                      value={depositAmount === 0 ? "" : depositAmount.toLocaleString("vi-VN")}
                      onChange={(e) => {
                        const v = Number(e.target.value.replace(/\D/g, ""));
                        setDepositAmount(v);
                        validateField("depositAmount", v);
                      }}
                      onBlur={() => validateField("depositAmount", depositAmount)}
                      className={`w-full text-[16px] font-bold bg-transparent border-none focus:ring-0 p-0 ${canEditHeader && !isFullPayment ? errors["depositAmount"] ? 'text-red-500 border-b border-red-500/30' : 'text-gray-700 border-b border-gray-100' : 'text-gray-400'} cursor-text`}
                    />
                    {errors["depositAmount"] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors["depositAmount"]}</p>}
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 ${canEditHeader ? errors["notes"] ? 'text-red-500' : 'text-[#34B057]' : 'text-gray-400'}`}><FileText size={14} /> Ghi chú</h3>
                <textarea
                  value={notes}
                  readOnly={!canEditHeader}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNotes(v);
                    validateField("notes", v);
                  }}
                  onBlur={() => validateField("notes", notes)}
                  className={`w-full h-24 p-3 rounded-xl border text-[12px] resize-none transition-all ${canEditHeader ? errors["notes"] ? 'border-red-300 bg-red-50/10 text-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-[#34B057]/20 bg-[#EAF6EE]/30 text-gray-700 focus:ring-2 focus:ring-[#34B057]/20 cursor-text' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'}`}
                  placeholder={canEditHeader ? "Nhập ghi chú chung..." : ""}
                />
                {errors["notes"] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors["notes"]}</p>}
              </section>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2"><Layers size={18} className={isInactive ? 'text-gray-400' : 'text-[#34B057]'} /> Chi tiết Kỹ thuật <span className={`ml-2 px-2 py-0.5 text-[11px] rounded-full ${isInactive ? 'bg-gray-100 text-gray-400' : 'bg-[#EAF6EE] text-[#34B057]'}`}>{itemSpecs.length} sản phẩm</span></h3>
              </div>

              <div className="space-y-8 pb-10">
                {itemSpecs.map((spec, index) => (
                  <div key={spec.id} className={`flex flex-col gap-6 p-6 rounded-2xl border border-gray-100 bg-white transition-all ${canEditSpec ? 'hover:border-[#34B057]/30' : ''}`}>
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

                        <div className={`space-y-2 pt-3 border-t border-gray-100 ${!canEditHeader ? 'opacity-60' : ''}`}>
                          <h5 className={`text-[11px] font-bold uppercase flex items-center gap-1.5 ${canEditHeader ? 'text-[#34B057]' : 'text-gray-400'}`}><Layers size={12} /> Bản thiết kế 3D</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {spec.designImages.length > 0 ? (
                              spec.designImages.map((img, i) => {
                                const src = typeof img === 'string' ? img : (img instanceof Blob || img instanceof File ? URL.createObjectURL(img) : "");
                                if (!src) return null;
                                return (
                                  <div key={i} className={`relative aspect-square rounded-lg border overflow-hidden ${canEditHeader ? 'border-green-100' : 'border-gray-200'}`}>
                                    <img src={src} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onEnlarge(src)} />
                                    {canEditHeader && <button onClick={() => handleRemoveDesignImage(index, i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X size={14} /></button>}
                                  </div>
                                );
                              })
                            ) : (
                              <div className={`col-span-2 py-4 border border-dashed rounded-lg flex flex-col items-center justify-center ${canEditHeader ? 'border-green-100/50 bg-green-50/30 text-green-600/50' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                                <ImageIcon size={20} className="mb-1 opacity-50" />
                                <span className="text-[10px] font-medium italic">Chưa có bản thiết kế 3D</span>
                              </div>
                            )}
                            {canEditHeader && (
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



                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                              <EditableSpecItem label="Chất liệu" value={spec.material} error={errors[`specs.${index}.material`]} readOnly={!canEditSpec} onFocus={() => canEditSpec && setActiveDropdown({ index, type: 'material' })} onBlur={() => { setTimeout(() => setActiveDropdown({ index: null, type: null }), 200); validateField("material", spec.material, index); }} onChange={(v) => { handleUpdateItemSpec(index, "material", v); validateField("material", v, index); }} options={activeDropdown.index === index && activeDropdown.type === 'material' ? materialOptions : null} onSelect={(v) => { handleUpdateItemSpec(index, "material", v); validateField("material", v, index); }} />
                              <EditableSpecItem label="Màu sắc" value={spec.color} error={errors[`specs.${index}.color`]} readOnly={!canEditSpec} onFocus={() => canEditSpec && setActiveDropdown({ index, type: 'color' })} onBlur={() => { setTimeout(() => setActiveDropdown({ index: null, type: null }), 200); validateField("color", spec.color, index); }} onChange={(v) => { handleUpdateItemSpec(index, "color", v); validateField("color", v, index); }} options={activeDropdown.index === index && activeDropdown.type === 'color' ? colorOptions : null} onSelect={(v) => { handleUpdateItemSpec(index, "color", v); validateField("color", v, index); }} />
                              <div className={`transition-all ${!canEditSpec ? 'opacity-60' : ''}`}>
                                <label className={`text-[10px] font-bold uppercase block mb-1 ${!canEditSpec ? 'text-gray-400' : errors[`specs.${index}.quantity`] ? 'text-red-500' : 'text-[#34B057]'}`}>Số lượng</label>
                                <input
                                  type="number"
                                  min="1"
                                  readOnly={!canEditSpec}
                                  value={spec.quantity}
                                  onChange={(e) => {
                                    const v = Math.max(1, Number(e.target.value));
                                    handleUpdateItemSpec(index, "quantity", v);
                                    validateField("quantity", v, index);
                                  }}
                                  onBlur={() => validateField("quantity", spec.quantity, index)}
                                  className={`w-full bg-transparent border-none focus:ring-0 text-[13px] font-bold p-0 border-b transition-all ${!canEditSpec ? 'text-gray-400 border-gray-100 cursor-not-allowed' : errors[`specs.${index}.quantity`] ? 'text-red-500 border-red-500/30 focus:border-red-500 cursor-text' : 'text-gray-700 border-[#34B057]/30 focus:border-[#34B057] cursor-text'}`}
                                />
                                {errors[`specs.${index}.quantity`] && <p className="text-[9px] text-red-500 font-bold mt-0.5">{errors[`specs.${index}.quantity`]}</p>}
                              </div>
                            </div>

                            <div className={`p-3.5 rounded-xl grid grid-cols-2 gap-6 border transition-all ${canEditSpec ? errors[`specs.${index}.price`] || errors[`specs.${index}.costPrice`] ? 'bg-red-50/10 border-red-200' : 'bg-[#EAF6EE]/30 border-[#34B057]/20' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                              <div className="space-y-1">
                                <label className={`text-[10px] font-bold uppercase block ${canEditSpec ? errors[`specs.${index}.price`] ? 'text-red-500' : 'text-[#34B057]' : 'text-gray-400'}`}>Đơn giá bán (đ)</label>
                                <input
                                  type="text"
                                  readOnly={!canEditSpec}
                                  value={spec.price === 0 ? "" : spec.price.toLocaleString("vi-VN")}
                                  onChange={(e) => {
                                    const v = Number(e.target.value.replace(/\D/g, ""));
                                    handleUpdateItemSpec(index, "price", v);
                                    validateField("price", v, index);
                                  }}
                                  onBlur={() => validateField("price", spec.price, index)}
                                  className={`w-full bg-transparent border-none focus:ring-0 text-[16px] font-black p-0 ${canEditSpec ? errors[`specs.${index}.price`] ? 'text-red-500 border-b border-red-500/30' : 'text-[#34B057] border-b border-[#34B057]/10' : 'text-gray-400'} cursor-text`}
                                  placeholder="0"
                                />
                                {errors[`specs.${index}.price`] && <p className="text-[9px] text-red-500 font-bold mt-0.5">{errors[`specs.${index}.price`]}</p>}
                              </div>
                              <div className="space-y-1 border-l border-gray-200 pl-6">
                                <label className={`text-[10px] font-bold uppercase block ${canEditManagement ? errors[`specs.${index}.costPrice`] ? 'text-red-500' : 'text-amber-600' : 'text-gray-400'}`}>Giá vốn / Nhập (đ)</label>
                                <input
                                  type="text"
                                  readOnly={!canEditManagement}
                                  value={spec.costPrice === 0 ? "" : spec.costPrice.toLocaleString("vi-VN")}
                                  onChange={(e) => {
                                    const v = Number(e.target.value.replace(/\D/g, ""));
                                    handleUpdateItemSpec(index, "costPrice", v);
                                    validateField("costPrice", v, index);
                                  }}
                                  onBlur={() => validateField("costPrice", spec.costPrice, index)}
                                  className={`w-full bg-transparent border-none focus:ring-0 text-[16px] font-black p-0 ${canEditManagement ? errors[`specs.${index}.costPrice`] ? 'text-red-500 border-b border-red-500/30' : 'text-amber-600 border-b border-amber-100' : 'text-gray-400'} cursor-text`}
                                  placeholder="0"
                                />
                                {errors[`specs.${index}.costPrice`] && <p className="text-[9px] text-red-500 font-bold mt-0.5">{errors[`specs.${index}.costPrice`]}</p>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* === BUNDLE: danh sách món === */}
                          {Number(spec.item_is_bundle) === 1 ? (
                            <div className={`col-span-2 space-y-3 p-4 rounded-xl border ${isInactive ? 'bg-gray-50/50 border-gray-200' : 'bg-amber-50/30 border-amber-100'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <p className={`text-[10px] font-bold uppercase flex items-center gap-2 ${isInactive ? 'text-gray-400' : 'text-amber-600'}`}>
                                  <Package size={14} /> Bộ sản phẩm ({(spec.item_bundle_items || []).length} món)
                                </p>
                                {canEditSpec && (
                                  <button
                                    onClick={() => handleAddBundleSubItem(index)}
                                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-2 py-1 rounded bg-amber-100/50 transition-colors"
                                  >
                                    <Plus size={12} /> Thêm món
                                  </button>
                                )}
                              </div>
                              <div className="space-y-3">
                                {(spec.item_bundle_items || []).map((sub, si) => {
                                  const size = sub.size || {};
                                  const dims = [size.length, size.width, size.height].filter(v => v !== undefined && v !== "");
                                  const sizeStr = dims.length > 0 ? dims.join(' × ') + ` ${size.unit || 'cm'}` : null;

                                  return (
                                    <div key={si} className={`flex flex-col gap-3 p-3 rounded-lg bg-white border ${isInactive ? 'border-gray-200' : 'border-amber-100'}`}>
                                      <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-black shrink-0 ${isInactive ? 'bg-gray-100 text-gray-400' : 'bg-amber-100 text-amber-700'}`}>{si + 1}</div>

                                        <div className="flex-1 flex flex-col md:flex-row gap-3">
                                          {canEditSpec ? (
                                            <input
                                              type="text"
                                              value={sub.name}
                                              onChange={(e) => handleUpdateBundleSubItem(index, si, "name", e.target.value)}
                                              className="flex-1 text-[13px] font-bold text-gray-800 bg-gray-50/50 border border-transparent focus:border-amber-200 rounded px-2 py-1 outline-none"
                                              placeholder="Tên món..."
                                            />
                                          ) : (
                                            <p className="flex-1 text-[13px] font-bold text-gray-800 truncate">{sub.name}</p>
                                          )}

                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[11px] font-bold text-gray-400 uppercase">SL:</span>
                                            {canEditSpec ? (
                                              <input
                                                type="number"
                                                value={sub.quantity}
                                                onChange={(e) => handleUpdateBundleSubItem(index, si, "quantity", Number(e.target.value))}
                                                className="w-12 text-[13px] font-bold text-center text-gray-700 bg-gray-50/50 border border-transparent focus:border-amber-200 rounded py-1 outline-none"
                                              />
                                            ) : (
                                              <b className="text-[13px] text-gray-700">{sub.quantity}</b>
                                            )}
                                          </div>
                                        </div>

                                        {canEditSpec && (
                                          <button
                                            onClick={() => handleRemoveBundleSubItem(index, si)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        )}
                                      </div>

                                      {/* Sub-item Details (Size) */}
                                      <div className="pl-10">
                                        <div className="flex items-center gap-2">
                                          <Ruler size={12} className="text-gray-400 shrink-0" />
                                          {canEditSpec ? (
                                            <div className="flex items-center gap-1 flex-1">
                                              {['length', 'width', 'height'].map((dim, di) => (
                                                <React.Fragment key={dim}>
                                                  <input
                                                    type="number"
                                                    value={size[dim] || ""}
                                                    onChange={(e) => handleUpdateBundleSubItem(index, si, `size.${dim}`, Number(e.target.value))}
                                                    placeholder={dim === 'length' ? 'D' : dim === 'width' ? 'R' : 'C'}
                                                    className="w-full text-[11px] text-center bg-gray-50/50 border border-transparent focus:border-amber-200 rounded py-0.5 outline-none"
                                                  />
                                                  {di < 2 && <span className="text-gray-300">×</span>}
                                                </React.Fragment>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-[11px] text-gray-600 font-medium">
                                              {sizeStr || "—"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {(spec.item_bundle_items || []).length === 0 && (
                                  <div className={`py-3 text-center text-[12px] italic ${isInactive ? 'text-gray-400' : 'text-amber-500'}`}>Chưa có thông tin các món trong bộ</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* === ĐƠN LẺ: kích thước === */
                            <div className={`space-y-3 p-4 rounded-xl border ${canEditSpec ? 'bg-[#EAF6EE]/50 border-[#34B057]/10' : 'bg-gray-50/50 border-gray-100'}`}>
                              <p className={`text-[10px] font-bold uppercase flex items-center gap-2 ${canEditSpec ? 'text-[#34B057]' : 'text-gray-400'}`}><Ruler size={14} /> Kích thước (D x R x C)</p>
                              <div className="flex items-center gap-2">
                                {['length', 'width', 'height'].map((f, i) => (
                                  <div key={f} className="flex-1 flex items-center gap-1">
                                    <input type="number" readOnly={!canEditSpec} value={spec[f]} onChange={(e) => handleUpdateItemSpec(index, f, e.target.value)} className={`w-full border rounded-lg text-center text-[13px] font-bold py-2 transition-all ${canEditSpec ? 'bg-white border-[#34B057]/20 text-gray-700 cursor-text' : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`} />
                                    {i < 2 && <span className="text-gray-300">×</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* === THÔNG TIN CHI TIẾT SẢN PHẨM === */}
                          <div className="grid grid-cols-1 gap-4 col-span-2">
                            <div className={`space-y-4 p-4 rounded-xl border transition-all ${canEditSpec ? 'bg-[#EAF6EE]/30 border-[#34B057]/20' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <label className={`text-[10px] font-bold uppercase block ${canEditSpec ? 'text-[#34B057]' : 'text-gray-400'}`}>Bảo hành (tháng)</label>
                                  <input
                                    type="number"
                                    readOnly={!canEditSpec}
                                    value={spec.item_warranty}
                                    onChange={(e) => handleUpdateItemSpec(index, "item_warranty", Number(e.target.value))}
                                    className={`w-32 bg-transparent border-none focus:ring-0 text-[15px] font-bold p-0 ${canEditSpec ? 'text-gray-700 border-b border-gray-100 cursor-text' : 'text-gray-400 cursor-not-allowed'}`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* === PHÂN BỔ SẢN XUẤT === */}
                            <div className={`space-y-4 p-4 rounded-xl border transition-all ${canEditManagement ? 'bg-amber-50/40 border-amber-200' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                              <p className={`text-[10px] font-bold uppercase flex items-center gap-2 ${canEditManagement ? 'text-amber-600' : 'text-gray-400'}`}><Store size={14} /> Phân bổ sản xuất</p>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className={`text-[10px] font-bold uppercase ${canEditManagement ? 'text-amber-600' : 'text-gray-400'}`}>Xưởng / Nhà cung cấp</label>
                                  <select
                                    value={spec.fk_supplier_id}
                                    disabled={!canEditManagement}
                                    onChange={(e) => handleUpdateItemSpec(index, "fk_supplier_id", e.target.value)}
                                    className={`w-full text-[13px] font-bold rounded-lg border-none focus:ring-0 px-2 py-1 ${canEditManagement ? 'bg-white text-gray-700 shadow-sm cursor-pointer border border-amber-100' : 'bg-transparent text-gray-400 cursor-not-allowed'}`}
                                  >
                                    <option value="">-- Chưa gán xưởng --</option>
                                    {suppliers.map(s => <option key={s.pk_supplier_id} value={String(s.pk_supplier_id)}>{s.supplier_name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2 border-l border-gray-200 pl-6">
                                  <label className={`text-[10px] font-bold uppercase ${canEditManagement ? 'text-amber-600' : 'text-gray-400'}`}>Ngày xong xưởng</label>
                                  <input
                                    type="date"
                                    readOnly={!canEditManagement}
                                    value={spec.expectedWorkshopDate}
                                    onChange={(e) => {
                                      const newDate = e.target.value;
                                      handleUpdateItemSpec(index, "expectedWorkshopDate", newDate);
                                      if (newDate && deliveryDate) {
                                        const wsD = new Date(newDate);
                                        const delD = new Date(deliveryDate);
                                        wsD.setHours(0, 0, 0, 0);
                                        delD.setHours(0, 0, 0, 0);
                                        if (wsD >= delD) {
                                          toast.error(`Ngày xong xưởng phải trước ngày giao dự kiến (${deliveryDate})`);
                                        }
                                      }
                                    }}
                                    className={`w-full text-[13px] font-bold bg-transparent border-none focus:ring-0 p-0 ${canEditManagement ? 'text-gray-700 border-b border-amber-100 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all ${canEditSpec ? 'bg-[#EAF6EE]/20 border-[#34B057]/10' : 'bg-gray-50/20 border-gray-100 opacity-60'}`}>
                          <label className={`text-[10px] font-bold uppercase block mb-1 flex items-center gap-2 ${canEditSpec ? 'text-[#34B057]' : 'text-gray-400'}`}><FileText size={14} /> Yêu cầu kỹ thuật</label>
                          <textarea readOnly={!canEditSpec} value={spec.note} onChange={(e) => handleUpdateItemSpec(index, "note", e.target.value)} className={`w-full bg-transparent border-none text-[13px] p-0 resize-none italic ${canEditSpec ? 'text-gray-700 cursor-text' : 'text-gray-400 cursor-not-allowed'}`} rows={2} />
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