# Hướng Dẫn Giao Diện Chủ Cửa Hàng (Owner Interface Guide)

## 📊 Tổng Quan Hệ Thống

Hệ thống TPFSIMS dành cho **chủ cửa hàng** bao gồm 8 giao diện chính giúp quản lý toàn bộ hoạt động kinh doanh nội thất gỗ.

---

## 🎯 Cấu Trúc Menu Chính

```
┌─ OWNER DASHBOARD ─────────────────────────┐
│                                           │
├─ 1. Tổng Quan (Dashboard)                 │ ← Thống kê & khái quát
├─ 2. Đơn Hàng (Orders)                     │ ← Quản lý bán hàng
├─ 3. Quản Lý Sản Xuất (Production)        │ ← Theo dõi sản xuất
├─ 4. Sản Phẩm (Products)                   │ ← Quản lý sản phẩm & giá
├─ 5. Nhà Cung Cấp (Suppliers)              │ ← Quản lý nhà cung cấp
├─ 6. Nhân Sự (Employees)                   │ ← Quản lý nhân viên & lương
├─ 7. Báo Cáo (Reports)                     │ ← Phân tích kinh doanh
└─ 8. Nhật Ký Hệ Thống (System Logs)       │ ← Theo dõi hoạt động
```

---

## 📑 Chi Tiết Từng Giao Diện

### 1. 🏠 **TỔNG QUAN (DASHBOARD)**
**Đường dẫn:** `/owner/dashboard`

**Chức năng chính:**
- 📈 Xem thống kê doanh số bán hàng
- 💰 Tổng doanh thu thực tế
- 📋 Số đơn hàng (chờ xử lý, thành công, hủy)
- 🏭 Tình trạng sản xuất
- ⚠️ Cảnh báo và thông báo quan trọng

**Các chỉ số hiển thị:**
- Doanh thu theo ngày/tháng/năm (biểu đồ Area Chart)
- Phân bố bán hàng theo danh mục (Pie Chart)
- Tình trạng nhập xuất kho (Bar Chart)
- Danh sách khách hàng VIP
- Thông báo đơn hàng chuẩn bị giao

**Quyền hạn:** Xem toàn bộ + Chỉnh sửa thông tin cá nhân

---

### 2. 📋 **ĐƠN HÀNG (ORDERS)** - THEO DÕI & PHÊ DUYỆT
**Đường dẫn:** `/owner/orders` | `/owner/orders/:id`

**Chức năng chính:**
- 📊 Danh sách toàn bộ đơn hàng (Sales tạo)
- 🔍 Tìm kiếm & lọc đơn hàng
- ✅ **PHÊ DUYỆT** các đơn hàng mới (chủ cửa hàng xem xét)
- ✅ **PHÊ DUYỆT** giao hàng (khi hàng sẵn sàng)
- ❌ **TỪ CHỐI** đơn hàng nếu cần
- 💳 Xem chi tiết từng đơn hàng (thanh toán, ghi chú, v.v.)
- 📤 Xuất báo cáo đơn hàng

**Quy trình phê duyệt đơn hàng mới:**
1. Sales tạo ĐH → **Chủ nhận thông báo**
2. Chủ vào Orders → Xem danh sách "Chờ xác nhận"
3. Chủ xem chi tiết: Khách, sản phẩm, yêu cầu
4. Chủ kiểm tra tồn kho hoặc khả năng sản xuất
5. Chủ **✅ PHÊDUYỆT** hoặc **❌ TỪCHỐI**

**Quy trình phê duyệt giao hàng:**
1. Khi hàng sẵn sàng → Sales cập nhật "Sẵn giao"
2. **Chủ nhận thông báo & xem hàng**
3. Chủ kiểm tra chất lượng, đóng gói
4. Chủ **✅ PHÊDUYỆT GỬI HÀNG** → Cập nhật 🟢 GIAO THÀNH CÔNG

