# Phân công nhóm

## 1. Thành viên

| Mã | Họ tên | Email Git | Vai trò chính | Tài khoản demo phụ trách |
|---|---|---|---|---|
| SV1 | Nguyễn Hoàng Bách | `bach24012007ne@gmail.com` | Chủ nuôi, xác thực, mock API dùng chung | `owner@demo.com` |
| SV2 | Vũ Trường Anh | `vutruonganh2007@gmail.com` | Đối tác, quản trị, tích hợp/deploy | `provider@demo.com`, `admin@demo.com` |
| SV3 | Nguyễn Thế Bằng | `banghoi772@gmail.com` | Huấn luyện viên, UI xác thực, báo cáo HLV, tài liệu | `trainer@demo.com` |

## 2. Phân công theo khu vực

| Khu vực | SV1 | SV2 | SV3 |
|---|---|---|---|
| `owner/` | Chính | Hỗ trợ dữ liệu liên vai trò | Báo cáo HLV trên `owner-pets` |
| `provider/` | – | Chính | – |
| `admin/` | – | Chính | – |
| `Trainer/` | – | – | Chính |
| `login register/` | Chính (logic, OTP) | Sửa điều hướng vai trò | UI/CSS, sửa login owner |
| `core/` | `api.js`, `base.js` | `base.css`, `unify.css`, tích hợp | `unify.css` |
| `mock-api/` | Server Node/Python, seed, reset | Dữ liệu chuẩn hóa, lint launcher | Dữ liệu HLV, báo cáo |
| Deploy | – | Render, `0.0.0.0`, launcher | README, hướng dẫn |
| Tài liệu | README, mock API | Bảng dữ liệu, rubric 5.3 | AI report, OBS/README |

## 3. Lát cắt dọc của từng thành viên

Barem yêu cầu mỗi sinh viên tự làm một luồng end-to-end, không chia kiểu “một người chỉ Figma, một người chỉ HTML”.

### SV1 – Chủ nuôi + xác thực + dữ liệu

```text
Phân tích hồ sơ pet
→ HTML/CSS owner
→ JS render danh sách, tìm kiếm/lọc, thêm pet
→ Modal + validation
→ Gọi MockAPI
→ Ghi db.json
→ Responsive
→ Commit 97f8f26
→ README/API
```

**Commit chính:**

- `97f8f26` – tích hợp cổng chủ nuôi (owner pages, owner-common, server.py).
- `14ae84c` – hợp nhất MockAPI dùng chung.
- `be122b9` – thống nhất logo/liên kết.
- `9bd6aa2` – thêm OTP vào luồng đặt lại mật khẩu.

### SV2 – Đối tác + quản trị + tích hợp/deploy

```text
Phân tích lịch ca hẹn
→ HTML/CSS provider + admin
→ JS CRUD, filter, modal, trạng thái
→ Nối MockAPI
→ Dữ liệu liên vai trò
→ Deploy Render
→ Commit 35bf0fc, 2773bda, e370b9c, 46e5590
```

**Commit chính:**

- `35bf0fc` – nạp toàn bộ 4 giao diện + core + assets.
- `2773bda` – tích hợp mock API CRUD cho admin/provider.
- `7b401ad` – sửa đăng nhập admin/provider đúng vai trò.
- `e370b9c` – chuẩn hóa dữ liệu dùng chung cho rubric 5.3.
- `46e5590` – nối dữ liệu liên vai trò owner/provider/admin.
- `6c8a190` – sửa launcher `127.0.0.1`, kiểm tra cổng.

### SV3 – HLV + UI xác thực + báo cáo

```text
Phân tích giáo án/nhật ký
→ HTML/CSS Trainer
→ JS CRUD, filter, phân trang
→ AI-3: phân tích, tóm tắt, gửi
→ Báo cáo hiển thị bên chủ nuôi
→ Commit 488430a, cae692f
```

**Commit chính:**

- `488430a` – đồng bộ giao diện Trainer và login/register.
- `eefc274` – sửa đăng nhập chủ nuôi về đúng cổng.
- `cae692f` – hiển thị báo cáo HLV đã gửi trên cổng chủ nuôi.
- `ec2a7a3`, `bb541cf` – tạo/cập nhật báo cáo AI.
- `26de4af`, `9bd6aa2` (phối hợp) – tài liệu/OTP.

## 4. Phân công chéo

| Hoạt động | Người thực hiện | Minh chứng |
|---|---|---|
| Tích hợp dữ liệu owner ↔ provider ↔ admin | SV2 | `46e5590` |
| Báo cáo HLV hiển thị bên owner | SV3 viết, SV1 tích hợp trang | `cae692f` |
| Sửa login owner | SV3 | `eefc274` |
| Sửa login admin/provider | SV2 | `7b401ad` |
| Mock API dùng chung | SV1 | `14ae84c` |
| Chuẩn hóa dữ liệu | SV2 | `e370b9c` |
| README/AI report | SV3 | `5353fdc`, `bb541cf` |
| Deploy Render | SV2 | `a6f3fc3`, README |

## 5. Review

- Có PR #1 (`last_test` → `main`), được merge ngày 2026-10-26 bởi Nguyễn Thế Bằng (`Equal-11`).
- Phần lớn thay đổi được đẩy trực tiếp lên `main`/`last_test`.
- Tiêu chí review: chạy local không lỗi console; F5 còn dữ liệu; thử empty/error; kiểm tra 375 px; đọc và giải thích được code AI sinh.

## 6. Quản lý công việc

Bảng công việc của nhóm: [Notion – PetCompanion](https://app.notion.com/p/3f3f0a1d9f4980858c77d1a28bf40b70?v=3f3f0a1d9f498013bd4f000c8f350ef8&source=copy_link).

Task ID dùng quy ước `PC-<nhóm>-<số>`, khớp với [`screen-inventory.md`](screen-inventory.md). Mỗi card gắn màn hình, tệp, người phụ trách, nhánh, PR và OBS tương ứng.

## 7. Worklog theo ngày

| Ngày | SV1 | SV2 | SV3 |
|---|---|---|---|
| 2026-10-25 | Owner pages, MockAPI, logo, OTP | 4 giao diện, admin/provider CRUD, dữ liệu chuẩn hóa, deploy | Trainer UI, login/register UI, sửa login owner |
| 2026-10-26 | Hỗ trợ tích hợp | Nối dữ liệu liên vai trò, launcher | Báo cáo HLV, README, AI report, merge PR #1 |
| 2026-10-26 (docs) | – | – | Bổ sung bộ `docs/` theo barem |

## 8. Cam kết

- Mỗi thành viên giải thích được code mình phụ trách và code AI sinh ra trong phạm vi mình dùng.
- Không đẩy commit dồn vào phút cuối.
- Không để lộ API key/secret.
- Không dùng dữ liệu thật của người khác.
- Không mô tả tính năng chưa có.
