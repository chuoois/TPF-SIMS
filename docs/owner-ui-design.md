# Thiết kế giao diện chi tiết – Màn hình Chủ cửa hàng (Owner)

Tài liệu mô tả layout, thành phần UI, bảng dữ liệu, filter, nút bấm và form cho từng màn hình.

---

## Nguyên tắc chung

- **Layout:** Trang có padding `p-6`, tiêu đề H1 + mô tả ngắn ở đầu; dưới là filter/tab (nếu có), rồi nội dung chính (card, bảng).
- **Thành phần:** Dùng Card cho khối nội dung, Button cho hành động, Input/Select cho filter và form, Table cho danh sách.
- **Màu:** Primary cho nút chính, gray cho chữ phụ, red/orange cho cảnh báo.
- **Phân trang:** Bảng có phân trang (prev/next, hoặc page number) ở cuối.

---

## 1. Tổng quan (Dashboard) – `/owner/dashboard`

### 1.1. Cấu trúc trang

```
[ Tiêu đề: "Tổng quan" ]
[ Mô tả: "Tổng quan doanh thu, đơn hàng và công nợ" ]

[ Hàng 1: 4–6 Stat Cards (grid 2x3 hoặc 3x2) ]

[ Hàng 2: 2 cột ]
  Cột trái (2/3):  Card "Đơn chờ xác nhận" – Bảng ngắn 5–10 dòng
  Cột phải (1/3):  Card "Link nhanh" – Danh sách link

[ Tùy chọn: Card "Cảnh báo tồn kho" – danh sách SKU tồn thấp ]
```

### 1.2. Stat Cards (thẻ thống kê)

| Thẻ | Label | Giá trị | Icon (gợi ý) | Màu nền icon |
|-----|--------|---------|---------------|----------------|
| 1 | Doanh thu hôm nay | Số tiền VNĐ | TrendingUp | bg-emerald-500 |
| 2 | Doanh thu tháng | Số tiền VNĐ | Calendar | bg-blue-500 |
| 3 | Đơn chờ xử lý | Số đơn | Clock | bg-amber-500 |
| 4 | Đơn đang sản xuất | Số đơn | Hammer | bg-violet-500 |
| 5 | Công nợ khách | Số tiền VNĐ | Users | bg-orange-500 |
| 6 | Công nợ NCC | Số tiền VNĐ | Building2 | bg-rose-500 |

- Mỗi card: icon trái, label nhỏ trên, value to đậm, sub text (mô tả ngắn) dưới.
- Click card "Đơn chờ xử lý" có thể chuyển sang `/owner/orders?status=pending_owner`.

### 1.3. Bảng "Đơn chờ xác nhận"

| Cột | Độ rộng | Nội dung |
|-----|---------|----------|
| Mã đơn | 120px | order_code (link sang chi tiết) |
| Khách hàng | 180px | customer_name |
| Ngày đặt | 110px | order_date (dd/MM/yyyy) |
| Giá kiến nghị | 120px | suggested_price (format VNĐ) |
| Thao tác | 100px | Nút "Xem" / "Báo giá" → mở chi tiết hoặc modal |

- Header bảng: nền xám nhạt, chữ đậm.
- Tối đa 5–10 dòng; có link "Xem tất cả" → `/owner/orders?status=pending_owner`.

### 1.4. Khối "Link nhanh"

- Danh sách link dạng list (không bảng):
  - Đơn hàng → `/owner/orders`
  - Sản phẩm → `/owner/products`
  - Quản lý sản xuất → `/owner/production`
  - Báo cáo → `/owner/reports`

---

## 2. Đơn hàng (Orders) – `/owner/orders`

### 2.1. Cấu trúc trang

```
[ Tiêu đề: "Đơn hàng" ]
[ Mô tả: "Danh sách đơn hàng khách, đơn xuất xưởng, đơn nhập xưởng" ]

[ Tab: Đơn khách | Đơn xuất xưởng | Đơn nhập xưởng ]

[ Filter: Trạng thái, Từ ngày – Đến ngày, Tìm theo mã/khách ]
[ Nút: "Tạo đơn" (nếu có quyền) ]

[ Bảng danh sách đơn ]
[ Phân trang ]
```

### 2.2. Tab

- **Đơn khách:** order (fk_customer_id), có suggested_price, final_price, approval_status.
- **Đơn xuất xưởng:** export_order (link fk_order_id).
- **Đơn nhập xưởng:** import_order (link fk_supplier_id).

### 2.3. Filter (áp cho Đơn khách)

