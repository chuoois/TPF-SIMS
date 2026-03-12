# 🆕 Tóm Tắt Hệ Thống TPFSIMS Dành Cho Chủ Cửa Hàng

## 📌 Giới Thiệu Nhanh

Hệ thống **TPFSIMS** (Tool Management System for Furniture Shop) là một nền tảng toàn diện giúp bạn quản lý kinh doanh nội thất gỗ một cách hiệu quả. Từ bán hàng, sản xuất, đến tài chính - tất cả đều tập trung ở một chỗ.

---

## 🎯 3 Lợi Ích Chính

### 1. 💼 Quản Lý Toàn Bộ Kinh Doanh
- Từ lấy đơn hàng đến giao hàng & thanh toán
- Rõ ràng ai làm gì, cái gì bao làm xong
- Không bỏ sót khách nào

### 2. 📊 Kiểm Soát Tài Chính
- Xem doanh thu & lợi nhuận real-time
- Biết công nợ khách hàng & nhà cung cấp
- Quản lý lương nhân viên dễ dàng

### 3. 👥 Quản Lý Nhân Sự Hiệu Quả
- Phân công công việc rõ ràng
- Theo dõi tiến độ sản xuất
- Đánh giá hiệu suất từng người

---

## 🗂️ 8 Mục Chính + Công Dụng

```
┌────────────────────────────────────────────────────┐
│ 1. TỔNG QUAN (Dashboard)                           │
│    → Xem tổng quát kinh doanh hôm nay              │
│    → Doanh thu, đơn hàng, sản xuất, cảnh báo      │
│                                                     │
│ 2. ĐƠN HÀNG (Orders)                              │
│    → Tạo & quản lý bán hàng                       │
│    → Track trạng thái giao hàng                    │
│                                                     │
│ 3. QUẢN LÝ SẢN XUẤT (Production)                 │
│    → Gán công việc cho nhân viên                   │
│    → Theo dõi tiến độ & chất lượng                │
│                                                     │
│ 4. SẢN PHẨM (Products)                            │
│    → Lưu danh sách & tin sản phẩm                │
│    → Cập nhật giá & tồn kho                       │
│                                                     │
│ 5. NHÀ CUNG CẤP (Suppliers)                        │
│    → Quản lý thông tin & công nợ                  │
│    → Theo dõi chất lượng & giá                     │
│                                                     │
│ 6. NHÂN SỰ (Employees)                            │
│    → Tuyển dụng & quản lý nhân viên               │
│    → Tính lương & thưởng                          │
│                                                     │
│ 7. BÁO CÁO (Reports)                              │
│    → Báo cáo bán hàng & lợi nhuận                │
│    → Báo cáo kho & công nợ                        │
│                                                     │
│ 8. NHẬT KÝ HỆ THỐNG (System Logs)                │
│    → Xem lịch sử hoạt động tất cả mọi người      │
│    → Kiểm soát & đảm bảo an toàn dữ liệu         │
└────────────────────────────────────────────────────┘
```

---

## 🔄 Qui Trình Kinh Doanh Hằng Ngày

### Bước 1️⃣: NHÂN VIÊN SALES TẠO ĐƠN (9:00)
**Khách hàng gọi hoặc đến để đặt hàng - SALES xử lý**
- Nhân viên Sales ghi lại thông tin khách
- Sales tạo Đơn Hàng mới trong hệ thống
- Sales xác định loại: **Hàng sẵn** hay **Tùy chỉnh?**
- **Chủ cửa hàng nhận thông báo & phê duyệt**

```
Ví dụ:
Khách: Đinh Quang Hiếu
- ĐT: 0989012345
- Sản phẩm: Bàn gỗ sồi 1.2m
- Số lượng: 1
- Giá: 5,000,000 VNĐ
```

### Bước 2️⃣: CHỦ PHÊ DUYỆT & KIỂM TRA HÀNG (10:00)
**Chủ cửa hàng xem xét & phê duyệt đơn hàng**

- Chủ vào **Dashboard** hoặc **Orders** xem đơn mới
- Chủ phê duyệt: ✅ APPROVED hoặc ❌ REJECT
- Hệ thống tự động kiểm tra tồn kho

- **NẾU CÓ HÀNG SẴN:**
  - Sales cập nhật ĐH: 🟠 ĐANG CHUẨN BỊ
  - Bộ phận bán hàng: Lấy hàng, kiểm tra & gói
  
