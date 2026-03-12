# 🔍 REVIEW GIAO DIỆN CHỦCỬA HÀNG (Owner Interface)

**Ngày Review:** 09/03/2026  
**Trạng thái:** ✅ Cơ bản hoàn thành, ⚠️ Một số tính năng thiếu sót

---

## ✅ NHỮNG GÌ ĐÃ IMPLEMENT TỐT

### 1. 📊 Dashboard (Tổng Quan)
- ✅ Hiển thị doanh số hôm nay
- ✅ Lợi nhuận & tỷ suất
- ✅ Số đơn hàng mới + phê duyệt
- ✅ Biểu đồ doanh thu 7 ngày / 30 ngày
- ✅ Biểu đồ doanh số theo danh mục (Pie chart)
- ✅ Danh sách 5 sản phẩm top bán
- ✅ Cảnh báo khách nợ quá hạn
- ✅ Cảnh báo sản phẩm tồn kho thấp
- ✅ Giao diện đẹp, dễ nhìn

### 2. 📋 Orders (Đơn Hàng)
- ✅ Danh sách đơn hàng chi tiết
- ✅ Hiển thị trạng thái đơn (7 trạng thái)
- ✅ Tìm kiếm & lọc đơn hàng
- ✅ Phân trang
- ✅ Chi tiết đơn hàng (OrderDetail) có thông tin đầy đủ
- ✅ Timeline lịch sử trạng thái
- ✅ Thông tin khách hàng, sales, thanh toán rõ ràng

### 3. 🏭 Production (Sản Xuất)
- ✅ Danh sách công việc sản xuất
- ✅ Hiển thị tình trạng từng công việc
- ✅ Chi tiết công việc có timeline
- ✅ Thông tin thợ được giao việc
- ✅ Có giai đoạn chi tiết (Đánh ráp, Phun sơn)
- ✅ Ngày dự kiến hoàn thành

### 4. 📦 Products (Sản Phẩm)
- ✅ Danh sách sản phẩm
- ✅ Lọc theo danh mục
- ✅ Lọc theo loại gỗ
- ✅ Hiển thị trạng thái (Hoạt động, Ngoài kho, Ngừng KD)
- ✅ Tìm kiếm nhanh
- ✅ Phân trang

### 5. 👥 Employees (Nhân Sự)
- ✅ Danh sách nhân viên
- ✅ Hiển thị trạng thái (Hoạt động, Nghỉ, Khóa)
- ✅ Lọc theo chức vụ
- ✅ Thông tin chi tiết: email, ĐT, chức vụ, lương
- ✅ Chi tiết modal với nhiều tab

### 6. 🏢 Suppliers (Nhà Cung Cấp)
- ✅ Danh sách NCC
- ✅ Thông tin liên hệ đầy đủ
- ✅ Công nợ NCC
- ✅ Lịch sử nhập hàng
- ✅ Nút xem chi tiết với modal phức tạp
- ✅ Lịch sử thanh toán/công nợ

### 7. 📊 Reports (Báo Cáo)
- ✅ 5 loại báo cáo chính
- ✅ Báo cáo bán hàng (Doanh thu, lợi nhuận)
- ✅ Báo cáo XNT Kho (Xuất nhập tồn)
- ✅ Báo cáo công nợ khách hàng
- ✅ Báo cáo công nợ NCC
- ✅ Báo cáo sổ quỹ
- ✅ Lọc theo ngày tháng
- ✅ Phân trang, tìm kiếm
- ✅ Nút in, xuất Excel

### 8. 📝 System Logs (Nhật Ký)
- ✅ Danh sách 15+ hoạt động
- ✅ Lọc theo loại hành động (Order, Product, User, System)
- ✅ Biểu tượng & màu sắc phân biệt rõ
- ✅ Hiển thị: người dùng, hành động, thời gian, chi tiết
- ✅ Tìm kiếm
- ✅ Phân trang

### 9. 🎨 UI/UX Chung
- ✅ Sidebar menu rõ ràng, dễ sử dụng
- ✅ Navbar header có thông tin người dùng
- ✅ Biểu tượng icon từ lucide-react đẹp
- ✅ Màu sắc thống nhất (xanh dương chính)
- ✅ Modal & Dialog hiển thị đẹp
- ✅ Responsive (có phân trang, scroll)

---

## ⚠️  NHỮNG GÌ THIẾU / CẦN FIX

### 🔴 THIẾU TÍNH NĂNG PHÊDUYỆT (CRITICAL)

#### 1. **Chức Năng Phê Duyệt Đơn Hàng Mới (Orders)**
**Tình trạng:** ❌ Không có UI rõ ràng để phê duyệt ĐH

**Vấn đề:**
- Orders chỉ hiển thị danh sách, không có nút "✅ PHÊ DUYỆT" hoặc "❌ TỪ CHỐI"
- Không thể phân biệt đơn nào đã phê duyệt, đơn nào chủ chưa xem
- Không có tính năng ghi chú khi phê duyệt/từ chối

