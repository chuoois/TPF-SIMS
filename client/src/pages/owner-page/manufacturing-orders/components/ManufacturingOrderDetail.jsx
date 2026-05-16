/**
 * ManufacturingOrderDetail
 * Popup xem chi tiết phiếu gia công + nút In phiếu A4
 * Hiển thị ĐẦY ĐỦ thông tin sản phẩm để xưởng biết gia công:
 * Tên, chất liệu, kích thước, màu sắc, hoàn thiện, ghi chú kỹ thuật, ảnh mẫu, nguồn đơn
 */

import { useState, useRef } from "react";
import {
  X,
  Printer,
  FileStack,
  Calendar,
  User,
  Package,
  Users,
  Clock,
  Layers,
} from "lucide-react";
import { formatDateTimeVN, formatDateVN } from "@/lib/dateUtils";
import { useEffect } from "react";
import manufacturingOrderService from "@/services/manufacturingOrder.service";
import LoadingState from "@/components/control/LoadingState";

// Formatting removed


const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n || 0);

// Helper: get display size
const getDisplaySize = (item) => {
  const size = item.item_size || item.size;
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


export default function ManufacturingOrderDetail({ order: initialOrder, onClose }) {
  const printRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    if (!initialOrder?.pk_manufacturing_order_id && !initialOrder?.id) return;
    try {
      setLoading(true);
      const res = await manufacturingOrderService.getOrderById(initialOrder.pk_manufacturing_order_id || initialOrder.id);
      if (res.data) {
        setOrder(res.data);
      }
    } catch (error) {
      console.error("Fetch order detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [initialOrder]);

  if (!initialOrder) return null;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8"/>
        <title>Yêu cầu Nhập hàng ${order.order_code || order.id}</title>

        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Times New Roman', serif; font-size: 13px; color: #111; background: #fff; padding: 20px 28px; }
          .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #111; padding-bottom: 14px; }
          .print-header .company { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 4px; }
          .print-header h1 { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
          .print-header .meta { font-size: 12px; color: #444; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; margin-bottom: 16px; font-size: 12px; }
          .info-grid .label { color: #555; }
          .info-grid .value { font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f0f0f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 8px; border: 1px solid #ccc; text-align: left; }
          td { padding: 6px 8px; border: 1px solid #ccc; font-size: 12px; vertical-align: top; }
          tr:nth-child(even) td { background: #fafafa; }
          .section-title { font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.8px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .note-box { border: 1px solid #ddd; padding: 8px 12px; border-radius: 4px; font-size: 12px; min-height: 30px; margin-bottom: 16px; color: #444; }
          .product-card { border: 1px solid #ccc; margin-bottom: 12px; page-break-inside: avoid; }
          .product-card-header { background: #f5f5f5; padding: 6px 10px; border-bottom: 1px solid #ccc; font-weight: bold; font-size: 13px; display: flex; justify-content: space-between; }
          .product-card-body { padding: 10px; }
          .detail-row { display: flex; gap: 8px; margin-bottom: 4px; font-size: 12px; }
          .detail-label { color: #777; min-width: 90px; font-weight: 600; }
          .detail-value { color: #111; }
          .detail-note { background: #fffde7; border: 1px solid #f0e68c; padding: 6px 10px; margin-top: 6px; font-size: 11.5px; color: #666; border-radius: 3px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 28px; text-align: center; }
          .sig-box { border-top: 1px solid #aaa; padding-top: 8px; font-size: 11px; color: #555; }
          .sig-title { font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.8px; margin-bottom: 40px; }
          .footer-note { text-align: center; font-size: 10px; color: #aaa; margin-top: 28px; border-top: 1px solid #eee; padding-top: 8px; }
          .print-img { width: 60px; height: 60px; object-fit: cover; border: 1px solid #ddd; margin-right: 6px; margin-top: 4px; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  const totalQty = order.items?.reduce((s, i) => s + (i.quantity || i.qty || 0), 0) || 0;


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex flex-col rounded-lg overflow-hidden"
        style={{
          width: "min(920px, 95vw)",
          maxHeight: "92vh",
          background: "#fff",
          border: "1px solid var(--grid-border)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            borderBottom: "1px solid var(--grid-border)",
            background: "var(--grid-header-bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--status-focus)" }}
            >
              <FileStack size={18} style={{ color: "var(--brand-primary)" }} />
            </div>
            <div>
              <h2
                className="text-[16px] font-bold"
                style={{ color: "var(--text-main)" }}
              >
                Chi tiết yêu cầu nhập hàng
              </h2>
              <p
                className="text-[12px] font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                {order.order_code || order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
              style={{ background: "var(--brand-primary)", color: "#fff" }}
            >
              <Printer size={15} /> In phiếu
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-20">
              <LoadingState message="Đang tải chi tiết phiếu..." />
            </div>
          ) : (
            <>
          {/* Compact Summary Bar */}
          <div className="flex items-center gap-4 mb-6 px-4 py-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-1.5 text-[12px]">
              <Calendar
                size={14}
                style={{ color: "var(--text-placeholder)" }}
              />
              <span style={{ color: "var(--text-placeholder)" }}>
                Ngày tạo:
              </span>
              <span className="font-bold" style={{ color: "var(--text-main)" }}>
                {formatDateTimeVN(order.createdate || order.createdAt) || "—"}
              </span>

            </div>

            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-[12px]">
              <User size={14} style={{ color: "var(--text-placeholder)" }} />
              <span style={{ color: "var(--text-placeholder)" }}>
                Người tạo:
              </span>
              <span className="font-bold" style={{ color: "var(--text-main)" }}>
                {order.createdBy || "Chủ xưởng"}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-[12px]">
              <Users size={14} style={{ color: "var(--text-placeholder)" }} />
              <span style={{ color: "var(--text-placeholder)" }}>
                Nhà cung cấp:
              </span>
              <span className="font-bold" style={{ color: "var(--text-main)" }}>
                {order.supplier?.supplier_name || order.supplierName || "—"}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-[12px]">
              <Package size={14} style={{ color: "var(--text-placeholder)" }} />
              <span style={{ color: "var(--text-placeholder)" }}>
                Tổng cộng:
              </span>
              <span className="font-bold text-[var(--brand-primary)]">
                {totalQty} chiếc
              </span>
            </div>
            {/* Removed expectedDate summary */}
          </div>

          {/* Ghi chú tổng */}
          {order.note && (
            <div
              className="mb-6 p-4 rounded-xl text-[13px] leading-relaxed"
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                color: "#92400E",
              }}
            >
              <span className="font-bold inline-flex items-center gap-1.5 mb-1">
                <Calendar size={14} /> Ghi chú từ chủ xưởng:
              </span>
              <p>{order.note}</p>
            </div>
          )}

          {/* ════════ Danh sách sản phẩm — ĐẦY ĐỦ thông tin ════════ */}
          <p
            className="text-[11px] font-bold uppercase tracking-wide mb-3"
            style={{ color: "var(--text-placeholder)" }}
          >
            Danh sách sản phẩm cần nhập ({order.items?.length || 0})
          </p>
          <div className="flex flex-col gap-3">
            {order.items?.map((item, idx) => {
              const allImages = [
                ...(item.product?.product_img ? [item.product.product_img] : []),
                ...(item.image ? [item.image] : []),
                ...(item.customerSampleImage ? [item.customerSampleImage] : []),
                ...(item.images || []),
              ];

              const sizeDisplay = getDisplaySize(item);
              const colorFinish = [item.item_color || item.color, item.item_finish || item.finish]
                .filter(Boolean)
                .join(" / ");

              const srcDetail = item.sourceOrders?.[0]
                ? item.sourceOrderDetails?.[item.sourceOrders[0]] ||
                  order.sourceOrderDetails?.[item.sourceOrders[0]]
                : null;

              return (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--grid-border)" }}
                >
                  {/* Header: STT + Tên SP + SL */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      background: "var(--grid-header-bg)",
                      borderBottom: "1px solid var(--grid-border)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-black w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{
                          background: "var(--brand-primary)",
                          color: "#fff",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="text-[13px] font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
                        {item.item_name || item.productName || item.product?.product_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span
                          className="text-[16px] font-black"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          ×{item.quantity || item.qty}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {item.unit || item.product?.unit || "Cái"}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Body: All details */}
                  <div className="flex gap-4 p-4 bg-white">
                    {/* Ảnh mẫu */}
                    {allImages.length > 0 && (
                      <div className="shrink-0 flex flex-col gap-1.5">
                        {allImages.slice(0, 3).map((img, i) => (
                          <div
                            key={i}
                            className="w-16 h-16 rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-[var(--brand-primary)] transition"
                            style={{ borderColor: "var(--grid-border)" }}
                            onClick={() => setPreviewImage(img)}
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {allImages.length > 3 && (
                          <div
                            className="w-16 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background: "#F3F4F6",
                              color: "var(--text-placeholder)",
                            }}
                          >
                            +{allImages.length - 3} ảnh
                          </div>
                        )}
                      </div>
                    )}

                    {/* Thông tin chi tiết dạng label: value */}
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {/* Chất liệu */}
                        <div className="flex items-start gap-2">
                          <span
                            className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Chất liệu
                          </span>
                          <span
                            className="text-[13px] font-semibold"
                            style={{
                              color: item.material
                                ? "var(--text-main)"
                                : "var(--text-placeholder)",
                            }}
                          >
                            {item.item_material || item.material || "—"}
                          </span>
                        </div>


                        {/* Kích thước */}
                        <div className="flex items-start gap-2">
                          <span
                            className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Kích thước
                          </span>
                          <span
                            className="text-[13px] font-semibold"
                            style={{
                              color: sizeDisplay
                                ? "var(--text-main)"
                                : "var(--text-placeholder)",
                            }}
                          >
                            {sizeDisplay || "—"}
                          </span>
                        </div>

                        {/* Màu sắc */}
                        <div className="flex items-start gap-2">
                          <span
                            className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Màu sắc
                          </span>
                          <span
                            className="text-[13px] font-semibold"
                            style={{
                              color: item.color
                                ? "var(--text-main)"
                                : "var(--text-placeholder)",
                            }}
                          >
                            {item.item_color || item.color || "—"}
                          </span>
                        </div>




                        {/* Tài chính từng SP */}
                        <div className="flex items-start gap-2">
                          <span
                            className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Giá nhập
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-indigo-700">
                              {fmt(item.import_price || item.importPrice)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Thành tiền: {fmt((item.import_price || item.importPrice) * (item.quantity || item.qty))}
                            </span>
                          </div>
                        </div>


                        {/* Hẹn giao */}
                        <div className="flex items-start gap-2">
                          <span
                            className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Ngày giao
                          </span>
                          <span
                            className="text-[13px] font-bold text-rose-600"
                          >
                            {formatDateVN(item.expected_date || item.expectedDate || order.expected_delivery_date || order.expectedDate) || "—"}
                          </span>
                        </div>



                      </div>

                      {/* Ghi chú kỹ thuật */}
                      {item.note && (
                        <div
                          className="mt-3 px-3 py-2 rounded-lg text-[13px] leading-relaxed"
                          style={{
                            background: "#FFFBEB",
                            border: "1px solid #FDE68A",
                            color: "#92400E",
                          }}
                        >
                          <span className="font-bold">Ghi chú KT: </span>
                          {item.note}
                        </div>
                      )}

                      {/* Chi tiết bộ sản phẩm (nếu có) */}
                      {(item.item_is_bundle === 1 || item.customRequestItem?.item_is_bundle === 1 || item.product?.is_bundle === 1) && (
                        <div className="mt-4 p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30">
                          <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Layers size={14} /> Thành phần trong bộ sản phẩm
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {(item.item_bundle_items || item.customRequestItem?.item_bundle_items || item.product?.bundle_items || []).map((bi, bidx) => (
                              <div key={bidx} className="flex items-center justify-between py-1.5 border-b border-indigo-100/50 last:border-0">
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-bold text-slate-700">{bi.name}</span>
                                  <span className="text-[11px] text-slate-400">Kích thước: {getDisplaySize({ item_size: bi.size }) || "Theo chuẩn"}</span>
                                </div>
                                <div className="text-[13px] font-black text-indigo-600">×{bi.quantity}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total Section */}
            <div
              className="flex items-center justify-end gap-8 px-6 py-4 rounded-xl"
              style={{
                background: "var(--status-focus)",
                border: "2px solid var(--grid-border)",
              }}
            >
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Tổng số lượng</span>
                <p className="text-[18px] font-black text-[var(--brand-primary)]">
                  {totalQty} <span className="text-[12px] font-medium text-gray-400">chiếc</span>
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Tổng tiền nhập</span>
                <p className="text-[18px] font-black text-indigo-700">{fmt(order.total_amount || order.totalImportAmount || order.totalAmount)}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Tiền cọc nhập hàng</span>
                <p className="text-[18px] font-black text-emerald-700">{fmt(order.deposit_amount || order.deposit)}</p>
              </div>
            </div>

          </div>
            </>
          )}
        </div>

        {/* ══════════ Hidden print template — ĐẦY ĐỦ ══════════ */}
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            <div className="print-header">
              <div className="company">TPF - Xưởng Gỗ Mỹ Nghệ</div>
              <h1>Phiếu Yêu cầu Nhập hàng</h1>
              <div className="meta">
                Mã phiếu: <strong>{order.order_code || order.id}</strong> &nbsp;|&nbsp; Ngày in:{" "}
                {formatDateVN(new Date())}
              </div>

            </div>

            <div className="info-grid">
              <div>
                <span className="label">Ngày tạo: </span>
                <span className="value">{formatDateTimeVN(order.createdate || order.createdAt)}</span>
              </div>

              <div>
                <span className="label">Người tạo: </span>
                <span className="value">{order.creator?.full_name || order.createdBy || "Chủ xưởng"}</span>
              </div>
              <div>
                <span className="label">Nhà cung cấp: </span>
                <span className="value">{order.supplier?.supplier_name || order.supplierName || "—"}</span>
              </div>
              <div>
                <span className="label">Tổng số lượng: </span>
                <span className="value">{totalQty} sản phẩm</span>
              </div>
              <div>
                <span className="label">Tổng tiền hàng: </span>
                <span className="value">{fmt(order.total_amount || order.totalImportAmount || order.totalAmount)}</span>
              </div>
              <div>
                <span className="label">Tiền cọc nhập: </span>
                <span className="value">{fmt(order.deposit_amount || order.deposit)}</span>
              </div>
            </div>


            {order.note && (
              <>
                <div className="section-title">Ghi chú chung</div>
                <div className="note-box">{order.note}</div>
              </>
            )}

            {/* Sản phẩm — mỗi SP 1 card riêng, hiện ĐẦY ĐỦ */}
            <div className="section-title">
              Chi tiết sản phẩm yêu cầu nhập kho
            </div>
            {order.items?.map((item, idx) => {
              const sizeDisplay = getDisplaySize(item);
              const allImages = [
                ...(item.image ? [item.image] : []),
                ...(item.customerSampleImage ? [item.customerSampleImage] : []),
                ...(item.images || []),
              ];

              return (
                <div key={idx} className="product-card">
                  <div className="product-card-header">
                    <span>
                      {idx + 1}. {item.productName}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        SL: {item.quantity || item.qty} {item.unit || item.product?.unit || "Cái"}
                      </span>
                    </div>

                  </div>
                  <div className="product-card-body">
                    <div className="detail-row">
                      <span className="detail-label">Chất liệu:</span>
                      <span className="detail-value">
                        {item.item_material || item.material || "—"}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Kích thước:</span>
                      <span className="detail-value">{sizeDisplay || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Màu sắc:</span>
                      <span className="detail-value">{item.item_color || item.color || "—"}</span>
                    </div>


                    <div className="detail-row" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #eee' }}>
                      <span className="detail-label">Giá nhập:</span>
                      <span className="detail-value">
                        {fmt(item.import_price || item.importPrice)} &nbsp; 
                        <span style={{ fontSize: '11px', color: '#666', fontWeight: 'normal' }}>
                          (Thành tiền: {fmt((item.import_price || item.importPrice) * (item.quantity || item.qty))})
                        </span>
                      </span>
                    </div>
                    {(item.expected_date || item.expectedDate || order.expected_delivery_date || order.expectedDate) && (
                      <div className="detail-row" style={{ marginTop: '4px' }}>
                        <span className="detail-label">Ngày giao:</span>
                        <span className="detail-value" style={{ color: '#dc2626', fontWeight: 'bold' }}>
                          {formatDateVN(item.expected_date || item.expectedDate || order.expected_delivery_date || order.expectedDate) || "—"}
                        </span>
                      </div>
                    )}
                    {item.note && (
                      <div className="detail-note">
                        <strong>Ghi chú KT:</strong> {item.note}
                      </div>
                    )}
                    {(item.item_is_bundle === 1 || item.customRequestItem?.item_is_bundle === 1 || item.product?.is_bundle === 1) && (
                      <div style={{ marginTop: '8px', border: '1px solid #ddd', borderRadius: '4px', background: '#f9f9f9', padding: '6px 10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', marginBottom: '4px' }}>
                          Thành phần trong bộ sản phẩm
                        </div>
                        <table style={{ margin: 0, border: 'none', width: '100%' }}>
                          <tbody>
                            {(item.item_bundle_items || item.customRequestItem?.item_bundle_items || item.product?.bundle_items || []).map((bi, bidx) => (
                              <tr key={bidx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '4px 0', border: 'none', background: 'transparent' }}>
                                  <span style={{ fontWeight: 'bold' }}>{bi.name}</span>
                                  <span style={{ fontSize: '10px', color: '#666', marginLeft: '6px' }}>
                                    (KT: {getDisplaySize({ item_size: bi.size }) || "Theo chuẩn"})
                                  </span>
                                </td>
                                <td style={{ padding: '4px 0', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 'bold', width: '40px' }}>
                                  ×{bi.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Tổng tài chính Print */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                background: "#f5f5f5",
                border: "1px solid #ccc",
                marginTop: "12px",
                padding: "10px",
                textAlign: "center"
              }}
            >
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Tổng số lượng</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{totalQty} sản phẩm</div>
              </div>
              <div style={{ borderLeft: '1px solid #ccc' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Tổng tiền hàng</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{fmt(order.total_amount || order.totalImportAmount || order.totalAmount)}</div>
              </div>
              <div style={{ borderLeft: '1px solid #ccc' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Tiền cọc nhập hàng</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{fmt(order.deposit_amount || order.deposit)}</div>
              </div>

            </div>

            <div className="signatures">
              <div className="sig-box">
                <div className="sig-title">Người lập phiếu</div>(Ký, ghi rõ họ
                tên)
              </div>
              <div className="sig-box">
                <div className="sig-title">Quản đốc xưởng</div>(Ký, ghi rõ họ
                tên)
              </div>
              <div className="sig-box">
                <div className="sig-title">Kế toán xác nhận</div>(Ký, ghi rõ họ
                tên)
              </div>
            </div>

            <div className="footer-note">
              Phiếu được tạo tự động bởi hệ thống TPF-SIMS &bull;{" "}
              {formatDateTimeVN(new Date())}
            </div>

          </div>
        </div>
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-8"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
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