- **NẾU CHƯA CÓ (Tùy chỉnh):**
  - Chủ hoặc Sales tạo CÔNG VIỆC SẢN XUẤT
  - Ghi yêu cầu (kích thước, màu, v.v.)
  - Chủ xem xét & chấp thuận công việc

### Bước 3️⃣: SẢN XUẤT (11:00-14:00)
**Nhân viên thực hiện công việc - Chủ theo dõi**

- Nhân viên nhận công việc từ hệ thống
- Chuẩn bị vật liệu (gỗ, sơn, v.v.)
- Thực hiện sản xuất theo tiêu chuẩn
- Cập nhật tiến độ: 🟡 → 🟠 → 🟢
- **Chủ theo dõi tiến độ trên Dashboard**

### Bước 4️⃣: GIAO HÀNG & CHỦ PHÊ DUYỆT (15:00-17:00)
**Hàng sẵn sàng, chủ duyệt, giao cho khách**

- Sales/Kho kiểm tra chất lượng cuối cùng
- Sales cập nhật: ĐH sẵn giao → Chủ xem xét
- **Chủ phê duyệt**: ✅ GỬI HÀNG → 🟢 GIAO THÀNH CÔNG
- Ghi chú: Khách ký nhận

### Bước 5️⃣: THANH TOÁN (17:00)
**Xử lý thanh toán & cập nhật tài chính**

- Khách thanh toán (Cash hoặc chuyển ngân)
- Cập nhật công nợ
- Báo cáo tùy khóa Quỹ

---

## 💡 Ví Dụ Thực Tế: Đơn Hàng Chi Tiết

### Đơn Hàng #1: Hàng Sẵn (chỉ 2 giờ)
```
Khách: Nguyễn Văn A
- Sản phẩm: Ghế sofa 2 chỗ
- Số lượng: 2
- Giá: 8,000,000 VNĐ

TIMELINE:
09:00 - Khách gọi, Sales tạo ĐH (ĐH-2603-001) → Chủ nhận thông báo
09:15 - Chủ phê duyệt: ✅ APPROVED
09:30 - Kiểm tra hàng: ✅ Có từ trong kho
10:00 - Nhân viên lấy hàng, kiểm tra, gói → Sales cập nhật: 🟠 SẴN BỊ GIAO
10:30 - Chủ xem hàng & phê duyệt giao
14:00 - Khách đến lấy → Cập nhật: 🟢 THÀNH CÔNG
14:15 - Thanh toán xong
```
📊 **Kết quả:** Doanh thu + 8,000,000 VNĐ, Lợi nhuận + 3,200,000 VNĐ (40%)

### Đơn Hàng #2: Tùy Chỉnh (3-5 ngày)
```
Khách: Trần Thị B
- Sản phẩm: Tủ gỗ teak theo yêu cầu (2.5m × 2.2m)
- Số lượng: 1
- Giá: 25,000,000 VNĐ | Yêu cầu: Sơn mầu nâu, gỗ teak cao cấp

TIMELINE:
09:00 - Khách đến, thảo luận chi tiết với Sales
09:30 - Sales tạo ĐH + Ghi yêu cầu → Chủ nhận thông báo
09:45 - Chủ xem xét & phê duyệt: ✅ APPROVED
10:00 - Chủ tạo Công việc SX / Gán cho nhân viên sản xuất Tân
11:00 - Tân chuẩn bị vật liệu: Gỗ teak, sơn, v.v. → Cập nhật: 🟡 CHƯA BẮT ĐẦU
Ngày 2: Tân bắt đầu → Cập nhật: 🟠 ĐANG THỰC HIỆN → Chủ xem tiến độ
Ngày 3: Tân hoàn → Reported: 🟢 HOÀN THÀNH → Chủ kiểm tra chất lượng
Ngày 4: Khách kiểm tra hàng → Chủ phê duyệt: ✅ GỬI HÀNG → 🟢 THÀNH CÔNG
```
📊 **Kết quả:** Doanh thu + 25,000,000 VNĐ, Lợi nhuận + 10,000,000 VNĐ (40%)

---

## 📱 Giao Diện Chính

