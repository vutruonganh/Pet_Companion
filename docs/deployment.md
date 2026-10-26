# Triển khai & vận hành

Tài liệu này mô tả cách chạy PetCompanion trên máy cá nhân, cách bản deploy Render đang hoạt động, và quy trình kiểm tra sau khi deploy. Mọi lệnh đều chạy từ **thư mục gốc repo** (nơi có `index.html` và `mock-api/`).

## 1. Tóm tắt nhanh

| Mục | Giá trị |
| --- | --- |
| Ứng dụng | Website tĩnh 18 trang + 1 mock REST API |
| Cổng mặc định | `4000` |
| Địa chỉ local | http://localhost:4000/ |
| Trang đăng nhập | http://localhost:4000/login%20register/login.html |
| Health check | http://localhost:4000/api/health |
| Deploy công khai | https://pet-companion-1.onrender.com |
| Nền tảng deploy | Render (Node.js Web Service) |
| Cold start | khoảng 20–30 giây sau khi service ngủ |
| Dữ liệu chạy | `mock-api/db.json`, khởi tạo từ `mock-api/seed.json` |
| Phụ thuộc npm | Không có; server chỉ dùng module lõi của Node |

## 2. Chạy cục bộ

### 2.1. Cách nhanh nhất trên Windows

Nhấn đúp **`Chay-PetCompanion.bat`**.

Script sẽ:

1. Kiểm tra `http://127.0.0.1:4000/api/health`; nếu server đã chạy thì chỉ mở trình duyệt.
2. Tìm Node.js theo thứ tự: `node` trong PATH → `%ProgramFiles%\nodejs\node.exe` → `%LOCALAPPDATA%\Programs\nodejs\node.exe`.
3. Nếu không có Node.js, thử dùng Node tích hợp trong Qoder (`ELECTRON_RUN_AS_NODE=1`).
4. Mở một cửa sổ console thu nhỏ chạy `node mock-api\server.js`.
5. Chờ tối đa khoảng 12 giây cho `/api/health` trả 200 rồi mở trang đăng nhập.

> Cửa sổ **“PetCompanion Mock API”** phải được giữ mở trong suốt buổi demo. Đóng cửa sổ đó là tắt server.

Nếu máy không có Node.js và không có Qoder, script báo lỗi và dừng; khi đó dùng Python (mục 2.3).

### 2.2. Chạy bằng Node.js thủ công

```bash
node mock-api/server.js
```

Mở http://localhost:4000/. Server phục vụ cả API và file tĩnh, nên không cần mở thêm Live Server.

### 2.3. Chạy bằng Python

```bash
python mock-api/server.py
```

Bản Python tương đương bản Node: cùng route `/api/v1/<resource>`, cùng `db.json`, cùng cổng 4000. Chỉ dùng khi máy không có Node.js.

### 2.4. Mở trực tiếp bằng `file://`

Có thể mở `login register/login.html` trực tiếp từ File Explorer. Khi đó `core/api.js` tự trỏ API về `http://localhost:4000/api/v1`, nhưng **server vẫn phải đang chạy**. Cách này tiện cho kiểm tra nhanh, không nên dùng khi demo vì một số trình duyệt chặn `fetch` từ `file://`.

### 2.5. Đổi cổng

```bash
# Windows PowerShell
$env:PORT=5000; node mock-api/server.js

# Git Bash / macOS / Linux
PORT=5000 node mock-api/server.js
```

Khi đổi cổng, phải sửa URL đang mở cho khớp. Nếu mở bằng `file://`, `core/api.js` vẫn gọi cổng 4000; hãy đặt `window.MOCK_API_BASE` trước khi nạp `core/api.js`, hoặc chạy server ở cổng 4000.

## 3. Cấu hình server

`mock-api/server.js`:

- Đọc cổng từ `process.env.PORT`, mặc định `4000`.
- Lắng nghe trên `0.0.0.0` để Render truy cập được.
- Phục vụ file tĩnh từ thư mục gốc repo.
- Cung cấp `/api/v1/<resource>` và `/api/health`.
- Khi khởi động, nếu `mock-api/db.json` chưa có thì chép từ `mock-api/seed.json`.
- Mọi thao tác ghi (POST/PUT/PATCH/DELETE) cập nhật `mock-api/db.json`.
- `POST /api/reset` chép lại `seed.json` → `db.json`.

Không có `package.json`, `render.yaml`, biến môi trường bí mật hay API key. Đây là mock API phục vụ học tập, **không dùng cho dữ liệu thật**.

