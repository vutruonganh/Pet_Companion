# Tính năng AI và trải nghiệm AI

## 1. Tổng quan

PetCompanion có **3 tính năng AI** theo brief BTL-35. Cả ba đều chạy phía frontend, không gọi LLM thật:

| Mã | Tên | Màn hình | Cách hoạt động | Mức hoàn chỉnh |
|---|---|---|---|---|
| AI-1 | Care Reminder Assistant | `owner/owner-care.html` | Bảng gợi ý xác định (tẩy giun/vắc-xin) + lý do + lần dùng trước | Một phần |
| AI-2 | Service Checklist AI | `provider/provider-service-note.html` | Checklist soạn sẵn theo hồ sơ Milo + tiến độ tick + autosave | Một phần |
| AI-3 | Training Progress Summary | `Trainer/progress.html` | Thống kê nhật ký, sinh tóm tắt/đề xuất/lý do, gửi chủ nuôi | Đầy đủ nhất |

**Tuyên bố trung thực:** không có mô hình học máy, không gọi API LLM, không có API key. Đầu ra được sinh bằng quy tắc JavaScript và dữ liệu soạn sẵn. Vì vậy không được mô tả là “AI thật” khi bảo vệ.

## 2. AI-1 – Care Reminder Assistant

### 2.1 Vị trí

- Giao diện: thẻ AI trong `owner/owner-care.html`, neo `#ai`.
- Logic: `owner/owner-care.js`, hằng `AI_RECS` và các hàm `renderAi()`, `renderAiPets()`, xử lý nút Chấp nhận/Điều chỉnh/Bỏ qua.

### 2.2 Dữ liệu gợi ý

| Loại | Dịch vụ | Ngày | Giờ | Địa điểm | Lý do | Lần trước |
|---|---|---|---|---|---|---|
| Tẩy giun | Uống thuốc tẩy giun định kỳ (NexGard Spectra) | 18/11/2026 | 08:30 | Tại nhà | Chu kỳ 3 tháng/lần cho chó trưởng thành trên 25 kg | 18/08/2026 |
| Vắc-xin | Tiêm nhắc vắc-xin dại | 15/11/2026 | 10:00 | PetCare Clinic Quận 1 | Vắc-xin dại nhắc lại sau 12 tháng theo phác đồ | 15/11/2025 |

### 2.3 Quy trình 6 bước

| Bước | Thực tế | Đánh giá |
|---|---|---|
| 1. Input | Chọn pet (Milo/Luna/Bông…) và loại nhắc (tẩy giun/vắc-xin) | Có |
| 2. Processing | Kết quả hiện ngay; chữ “Đang phân tích hồ sơ...” chỉ là trạng thái ban đầu | Thiếu loading thật |
| 3. Output | Dịch vụ + ngày giờ + địa điểm + người cung cấp | Có |
| 4. Explainability | Khối “Lý do” + “Lần dùng trước” | Có |
| 5. Accept/Edit/Reject | Chấp nhận / Điều chỉnh / Bỏ qua | Có |
| 6. Save | Chấp nhận tạo `care-plans` với `status = pending`, nhãn “AI đề xuất”, mã `#AI-...` | Có |

### 2.4 Hành vi chi tiết

- **Chấp nhận:** tạo lịch mới, gắn nhãn AI, hiện trong lịch tháng và danh sách; F5 vẫn còn.
- **Điều chỉnh:** mở modal tạo lịch với dữ liệu điền sẵn và ghi chú “Điều chỉnh từ đề xuất AI”; người dùng sửa trước khi lưu.
- **Bỏ qua:** ẩn thẻ AI và hiện toast; không ghi dữ liệu.
- **Giới hạn:** gợi ý không thay đổi theo cân nặng/giống/tuổi thật; không kiểm tra trùng lịch đã có.

### 2.5 Failure / Uncertainty UX

**Hiện trạng:** chưa có trạng thái thất bại rõ ràng. Nếu API lỗi, trang lịch hiện khối lỗi nhưng thẻ AI vẫn hiển thị gợi ý tĩnh.

**Đề xuất bổ sung tối thiểu:**

