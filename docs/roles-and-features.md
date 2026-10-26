# Vai trò và tính năng

Tài liệu trả lời 10 câu hỏi phân tích vai trò theo barem, sau đó mô tả vòng đời CRUD, màn hình dùng chung và luồng liên vai trò thực tế trong mã nguồn.

## 1. Chủ nuôi (Pet Owner)

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Họ là ai? | Nguyễn Văn An, chủ nuôi 5 thú cưng (Milo, Luna, Bông, Simba…), đăng nhập bằng `owner@demo.com` |
| 2 | Vào hệ thống để làm gì? | Quản lý hồ sơ pet, không quên lịch chăm sóc, đặt dịch vụ, tra cứu lịch sử và nhận báo cáo từ HLV |
| 3 | Màn hình đầu tiên | `owner/owner-pets.html` |
| 4 | Tạo gì? | Thêm thú cưng; tạo lịch chăm sóc; đặt ca hẹn qua modal; chấp nhận đề xuất AI-1 để tạo care-plan |
| 5 | Sửa gì? | Chấp nhận/điều chỉnh đề xuất AI trước khi lưu; hủy lịch chăm sóc; lọc/tìm kiếm hồ sơ |
| 6 | Hủy/xóa gì? | Hủy lịch chăm sóc (`care-plans.status = cancelled`); không có xóa cứng pet |
| 7 | Tìm kiếm/lọc gì? | Tìm theo tên/giống/mã chip; lọc Tất cả / Chó / Mèo / Khỏe mạnh / Cần tái khám; lọc lịch sử theo pet, loại dịch vụ, thời gian |
| 8 | Dashboard nào? | Thẻ thống kê số pet, lịch sắp tới, báo cáo HLV; lịch tháng và danh sách lịch sắp tới |
| 9 | AI hỗ trợ ở đâu? | AI-1 Care Reminder Assistant trong `owner-care.html`; thẻ “Báo cáo từ HLV” hiển thị kết quả AI-3 do HLV gửi |
| 10 | Tương tác vai trò khác thế nào? | Đặt lịch → đối tác nhận ca; nhận báo cáo HLV; xem bệnh án do đối tác tạo |

**Màn hình:** `owner-pets.html`, `owner-care.html`, `owner-records.html`.

**Điểm mạnh:** dữ liệu thật từ API, thêm pet ghi vào `db.json`, lịch tháng tương tác, báo cáo HLV hiển thị đúng trạng thái `sent`.

**Giới hạn hiện tại:** chưa có sửa/xóa pet; chưa có trang hồ sơ cá nhân/cài đặt riêng; AI-1 chưa có trạng thái thất bại rõ ràng.

## 2. Đối tác dịch vụ (Service Provider)

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Họ là ai? | Bác sĩ/groomer tại phòng khám, đăng nhập bằng `provider@demo.com` |
| 2 | Vào hệ thống để làm gì? | Xem lịch làm việc, tiếp nhận ca, hoàn tất dịch vụ, ghi biên bản và checklist an toàn |
| 3 | Màn hình đầu tiên | `provider/provider-appointment-list.html` |
| 4 | Tạo gì? | Ca walk-in; sự kiện lịch; biên bản dịch vụ; medical-record sau khi ký |
| 5 | Sửa gì? | Trạng thái ca (`pending → processing → completed`); nội dung biên bản, checklist, chi phí |
| 6 | Hủy/xóa gì? | Hủy ca ở danh sách; xóa sự kiện lịch; không xóa cứng biên bản đã ký |
| 7 | Tìm kiếm/lọc gì? | Tìm theo tên bé, chủ nuôi, mã `#APT`; lọc trạng thái và loại dịch vụ; lọc lịch theo phòng/bác sĩ/ngày |
| 8 | Dashboard nào? | Lịch ngày/tuần, timeline theo phòng, thống kê ca trong ngày |
| 9 | AI hỗ trợ ở đâu? | AI-2 Service Checklist trong `provider-service-note.html` |
| 10 | Tương tác vai trò khác thế nào? | Nhận ca do chủ nuôi đặt; ghi biên bản → chủ nuôi thấy trong lịch sử; quản trị duyệt ca trên dashboard |

**Màn hình:** `provider-appointment-list.html`, `provider-calendar.html`, `provider-service-note.html`.

**Điểm mạnh:** tìm kiếm + 2 bộ lọc kết hợp, trạng thái ca rõ, walk-in tạo được appointment + calendar-event, biên bản có autosave nháp.

**Giới hạn hiện tại:** AI-2 hiện là checklist soạn sẵn, chưa sinh động theo triệu chứng; chưa có màn hình quản lý hồ sơ đối tác.

