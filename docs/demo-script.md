# Kịch bản demo 6 phút

Kịch bản bám theo mốc thời gian của barem (mục VII) nhưng dùng đúng những gì sản phẩm đang có. Người trình bày nói ngắn, thao tác là chính; mỗi bước đều nêu **màn hình → thao tác → kết quả mong đợi**.

## 0. Chuẩn bị trước 10 phút

### 0.1. Sáu tab trình duyệt (theo đúng thứ tự barem)

| Tab | Nội dung |
| --- | --- |
| 1 | Bản deploy: https://pet-companion-1.onrender.com/login%20register/login.html |
| 2 | Bản local: http://localhost:4000/ (dùng cho Live Modification) |
| 3 | Figma: https://www.figma.com/design/kDpGBVivQSuSpebbNhzGrr/bai-tap?t=h8VNXReX6DUHmzMW-0 |
| 4 | Notion: https://app.notion.com/p/3f3f0a1d9f4980858c77d1a28bf40b70?v=3f3f0a1d9f498013bd4f000c8f350ef8&source=copy_link |
| 5 | GitHub repo, mở sẵn tab Pull Requests và Insights/Network |
| 6 | Danh sách video OBS: `docs/obs-evidence.md` |

### 0.2. VS Code và terminal

- Mở thư mục dự án, đang ở nhánh mới nhất.
- Mở terminal, chạy sẵn `git status` và `git log --oneline -10`.
- Mở sẵn các file sẽ dùng khi bị yêu cầu sửa trực tiếp: `owner/owner-pets.js`, `owner/owner-care.js`, `Trainer/progress.js`, `provider/provider-service-note.js`, `admin/services.js`, `core/base.css`.

### 0.3. Dữ liệu và phiên đăng nhập

```text
POST http://localhost:4000/api/reset
```

Sau đó đăng nhập sẵn ở 4 profile/cửa sổ riêng (mật khẩu `demo123`):

| Vai trò | Tài khoản | Trang đích |
| --- | --- | --- |
| Chủ nuôi | `owner@demo.com` | `owner/owner-pets.html` |
| Đối tác | `provider@demo.com` | `provider/provider-appointment-list.html` |
| HLV | `trainer@demo.com` | `Trainer/training-plans.html` |
| Quản trị | `admin@demo.com` | `admin/dashboard.html` |

> Dùng cửa sổ ẩn danh khác nhau vì session lưu ở `localStorage` và mỗi lần đăng nhập sẽ ghi đè session của cùng origin.

### 0.4. Câu mở đầu (3 câu, học thuộc)

> “PetCompanion là hệ thống quản lý hồ sơ chăm sóc và lịch dịch vụ thú cưng. Sản phẩm giải quyết việc chủ nuôi quên lịch chăm sóc, đối tác khó theo dõi ca hẹn và huấn luyện viên phải viết báo cáo tiến độ thủ công. Hệ thống có bốn vai trò: chủ nuôi, đối tác dịch vụ, huấn luyện viên và quản trị viên.”

## 1. Phân vai

| Mốc | Người trình bày | Nội dung |
| --- | --- | --- |
| 0:00–0:45 | SV1 | Mở đầu, định vị sản phẩm, screen inventory |
| 0:45–2:15 | SV1 | Chủ nuôi: tìm kiếm/lọc, empty state, validation, AI-1 |
| 2:15–3:45 | SV3 | HLV: AI-3 đủ 6 bước, gửi báo cáo sang chủ nuôi; AI-2 của đối tác |
| 3:45–5:00 | SV2 | Đối tác/Quản trị: cập nhật trạng thái, CRUD dịch vụ, dữ liệu liên vai trò |
| 5:00–6:00 | SV2 | Responsive, A11y, error state, kết luận |

Nếu lớp yêu cầu đúng thứ tự “SV1 → SV2 → SV3”, đổi người ở mốc 2:15 và 3:45 nhưng giữ nguyên nội dung.

## 2. Mốc 1 — 0:00–0:45: Mở đầu & định vị

**Tab 1 — bản deploy**

1. Mở link Render. Nếu trang trắng, nói: “Service free đang thức dậy, chờ khoảng 20–30 giây” rồi F5.
2. Mở `docs/screen-inventory.md` (tab GitHub hoặc VS Code), chỉ vào cột `#` và nói: “18 màn hình, mỗi dòng có role, file, CRUD, trạng thái, AI, người phụ trách, Task ID, branch và OBS.”
3. Chuyển tab Figma, giới thiệu file thiết kế và design system dùng chung.
4. Nói 3 câu mở đầu ở mục 0.4, nêu tên 4 role.

