import React, { useState, useEffect } from "react";
import { Save, Info, ShieldCheck, Clock, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function WarrantySettings() {
  const [settings, setSettings] = useState({
    defaultTerms: `1. Sản phẩm được bảo hành miễn phí nếu có lỗi kỹ thuật từ nhà sản xuất (nứt nẻ xé gỗ do lỗi sấy ghép, bong tróc sơn do kỹ thuật, lỗi kết cấu mộng).
2. Không bảo hành các trường hợp hư hỏng do người dùng gây ra (va đập, ngập nước, để vật quá nóng/lạnh trực tiếp lên bề mặt, sử dụng sai mục đích).
3. Sau thời gian bảo hành, TPF hỗ trợ bảo trì trọn đời với chi phí ưu đãi.
4. Quý khách vui lòng xuất trình Phiếu Bảo Hành (hoặc số điện thoại mua hàng) khi có yêu cầu xử lý.`,
    materialRules: [
      { id: 1, material: "Hương Đá", months: 36 },
      { id: 2, material: "Gỗ Gụ", months: 36 },
      { id: 3, material: "Gỗ Mun", months: 36 },
      { id: 4, material: "Gỗ Gõ Đỏ", months: 36 },
      { id: 5, material: "Gỗ Sồi", months: 12 },
      { id: 6, material: "Xoan Đào", months: 12 },
      { id: 7, material: "MDF / Công nghiệp", months: 6 },
    ],
    finishWarrantyMonths: 6,
  });

  useEffect(() => {
    const saved = localStorage.getItem("tpf_warranty_settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem("tpf_warranty_settings", JSON.stringify(settings));
    toast.success("Đã lưu cấu hình bảo hành thành công!");
    window.dispatchEvent(new Event("storage"));
  };

  const updateMaterialMonth = (id, newMonths) => {
    const updated = settings.materialRules.map((r) =>
      r.id === id ? { ...r, months: parseInt(newMonths) || 0 } : r
    );
    setSettings({ ...settings, materialRules: updated });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Terms Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "var(--grid-border)" }}>
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between"
              style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <h3 className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                <FileText size={16} style={{ color: "var(--brand-primary)" }} />
                Nội dung điều khoản bảo hành
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                style={{ color: "var(--text-placeholder)", borderColor: "var(--grid-border)", backgroundColor: "#fff" }}
              >
                MẪU IN CHUẨN
              </span>
            </div>
            <div className="p-5">
              <p className="text-[12px] font-medium italic mb-3" style={{ color: "var(--text-placeholder)" }}>
                Nội dung này sẽ được in trực tiếp lên Phiếu Bảo Hành bàn giao cho khách hàng.
              </p>
              <textarea
                value={settings.defaultTerms}
                onChange={(e) => setSettings({ ...settings, defaultTerms: e.target.value })}
                className="w-full h-[300px] p-4 text-[13px] border rounded-xl outline-none leading-relaxed font-medium transition-all resize-none"
                style={{
                  borderColor: "var(--grid-border)",
                  color: "var(--text-main)",
                  backgroundColor: "var(--bg-main)",
                }}
                placeholder="Nhập các điều khoản bảo hành tại đây..."
              />
            </div>
          </div>
        </div>

        {/* Right: Duration Rules */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "var(--grid-border)" }}>
            <div
              className="px-5 py-3.5 border-b flex items-center gap-2"
              style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <Clock size={16} className="text-amber-500" />
              <h3 className="text-[12px] font-black uppercase tracking-widest" style={{ color: "var(--text-main)" }}>
                Thời hạn bảo hành vật liệu
              </h3>
            </div>
            <div className="p-4 space-y-1">
              <div
                className="text-[10px] font-bold uppercase grid grid-cols-12 gap-2 px-2 mb-2"
                style={{ color: "var(--text-placeholder)" }}
              >
                <div className="col-span-8">Chất liệu gỗ</div>
                <div className="col-span-4 text-right">Tháng</div>
              </div>
              {settings.materialRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-main)]"
                >
                  <div className="col-span-8 text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
                    {rule.material}
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      value={rule.months}
                      onChange={(e) => updateMaterialMonth(rule.id, e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg text-[13px] text-right font-black outline-none transition-all"
                      style={{
                        borderColor: "var(--grid-border)",
                        color: "var(--brand-primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finish Warranty Card */}
          <div className="bg-white rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--grid-border)" }}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: "var(--brand-primary)" }} />
              <h4 className="text-[12px] font-black uppercase tracking-widest" style={{ color: "var(--text-main)" }}>
                Bảo hành bề mặt
              </h4>
            </div>
            <p className="text-[12px] italic font-medium" style={{ color: "var(--text-placeholder)" }}>
              Thời hạn bảo hành nước sơn PU, dát vàng hoặc vẹc-ni mặc định cho toàn bộ sản phẩm.
            </p>
            <div
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}
            >
              <span className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>Mặc định:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.finishWarrantyMonths}
                  onChange={(e) => setSettings({ ...settings, finishWarrantyMonths: parseInt(e.target.value) || 0 })}
                  className="w-16 px-2 py-1.5 border rounded-lg text-right font-black outline-none text-[13px] transition-all"
                  style={{ borderColor: "var(--grid-border)", color: "var(--brand-primary)" }}
                />
                <span className="text-[12px] font-bold" style={{ color: "var(--text-placeholder)" }}>Tháng</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full h-11 rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Save size={17} />
            Lưu tất cả cài đặt
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 rounded-xl border border-amber-100 bg-amber-50 flex gap-3">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">Lưu ý nghiệp vụ:</p>
          <p className="text-[12px] leading-relaxed font-medium text-amber-800">
            Các thay đổi chỉ áp dụng cho Phiếu bảo hành <strong>mới</strong> được tạo sau thời điểm này.
            Các phiếu cũ đã bàn giao cho khách sẽ giữ nguyên nội dung để đảm bảo tính pháp lý.
          </p>
        </div>
      </div>
    </div>
  );
}