## 3. Huấn luyện viên (Trainer)

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Họ là ai? | HLV Trần Quốc Huy, đăng nhập bằng `trainer@demo.com` |
| 2 | Vào hệ thống để làm gì? | Quản lý giáo án, thư viện bài tập, ghi nhật ký buổi tập, phân tích tiến độ và gửi báo cáo |
| 3 | Màn hình đầu tiên | `Trainer/training-plans.html` |
| 4 | Tạo gì? | Giáo án; nhật ký buổi tập; bài tập mới; báo cáo AI-3; chứng nhận tốt nghiệp |
| 5 | Sửa gì? | Trạng thái/mục tiêu/ghi chú giáo án; nội dung bài tập; gán bài tập vào giáo án; sửa báo cáo AI trước khi gửi |
| 6 | Hủy/xóa gì? | Xóa bài tập khỏi thư viện; lưu trữ giáo án (`archived`); xóa bài tập khỏi giáo án |
| 7 | Tìm kiếm/lọc gì? | Tìm giáo án theo tên pet/mục tiêu; lọc cấp độ, trạng thái; tìm bài tập, lọc độ khó/thời lượng/nhóm kỹ năng; phân trang |
| 8 | Dashboard nào? | KPI giáo án đang chạy, số pet, bài tập; tiến độ từng giáo án; biểu đồ điểm qua các buổi |
| 9 | AI hỗ trợ ở đâu? | AI-3 Training Progress Summary trong `Trainer/progress.html` |
| 10 | Tương tác vai trò khác thế nào? | Gửi báo cáo → chủ nuôi thấy trên `owner-pets.html`; đọc hồ sơ pet do chủ nuôi tạo |

**Màn hình:** `training-plans.html`, `exercise-library.html`, `progress.html`.

**Điểm mạnh:** AI-3 là luồng AI hoàn chỉnh nhất: chọn buổi → phân tích → giải thích lý do → sửa/tạo lại → lưu nháp/gửi; dữ liệu gửi sang chủ nuôi thật.

**Giới hạn hiện tại:** chưa có trang hồ sơ HLV riêng.

## 4. Quản trị viên (Admin)

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Họ là ai? | Admin BTL35, đăng nhập bằng `admin@demo.com` |
| 2 | Vào hệ thống để làm gì? | Theo dõi vận hành, duyệt ca, quản lý người dùng và danh mục dịch vụ |
| 3 | Màn hình đầu tiên | `admin/dashboard.html` |
| 4 | Tạo gì? | Tài khoản mới; dịch vụ mới; thông báo broadcast |
| 5 | Sửa gì? | Duyệt/từ chối ca; khóa/mở khóa tài khoản; sửa dịch vụ; bật/tắt cung ứng; cấu hình AI Checklist |
| 6 | Hủy/xóa gì? | Xóa tài khoản; ẩn dịch vụ; hủy ca |
| 7 | Tìm kiếm/lọc gì? | Tìm người dùng theo tên/email/SĐT; lọc vai trò, trạng thái; tìm dịch vụ; lọc nhóm dịch vụ |
| 8 | Dashboard nào? | Tổng người dùng, thú cưng, ca hẹn, dịch vụ hoạt động; biểu đồ; ca chờ duyệt; hoạt động gần đây |
| 9 | AI hỗ trợ ở đâu? | Cấu hình AI Checklist trong `services.html`; thẻ trạng thái AI Engine trên dashboard (hiển thị, chưa phải AI feature độc lập) |
| 10 | Tương tác vai trò khác thế nào? | Duyệt ca của đối tác; khóa tài khoản ảnh hưởng đăng nhập; sửa dịch vụ ảnh hưởng danh mục |

**Màn hình:** `dashboard.html`, `rbac.html`, `services.html`.

**Điểm mạnh:** dashboard có biểu đồ + KPI + duyệt ca; RBAC có tìm kiếm/lọc/phân trang/khóa/mở/xóa; services có CRUD và cấu hình checklist.

**Giới hạn hiện tại:** tài khoản `admin` đang bị ánh xạ thành “Chủ nuôi” trong bảng RBAC do `AUTH_TO_DIR` thiếu `admin`; bộ lọc vai trò không có Admin; một số nút “Cài đặt hệ thống” chỉ là liên kết `#`.

## 5. Vòng đời CRUD

### 5.1 Tạo (Create)