### Dashboard - Xem Nhanh Tình Hình & Các Đơn Cần Phê Duyệt
```
┌──────────────────────────────────────────────┐
│ 🏠 TỔNG QUAN - 09/03/2026                     │
├──────────────────────────────────────────────┤
│                                              │
│  💰 Doanh Thu Hôm Nay: 45,000,000 VNĐ       │
│  📈 Lợi Nhuận Hôm Nay: 18,000,000 VNĐ       │
│  📋 ĐƠN HÀNG CHỜ PHÊ DUYỆT: 5 ⭕           │
│  ✅ Đã Phê Duyệt: 8                         │
│  🟠 Đang Sản Xuất: 3                        │
│  🟢 Sẵn Giao Chờ PHÊ DUYỆT: 2 ⭕           │
│                                              │
│  [Biểu đồ Doanh Số] [Biểu đồ Lợi Nhuận]    │
│  [Danh Sách Đơn Cần Phê Duyệt]              │
│  [Công Việc SX Đang Làm]                    │
│                                              │
└──────────────────────────────────────────────┘
```

### Orders - Danh Sách Đơn Hàng
```
┌─────────────────────────────────────────────────┐
│ 📋 ĐƠN HÀNG - Tìm kiếm... | [+ THÊM]           │
├─────────────────────────────────────────────────┤
│ ID  │ Mã ĐH│ Khách   │ SL │ Giá    │ Trạng Thái │
├─────────────────────────────────────────────────┤
│  1  │DH-001│Nguyễn A│ 2  │8,000K  │🟢nh Công  │
│  2  │DH-002│Trần B  │ 1  │25,000K │🟠Chuẩn Bị │
│  3  │DH-003│Phan C  │ 3  │15,000K │🟡Chờ Xác  │
│  4  │DH-004│Vũ D    │ 1  │5,000K  │🟢 Th Công │
│  5  │DH-005│Đinh E  │ 2  │12,000K │🔴Đã Hủy  │
└─────────────────────────────────────────────────┘
```

---

## 🎓 Cách Sử Dụng Từng Giao Diện (Chủ Cửa Hàng)

### 1️⃣ Dashboard (Tổng Quan)
**Dùng để:** Xem tình hình kinh doanh & các đơn hàng cần phê duyệt
- 📊 Biểu đồ doanh số
- 📈 Lợi nhuận
- 📋 Đơn hàng mới chờ phê duyệt ⭕
- 📋 Đơn hàng sẵn giao chờ phê duyệt ⭕
- ⚠️ Cảnh báo

### 2️⃣ Orders (Đơn Hàng) - THEO DÕI & PHÊ DUYỆT
**Dùng để:** Theo dõi & phê duyệt các đơn hàng (Sales tạo)
- 🔍 Tìm kiếm đơn
- 👁️ Xem chi tiết
- ✅ Phê duyệt ĐH mới (từ trạng thái chờ xác nhận)
- ✅ Phê duyệt giao hàng (khi hàng sẵn sàng)
- 📊 Xem trạng thái từng đơn

### 3️⃣ Production (Sản Xuất)
**Dùng để:** Gán & theo dõi công việc sản xuất
- ➕ Tạo công việc
- 🧑‍🔧 Gán nhân viên
- 📊 Theo dõi tiến độ
- ✅ Đánh dấu hoàn thành

### 4️⃣ Products (Sản Phẩm)
**Dùng để:** Quản lý danh mục sản phẩm & giá
- 📦 Danh sách sản phẩm
- ➕ Thêm sản phẩm
- 💰 Cập nhật giá
- 📊 Xem tồn kho

### 5️⃣ Suppliers (Nhà Cung Cấp)
**Dùng để:** Quản lý thông tin & công nợ nhà cung cấp
- 📋 Danh sách NCC
- 💳 Công nợ
- 📞 Thông tin liên hệ

### 6️⃣ Employees (Nhân Sự)
**Dùng để:** Quản lý thông tin & lương nhân viên
- 👥 Danh sách nhân viên
- ➕ Tuyển nhân viên
- 💰 Quản lý lương
- 🔐 Cài đặt quyền hạn

### 7️⃣ Reports (Báo Cáo)
**Dùng để:** Phân tích tài chính & kinh doanh
- 📈 Báo cáo bán hàng
- 📦 Báo cáo kho
- 💳 Báo cáo công nợ
- 💰 Báo cáo quỹ

### 8️⃣ System Logs (Nhật Ký)
**Dùng để:** Kiểm soát & xem lịch sử hoạt động
- 👤 Ai đã làm gì
- 🕐 Khi nào
- 📋 Chi tiết hành động

---

## 🎯 Best Practices (Thực Hành Tốt)