**Cần thêm:**
```
- Thêm nút [✅ APPROVE] & [❌ REJECT] ở danh sách Orders
- Hoặc thêm ở chi tiết OrderDetail
- Modal phê duyệt với lựa chọn:
  • Phê duyệt (APPROVED)
  • Từ chối (REJECTED) + lý do
  • Ghi chú thêm
- Cập nhật trạng thái real-time
- Thông báo cho Sales khi phê duyệt/từ chối
```

#### 2. **Chức Năng Phê Duyệt Giao Hàng (Orders)**
**Tình trạng:** ❌ Không có UI để phê duyệt giao hàng

**Vấn đề:**
- Không thể thấy các ĐH "Sẵn giao" chưa được duyệt
- Không có nút phê duyệt giao hàng

**Cần thêm:**
```
- Status "Sẵn giao chờ phê duyệt" (🔵 hoặc 🟠)
- Nút [✅ PHÊ DUYỆT GỬI HÀNG] ở chi tiết ĐH
- Modal: Kiểm tra chất lượng + Ghi chú
- Sau phê duyệt → Update Status: "Giao hàng thành công"
- Thông báo cho Sales/Kho
```

#### 3. **Trang Approvals (Phê Duyệt) - Chuyên Biệt**
**Tình trạng:** ⚠️ Folder tạo nhưng code comment out

**Vấn đề:**
- File `approvals/index.jsx` chỉ là comment, chưa implementation
- Không có tab phê duyệt báo giá, hủy đơn, hoàn hàng

**Cần làm:**
```jsx
Tạo trang Approvals với tabs:
1. "Phê Duyệt Báo Giá" (Đơn type "Chờ báo giá")
2. "Phê Duyệt Hủy Đơn" (Đơn type "Chờ duyệt hủy")
3. "Phê Duyệt Hoàn Hàng" (Đơn type "Chờ hoàn hàng")

Tương ứng với các status:
- Chờ báo giá → Phê duyệt giá → gửi báo giá cho khách
- Chờ duyệt hủy → Phê duyệt hủy → Hủy ĐH
- Chờ hoàn hàng → Phê duyệt → Xử lý hoàn
```

---

### ⚠️  BUG / LOGIC SAI

#### 4. **Orders - Trạng Thái Không Chính Xác**
**Vấn đề:**
- Status danh sách: "Chờ xử lý", "Chờ duyệt hủy", "Đang giao hàng", "Giao hàng thành công", "Đã hủy"
- Nhưng **theo quy trình chủ phê duyệt**, status cần là:
  - 🟡 **Chờ xác nhận** (Sales tạo xong, chủ chưa xem)
  - 🟠 **Đang chuẩn bị** (Chủ phê duyệt, đang sản xuất)
  - 🔵 **Sẵn giao** / "Chờ giao" (Hàng xong, chủ chưa phê duyệt giao)
  - 🟢 **Giao hàng thành công** (Chủ phê duyệt giao)
  - 🔴 **Đã hủy**

**Cần fix:**
```
- Update status trong INITIAL_ORDERS
- Align với quy trình: Sales tạo → Chủ phê duyệt → Sản xuất/Lấy → Chủ phê duyệt giao → Giao xong
```

#### 5. **Dashboard - "Pending Approvals" Không Chính Xác**
**Vấn đề:**
- Dashboard hiển thị `pendingApprovals: 5` nhưng không biết từ đâu
- Không link tới các ĐH cần phê duyệt

**Cần fix:**
```
- ThCalculate real-time từ danh sách Orders filter status "Chờ xác nhận"
- Hoặc link tới Approvals page
- Hiển thị breakdown: "5 ĐH chờ duyệt + 2 ĐH sẵn giao chờ duyệt"
```

---

### 📌 THIẾU / CẦN HOÀN THIỆN

#### 6. **Orders Detail - Chi Tiết Không Đầy Đủ**
**Vấn đề:**
- OrderDetail.jsx: Có thông tin nhưng chỉ xem, không có nút hành động
- Không có nút [Edit], [Approve], [Reject], [Cancel]

**Cần thêm:**
```jsx
<div className="mt-6 flex gap-2">
  {status === "Chờ xác nhận" && (
    <>
      <Button variant="success" size="lg" onClick={() => approve()}>
        ✅ PHÊ DUYỆT
      </Button>
      <Button variant="danger" size="lg" onClick={() => reject()}>
        ❌ TỪ CHỐI
      </Button>
    </>
  )}
  
  {status === "Sẵn giao" && (
    <Button variant="success" size="lg" onClick={() => approveDelivery()}>
      ✅ PHÊ DUYỆT GỬI HÀNG
    </Button>
  )}
  
  {["Chờ xác nhận", "Đang chuẩn bị"].includes(status) && (
    <Button variant="warning" onClick={() => cancelOrder()}>
      🔴 HỦY ĐƠN
    </Button>
  )}
</div>
```

