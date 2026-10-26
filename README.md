# PetCompanion – Hồ sơ chăm sóc & lịch dịch vụ thú cưng

BTL-35, học phần CSE122 – Phát triển ứng dụng Web cơ bản. Website tĩnh 18 màn hình cho 4 vai trò, dùng chung một mock REST API.

- Bản deploy: https://pet-companion-1.onrender.com
- Mã nguồn: https://github.com/vutruonganh/Pet_Companion
- Chạy local: nhấn đúp `Chay-PetCompanion.bat`, hoặc `node mock-api/server.js`, rồi mở http://localhost:4000/
- Tài liệu đầy đủ: [docs/README.md](docs/README.md)

## Ngữ cảnh

Chủ nuôi thường quản lý hồ sơ thú cưng, lịch tiêm, lịch tẩy giun và lịch khám ở nhiều nơi: sổ giấy, tin nhắn, trí nhớ. Khi đi khám hoặc đi huấn luyện, thông tin lại không được chia sẻ giữa chủ nuôi, phòng khám và huấn luyện viên. PetCompanion mô phỏng một hệ thống thống nhất cho bốn vai trò, với dữ liệu mẫu đúng ngữ cảnh thú cưng (15–25 bản ghi mỗi resource chính).

## Phát biểu vấn đề

| Mã | Vấn đề | Đối tượng |
| --- | --- | --- |
| P1 | Chủ nuôi quên lịch chăm sóc định kỳ và không có nơi lưu hồ sơ tập trung | Chủ nuôi |
| P2 | Đối tác dịch vụ khó theo dõi ca hẹn, trạng thái tiếp nhận và biên bản khám | Đối tác |
| P3 | Huấn luyện viên viết báo cáo tiến độ thủ công, chủ nuôi không thấy kịp thời | HLV |
| P4 | Quản trị viên thiếu dữ liệu tổng hợp về người dùng, dịch vụ và ca hẹn | Quản trị |

Chi tiết P1–P4, O1–O7, ma trận thực thể và trạng thái: [docs/project-proposal.md](docs/project-proposal.md).

## Mục tiêu

| Mã | Mục tiêu |
| --- | --- |
| O1 | Mỗi vai trò có cổng riêng, đăng nhập đúng vai trò, có ít nhất 3 màn hình nghiệp vụ |
| O2 | Dữ liệu đọc/ghi qua một API, còn nguyên sau F5; không hardcode danh sách trong HTML |
| O3 | Có CRUD thật: tạo, đọc, cập nhật, hủy/ẩn/xóa mềm ở các resource chính |
| O4 | Có đủ trạng thái Normal, Loading, Empty, Error, Success, Pending, Cancelled |
| O5 | Ba tính năng AI theo ba vai trò, có giải thích lý do và quyền kiểm soát của người dùng |
| O6 | Giao diện dùng chung design system, responsive 320px–1280px, có A11y cơ bản |
| O7 | Quy trình Git, tài liệu, demo và minh chứng bám barem CSE122 |

## Các vai trò

| Vai trò | Tài khoản demo | Cổng vào | Quyền chính |
| --- | --- | --- | --- |
| Chủ nuôi | `owner@demo.com` | `owner/owner-pets.html` | Hồ sơ thú cưng, lịch chăm sóc, bệnh án, nhận báo cáo HLV |
| Đối tác dịch vụ | `provider@demo.com` | `provider/provider-appointment-list.html` | Ca hẹn, lịch làm việc, biên bản dịch vụ, ký số |
| Huấn luyện viên | `trainer@demo.com` | `Trainer/training-plans.html` | Giáo án, bài tập, nhật ký, AI-3, gửi báo cáo |
| Quản trị viên | `admin@demo.com` | `admin/dashboard.html` | Dashboard, người dùng, dịch vụ |

Mật khẩu chung: `demo123`. Tài khoản `locked@demo.com` dùng để thử trạng thái bị khóa. Session lưu ở `localStorage` với khóa `pc_mock_v1:session`; đây là mô phỏng, không phải xác thực thật.

## Luồng người dùng

