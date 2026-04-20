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
} from "lucide-react";



const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

// Helper: get display size
const getDisplaySize = (item) => {
  if (item.size) return item.size;
  const parts = [
    item.length ? `Dài ${item.length}cm` : "",
    item.width ? `Rộng ${item.width}cm` : "",
    item.height ? `Cao ${item.height}cm` : "",
  ].filter(Boolean).join(" × ");
  return parts || "";
};

export default function ManufacturingOrderDetail({ order, onClose }) {
  const printRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  if (!order) return null;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8"/>
        <title>Yêu cầu Nhập hàng ${order.id}</title>
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
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const totalQty = order.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
          style={{ borderBottom: "1px solid var(--grid-border)", background: "var(--grid-header-bg)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--status-focus)" }}>
              <FileStack size={18} style={{ color: "var(--brand-primary)" }} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--text-main)" }}>
                Chi tiết yêu cầu nhập hàng
              </h2>
              <p className="text-[12px] font-mono" style={{ color: "var(--text-secondary)" }}>{order.id}</p>
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

          {/* Info cards */}
          <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            {[
              { icon: Calendar, label: "Ngày tạo", value: formatDateTime(order.createdAt) },
              { icon: User,     label: "Người tạo", value: order.createdBy || "Chủ xưởng" },
              { icon: Package,  label: "Số sản phẩm", value: `${order.items?.length || 0} dòng / ${totalQty} chiếc` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1 p-3 rounded-xl" style={{ border: "1px solid var(--grid-border)", background: "var(--grid-header-bg)" }}>
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-placeholder)" }}>
                  <Icon size={12} /> {label}
                </div>
                <div className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Đơn hàng liên quan */}
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-placeholder)" }}>
              Đơn hàng liên quan ({order.orderIds?.length || 0})
            </p>
            <div className="flex flex-col gap-2">
              {order.orderIds?.map((oid) => {
                const detail = order.sourceOrderDetails?.[oid];
                return (
                  <div key={oid} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}>
                    <span className="px-2 py-0.5 rounded-md text-[12px] font-mono font-bold" style={{ background: "var(--bg-main)", border: "1px solid var(--grid-border)", color: "var(--text-main)" }}>
                      {oid}
                    </span>
                    {detail?.customerName && (
                      <div className="flex items-center gap-1.5">
                        <Users size={13} style={{ color: "var(--text-placeholder)" }} />
                        <span className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{detail.customerName}</span>
                      </div>
                    )}
                    {detail?.type && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-medium" style={{
                        background: detail.type === "Hàng khách đặt" ? "#FEF3C7" : "#EFF6FF",
                        color: detail.type === "Hàng khách đặt" ? "#B45309" : "#1D4ED8",
                        border: `1px solid ${detail.type === "Hàng khách đặt" ? "#FDE68A" : "#BFDBFE"}`,
                      }}>
                        {detail.type}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ghi chú tổng */}
          {order.note && (
            <div className="mb-5 p-3 rounded-xl text-[13px]" style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>
              <span className="font-bold">Ghi chú: </span>{order.note}
            </div>
          )}

          {/* ════════ Danh sách sản phẩm — ĐẦY ĐỦ thông tin ════════ */}
          <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-placeholder)" }}>
            Danh sách sản phẩm cần nhập ({order.items?.length || 0})
          </p>
          <div className="flex flex-col gap-3">
            {order.items?.map((item, idx) => {
              const allImages = [
                ...(item.image ? [item.image] : []),
                ...(item.customerSampleImage ? [item.customerSampleImage] : []),
                ...(item.images || []),
              ];
              const sizeDisplay = getDisplaySize(item);
              const colorFinish = [item.color, item.finish].filter(Boolean).join(" / ");
              const srcDetail = item.sourceOrders?.[0] ? (item.sourceOrderDetails?.[item.sourceOrders[0]] || order.sourceOrderDetails?.[item.sourceOrders[0]]) : null;

              return (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--grid-border)" }}
                >
                  {/* Header: STT + Tên SP + SL */}
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-primary)", color: "#fff" }}>
                        {idx + 1}
                      </span>
                      <span className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>
                        {item.productName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[16px] font-black" style={{ color: "var(--brand-primary)" }}>×{item.qty}</span>
                      <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{item.unit || "Cái"}</span>
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
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {allImages.length > 3 && (
                          <div className="w-16 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: "#F3F4F6", color: "var(--text-placeholder)" }}>
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
                          <span className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]" style={{ color: "var(--text-placeholder)" }}>Chất liệu</span>
                          <span className="text-[13px] font-semibold" style={{ color: item.material ? "var(--text-main)" : "var(--text-placeholder)" }}>
                            {item.material || "—"}
                          </span>
                        </div>

                        {/* Kích thước */}
                        <div className="flex items-start gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]" style={{ color: "var(--text-placeholder)" }}>Kích thước</span>
                          <span className="text-[13px] font-semibold" style={{ color: sizeDisplay ? "var(--text-main)" : "var(--text-placeholder)" }}>
                            {sizeDisplay || "—"}
                          </span>
                        </div>

                        {/* Màu sắc */}
                        <div className="flex items-start gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]" style={{ color: "var(--text-placeholder)" }}>Màu sắc</span>
                          <span className="text-[13px] font-semibold" style={{ color: item.color ? "var(--text-main)" : "var(--text-placeholder)" }}>
                            {item.color || "—"}
                          </span>
                        </div>

                        {/* Hoàn thiện */}
                        <div className="flex items-start gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]" style={{ color: "var(--text-placeholder)" }}>Hoàn thiện</span>
                          <span className="text-[13px] font-semibold" style={{ color: item.finish ? "var(--text-main)" : "var(--text-placeholder)" }}>
                            {item.finish || "—"}
                          </span>
                        </div>

                        {/* Nguồn đơn */}
                        <div className="flex items-start gap-2 col-span-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide shrink-0 w-[80px]" style={{ color: "var(--text-placeholder)" }}>Nguồn đơn</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.sourceOrders?.map(src => {
                              const detail = item.sourceOrderDetails?.[src] || order.sourceOrderDetails?.[src];
                              return (
                                <div key={src} className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ 
                                    background: src === "DANH-MUC" ? "var(--status-focus)" : "#F3F4F6", 
                                    color: src === "DANH-MUC" ? "var(--brand-primary)" : "var(--text-main)", 
                                    border: "1px solid var(--grid-border)" 
                                  }}>
                                    {src === "DANH-MUC" ? "Hàng có sẵn" : src}
                                  </span>
                                  {detail?.customerName && (
                                    <span className="text-[12px] font-semibold" style={{ color: "var(--text-main)" }}>
                                      {detail.customerName}
                                    </span>
                                  )}
                                  {detail?.type && (
                                    <span className="text-[10px] px-1 py-0.5 rounded font-medium" style={{
                                      background: detail.type === "Hàng khách đặt" ? "#FEF3C7" : "#EFF6FF",
                                      color: detail.type === "Hàng khách đặt" ? "#B45309" : "#1D4ED8",
                                    }}>
                                      {detail.type}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Ghi chú kỹ thuật */}
                      {item.note && (
                        <div className="mt-3 px-3 py-2 rounded-lg text-[12px] leading-relaxed" style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>
                          <span className="font-bold">Ghi chú KT: </span>{item.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="flex items-center justify-end gap-4 px-4 py-3 rounded-xl" style={{ background: "var(--status-focus)", border: "2px solid var(--grid-border)" }}>
              <span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>Tổng cộng:</span>
              <span className="text-[18px] font-black" style={{ color: "var(--brand-primary)" }}>{totalQty}</span>
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>chiếc</span>
            </div>
          </div>
        </div>

        {/* ══════════ Hidden print template — ĐẦY ĐỦ ══════════ */}
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            <div className="print-header">
              <div className="company">TPF - Xưởng Gỗ Mỹ Nghệ</div>
              <h1>Phiếu Yêu cầu Nhập hàng</h1>
              <div className="meta">Mã phiếu: <strong>{order.id}</strong> &nbsp;|&nbsp; Ngày in: {formatDate(new Date().toISOString())}</div>
            </div>

            <div className="info-grid">
              <div><span className="label">Ngày tạo: </span><span className="value">{formatDateTime(order.createdAt)}</span></div>
              <div><span className="label">Người tạo: </span><span className="value">{order.createdBy || "Chủ xưởng"}</span></div>
              <div><span className="label">Tổng số lượng: </span><span className="value">{totalQty} sản phẩm</span></div>
            </div>

            {/* Đơn hàng liên quan — bảng */}
            <div className="section-title">Đơn hàng liên quan</div>
            <table style={{ marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ width: 130 }}>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th style={{ width: 130 }}>Loại đơn</th>
                </tr>
              </thead>
              <tbody>
                {order.orderIds?.map((oid) => {
                  const detail = order.sourceOrderDetails?.[oid];
                  return (
                    <tr key={oid}>
                      <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>{oid}</td>
                      <td>{detail?.customerName || "—"}</td>
                      <td>{detail?.type || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {order.note && (
              <>
                <div className="section-title">Ghi chú chung</div>
                <div className="note-box">{order.note}</div>
              </>
            )}

            {/* Sản phẩm — mỗi SP 1 card riêng, hiện ĐẦY ĐỦ */}
            <div className="section-title">Chi tiết sản phẩm yêu cầu nhập kho</div>
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
                    <span>{idx + 1}. {item.productName}</span>
                    <span>SL: {item.qty} {item.unit || "Cái"}</span>
                  </div>
                  <div className="product-card-body">
                    <div className="detail-row">
                      <span className="detail-label">Chất liệu:</span>
                      <span className="detail-value">{item.material || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Kích thước:</span>
                      <span className="detail-value">{sizeDisplay || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Màu sắc:</span>
                      <span className="detail-value">{item.color || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Hoàn thiện:</span>
                      <span className="detail-value">{item.finish || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Đơn hàng:</span>
                      <span className="detail-value">
                        {item.sourceOrders?.map((o, i) => {
                          const detail = item.sourceOrderDetails?.[o] || order.sourceOrderDetails?.[o];
                          const label = o === "DANH-MUC" ? "Hàng có sẵn" : o;
                          return `${label}${detail?.customerName ? ` (${detail.customerName})` : ""}`;
                        }).join(", ")}
                      </span>
                    </div>
                    {item.note && (
                      <div className="detail-note">
                        <strong>Ghi chú KT:</strong> {item.note}
                      </div>
                    )}
                    {allImages.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <span className="detail-label">Ảnh mẫu:</span>
                        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                          {allImages.slice(0, 4).map((img, i) => (
                            <img key={i} src={img} alt="" className="print-img" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Tổng */}
            <div style={{ textAlign: "right", fontSize: 14, fontWeight: "bold", margin: "12px 0", padding: "8px 12px", background: "#f5f5f5", border: "1px solid #ccc" }}>
              Tổng cộng: {totalQty} sản phẩm
            </div>

            <div className="signatures">
              <div className="sig-box"><div className="sig-title">Người lập phiếu</div>(Ký, ghi rõ họ tên)</div>
              <div className="sig-box"><div className="sig-title">Quản đốc xưởng</div>(Ký, ghi rõ họ tên)</div>
              <div className="sig-box"><div className="sig-title">Kế toán xác nhận</div>(Ký, ghi rõ họ tên)</div>
            </div>

            <div className="footer-note">Phiếu được tạo tự động bởi hệ thống TPF-SIMS &bull; {formatDateTime(new Date().toISOString())}</div>
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