#### 7. **Production Detail - Không Có Chức Năng Cập Nhật**
**Vấn đề:**
- ProductionDetail.jsx: Hiển thị thông tin nhưng chỉ xem
- Không có nút cập nhật tiến độ, đánh dấu hoàn thành
- Chủ cửa hàng không thể kiểm tra & duyệt khi công việc hoàn thành

**Cần thêm:**
```jsx
{subStage && status === "Đang sản xuất" && (
  <div className="mt-6 flex gap-2">
    <Button> ✅ ĐÃ HOÀN THÀNH </Button>
    <Button variant="warning"> ⚠️ CÓ VẤN ĐỀ </Button>
  </div>
)}
```

#### 8. **Customers - Route Bị Comment Out**
**Vấn đề:**
- OwnerRoutes.jsx: Customers route comment out
- Menu sidebar không có "Khách hàng"

**Cần:**
- Uncomment hoặc xóa nếu không cần
- Nếu giữ, cần implement giao diện Customers

---

### 🎯 THIẾU TÍNH NĂNG NHỎ

#### 9. **Orders List - Không Có Lọc Theo Status**
- Dashboard hiển thị "5 đơn chờ duyệt" nhưng Orders không có filter
- Cần thêm filter/tab: "Tất cả", "Chờ duyệt", "Sẵn giao", "Hoàn thành", "Hủy"

#### 10. **Production - Không Có Modal Gán Nhân Viên**
- Production detail có `assignedWorker` nhưng không thể chỉnh sửa
- Chủ không thể đổi người làm công việc nếu cần

#### 11. **Orders Detail - Không Thể Sửa Ghi Chú**
- Hiển thị ghi chú nhưng không thể sửa
- Chủ không thể thêm ghi chú khi phê duyệt

#### 12. **Reports - Không Có Bảng Excel Export**
- Nút [📥 XUẤT] không hoạt động thực tế (giả lập)
- Frontend chỉ UI, backend cần implement

#### 13. **System Logs - Không Có Log Phê Duyệt**
- Log hiện tại không ghi lại các hành động "Phê duyệt ĐH"
- Cần thêm action logs cho phê duyệt/từ chối

---

## 📋 CHECKLIST CẦN LÀM (Ưu Tiên)

### 🔴 CRITICAL (Phải làm)
- [ ] **Thêm nút phê duyệt ĐH mới** vào Orders (✅ Approve / ❌ Reject)
- [ ] **Thêm nút phê duyệt giao hàng** vào Orders (✅ Approve Delivery)
- [ ] **Uncomment/Implement trang Approvals** 
- [ ] **Cấp nhật status ĐH** để align với quy trình phê duyệt
- [ ] **Thêm nút hành động OrderDetail** (Phê duyệt, Từ chối, Hủy)

### 🟠 HIGH (Nên làm)
- [ ] **Thêm lọc Orders** theo status (Chờ duyệt, Sẵn giao, Hoàn thành)
- [ ] **OrderDetail - Có ghi chú** khi phê duyệt
- [ ] **ProductionDetail - Nút cập nhật** tiến độ / hoàn thành
- [ ] **Production - Modal gán nhân viên**
- [ ] **Dashboard - Calculate pending approvals** từ data thực

### 🟡 MEDIUM (Có thể làm sau)
- [ ] **System Logs - Ghi log hành động phê duyệt**
- [ ] **Reports - Implement export Excel thực tế**
- [ ] **Customers page** - Decide: Uncomment hay xóa?
- [ ] **Approvals - Các tab khác** (Hủy đơn, Hoàn hàng)

---

## 🎯 SUMMARY

**Tổng thể:** 
- ✅ **70% hoàn thành** - Giao diện & hiển thị dữ liệu tốt
- ⚠️ **30% thiếu** - Thiếu chủ yếu tính năng phê duyệt (critical)

| Giao Diện | Trạng Thái | Ghi Chú |
|-----------|----------|--------|
| Dashboard | ✅ Tốt | Dữ liệu đầy đủ, UI đẹp |
| Orders | ⚠️ Thiếu | Cần thêm phê duyệt & từ chối |
| OrderDetail | ⚠️ Thiếu | Cần thêm nút hành động |
| Production | ✅ Tốt | Hiển thị OK, chưa update tiến độ |
| ProductionDetail | ⚠️ Thiếu | Cần nút hoàn thành & QC |
| Products | ✅ Tốt | Danh sách & lọc hoàn chỉnh |
| Employees | ✅ Tốt | Danh sách & chi tiết OK |
| Suppliers | ✅ Tốt | Thông tin & công nợ đầy đủ |
| Reports | ✅ Tốt | 5 báo cáo hoàn chỉnh |
| SystemLogs | ✅ Tốt | Ghi lại hoạt động tốt |
| Approvals | ❌ Không xong | Folder tạo, code comment out |

---

**Kết luận:** Giao diện chủ cửa hàng cơ bản hoàn thành nhưng **thiếu tính năng phê duyệt** - đây là chức năng CORE của chủ. Cần ưu tiên implement ngay để tính năng chính hoạt động!