| Control | Kiểu | Gắn với trường | Ghi chú |
|---------|------|----------------|---------|
| Trạng thái | Select | order_status / approval_status | Tất cả, Chờ chủ xác nhận, Đã xác nhận, Đang sản xuất, Đã giao, Đã hủy |
| Từ ngày | Input date | order_date >= | |
| Đến ngày | Input date | order_date <= | |
| Tìm kiếm | Input text | order_code hoặc customer_name | Placeholder: "Mã đơn, tên khách..." |
| Nút "Lọc" | Button | Submit filter | |
| Nút "Đặt lại" | Button | Xóa filter | |

### 2.4. Bảng "Đơn khách"

| Cột | Trường | Ghi chú |
|-----|--------|---------|
| Mã đơn | order_code | Link → chi tiết |
| Khách hàng | customer_name | |
| Ngày đặt | order_date | dd/MM/yyyy |
| Trạng thái | order_status / approval_status | Badge màu theo trạng thái |
| Giá kiến nghị | suggested_price | VNĐ |
| Final price | final_price | VNĐ (nếu đã duyệt) |
| Đặt cọc | deposit_amount | VNĐ |
| Thao tác | - | Xem, (Báo giá / Xác nhận nếu chờ Owner) |

### 2.5. Modal/Trang chi tiết đơn (View order + Order items)

- **Thông tin đơn:** Mã đơn, Khách (tên, SĐT, địa chỉ), Ngày đặt, Ngày giao dự kiến, Trạng thái.
- **Bảng Order items:**

| Cột | Trường |
|-----|--------|
| STT | 1, 2, 3... |
| Sản phẩm | product_name (+ variant: gỗ, màu) |
| Số lượng | quantity |
| Đơn giá | unit_price / estimated_price |
| Thành tiền | amount |
| Ghi chú | custom_note |

- **Tổng:** Tổng tiền, Đặt cọc, Còn lại.
- **Khu vực Owner (khi trạng thái = Chờ chủ xác nhận):**
  - Input **Final price** (số tiền).
  - Input **Ghi chú duyệt** (approval_notes).
  - Nút **Xác nhận** → gọi API, cập nhật approved_by, approved_at, chuyển trạng thái.

### 2.6. Bảng "Đơn xuất xưởng" (tab 2)

| Cột | Trường |
|-----|--------|
| Mã phiếu | export_code |
| Ngày xuất | export_date |
| Loại | export_type |
| Đơn hàng (nếu có) | order_code (từ fk_order_id) |
| Số mặt hàng | total_items |
| Trạng thái | status |
| Thao tác | Xem chi tiết (export_order_item) |

### 2.7. Bảng "Đơn nhập xưởng" (tab 3)

| Cột | Trường |
|-----|--------|
| Mã phiếu | import_code |
| NCC | supplier_name |
| Ngày nhập | import_date |
| Tổng tiền | total_amount |
| Trạng thái | status |
| Thao tác | Xem chi tiết (import_order_item) |

---

## 3. Sản phẩm (Products) – `/owner/products`

### 3.1. Cấu trúc trang

```
[ Tiêu đề: "Sản phẩm" ]
[ Mô tả: "Quản lý sản phẩm thô, hoàn thiện; danh mục và biến thể" ]

[ Tab: Sản phẩm | Biến thể | Danh mục (Category) ]

--- Tab Sản phẩm ---
[ Filter: Loại (Tất cả / Thô / Hoàn thiện), Danh mục (select), Tìm theo tên ]
[ Nút: Thêm sản phẩm | Thêm danh mục ]
[ Bảng sản phẩm ]
[ Phân trang ]

--- Tab Biến thể ---
[ Filter: Sản phẩm, Loại gỗ, Màu, Tìm theo tên ]
[ Nút: Thêm biến thể | Thêm loại gỗ | Thêm màu ]
[ Bảng biến thể ]
[ Phân trang ]

--- Tab Danh mục ---
[ Bảng danh mục: Mã, Tên, Trạng thái, Thao tác ]
[ Nút: Thêm danh mục ]
```

### 3.2. Tab Sản phẩm – Filter & Bảng

**Filter:**

| Control | Trường |
|---------|--------|
| Loại | product_type: ALL | RAW | FINISHED |
| Danh mục | fk_category_id (select, option "Tất cả") |
| Tìm theo tên | product_name (input search) |

**Bảng sản phẩm:**

| Cột | Trường |
|-----|--------|
| Mã | product code / sku |
| Tên | product_name |
| Ảnh | product_img (thumbnail 40x40) |
| Danh mục | category_name |
| Loại | product_type (Thô / Hoàn thiện) |
| Trạng thái | product_status (Có sẵn, Ngừng...) |
| Thao tác | Xem, Sửa, (Biến thể) |

### 3.3. Tab Biến thể – Filter & Bảng