**Kết quả mong đợi:** trang đăng nhập hiển thị logo PetCompanion, không có 404; bảng inventory mở được.

**Nếu Render chậm:** dùng tab 2 localhost và nói rõ “bản local cùng mã nguồn với bản deploy”.

## 3. Mốc 2 — 0:45–2:15: Chủ nuôi, bộ lọc, empty state, validation

**Tab chủ nuôi — `owner/owner-pets.html`**

1. Gõ `Milo` vào ô tìm kiếm → danh sách còn đúng hồ sơ Milo.
2. Chọn bộ lọc giống loài/bộ lọc trạng thái (ví dụ “Chó”) → kết quả kết hợp với từ khóa.
3. Gõ `zzzz` → **Empty State** có thông báo và nút xóa bộ lọc.
4. Bấm “Thêm thú cưng”, để trống tên và cân nặng → bấm lưu → **Validation** hiện lỗi ngay dưới ô.
5. Nhập hợp lệ: tên `Nala` (chưa có trong seed), loài `Mèo`, cân nặng `4.5`, ngày sinh hợp lệ → lưu → toast thành công, thẻ mới xuất hiện.
6. F5 → thẻ `Nala` vẫn còn (dữ liệu ghi vào `db.json`).
7. (Nếu còn thời gian) mở `owner/owner-care.html`, chọn thú cưng, xem đề xuất AI-1; bấm **Chấp nhận** → lịch mới có mã `#AI-...`, trạng thái “AI đề xuất”; F5 → lịch vẫn còn.

**Kết quả mong đợi:** tìm kiếm và lọc chạy cùng lúc; empty state khác hoàn toàn trạng thái lỗi; lỗi validation nằm dưới trường; dữ liệu bền sau F5.

**Câu nói:** “Empty state ở đây là tìm không thấy, không phải lỗi mạng. Error state sẽ ở mốc cuối.”

## 4. Mốc 3 — 2:15–3:45: AI-3 đủ 6 bước & AI-2

### 4.1. AI-3 — `Trainer/progress.html`

1. Chọn thú cưng **Milo** ở ô chọn thú cưng.
2. Chỉ vào vùng **AI Training Log Analyzer**: input đã chọn thú cưng + nhật ký các buổi.
3. Bấm **Tạo lại tóm tắt** (hoặc để trạng thái phân tích xuất hiện khi tải) → chỉ vào **Processing** 700ms.
4. Khi kết quả hiện:
   - **Output:** điểm trung bình, tỉ lệ đạt, xu hướng, điểm mạnh/yếu.
   - **Explainability:** dòng lý do “dựa trên N buổi, delta…, tỉ lệ đạt…”.
   - **User Control:** Lưu bản nháp / Chỉnh sửa nội dung / Tạo lại / Chấp nhận & Gửi.
5. Bấm **Chỉnh sửa nội dung**, sửa một câu trong vùng `contenteditable`, bấm **Lưu bản nháp** → toast “Đã lưu nội dung chỉnh sửa”.
6. Bấm **Chấp nhận & Gửi báo cáo cho Chủ nuôi** → toast “Đã gửi báo cáo tiến độ…”.
7. Chuyển sang tab chủ nuôi, F5 `owner-pets.html` → thẻ **Báo cáo từ huấn luyện viên** xuất hiện; bấm xem → modal có 4 khối: tổng quan, điểm mạnh, cần cải thiện, khuyến nghị.
8. Nói: “Đây là **Save/Apply** — bấm gửi là ghi `status='sent'` vào resource `summaries`; trang chủ nuôi lọc theo `status='sent'` và quyền sở hữu thú cưng.”

**Low-data:** chọn một thú cưng chưa có nhật ký → AI-3 hiện “Chưa có nhật ký buổi tập để AI phân tích” kèm nút thêm ghi chú. Đây là **AI Failure / Uncertainty UX** của AI-3.

### 4.2. AI-2 — `provider/provider-service-note.html` (60–90 giây)

1. Mở ghi chú dịch vụ của Milo.
2. Tick 3/4 mục checklist → badge tiến độ đổi thành 75%.
3. Nhập chi phí → tổng tiền cập nhật.
4. Bấm **Lưu nháp** → toast và dữ liệu được lưu.
5. Bấm **Ký / Hoàn tất** → xác nhận → form bị khóa và một `medical-record` được tạo.

**Nói thật:** “AI-2 hiện là checklist cấu hình sẵn theo dịch vụ, chưa sinh nội dung động; phần giải thích và kiểm soát của người dùng nằm ở bước tick và ký.”

