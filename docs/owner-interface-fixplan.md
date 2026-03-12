# 🔧 ĐỀ XUẤT FIX GIAO DIỆN CHỦCỬA HÀNG

---

## 🎯 ĐỀ XUẤT #1: THÊMNÚT PHÊ DUYỆT ĐƠN HÀNG (CRITICAL)

### Vị Trí Fix: `/client/src/pages/owner-page/orders/index.jsx`

**Hiện tại:** Orders chỉ hiển thị danh sách, không có nút hành động

**Đề xuất:** Thêm 2 nút action ở mỗi hàng

```jsx
// THÊM CỘT MỚI TRONG BẢNG ORDERS
<th className="p-3 text-center">Hành động</th>

// THÊM VÀO TBODY
<td className="p-3 text-center flex gap-2 justify-center">
  {order.status === "Chờ xác nhận" && (
    <>
      <button
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => approveOrder(order.id)}
      >
        ✅ Duyệt
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={() => rejectOrder(order.id)}
      >
        ❌ Hủy
      </button>
    </>
  )}

  {order.status === "Sẵn giao chờ phê duyệt" && (
    <button
      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => approveDelivery(order.id)}
    >
      🚚 Duyệt Giao
    </button>
  )}

  <button
    className="px-3 py-1 bg-gray-500 text-white rounded"
    onClick={() => viewDetail(order.id)}
  >
    👁️ Xem
  </button>
</td>
```

**Logic Backend cần:**
```javascript
// Handle approve: Status "Chờ xác nhận" → "Đang chuẩn bị"
POST /api/owner/orders/{id}/approve

// Handle reject: Status "Chờ xác nhận" → "Đã hủy"
POST /api/owner/orders/{id}/reject
{ reason: "..." }

// Handle approve delivery: Status "Sẵn giao" → "Giao hàng thành công"
POST /api/owner/orders/{id}/approve-delivery
{ notes: "..." }
```

---

## 🎯 ĐỀ XUẤT #2: THÊM MODAL PHÊ DUYỆT (CRITICAL)

### Vị Trí Fix: `/client/src/pages/owner-page/orders/detail.jsx`

**Đề xuất:** Thêm modal phê duyệt chi tiết

```jsx
// THÊM STATE
const [approvalModal, setApprovalModal] = useState({
  open: false,
  action: null, // 'approve', 'reject', 'approveDelivery'
  notes: '',
});

// THÊM NÚT HÀNH ĐỘNG AT BOTTOM
<div className="mt-8 p-6 bg-gray-50 rounded-lg flex gap-3">
  {status === "Chờ xác nhận" && (
    <>
      <button
        className="flex-1 px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
        onClick={() => setApprovalModal({ ...approvalModal, open: true, action: 'approve' })}
      >
        ✅ PHÊ DUYỆT ĐƠN
      </button>
      <button
        className="flex-1 px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600"
        onClick={() => setApprovalModal({ ...approvalModal, open: true, action: 'reject' })}
      >
        ❌ TỪ CHỐI ĐƠN
      </button>
    </>
  )}

  {status === "Sẵn giao chờ phê duyệt" && (
    <button
      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
      onClick={() => setApprovalModal({ ...approvalModal, open: true, action: 'approveDelivery' })}
    >
      🚚 PHÊ DUYỆT GỬI HÀNG
    </button>
  )}
</div>

// MODAL
{approvalModal.open && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {approvalModal.action === 'approve' && '✅ Xác nhận phê duyệt đơn hàng'}
        {approvalModal.action === 'reject' && '❌ Từ chối đơn hàng'}
        {approvalModal.action === 'approveDelivery' && '🚚 Phê duyệt gửi hàng'}
      </h3>

      <textarea
        placeholder="Ghi chú (tùy chọn)..."
        className="w-full p-2 border rounded mb-4"
        rows="3"
        value={approvalModal.notes}
        onChange={(e) => setApprovalModal({ ...approvalModal, notes: e.target.value })}
      />

      <div className="flex gap-2">
        <button
          className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setApprovalModal({ ...approvalModal, open: false })}
        >
          Hủy
        </button>
        <button
          className={`flex-1 px-4 py-2 text-white rounded font-medium 
            ${approvalModal.action === 'approve' ? 'bg-green-500 hover:bg-green-600' :
              approvalModal.action === 'reject' ? 'bg-red-500 hover:bg-red-600' :
              'bg-blue-500 hover:bg-blue-600'}`}
          onClick={() => handleApproval()}
        >
          Xác nhận
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 🎯 ĐỀ XUẤT #3: CẬP NHẬT STATUS ĐƠN HÀNG

### Vị Trí Fix: `/client/src/pages/owner-page/orders/index.jsx`

**Hiện tại:** Status không đúng với quy trình

**Đề xuất:** Update INITIAL_ORDERS

```javascript
const INITIAL_ORDERS = [
  // ĐƠN HÀNG SẴN - CHỜ PHÊ DUYỆT
  {
    id: "DH002",
    code: "DH-2603-0009",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng sẵn",
    total: 36000000,
    status: "Chờ xác nhận", // ← CHANGE: Từ "Giao hàng thành công"
    date: "2026-03-05T13:20:00",
  },
  // ĐƠN HÀNG ĐANG SX - CHỜ DUYỆT GIAO
  {
    id: "DH999",
    code: "DH-2603-0011",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng sẵn",
    total: 1200000,
    status: "Sẵn giao chờ phê duyệt", // ← CHANGE: Từ "Đang chuẩn bị"
    date: "2026-03-05T13:20:00",
  },
  // ĐƠN HÀNG ĐÃ GIAO - HOÀN THÀNH
  {
    id: "DH005",
    code: "DH-2603-0005",
    customerName: "Võ Đức Anh",
    phone: "0945678901",
    type: "Hàng sẵn",
    total: 3400000,
    status: "Giao hàng thành công", // ← KEEP
    date: "2026-03-03T16:20:00",
  },
];

