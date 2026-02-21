# Owner API – Quản lý Tài khoản

Base URL: `/api/owner`

> 🔒 **Tất cả endpoint yêu cầu:**
> - Cookie `accessToken` hợp lệ
> - Role: `OWNER`

---

## 1. Tạo tài khoản mới

**POST** `/api/owner/accounts`

### Request Body

| Field          | Type   | Bắt buộc | Mô tả                                  |
|----------------|--------|-----------|----------------------------------------|
| `email`        | string | ✅        | Email đăng nhập                        |
| `password`     | string | ✅        | Mật khẩu                               |
| `roleCode`     | string | ✅        | Mã role (ví dụ: `OWNER`, `STAFF`, ...) |
| `fullName`     | string |           | Họ và tên                              |
| `phoneNumber`  | string |           | Số điện thoại                          |
| `dob`          | string |           | Ngày sinh (ISO 8601, ví dụ: `1999-12-31`) |
| `gender`       | number |           | Giới tính (0 = Nữ, 1 = Nam)            |
| `salaryType`   | number |           | Loại lương                             |

```json
{
  "email": "staff@example.com",
  "password": "securePassword123",
  "roleCode": "STAFF",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "dob": "1999-05-20",
  "gender": 1,
  "salaryType": 1
}
```

### Response

**201 Created**

```json
{
  "message": "Tạo tài khoản thành công",
  "account": {
    "id": "uuid",
    "email": "staff@example.com",
    "role": "STAFF"
  }
}
```

**400** – Email đã tồn tại hoặc role không hợp lệ.
**500** – Lỗi server.

---

## 2. Lấy danh sách tất cả tài khoản

**GET** `/api/owner/accounts`

### Mô tả
Trả về danh sách toàn bộ tài khoản kèm thông tin profile và role.

### Response

**200 OK**

```json
[
  {
    "pk_user_account_id": "uuid",
    "email": "staff@example.com",
    "status": 1,
    "timestamp": "2026-02-18T08:00:00.000Z",
    "role": {
      "role_code": "STAFF",
      "role_name": "Nhân viên"
    },
    "profile": {
      "full_name": "Nguyễn Văn A",
      "phone_number": "0901234567",
      "dob": "1999-05-20",
      "gender": 1,
      "salary_type": 1
    }
  }
]
```

**500** – Lỗi server.

---

## 3. Lấy thông tin tài khoản theo ID

**GET** `/api/owner/accounts/:id`

### Path Parameter

| Param | Type   | Mô tả                    |
|-------|--------|--------------------------|
| `id`  | string | UUID của tài khoản cần xem |

### Response

**200 OK** – Trả về chi tiết tài khoản (không bao gồm `password_hash`).

**404** – Không tìm thấy tài khoản.
**500** – Lỗi server.

---

## 4. Cập nhật tài khoản

**PUT** `/api/owner/accounts/:id`

### Path Parameter

| Param | Type   | Mô tả                        |
|-------|--------|------------------------------|
| `id`  | string | UUID của tài khoản cần cập nhật |

### Request Body

Tất cả các trường là **tùy chọn**. Chỉ các trường được gửi lên mới được cập nhật.

| Field         | Type   | Mô tả                                  |
|---------------|--------|----------------------------------------|
| `status`      | number | Trạng thái tài khoản (0 = Inactive, 1 = Active) |
| `roleCode`    | string | Mã role mới                            |
| `fullName`    | string | Họ và tên                              |
| `phoneNumber` | string | Số điện thoại                          |
| `dob`         | string | Ngày sinh (ISO 8601)                   |
| `gender`      | number | Giới tính (0 = Nữ, 1 = Nam)            |
| `salaryType`  | number | Loại lương                             |

```json
{
  "status": 0,
  "fullName": "Nguyễn Văn B",
  "roleCode": "STAFF"
}
```

### Response

**200 OK**

```json
{
  "message": "Cập nhật thành công"
}
```

**404** – Không tìm thấy tài khoản.
**500** – Lỗi server.

---

## 5. Xóa tài khoản

**DELETE** `/api/owner/accounts/:id`

### Path Parameter

| Param | Type   | Mô tả                    |
|-------|--------|--------------------------|
| `id`  | string | UUID của tài khoản cần xóa |

### Response

**200 OK**

```json
{
  "message": "Xóa tài khoản thành công"
}
```

**404** – Không tìm thấy tài khoản.
**500** – Lỗi server.

---

## 6. Cập nhật trạng thái tài khoản
 
 **PATCH** `/api/owner/accounts/:id/status`
 
 ### Path Parameter
 
 | Param | Type   | Mô tả                         |
 |-------|--------|-------------------------------|
 | `id`  | string | UUID của tài khoản cần cập nhật |
 
 ### Request Body
 
 | Field    | Type   | Bắt buộc | Mô tả                                         |
 |----------|--------|-----------|-----------------------------------------------|
 | `status` | number | ✅        | Trạng thái mới (-1: Khóa, 0: Nghỉ, 1: Hoạt động) |
 
 ```json
 {
   "status": -1
 }
 ```
 
 ### Response
 
 **200 OK**
 
 ```json
 {
   "message": "Cập nhật trạng thái thành công"
 }
 ```

**404** – Không tìm thấy tài khoản.
**500** – Lỗi server.

---

## 7. Lấy nhật ký hệ thống

**GET** `/api/owner/logs`

### Mô tả
Lấy danh sách 100 thao tác gần nhất trên hệ thống (tạo, sửa, xóa, cập nhật trạng thái, v.v.) để đảm bảo tính minh bạch.

### Response

**200 OK**

```json
[
  {
    "pk_system_log_id": "uuid",
    "description": "Cập nhật trạng thái tài khoản: test@gmail.com thành -1 (ID: uuid)",
    "modified_by": "owner@gmail.com",
    "timestamp": "2026-02-21T03:00:00.000Z",
    "userAccount": {
      "pk_user_account_id": "uuid"
    }
  }
]
```

**500** – Lỗi server.
