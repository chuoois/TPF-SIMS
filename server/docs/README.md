# API Documentation – TPF-SIMS Server

Tài liệu API cho hệ thống TPF-SIMS. Base URL mặc định: `http://localhost:<PORT>/api`

## Xác thực (Authentication)

Hệ thống sử dụng **JWT** lưu trong **HttpOnly Cookie**:

| Cookie         | Thời hạn | Mô tả                        |
|----------------|----------|------------------------------|
| `accessToken`  | 15 phút  | Dùng để xác thực mỗi request |
| `refreshToken` | 7 ngày   | Dùng để làm mới access token |

---

## Nhóm API

| Nhóm    | Base Path      | Mô tả                                      | Tài liệu                  |
|---------|----------------|--------------------------------------------|---------------------------|
| Auth    | `/api/auth`    | Đăng nhập, Đăng xuất, Refresh Token, Quên mật khẩu | [auth.md](./auth.md)     |
| Common  | `/api/common`  | Xem/Cập nhật hồ sơ, Đổi mật khẩu (mọi role)        | [common.md](./common.md) |
| Owner   | `/api/owner`   | Quản lý tài khoản nhân viên (role: OWNER)            | [owner.md](./owner.md)   |

---

## Mã lỗi chung

| HTTP Code | Ý nghĩa                           |
|-----------|-----------------------------------|
| `200`     | Thành công                        |
| `201`     | Tạo mới thành công                |
| `400`     | Dữ liệu đầu vào không hợp lệ     |
| `401`     | Chưa xác thực (thiếu/sai token)  |
| `403`     | Không có quyền truy cập           |
| `404`     | Không tìm thấy tài nguyên         |
| `500`     | Lỗi server                        |

---

## Roles

| Role Code | Mô tả              |
|-----------|--------------------|
| `OWNER`   | Chủ hệ thống – toàn quyền quản lý tài khoản |
| `STAFF`   | Nhân viên – chỉ xem/sửa hồ sơ cá nhân       |
