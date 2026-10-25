# PetCompanion

Hệ thống quản lý chăm sóc thú cưng — các cổng giao diện dùng chung hệ thống thiết kế (`core/base.css`) và một mock API.

## Chạy nhanh

Nhấn đúp **`start.bat`** (tự dùng Node.js nếu có, không thì dùng Python), rồi mở http://localhost:4000/

Hoặc chạy thủ công:

```bash
node mock-api/server.js      # nếu đã cài Node.js
python mock-api/server.py    # nếu chỉ có Python 3
```

Mở trực tiếp `owner/owner-pets.html` bằng file:// cũng được, khi đó `core/api.js` tự gọi `http://localhost:4000/api/v1` — vẫn cần server mock API đang chạy.

## Các cổng

| Cổng | Đường dẫn |
| --- | --- |
| Chọn vai trò | `/index.html` |
| Chủ nuôi | `/owner/owner-pets.html` |
| Quản trị viên | `/admin/dashboard.html` |
| Đối tác dịch vụ | `/provider/provider-appointment-list.html` |
| Huấn luyện viên | `/Trainer/training-plans.html` |
| Đăng nhập / Đăng ký | `/login register/login.html` |

## Cấu trúc

```
index.html                  # chọn vai trò
core/base.css               # design system dùng chung: token, topnav, card, table, modal, toast
core/base.js                # UI.toast, modal open/close, fallback ảnh đại diện
core/api.js                 # client gọi mock API (window.MockAPI)
owner/                      # CỔNG CHỦ NUÔI
  owner.css                 # component riêng của cổng chủ nuôi
  owner-common.js           # shell dùng chung: topnav, footer, helper format
  owner-pets.html/.js       # Hồ sơ thú cưng + thêm thú cưng mới
  owner-care.html/.js       # Lịch chăm sóc, lịch tháng, đề xuất AI, đặt lịch
  owner-records.html/.js    # Lịch sử dịch vụ & bệnh án, chi tiết hồ sơ, xuất JSON
admin/                      # cổng quản trị viên
provider/                   # cổng đối tác dịch vụ
Trainer/                    # cổng huấn luyện viên
login register/             # đăng nhập / đăng ký
mock-api/server.js          # mock REST API + static server (Node.js)
mock-api/server.py          # bản tương đương cho máy chỉ có Python
mock-api/db.json            # dữ liệu seed (pets, care-plans, medical-records, ...)
```

## API

`/api/v1/<resource>[/<id>]` — GET, POST, PUT, PATCH, DELETE.

Resource của cổng chủ nuôi: `pets`, `care-plans`, `medical-records`.
Thêm `/api/health` để kiểm tra, `POST /api/reset` để khôi phục dữ liệu gốc.

## Ghi chú cổng chủ nuôi

Ba trang gốc (`hồ sơ thú cưng của tôi`, `lịch sử chăm sóc`, `lịch sử dịch vụ và bệnh án`) mỗi trang tự viết CSS và trỏ tới `style.css` / `script.js` không tồn tại. Bản trong `owner/` thay thế chúng:

- dùng chung `core/base.css` + `owner.css`, cùng topnav/footer/nav nên chuyển trang được;
- dữ liệu đọc từ mock API thay vì HTML tĩnh;
- thêm thú cưng, chấp nhận đề xuất AI, đặt/hủy lịch đều ghi vào `db.json`.