## 5. Mốc 4 — 3:45–5:00: Đối tác, quản trị & liên thông

### 5.1. Đối tác — `provider/provider-appointment-list.html`

1. Lọc trạng thái “Chờ tiếp nhận”.
2. Bấm **Tiếp nhận ngay** ở một ca → badge chuyển trạng thái, toast xác nhận.
3. F5 → trạng thái vẫn giữ.
4. Nói: “Ca này được ghi vào `appointments`; trang ghi chú dịch vụ đọc cùng resource để tạo bệnh án.”

### 5.2. Quản trị — `admin/dashboard.html` và `admin/services.html`

1. Mở dashboard: chỉ vào số ca chờ xử lý và bảng ca hẹn.
2. Mở `admin/services.html`: thêm dịch vụ mới (tên, danh mục, thời lượng, giá) → validation → lưu → dòng mới xuất hiện; F5 còn dữ liệu.
3. Bấm biểu tượng **AI Checklist** ở một dịch vụ → modal có các mục bắt buộc; bỏ tick “thân nhiệt” hoặc “kết mạc mắt” rồi bấm lưu → toast lỗi, không lưu; tick lại đủ → lưu thành công.
4. Nói: “Đây là AI-3 hỗ trợ vận hành: cấu hình checklist cho dịch vụ, có kiểm tra bắt buộc trước khi lưu.”

### 5.3. Liên thông dữ liệu đã chứng minh

- HLV gửi báo cáo (`summaries`) → chủ nuôi thấy trên `owner-pets.html`.
- Chủ nuôi tạo lịch chăm sóc (`care-plans`) → hiển thị trong lịch và danh sách.
- Đối tác cập nhật ca (`appointments`) → dashboard quản trị đọc cùng resource nên thấy trạng thái mới sau khi tải lại.
- Đối tác ký ghi chú → tạo `medical-records`; chủ nuôi xem bệnh án ở `owner/owner-records.html`.

> Dashboard quản trị và cổng đối tác cùng đọc/ghi resource `appointments`, nên ca do đối tác cập nhật sẽ thấy lại ở dashboard sau khi tải lại. Đây là liên thông qua API, **không phải realtime**: phải F5 hoặc mở lại trang, và không có sự kiện `storage`/BroadcastChannel.

## 6. Mốc 5 — 5:00–6:00: Responsive, A11y, error state

1. Mở DevTools (F12) → chuyển 320px → chỉ ra không có thanh cuộn ngang; đổi 768px → lưới còn 2 cột.
2. Ctrl + `+` lên 200% → nội dung không mất, không chồng.
3. Bấm **Tab** 5–6 lần → chỉ ra viền focus; bấm **Esc** → modal đóng.
4. Mở `Trainer/training-plans.html?fail=1` → **Error State** có thông báo và nút thử lại.
5. Mở `Trainer/training-plans.html?empty=1` → **Empty State** có CTA.
6. Kết luận: “Error và Empty là hai trạng thái riêng; chỉ các trang Trainer đi qua `PC.api` nên hai tham số này chỉ áp dụng ở đó.”

## 7. Phương án dự phòng

| Tình huống | Cách xử lý |
| --- | --- |
| Render chưa thức | Chuyển tab localhost, nói rõ cùng mã nguồn; tiếp tục demo |
| AI-3 không có dữ liệu Milo | Kiểm tra ô chọn thú cưng; chọn Milo; nếu vẫn trống, chạy `POST /api/reset` |
| Báo cáo không hiện bên owner | F5 trang owner; kiểm tra đã bấm “Chấp nhận & Gửi”; kiểm tra đúng tài khoản owner sở hữu Milo |
| `?fail=1` không lỗi | Chỉ demo trên trang Trainer; giải thích cơ chế `PC.api` và chuyển sang empty state |
| Form không lưu | Mở Network, kiểm tra POST/PATCH trả 2xx; chạy reset rồi thử lại |
| Hết thời gian | Bỏ AI-1 và AI-2, giữ AI-3 + báo cáo chủ nuôi + responsive |

## 8. Câu chốt 15 giây

> “Sản phẩm có 18 màn hình cho 4 vai trò, dữ liệu đi qua một mock REST API và còn nguyên sau F5. AI-3 là lát cắt hoàn chỉnh nhất: từ dữ liệu huấn luyện thật, qua 6 bước AI UX, đến báo cáo hiện bên chủ nuôi. Thiết kế, bảng công việc và mã nguồn đều có link công khai trong tài liệu.”