**Trạng thái đơn hàng:**
- 🟡 **Chờ xác nhận** - Sales tạo, chủ chưa duyệt
- ❌ **TỪ CHỐI** - Chủ từ chối (hết hàng, lý do khác)
- 🟠 **Đang chuẩn bị** - Chủ phê duyệt, đang lấy hàng/sản xuất
- 🔵 **Đã chuẩn bị** - Hàng sẵn sàng, chờ chủ duyệt giao
- 🟢 **Giao hàng thành công** - Chủ approved & khách nhận
- 🔴 **Đã hủy** - Khách hoặc chủ hủy

**Loại hàng:**
- Hàng sẵn (Đã có trong kho)
- Hàng tùy chỉnh (Phải sản xuất)
- Hàng đặt hàng (Chờ nhà cung cấp)

**Cột dữ liệu:**
| Mã ĐH | Khách Hàng | ĐT | Loại | Tổng Tiền | Trạng Thái | Ngày |
|-------|-----------|-----|------|-----------|-----------|------|

**Chi tiết đơn hàng:** Gồm sản phẩm, giá, số lượng, ghi chú, lịch sử trạng thái

---

### 3. 🏭 **QUẢN LÝ SẢN XUẤT (PRODUCTION)**
**Đường dẫn:** `/owner/production` | `/owner/production/:id`

**Chức năng chính:**
- 📋 Danh sách công việc sản xuất
- ⚙️ Gán nhân viên sản xuất
- ✅ Theo dõi tiến độ
- 📝 Cập nhật tình trạng từng công việc

**Trạng thái sản xuất:**
- 🟡 **Chưa bắt đầu** - Vừa tạo
- 🟠 **Đang thực hiện** - Nhân viên đang làm
- 🟢 **Hoàn thành** - Xong việc
- 🔴 **Có vấn đề** - Gặp sự cố

**Thông tin công việc:**
- Mã sản xuất / Liên kết ĐH
- Sản phẩm / Số lượng
- Nhân viên được giao việc
- Ngày bắt đầu / Dự kiến xong
- Ghi chú & Yêu cầu đặc biệt

**Chi tiết công việc:** Hình ảnh sản phẩm, quy trình, vật liệu cần dùng, lịch sử cập nhật

---

### 4. 📦 **SẢN PHẨM (PRODUCTS)**
**Đường dẫn:** `/owner/products`

**Chức náng chính:**
- 📊 Danh sách toàn bộ sản phẩm
- ➕ Thêm sản phẩm mới
- 📝 Chỉnh sửa thông tin sản phẩm
- 🔍 Tìm kiếm & lọc theo danh mục / loại gỗ
- 🖼️ Quản lý hình ảnh sản phẩm
- 💰 Cập nhật giá bán

**Trạng thái sản phẩm:**
- 🟢 **Hoạt động** - Đang bán
- 🟠 **Ngoài kho** - Hết hàng tạm
- 🔴 **Ngừng kinh doanh** - Không còn bán

**Phân loại:**
- **Danh mục:** Ghế, bàn, giường, tủ, kệ, v.v.
- **Loại gỗ:** Sồi, gỗ cối, căm xe, teak, v.v.

**Cột dữ liệu:**
| Mã SP | Tên | Loại Gỗ | Danh Mục | Giá | Tồn Kho | Trạng Thái |
|-------|-----|---------|---------|-----|---------|-----------|

**Chi tiết sản phẩm:**
- Mô tả chi tiết
- Kích thước (D × R × C)
- Giá vốn / Giá bán / Giá khuyến mãi
- Hình ảnh sản phẩm
- Thông số kỹ thuật

---

### 5. 🏢 **NHÀ CUNG CẤP (SUPPLIERS)**
**Đường dẫn:** `/owner/suppliers`

**Chức năng chính:**
- 📞 Quản lý thông tin nhà cung cấp
- 💰 Theo dõi công nợ nhà cung cấp
- 📊 Lịch sử mua hàng
- 📝 Cập nhật thông tin liên hệ

