import React, { useState, useEffect } from "react";
import { Save, Info, ShieldCheck, Clock, FileText, AlertCircle } from "lucide-react";
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
      { id: 7, material: "MDF / Công nghiệp", months: 6 }
    ],
    finishWarrantyMonths: 6
  });

  useEffect(() => {
    const saved = localStorage.getItem("tpf_warranty_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("tpf_warranty_settings", JSON.stringify(settings));
    toast.success("Đã lưu cấu hình bảo hành thành công!");
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
  };

  const updateMaterialMonth = (id, newMonths) => {
    const updated = settings.materialRules.map(r => 
      r.id === id ? { ...r, months: parseInt(newMonths) || 0 } : r
    );
    setSettings({ ...settings, materialRules: updated });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Terms Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <FileText size={18} className="text-blue-500" />
                Nội dung điều khoản bảo hành
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">MẪU IN CHUẨN</span>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-500 mb-4 italic">
                Nội dung này sẽ được in trực tiếp lên Phiếu Bảo Hành bàn giao cho khách hàng. Bạn nên ghi rõ các điều kiện bảo hành và từ chối bảo hành.
              </p>
              <textarea
                value={settings.defaultTerms}
                onChange={(e) => setSettings({ ...settings, defaultTerms: e.target.value })}
                className="w-full h-[320px] p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none leading-relaxed font-medium text-slate-700"
                placeholder="Nhập các điều khoản bảo hành tại đây..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Duration Rules */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Thời hạn bảo hành ván</h3>
             </div>
             <div className="p-4 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 grid grid-cols-12 gap-2 px-2">
                  <div className="col-span-8">Chất liệu gỗ</div>
                  <div className="col-span-4 text-right">Tháng</div>
                </div>
                {settings.materialRules.map((rule) => (
                  <div key={rule.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="col-span-8 text-sm font-bold text-slate-700">{rule.material}</div>
                    <div className="col-span-4">
                      <input 
                        type="number" 
                        value={rule.months}
                        onChange={(e) => updateMaterialMonth(rule.id, e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-right font-black text-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none"
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-500">
              <ShieldCheck size={120} />
            </div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-400" />
              Bảo hành bề mặt
            </h4>
            <div className="space-y-4 relative z-10">
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Thời hạn bảo hành nước sơn PU, dát vàng hoặc vẹc-ni mặc định cho toàn bộ sản phẩm.
              </p>
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-sm font-bold">Mặc định:</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.finishWarrantyMonths}
                    onChange={(e) => setSettings({ ...settings, finishWarrantyMonths: parseInt(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 bg-white/20 border border-white/20 rounded-lg text-right font-black text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <span className="text-xs font-bold text-slate-400">Tháng</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <Save size={20} />
            LƯU TẤT CẢ CÀI ĐẶT
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 text-amber-800">
        <Info className="shrink-0 text-amber-500" />
        <div className="text-xs space-y-1">
          <p className="font-bold uppercase tracking-tight">Lưu ý nghiệp vụ:</p>
          <p className="leading-relaxed font-medium">
            Các thay đổi này chỉ áp dụng cho các **Phiếu bảo hành mới** được tạo sau thời điểm này. Các phiếu cũ đã bàn giao cho khách sẽ vẫn giữ nguyên nội dung lúc khởi tạo để đảm bảo tính pháp lý.
          </p>
        </div>
      </div>
    </div>
  );
}