**Filter:**

| Control | Trường |
|---------|--------|
| Sản phẩm | fk_product_id (select) |
| Loại gỗ | fk_wood_type_id (select) |
| Màu | fk_color_id (select) |
| Tìm theo tên | variant name hoặc product name |

**Bảng biến thể:**

| Cột | Trường |
|-----|--------|
| Mã SKU | sku_code |
| Sản phẩm | product_name |
| Loại gỗ | wood_type_name |
| Màu | color_name |
| Giá bán | selling_price (VNĐ) |
| Tồn | stock_quantity (từ sku) |
| Thao tác | Xem, Sửa |

### 3.4. Modal "Thêm/Sửa danh mục"

- category_code (input)
- category_name (input)
- status (select: Active / Inactive)
- Nút Lưu, Hủy

### 3.5. Modal "Thêm loại gỗ" / "Thêm màu"

- wood_type_code, wood_type_name (hoặc color_code, color_name, hex_code)
- status
- Lưu, Hủy

---

## 4. Quản lý sản xuất (Production) – `/owner/production`

### 4.1. Cấu trúc trang

```
[ Tiêu đề: "Quản lý sản xuất" ]
[ Mô tả: "Lệnh sản xuất, tiến độ và giao việc" ]

[ Nút: "Tạo lệnh sản xuất" ]

[ Filter: Trạng thái, Từ ngày – Đến ngày, Đơn hàng, Worker ]
[ Bảng lệnh sản xuất ]
[ Phân trang ]
```

### 4.2. Bảng lệnh sản xuất (production_order)

| Cột | Trường |
|-----|--------|
| Mã lệnh | production_code |
| Đơn hàng | order_code (link) |
| Sản phẩm (variant) | variant_name / product_name |
| Số lượng KH | quantity_planned |
| Đã hoàn thành | quantity_completed |
| Trạng thái | status (Pending, In progress, Completed...) |
| Người phụ trách | assigned_worker (full_name) |
| Ngày bắt đầu | start_date |
| Ngày kết thúc | end_date |
| Thao tác | Xem chi tiết, Giao việc (chọn Worker), Cập nhật tiến độ |

### 4.3. Modal "Tạo lệnh sản xuất"

- Chọn đơn hàng (select order) – optional.
- Chọn sản phẩm / biến thể (select product, variant).
- Số lượng (quantity_planned).
- Ghi chú (note).
- Nút Tạo.

### 4.4. Modal "Giao việc"

- Chọn Worker (select user_account role WORKER).
- Nút Giao.

---

## 5. Khách hàng (Customers) – `/owner/customers`

### 5.1. Cấu trúc trang

```
[ Tiêu đề: "Khách hàng" ]
[ Mô tả: "Danh sách khách hàng và phân loại" ]

[ Filter: Loại khách (Lẻ/Sỉ/Quen), Tìm theo tên/SĐT ]
[ Nút: Thêm khách hàng ]
[ Bảng khách hàng ]
[ Phân trang ]
```

### 5.2. Bảng khách hàng

| Cột | Trường |
|-----|--------|
| Mã | customer_code |
| Họ tên | full_name |
| Số điện thoại | phone_number |
| Email | email |
| Địa chỉ | address (rút gọn) |
| Loại | customer_type (Lẻ / Sỉ / Quen) |
| Số đơn | total_orders (tính từ order) |
| Công nợ | total_debt |
| Thao tác | Xem, Sửa |

### 5.3. Modal Thêm/Sửa khách hàng

- full_name, phone_number, email, address
- customer_type (select)
- note
- Lưu, Hủy

---

## 6. Nhà cung cấp (Suppliers) – `/owner/suppliers`

### 6.1. Cấu trúc trang

```
[ Tiêu đề: "Nhà cung cấp" ]
[ Mô tả: "Quản lý nhà cung cấp và xưởng nguồn" ]

[ Filter: Tìm theo tên/mã/SĐT ]
[ Nút: Thêm nhà cung cấp ]
[ Bảng nhà cung cấp ]
[ Phân trang ]
```

### 6.2. Bảng nhà cung cấp

| Cột | Trường |
|-----|--------|
| Mã | supplier_code |
| Tên | supplier_name |
| Người liên hệ | contact_person |
| Số điện thoại | phone_number |
| Email | email |
| Địa chỉ | address (rút gọn) |
| Công nợ | total_debt (từ import_order) |
| Trạng thái | status |
| Thao tác | Xem, Sửa |

### 6.3. Modal Thêm/Sửa NCC

- supplier_code, supplier_name, contact_person, phone_number, email, address
- tax_id, bank_account (tùy chọn)
- note, status
- Lưu, Hủy

