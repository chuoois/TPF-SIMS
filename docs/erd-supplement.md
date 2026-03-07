# Bổ sung ERD – Đủ trường nghiệp vụ

Tài liệu này bổ sung các bảng và trường còn thiếu so với hai sơ đồ ERD hiện có, để đủ hỗ trợ nghiệp vụ Owner, Sales, Accountant, Worker (system log, stock transaction, product/variant/category, quản lý tài khoản, đơn hàng, báo giá, đơn xuất/nhập xưởng, quản lý tiến độ, thu chi công nợ).

---

## 1. Tổng quan ERD hiện có

### 1.1. Các bảng đã có (từ hai ERD)

| Bảng | Ghi chú |
|------|--------|
| `system_log` | pk_system_log_id, fk_user_account_id, description, timestamp |
| `user_profile` | pk_user_profile_id, fk_user_account_id, full_name, phone_number, dob, gender, timestamp |
| `refresh_token` | pk_refresh_token_id, token, expires_at, timestamp |
| `user_role` | pk_role_id, role_code, role_name, description, timestamp |
| `user_account` | pk_user_account_id, fk_role_id, email, password_hash, status, timestamp |
| `customer_profile` | pk_customer_id, fk_user_account_id?, customer_code, full_name, email, address, gender, dob, phone_number, note, timestamp |
| `order` | pk_order_id, fk_customer_id, fk_user_account_id, order_code, order_address, order_date, expected_delivery_date, customer_note, invoice_img, deposit_amount, total_amount, is_draft, order_status, timestamp |
| `order_item` | pk_order_item_id, fk_order_id, fk_sku_id, quantity, unit_price, custom_*, estimated_price, final_price, custom_note, timestamp |
| `product_category` | pk_product_category_id, category_code, category_name, status, timestamp |
| `product` | pk_product_id, fk_category_id, product_name, product_img, description, is_customizable, product_status, timestamp |
| `product_variant` | pk_variant_id, fk_product_id, variant_name_img, variant_name, wood_type, size, color, selling_price, timestamp |
| `sku` | pk_sku_id, fk_variant_id, fk_production_id?, sku_code, barcode_*, stock_quantity, quantity_reserved, quantity_damaged, min_stock_level, sku_status, timestamp |
| `export_order` | pk_export_id, fk_user_account_id, fk_order_id, export_code, export_type, export_date, total_items, note, status, timestamp |
| `export_order_item` | pk_export_item_id, fk_export_id, fk_sku_id, quantity, note, timestamp |
| `import_order` | pk_import_id, fk_user_account_id, import_code?, import_type, import_date, total_items?, total_amount?, note, status, timestamp |
| `import_order_item` | pk_import_item_id, fk_import_id, fk_sku_id, quantity, note?, timestamp |
| `production_order` | pk_production_id, fk_user_account_id, fk_import_id, fk_order_id, fk_variant_id, production_code, quantity_planned, quantity_completed, timestamp |
| `stock_transaction` (ERD 2) | pk_transaction_id, fk_sku_id, fk_import_id, fk_export_id, fk_production_id, fk_user_account_id, transaction_type, quantity_before, quantity_change, quantity_after, timestamp |

---

## 2. Bảng mới cần thêm

### 2.1. `supplier` (Nhà cung cấp)

Dùng cho đơn nhập xưởng và công nợ NCC.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| pk_supplier_id | uuid | PK | ID nhà cung cấp |
| supplier_code | varchar(50) | UNIQUE, NOT NULL | Mã NCC |
| supplier_name | varchar(255) | NOT NULL | Tên NCC / xưởng |
| contact_person | varchar(255) | | Người liên hệ |
| phone_number | varchar(20) | | Số điện thoại |
| email | varchar(255) | | Email |
| address | text | | Địa chỉ |
| tax_id | varchar(50) | | Mã số thuế |
| bank_account | varchar(50) | | Số tài khoản |
| note | text | | Ghi chú |
| status | smallint | DEFAULT 1 | 1: active, 0: inactive |
| timestamp | timestamptz | NOT NULL | created_at/updated_at |

**Quan hệ:** `import_order.fk_supplier_id` → `supplier.pk_supplier_id` (NCC của đơn nhập).

---

