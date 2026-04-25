import { useState, useMemo } from "react";
import {
  X,
  AlertTriangle,
  RotateCcw,
  Tag,
  Trash2,
  CheckCircle,
  Hash,
  ArrowDownToLine,
  CalendarDays,
  ClipboardList
} from "lucide-react";
import { toast } from "react-hot-toast";

const fmtCurrency = (n) =>
  n != null && n !== "" ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ProcessDefectiveModal({ product, onClose, onProcess }) {
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [processType, setProcessType] = useState("RETURN"); // RETURN, SCRAP, WRITE_OFF
  const [scrapPrice, setScrapPrice] = useState("");
  const [note, setNote] = useState("");

  // Lọc ra các unit bị lỗi từ product
  const defectiveUnits = useMemo(() => {
    let units = [];
    if (product.lots) {
      product.lots.forEach(lot => {
        if (lot.units) {
          lot.units.forEach(u => {
            if (u.status === "DEFECTIVE") {
              units.push({
                ...u,
                importDate: u.importDate || lot.importDate,
                importPrice: u.importPrice != null ? u.importPrice : lot.importPrice,
                importReceiptId: u.importReceiptId || lot.importReceiptId,
              });
            }
          });
        }
      });
    } else if (product.units) {
        product.units.forEach(u => {
            if (u.status === "DEFECTIVE") {
                units.push({
                ...u,
                importDate: u.importDate || product.importedAt,
                importPrice: u.importPrice != null ? u.importPrice : product.importPrice,
                importReceiptId: u.importReceiptId || product.importReceiptId,
                });
            }
        });
    }
    return units;
  }, [product]);

  const handleToggleUnit = (unitId) => {
    setSelectedUnits(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUnits.length === defectiveUnits.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(defectiveUnits.map(u => u.unitId));
    }
  };

  const totalValue = selectedUnits.reduce((sum, unitId) => {
    const u = defectiveUnits.find(x => x.unitId === unitId);
    return sum + (u?.importPrice || 0);
  }, 0);

  const handleSubmit = () => {
    if (selectedUnits.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn vị hàng để xử lý");
      return;
    }
    if (processType === "SCRAP" && !scrapPrice) {
      toast.error("Vui lòng nhập giá bán thanh lý");
      return;
    }

    // Call onProcess with data
    onProcess({
      unitIds: selectedUnits,
      processType,
      scrapPrice: processType === "SCRAP" ? Number(scrapPrice) : null,
      note,
      totalValue
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-full"
        style={{ border: "1px solid var(--grid-border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{
            borderColor: "var(--grid-border)",
            backgroundColor: "#FEF2F2"
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-700">Xử lý hàng lỗi</h2>
              <p className="text-sm text-red-600/80 mt-0.5">
                {product.name} ({product.sku})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 bg-gray-50/30">
          {/* Left: Danh sách đơn vị lỗi */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                Danh sách đơn vị hàng bị lỗi ({defectiveUnits.length})
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                {selectedUnits.length === defectiveUnits.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex-1">
              <table className="w-full text-[12px] text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedUnits.length > 0 && selectedUnits.length === defectiveUnits.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
                      Mã định danh
                    </th>
                    <th className="px-3 py-3 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
                      Giá nhập
                    </th>
                    <th className="px-3 py-3 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
                      Phiếu nhập
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {defectiveUnits.map((u) => (
                    <tr 
                      key={u.unitId} 
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedUnits.includes(u.unitId) ? "bg-blue-50" : ""}`}
                      onClick={() => handleToggleUnit(u.unitId)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedUnits.includes(u.unitId)}
                          onChange={() => {}} // Handle on tr click
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                          {u.unitId}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-orange-700">
                        {fmtCurrency(u.importPrice)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded text-gray-500 bg-gray-50 border border-gray-100">
                          {u.importReceiptId || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {defectiveUnits.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Không có đơn vị hàng lỗi nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Tùy chọn xử lý */}
          <div className="w-full md:w-80 flex flex-col gap-5 shrink-0">
            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Tóm tắt</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Số lượng chọn:</span>
                <span className="text-sm font-bold">{selectedUnits.length} đơn vị</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Tổng giá trị:</span>
                <span className="text-base font-black text-red-600">{fmtCurrency(totalValue)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-gray-800 mb-1">Phương thức xử lý</h3>
              
              <label 
                className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${processType === "RETURN" ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-gray-200 hover:border-blue-300"}`}
              >
                <input 
                  type="radio" 
                  name="processType" 
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                  checked={processType === "RETURN"}
                  onChange={() => setProcessType("RETURN")}
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <RotateCcw size={16} className="text-blue-600" /> Trả nhà cung cấp
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Lập phiếu xuất trả, giảm trừ công nợ với NCC.</p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${processType === "SCRAP" ? "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500" : "border-gray-200 hover:border-orange-300"}`}
              >
                <input 
                  type="radio" 
                  name="processType" 
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                  checked={processType === "SCRAP"}
                  onChange={() => setProcessType("SCRAP")}
                />
                <div className="w-full">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Tag size={16} className="text-orange-600" /> Bán thanh lý / Phế liệu
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 mb-2">Bán thu hồi vốn, ghi nhận lỗ vào chi phí.</p>
                  
                  {processType === "SCRAP" && (
                    <div className="mt-2">
                      <label className="text-[11px] font-bold text-gray-600 mb-1 block">Giá bán thanh lý / đơn vị (VNĐ)</label>
                      <input 
                        type="number"
                        className="w-full text-sm border border-orange-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        placeholder="VD: 500000"
                        value={scrapPrice}
                        onChange={e => setScrapPrice(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${processType === "WRITE_OFF" ? "border-gray-800 bg-gray-100 ring-1 ring-gray-800" : "border-gray-200 hover:border-gray-400"}`}
              >
                <input 
                  type="radio" 
                  name="processType" 
                  className="mt-1 text-gray-800 focus:ring-gray-800"
                  checked={processType === "WRITE_OFF"}
                  onChange={() => setProcessType("WRITE_OFF")}
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Trash2 size={16} className="text-gray-700" /> Xuất hủy hàng
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Hàng hỏng hoàn toàn, hạch toán vào chi phí tổn thất.</p>
                </div>
              </label>
            </div>

            <div className="mt-2">
              <label className="text-sm font-bold text-gray-800 mb-1 block">Ghi chú xử lý</label>
              <textarea 
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="Lý do, biên bản kèm theo..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedUnits.length === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <CheckCircle size={16} /> Xác nhận xử lý
          </button>
        </div>
      </div>
    </div>
  );
}