### ✅ Nên Làm
```
1. ✓ Phê duyệt ĐH ngay sau khi Sales tạo
   → Hạn chế thời gian chờ đợi

2. ✓ Kiểm tra tồn kho trước khi phê duyệt
   → Chuẩn bị hàng sẵn hoặc sinh công việc SX

3. ✓ Theo dõi tiến độ sản xuất hàng ngày
   → Kịp thời xử lý vấn đề nếu có

4. ✓ Phê duyệt giao hàng khi xác nhận chất lượng
   → Giảm thời gian giao hàng

5. ✓ Theo dõi công nợ định kỳ
   → Thu tiền đúng hạn

6. ✓ Sao lưu báo cáo hàng tháng
   → Tránh mất dữ liệu quan trọng

7. ✓ Họp nhân viên tuần 1 lần
   → Giải quyết vấn đề kịp thời
```

### ❌ Không Nên Làm
```
1. ✗ Không phê duyệt ĐH kịp thời
   → Sales không biết được bán, khách mất tín tưởng

2. ✗ Không phê duyệt giao hàng khi sẵn sàng
   → Khách chờ lâu, hàng nằm trong kho

3. ✗ Không cập nhật tình trạng công việc SX
   → Không biết hàng xong chưa, giao muộn

4. ✗ Không kiểm tra chất lượng sản phẩm
   → Khách phàn nàn, ảnh hưởng danh tiếng

5. ✗ Không theo dõi công nợ
   → Tiền chẳng bao giờ thu được

6. ✗ Không xuất báo cáo định kỳ
   → Không biết kinh doanh ra sao

7. ✗ Không sao lưu dữ liệu
   → Lỡ mất dữ liệu, mất tiền mất dữ liệu
```

---

## 🚀 Lợi Ích Khi Dùng Hệ Thống

### Trước (Quản Lý Truyền Thống)
```
❌ Viết sổ tay, dễ quên
❌ Ai bán bao nhiêu không rõ
❌ Lãi hay lỗ mới tính được khi cuối tháng
❌ Khách nợ tiền không biết ai nợ bao nhiêu
❌ Nhân viên không biết phải làm gì
❌ Mất dữ liệu nếu có chuyện
❌ Báo cáo phải lập tay từ A → Z
```

### Sau (Dùng TPFSIMS)
```
✅ Tất cả dữ liệu ghi vào hệ thống
✅ Xem doanh số real-time
✅ Lợi nhuận tính ngay hàng ngày
✅ Biết chính xác ai nợ bao nhiêu
✅ Phân công rõ ràng, nhân viên biết làm gì
✅ Dữ liệu lưu trưu, không bao giờ mất
✅ Báo cáo được xuất trong 2 phút
✅ Kiểm soát toàn bộ kinh doanh
✅ Tiết kiệm thời gian & chi phí
✅ Tăng doanh số & lợi nhuận
```

---

## 📞 Hỗ Trợ & Liên Hệ

| Vấn Đề | Liên Hệ | Số ĐT |
|--------|--------|-------|
| Lỗi hệ thống | IT Support | +84 987 654 321 |
| Hỏi về nghiệp vụ | Quản lý bán hàng | +84 912 345 678 |
| Cấp quyền nhân viên | Admin | +84 901 234 567 |

---

## 📚 Tài Liệu Tham Khảo

1. **owner-interface-guide.md** - Hướng dẫn chi tiết từng giao diện
2. **owner-interface-diagrams.md** - Sơ đồ & biểu đồ minh họa
3. **owner-quick-reference.md** - Bản cheat sheet thao tác nhanh
4. **Tài liệu này** - Tóm tắt toàn bộ hệ thống

---

## 🎉 Kết Luận

Hệ thống TPFSIMS giúp bạn:
- 🎯 **Quản lý rõ ràng:** Mọi thứ ở một chỗ
- 📊 **Kiểm soát tài chính:** Doanh số & lợi nhuận real-time
- 👥 **Quản lý nhân viên:** Phân công & theo dõi hiệu quả
- 📈 **Tăng doanh số:** Không bỏ sót khách & công việc
- ⏰ **Tiết kiệm thời gian:** Khỏi viết sổ tay, tính toán thủ công
- 🔒 **Bảo mật dữ liệu:** Không bao giờ mất thông tin quan trọng

**Hãy bắt đầu ngay hôm nay! Đăng nhập vào hệ thống & bắt đầu quản lý!** 🚀

---

📅 **Cập nhật:** 09/03/2026  
👨‍💼 **Dành cho:** Chủ cửa hàng nội thất gỗ  
📝 **Phiên bản:** 1.0  
⭐ **Yêu cầu:** Đang hoạt động & sẵn sàng hỗ trợ
