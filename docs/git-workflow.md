# Quy trình Git và GitHub

## 1. Kho và nhánh thực tế

| Hạng mục | Giá trị |
|---|---|
| Remote | https://github.com/vutruonganh/Pet_Companion.git |
| Nhánh mặc định | `main` |
| Nhánh nộp bài | `last_test` |
| Tổng commit | 27 (tính cả initial) |
| Tác giả | 3 |
| PR đã có | #1 – `last_test` → `main`, merge commit `376ff67` ngày 2026-10-26 |
| Bảng công việc | https://app.notion.com/p/3f3f0a1d9f4980858c77d1a28bf40b70?v=3f3f0a1d9f498013bd4f000c8f350ef8&source=copy_link |

| Nhánh | Tip hiện tại | Trạng thái |
|---|---|---|
| `main` | `376ff67` | Đã merge `last_test` qua PR #1 |
| `last_test` | `cae692f` | Nhánh chứa báo cáo HLV; đã merge |
| `feature/data-rubric-5.3` | `e370b9c` | Đã nằm trong `last_test`/`main` |
| `feature/logo-mock-api` | `b518516` | Đã nằm trong `last_test`/`main` |

## 2. Lịch sử commit chính

| Commit | Ngày | Tác giả | Nội dung |
|---|---|---|---|
| `28bc701` | 2026-10-03 | vutruonganh | Initial commit |
| `35bf0fc` | 2026-10-25 | Vũ Trường Anh | Nạp 4 giao diện + core + assets |
| `488430a` | 2026-10-25 | banghoi772 (Nguyễn Thế Bằng) | Đồng bộ Trainer + login/register |
| `2773bda` | 2026-10-25 | Vũ Trường Anh | Mock API CRUD cho admin/provider |
| `b518516` | 2026-10-25 | Vũ Trường Anh | Logo PetCompanion trong header |
| `97f8f26` | 2026-10-25 | Nguyễn Hoàng Bách | Tích hợp cổng chủ nuôi |
| `7b401ad` | 2026-10-25 | Vũ Trường Anh | Sửa điều hướng đăng nhập admin/provider |
| `eefc274` | 2026-10-25 | banghoi772 (Nguyễn Thế Bằng) | Sửa đăng nhập chủ nuôi về cổng owner |
| `14ae84c` | 2026-10-25 | Nguyễn Hoàng Bách | Hợp nhất MockAPI dùng chung |
| `be122b9` | 2026-10-25 | Nguyễn Hoàng Bách | Thống nhất logo/liên kết |
| `9bd6aa2` | 2026-10-25 | Nguyễn Hoàng Bách | Thêm OTP vào luồng đặt lại mật khẩu |
| `e370b9c` | 2026-10-25 | Vũ Trường Anh | Chuẩn hóa dữ liệu dùng chung (rubric 5.3) |
| `46e5590` | 2026-10-26 | Vũ Trường Anh | Nối dữ liệu liên vai trò owner/provider/admin |
| `6c8a190` | 2026-10-26 | Vũ Trường Anh | Launcher dùng `127.0.0.1`, kiểm tra cổng |
| `cae692f` | 2026-10-26 | banghoi772 (Nguyễn Thế Bằng) | Hiển thị báo cáo HLV trên cổng chủ nuôi |
| `376ff67` | 2026-10-26 | Equal-11 (Nguyễn Thế Bằng) | Merge PR #1 vào `main` |

## 3. Quy ước commit

Repo dùng Conventional Commits ở phần lớn commit gần đây:

```text
feat: hien thi bao cao HLV da gui tren cong chu nuoi
fix: launcher dung 127.0.0.1 va kiem tra lai cong truoc khi bao loi
feat: noi du lieu lien vai tro giua owner, provider va admin
```

Định dạng:

```text
<type>(<scope>): <mô tả ngắn>

feat(owner): them the bao cao HLV
fix(auth): sua dieu huong owner sau dang nhap
docs(rubric): bo sung screen inventory
test(provider): kiem tra empty state danh sach ca hen
chore(deploy): cau hinh cong Render
```

`type`: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
`scope`: `owner`, `provider`, `trainer`, `admin`, `auth`, `core`, `mock-api`, `docs`, `deploy`.

## 4. Quy ước nhánh

```text
main        ← nhánh phát hành, dùng cho bản deploy Render
last_test   ← nhánh nộp bài, đã merge vào main
feature/<role>-<screen>-<action>
```

Ví dụ:

```text
feature/owner-trainer-report
feature/provider-service-note-ai
feature/trainer-progress-summary
feature/admin-rbac-filter
feature/auth-otp-flow
```

### Tạo nhánh feature

```bash
git switch main
git pull origin main
git switch -c feature/owner-trainer-report
```

### Commit và push

```bash
git add owner/owner-pets.html owner/owner-pets.js owner/owner.css
git commit -m "feat(owner): hien thi bao cao HLV da gui"
git push -u origin feature/owner-trainer-report
```

### Tạo PR

1. Mở GitHub → Compare & pull request.
2. Base: `main`; Compare: `feature/owner-trainer-report`.
3. Điền mô tả: màn hình, Task ID, cách test, ảnh chụp.
4. Gán reviewer là thành viên khác.
5. Merge sau khi checklist review đạt.

## 5. PR #1

| Trường | Giá trị |
|---|---|
| Tiêu đề | Merge pull request #1 from `vutruonganh/last_test` |
| Base | `main` |
| Head | `last_test` (`cae692f`) |
| Merge commit | `376ff67` |
| Người merge | `Equal-11` (Nguyễn Thế Bằng) |
| Ngày | 2026-10-26 |

## 6. Bảo mật và dữ liệu

- `.gitignore` đã bỏ qua `.vscode/`, `.idea/`, `*.log`, `*.zip`, `node_modules/`.
- Không có API key/secret trong repo.
- `mock-api/db.json` chứa dữ liệu demo; không đưa dữ liệu thật vào.
- `accounts.password` là plaintext trong seed, chỉ dùng cho nguyên mẫu. Không được tái sử dụng mật khẩu thật.
- Kiểm tra trước khi commit:

```bash
git diff --cached
git status
```

- Nếu lỡ commit secret: thu hồi key, xóa khỏi lịch sử, không chỉ xóa file ở commit mới.

## 7. Đồng bộ nhánh hiện tại

Khi repo local là clone single-branch:

```bash
git fetch origin last_test:refs/remotes/origin/last_test
git fetch origin feature/data-rubric-5.3:refs/remotes/origin/feature/data-rubric-5.3
git fetch origin feature/logo-mock-api:refs/remotes/origin/feature/logo-mock-api
```

Kiểm tra:

```bash
git branch -a
git log --oneline --all --decorate -20
```
