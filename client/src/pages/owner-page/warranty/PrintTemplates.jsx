import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Template for Warranty Certificate
export const PrintableWarrantyCertificate = ({ warranty }) => {
  if (!warranty) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto bg-white p-12 text-gray-900 font-sans text-[14px] leading-relaxed">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-[#B5854A]">TRỌNG PHÓNG FURNITURE</h1>
          <p className="text-[13px] font-semibold text-gray-500 mt-2 tracking-wide uppercase">Đồ gỗ mỹ nghệ TRỌNG PHÓNG</p>
          <div className="mt-3 text-[13px] text-gray-600 space-y-1">
            <p><strong>Hotline:</strong> 0988.123.456</p>
            <p><strong>Địa chỉ:</strong> Làng nghề mộc truyền thống, Hà Nội</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-800">PHIẾU BẢO HÀNH</h2>
          <p className="text-[14px] font-semibold text-gray-500 mt-1">SỐ: <span className="text-[#B5854A]">{warranty.id}</span></p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin khách hàng</h3>
          <p className="font-bold text-lg">{warranty.customerName}</p>
          <p className="text-gray-600 mt-1">SĐT: {warranty.phone}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin hóa đơn</h3>
          <p className="text-gray-800">Mã đơn hàng: <strong className="font-mono">{warranty.orderId}</strong></p>
          <p className="text-gray-800 mt-1">Ngày mua: {format(new Date(warranty.startDate), "dd/MM/yyyy")}</p>
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Thông tin sản phẩm</h3>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 font-semibold">Tên sản phẩm</th>
              <th className="border border-gray-300 px-4 py-2 font-semibold w-1/3">Mã SP (SKU)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-3 font-medium">{warranty.productName}</td>
              <td className="border border-gray-300 px-4 py-3 font-mono text-sm">{warranty.productCode}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Warranty Terms */}
      <div className="mb-10 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">THỜI HẠN BẢO HÀNH: <span className="text-[#B5854A] text-xl">{warranty.warrantyMonths} THÁNG</span></h3>
          <div className="text-right">
             <p className="text-[13px] text-gray-500">Từ ngày: {format(new Date(warranty.startDate), "dd/MM/yyyy")}</p>
             <p className="text-[13px] text-gray-500">Đến ngày: {format(new Date(warranty.endDate), "dd/MM/yyyy")}</p>
          </div>
        </div>
        <hr className="border-gray-300 my-4" />
        <h4 className="font-bold text-gray-800 mb-2">ĐIỀU KIỆN BẢO HÀNH / BẢO TRÌ</h4>
        <div className="text-gray-600 text-[13px] space-y-2 whitespace-pre-wrap leading-relaxed">
          {warranty.notes || `1. Sản phẩm được bảo hành miễn phí nếu có lỗi kỹ thuật từ nhà sản xuất (nứt nẻ xé gỗ do lỗi sấy ghép, bong tróc sơn do kỹ thuật, lỗi kết cấu mộng).
2. Không bảo hành các trường hợp hư hỏng do người dùng gây ra (va đập, ngập nước, để vật quá nóng/lạnh trực tiếp lên bề mặt, sử dụng sai mục đích).
3. Sau thời gian bảo hành, TPF hỗ trợ bảo trì trọn đời với chi phí ưu đãi.
4. Quý khách vui lòng xuất trình Phiếu Bảo Hành (hoặc số điện thoại mua hàng) khi có yêu cầu xử lý.`}
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 text-center pt-8 mt-12 pb-24">
        <div>
          <p className="font-bold text-gray-800">KHÁCH HÀNG</p>
          <p className="text-xs text-gray-500 mt-1 italic">(Ký và ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold text-gray-800">ĐẠI DIỆN TPF FURNITURE</p>
          <p className="text-xs text-gray-500 mt-1 italic">(Ký, đóng dấu và ghi rõ họ tên)</p>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t border-gray-200">
        Cảm ơn Quý khách đã tin tưởng và sử dụng sản phẩm của TPF Furniture!
      </div>
    </div>
  );
};