// CẬP NHẬT STATUS BADGE
const STATUS_COLORS = {
  "Chờ xác nhận": { bg: "#fef3c7", text: "#92400e", icon: "🟡" },
  "Đang chuẩn bị": { bg: "#fed7aa", text: "#92400e", icon: "🟠" },
  "Sẵn giao chờ phê duyệt": { bg: "#bfdbfe", text: "#1e3a8a", icon: "🔵" },
  "Giao hàng thành công": { bg: "#dcfce7", text: "#166534", icon: "🟢" },
  "Đã hủy": { bg: "#fee2e2", text: "#991b1b", icon: "🔴" },
};
```

---

## 🎯 ĐỀ XUẤT #4: UNCOMMENT &IMPLEMENT TRANG APPROVALS

### Vị Trí: `/client/src/pages/owner-page/approvals/index.jsx`

**Hiện tại:** Code bị comment out

**Đề xuất:** Uncomment & hoàn thiện

```jsx
import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { FileCheck, XCircle, RotateCcw, Eye, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "quotation", label: "Phê duyệt báo giá", icon: FileCheck, count: 3 },
  { id: "cancel", label: "Phê duyệt hủy đơn", icon: XCircle, count: 1 },
  { id: "return", label: "Phê duyệt hoàn hàng", icon: RotateCcw, count: 0 },
];

// Mock data - sau thay bằng API
const mockApprovals = {
  quotation: [
    { id: "DH001", customer: "Nguyễn Văn A", total: 95000000, date: "12/03", products: 2 },
    { id: "DH002", customer: "Trần Văn B", total: 120000000, date: "11/03", products: 1 },
    { id: "DH003", customer: "Lê Văn C", total: 45000000, date: "10/03", products: 3 },
  ],
  cancel: [
    { id: "DH004", customer: "Phạm Văn D", reason: "Khách đổi ý", date: "09/03", orderId: "DH-2603-004" },
  ],
  return: [],
};

