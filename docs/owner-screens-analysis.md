# Phân tích chi tiết các màn hình Chủ cửa hàng (Owner)

Tài liệu mô tả đầy đủ từng màn hình, trường dữ liệu nghiệp vụ và luồng tương tác theo Actor (Owner, Sales, Accountant, Worker).

---

## 1. Actor (Tác nhân)

| # | Actor | Mô tả |
|---|--------|------|
| 1 | **Owner** | Người dùng quyền cao nhất. Giám sát hoạt động kinh doanh, tài chính; phê duyệt nghiệp vụ quan trọng; sử dụng báo cáo và nhật ký hệ thống để kiểm soát và ra quyết định. |
| 2 | **Sales** | Làm việc trực tiếp với khách hàng. Tạo và quản lý đơn hàng, cập nhật thông tin sản phẩm theo yêu cầu, ghi nhận thanh toán, theo dõi tiến trình đơn. **Sales nhập giá kiến nghị;** Owner nhập **final price** (báo giá chính thức). |
| 3 | **Accountant** | Phụ trách tài chính – kế toán. Quản lý thu – chi, công nợ, chi phí và nghiệp vụ kế toán; đảm bảo dữ liệu tài chính đầy đủ, chính xác, minh bạch. |
| 4 | **Worker** | Nhân viên sản xuất tại xưởng. Tiếp nhận công việc gia công theo đơn được phân công; cập nhật tiến độ thực hiện. |

---

## 2. Tổng quan (Dashboard)

**Route:** `/owner/dashboard`  
**Mục đích:** Trang chủ Owner – tổng quan nhanh doanh thu, đơn hàng, tồn kho, công nợ, cảnh báo.

### 2.1. Trường dữ liệu / Thẻ thống kê (Cards)

| Trường | Kiểu | Mô tả | Nguồn / Ghi chú |
|--------|------|-------|-----------------|
| Doanh thu hôm nay | number | Tổng tiền bán (đã thu) trong ngày | Từ đơn hàng đã xác nhận thanh toán |
| Doanh thu tháng | number | Tổng doanh thu trong tháng hiện tại | |
| Số đơn chờ xử lý | number | Đơn trạng thái: Chờ chủ xác nhận / Chờ báo giá | |
| Số đơn đang sản xuất | number | Đơn đang ở khâu xưởng (chưa giao) | |
| Tổng công nợ khách | number | Tổng tiền khách còn nợ | |
| Tổng công nợ nhà cung cấp | number | Tổng tiền còn nợ NCC | |
| Cảnh báo tồn kho thấp | number / list | Sản phẩm dưới mức tối thiểu | (Tùy quy tắc tồn) |

### 2.2. Thành phần giao diện đề xuất

- Các **card số liệu** (số tiền, số đơn).
- **Bảng / danh sách ngắn:** Đơn mới nhất, Đơn chờ Owner xác nhận (nếu có).
- **Link nhanh** sang: Đơn hàng, Sản phẩm, Báo cáo.

---

## 3. System Log (Nhật ký hệ thống)

**Route:** `/owner/system-log` (hoặc mục riêng trong sidebar / cài đặt).  
**Mục đích:** Owner xem lịch sử thao tác trên hệ thống để kiểm soát và đối chiếu.

### 3.1. Trường dữ liệu (Danh sách log)

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `pk_system_log_id` | uuid | ✅ | ID log |
| `timestamp` | datetime | ✅ | Thời gian thực hiện (ISO 8601) |
| **Người thực hiện** | | | |
| `modified_by` | string | ✅ | Email (hoặc mã) người thực hiện |
| `user_account_id` | uuid | | ID tài khoản (nếu có) |
| `actor_role` | string | | Role lúc thực hiện: OWNER, SALES, ACCOUNTANT, WORKER |
| **Mô tả chi tiết** | | | |
| `description` | string | ✅ | Mô tả chi tiết thao tác (tiếng Việt, rõ ràng) |
| `action_type` | string | | Loại: CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, ... |
| `entity_type` | string | | Đối tượng: ORDER, PRODUCT, ACCOUNT, STOCK_TRANSACTION, ... |
| `entity_id` | string | | ID đối tượng bị tác động (để link xem chi tiết) |
| `old_value` | object/string | | Giá trị cũ (nếu là cập nhật, có thể JSON hoặc text) |
| `new_value` | object/string | | Giá trị mới |