- Nếu không có pet: “Chưa đủ dữ liệu để đề xuất lịch. Hãy thêm hồ sơ thú cưng.”
- Nếu đã có lịch trùng: “AI chưa chắc chắn vì đã có lịch gần ngày này. Bạn vẫn muốn tạo?”
- Nếu API lỗi: “Không thể tải hồ sơ để phân tích. Thử lại / Dùng form thủ công.”
- Nút: **Thử lại**, **Dùng thủ công**, **Bỏ qua**.

## 3. AI-2 – Service Checklist AI

### 3.1 Vị trí

- Giao diện: banner “AI Service Checklist • Chuẩn an toàn BTL-35” trong `provider/provider-service-note.html`.
- Logic: `provider/provider-service-note.js` xử lý tick checklist, badge tiến độ, autosave nháp, thêm mục, tính chi phí, ký số.

### 3.2 Nội dung checklist hiện tại

4 mục soạn sẵn cho Milo:

1. Kiểm tra vùng kẽ chân và niêm mạc tai (tiền sử ngứa mẩn đỏ).
2. Đo thân nhiệt & nghe nhịp tim trước khi lấy mẫu máu sinh hóa.
3. Kiểm tra dị ứng thuốc kháng sinh dòng Penicillin/Amoxicillin trong hồ sơ cũ.
4. Cân trọng lượng chính xác để kê liều tẩy giun NexGard Spectra.

### 3.3 Quy trình 6 bước

| Bước | Thực tế | Đánh giá |
|---|---|---|
| 1. Input | Hồ sơ Milo + triệu chứng trong nội dung banner (tĩnh) | Một phần |
| 2. Processing | Không có; checklist render sẵn | Thiếu |
| 3. Output | 4 mục checklist | Có |
| 4. Explainability | Câu “AI đã phân tích tiền sử dị ứng…” (tĩnh, không dẫn nguồn dữ liệu cụ thể) | Một phần |
| 5. Accept/Edit/Reject | Tick/bỏ tick từng mục; thêm mục kiểm tra an toàn | Có |
| 6. Save | Lưu nháp hoặc ký → ghi `service-notes`, tạo `medical-records` | Có |

### 3.4 Hành vi chi tiết

- Badge tiến độ: “Đã kiểm x/y (z%)”.
- Tick đủ 100% đổi nhãn.
- “Thêm mục kiểm tra an toàn” dùng `prompt()` để thêm mục mới.
- Autosave nháp ghi `service-notes` (có fallback lưu tạm nếu API lỗi).
- Ký số khóa toàn bộ input/checkbox, ghi `signedAt`, tạo bệnh án cho chủ nuôi.

### 3.5 Failure / Uncertainty UX

**Hiện trạng:** chưa có. Checklist luôn hiển thị đầy đủ, kể cả khi thiếu dữ liệu.

**Đề xuất:**

- Khi thiếu hồ sơ dị ứng: “Chưa có dữ liệu dị ứng — không thể cá nhân hóa checklist. Dùng checklist chuẩn.”
- Khi API lỗi: “Không tải được hồ sơ. Checklist đang ở chế độ chuẩn.”
- Nút: **Dùng checklist chuẩn**, **Thử lại**, **Báo cáo thiếu dữ liệu**.

### 3.6 Giới hạn

AI-2 là **mô phỏng giao diện**, chưa sinh checklist động từ triệu chứng.

## 4. AI-3 – Training Progress Summary

### 4.1 Vị trí

- Giao diện: `Trainer/progress.html`, vùng `#aiMount`.
- Logic: `Trainer/progress.js`, các hàm `analyze()`, `initSummary()`, `renderAI()`, `regen()`, `persist()`, `readEdits()`.

### 4.2 Cách tính

Với các buổi được chọn:

- `avg` = trung bình `score`.
- `rate` = tỷ lệ buổi `pass` hoặc `excellent`.
- `delta` = điểm buổi cuối − điểm buổi đầu.
- `trend`:
  - `n < 2`: “Mới có 1 buổi nên chưa đủ dữ liệu để đánh giá xu hướng”.
  - `delta >= 10`: tăng ít nhất 10 điểm.
  - `delta <= -10`: giảm ít nhất 10 điểm, cần xem lại cường độ.
  - còn lại: ổn định.