// Template for Repair Request / Invoice
export const PrintableRepairInvoice = ({ request }) => {
  if (!request) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto bg-white p-12 text-gray-900 font-sans text-[14px] leading-relaxed">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-[#B5854A]">TRỌNG PHÓNG FURNITURE</h1>
          <p className="text-[13px] font-semibold text-gray-500 mt-2 tracking-wide uppercase">Đồ gỗ mỹ nghệ TRỌNG PHÓNG</p>
          <div className="mt-3 text-[13px] text-gray-600 space-y-1">
            <p><strong>Hotline kỹ thuật:</strong> 0988.111.222</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-black text-slate-800 tracking-wider">Mã phiếu: {request.id}</p>
          <p className="text-[11px] text-gray-500 font-bold uppercase mt-1">Ngày In: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>
      </div>

      {/* Customer & Product Info */}
      <div className="mb-8 grid grid-cols-2 gap-8 border border-gray-300 p-5 rounded-lg">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin khách hàng</h3>
          <p className="font-bold text-gray-800 text-lg">{request.customerName}</p>
          <p className="text-gray-600 mt-1">SĐT: {request.phone}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin sản phẩm</h3>
          <p className="font-bold text-gray-800">{request.productName}</p>
          {request.repairCategory && (
             <p className="text-gray-800 mt-1 font-semibold text-[13px]">Phân loại xử lý: <span className="text-[#B5854A]">{request.repairCategory}</span></p>
          )}
          {request.repairMethod && (
             <p className="text-gray-800 mt-1 font-semibold text-[13px]">Phương án: <span className="text-indigo-600 uppercase italic">{request.repairMethod}</span></p>
          )}
          {request.warrantyId && (
            <p className="text-gray-600 mt-1 text-[13px]">Mã bảo hành: {request.warrantyId}</p>
          )}
        </div>
      </div>

      {/* Issue details */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Tình trạng ghi nhận:</h3>
        <p className="p-4 bg-gray-50 border border-gray-200 rounded italic text-gray-700">
           {request.issueDescription}
        </p>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Chi tiết sửa chữa & Linh kiện:</h3>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 font-semibold w-16 text-center">STT</th>
              <th className="border border-gray-300 px-4 py-2 font-semibold">Hạng mục (Dịch vụ / Linh kiện)</th>
              <th className="border border-gray-300 px-4 py-2 font-semibold w-1/4 text-right">Chi phí (VND)</th>
            </tr>
          </thead>
          <tbody>
            {request.services?.length > 0 ? (
              request.services.map((svc, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-3 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 px-4 py-3">
                     {svc.name} <span className="text-xs text-gray-400">({svc.type})</span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                     {request.isWarrantyCovered ? "Miễn phí" : new Intl.NumberFormat('vi-VN').format(svc.cost)}
                  </td>
                </tr>
              ))
            ) : (
               <tr>
                  <td colSpan="3" className="border border-gray-300 px-4 py-4 text-center text-gray-500 italic">
                     Bảo trì / Kiểm tra tổng thể (Chưa tính linh kiện)
                  </td>
               </tr>
            )}
            {request.transportFee > 0 && (
                <tr className="bg-gray-50/30">
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-400 font-mono text-xs">LOG</td>
                    <td className="border border-gray-300 px-4 py-3 italic">Phí vận chuyển / Điều xe tải (Hỗ trợ bốc đồ)</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        {new Intl.NumberFormat('vi-VN').format(request.transportFee)}
                    </td>
                </tr>
            )}
          </tbody>
          <tfoot>
             <tr className="bg-gray-50">
                <td colSpan="2" className="border border-gray-300 px-4 py-3 text-right font-bold uppercase">Tổng chi phí sửa chữa dự kiến:</td>
                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-lg text-[#B5854A]">
                   {request.isWarrantyCovered ? "0" : new Intl.NumberFormat('vi-VN').format(request.totalCost)}
                </td>
             </tr>
          </tfoot>
        </table>
        {request.notes && (
           <p className="mt-3 text-[13px] text-gray-500 italic"><strong>Ghi chú nội bộ:</strong> {request.notes}</p>
        )}
      </div>

      {/* Dates and Signatures */}
      <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-gray-200 mt-12 pb-24">
        <div>
          <p className="text-[13px] text-gray-500 mb-1">Ngày tiếp nhận: {format(new Date(request.requestDate), "dd/MM/yyyy HH:mm")}</p>
          <p className="font-bold text-gray-800">NGƯỜI BÀN GIAO / KHÁCH HÀNG</p>
          <p className="text-xs text-gray-500 mt-1 italic">(Ký và ghi rõ họ tên)</p>
        </div>
        <div>
           <p className="text-[13px] text-gray-500 mb-1">Dự kiến hoàn thành: {format(new Date(request.promisedDate), "dd/MM/yyyy HH:mm")}</p>
          <p className="font-bold text-gray-800">KỸ THUẬT VIÊN ĐI TRẠM</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">{request.technician || ""}</p>
          {!request.technician && <p className="text-xs text-gray-500 mt-1 italic">(Ký và ghi rõ họ tên)</p>}
        </div>
      </div>
    </div>
  );
};