export default function OwnerApprovals() {
  const [activeTab, setActiveTab] = useState("quotation");
  const [approving, setApproving] = useState(null);

  const handleApprove = (id, action) => {
    console.log(`Approve ${action} for ${id}`);
    // Call API here
    setApproving(null);
  };

  return (
    <>
      <PageHelmet title="Phê duyệt | Chủ cửa hàng" />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Phê duyệt</h1>
        <p className="text-gray-500 mb-6">Quản lý các yêu cầu cần chủ cửa hàng phê duyệt</p>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-b-2 transition",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon size={18} />
                {tab.label}
                <span className="ml-1 px-2 py-1 text-sm bg-red-100 text-red-600 rounded-full font-bold">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="grid gap-4">
          {mockApprovals[activeTab].map((item) => (
            <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{item.id} - {item.customer}</h4>
                  {activeTab === "quotation" && (
                    <p className="text-sm text-gray-600 mt-1">{item.products} sản phẩm</p>
                  )}
                  {activeTab === "cancel" && (
                    <p className="text-sm text-gray-600 mt-1">Lý do: {item.reason}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Ngày: {item.date}</p>
                </div>

                <div className="text-right">
                  {activeTab === "quotation" && (
                    <p className="font-bold text-lg text-gray-900">{item.total.toLocaleString()} đ</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setApproving({ id: item.id, action: activeTab })}
                    >
                      👁️ Xem
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApprove(item.id, "approve")}
                    >
                      ✅ Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApprove(item.id, "reject")}
                    >
                      ❌ Từ chối
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {mockApprovals[activeTab].length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-2 opacity-50" />
              <p>Không có yêu cầu phê duyệt</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

---

## 🎯 ĐỀ XUẤT #5: THÊM CHỨC NĂNG CẬP NHẬT SẢN XUẤT

### Vị Trí: `/client/src/pages/owner-page/production/detail.jsx`

**Đề xuất:** Thêm nút cập nhật tiến độ sản xuất

```jsx
// THÊM STATE
const [updateModal, setUpdateModal] = useState({
  open: false,
  status: null, // 'completed', 'issue'
  notes: '',
});

// THÊM NÚT ACTION AT BOTTOM OF DETAIL
{status === "Đang sản xuất" && (
  <div className="mt-8 p-6 bg-gray-50 rounded-lg flex gap-3">
    <button
      className="flex-1 px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
      onClick={() => setUpdateModal({ ...updateModal, open: true, status: 'completed' })}
    >
      ✅ ĐÃ HOÀN THÀNH
    </button>
    <button
      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600"
      onClick={() => setUpdateModal({ ...updateModal, open: true, status: 'issue' })}
    >
      ⚠️ CÓ VẤN ĐỀ
    </button>
  </div>
)}

// MODAL UPDATE MODAL
{updateModal.open && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-bold mb-4">
        {updateModal.status === 'completed' ? '✅ Xác nhận hoàn thành' : '⚠️ Báo cáo vấn đề'}
      </h3>
      <textarea
        placeholder="Ghi chú..."
        className="w-full p-2 border rounded mb-4"
        rows="3"
        value={updateModal.notes}
        onChange={(e) => setUpdateModal({ ...updateModal, notes: e.target.value })}
      />
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-gray-300 rounded" onClick={() => setUpdateModal({ ...updateModal, open: false })}>
          Hủy
        </button>
        <button className={`flex-1 px-4 py-2 text-white rounded font-medium ${updateModal.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} onClick={() => handleProductionUpdate()}>
          Xác nhận
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 📝 CÔNG VIỆC BACKEND CẦN

```
1. API Phê duyệt đơn:
   POST /api/owner/orders/{id}/approve
   POST /api/owner/orders/{id}/reject
   
2. API Phê duyệt gióhàng:
   POST /api/owner/orders/{id}/approve-delivery
   
3. API Cập nhật sản xuất:
   POST /api/owner/production/{id}/complete
   POST /api/owner/production/{id}/report-issue
   
4. API List phê duyệt:
   GET /api/owner/approvals?type=quotation|cancel|return
   
5. Cập nhật timezone & timestamp cho log
```

---

## 🎯 TIMELINE ĐỀ XUẤT

**Tuần này (09/03 - 15/03):**
- [ ] Fix #1: Thêm nút phê duyệt Orders
- [ ] Fix #2: Modal phê duyệt chi tiết
- [ ] Fix #3: Update status

**Tuần sau (16/03 - 22/03):**
- [ ] Fix #4: Implement Approvals page
- [ ] Fix #5: Production update

---

Khi hoàn tất tất cả, giao diện chủ cửa hàng sẽ **100% hoàn thiện** và **sẵn sàng sử dụng!** ✅

