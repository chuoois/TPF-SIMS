# Common API – Hồ sơ & Mật khẩu

Base URL: `/api/common`

> 🔒 **Tất cả endpoint yêu cầu** cookie `accessToken` hợp lệ. Dành cho **tất cả** các role đã đăng nhập.

---

## 1. Xem hồ sơ cá nhân

**GET** `/api/common/profile`

### Mô tả
Trả về thông tin tài khoản và hồ sơ của người dùng đang đăng nhập (lấy từ `accessToken`).

### Response

**200 OK**

```json
{
  "pk_user_account_id": "uuid",
  "email": "user@example.com",
  "status": 1,
  "role": {
    "role_code": "STAFF",
    "role_name": "Nhân viên"
  },
  "profile": {
    "full_name": "Nguyễn Văn A",
    "phone_number": "0901234567",
    "dob": "1999-05-20",
    "gender": 1
  }
}
```

**401** – Chưa đăng nhập / token không hợp lệ.
**404** – Người dùng không tồn tại.
**500** – Lỗi server.

---

## 2. Cập nhật hồ sơ cá nhân

**PUT** `/api/common/profile`

### Mô tả
Cập nhật thông tin hồ sơ của người dùng đang đăng nhập. Nếu chưa có profile thì sẽ tạo mới.

### Request Body

Tất cả các trường là **tùy chọn**. Chỉ những trường được gửi lên mới được cập nhật.

| Field          | Type   | Mô tả                         |
|----------------|--------|-------------------------------|
| `full_name`    | string | Họ và tên                     |
| `phone_number` | string | Số điện thoại                 |
| `dob`          | string | Ngày sinh (ISO 8601)          |
| `gender`       | number | Giới tính (0 = Nữ, 1 = Nam)   |

```json
{
  "full_name": "Nguyễn Thị B",
  "phone_number": "0987654321",
  "dob": "2000-01-15",
  "gender": 0
}
```

### Response

**200 OK**

```json
{
  "message": "Cập nhật hồ sơ thành công"
}
```

**401** – Chưa đăng nhập / token không hợp lệ.
**404** – Người dùng không tồn tại.
**500** – Lỗi server.

---

## 3. Đổi mật khẩu

**PUT** `/api/common/change-password`

### Request Body

| Field         | Type   | Bắt buộc | Mô tả          |
|---------------|--------|-----------|----------------|
| `oldPassword` | string | ✅        | Mật khẩu hiện tại |
| `newPassword` | string | ✅        | Mật khẩu mới   |

```json
{
  "oldPassword": "current_password",
  "newPassword": "new_secure_password"
}
```

### Response

**200 OK**

```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**400** – Thiếu thông tin hoặc mật khẩu cũ không chính xác.
**401** – Chưa đăng nhập / token không hợp lệ.
**404** – Người dùng không tồn tại.
**500** – Lỗi server.
