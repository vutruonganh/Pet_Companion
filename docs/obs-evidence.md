# Minh chứng OBS

## 1. Quy tắc

- **Mỗi màn hình độc lập = 1 video OBS.** Có 18 màn hình → 18 video.
- Mỗi video có **mặt sinh viên**, **giọng nói**, **mockup**, **mã nguồn**, **giải thích**, **thay đổi trực tiếp**, **chạy thử**, **commit**.
- Không dùng video ghép nhiều màn hình thay cho video từng màn hình.
- Tên tệp: `SVx-xx-screen-name.mp4`.
- Thời lượng gợi ý: 3–6 phút/màn hình; video demo tổng 6 phút là video riêng.
- Mockup tham chiếu: https://www.figma.com/design/kDpGBVivQSuSpebbNhzGrr/bai-tap?t=h8VNXReX6DUHmzMW-0

## 2. Nội dung tối thiểu mỗi video (12 mục)

1. Có mặt sinh viên.
2. Có giọng nói.
3. Cho xem mockup Figma.
4. Mở tệp mã.
5. Giải thích layout.
6. Giải thích HTML.
7. Giải thích CSS.
8. Giải thích JavaScript.
9. Thực hiện một thay đổi trực tiếp.
10. Chạy thử.
11. Ghi nhận thay đổi (commit).
12. Nói rõ công việc / nhánh / commit.

## 3. Danh sách 18 video

| # | Tệp video | Màn hình | Người quay | Nội dung chính |
|---|---|---|---|---|
| 1 | `SV1-01-index-redirect.mp4` | `index.html` | SV1 | Redirect, fallback, query/hash |
| 2 | `SV1-02-login.mp4` | `login.html` | SV1 | Chọn role, validate, loading, locked, redirect |
| 3 | `SV1-03-register.mp4` | `register.html` | SV1 | Validate, độ mạnh mật khẩu, tạo tài khoản |
| 4 | `SV1-04-forgot-password.mp4` | `forgot-password.html` | SV1 | Email, OTP mô phỏng, chuyển trang |
| 5 | `SV1-05-otp.mp4` | `otp-verification.html` | SV1 | 6 ô, auto-advance, đếm ngược, lỗi |
| 6 | `SV1-06-reset-password.mp4` | `reset-password.html` | SV1 | Độ mạnh, xác nhận, thành công |
| 7 | `SV1-07-owner-pets.mp4` | `owner-pets.html` | SV1 + SV3 | Danh sách, lọc, thêm pet, báo cáo HLV |
| 8 | `SV1-08-owner-care.mp4` | `owner-care.html` | SV1 | Lịch tháng, tạo lịch, hủy, AI-1 |
| 9 | `SV1-09-owner-records.mp4` | `owner-records.html` | SV1 | Tìm/lọc, chi tiết, export |
| 10 | `SV2-01-provider-appointments.mp4` | `provider-appointment-list.html` | SV2 | Tìm/lọc, nhận ca, hoàn tất, walk-in |
| 11 | `SV2-02-provider-calendar.mp4` | `provider-calendar.html` | SV2 | Lịch tháng/timeline, tạo ca |
| 12 | `SV2-03-provider-service-note.mp4` | `provider-service-note.html` | SV2 | Checklist AI-2, autosave, ký số |
| 13 | `SV3-01-training-plans.mp4` | `training-plans.html` | SV3 | KPI, lọc, tạo giáo án, nhật ký |
| 14 | `SV3-02-exercise-library.mp4` | `exercise-library.html` | SV3 | Tìm/lọc, thêm/sửa/xóa, gán |
| 15 | `SV3-03-progress.mp4` | `progress.html` | SV3 | AI-3 6 bước, failure UX, gửi báo cáo |
| 16 | `SV2-04-admin-dashboard.mp4` | `admin/dashboard.html` | SV2 | KPI, biểu đồ, duyệt ca, export |
| 17 | `SV2-05-admin-rbac.mp4` | `admin/rbac.html` | SV2 | Tìm/lọc, thêm, khóa/mở/xóa |
| 18 | `SV2-06-admin-services.mp4` | `admin/services.html` | SV2 | CRUD dịch vụ, ẩn, AI Checklist |

## 4. Cấu trúc video gợi ý

```text
0:00 – Giới thiệu tên, màn hình, vai trò, Task ID
0:20 – Mở mockup Figma, chỉ layout
0:50 – Mở file HTML, giải thích cấu trúc ngữ nghĩa
1:20 – Mở CSS, giải thích token/layout/responsive
1:50 – Mở JS, giải thích hàm chính và API
2:40 – Thực hiện một thay đổi nhỏ (thêm filter/nút/trạng thái)
3:20 – Chạy thử, F5, kiểm tra dữ liệu
4:10 – Commit thay đổi, đọc mã commit
4:40 – Nêu nhánh, PR, điều học được
```

## 5. Video demo tổng 6 phút

Video demo tổng là video riêng, không thay thế 18 video màn hình. Kịch bản ở [`demo-script.md`](demo-script.md).