### 3.2. Ví dụ `description` (mô tả chi tiết)

- "Cập nhật trạng thái tài khoản: test@gmail.com thành Khóa (ID: uuid)"
- "Owner xác nhận báo giá đơn hàng #DH001, final price: 45.000.000 VNĐ"
- "Sales tạo đơn hàng #DH002 cho khách Nguyễn Văn A"
- "Xuất kho 3 sản phẩm Bàn ghế gỗ Hương, đơn #DH002"

### 3.3. Giao diện đề xuất

- **Bảng:** Cột: Thời gian, Người thực hiện (email + role), Mô tả chi tiết, Loại thao tác, Đối tượng.
- **Bộ lọc:** Theo ngày, theo người thực hiện, theo loại thao tác, theo đối tượng (order, product, account, stock...).
- **Tìm kiếm:** Theo nội dung mô tả hoặc ID đối tượng.
- **Phân trang.**

---

## 4. Stock Transaction (Biến động kho) – Làm cuối

**Route:** `/owner/stock-transactions` (hoặc nằm trong Kho / Báo cáo).  
**Mục đích:** Theo dõi nhập kho, xuất kho, hủy sản phẩm.

### 4.1. Trường dữ liệu (1 bản ghi giao dịch kho)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID giao dịch |
| `transaction_type` | enum | **NHAP** (sản phẩm nhập), **XUAT** (sản phẩm xuất), **HUY** (sản phẩm hủy) |
| `transaction_date` | date | Ngày giao dịch |
| `product_id` | uuid | ID sản phẩm (hoặc product_variant_id) |
| `product_name` | string | Tên sản phẩm (hiển thị) |
| `quantity` | number | Số lượng (+ nhập, − xuất, − hủy) |
| `unit` | string | Đơn vị: Chiếc, Bộ, ... |
| `reference_type` | string | Loại chứng từ: ORDER, IMPORT_ORDER, DESTROY, ADJUST |
| `reference_id` | string | Mã đơn / phiếu liên quan (đơn xuất xưởng, đơn nhập xưởng, phiếu hủy) |
| `warehouse_location` | string | Kho / vị trí (nếu có) |
| `note` | string | Ghi chú |
| `created_by` | string | Người tạo giao dịch (email/user_id) |
| `created_at` | datetime | Thời gian tạo |

### 4.2. Màn hình đề xuất

- **Bảng:** Ngày, Loại (Nhập/Xuất/Hủy), Sản phẩm, Số lượng, Đơn vị, Chứng từ tham chiếu, Ghi chú, Người thực hiện.
- **Filter:** Theo loại (nhập/xuất/hủy), theo khoảng ngày, theo sản phẩm.
- **Search:** Theo tên sản phẩm, mã chứng từ.

---

## 5. Sản phẩm (Products)

**Route:** `/owner/products`  
**Mục đích:** Owner xem và quản lý sản phẩm thô, sản phẩm hoàn thiện; filter theo category; search theo tên; thêm category.

### 5.1. Phân loại hiển thị (View mode / Filter)

| Loại | Mô tả |
|------|-------|
| Sản phẩm thô | Hàng mộc, chưa hoàn thiện sơn/vecni |
| Sản phẩm hoàn thiện | Đã sơn/vecni, có thể bán / xuất |

(Có thể thêm trạng thái: Có sẵn, Đặt làm, Ngừng kinh doanh.)

### 5.2. Trường dữ liệu – Product (Sản phẩm)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID sản phẩm |
| `code` / `sku` | string | Mã sản phẩm (SKU) |
| `name` | string | Tên sản phẩm |
| `category_id` | uuid | ID danh mục (Phòng khách, Phòng thờ, ...) |
| `category_name` | string | Tên danh mục (hiển thị) |
| `description` | string | Mô tả |
| `product_type` | enum | THO | HOAN_THIEN (thô / hoàn thiện) |
| `status` | enum | AVAILABLE, CUSTOM_ONLY, DISCONTINUED |
| `unit` | string | Đơn vị: Bộ, Chiếc, ... |
| `created_at`, `updated_at` | datetime | |

### 5.3. Filter & Search (Sản phẩm)