### 2.2. `payment` (Thanh toán – thu tiền khách)

Phục vụ Accountant và báo cáo thu chi, công nợ khách.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| pk_payment_id | uuid | PK | ID thanh toán |
| fk_order_id | uuid | FK → order | Đơn hàng được thanh toán |
| fk_user_account_id | uuid | FK → user_account | Người ghi nhận |
| payment_date | date | NOT NULL | Ngày thanh toán |
| amount | decimal(18,2) | NOT NULL | Số tiền |
| payment_method | varchar(50) | | Cash, Bank Transfer, QR, ... |
| transaction_reference | varchar(255) | | Mã giao dịch NH / phiếu thu |
| note | text | | Ghi chú |
| status | varchar(20) | DEFAULT 'completed' | completed, pending, refunded |
| timestamp | timestamptz | NOT NULL | |

**Công nợ khách:** `order.total_amount - COALESCE(SUM(payment.amount), 0)` theo từng đơn.

---

### 2.3. `expense` (Chi phí / Thu chi)

Phục vụ kế toán: chi phí vận hành, mua nguyên vật liệu, v.v.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| pk_expense_id | uuid | PK | ID chi phí |
| fk_user_account_id | uuid | FK → user_account | Người ghi nhận |
| expense_date | date | NOT NULL | Ngày phát sinh |
| amount | decimal(18,2) | NOT NULL | Số tiền |
| description | varchar(500) | | Mô tả |
| expense_category | varchar(100) | | Utilities, Salaries, Rent, Raw Materials, ... |
| invoice_number | varchar(100) | | Số hóa đơn / chứng từ |
| fk_supplier_id | uuid | FK → supplier, nullable | NCC (nếu chi trả NCC) |
| note | text | | Ghi chú |
| timestamp | timestamptz | NOT NULL | |

---

### 2.4. `wood_type` (Loại gỗ – master data)

Dùng cho product variant, filter, add wood type.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| pk_wood_type_id | uuid | PK | ID loại gỗ |
| wood_type_code | varchar(50) | UNIQUE | Mã (VD: MIT, GU) |
| wood_type_name | varchar(100) | NOT NULL | Tên (Mít, Gụ, Hương, ...) |
| description | text | | Mô tả |
| status | smallint | DEFAULT 1 | 1: active, 0: inactive |
| timestamp | timestamptz | NOT NULL | |

---

### 2.5. `color` (Màu sơn – master data)

