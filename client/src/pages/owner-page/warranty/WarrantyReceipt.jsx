import React from 'react';

const WarrantyReceipt = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white p-10 max-w-[600px] mx-auto border border-black text-black font-mono printable-content">
      <div className="text-center border-b border-black pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase">TPF FINE ART FURNITURE</h1>
        <p className="text-sm italic">Gỗ Mỹ Nghệ & Nội Thất</p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase underline">PHIẾU BẢO HÀNH {data.id}</h2>
        <p className="text-xs italic">Ngày lập: {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      <div className="space-y-4 mb-10 text-sm">
        <div className="flex justify-between border-b border-dotted border-black pb-1">
          <span className="font-bold">Khách hàng:</span>
          <span>{data.customerName}</span>
        </div>
        <div className="flex justify-between border-b border-dotted border-black pb-1">
          <span className="font-bold">Số điện thoại:</span>
          <span>{data.phone}</span>
        </div>
        <div className="flex justify-between border-b border-dotted border-black pb-1">
          <span className="font-bold">Sản phẩm:</span>
          <span>{data.productName} ({data.material})</span>
        </div>
        <div className="flex justify-between border-b border-dotted border-black pb-1">
          <span className="font-bold">Mã đơn hàng:</span>
          <span>#{data.orderId}</span>
        </div>
        <div className="flex justify-between border-b border-dotted border-black pb-1">
          <span className="font-bold">Loại phiếu:</span>
          <span>{data.type === "service" ? "Sửa chữa dịch vụ" : "Bảo hành"}</span>
        </div>
        {data.totalCost > 0 && (
          <div className="flex justify-between border-b border-dotted border-black pb-1">
            <span className="font-bold">Chi phí:</span>
            <span>{data.totalCost?.toLocaleString()} đ</span>
          </div>
        )}
        <div className="flex justify-between border-b border-dotted border-black pb-1">
          <span className="font-bold">Thanh toán:</span>
          <span>{data.customerPay > 0 ? "Khách trả" : "Miễn phí"}</span>
        </div>
        <div className="flex justify-between border-b border-dotted border-black pb-1">
          <span className="font-bold">Hạn bảo hành:</span>
          <span>{new Date(data.endDate).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="mt-6 pt-4">
          <p className="font-bold mb-2 uppercase">Nội dung tiếp nhận:</p>
          <p className="italic">"{data.defect}"</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center text-xs pt-10">
        <div className="space-y-16">
          <p className="font-bold uppercase">Người mua hàng</p>
          <p>(Ký tên)</p>
        </div>
        <div className="space-y-16">
          <p className="font-bold uppercase">Chủ cửa hàng</p>
          <p>(Xác nhận)</p>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t border-black text-center text-[10px] uppercase tracking-widest">
        Hệ thống TPF SIMS ERP 3.0
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-content, .printable-content * { visibility: visible; }
          .printable-content { position: absolute; left: 0; top: 0; width: 100%; border: none; padding: 1in; }
        }
      `}} />
    </div>
  );
};

export default WarrantyReceipt;
