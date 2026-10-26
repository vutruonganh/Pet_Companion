# Bao phủ trạng thái theo màn hình

Barem yêu cầu mỗi chức năng quan trọng phải được phân tích trạng thái phù hợp, không nhất thiết mọi trang đủ mọi trạng thái. Bảng dưới ghi rõ trạng thái nào **có trong mã**, trạng thái nào chỉ **một phần**, và cách kích hoạt khi demo.

Ký hiệu: **C** có, **P** một phần, **–** không áp dụng/không có.

## 1. Bảng tổng hợp

| # | Màn hình | Normal | Loading | Empty | Error | Success | Pending | Cancelled | Disabled |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `index.html` | C | – | – | P | – | – | – | – |
| 2 | `login.html` | C | C | – | C | C | C (locked) | – | C |
| 3 | `register.html` | C | C | – | C | C | C (tài khoản chờ duyệt) | – | C |
| 4 | `forgot-password.html` | C | P | – | C | C | – | – | C |
| 5 | `otp-verification.html` | C | P | – | C | C | – | – | C (đếm ngược) |
| 6 | `reset-password.html` | C | P | – | C | C | – | – | C |
| 7 | `owner-pets.html` | C | P | C | C | C | – | – | C (nút thêm) |
| 8 | `owner-care.html` | C | P | C | C | C | C | C | C |
| 9 | `owner-records.html` | C | P | C | C | C | – | – | – |
| 10 | `provider-appointment-list.html` | C | C | C | C | C | C | C | C |
| 11 | `provider-calendar.html` | C | P | C | P | C | C | C | – |
| 12 | `provider-service-note.html` | C | P | – | P | C | C (nháp) | – | C (đã ký) |
| 13 | `training-plans.html` | C | C | C | C | C | C | C (paused) | C |
| 14 | `exercise-library.html` | C | C | C | C | C | – | C (archived) | C |
| 15 | `progress.html` | C | C | C | C | C | C | – | C |
| 16 | `admin/dashboard.html` | C | C | P | C | C | C | C | C |
| 17 | `admin/rbac.html` | C | C | P | C | C | C | C (locked) | C |
| 18 | `admin/services.html` | C | C | C | C | C | – | C (hidden/paused) | C |

## 2. Chi tiết từng màn hình

### 2.1 `index.html`

- Normal: chuyển ngay sang `login register/login.html`, giữ query/hash.
- Error: nếu JavaScript bị tắt, thẻ `meta refresh` vẫn chuyển trang; nếu cả hai thất bại, có link dự phòng.
- Không có loading/empty vì chỉ là trang chuyển hướng.

### 2.2 `login.html`

- Normal: form email/mật khẩu, chọn vai trò demo, ghi nhớ đăng nhập.
- Loading: nút đổi thành “Đang xác thực…” kèm spinner, form tạm khóa.
- Error: email rỗng/sai định dạng, mật khẩu dưới 6 ký tự, sai tài khoản, tài khoản `locked`.
- Success: thông báo xanh + toast, chuyển cổng sau 1,2 giây.
- Pending: tài khoản `pending` vẫn đăng nhập được trong bản demo (chưa chặn).
- Disabled: nút submit trong lúc gọi API.
- Cách demo: nhập `locked@demo.com` để thấy trạng thái bị khóa; nhập sai mật khẩu để thấy lỗi.

### 2.3 `register.html`

- Normal: họ tên, email, SĐT, vai trò, mật khẩu, xác nhận, điều khoản.
- Loading: nút gửi chờ API.
- Error: thiếu trường, email sai/trùng, SĐT sai, mật khẩu yếu, xác nhận không khớp, chưa đồng ý điều khoản.
- Success: tạo `accounts` mới, thông báo và chuyển đăng nhập.
- Pending: tài khoản mới có thể ở trạng thái chờ duyệt tùy payload.

### 2.4 `forgot-password.html`

- Normal: nhập email.
- Loading: nút “Gửi mã” chờ mô phỏng.
- Error: email rỗng/sai định dạng.
- Success: thông báo đã gửi OTP, hiện liên kết sang trang OTP.
- Disabled: nút gửi trong lúc xử lý.

### 2.5 `otp-verification.html`

- Normal: 6 ô nhập, tự chuyển ô, cho phép dán.
- Error: thiếu mã, mã sai, mã hết hạn.
- Success: chuyển sang đặt lại mật khẩu.
- Disabled: nút gửi lại bị khóa trong thời gian đếm ngược.

### 2.6 `reset-password.html`

- Normal: mật khẩu mới + xác nhận, thanh độ mạnh, 4 điều kiện.
- Error: không đủ mạnh, không khớp, trống.
- Success: đổi thành công, quay lại đăng nhập.
- Disabled: nút lưu khi form chưa hợp lệ.

### 2.7 `owner-pets.html`

