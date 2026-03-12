# Sơ Đồ & Biểu Đồ Giao Diện Chủ Cửa Hàng

## 1️⃣ Sơ Đồ Cấu Trúc Điều Hướng

```
┌────────────────────────────────────────────────────┐
│              NAVBAR (Header)                       │
│  Logo | Tìm Kiếm | Thông Báo | Hồ Sơ | Đăng Xuất  │
└────────────────────────────────────────────────────┘
        │
        ├─ SIDEBAR (Menu Trái)
        │  ├─ 🏠 Tổng Quan
        │  ├─ 📋 Đơn Hàng
        │  ├─ 🏭 Sản Xuất
        │  ├─ 📦 Sản Phẩm
        │  ├─ 🏢 Nhà Cung Cấp
        │  ├─ 👥 Nhân Sự
        │  ├─ 📊 Báo Cáo
        │  └─ 📝 Nhật Ký
        │
        └─ MAIN CONTENT (Nội Dung Chính)
           ├─ Tiêu đề trang
           ├─ Công cụ (Tìm kiếm, Lọc, Thêm)
           ├─ Danh sách / Biểu đồ / Form
           └─ Phân trang

```

---

## 2️⃣ Sơ Đồ Quản Lý Đơn Hàng

```
                    KHÁCH HÀNG ĐẶT ĐƠN
                          │
                          ↓
                  ┌───────────────────┐
                  │  TẠOƠN HÀNG      │
                  │  (Create Order)   │
                  └───────────────────┘
                          │
                          ↓
        ┌─────────────────────────────────────┐
        │   CHỮ CẬP NHẬT TRẠNG THÁI ĐƠN    │
        │                                     │
        ├─ 🟡 CHỜXÁC NHẬN                     │
        │  └─ Chủ/Kế Toán: Kiểm tra & xác nhận│
        │                                     │
        ├─ 🟠 ĐANG CHUẨN BỊ                   │
        │  └─ Kiểm tra hàng/Tạo công việc SX │
        │                                     │
        ├─ 🔵 ĐÃ CHUẨN BỊ                     │
        │  └─ Sẵn sàng giao cho khách         │
        │                                     │
        ├─ 🟢 GIAO HÀNG THÀNH C01            │
        │  └─ Giao xong, khách nhận hàng      │
        │                                     │
        └─ 🔴 ĐÃ HỦY                         │
           └─ Khách hoặc chủ hủy đơn         │
```

---

## 3️⃣ Sơ Đồ Quản Lý Sản Xuất

```
                    ĐƠN HÀNG TÙYCHỈNH
                          │
                          ↓
                  ┌──────────────────┐
                  │ TẠOCÔNG VIỆC SX  │
                  │ (Create Job)     │
                  └──────────────────┘
                          │
                          ↓
        ┌────────────────────────────────────┐
        │   CÁC BƯỚC SẢN XUẤT               │
        │                                    │
        ├─ 🟡 CHƯA BẮT ĐẦU                  │
        │  ├─ Gán nhân viên
        │  └─ Chuẩn bị vật liệu
        │                                    │
        ├─ 🟠 ĐANG THỰC HIỆN                │
        │  ├─ Nhân viên: Thực hiện
        │  └─ Chủ: Theo dõi tiến độ
        │                                    │
        ├─ 🟢 HOÀN THÀNH                    │
        │  └─ Kiểm tra chất lượng
        │                                    │
        └─ 🔴 CÓ VẤN ĐỀ                     │
           └─ Cảnh báo, yêu cầu sửa
```

---

## 4️⃣ Sơ Đồ Quản Lý Sản Phẩm & Giá

```
        ┌─────────────────────────────────────┐
        │     DANH SÁCH SẢN PHẨM              │
        │  (Tìm kiếm, Lọc theo danh mục)     │
        └─────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │  THÊMSẢN│       │ XEMSN  │       │ SỬASN  │
   │  PHẨM   │       │ CHI TIẾT│       │  /GIÁ  │
   │  MỚI    │       │         │       │         │
   └─────────┘       └─────────┘       └─────────┘
        │                 │                 │
        ↓                 ↓                 ↓
   ┌─────────────────────────────────────────────┐
   │  THÔNG TIN SẢN PHẨM                        │
   │                                             │
   │  • Mã sản phẩm                             │
   │  • Tên sản phẩm                            │
   │  • Danh mục (Ghế, Bàn, Giường, ...)       │
   │  • Loại gỗ (Sồi, Cối, Teak, ...)         │
   │  • Kích thước (D × R × C)                 │
   │  • Hình ảnh                                │
   │  • Giá vốn (Chi phí)                      │
   │  • Giá bán                                 │
   │  • Lợi nhuận = Giá bán - Giá vốn         │
   │  • Trạng thái (Hoạt động / Hết hàng)     │
   │                                             │
   └─────────────────────────────────────────────┘
```

