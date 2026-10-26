# Bảng kiểm kê màn hình

Bảng gồm **18 màn hình** đang có trong repo: 6 màn hình dùng chung và 12 màn hình nghiệp vụ (3 màn hình/vai trò). Cột cuối ghi tên tệp minh chứng OBS.

> **Task ID:** `PC-<nhóm>-<số>`, khớp với bảng công việc [Notion](https://app.notion.com/p/3f3f0a1d9f4980858c77d1a28bf40b70?v=3f3f0a1d9f498013bd4f000c8f350ef8&source=copy_link).
>
> **OBS:** `SVx-xx-screen-name.mp4`.

## 1. Bảng 12 cột

| # | Vai trò | Mục tiêu người dùng | Nhiệm vụ người dùng | Màn hình | Tệp | CRUD / Trạng thái | AI | SV phụ trách | Task ID | Branch (thực tế) | OBS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Dùng chung | Vào đúng cổng sau khi mở website | Mở trang gốc, được chuyển tới đăng nhập | Điều hướng | `index.html` | Chỉ chuyển hướng; fallback khi tắt JS | – | SV1 | PC-CMN-01 | `main` | SV1-01-index-redirect.mp4 |
| 2 | Dùng chung | Đăng nhập đúng vai trò | Chọn role demo hoặc nhập email/mật khẩu, ghi nhớ | Đăng nhập | `login register/login.html` | R `accounts`; C/D session; loading/error/locked/success | – | SV1 | PC-CMN-02 | `main`, `last_test` | SV1-02-login.mp4 |
| 3 | Dùng chung | Tạo tài khoản mới | Nhập họ tên, email, SĐT, vai trò, mật khẩu, điều khoản | Đăng ký | `login register/register.html` | C `accounts`; validation; success/error | – | SV1 | PC-CMN-03 | `main` | SV1-03-register.mp4 |
| 4 | Dùng chung | Lấy lại mật khẩu | Nhập email, gửi OTP mô phỏng | Quên mật khẩu | `login register/forgot-password.html` | C OTP (mô phỏng); validation; success | – | SV1 | PC-CMN-04 | `main` | SV1-04-forgot-password.mp4 |
| 5 | Dùng chung | Xác thực OTP | Nhập 6 chữ số, gửi lại nếu cần | Xác thực OTP | `login register/otp-verification.html` | Xác thực; error; countdown disabled | – | SV1 | PC-CMN-05 | `main` | SV1-05-otp.mp4 |
| 6 | Dùng chung | Đặt mật khẩu mới | Nhập mật khẩu, xác nhận, kiểm tra độ mạnh | Đặt lại mật khẩu | `login register/reset-password.html` | U mật khẩu (mô phỏng); validation; success | – | SV1 | PC-CMN-06 | `main` | SV1-06-reset-password.mp4 |
| 7 | Chủ nuôi | Quản lý hồ sơ thú cưng | Xem/tìm/lọc pet, thêm pet, đọc báo cáo HLV | Hồ sơ thú cưng | `owner/owner-pets.html` | C/R `pets`; R `summaries`, `trainingLogs`; empty/error/success | Hiển thị báo cáo AI-3 đã gửi | SV1 (chính), SV3 (báo cáo HLV) | PC-OWN-01 | `main`, `last_test` | SV1-07-owner-pets.mp4 |
| 8 | Chủ nuôi | Không quên lịch chăm sóc | Xem lịch tháng, tạo lịch/đặt hẹn, hủy lịch, nhận gợi ý AI | Lịch chăm sóc | `owner/owner-care.html` | C/R/U `care-plans`, `appointments`; pending/confirmed/cancelled | AI-1 Care Reminder Assistant | SV1 | PC-OWN-02 | `main` | SV1-08-owner-care.mp4 |
| 9 | Chủ nuôi | Xem lại lịch sử dịch vụ | Tìm/lọc bệnh án, xem chi tiết, xuất dữ liệu | Lịch sử dịch vụ & Bệnh án | `owner/owner-records.html` | R `medical-records`, `pets`; empty/error; export | – | SV1 | PC-OWN-03 | `main` | SV1-09-owner-records.mp4 |
| 10 | Đối tác | Xử lý ca hẹn trong ngày | Tìm/lọc ca, tiếp nhận, hoàn tất, tạo walk-in | Danh sách ca hẹn | `provider/provider-appointment-list.html` | C/R/U `appointments`, C `calendar-events`; pending/processing/completed/cancelled/urgent | – | SV2 | PC-PRO-01 | `main`, `feature/data-rubric-5.3` | SV2-01-provider-appointments.mp4 |
| 11 | Đối tác | Điều phối lịch làm việc | Xem lịch ngày/tuần, tạo ca, xem chi tiết | Lịch & điều phối | `provider/provider-calendar.html` | C/R/D `calendar-events`; C `appointments`; empty day/error toast | – | SV2 | PC-PRO-02 | `feature/data-rubric-5.3` | SV2-02-provider-calendar.mp4 |
| 12 | Đối tác | Ghi biên bản và checklist an toàn | Tick checklist, ghi lâm sàng, thêm chi phí, lưu nháp/ký | Biên bản dịch vụ & Checklist AI | `provider/provider-service-note.html` | C/R/U `service-notes`; C `medical-records`; draft/signed/disabled | AI-2 Service Checklist | SV2 | PC-PRO-03 | `feature/data-rubric-5.3` | SV2-03-provider-service-note.mp4 |
| 13 | HLV | Quản lý giáo án huấn luyện | Xem/tìm/lọc giáo án, tạo giáo án, thêm nhật ký, cấp chứng nhận | Kế hoạch huấn luyện | `Trainer/training-plans.html` | C/R/U `trainingPlans`, C `trainingLogs`; loading/empty/error; new/in_progress/attention/paused/graduated | – | SV3 | PC-TRN-01 | `main` | SV3-01-training-plans.mp4 |
| 14 | HLV | Chọn bài tập phù hợp | Tìm/lọc bài tập, xem chi tiết, thêm/sửa/xóa, gán vào giáo án | Thư viện bài tập | `Trainer/exercise-library.html` | C/R/U/D `exercises`; U `trainingPlans`; loading/empty/error | – | SV3 | PC-TRN-02 | `main` | SV3-02-exercise-library.mp4 |
| 15 | HLV | Theo dõi và báo cáo tiến độ | Chọn pet/buổi, phân tích AI, sửa/nháp/gửi báo cáo, chat, sổ thú y | Tiến độ & nhật ký AI | `Trainer/progress.html` | C/R/U `summaries`, `petHealth`, `chats`; C `trainingLogs`; loading/empty/error; draft/sent; low-data | AI-3 Training Progress Summary | SV3 | PC-TRN-03 | `main` | SV3-03-progress.mp4 |
| 16 | Quản trị | Theo dõi vận hành | Xem KPI/biểu đồ, duyệt/hủy ca, broadcast, xuất báo cáo | Dashboard | `admin/dashboard.html` | R/U `appointments`; loading/error; pending/approved/cancelled | Thẻ trạng thái AI Engine (không phải AI feature độc lập) | SV2 | PC-ADM-01 | `main`, `feature/data-rubric-5.3` | SV2-04-admin-dashboard.mp4 |
| 17 | Quản trị | Quản lý người dùng | Tìm/lọc, thêm, xem, khóa/mở, xóa tài khoản | Quản lý người dùng (RBAC) | `admin/rbac.html` | C/R/U/D `accounts`; loading/error; active/pending/locked | – | SV2 | PC-ADM-02 | `feature/data-rubric-5.3` | SV2-05-admin-rbac.mp4 |
| 18 | Quản trị | Quản lý danh mục dịch vụ | Tìm/lọc, thêm/sửa, bật/tắt, ẩn, cấu hình AI Checklist | Quản lý dịch vụ | `admin/services.html` | C/R/U `services` (hide = mềm); loading/empty/error; active/paused/hidden | Cấu hình AI Checklist (hỗ trợ AI-2) | SV2 | PC-ADM-03 | `feature/data-rubric-5.3` | SV2-06-admin-services.mp4 |

## 2. Tổng hợp

| Nhóm | Số màn hình | Màn hình |
|---|---:|---|
| Dùng chung | 6 | index, login, register, forgot-password, OTP, reset-password |
| Chủ nuôi | 3 | owner-pets, owner-care, owner-records |
| Đối tác dịch vụ | 3 | provider-appointment-list, provider-calendar, provider-service-note |
| Huấn luyện viên | 3 | training-plans, exercise-library, progress |
| Quản trị viên | 3 | dashboard, rbac, services |
| **Tổng** | **18** | |

## 3. Màn hình theo yêu cầu brief nhưng chưa tách trang

| Yêu cầu | Cách đáp ứng hiện tại |
|---|---|
| Create Booking (đặt dịch vụ) | Modal “Tạo lịch nhắc / Đặt hẹn” trong `owner-care.html`; không tách trang |
| Profile & Settings | Không tách trang riêng |
| Notifications | Toast + chuông thông báo |
| 403 / 404 | Không có trang riêng |
| Đăng xuất | Bấm khối tên ở cổng HLV; các cổng khác chưa có nút đăng xuất riêng |

## 4. Đối chiếu màn hình với tiêu chí chấm

| Tiêu chí | Màn hình minh chứng |
|---|---|
| Đa vai trò | 4 cổng, 12 màn hình nghiệp vụ |
| CRUD thật | 7, 8, 10, 11, 12, 13, 14, 15, 17, 18 |
| Tìm kiếm/lọc | 7, 9, 10, 13, 14, 17, 18 |
| Validation | 2, 3, 4, 6, 7, 8, 10, 12, 13, 17, 18 |
| Loading/Empty/Error | 10, 13, 14, 15, 16, 17, 18; một phần ở 7, 8, 9, 11, 12 |
| AI 6 bước | 15 đầy đủ; 8 một phần; 12 một phần |
| Liên vai trò | 7 (nhận báo cáo), 8 (đặt lịch), 10 (nhận ca), 12 (bệnh án), 15 (gửi báo cáo), 17 (khóa tài khoản) |
| Responsive | Tất cả; media query tại 1100/900/760/640 px |