- Normal: thẻ pet, thống kê, thẻ báo cáo HLV.
- Loading: dữ liệu hiển thị sau khi API trả về; chưa có skeleton riêng (một phần).
- Empty: không có pet khớp bộ lọc → “Không tìm thấy thú cưng phù hợp”; chưa có báo cáo → “Chưa có báo cáo nào từ HLV”.
- Error: API lỗi → khối `cloud_off` + nút thử lại + toast.
- Success: thêm pet → toast, thẻ mới xuất hiện, F5 vẫn còn.
- Disabled: nút lưu trong modal khi đang gửi.

### 2.8 `owner-care.html`

- Normal: lịch tháng, danh sách lịch, tab Tất cả/Sắp tới, thẻ AI-1.
- Loading: ban đầu hiện “Đang phân tích hồ sơ...” trong thẻ AI (một phần, không phải loading thật).
- Empty: tháng không có lịch → “Chưa có lịch chăm sóc nào trong tháng này”.
- Error: tải lịch lỗi → `cloud_off` + thông báo.
- Success: tạo lịch/đặt hẹn → toast, lịch xuất hiện, F5 vẫn còn.
- Pending: lịch chờ xác nhận hoặc AI đề xuất (`status = pending`, nhãn “AI đề xuất”).
- Cancelled: lịch bị hủy mờ đi, không còn nút hủy.
- Disabled: nút lưu trong modal khi đang gửi.

### 2.9 `owner-records.html`

- Normal: bảng lịch sử, bộ lọc pet/loại/thời gian, panel chi tiết.
- Loading: chờ API (một phần).
- Empty: không có hồ sơ khớp bộ lọc → thông báo trong bảng và panel.
- Error: API lỗi → `cloud_off`, không hiển thị dữ liệu giả.
- Success: xuất JSON/PDF (in) thành công.
- Không có trạng thái hủy vì bệnh án đã hoàn tất.

### 2.10 `provider-appointment-list.html`

- Normal: bảng ca hẹn, tìm kiếm, lọc trạng thái/dịch vụ.
- Loading: dòng “Đang tải danh sách ca hẹn…”.
- Empty: “Không tìm thấy ca hẹn nào phù hợp”.
- Error: dòng lỗi + nút “Thử lại”.
- Success: tiếp nhận/hoàn tất → badge đổi màu, toast.
- Pending: “Chờ tiếp nhận”.
- Cancelled: badge đỏ, không còn hành động.
- Disabled: ca đã hủy/hoàn tất không có nút xử lý.

### 2.11 `provider-calendar.html`

- Normal: lịch tháng, timeline theo phòng, chuyển view ngày/tuần.
- Loading: chờ `calendar-events` (một phần).
- Empty: ngày không có ca → ô trống.
- Error: toast cảnh báo, lịch rỗng thay vì crash.
- Success: tạo ca mới → sự kiện xuất hiện.
- Pending/Cancelled: hiển thị theo màu/trạng thái ca.

### 2.12 `provider-service-note.html`

- Normal: form biên bản, checklist AI-2, chi phí, nút lưu nháp/ký.
- Loading: chờ `service-notes`/`pets` (một phần).
- Error: API lỗi → toast cảnh báo, vẫn cho lưu tạm trên giao diện.
- Success: lưu nháp → toast thời gian; ký → khóa form, tạo medical-record.
- Pending: trạng thái nháp trước khi ký.
- Disabled: sau khi ký, toàn bộ input/checkbox bị khóa.

### 2.13 `training-plans.html`

- Normal: KPI, danh sách giáo án, tìm kiếm/lọc, phân trang.
- Loading: `PC.stateBox('loading', ...)`.
- Empty: “Chưa có kế hoạch huấn luyện nào” hoặc “Không có kế hoạch nào khớp bộ lọc”.
- Error: `PC.stateBox('error', ..., 'Thử lại')`.
- Success: tạo/sửa giáo án, thêm nhật ký, cấp chứng nhận.
- Pending: trạng thái `new`.
- Cancelled: `paused` (tạm hoãn) hiển thị riêng.
- Disabled: nút lưu khi gửi; giáo án đã tốt nghiệp không sửa tiến độ.

### 2.14 `exercise-library.html`

- Normal: lưới bài tập, tìm kiếm, lọc độ khó/thời lượng/nhóm, panel chi tiết.
- Loading: `PC.stateBox('loading', ...)`.
- Empty: “Thư viện chưa có bài tập nào” hoặc “Không có bài tập nào khớp bộ lọc”.
- Error: `PC.stateBox('error', ..., 'Thử lại')`.
- Success: thêm/sửa/xóa bài tập, gán vào giáo án.
- Cancelled: bài tập `archived` bị lọc khỏi danh sách.
- Disabled: nút xóa khi đang gọi API.

### 2.15 `progress.html`

