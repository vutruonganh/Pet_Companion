# Khai báo sử dụng AI

> Mẫu theo **Phụ lục F** của đề cương CSE122. Báo cáo này là bản cấp nhóm, tổng hợp các công cụ đã dùng và những thay đổi có thể kiểm chứng từ mã nguồn/lịch sử Git. Nhật ký prompt chi tiết của từng phiên không được lưu đầy đủ; vì vậy báo cáo chỉ khẳng định những gì có minh chứng, không dựng lại lời thoại không có thật.

## 1. Công cụ

| Công cụ | Dùng cho | Mức độ |
|---|---|---|
| DeepSeek | Sinh mã HTML/CSS/JS, gỡ lỗi | Có |
| Gemini | Sinh mã, gợi ý cấu trúc dữ liệu | Có |
| Claude | Sinh mã, rà soát logic, viết mô tả | Có |
| ChatGPT | Sinh mã, tư vấn thiết kế/quy trình | Có |
| Mimo | Sinh mã | Có |
| Qwen | Sinh mã | Có |
| Stitch AI | Thiết kế UI/UX, mockup | Có |

Không sử dụng API key của bất kỳ nhà cung cấp AI nào trong sản phẩm. Không có lời gọi LLM trong runtime.

## 2. Câu lệnh

### 2.1 Master prompt dùng chung

Toàn bộ nhóm dùng một master prompt thống nhất để tránh mỗi trang một phong cách. Nội dung đầy đủ nằm ở [`../ai-usage-report.md`](../ai-usage-report.md). Các yêu cầu cốt lõi:

```text
Vai trò: Senior UI/UX Designer cho sản phẩm SaaS hiện đại.
Sản phẩm: PetCompanion – nền tảng quản lý hồ sơ, lịch chăm sóc và dịch vụ thú cưng.
4 vai trò: Pet Owner, Service Provider, Trainer, Admin.
Phong cách: Modern SaaS, premium nhưng thân thiện, minimalist, warm pet-care, đáng tin cậy.
Màu: Forest/Sage Green, Warm Coral, Warm Off-white, White, Dark Charcoal, Muted Gray.
Font: Inter hoặc Manrope. Bo góc 12–20px. Shadow nhẹ. Icon line.
Yêu cầu: 16 màn hình phải trông như cùng một sản phẩm; giữ nhất quán sidebar/topbar/card/spacing/icon/button/trạng thái.
Dữ liệu xuyên suốt: Minh Nguyen, Milo (Golden Retriever, 2 tuổi, 24.3 kg, dị ứng gà...).
AI: PetCompanion AI với AI Pet Summary, Smart Care Reminders, AI Service Notes, Chat.
Không viết code; chỉ thiết kế UI/UX.
```

> Ghi chú: dữ liệu trong master prompt là dữ liệu tham chiếu ban đầu. Bản triển khai dùng Nguyễn Văn An / Milo 3 tuổi / 28 kg. Sự lệch này được ghi nhận trong [`data-model.md`](data-model.md).

### 2.2 Prompt tiêu biểu theo công việc

| Công việc | Prompt tóm tắt | Công cụ |
|---|---|---|
| Dựng khung 4 cổng | “Tạo HTML/CSS/JS cho dashboard quản lý thú cưng 4 vai trò, sidebar/topbar dùng chung, dữ liệu mẫu tiếng Việt” | Claude, ChatGPT, DeepSeek |
| Mock API | “Viết Node.js server phục vụ REST /api/v1 cho các resource JSON, hỗ trợ GET/POST/PUT/PATCH/DELETE, search/filter/sort/page, reset từ seed” | ChatGPT, Claude |
| Đồng bộ giao diện | “Chuẩn hóa token màu, font, card, bảng, modal cho các trang đang khác phong cách” | Gemini, Stitch AI |
| Báo cáo HLV → chủ nuôi | “Thêm thẻ báo cáo từ HLV vào trang hồ sơ chủ nuôi, lọc báo cáo đã gửi, mở modal chi tiết” | Claude, DeepSeek |
| AI-3 | “Viết hàm phân tích nhật ký huấn luyện: điểm trung bình, tỷ lệ đạt, xu hướng, điểm mạnh/yếu, đề xuất, lý do” | ChatGPT, Claude |
| Gỡ lỗi đăng nhập | “Kiểm tra vì sao đăng nhập owner không chuyển đúng cổng” | ChatGPT, DeepSeek |

