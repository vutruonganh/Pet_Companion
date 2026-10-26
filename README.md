# PetCompanion

Hệ thống quản lý chăm sóc thú cưng — các cổng giao diện dùng chung hệ thống thiết kế (`core/base.css`) và **một mock API duy nhất**.

## Chạy nhanh

Nhấn đúp **`start.bat`** (tự dùng Node.js nếu có, không thì dùng Python), rồi mở http://localhost:4000/

Hoặc chạy thủ công:

```bash
node mock-api/server.js      # nếu đã cài Node.js
python mock-api/server.py    # nếu chỉ có Python 3
```

Mở trực tiếp một trang bằng `file://` cũng được: `core/api.js` tự gọi `http://localhost:4000/api/v1`, nhưng server vẫn phải đang chạy.

## Các cổng

| Cổng | Đường dẫn |
| --- | --- |
| Chọn vai trò | `/index.html` |
| Chủ nuôi | `/owner/owner-pets.html` |
| Quản trị viên | `/admin/dashboard.html` |
| Đối tác dịch vụ | `/provider/provider-appointment-list.html` |
| Huấn luyện viên | `/Trainer/training-plans.html` |
| Đăng nhập / Đăng ký | `/login%20register/login.html` |
| Quên mật khẩu / OTP / đặt lại mật khẩu | `/login%20register/forgot-password.html` |

Tài khoản demo (mật khẩu `demo123`): `owner@demo.com`, `provider@demo.com`, `trainer@demo.com`, `admin@demo.com`, `locked@demo.com`.

Logo ở mọi trang dùng chung `assets/logoPet-trim.png` và liên kết về `/index.html`. Luồng quên mật khẩu: `login.html` → `forgot-password.html` (gửi OTP mô phỏng) → `otp-verification.html` (nhập mã 6 số) → `reset-password.html` (kiểm tra độ mạnh, xác nhận mật khẩu) → quay lại đăng nhập.

## Một nguồn dữ liệu

```
mock-api/seed.json   # dữ liệu gốc, không bị ghi đè
mock-api/db.json     # dữ liệu đang chạy, mọi POST/PUT/PATCH/DELETE ghi vào đây
```

- Server chép `seed.json` → `db.json` khi `db.json` chưa tồn tại.
- `POST /api/reset` (hoặc `await PC.api.reset()` trong Console) khôi phục `db.json` từ `seed.json`.
- Mọi cổng — chủ nuôi, quản trị, đối tác, huấn luyện viên, đăng nhập/đăng ký — đều đọc/ghi qua REST, không còn localStorage.

### Resource dùng chung

| Resource | Dùng bởi | Ghi chú |
| --- | --- | --- |
| `users` | Admin (danh bạ người dùng) | vai trò `chu-nuoi`, `bac-si`, `hlv`, `spa` |
| `accounts` | Đăng nhập / đăng ký / HLV | vai trò `owner`, `provider`, `trainer`, `admin`; có `password` |
| `pets` | Chủ nuôi (hồ sơ thú cưng) | hồ sơ đầy đủ: ảnh, cân nặng, vắc-xin... |
| `training-pets` | HLV (giáo án, nhật ký) | hồ sơ rút gọn dùng trong huấn luyện |
| `exercises`, `trainingPlans`, `trainingLogs` | HLV | thư viện bài tập, giáo án, nhật ký buổi tập |
| `summaries`, `petHealth`, `chats` | HLV | bắt đầu rỗng, được tạo trong quá trình dùng |
| `appointments`, `calendar-events`, `service-notes` | Đối tác | lịch hẹn, lịch làm việc, ghi chú khám |
| `services`, `dashboard-appointments`, `care-plans`, `medical-records` | Admin / Chủ nuôi | dịch vụ, dashboard, lịch chăm sóc, bệnh án |

`mock-api/api.js` giữ nguyên API quen thuộc của cổng HLV nhưng chuyển tiếp sang REST:

```js
PC.api.list('users')   // → GET /api/v1/accounts
PC.api.list('pets')    // → GET /api/v1/training-pets
PC.api.list('trainingPlans') // → GET /api/v1/trainingPlans
```

## API

`/api/v1/<resource>[/<id>]` — GET, POST, PUT, PATCH, DELETE.

- `GET /api/v1/<resource>?search=...` tìm trong toàn bộ JSON của bản ghi.
- Lọc chính xác theo trường: `?status=active`, `?role=trainer`...
- Sắp xếp / phân trang: `?sortBy=name&order=asc&page=1&limit=10`.
- `POST /api/reset` khôi phục dữ liệu gốc; `GET /api/health` trả số bản ghi từng resource.
- `?fail=1` và `?empty=1` trên URL để thử trạng thái lỗi / danh sách rỗng ở cổng HLV.

## Cấu trúc

```
index.html                  # chọn vai trò
core/base.css               # design system dùng chung: token, topnav, card, table, modal, toast
core/base.js                # UI.toast, modal open/close, fallback ảnh đại diện
core/api.js                 # client REST duy nhất (window.MockAPI)
owner/                      # cổng chủ nuôi
admin/                      # cổng quản trị viên
provider/                   # cổng đối tác dịch vụ
Trainer/                    # cổng huấn luyện viên (HLV)
login register/             # đăng nhập / đăng ký / quên mật khẩu / OTP / đặt lại mật khẩu
mock-api/seed.json          # dữ liệu gốc
mock-api/db.json            # dữ liệu đang chạy
mock-api/api.js             # adapter PC.api → REST + tiện ích UI/session cho cổng HLV
mock-api/server.js          # mock REST API + static server (Node.js)
mock-api/server.py          # bản tương đương cho máy chỉ có Python
```

## Ghi chú cổng chủ nuôi

Ba trang gốc (`hồ sơ thú cưng của tôi`, `lịch sử chăm sóc`, `lịch sử dịch vụ và bệnh án`) mỗi trang tự viết CSS và trỏ tới `style.css` / `script.js` không tồn tại. Bản trong `owner/` thay thế chúng:

- dùng chung `core/base.css` + `owner.css`, cùng topnav/footer/nav nên chuyển trang được;
- dữ liệu đọc từ mock API thay vì HTML tĩnh;
- thêm thú cưng, chấp nhận đề xuất AI, đặt/hủy lịch đều ghi vào `db.json`;
- đặt lịch với HLV: chọn huấn luyện viên đang hoạt động và gói trong `services`, lưu vào `care-plans` kèm `trainerId`/`trainerEmail`, trạng thái `pending` (chờ HLV xác nhận).