1. **Đăng nhập theo vai trò:** `login.html` → đọc `accounts` → kiểm tra mật khẩu/trạng thái → ghi session → chuyển tới cổng đúng vai trò. Tài khoản bị khóa bị từ chối; `next` chỉ được tôn trọng ở cổng HLV.
2. **Chủ nuôi thêm thú cưng:** `owner-pets.html` → mở modal → validation → `POST pets` → thẻ mới xuất hiện → F5 vẫn còn.
3. **Chủ nuôi tạo lịch / đặt hẹn:** `owner-care.html` → chọn thú cưng, dịch vụ, ngày giờ → `POST care-plans` hoặc `appointments` → lịch hiện trên lưới tháng; có thể hủy.
4. **Đối tác xử lý ca:** `provider-appointment-list.html` → lọc ca → tiếp nhận/hoàn tất → `PATCH appointments` → dashboard quản trị đọc cùng resource và thấy trạng thái mới sau khi tải lại.
5. **HLV gửi báo cáo:** `Trainer/progress.html` → chọn thú cưng và nhật ký → AI-3 phân tích → sửa/nháp/gửi → `POST/PATCH summaries` với `status='sent'` → `owner-pets.html` lọc báo cáo đã gửi và hiển thị cho đúng chủ sở hữu.
6. **Quản trị cấu hình:** `admin/services.html` → thêm/sửa/ẩn dịch vụ, cấu hình AI Checklist → `POST/PATCH services`; `admin/rbac.html` → khóa/mở tài khoản.

Sơ đồ và đặc tả chi tiết: [docs/project-proposal.md](docs/project-proposal.md), [docs/roles-and-features.md](docs/roles-and-features.md).

## Bảng kiểm kê màn hình

Bảng 12 cột đầy đủ: [docs/screen-inventory.md](docs/screen-inventory.md).

| Nhóm | Số màn hình | Màn hình |
| --- | ---: | --- |
| Dùng chung | 6 | `index.html`, login, register, forgot-password, OTP, reset-password |
| Chủ nuôi | 3 | `owner-pets`, `owner-care`, `owner-records` |
| Đối tác | 3 | `provider-appointment-list`, `provider-calendar`, `provider-service-note` |
| Huấn luyện viên | 3 | `training-plans`, `exercise-library`, `progress` |
| Quản trị | 3 | `dashboard`, `rbac`, `services` |
| **Tổng** | **18** | |