## 3. AI sinh ra gì và sinh viên đã sửa gì

### 3.1 Design system và giao diện

| Mục | Nội dung |
|---|---|
| AI sinh ra | Gợi ý bảng màu, token CSS, bố cục topnav/card/table/modal, mockup 16 màn hình |
| Sinh viên chỉnh sửa | Gộp thành `core/base.css` + `core/unify.css`; đổi nội dung sang tiếng Việt; bỏ các thành phần không có dữ liệu; thống nhất logo `assets/logoPet-trim.png`; sửa các trang lệch phong cách |
| Cách kiểm chứng | Mở 18 trang, so sánh topnav/font/màu/khoảng cách; kiểm tra 1280/768/375 px; xem console |
| Điều học được | Không thể ghép nguyên 16 màn hình AI sinh ra; phải tạo token và component dùng chung trước |

### 3.2 Mock API và dữ liệu

| Mục | Nội dung |
|---|---|
| AI sinh ra | Khung `server.js`, `server.py`, các route REST, đoạn đọc/ghi JSON |
| Sinh viên chỉnh sửa | Thêm phục vụ static, `POST /api/reset`, `GET /api/health`, `0.0.0.0` cho Render, cổng `PORT`; sửa launcher dùng `127.0.0.1`; chuẩn hóa 14 resource; bỏ resource ảo `users`/`training-pets` khỏi README |
| Cách kiểm chứng | `GET /api/health` đếm đúng bản ghi; tạo/sửa/xóa rồi F5; `POST /api/reset` khôi phục; chạy cả Node và Python |
| Điều học được | AI thường sinh code chạy local nhưng thiếu đường dẫn static/port cho deploy; phải đọc và sửa |

### 3.3 Luồng báo cáo HLV → chủ nuôi

| Mục | Nội dung |
|---|---|
| AI sinh ra | Gợi ý thẻ báo cáo, modal, đoạn render danh sách |
| Sinh viên chỉnh sửa | Chỉ lấy `summaries.status === 'sent'`; lọc theo `petId` thuộc chủ nuôi; escape nội dung; sắp xếp theo `sentAt`; thêm empty state; nối vào `reloadPets()` |
| Cách kiểm chứng | Bơm dữ liệu giả lập 1 báo cáo `sent` + 1 `draft`; xác nhận chỉ 1 hiển thị, badge = 1, modal đủ 4 khối, không lỗi console |
| Điều học được | AI dễ bỏ qua điều kiện trạng thái/quyền sở hữu; phải kiểm tra bằng dữ liệu âm |

### 3.4 Sửa lỗi điều hướng đăng nhập

| Mục | Nội dung |
|---|---|
| AI sinh ra | Bảng `HOME` ánh xạ vai trò → trang đích |
| Sinh viên chỉnh sửa | Phát hiện thiếu ánh xạ `owner`, đăng nhập chủ nuôi không sang cổng owner; bổ sung và kiểm tra lại 4 vai trò (commit `eefc274`, `7b401ad`) |
| Cách kiểm chứng | Đăng nhập lần lượt 4 tài khoản demo, quan sát URL đích; thử `locked@demo.com` |
| Điều học được | Một dòng thiếu trong bảng ánh xạ làm hỏng cả luồng; phải test đủ 4 vai trò, không chỉ vai trò đang làm |

### 3.5 AI-3