- Nhóm theo `goal`, tính điểm trung bình từng mục tiêu → mạnh nhất/yếu nhất.
- `advice` theo `avg`:
  - `>= 80`: tăng độ khó.
  - `>= 60`: giữ cường độ, củng cố mục tiêu yếu.
  - `< 60`: giảm độ khó, chia nhỏ mục tiêu.

### 4.3 Quy trình 6 bước

| Bước | Thực tế | Đánh giá |
|---|---|---|
| 1. Input | Chọn pet + tick các buổi nhật ký (5 buổi gần nhất) | Có |
| 2. Processing | “Đang phân tích N nhật ký...” trong 700 ms, nút tạm khóa | Có |
| 3. Output | Tóm tắt tiến độ + đề xuất điều chỉnh giáo án | Có |
| 4. Explainability | Khối “Căn cứ suy luận”: số buổi, điểm từng buổi, tỷ lệ đạt, tên HLV, cảnh báo “quy tắc thống kê đơn giản – HLV nên xem lại” | Có |
| 5. Accept/Edit/Reject | Sửa nội dung trực tiếp; Lưu nháp; Tạo lại; Chấp nhận & Gửi | Có |
| 6. Save | `summaries.status = draft/sent`; gửi thì có `sentAt`; chủ nuôi đọc được | Có |

### 4.4 Luồng gửi báo cáo sang chủ nuôi

```text
Trainer/progress.html
→ Chấp nhận & Gửi báo cáo cho Chủ nuôi
→ PATCH/POST summaries { status: 'sent', sentAt }
→ owner/owner-pets.js loadReports()
→ lọc status === 'sent' && petId thuộc chủ nuôi
→ hiển thị thẻ "Báo cáo từ HLV" + badge số lượng
→ mở modal: tóm tắt, đề xuất, căn cứ, danh sách buổi
```

Đã kiểm chứng bằng dữ liệu giả lập: 1 báo cáo `sent` hiển thị, báo cáo `draft` bị lọc, badge = 1, modal có 4 khối, không lỗi console.

### 4.5 Failure / Uncertainty UX

Đây là AI feature có trạng thái thất bại/không chắc chắn rõ nhất:

| Tình huống | Thông điệp/hành vi | Thao tác |
|---|---|---|
| Chưa có nhật ký | “Chưa có nhật ký buổi tập để AI phân tích.” | “Thêm ghi chú buổi mới” |
| Chỉ có 1 buổi | “Mới có 1 buổi nên chưa đủ dữ liệu để đánh giá xu hướng” | Vẫn cho xem điểm, không kết luận xu hướng |
| Không chọn buổi | “Hãy chọn ít nhất một buổi để phân tích.” | Chọn lại |
| API lỗi | Khối lỗi + “Thử lại” | Tải lại |
| Không có pet | “Chưa có thú cưng nào.” | Quay lại trang chủ nuôi/giáo án |

### 4.6 Giới hạn

- Không dùng LLM; không hiểu ngôn ngữ tự nhiên.
- Chỉ phân tích `score`, `result`, `goal`; không đọc nội dung ghi chú.
- Chưa có chỉnh sửa từng đoạn bằng AI; “Chỉnh sửa nội dung” là sửa tay.
- Chưa có phiên bản hóa báo cáo; bản mới ghi đè bản cũ.

## 5. AI phụ trợ ở trang quản trị

| Thành phần | Vị trí | Bản chất |
|---|---|---|
| Cấu hình AI Checklist | `admin/services.html`, modal `#modalChecklist` | Tick/bỏ các bước bắt buộc; chặn bỏ bước nhiệt độ/mắt; lưu bằng toast, chưa ghi DB |
| Thẻ “AI Engine” | `admin/dashboard.html` | Hiển thị trạng thái hạ tầng, không phải tính năng AI |

Không tính hai thành phần này là AI feature độc lập.

## 6. Cam kết an toàn và giới hạn y khoa

- Không chẩn đoán bệnh, không kê đơn, không thay thế bác sĩ.
- AI-2 chỉ là checklist hỗ trợ; bác sĩ vẫn quyết định.
- AI-3 chỉ tóm tắt dữ liệu huấn luyện; HLV xem lại trước khi gửi.
- Không có API key, không gửi dữ liệu ra ngoài.
- Nội dung AI sinh cần được người có chuyên môn xác nhận trước khi dùng thật.