Mỗi dòng trong bảng có: vai trò, mục tiêu, nhiệm vụ, màn hình, tệp, CRUD/trạng thái, AI, sinh viên phụ trách, Task ID, branch và tên tệp OBS. Task ID theo quy ước `PC-<nhóm>-<số>`; bảng công việc của nhóm ở [Notion](https://app.notion.com/p/3f3f0a1d9f4980858c77d1a28bf40b70?v=3f3f0a1d9f498013bd4f000c8f350ef8&source=copy_link).

## Tính năng AI

| Mã | Tên | Vị trí | Cách hoạt động | Mức hoàn thiện 6 bước |
| --- | --- | --- | --- | --- |
| AI-1 | Care Reminder Assistant | `owner/owner-care.html` + `owner-care.js` | Chọn thú cưng/dịch vụ, đối chiếu bảng `AI_RECS`, hiện lý do và lần dùng trước; Chấp nhận tạo `care-plans` trạng thái `pending`, Điều chỉnh mở form prefill, Ẩn đề xuất | Input, Output, Explainability, Control, Save; thiếu Processing và failure riêng |
| AI-2 | Service Checklist AI | `provider/provider-service-note.html` | Checklist 4 mục cấu hình sẵn, tiến độ, autosave nháp, thêm mục, chi phí; ký khóa form và tạo `medical-records` | Có checklist, progress, save; chưa sinh nội dung động, chưa đủ 6 bước |
| AI-3 | Training Progress Summary | `Trainer/progress.html` + `progress.js` | `analyze()` tính trung bình, tỉ lệ đạt, delta, xu hướng, điểm mạnh/yếu, khuyến nghị; 700ms processing; sửa nội dung; lưu nháp/gửi; low-data khi chưa có nhật ký | **Đủ 6 bước**, có explainability và failure UX |

Cả ba chạy bằng quy tắc/dữ liệu cấu hình tại trình duyệt, **không gọi LLM** và không dùng API key. Chi tiết: [docs/ai-features.md](docs/ai-features.md).

## Công nghệ

- HTML5, CSS3, JavaScript thuần (ES6+), không build, không framework.
- Design system dùng chung: `core/base.css` (token, topnav, card, table, modal, toast), `core/unify.css`, `core/base.js`.
- Client API duy nhất: `core/api.js` (`window.MockAPI`), base `/api/v1`, timeout 6 giây, kiểm tra `response.ok`.
- Mock REST API: `mock-api/server.js` (Node.js, không dependency) và `mock-api/server.py` (Python).
- Dữ liệu: `mock-api/seed.json` → `mock-api/db.json`; `POST /api/reset` khôi phục dữ liệu gốc.
- Adapter cổng HLV: `mock-api/api.js` (`PC.api`, `PC.session`, `PC.modal`, `PC.stateBox`).
- 14 resource: `accounts`, `pets`, `care-plans`, `appointments`, `calendar-events`, `service-notes`, `medical-records`, `services`, `exercises`, `trainingPlans`, `trainingLogs`, `summaries`, `petHealth`, `chats`.

```
index.html                  # chuyển hướng tới trang đăng nhập
core/                       # design system + client API
owner/                      # cổng chủ nuôi (3 trang)
provider/                   # cổng đối tác (3 trang)
Trainer/                    # cổng huấn luyện viên (3 trang)
admin/                      # cổng quản trị (3 trang)
login register/             # đăng nhập, đăng ký, quên/đặt lại mật khẩu
mock-api/                   # server Node/Python, seed, db, adapter PC.api
docs/                       # tài liệu theo barem
design/                     # link Figma và tư liệu thiết kế
assets/                     # logo và ảnh
Chay-PetCompanion.bat       # launcher Windows
```

API:

```text
GET    /api/v1/<resource>[/<id>]
POST   /api/v1/<resource>
PUT    /api/v1/<resource>/<id>
PATCH  /api/v1/<resource>/<id>
DELETE /api/v1/<resource>/<id>
POST   /api/reset
GET    /api/health
```

Hỗ trợ `?search=`, lọc trường chính xác (`?status=active`), `?sortBy=&order=&page=&limit=`. `?fail=1` và `?empty=1` chỉ có tác dụng trên các trang Trainer vì chỉ các trang này đi qua `PC.api`.

## Thành viên nhóm

| Mã | Họ tên | Vai trò chính | Tài khoản demo |
| --- | --- | --- | --- |
| SV1 | Nguyễn Hoàng Bách | Chủ nuôi, xác thực, mock API dùng chung | `owner@demo.com` |
| SV2 | Vũ Trường Anh | Đối tác, quản trị, tích hợp, deploy | `provider@demo.com`, `admin@demo.com` |
| SV3 | Nguyễn Thế Bằng | Huấn luyện viên, UI xác thực, báo cáo HLV, tài liệu | `trainer@demo.com` |

Tài khoản Git: `banghoi772` / `Equal-11`. Chi tiết phân công và commit: [docs/team-assignment.md](docs/team-assignment.md).

## Phân công công việc

| Khu vực | SV1 | SV2 | SV3 |
| --- | --- | --- | --- |
| `owner/` | Chính | Hỗ trợ dữ liệu liên vai trò | Báo cáo HLV trên `owner-pets` |
| `provider/`, `admin/` | – | Chính | – |
| `Trainer/` | – | – | Chính |
| `login register/` | Logic, OTP | Điều hướng vai trò | UI/CSS, sửa login owner |
| `core/` | `api.js`, `base.js` | `base.css`, `unify.css` | `unify.css` |
| `mock-api/` | Server Node/Python, seed/reset | Chuẩn hóa dữ liệu, launcher | Dữ liệu HLV, báo cáo |
| Deploy | – | Render, `0.0.0.0` | README, hướng dẫn |
| Tài liệu | README, API | Dữ liệu, rubric 5.3 | AI report, OBS/README |

Mỗi thành viên làm trọn lát cắt dọc của màn hình mình phụ trách: HTML → CSS → JS → API → commit → OBS. Chi tiết commit và trách nhiệm chéo: [docs/team-assignment.md](docs/team-assignment.md).

## Quy trình Git

- Repo công khai, 27 commit, 3 tác giả.
- Nhánh: `main`, `last_test`, `feature/data-rubric-5.3`, `feature/logo-mock-api`.
- Commit theo Conventional Commits: `feat(owner): ...`, `fix(login): ...`, `docs: ...`.
- PR #1 (`last_test` → `main`) đã merge ngày 2026-10-26 bởi Nguyễn Thế Bằng (`Equal-11`), merge commit `376ff67`.
- Bảng công việc: [Notion](https://app.notion.com/p/3f3f0a1d9f4980858c77d1a28bf40b70?v=3f3f0a1d9f498013bd4f000c8f350ef8&source=copy_link).

Quy ước commit, nhánh và lệnh thao tác: [docs/git-workflow.md](docs/git-workflow.md).

## Figma / Canva

Thiết kế UI/UX: [PetCompanion – bai-tap trên Figma](https://www.figma.com/design/kDpGBVivQSuSpebbNhzGrr/bai-tap?t=h8VNXReX6DUHmzMW-0).

Quy ước lưu link thiết kế: [design/figma-link.txt](design/figma-link.txt).

## Demo

**Chạy local:**

```bash
node mock-api/server.js      # Node.js
python mock-api/server.py    # hoặc Python 3
```

Sau đó mở http://localhost:4000/ (tự chuyển tới trang đăng nhập). Trên Windows, nhấn đúp `Chay-PetCompanion.bat`; script tự tìm Node.js, kể cả Node tích hợp trong Qoder. Nếu cổng 4000 bận, đặt biến môi trường `PORT` và chạy server thủ công.

**Bản deploy:** https://pet-companion-1.onrender.com — gói free có thể ngủ; lần mở đầu mất khoảng 20–30 giây. Dữ liệu trên Render là tạm thời và có thể trở về seed sau khi restart.

**Tài khoản:** `owner@demo.com`, `provider@demo.com`, `trainer@demo.com`, `admin@demo.com`; mật khẩu `demo123`.

**Khôi phục dữ liệu:** mở Console và chạy `await PC.api.reset()`, hoặc gửi `POST /api/reset`.

Kịch bản demo 6 phút, phân vai và phương án dự phòng: [docs/demo-script.md](docs/demo-script.md). Hướng dẫn deploy và xử lý sự cố: [docs/deployment.md](docs/deployment.md).

## Minh chứng OBS

Quy ước tên tệp `SVx-xx-screen-name.mp4`; mỗi màn hình một video. Danh sách 18 video, nội dung 12 mục và cấu trúc video: [docs/obs-evidence.md](docs/obs-evidence.md).

Cột OBS trong [docs/screen-inventory.md](docs/screen-inventory.md) dùng đúng quy ước tên tệp này.

## Khai báo sử dụng AI

Báo cáo đầy đủ theo mẫu Phụ lục F: [docs/ai-usage-report.md](docs/ai-usage-report.md).

- Công cụ đã dùng: DeepSeek, Gemini, Claude, ChatGPT, Mimo, Qwen, Stitch AI.
- Không có API key, token hay LLM chạy trong sản phẩm; cả ba tính năng AI là quy tắc/dữ liệu cấu hình tại trình duyệt.
- Báo cáo ghi rõ prompt chính, phần AI sinh, phần sinh viên sửa, cách kiểm chứng và các lỗi AI đã phát hiện (resource `users`/`training-pets` không tồn tại, phạm vi `?fail=1` bị mô tả quá rộng, AI-2 từng bị mô tả là động).
- Phân công và commit của từng thành viên: [docs/team-assignment.md](docs/team-assignment.md).