| Mục | Nội dung |
|---|---|
| AI sinh ra | Công thức trung bình, tỷ lệ đạt, xu hướng, câu đề xuất |
| Sinh viên chỉnh sửa | Thêm trường hợp `n < 2` (“chưa đủ dữ liệu”), cảnh báo “quy tắc thống kê đơn giản”, nút sửa/tạo lại/lưu nháp/gửi; lưu `summaries` và hiển thị cho chủ nuôi |
| Cách kiểm chứng | Chọn 3 buổi → đối chiếu tính tay; chọn 1 buổi → thấy cảnh báo; gửi → mở trang chủ nuôi thấy báo cáo; F5 còn dữ liệu |
| Điều học được | AI không tự biết “thiếu dữ liệu”; người thiết kế phải thêm trạng thái không chắc chắn |

### 3.6 AI-2

| Mục | Nội dung |
|---|---|
| AI sinh ra | Banner AI, checklist 4 mục, tiến độ tick, autosave |
| Sinh viên chỉnh sửa | Nối dữ liệu `service-notes`, thêm mục, tính chi phí, ký số tạo `medical-records`; **ghi nhận trung thực checklist là nội dung soạn sẵn, chưa sinh động** |
| Cách kiểm chứng | Tick đủ 4 mục; thêm mục; lưu nháp; F5; ký số; kiểm tra bệnh án bên chủ nuôi |
| Điều học được | AI có thể tạo vẻ ngoài “thông minh” nhưng logic bên dưới tĩnh; phải phân biệt UI mô phỏng và AI thật |

## 4. Các lỗi/ảo giác của AI đã phát hiện

| Lỗi | Biểu hiện | Cách sửa |
|---|---|---|
| README mô tả resource không tồn tại | Ghi `users` và `training-pets`, trong khi API thật là `accounts` và `pets` | Sửa README và tài liệu; kiểm tra `/api/health` |
| Mô tả `?fail=1`/`?empty=1` quá rộng | README nói dùng được ở cổng HLV, nhưng dễ hiểu là mọi cổng | Ghi rõ chỉ áp dụng cho trang dùng `PC.api` (HLV) |
| Điều hướng owner bị thiếu | Đăng nhập chủ nuôi không vào đúng cổng | Bổ sung `HOME.owner`, test 4 vai trò |
| Checklist AI-2 bị mô tả như sinh động | Banner nói “AI phân tích” nhưng dữ liệu tĩnh | Ghi rõ giới hạn trong `ai-features.md` |
| CSS/HTML sinh ra thiếu ngữ nghĩa | Thiếu `<main>`, thiếu `alt`, focus ring yếu | Ghi nhận trong `screen-states.md` |
| Dữ liệu mẫu lệch brief | Milo 28 kg thay vì 24,3 kg | Chọn 28 kg làm chuẩn, ghi chú rõ |

## 5. Cách kiểm chứng chung

1. **Đọc code**: giải thích được từng hàm AI-3 (`analyze`, `persist`), luồng lọc báo cáo, luồng `PATCH` trạng thái.
2. **Chạy thật**: mock server + trình duyệt, không chỉ xem ảnh.
3. **Dữ liệu âm**: thử `locked@demo.com`, xóa hết nhật ký, chọn 1 buổi, nhập sai form.
4. **F5**: mọi thao tác tạo/sửa phải còn sau khi tải lại.
5. **Console/Network**: không lỗi 404/500 ở luồng chính.
6. **So sánh với barem**: đối chiếu 6 bước AI, trạng thái, CRUD.
7. **Hỏi chéo**: thành viên khác đặt câu hỏi về đoạn AI sinh ra; nếu không giải thích được thì phải sửa/viết lại.

## 6. Điều học được

- AI tạo được khung nhanh, nhưng chi phí thật nằm ở tích hợp, đồng bộ dữ liệu và kiểm thử.
- Prompt càng ràng buộc dữ liệu/trạng thái thì đầu ra càng dùng được.
- Phải kiểm tra quyền, trạng thái và trường hợp thiếu dữ liệu — AI thường bỏ qua.
- Không được mô tả UI mô phỏng là AI thật; người chấm sẽ hỏi code.
- Tài liệu do AI viết cũng có thể sai; phải đối chiếu repo.

## 7. Khai báo theo nhóm

Báo cáo này là khai báo cấp nhóm. Phân công, commit và phạm vi từng thành viên: [`team-assignment.md`](team-assignment.md).