---

## 5️⃣ Sơ Đồ Quản Lý Nhân Viên & Lương

```
                    QUẢN LÝ NHÂN VIÊN
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   ┌────────┐         ┌────────┐        ┌────────┐
   │ THÊM   │         │ QUẢN LÝ│        │ LƯƠNG &│
   │ NHÂN   │         │ QUYỀN  │        │ THƯỞNG │
   │ VIÊN   │         │ HẠN    │        │        │
   └────────┘         └────────┘        └────────┘

        PHÂN LOẠI NHÂN VIÊN:
        
        ┌──────────────────────────────────────┐
        │ 👨‍💼 Chủ Cửa Hàng (Owner)              │
        │  └─ Quyền: Toàn hệ thống             │
        │                                      │
        │ 📊 Kế Toán (Accountant)              │
        │  └─ Quyền: Quản lý tài chính, lương │
        │                                      │
        │ 💼 Bán Hàng (Sales)                  │
        │  └─ Quyền: Tạo ĐH, bán hàng         │
        │                                      │
        │ 🔨 Sản Xuất (Production)             │
        │  └─ Quyền: Thực hiện công việc      │
        │                                      │
        │ 📦 Quản Lý Kho (Warehouse)           │
        │  └─ Quyền: Nhập xuất, kiểm kho      │
        └──────────────────────────────────────┘

        LƯƠNG & THƯỞNG:
        
        ┌──────────────────────────────────────┐
        │ Lương Cơ Bản                         │
        │ + Phụ Cấp (Độc hương, KN, ...)      │
        │ + Thưởng (Hạn chế, KPI, ...)        │
        │ - Bảo hiểm xã hội                   │
        │ = Lương Thực Nhận                    │
        └──────────────────────────────────────┘
```

---

## 6️⃣ Sơ Đồ Báo Cáo Tài Chính

```
                      BÁO CÁO
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    ┌─────────┐     ┌──────────┐   ┌──────────┐
    │ BÁO CÁO │     │ BÁO CÁO  │   │ BÁO CÁO  │
    │ BÁN     │     │ XNT KHO  │   │ CÔNG NỢ  │
    │ HÀNG    │     │ (Tồn KHO)│   │ (Công NỢ)│
    └─────────┘     └──────────┘   └──────────┘
        │               │               │
        ↓               ↓               ↓
    ┌─────────┐     ┌──────────┐   ┌──────────┐
    │ DOANH THU│     │ NHẬP KHO │   │ KHÁCH H. │
    │ GIẢM GIÁ │     │ PHÁT KHO │   │ NHÀ CC   │
    │ LỢI NHUẬN│     │ DƯ TỒNKHO│   │ DƯNỢ    │
    └─────────┘     └──────────┘   └──────────┘

        PH           │           │
        ├─ 🟡 Báo Cáo Sổ Quỹ Thu Chi
        │  └─ Thu tiền / Chi tiền / Dư nợ
        │
        └─ 🟠 Báo Cáo Tùy Chỉnh
           └─ Lọc theo thời gian, khách hàng, sản phẩm
```

---

## 7️⃣ Sơ Đồ Dòng Tiền

```
                        THU TIỀN
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
    ┌────────┐        ┌────────┐      ┌────────┐
    │ BÁNHÀNG│        │ HOÀN LẠI│      │ KHÁCAC │
    │ CASH   │        │ HÀNG    │      │ KHOẢN  │
    └────────┘        └────────┘      └────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                          ↓
                    ┌──────────────┐
                    │ TIỀN MẶT TÀI│
                    │ KHOẢN TM     │
                    └──────────────┘
                          │
                          ├─ TIỀN MẶTĐƠN VỊ
                          ├─ TIỀN NGÂN HÀNG
                          └─ TÍNH TỒN NGÀY

                        CHI TIỀN
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
    ┌────────┐        ┌────────┐      ┌────────┐
    │ MUAHÀNG│        │ TRẢLƯƠNG│      │ CHI PHÍ │
    │ NCC    │        │ NHÂN VIÊN│      │ KHÁC   │
    └────────┘        └────────┘      └────────┘
```

---

## 8️⃣ Sơ Đồ Quy Trình Nghiệp Vụ (Business Flow)

