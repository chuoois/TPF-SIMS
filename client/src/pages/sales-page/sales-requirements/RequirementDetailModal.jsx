/**
 * RequirementDetailModal — Chi tiết yêu cầu kỹ thuật
 * Includes: ImageViewer overlay + Detail modal
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
} from "lucide-react";
import { STATUS_CONFIG } from "./mockData";

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
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
      />
    </div>
  );
};

// ===================== DETAIL MODAL =====================
export default function RequirementDetailModal({ req, onClose, onEnlarge, onOpenCancel }) {
  const [surveyNotes, setSurveyNotes] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [itemSpecs, setItemSpecs] = useState([]);

  useEffect(() => {
    if (req) {
      setSurveyNotes(req.surveyNotes || "");
      setProposedSolution(req.proposedSolution || "");
      setEstimatedPrice(req.estimatedPrice || 0);

      setItemSpecs(
        req.items.map((item) => ({
          id: item.id,
          material: item.material || "",
          quantity: item.qty || item.quantity || 1,
          dimensions: item.specs?.dimensions || "",
          hardware: item.specs?.hardware || "",
          note: item.specs?.note || "",
          price: item.quotedPrice || 0,
          designImages: item.designImages || [],
        })),
      );
    }
  }, [req]);

  if (!req) return null;

  const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG["Đang xử lý"];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-bold text-gray-900">
                  Chi tiết yêu cầu kỹ thuật
                </h2>
                <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[12px] font-medium font-mono shadow-sm">
                  {req.code}
                </span>
                <span
                  className="px-2.5 py-1 rounded-md text-[12px] font-medium border"
                  style={{
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.text,
                    borderColor: statusConfig.border,
                  }}
                >
                  {req.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          {/* Section 1: Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> Khách hàng
                </h3>
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-2">
                  <p className="text-[14px] font-bold text-gray-900">
                    {req.customer}
                  </p>
                  <p className="text-[13px] text-gray-600 flex items-center gap-2">
                    <Phone size={13} className="text-gray-400 shrink-0" />{" "}
                    {req.phone}
                  </p>
                  <p className="text-[13px] text-gray-600 flex items-start gap-2">
                    <MapPin
                      size={13}
                      className="text-gray-400 mt-0.5 shrink-0"
                    />{" "}
                    <span className="flex-1 leading-snug">
                      {req.address || "Chưa cung cấp địa chỉ"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {(surveyNotes || req.notes) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" /> Ghi chú
                  </h3>
                  <div className="w-full h-[104px] p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-[13px] overflow-y-auto">
                    {surveyNotes || req.notes || "Không có ghi chú"}
                  </div>
                </div>
              </div>
            )}
          </div>

         

          {/* Section 3: Chi tiết Sản phẩm & Thông số kỹ thuật */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Package size={18} className="text-indigo-600" /> Danh sách Sản
              phẩm Yêu cầu
            </h3>

            <div className="space-y-6">
              {itemSpecs.map((spec, index) => {
                const originalItem = req.items[index] || {};
                return (
                  <div
                    key={spec.id}
                    className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[12px] font-bold">
                          {index + 1}
                        </span>
                        <h4 className="text-[15px] font-bold text-gray-900">
                          {originalItem.name || "Sản phẩm"}
                        </h4>
                      </div>
                    </div>

                    {/* Item Specs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Chất liệu
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.material || "---"}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Số lượng
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.quantity || "1"}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Kích thước
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.dimensions || "---"}
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Yêu cầu sản xuất (Note)
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.note || "---"}
                        </div>
                      </div>
                    </div>

                    {/* Item Images Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                      {/* Customer Images */}
                      <div>
                        <p className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                          <Camera size={14} className="text-gray-500" /> Ảnh mẫu
                          khách gửi
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {originalItem.customerImages?.length > 0 ? (
                            originalItem.customerImages.map((img, i) => (
                              <div
                                key={i}
                                onClick={() => onEnlarge(img)}
                                className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                              >
                                <img
                                  src={img}
                                  alt="Mẫu"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))
                          ) : (
                            <span className="text-[12px] text-gray-400 italic">
                              Không có ảnh
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Owner Designs */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[12px] font-bold text-indigo-700 flex items-center gap-1.5">
                            <Layers size={14} className="text-indigo-500" /> Bản
                            vẽ kỹ thuật / 3D
                          </p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 min-h-[64px]">
                          {spec.designImages?.length > 0 ? (
                            spec.designImages.map((img, i) => (
                              <div
                                key={i}
                                className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-indigo-200 relative group"
                              >
                                <img
                                  src={img}
                                  onClick={() => onEnlarge(img)}
                                  alt="Bản vẽ"
                                  className="w-full h-full object-cover cursor-pointer"
                                />
                              </div>
                            ))
                          ) : (
                            <span className="text-[12px] text-gray-400 italic self-center">
                              Chưa có bản vẽ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-500 uppercase">
                Tổng giá trị đơn hàng
              </span>
              <span className="text-[18px] font-bold text-indigo-700">
                {Number(estimatedPrice || 0).toLocaleString("vi-VN")}{" "}
                <span className="text-[14px]">VND</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {req.status === "Đang xử lý" && (
                <button
                  onClick={() => onOpenCancel(req)}
                  className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-[13px] font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <AlertCircle size={16} />
                  Gửi yêu cầu hủy
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