| Chức năng | Cách làm |
|-----------|----------|
| **Filter theo category** | Dropdown/select: chọn 1 hoặc nhiều danh mục (Phòng khách, Phòng thờ, ...). |
| **Search theo tên** | Ô tìm kiếm: gõ tên sản phẩm (search theo `name`). |

### 5.4. Nút thêm Category

- Nút **"Thêm danh mục"** (Add category): mở modal/form tạo danh mục mới (tên, mã, mô tả nếu có). Chỉ Owner (hoặc quyền tương đương) được thêm/sửa category.

### 5.5. Giao diện đề xuất

- **Tab hoặc filter:** Tất cả / Sản phẩm thô / Sản phẩm hoàn thiện.
- **Filter:** Category (multi-select).
- **Search:** Tên sản phẩm.
- **Bảng danh sách:** Mã, Tên, Danh mục, Loại (thô/hoàn thiện), Trạng thái, Thao tác (Xem, Sửa).
- **Nút:** Thêm sản phẩm, **Thêm danh mục (category)**.

---

## 6. Product Variant (Biến thể sản phẩm)

**Route:** Có thể trong cùng trang Product (tab Biến thể) hoặc `/owner/products/:id/variants`.  
**Mục đích:** Quản lý biến thể theo loại gỗ, màu sơn; search theo tên; filter wood type, color; thêm wood type, color.

### 6.1. Trường dữ liệu – Product Variant

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID biến thể |
| `product_id` | uuid | ID sản phẩm cha |
| `name` | string | Tên biến thể (hoặc tên hiển thị = product name + wood + color) |
| `wood_type_id` | uuid | ID loại gỗ |
| `wood_type_name` | string | Tên loại gỗ (Mít, Gụ, Hương, ...) |
| `color_id` | uuid | ID màu sơn |
| `color_name` | string | Tên màu (Cánh gián, Óc chó, ...) |
| `sku` | string | Mã SKU biến thể |
| `price` | number | Giá bán (nếu lưu ở variant) |
| `stock_quantity` | number | Tồn kho (nếu quản lý theo variant) |
| `status` | enum | Active, Inactive |

### 6.2. Master data – Wood Type & Color

| Bảng | Trường chính |
|------|--------------|
| **Wood type** | id, code, name, description |
| **Color** | id, code, name, hex (optional), description |

### 6.3. Filter & Search (Variant)

| Chức năng | Cách làm |
|-----------|----------|
| **Search theo tên** | Ô search: tìm theo `name` hoặc tên sản phẩm + wood + color. |
| **Filter theo wood type** | Dropdown: chọn 1 hoặc nhiều loại gỗ. |
| **Filter theo color** | Dropdown: chọn 1 hoặc nhiều màu. |

### 6.4. Thêm Wood Type / Color

- **Thêm loại gỗ:** Nút "Thêm loại gỗ" → form (mã, tên, mô tả).
- **Thêm màu:** Nút "Thêm màu" → form (mã, tên, mã hex nếu có).

### 6.5. Giao diện đề xuất

- **Search:** Tên biến thể / tên sản phẩm.
- **Filter:** Wood type, Color (có thể kết hợp).
- **Bảng:** Tên (hoặc SKU), Sản phẩm, Loại gỗ, Màu, Giá, Tồn, Thao tác.
- **Nút:** Thêm biến thể, Thêm loại gỗ, Thêm màu.

---

## 7. Quản lý tài khoản (Accounts)

**Route:** `/owner/employees` (hoặc `/owner/accounts` tùy đặt tên).  
**Mục đích:** Owner xem danh sách tài khoản, trạng thái tài khoản; tạo/sửa/khóa tài khoản.

### 7.1. Trường dữ liệu – Danh sách tài khoản

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `pk_user_account_id` | uuid | ID tài khoản |
| `email` | string | Email đăng nhập |
| `status` | number | -1: Khóa, 0: Nghỉ, 1: Hoạt động |
| `status_label` | string | Hiển thị: Khóa / Nghỉ / Hoạt động |
| `role.role_code` | string | OWNER, SALES, ACCOUNTANT, WORKER |
| `role.role_name` | string | Tên role (Chủ cửa hàng, Nhân viên bán hàng, ...) |
| `profile.full_name` | string | Họ tên |
| `profile.phone_number` | string | SĐT |
| `profile.dob` | string | Ngày sinh |
| `profile.gender` | number | 0 Nữ, 1 Nam |
| `timestamp` | datetime | Thời gian tạo/cập nhật |