```
┌─────────────────────────────────────────────────────────┐
│  NGÀY 1: ĐƠN HÀ NGĐẦU TIÊN                              │
└─────────────────────────────────────────────────────────┘

        SÁNG: KHÁCH GỌI ĐẶT HÀNG
        │
        ├─ Chủ cửa hàng LẤY THÔNG TIN (Orders)
        │  • Tên khách / ĐT / Địa chỉ
        │  • Sản phẩm cần / Số lượng
        │  • Đặc biệt yêu cầu
        │
        └─ TẠOCƠ HÀ MỚI (Create Order)
           ├─ Chọn loại: Hàng sẵn / Tùy chỉnh
           └─ Lưu ✅

        TRƯA: QUẢN LÝ HÀNG
        │
        ├─ Kiểm tra: Có HÀ sẵn không? (Inventory)
        │
        ├─ NẾU CÓ: Cập nhật trạng thái
        │  └─ 🟠 ĐANG CHUẨN BỊ → Chuẩn bị gói
        │
        └─ NẾU CHƯA: Tạo công việc sản xuất

        CHIỀU: SẢN XUẤT
        │
        ├─ TẠO CÔNG VIỆC (Production)
        │  • Sản phẩm / Số lượng
        │  • Ngày dự kiến hoàn thành
        │
        └─ GÁN CHO NHÂN VIÊN (Employees)
           • Chọn nhân viên
           • Cung cấp vật liệu
           • Ghi chú yêu cầu

┌─────────────────────────────────────────────────────────┐
│  NGÀY 2-3: NHÂN VIÊN THỰC HIỆN                          │
└─────────────────────────────────────────────────────────┘

        ✅ HOÀN THÀNH CÔNG VIỆC SX
        │
        └─ CẬP NHẬT SỐ TRẠNG THÁI: 🟢 HOÀN THÀNH
           └─ Chủ kiểm tra chất lượng

┌─────────────────────────────────────────────────────────┐
│  NGÀY 4: GIAO HÀNG & THANH TOÁN                         │
└─────────────────────────────────────────────────────────┘

        ✅ GIAO HÀNG CHO KHÁCH
        │
        ├─ Cập nhật ĐH: 🟢 GIAO HÀNG THÀNH CÔNG
        ├─ GHI CHÚ: Khách đã ký nhận
        └─ THANH TOÁN: Giải quyết công nợ

        📊 NHẬP DỮ LIỆU VÀO BÁO CÁO
        │
        ├─ Báo Cáo Bán Hàng
        │  └─ Doanh thu +1 đơn hàng
        │
        ├─ Báo Cáo XNT
        │  └─ Phát hàng -SL sản phẩm
        │
        └─ Sổ Quỹ
           └─ Thu tiền khách


```

---

## 9️⃣ Sơ Đồ Tương Tác Dữ Liệu

```
           OWNER DASHBOARD
                  │
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
ORDERS      PRODUCTION      PRODUCTS
  ││          ││              ││
  ││          ││              ││
  ││          ││              ││ ← Tồn kho
  ││          ││              ││
  └┼──────────┼┘              │
    │         │               │
    ├─────────┴───────────────┤
    │                         │
    ↓                         ↓
INVENTORY               SUPPLIERS
             │
             ├─→ EMPLOYEES (Gán việc)
             │
             └─→ SYSTEM LOGS (Ghi lại)

OUTPUT: REPORTS
├─ Doanh thu = Sum(Orders.total)
├─ Lợi nhuận = Sum(Orders.total - Orders.cogs)
├─ Tồn kho = Sum(Products.quantity)
├─ Công nợ = Sum(Outstanding_payments)
└─ Lương = Sum(Salary_employee)
```

---

## 🔟 Bảng So Sánh Các Ging

```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│  Tính Năng  │  Orders      │   Products   │  Employees   │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ Tạo Mới     │ ✅ Có        │ ✅ Có        │ ✅ Có        │
│ Tìm Kiếm    │ ✅ Có        │ ✅ Có        │ ✅ Có        │
│ Lọc         │ ✅ Có        │ ✅ Có        │ ✅ Có        │
│ Sửa         │ ✅ Có        │ ✅ Có        │ ✅ Có        │
│ Xóa         │ ⚠️ Hạn chế   │ ⚠️ Hạn chế   │ ⚠️ Hạn chế   │
│ Xuất Excel  │ ✅ Có        │ ✅ Có        │ ✅ Có        │
│ Chi Tiết    │ ✅ Có        │ ✅ Có        │ ✅ Có        │
│ Phân Trang  │ ✅ Có        │ ✅ Có        │ ✅ Có        │
│ Lồng ghép   │ ⚠️ Toàn bộ   │ ⚠️ Có        │ ⚫ Tối liệu  │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

---

**🎨 Hình Ảnh Giao Diện Tham Khảo:**
- Thanh Navbar: Cố định ở trên cùng
- Sidebar: Cố định bên trái, có thể thu gọn
- Nội dung chính: Cuộn dọc khi cần
- Màu sắc chủ đe: Xanh dương (#0066CC)

---

**📝 Tài Liệu Bổ Sung:**
- [owner-interface-guide.md](owner-interface-guide.md) - Hướng dẫn chi tiết từng giao diện