| Thao tác | Màn hình | Resource | Kiểm chứng |
|---|---|---|---|
| Thêm thú cưng | `owner-pets.html` | `pets` | Modal validate tên/giống/cân nặng, ghi `db.json` |
| Tạo lịch chăm sóc | `owner-care.html` | `care-plans` | Modal, chọn pet/ngày/giờ, ghi `db.json` |
| Đặt ca hẹn | `owner-care.html` | `appointments` + `care-plans` | Lưu lịch và đồng bộ ca cho đối tác |
| Walk-in | `provider-appointment-list.html` | `appointments` + `calendar-events` | Sinh mã ca, thêm vào lưới lịch |
| Biên bản dịch vụ | `provider-service-note.html` | `service-notes`, `medical-records` | Lưu nháp/ký số |
| Giáo án / nhật ký / bài tập | `Trainer/*` | `trainingPlans`, `trainingLogs`, `exercises` | Modal + toast |
| Báo cáo AI-3 | `Trainer/progress.html` | `summaries` | `status = draft` hoặc `sent` |
| Tài khoản / dịch vụ | `admin/rbac.html`, `admin/services.html` | `accounts`, `services` | Modal validate |
| Đăng ký | `register.html` | `accounts` | Kiểm tra trùng email, độ mạnh mật khẩu |

### 5.2 Đọc (Read)

Tất cả danh sách đọc qua `MockAPI.list()` / `PC.api.list()`. Không còn dữ liệu tĩnh trong HTML cho các danh sách chính.

### 5.3 Cập nhật (Update)

| Thao tác | Màn hình | Cách cập nhật |
|---|---|---|
| Đổi trạng thái ca | Đối tác, quản trị | `PATCH appointments` |
| Hủy lịch | Chủ nuôi | `PATCH care-plans` |
| Sửa giáo án/bài tập | HLV | `PATCH trainingPlans/exercises` |
| Sửa báo cáo AI | HLV | `PATCH summaries` |
| Khóa/mở tài khoản | Quản trị | `PATCH accounts.status` |
| Bật/tắt dịch vụ | Quản trị | `PATCH services.active` |

### 5.4 Xóa/lưu trữ (Delete/Archive)

- Xóa bài tập: `DELETE exercises`.
- Xóa tài khoản: `DELETE accounts`.
- Ẩn dịch vụ: `PATCH services.hidden`.
- Lưu trữ giáo án: `archived` (lọc khỏi danh sách).
- Hủy lịch/ca: chuyển trạng thái, không xóa cứng.

## 6. Màn hình dùng chung

| Màn hình | Vai trò dùng | Chức năng | Trạng thái |
|---|---|---|---|
| `index.html` | Tất cả | Chuyển hướng về đăng nhập, giữ query/hash | Có |
| `login.html` | Tất cả | Chọn vai trò demo, email/mật khẩu, ghi nhớ, quên mật khẩu | Có |
| `register.html` | Chủ nuôi/đối tác/HLV | Đăng ký, chọn vai trò, độ mạnh mật khẩu, điều khoản | Có |
| `forgot-password.html` | Tất cả | Nhập email, mô phỏng gửi OTP | Có |
| `otp-verification.html` | Tất cả | 6 ô OTP, tự chuyển ô, đếm ngược gửi lại | Có |
| `reset-password.html` | Tất cả | Mật khẩu mới, xác nhận, kiểm tra độ mạnh | Có |

**Không triển khai thành trang riêng:** `profile.html`, `settings.html`, `notifications.html`, `403.html`, `404.html`.

## 7. Điều hướng và chuyển vai trò

- Mỗi trang có topnav dùng chung `core/base.css`; logo trỏ về `../index.html`.
- Đăng xuất bằng cách bấm khối tên người dùng ở cổng HLV (xác nhận trước khi đăng xuất).
- Chuyển vai trò bằng cách quay về `index.html` → `login.html` → chọn role demo.
- Chuyển vai trò thực hiện qua `index.html` → `login.html` → chọn role demo; không có Role Switcher một chạm.
- Guard HLV chặn người không phải `trainer`, chuyển về đăng nhập kèm `denied=1`.
- Các cổng owner/provider/admin chưa có guard tương đương; bảo vệ hiện dựa trên luồng đăng nhập.

## 8. Luồng liên vai trò

```text
Chủ nuôi đặt lịch
  → appointments + care-plans
  → Đối tác thấy ca mới, tiếp nhận, hoàn tất
  → Quản trị thấy ca trên dashboard

Đối tác ký biên bản
  → medical-records
  → Chủ nuôi thấy trong Lịch sử dịch vụ & Bệnh án

HLV phân tích AI-3
  → summaries.status = sent
  → Chủ nuôi thấy thẻ "Báo cáo từ HLV" + nội dung tóm tắt/đề xuất/lý do

Quản trị khóa tài khoản
  → accounts.status = locked
  → Đăng nhập bị từ chối với thông báo rõ ràng
```