### 7.2. Danh sách trạng thái tài khoản

| Giá trị | Nhãn | Mô tả |
|---------|------|-------|
| 1 | Hoạt động | Được đăng nhập và sử dụng hệ thống |
| 0 | Nghỉ | Tạm ngừng (nghỉ việc tạm thời) |
| -1 | Khóa | Không thể đăng nhập |

### 7.3. Giao diện đề xuất

- **Bảng:** Email, Họ tên, Vai trò, Trạng thái, SĐT, Thao tác (Sửa, Đổi trạng thái).
- **Filter:** Theo trạng thái (Hoạt động / Nghỉ / Khóa), theo vai trò (Owner, Sales, Accountant, Worker).
- **Nút:** Thêm tài khoản.
- **List trạng thái:** Hiển thị dưới dạng badge/dropdown; khi đổi trạng thái gọi API PATCH status.

---

## 8. Đơn hàng (Orders)

**Route:** `/owner/orders`  
**Mục đích:** Owner xem danh sách đơn của khách hàng, xem chi tiết đơn (order items), xem đơn xuất xưởng và đơn nhập xưởng; xác nhận báo giá (final price).

### 8.1. Trường dữ liệu – Order (Đơn hàng khách)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID đơn |
| `order_code` | string | Mã đơn (VD: DH001) |
| `customer_id` | uuid | ID khách hàng |
| `customer_name` | string | Tên khách |
| `customer_phone` | string | SĐT khách |
| `customer_address` | string | Địa chỉ giao hàng |
| `status` | enum | DRAFT, PENDING_OWNER_CONFIRM, CONFIRMED, IN_PRODUCTION, SHIPPED, DELIVERED, CANCELLED |
| `status_label` | string | Nhãn tiếng Việt |
| `suggested_price` | number | Giá kiến nghị (Sales nhập) |
| `final_price` | number | Giá chính thức (Owner báo giá) |
| `deposit_amount` | number | Tiền đặt cọc |
| `total_amount` | number | Tổng tiền đơn |
| `created_by` | string | Người tạo (Sales) |
| `created_at` | datetime | Ngày tạo |
| `confirmed_at` | datetime | Ngày Owner xác nhận (nếu có) |
| `confirmed_by` | uuid | Owner xác nhận |

### 8.2. Trạng thái liên quan Owner

| Trạng thái | Mô tả |
|------------|-------|
| Chờ chủ xác nhận (PENDING_OWNER_CONFIRM) | Sales đã tạo đơn / báo giá kiến nghị; chờ Owner nhập final price và xác nhận. |
| Đã xác nhận (CONFIRMED) | Owner đã xác nhận báo giá; đơn chuyển sang sản xuất / xuất kho. |

### 8.3. Order Items (Chi tiết đơn – View)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID dòng đơn |
| `order_id` | uuid | ID đơn |
| `product_id` | uuid | ID sản phẩm |
| `product_name` | string | Tên sản phẩm |
| `product_variant_id` | uuid | ID biến thể (gỗ, màu) |
| `wood_type_name` | string | Loại gỗ |
| `color_name` | string | Màu |
| `quantity` | number | Số lượng |
| `unit_price` | number | Đơn giá (theo final_price chia hoặc từng dòng) |
| `amount` | number | Thành tiền |
| `specifications` | text/json | Kích thước, ghi chú kỹ thuật (D x R x C, chân, ...) |

### 8.4. Đơn xuất xưởng / Đơn nhập xưởng

| Loại | Mô tả | Trường chính (đề xuất) |
|------|-------|-------------------------|
| **Đơn xuất xưởng** | Đơn xuất kho để giao khách hoặc chuyển xưởng | order_id, export_date, items (product, variant, qty), status, created_by |
| **Đơn nhập xưởng** | Đơn nhập hàng từ NCC về kho/xưởng | supplier_id, import_date, items (product, qty, unit_price), total, status, created_by |

Owner cần **xem** danh sách và chi tiết hai loại đơn này (có thể 2 tab hoặc 2 màn hình con).

### 8.5. Luồng báo giá (Sales ↔ Owner)

