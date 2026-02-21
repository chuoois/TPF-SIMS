# Auth API

Base URL: `/api/auth`

> Tất cả các endpoint trong nhóm này **không yêu cầu xác thực** (public), ngoại trừ Logout (cần cookie `refreshToken`).

---

## 1. Đăng nhập

**POST** `/api/auth/login`

### Request Body

| Field      | Type   | Bắt buộc | Mô tả         |
|------------|--------|-----------|---------------|
| `email`    | string | ✅        | Email tài khoản |
| `password` | string | ✅        | Mật khẩu      |

```json
{
  "email": "owner1@gmail.com",
  "password": "654321"
}
```

### Response

**200 OK** – Đăng nhập thành công. Trả về cookie `accessToken` (15 phút) và `refreshToken` (7 ngày).

```json
{
  "message": "Đăng nhập thành công",
  "role": "OWNER",
  "user": "owner1@gmail.com"
}
```

**400** – Thiếu email hoặc mật khẩu.
**401** – Sai mật khẩu.
**404** – Tài khoản không tồn tại.
**500** – Lỗi server.

---

## 2. Đăng xuất

**POST** `/api/auth/logout`

### Mô tả
Xóa cookie `accessToken`, `refreshToken` và xóa refresh token trong DB.

### Response

**200 OK**

```json
{
  "message": "Đăng xuất thành công"
}
```

**500** – Lỗi server.

---

## 3. Làm mới Access Token

**POST** `/api/auth/refresh-token`

### Mô tả
Sử dụng `refreshToken` trong cookie để tạo mới `accessToken` và `refreshToken` (Refresh Token Rotation).

### Response

**200 OK** – Trả về cookie `accessToken` và `refreshToken` mới.

```json
{
  "message": "Refreshed"
}
```

**401** – Không tìm thấy refresh token.
**403** – Refresh token không hợp lệ hoặc đã hết hạn.
**500** – Lỗi server.

---

## 4. Quên mật khẩu

**POST** `/api/auth/forgot-password`

### Request Body

| Field   | Type   | Bắt buộc | Mô tả         |
|---------|--------|-----------|---------------|
| `email` | string | ✅        | Email tài khoản |

```json
{
  "email": "owner1@gmail.com"
}
```

### Mô tả
Tạo mật khẩu ngẫu nhiên mới (10 ký tự) và gửi về email. Tất cả refresh token hiện có sẽ bị xóa (buộc đăng nhập lại).

> **Bảo mật:** Dù email không tồn tại, server vẫn trả về `200` để tránh tiết lộ thông tin tài khoản.

### Response

**200 OK**

```json
{
  "message": "Mật khẩu mới đã được gửi đến email của bạn"
}
```

**400** – Thiếu email.
**500** – Lỗi server.