**Thông tin nhà cung cấp:**
- Tên đơn vị / Người đại diện
- Địa chỉ / ĐT / Email
- Mã số thuế
- Tài khoản ngân hàng
- Điều khoản thanh toán (COD, T/T, v.v.)

**Cột dữ liệu:**
| Tên NCC | Địa Chỉ | ĐT | Email | Công Nợ | Lần Mua Cuối |
|---------|--------|-----|-------|---------|-------------|

---

### 6. 👥 **NHÂN SỰ (EMPLOYEES)**
**Đường dẫn:** `/owner/employees`

**Chức năng chính:**
- 📋 Danh sách nhân viên
- ➕ Tuyển dụng nhân viên mới
- 📝 Cập nhật thông tin nhân viên
- 🔐 Quản lý tài khoản & quyền hạn
- 💰 Quản lý lương & thưởng
- 🔒 Khoá/mở tài khoản

**Phân loại nhân viên:**
- **Chủ cửa hàng** - Quyền toàn hệ thống
- **Kế toán** - Quản lý tài chính, lương
- **Bán hàng** - Tạo đơn, bán hàng
- **Sản xuất** - Thực hiện sản xuất
- **Quản lý kho** - Nhập xuất tồn

**Thông tin nhân viên:**
| Tên | ĐT | Email | Chức Vụ | Lương | Trạng Thái |
|-----|-----|-------|---------|--------|-----------|

**Chi tiết:**
- Mã nhân viên / Tên đầy đủ
- Chức vụ / Phòng ban
- Lương cơ bản / Phụ cấp / Thưởng
- Ngày vào làm / Ngày sinh
- Tài khoản ngân hàng
- Tài khoản hệ thống (username/email)

---

### 7. 📊 **BÁO CÁO (REPORTS)**
**Đường dẫn:** `/owner/reports`

**Chức năng chính:**
- 📈 Báo cáo bán hàng (Doanh thu & Lãi gộp)
- 📦 Báo cáo xuất nhập tồn kho
- 💳 Báo cáo công nợ khách hàng
- 🏢 Báo cáo công nợ nhà cung cấp
- 💰 Báo cáo sổ quỹ thu chi

**Báo Cáo Bán Hàng:**
- Doanh thu theo ngày/tháng/năm
- Chiết khấu / Hoa hồng bán hàng
- Doanh thu thực tế (sau giảm giá)
- Chi phí bán hàng (COGS)
- Lợi nhuận gộp / Tỷ suất lợi nhuận

| Mã ĐH | Ngày | KH | Doanh Thu Tổng | Chiết Khấu | Doanh Thu Thực | Chi Phí | Lợi Nhuận |
|-------|------|-----|----------------|-----------|----------------|---------|-----------|

**Báo Cáo Xuất Nhập Tồn:**
- Tồn kho đầu kỳ
- Nhập kho từ NCC / Sản xuất
- Phát hàng / Bán hàng
- Tồn kho cuối kỳ
- Giá trị hàng tồn kho

**Báo Cáo Công Nợ:**
- Công nợ phát sinh trong kỳ
- Thanh toán trong kỳ
- Dư nợ cuối kỳ
- Quá hạn thanh toán

**Báo Cáo Sổ Quỹ:**
- Thu tiền (bán hàng, hoàn lại, v.v.)
- Chi tiền (mua hàng, chi phí, lương, v.v.)
- Số dư tiền mặt / Tiền ngân hàng
- Tài khoản được sử dụng

**Tính năng bổ sung:**
- 📅 Chọn khoảng thời gian
- 🔍 Tìm kiếm theo khách hàng/sản phẩm
- 📥 Xuất Excel / PDF
- 🖨️ In báo cáo
- 📊 Các biểu đồ và đồ thị

---

### 8. 📝 **NHẬT KÝ HỆ THỐNG (SYSTEM LOGS)**
**Đường dẫn:** `/owner/system-logs`