## 4. Triển khai trên Render

### 4.1. Hiện trạng

- URL công khai: **https://pet-companion-1.onrender.com**
- Trang vào: `/login%20register/login.html` (hoặc `/` nếu `index.html` chuyển hướng).
- Service chạy Node.js, start command `node mock-api/server.js`, root directory là thư mục gốc repo.
- Repo **không có** `render.yaml` hay `package.json`; cấu hình được tạo tay trên dashboard Render.
- Gói free: service ngủ sau một thời gian không truy cập; lần mở đầu tiên mất khoảng 20–30 giây.
- Ổ đĩa của Render free là tạm thời: `db.json` có thể trở về dữ liệu seed sau khi service restart/redeploy.

### 4.2. Tạo lại service (khi cần)

1. Đăng nhập Render → **New** → **Web Service**.
2. Kết nối GitHub repo `vutruonganh/Pet_Companion`.
3. Chọn branch cần deploy (`main` cho bản ổn định).
4. Runtime: **Node**.
5. Build Command: để trống.
6. Start Command: `node mock-api/server.js`.
7. Health Check Path: `/api/health` (không bắt buộc nhưng nên đặt).
8. Instance: Free.
9. **Create Web Service**, chờ build và mở URL Render cấp.

Không cần `npm install` vì không có dependency ngoài module lõi.

### 4.3. Dữ liệu trên môi trường deploy

- Lần đầu service khởi động, `db.json` được tạo từ `seed.json`.
- Dữ liệu thêm/sửa trong lúc demo chỉ tồn tại trên instance đang chạy.
- Khi Render restart, redeploy hoặc service ngủ quá lâu, `db.json` có thể trở về seed. Đây là hành vi đã biết, không phải lỗi.
- Gọi `POST /api/reset` để đưa dữ liệu về trạng thái sạch và thống nhất.

### 4.4. Kiểm tra sau khi deploy

1. Mở `/api/health`, xác nhận JSON có số bản ghi từng resource.
2. Mở trang đăng nhập bằng cửa sổ **ẩn danh**.
3. Đăng nhập lần lượt 4 tài khoản demo và xác nhận đúng trang đích:
   - `owner@demo.com` → `owner/owner-pets.html`
   - `provider@demo.com` → `provider/provider-appointment-list.html`
   - `trainer@demo.com` → `Trainer/training-plans.html`
   - `admin@demo.com` → `admin/dashboard.html`
4. Kiểm tra Console và Network: không có 404 cho ảnh, CSS, JS.
5. Thử một thao tác ghi ở mỗi cổng (thêm thú cưng, đổi trạng thái lịch hẹn, gửi báo cáo HLV) rồi F5 để xác nhận dữ liệu còn.
6. Mở trên điện thoại hoặc giả lập 375px: không có thanh cuộn ngang.

## 5. Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| `EADDRINUSE` / cổng 4000 bận | Một server cũ còn chạy | Đóng cửa sổ “PetCompanion Mock API” hoặc chạy `PORT=5000 node mock-api/server.js` |
| Trang mở nhưng mọi danh sách trống | Server chưa chạy hoặc API sai cổng | Mở `/api/health`; kiểm tra cổng trong `core/api.js` |
| `Failed to fetch` trên Render | Cold start chưa xong | Chờ 20–30 giây rồi F5 |
| Dữ liệu vừa thêm biến mất | Render restart hoặc gọi reset | Chạy lại thao tác; chấp nhận đây là mock |
| Ảnh đại diện vỡ | Đường dẫn tương đối sai khi mở `file://` | Chạy qua server HTTP |
| Đăng nhập xong quay lại login | Session bị xóa hoặc sai mật khẩu | Kiểm tra `localStorage` khóa `pc_mock_v1:session`; dùng `demo123` |
| `?fail=1` không có tác dụng | Chỉ các trang Trainer đi qua `PC.api` | Demo trạng thái lỗi trên `Trainer/training-plans.html` hoặc `progress.html` |

## 6. Bảo mật & giới hạn

- Mật khẩu trong `seed.json` là **dữ liệu demo**, lưu dạng chữ thường. Không tái sử dụng mật khẩu thật.
- Không có xác thực phía server; session chỉ là `localStorage`. Người dùng có thể sửa vai trò bằng DevTools.
- API không có phân quyền; mọi client đều gọi được mọi resource.
- Không đặt API key, token hay thông tin cá nhân thật trong repo.
- Đây là sản phẩm bài tập, không dùng để lưu hồ sơ thú cưng thật.

