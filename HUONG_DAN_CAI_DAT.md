# HƯỚNG DẪN CÀI ĐẶT — Hệ thống quản lý quán cà phê Nắng PR

> Tài liệu hướng dẫn đơn giản, làm theo từng bước là chạy được.

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ | Cổng |
|------------|-----------|------|
| Giao diện (Frontend) | React + Tailwind CSS | `http://localhost:3000` |
| Máy chủ (Backend) | Node.js + Express | `http://localhost:3001` |
| Cơ sở dữ liệu | MySQL | — |

---

## 2. Cài đặt phần mềm cần thiết

Cài 2 thứ sau (bản mới nhất là được):

1. **Node.js** — tải tại https://nodejs.org
2. **XAMPP** (có sẵn MySQL) — tải tại https://www.apachefriends.org

Sau khi cài xong, mở **XAMPP Control Panel** và bấm **Start** ở dòng **MySQL**.

> Kiểm tra nhanh: mở CMD gõ `node -v` — nếu ra số version là Node.js đã cài OK.

---

## 3. Tạo cơ sở dữ liệu

1. Mở trình duyệt vào **http://localhost/phpmyadmin**
2. Bấm menu **Import** (Nhập)
3. Chọn file **`backend/quan_cafe.sql`** (nằm trong thư mục dự án)
4. Bấm **Go / Thực hiện**

Xong — database `quan_cafe` đã có đầy đủ bảng và dữ liệu mẫu.

> Nếu máy bạn dùng MySQL khác (không phải XAMPP), đổi thông tin kết nối tại file `backend/db.js`:
> `host`, `user`, `password`, `database`.

---

## 4. Chạy Backend (cổng 3001)

Mở CMD tại thư mục dự án, chạy:

```bash
cd backend
npm install
npm start
```

Thấy dòng sau là thành công:

```
=== NANG PR COFFEE - KHOI DONG HE THONG ===
Server dang chay: http://localhost:3001
```

---

## 5. Chạy Frontend (cổng 3000)

Mở **một CMD khác** (giữ nguyên cửa sổ backend đang chạy), chạy:

```bash
cd frontend
npm install
npm start
```

Trình duyệt tự mở trang **http://localhost:3000** — nhập tài khoản đăng nhập là xong.

---

## 6. Đăng nhập

Tài khoản mặc định trong file SQL:

- **Tên đăng nhập:** `admin`

> Mật khẩu gốc trong file SQL bị mã hóa (bcrypt). Nếu không nhớ mật khẩu, vào phpMyAdmin chạy lệnh sau để **đặt lại mật khẩu thành `123456`**:

```sql
USE quan_cafe;
UPDATE chuquan
SET mat_khau = '$2b$10$cJ/3NghlzIzngDK6JQ6nOOX69ZbaXYEffbNWMOouYDq7XNh5Xvoay'
WHERE ten_dang_nhap = 'admin';
```

Sau đó đăng nhập với `admin` / `123456`.

---

## 7. Tóm tắt nhanh (khi đã cài xong)

Mỗi lần muốn chạy lại, chỉ cần:

1. XAMPP → Start **MySQL**
2. Mở 2 cửa sổ CMD:
   - `cd backend` → `npm start`
   - `cd frontend` → `npm start`
3. Vào **http://localhost:3000** và đăng nhập

---

## 8. Các lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|-----------|
| `ECONNREFUSED` / `ER_ACCESS_DENIED` | Chưa Start MySQL trong XAMPP, hoặc sai user/password trong `backend/db.js` |
| `Unknown database 'quan_cafe'` | Chưa import file `backend/quan_cafe.sql` (xem bước 3) |
| Cổng 3000/3001 đã bị chiếm | Tắt tiến trình khác đang dùng cổng, hoặc đổi cổng trong `backend/src/config/constants.js` |
| Trang web lỗi đăng nhập | Kiểm tra backend đã chạy chưa (bước 4) |