---

## 7. Nhân sự / Quản lý tài khoản (Employees) – `/owner/employees`

### 7.1. Cấu trúc trang

```
[ Tiêu đề: "Quản lý tài khoản" ]
[ Mô tả: "Danh sách tài khoản và trạng thái" ]

[ Filter: Vai trò (Owner, Sales, Accountant, Worker), Trạng thái (Hoạt động, Nghỉ, Khóa) ]
[ Nút: Thêm tài khoản ]
[ Bảng tài khoản ]
[ Phân trang ]
```

### 7.2. Bảng tài khoản

| Cột | Trường |
|-----|--------|
| Email | email |
| Họ tên | profile.full_name |
| Vai trò | role.role_name |
| Trạng thái | status → Badge (Hoạt động / Nghỉ / Khóa) |
| Số điện thoại | profile.phone_number |
| Ngày tạo | timestamp |
| Thao tác | Sửa, Đổi trạng thái (dropdown hoặc modal) |

### 7.3. Modal Thêm tài khoản

- email, password
- role (select: OWNER, SALES, ACCOUNTANT, WORKER)
- full_name, phone_number (profile)
- Lưu, Hủy

### 7.4. Modal Đổi trạng thái

- Select: Hoạt động (1), Nghỉ (0), Khóa (-1)
- Nút Cập nhật

---

## 8. Báo cáo (Reports) – `/owner/reports`

### 8.1. Cấu trúc trang

```
[ Tiêu đề: "Báo cáo" ]
[ Mô tả: "Báo cáo doanh thu, công nợ, tồn kho" ]

[ Tab hoặc dropdown: Doanh thu | Công nợ khách | Công nợ NCC | Tồn kho ]

[ Filter: Từ ngày, Đến ngày (hoặc Tháng, Năm) ]
[ Nút: Xuất Excel (tùy chọn) ]

[ Nội dung: Bảng số liệu hoặc thẻ tổng hợp + bảng chi tiết ]
```

### 8.2. Báo cáo Doanh thu

- Filter: Tháng/Năm hoặc Từ ngày – Đến ngày.
- Thẻ: Tổng doanh thu, Số đơn.
- Bảng: Ngày (hoặc Tháng), Doanh thu, Số đơn.

### 8.3. Báo cáo Công nợ khách

- Bảng: Khách hàng, Tổng nợ, Số đơn chưa thanh toán, Thao tác (Xem đơn).

### 8.4. Báo cáo Công nợ NCC

- Bảng: Nhà cung cấp, Tổng nợ, Số phiếu nhập chưa thanh toán, Thao tác.

### 8.5. Báo cáo Tồn kho

- Bảng: Mã SKU, Sản phẩm, Biến thể, Tồn, Đặt trước, Tối thiểu, Trạng thái (đủ / sắp hết / hết).

---

## 9. System Log (Nhật ký hệ thống)

Có thể đặt tại `/owner/system-log` hoặc mục con trong Cài đặt.

### 9.1. Cấu trúc

```
[ Tiêu đề: "Nhật ký hệ thống" ]
[ Mô tả: "Lịch sử thao tác trên hệ thống" ]

[ Filter: Từ ngày – Đến ngày, Người thực hiện, Loại thao tác, Đối tượng ]
[ Tìm kiếm: nội dung mô tả ]
[ Bảng log ]
[ Phân trang ]
```

### 9.2. Bảng log

| Cột | Trường |
|-----|--------|
| Thời gian | timestamp (dd/MM/yyyy HH:mm) |
| Người thực hiện | modified_by (email) + actor_role (badge) |
| Mô tả chi tiết | description |
| Loại thao tác | action_type |
| Đối tượng | entity_type, entity_id (link nếu có) |

---

## 10. Stock Transaction (Biến động kho) – Làm cuối

Có thể là tab trong Báo cáo hoặc trang riêng `/owner/stock-transactions`.

### 10.1. Bảng giao dịch kho

| Cột | Trường |
|-----|--------|
| Ngày | transaction_date |
| Loại | transaction_type (Nhập / Xuất / Hủy) |
| Sản phẩm | product_name / sku |
| Số lượng | quantity (+ / -) |
| Đơn vị | unit |
| Chứng từ | reference_type, reference_id |
| Ghi chú | note |
| Người thực hiện | created_by |

**Filter:** Loại (Nhập/Xuất/Hủy), Từ ngày – Đến ngày, Tên sản phẩm/mã chứng từ.

---

*Tài liệu này dùng làm spec triển khai giao diện từng màn hình Owner; khi code có thể tham chiếu đúng tên trường và cấu trúc bảng/filter ở trên.*