1. **Sales** tạo đơn, nhập **giá kiến nghị** (suggested_price).
2. Trạng thái đơn: **Chờ chủ cửa hàng xác nhận**.
3. **Owner** vào màn Đơn hàng → chọn đơn → xem order items → nhập **Final price** (báo giá chính thức) → bấm **Xác nhận**.
4. Hệ thống chuyển trạng thái sang **Đã xác nhận**; có thể ghi log: "Owner xác nhận báo giá đơn #..., final price: ...".

### 8.6. Giao diện đề xuất (Đơn hàng)

- **Danh sách đơn:** Bảng (Mã đơn, Khách, Ngày, Trạng thái, Giá kiến nghị, Final price, Đặt cọc, Thao tác).
- **Filter:** Trạng thái (đặc biệt "Chờ chủ xác nhận"), khoảng ngày, khách hàng.
- **View chi tiết đơn:** Modal hoặc trang riêng: Thông tin khách, Order items (bảng sản phẩm, SL, đơn giá, thành tiền), Suggested price, **Final price** (input), Nút **Xác nhận** (chỉ khi trạng thái Chờ chủ xác nhận).
- **Tab hoặc menu con:** Đơn của khách | Đơn xuất xưởng | Đơn nhập xưởng.

---

## 9. Quản lý tiến độ (Production)

**Route:** `/owner/production`  
**Mục đích:** Tạo product order (lệnh sản xuất / đơn sản xuất), giao việc cho xưởng; Owner và Worker cập nhật/theo dõi tiến độ.

### 9.1. Product Order (Lệnh sản xuất / Đơn sản xuất)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID lệnh sản xuất |
| `product_order_code` | string | Mã lệnh (VD: SX001) |
| `order_id` | uuid | Liên kết đơn hàng khách (nếu có) |
| `order_code` | string | Mã đơn hàng (hiển thị) |
| `status` | enum | CREATED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED |
| `priority` | number/enum | Độ ưu tiên (nếu có) |
| `assigned_to` | uuid | Worker được giao (nếu có) |
| `assigned_at` | datetime | Thời gian giao |
| `started_at` | datetime | Bắt đầu sản xuất |
| `completed_at` | datetime | Hoàn thành |
| `notes` | string | Ghi chú nội bộ |
| `created_by` | uuid | Người tạo (Owner/Sales) |
| `created_at` | datetime | |

### 9.2. Product Order Items (Chi tiết lệnh sản xuất)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID dòng |
| `product_order_id` | uuid | ID lệnh sản xuất |
| `product_id` | uuid | ID sản phẩm |
| `product_variant_id` | uuid | ID biến thể |
| `product_name` | string | Tên sản phẩm |
| `quantity` | number | Số lượng |
| `specifications` | text | Quy cách, kích thước (D x R x C, chân, ...) |
| `progress_status` | enum | PENDING, IN_PROGRESS, DONE |
| `worker_notes` | string | Ghi chú của Worker (nếu có) |

### 9.3. Giao diện đề xuất (Quản lý tiến độ)

- **Nút:** **Tạo lệnh sản xuất** (Product order): chọn đơn hàng (hoặc tạo không gắn đơn), chọn sản phẩm/biến thể, số lượng, quy cách.
- **Danh sách lệnh sản xuất:** Bảng (Mã, Đơn hàng liên kết, Trạng thái, Người phụ trách, Ngày tạo, Tiến độ, Thao tác).
- **Chi tiết lệnh:** Xem từng dòng sản phẩm, trạng thái từng dòng (Pending / Đang làm / Xong); Worker cập nhật tiến độ ở giao diện của họ; Owner xem và theo dõi.

---

## 10. Khách hàng (Customers)

**Route:** `/owner/customers`  
**Mục đích:** Xem và quản lý danh sách khách hàng (Owner có thể chỉ xem, hoặc có quyền sửa tùy thiết kế).

### 10.1. Trường dữ liệu (Khách hàng)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID khách |
| `full_name` | string | Họ tên |
| `phone` | string | Số điện thoại |
| `email` | string | Email (nếu có) |
| `address` | string | Địa chỉ (giao hàng) |
| `customer_type` | enum | LE, SI, QUEN (Lẻ, Sỉ, Quen) – dùng cho chính sách giá |
| `note` | string | Ghi chú (yêu cầu kỹ thuật, sở thích màu, ...) |
| `total_orders` | number | Tổng số đơn (tính từ orders) |
| `total_debt` | number | Công nợ hiện tại (nếu có) |
| `created_at`, `updated_at` | datetime | |