- Normal: chọn pet, chọn buổi, thẻ AI-3, biểu đồ, nhật ký, chat, sổ thú y.
- Loading: `PC.stateBox('loading', 'Đang tải dữ liệu tiến độ...')`.
- Empty: chưa có pet; chưa có nhật ký → “Chưa có nhật ký buổi tập để AI phân tích”.
- Error: `PC.stateBox('error', ..., 'Thử lại')`.
- Success: tạo lại tóm tắt, lưu nháp, gửi báo cáo.
- Pending: `summaries.status = draft`.
- Low data/uncertainty: chọn 1 buổi → “Mới có 1 buổi nên chưa đủ dữ liệu để đánh giá xu hướng”.
- Disabled: nút phân tích lại trong 700 ms xử lý.

### 2.16 `admin/dashboard.html`

- Normal: KPI, biểu đồ, ca chờ duyệt, hoạt động gần đây.
- Loading: dòng “Đang tải danh sách ca hẹn…”.
- Empty: bảng không có ca (một phần).
- Error: dòng lỗi + thông báo.
- Success: duyệt/hủy ca, broadcast, xuất báo cáo.
- Pending: ca chờ duyệt.
- Cancelled: ca đã hủy.
- Disabled: nút xử lý ca đã hoàn tất/hủy.

### 2.17 `admin/rbac.html`

- Normal: bảng người dùng, tìm kiếm, lọc vai trò/trạng thái, phân trang.
- Loading: “Đang tải danh bạ người dùng...”.
- Empty: bộ lọc không có kết quả (một phần).
- Error: “Không tải được danh bạ người dùng”.
- Success: thêm/khóa/mở/xóa tài khoản.
- Pending: tài khoản chờ kích hoạt.
- Cancelled: tài khoản `locked`.
- Disabled: không cho khóa chính mình hoặc tài khoản không hợp lệ.

### 2.18 `admin/services.html`

- Normal: bảng dịch vụ, tab nhóm, tìm kiếm, thống kê.
- Loading: “Đang tải danh mục dịch vụ...”.
- Empty: “Chưa có dịch vụ nào trong hệ thống”.
- Error: “Không tải được danh mục dịch vụ”.
- Success: thêm/sửa/ẩn, bật/tắt cung ứng, lưu cấu hình checklist.
- Paused: công tắc tắt → “Tạm dừng nhận”.
- Hidden: dòng mờ 45%.
- Disabled: bỏ bước kiểm tra bắt buộc trong AI Checklist bị chặn.

## 3. Trạng thái AI theo barem

| Bước AI UX | AI-1 Care Reminder | AI-2 Service Checklist | AI-3 Training Summary |
|---|---|---|---|
| 1. Input | Chọn pet + loại nhắc | Dữ liệu Milo + checklist soạn sẵn | Chọn các buổi nhật ký |
| 2. Processing | Không có (kết quả tức thì) | Không có | Có, 700 ms “Đang phân tích N nhật ký...” |
| 3. Output | Dịch vụ, ngày giờ, địa điểm | 4 mục checklist | Tóm tắt + đề xuất |
| 4. Explainability | “Lý do” + lần dùng trước | Banner “AI phân tích tiền sử dị ứng” (tĩnh) | “Căn cứ suy luận” chi tiết |
| 5. Accept/Edit/Reject | Chấp nhận / Điều chỉnh / Bỏ qua | Tick từng mục / thêm mục | Sửa / Tạo lại / Lưu nháp / Gửi |
| 6. Save | Tạo `care-plans` | Lưu `service-notes` | Lưu `summaries` |

**AI failure/uncertainty:** AI-3 có trạng thái 1 buổi (“chưa đủ dữ liệu để đánh giá xu hướng”) và trạng thái chưa có nhật ký. AI-1 và AI-2 chưa có trạng thái lỗi riêng.

## 4. Responsive và A11y

| Điểm kiểm tra | Trạng thái | Ghi chú |
|---|---|---|
| 320 / 375 / 768 / 1280 px | Có media query | CSS có breakpoint tại 1100/900/760/640 px |
| Không cuộn ngang | Một phần | Một số bảng có thể tràn ở 320 px |
| `:focus-visible` | Thiếu | `core/base.css` chưa định nghĩa focus ring rõ ràng |
| `alt` cho ảnh | Một phần | Nhiều ảnh có alt; một số avatar để `alt=""` có chủ đích |
| `<main>` | Một phần | Thiếu ở 3 trang admin và 3 trang provider |
| `<h1>` duy nhất | Có | Các trang nghiệp vụ có một `h1` |
| Label cho input | Một phần | Form chính có label; một số ô tìm kiếm dùng `aria-label` |
| Esc đóng modal | Có | `core/base.js` và `PC.modal` xử lý Escape |
| Bàn phím cho luồng chính | Có | Modal dùng được Tab; bảng có nút thao tác |
