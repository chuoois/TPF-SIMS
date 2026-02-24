# Customer API

Base URL: `/api/sales`

> Tất cả endpoint yêu cầu **cookie `accessToken`** (đăng nhập trước).
> Role được phép: **SALES**, **OWNER**

---

## Hướng dẫn test với Postman

1. **Đăng nhập trước** để lấy cookie:
   ```
   POST http://localhost:3000/api/auth/login
   Body: { "email": "...", "password": "..." }
   ```
2. Postman sẽ tự lưu cookie `accessToken` → Gọi các API bên dưới bình thường.

---

## 1. Lấy danh sách khách hàng

**GET** `/api/sales/customers`

### Query Params (tuỳ chọn)

| Param    | Type   | Mô tả                                 |
| -------- | ------ | ------------------------------------- |
| `search` | string | Tìm theo tên, SĐT, hoặc mã khách hàng |

**Ví dụ có tìm kiếm:**

```
GET http://localhost:3000/api/sales/customers?search=Nguyễn
```

### Response

**200 OK**

```json
[
  {
    "pk_customer_id": "uuid",
    "customer_code": "KH3A7F2B1C",
    "full_name": "Nguyễn Văn A",
    "phone_number": "0901234567",
    "address": "123 Lê Lợi, Q1",
    "email": "a@gmail.com",
    "gender": "Nam",
    "dob": "1990-01-15",
    "customer_type": "Cá nhân",
    "note": null,
    "created_at": "2026-02-23T13:00:00.000Z",
    "updated_at": "2026-02-23T13:00:00.000Z"
  }
]
```

**401** – Chưa đăng nhập / cookie hết hạn.
**403** – Không đủ quyền.

---

## 2. Lấy chi tiết khách hàng

**GET** `/api/sales/customers/:id`

**Ví dụ:**

```
GET http://localhost:3000/api/sales/customers/uuid-cua-khach-hang
```

### Response

**200 OK** – Trả về object khách hàng (cấu trúc giống mảng ở mục 1).

**404** – Không tìm thấy khách hàng.
**500** – Lỗi server.

---

## 3. Tạo hồ sơ khách hàng

**POST** `/api/sales/customers`

### Request Body

| Field          | Type   | Bắt buộc | Mô tả                              |
| -------------- | ------ | -------- | ---------------------------------- |
| `fullName`     | string | ✅       | Họ tên khách hàng                  |
| `phoneNumber`  | string | ❌       | Số điện thoại                      |
| `address`      | string | ❌       | Địa chỉ giao hàng                  |
| `email`        | string | ❌       | Email                              |
| `gender`       | string | ❌       | Giới tính (`Nam`/`Nữ`)             |
| `dob`          | string | ❌       | Ngày sinh (`YYYY-MM-DD`)           |
| `customerType` | string | ❌       | Loại KH (`Cá nhân`/`Doanh nghiệp`) |
| `note`         | string | ❌       | Ghi chú                            |

```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "address": "123 Lê Lợi, Quận 1, TP.HCM",
  "email": "a@gmail.com",
  "gender": "Nam",
  "dob": "1990-01-15",
  "customerType": "Cá nhân",
  "note": ""
}
```

### Response

**201 Created**

```json
{
  "message": "Tạo hồ sơ khách hàng thành công",
  "customer": {
    "pk_customer_id": "uuid",
    "customer_code": "KH3A7F2B1C",
    "full_name": "Nguyễn Văn A"
  }
}
```

**400** – Thiếu `fullName`.
**500** – Lỗi server.

---

## 4. Cập nhật hồ sơ khách hàng

**PUT** `/api/sales/customers/:id`

### Request Body

Gửi các trường cần cập nhật (không cần gửi tất cả):

```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0909999999",
  "address": "456 Trần Hưng Đạo, Q5"
}
```

| Field          | Type   | Mô tả                    |
| -------------- | ------ | ------------------------ |
| `fullName`     | string | Họ tên                   |
| `phoneNumber`  | string | Số điện thoại            |
| `address`      | string | Địa chỉ                  |
| `email`        | string | Email                    |
| `gender`       | string | Giới tính                |
| `dob`          | string | Ngày sinh (`YYYY-MM-DD`) |
| `customerType` | string | Loại khách hàng          |

### Response

**200 OK**

```json
{
  "message": "Cập nhật hồ sơ thành công"
}
```

**404** – Không tìm thấy khách hàng.
**500** – Lỗi server.

---

## 5. Thêm / Cập nhật ghi chú đặc biệt

**PATCH** `/api/sales/customers/:id/note`

### Mô tả

Ghi chú các yêu cầu đặc biệt của khách hàng: ngày giao, màu sơn, vị trí lắp đặt,...

### Request Body

| Field  | Type   | Bắt buộc | Mô tả            |
| ------ | ------ | -------- | ---------------- |
| `note` | string | ✅       | Nội dung ghi chú |

```json
{
  "note": "Giao trước 16h ngày 01/03, sơn màu kem ivory, lắp đặt tầng 3 bên trái"
}
```

### Response

**200 OK**

```json
{
  "message": "Ghi chú đã được cập nhật",
  "note": "Giao trước 16h ngày 01/03, sơn màu kem ivory, lắp đặt tầng 3 bên trái"
}
```

**400** – Thiếu `note`.
**404** – Không tìm thấy khách hàng.
**500** – Lỗi server.