### 10.2. Giao diện đề xuất

- **Bảng:** Tên, SĐT, Email, Loại khách, Địa chỉ, Số đơn, Công nợ, Thao tác.
- **Search:** Tên, SĐT.
- **Filter:** Loại khách (Lẻ/Sỉ/Quen).

---

## 11. Nhà cung cấp (Suppliers)

**Route:** `/owner/suppliers`  
**Mục đích:** Quản lý nhà cung cấp (xưởng nguồn), phục vụ đơn nhập xưởng và công nợ NCC.

### 11.1. Trường dữ liệu (Nhà cung cấp)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | uuid | ID NCC |
| `code` | string | Mã NCC |
| `name` | string | Tên nhà cung cấp / xưởng |
| `contact_name` | string | Người liên hệ |
| `phone` | string | Số điện thoại |
| `email` | string | Email |
| `address` | string | Địa chỉ |
| `tax_code` | string | Mã số thuế (nếu có) |
| `bank_account` | string | Số tài khoản (nếu có) |
| `note` | string | Ghi chú |
| `total_debt` | number | Công nợ hiện tại với NCC |
| `created_at`, `updated_at` | datetime | |

### 11.2. Giao diện đề xuất

- **Bảng:** Mã, Tên, Liên hệ, SĐT, Địa chỉ, Công nợ, Thao tác.
- **Search:** Tên, mã, SĐT.
- **Nút:** Thêm NCC, Sửa, Xem đơn nhập.

---

## 12. Báo cáo (Reports)

**Route:** `/owner/reports`  
**Mục đích:** Owner xem báo cáo doanh thu, công nợ, tồn kho, lợi nhuận (tùy nghiệp vụ).

### 12.1. Các báo cáo đề xuất

| Báo cáo | Trường dữ liệu chính |
|---------|----------------------|
| Doanh thu theo ngày/tháng/năm | Ngày/tháng, Doanh thu, Số đơn |
| Công nợ khách hàng | Khách, Tổng nợ, Đơn còn nợ |
| Công nợ nhà cung cấp | NCC, Tổng nợ |
| Tồn kho | Sản phẩm / biến thể, Số lượng, Đơn giá, Giá trị |
| Lợi nhuận gộp (nếu có) | Doanh thu, Giá vốn, Lợi nhuận |

### 12.2. Giao diện đề xuất

- **Filter:** Khoảng ngày, tháng, năm.
- **Bảng / biểu đồ:** Tùy từng báo cáo (bảng số liệu, biểu đồ cột/đường).

---

## 13. Tóm tắt luồng Owner quan trọng

1. **Báo giá:** Sales nhập giá kiến nghị → Đơn ở trạng thái "Chờ chủ xác nhận" → Owner vào Đơn hàng, xem order items, nhập **Final price** → Owner bấm **Xác nhận** → Đơn chuyển "Đã xác nhận".
2. **System log:** Mọi thao tác quan trọng ghi log: **người thực hiện** (email, role) + **mô tả chi tiết** (description) + entity_type, entity_id.
3. **Stock transaction:** Làm cuối: ghi nhận **sản phẩm nhập**, **sản phẩm xuất**, **sản phẩm hủy** với đầy đủ trường tham chiếu (đơn, phiếu).
4. **Sản phẩm:** Owner xem **sản phẩm thô** / **sản phẩm hoàn thiện**; filter theo **category**; search theo **name**; có nút **Thêm category**.
5. **Product variant:** Search theo **name**; filter theo **wood type**, **color**; có chức năng **thêm wood type**, **thêm color**.
6. **Quản lý tài khoản:** **List tài khoản**, **list trạng thái tài khoản** (Hoạt động / Nghỉ / Khóa).
7. **Đơn hàng:** List đơn khách, **view order items**; xem **đơn xuất xưởng**, **đơn nhập xưởng**; Owner **thêm final price** và **xác nhận**.
8. **Quản lý tiến độ:** **Tạo product order** (lệnh sản xuất), giao việc; theo dõi tiến độ (Worker cập nhật ở giao diện của họ).

---

*Tài liệu này dùng làm căn cứ thiết kế màn hình và API cho vai trò Owner. Có thể bổ sung validation, quyền (permission) chi tiết và API spec từng endpoint khi triển khai.*