Dùng cho product variant, filter, add color.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| pk_color_id | uuid | PK | ID màu |
| color_code | varchar(50) | UNIQUE | Mã màu |
| color_name | varchar(100) | NOT NULL | Tên (Cánh gián, Óc chó, ...) |
| hex_code | varchar(20) | | Mã màu hex (#...) |
| description | text | | Mô tả |
| status | smallint | DEFAULT 1 | 1: active, 0: inactive |
| timestamp | timestamptz | NOT NULL | |

---

### 2.6. `production_order_material` (Vật tư tiêu hao theo lệnh sản xuất)

Liên kết nguyên vật liệu (SKU) với lệnh sản xuất (nếu cần theo dõi NVL theo từng lệnh).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| pk_prod_material_id | uuid | PK | ID dòng |
| fk_production_id | uuid | FK → production_order | Lệnh sản xuất |
| fk_sku_id | uuid | FK → sku | SKU nguyên vật liệu |
| quantity_consumed | decimal(18,4) | NOT NULL | Số lượng sử dụng |
| note | text | | Ghi chú |
| timestamp | timestamptz | NOT NULL | |

---

## 3. Bổ sung cột cho bảng đã có

### 3.1. `system_log`

Đủ cho “người thực hiện + mô tả chi tiết”.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| (giữ) pk_system_log_id, fk_user_account_id, description, timestamp | | |
| **action_type** | varchar(50) | CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, LOGIN, ... |
| **entity_type** | varchar(50) | ORDER, PRODUCT, ACCOUNT, STOCK_TRANSACTION, IMPORT_ORDER, ... |
| **entity_id** | uuid/varchar | ID đối tượng bị tác động (để link) |
| **old_value** | text/jsonb | Giá trị cũ (tùy chọn) |
| **new_value** | text/jsonb | Giá trị mới (tùy chọn) |

*Ghi chú:* Có thể thêm `modified_by` (email) nếu không luôn join `user_account` khi hiển thị.

---

### 3.2. `order`

Hỗ trợ luồng báo giá: Sales giá kiến nghị → Chờ Owner → Owner final price + xác nhận.

| Cột bổ sung | Kiểu | Mô tả |
|--------------|------|-------|
| **suggested_price** | decimal(18,2) | Giá kiến nghị (Sales nhập) |
| **final_price** | decimal(18,2) | Giá chính thức (Owner báo giá) – có thể = total_amount sau khi duyệt |
| **approval_status** | varchar(50) | DRAFT, PENDING_OWNER_CONFIRM, APPROVED, REJECTED |
| **fk_approved_by** | uuid | FK → user_account (Owner xác nhận) |
| **approved_at** | timestamptz | Thời điểm Owner xác nhận |
| **approval_notes** | text | Ghi chú khi duyệt |

*Ghi chú:* Nếu đã có `order_status`, có thể map: PENDING_OWNER_CONFIRM ≈ trạng thái “Chờ chủ xác nhận”, APPROVED ≈ “Đã xác nhận”.

---

### 3.3. `order_item`

Đã có `estimated_price`, `final_price` – chỉ cần đảm bảo:

- **estimated_price**: giá kiến nghị (Sales).
- **final_price**: giá chính thức (Owner), có thể cập nhật khi Owner duyệt đơn.

Nếu toàn đơn chỉ có một `final_price` ở `order` thì có thể không lưu `final_price` từng dòng; nếu tính theo từng dòng thì giữ cả hai ở `order_item`.

---

### 3.4. `product`

Phân biệt sản phẩm thô / hoàn thiện; hỗ trợ filter và báo cáo.

| Cột bổ sung | Kiểu | Mô tả |
|--------------|------|-------|
| **product_type** | varchar(20) | RAW = sản phẩm thô, FINISHED = sản phẩm hoàn thiện |

---

### 3.5. `product_variant`

Chuẩn hóa wood_type và color qua bảng master (wood_type, color).

| Cột hiện tại | Ghi chú |
|--------------|--------|
| wood_type | Có thể chuyển thành fk_wood_type_id → wood_type (khuyến nghị) |
| color | Có thể chuyển thành fk_color_id → color (khuyến nghị) |

**Cột bổ sung (nếu vẫn lưu text):**

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| **fk_wood_type_id** | uuid | FK → wood_type (nullable nếu giữ cột wood_type cũ) |
| **fk_color_id** | uuid | FK → color (nullable nếu giữ cột color cũ) |

---

### 3.6. `import_order`

Liên kết NCC và số tiền đã thanh toán (công nợ NCC).

| Cột bổ sung | Kiểu | Mô tả |
|--------------|------|-------|
| **fk_supplier_id** | uuid | FK → supplier, NOT NULL (nếu mọi đơn nhập đều từ NCC) |
| **total_amount** | decimal(18,2) | Tổng giá trị đơn nhập (nếu chưa có) |
| **paid_amount** | decimal(18,2) | DEFAULT 0 – Đã trả NCC (công nợ = total_amount - paid_amount) |

*Ghi chú:* Nếu ERD 1 dùng `fk_order_id` trên import_order để link đơn khách thì có thể giữ; thường đơn nhập độc lập với đơn khách nên `fk_order_id` có thể nullable hoặc bỏ.

---

### 3.7. `import_order_item`

Giá nhập từng dòng (để tính giá vốn, báo cáo).

| Cột bổ sung | Kiểu | Mô tả |
|--------------|------|-------|
| **unit_price** hoặc **import_price** | decimal(18,2) | Đơn giá nhập (giá gốc) |

---

### 3.8. `production_order`

Hỗ trợ quản lý tiến độ và giao Worker.

| Cột bổ sung | Kiểu | Mô tả |
|--------------|------|-------|
| **status** | varchar(30) | PENDING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED |
| **start_date** | date | Ngày bắt đầu (kế hoạch hoặc thực tế) |
| **end_date** | date | Ngày kết thúc (thực tế) |
| **fk_assigned_worker_id** | uuid | FK → user_account (Worker được giao) |
| **assigned_at** | timestamptz | Thời điểm giao việc |
| **note** | text | Ghi chú nội bộ |

---

### 3.9. `sku`

Làm rõ: SKU là “loại” tồn kho (theo variant), không bắt buộc gắn 1–1 với một lệnh sản xuất.

| Khuyến nghị | Mô tả |
|-------------|-------|
| **Bỏ fk_production_id** trên `sku` | SKU gắn với variant; lệnh sản xuất tạo ra/xuất SKU được ghi qua `stock_transaction` (reference_type = PRODUCTION_IN / PRODUCTION_OUT). |
| Hoặc giữ **fk_production_id** nullable | Chỉ set khi SKU đại diện “lô sản xuất” cụ thể; phần lớn case dùng `stock_transaction` + `production_order` là đủ. |

---

### 3.10. `stock_transaction`

Đủ cho nghiệp vụ: sản phẩm nhập, sản phẩm xuất, sản phẩm hủy.

Đảm bảo có:

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| pk_transaction_id | uuid | PK |
| fk_sku_id | uuid | FK → sku |
| fk_user_account_id | uuid | Người thực hiện/ghi nhận |
| **transaction_type** | varchar(30) | IMPORT, EXPORT, PRODUCTION_IN, PRODUCTION_OUT, **DAMAGED/DESTROY** (hủy), ADJUST |
| **transaction_date** hoặc dùng **timestamp** | date / timestamptz | Thời điểm giao dịch |
| quantity_before | decimal(18,4) | Tồn trước |
| quantity_change | decimal(18,4) | + nhập, − xuất, − hủy |
| quantity_after | decimal(18,4) | Tồn sau |
| fk_import_id | uuid | nullable – Nếu phát sinh từ đơn nhập |
| fk_export_id | uuid | nullable – Nếu phát sinh từ đơn xuất |
| fk_production_id | uuid | nullable – Nếu phát sinh từ lệnh sản xuất |
| **reference_type** | varchar(50) | IMPORT_ORDER, EXPORT_ORDER, PRODUCTION_ORDER, DESTROY, ADJUST |
| **reference_id** | varchar(100) | Mã chứng từ (hoặc ID) để đối chiếu |
| **note** | text | Ghi chú |
| timestamp | timestamptz | NOT NULL |

---

## 4. `customer_profile` (bổ sung nếu thiếu)

Để list đơn theo khách, phân loại khách (lẻ/sỉ/quen).

| Cột bổ sung | Kiểu | Mô tả |
|--------------|------|-------|
| **customer_type** | varchar(20) | LE, SI, QUEN (lẻ, sỉ, quen) – dùng cho chính sách giá |

---

## 5. Tóm tắt bổ sung

| Hạng mục | Nội dung |
|----------|----------|
| **Bảng mới** | supplier, payment, expense, wood_type, color, production_order_material |
| **system_log** | action_type, entity_type, entity_id, old_value, new_value (và optional modified_by) |
| **order** | suggested_price, final_price, approval_status, fk_approved_by, approved_at, approval_notes |
| **product** | product_type (RAW / FINISHED) |
| **product_variant** | fk_wood_type_id, fk_color_id (hoặc chuẩn hóa wood_type, color sang bảng master) |
| **import_order** | fk_supplier_id, total_amount, paid_amount |
| **import_order_item** | unit_price / import_price |
| **production_order** | status, start_date, end_date, fk_assigned_worker_id, assigned_at, note |
| **stock_transaction** | transaction_type (gồm DAMAGED/DESTROY), reference_type, reference_id, note; đủ FK import/export/production, fk_user_account_id |
| **sku** | Xem xét bỏ hoặc để nullable fk_production_id |
| **customer_profile** | customer_type (LE, SI, QUEN) |

Sau khi bổ sung như trên, ERD sẽ đủ trường cho: system log (người thực hiện + mô tả chi tiết), stock transaction (nhập/xuất/hủy), sản phẩm thô/hoàn thiện, category, wood_type, color, quản lý tài khoản, list đơn + order items, đơn xuất/nhập xưởng, báo giá (suggested_price, final_price, chờ Owner xác nhận), quản lý tiến độ (production order, giao Worker), và thu chi công nợ (payment, expense, supplier/import).
