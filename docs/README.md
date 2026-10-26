# Tài liệu dự án PetCompanion (BTL-35)

Bộ tài liệu này được viết theo **barem CSE122** và brief **BTL-35 – PetCompanion: Hồ sơ chăm sóc và lịch dịch vụ thú cưng**. Mọi nội dung mô tả sản phẩm đều đối chiếu với mã nguồn trong thư mục gốc, không mô tả tính năng chưa tồn tại.

## Đọc theo thứ tự

1. [`project-proposal.md`](project-proposal.md) – ngữ cảnh, vấn đề, mục tiêu, phạm vi, sitemap, luồng người dùng, ma trận thực thể/trạng thái.
2. [`roles-and-features.md`](roles-and-features.md) – 10 câu hỏi cho từng vai trò, CRUD, màn hình dùng chung, luồng liên vai trò.
3. [`screen-inventory.md`](screen-inventory.md) – bảng kiểm kê 18 màn hình với 12 cột theo barem.
4. [`screen-states.md`](screen-states.md) – trạng thái Normal / Loading / Empty / Error / Success / Pending / Cancelled / Disabled của từng màn hình và cách kích hoạt khi demo.
5. [`data-model.md`](data-model.md) – 14 resource, số bản ghi, quan hệ, API, reset dữ liệu.
6. [`ai-features.md`](ai-features.md) – AI-1 Care Reminder, AI-2 Service Checklist, AI-3 Training Progress Summary, quy trình 6 bước và trạng thái thất bại.
7. [`ai-usage-report.md`](ai-usage-report.md) – khai báo sử dụng AI theo mẫu Phụ lục F.
8. [`team-assignment.md`](team-assignment.md) – 3 thành viên, lát cắt dọc, phân công chéo, commit thực tế.
9. [`git-workflow.md`](git-workflow.md) – nhánh, commit, PR, quy ước làm việc.
10. [`obs-evidence.md`](obs-evidence.md) – quy ước tên video, bảng 18 video, cấu trúc video.
11. [`deployment.md`](deployment.md) – chạy local, Render, kiểm tra incognito/mobile.
12. [`demo-script.md`](demo-script.md) – kịch bản demo 6 phút.

Tài liệu thiết kế:

- Figma: https://www.figma.com/design/kDpGBVivQSuSpebbNhzGrr/bai-tap?t=h8VNXReX6DUHmzMW-0
- [`../design/figma-link.txt`](../design/figma-link.txt) – link thiết kế và tên file.

## Thông tin sản phẩm

| Hạng mục | Giá trị |
|---|---|
| Mã đề tài | BTL-35 |
| Học phần | CSE122 – Phát triển ứng dụng Web cơ bản |
| Sản phẩm | PetCompanion – hồ sơ chăm sóc và lịch dịch vụ thú cưng |
| Loại | Web frontend nguyên mẫu, nhiều vai trò, không có backend thật |
| Repository | https://github.com/vutruonganh/Pet_Companion |
| Nhánh đang nộp | `last_test` (đã merge vào `main` qua PR #1) |
| Live demo | https://pet-companion-1.onrender.com |
| Figma | https://www.figma.com/design/kDpGBVivQSuSpebbNhzGrr/bai-tap?t=h8VNXReX6DUHmzMW-0 |
| Notion | https://app.notion.com/p/3f3f0a1d9f4980858c77d1a28bf40b70?v=3f3f0a1d9f498013bd4f000c8f350ef8&source=copy_link |
| Dữ liệu | Mock REST API 14 resource, seed 15–25 bản ghi/resource |
| Số màn hình | 18 tệp HTML (6 màn hình dùng chung + 12 màn hình nghiệp vụ) |

## Dữ liệu chuẩn dùng xuyên suốt tài liệu

- Chủ nuôi: **Nguyễn Văn An** – `owner@demo.com`.
- Thú cưng: **Milo** – Golden Retriever, đực, 3 tuổi, **28 kg**, chip `#VN-88219`, trạng thái “Sức khỏe tốt”.
- Lịch chăm sóc gần nhất: `#PC-20261115-1000` – Khám tổng quát & tiêm nhắc vắc-xin dại, 15/11/2026, 10:00, PetCare Clinic Quận 1, BS. Trần Văn Minh, trạng thái “Đã xác nhận”.
- Ca hẹn của Milo: `#APT-1050` – Khám tổng quát & Tẩy giun, 08:30, trạng thái “Đang khám lâm sàng”.
- Báo cáo HLV: do HLV gửi từ trang Tiến độ, hiển thị tại thẻ “Báo cáo từ HLV” trên trang Hồ sơ thú cưng của chủ nuôi.

> Ghi chú: brief thiết kế ban đầu ghi Milo 24,3 kg; dữ liệu seed thực tế là 28 kg. Tài liệu lấy **28 kg** làm chuẩn vì đó là dữ liệu người chấm nhìn thấy trên giao diện.

## Quy ước cập nhật

- Mỗi khi thêm/xóa màn hình: cập nhật `screen-inventory.md`, `screen-states.md`, `README.md` gốc và `obs-evidence.md`.
- Mỗi khi thêm resource/trường dữ liệu: cập nhật `data-model.md` và `README.md` gốc.
- Mỗi khi đổi luồng AI: cập nhật `ai-features.md`, `ai-usage-report.md`, `demo-script.md`.