**Chức năng chính:**
- 📋 Lịch sử tất cả hoạt động trong hệ thống
- 🔍 Tìm kiếm theo người dùng / hành động / thời gian
- 📊 Theo dõi ai đã làm gì khi nào
- 🔐 Kiểm soát & bảo mật dữ liệu

**Loại hành động ghi log:**
- ✏️ Tạo / Sửa / Xóa đơn hàng
- 📦 Tạo / Sửa sản phẩm
- 💰 Cập nhật giá / Chiết khấu
- 👤 Tạo / Sửa nhân viên
- 🔐 Đăng nhập / Đổi mật khẩu
- 📊 Xuất báo cáo

**Cột dữ liệu:**
| Thời Gian | Người Dùng | Hành Động | Đối Tượng | Chi Tiết |
|----------|-----------|----------|----------|----------|

**Ví dụ log:**
```
14:05 - Võ Cường - Tạo đơn hàng - ĐH2603-0009 - Khách: Đinh Quang Hiếu
14:10 - Võ Cường - Sửa giá sản phẩm - SP_001 - Từ 5.0M → 4.8M
14:15 - Trần Thảo - Gán công việc sản xuất - Job_023 - Gán cho Tân
```

---

## 🔄 Luồng Công Việc Chính

```
┌─────────────────────────────────────────────────────┐
│   1. ĐƠN HÀNG MỚI (Dashboard → Orders)              │
│      Khách đặt hàng → Chủ tạo đơn hàng               │
€─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│   2. KIỂM TRA HÀNG (Products)                        │
│      Có hàng sẵn? → Giao ngay                        │
└─────────────────────────────────────────────────────┘
                    ↓
        ┌───────────┴──────────┐
        ↓                      ↓
    CÓ HÀNG SẴN        CHƯA CÓ (Tùy chỉnh)
        │                      │
        ↓                      ↓
   CHUẨN BỊ GỬI      ┌─ TẠOPHƯƠNG CÔNG VIỆC SX
        │            │     (Production)
        │            │
        │            ↓
        │      GIAO VIỆC CHO NHÂN VIÊN
        │      (Employees)
        │            │
        │            ↓
        │      ✅ HOÀN THÀNH SX
        │
        ├────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│   3. GIAO HÀNG & THANH TOÁN (Orders)                │
│      Cập nhật trạng thái → Giao hàng thành công      │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│   4. QUẢN LÝ TÀI CHÍNH (Reports)                    │
│      Xem doanh thu, lợi nhuận, công nợ              │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Tính Năng Chung Trong Mọi Giao Diện

### Công Cụ Tìm Kiếm & Lọc
- 🔍 **Tìm kiếm:** Nhập từ khóa trong thanh tìm kiếm
- 🏷️ **Lọc:** Theo trạng thái, danh mục, loại, ngày tháng
- 📊 **Sắp xếp:** Theo tên, ngày, giá, v.v.

### Phân Trang
- ⬅️ ➡️ Điều hướng giữa các trang
- `Page X/Y` - Hiển thị vị trí hiện tại
- Chọn số kết quả hiển thị (10, 20, 50, 100)

### Hành Động Người Dùng
- ➕ **Thêm mới** - Tạo bản ghi mới
- ✏️ **Sửa** - Chỉnh sửa thông tin
- 👁️ **Xem chi tiết** - Mở trang chi tiết
- 🗑️ **Xóa** - Gỡ bỏ bản ghi
- 📥 **Xuất** - Tải xuống Excel/PDF

### Thông Báo
- ✅ **Thành công** - Lưu thành công, thêm thành công
- ⚠️ **Cảnh báo** - Cần kiểm tra lại
- ❌ **Lỗi** - Có gì đó không đúng

---

## 💡 Hướng Dẫn Thao Tác Nhanh

### Tạo Đơn Hàng Mới
```
1. Vào: Đơn Hàng (Orders)
2. Nhấn: Thêm Đơn Hàng
3. Nhập: Tên khách, ĐT, sản phẩm, số lượng
4. Lưu: Nhấn Lưu → ✅ Xong
```

### Tạo Công Việc Sản Xuất
```
1. Vào: Quản Lý Sản Xuất (Production)
2. Nhấn: Công Việc Mới
3. Chọn: Sản phẩm + Số lượng
4. Gán: Nhân viên sản xuất
5. Lưu: → Nhân viên bắt đầu làm
```

### Cập Nhật Giá Sản Phẩm
```
1. Vào: Sản Phẩm (Products)
2. Tìm: Sản phẩm cần sửa
3. Nhấn: Sửa (✏️)
4. Đổi: Giá bán → Lưu → ✅
```

### Xem Báo Cáo Doanh Thu
```
1. Vào: Báo Cáo (Reports)
2. Chọn: Báo Cáo Bán Hàng
3. Chọn: Khoảng thời gian (từ ngày - đến ngày)
4. Xem: Doanh thu, lợi nhuận, v.v.
5. Xuất: Excel/PDF để lưu trữ
```

---

## 🔑 Quyền Hạn Chủ Cửa Hàng

✅ **Có thể làm:**
- Xem tất cả thông tin
- **Phê duyệt / Từ chối đơn hàng** (Sales tạo)
- **Phê duyệt giao hàng** (khi hàng sẵn sàng)
- Tạo / Sửa / Xóa sản phẩm và giá
- Tạo / Sửa công việc sản xuất
- Gán công việc sản xuất cho nhân viên
- Quản lý nhân viên (tuyển, sửa, xóa)
- Xem báo cáo tài chính
- Xuất báo cáo
- Thay đổi thông tin cá nhân (avatar, mật khẩu)

❌ **Không thể làm:**
- **KHÔNG tạo đơn hàng** (Sales tạo, chủ chỉ phê duyệt)
- Xóa nhân viên đang có công việc
- Xóa sản phẩm trong đơn hàng chưa xong
- Thay đổi quyền hạn hệ thống
- Truy cập cơ sở dữ liệu trực tiếp

---

## ⚡ Bắt Đầu Nhanh

| Mục Tiêu | Đường Dẫn | Nút Cần Nhấn |
|---------|----------|------------|
| Xem tổng quan kinh doanh | `/owner/dashboard` | - |
| Phê duyệt đơn hàng mới | `/owner/orders` | `✅ APPROVE` |
| Phê duyệt giao hàng | `/owner/orders` | `✅ APPROVE GIAO` |
| Gán công việc sản xuất | `/owner/production` | `+ Công Việc Mới` |
| Cập nhật giá sản phẩm | `/owner/products` | `✏️ Sửa` |
| Xem công nợ | `/owner/reports` | Chọn báo cáo công nợ |
| Thêm nhân viên | `/owner/employees` | `+ Thêm Nhân Viên` |
| Kiểm tra nhà cung cấp | `/owner/suppliers` | Tìm kiếm nhà cung cấp |
| Xem lịch sử hệ thống | `/owner/system-logs` | Xem nhật ký |

---

## 📌 Ghi Chú Quan Trọng

1. **Dữ liệu tĩnh:** Hiện tại các giao diện đang sử dụng dữ liệu mẫu (static data). Trong tương lai sẽ kết nối với API thực.

2. **Phân quyền:** Chủ cửa hàng có toàn quyền quản lý. Các nhân viên khác sẽ có quyền hạn khác nhau.

3. **Backup dữ liệu:** Nên xuất báo cáo định kỳ để sao lưu.

4. **Hỗ trợ:** Liên hệ quản trị viên nếu gặp lỗi hoặc cần hỗ trợ.

---

**📅 Cập nhật lần cuối:** 09/03/2026  
**👨‍💼 Dành cho:** Chủ cửa hàng nội thất gỗ  
**📞 Liên hệ:** Bộ phận IT hỗ trợ
