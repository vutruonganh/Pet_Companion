/* login.js – hành vi giao diện lấy từ bản Stitch (toast, validate, spinner, ghi nhớ đăng nhập, mô tả theo vai trò)
 * + xác thực thật bằng users.json qua PC.api, lưu phiên bằng PC.session và chuyển trang theo vai trò. */
(function () {
  const $ = (id) => document.getElementById(id);
  const emailInput = $('login-email'), passwordInput = $('login-password');
  const togglePasswordBtn = $('toggle-password'), eyeIcon = $('eye-icon');
  const roleBtns = document.querySelectorAll('.role-btn');
  const roleIndicator = $('role-indicator'), authSubtitle = $('auth-subtitle');
  const quickEmailLabel = $('quick-email-label'), quickPwdLabel = $('quick-pwd-label');
  const fillDemoBtn = $('fill-demo-btn'), clearEmailBtn = $('clear-email');
  const validityBadge = $('email-validity-badge'), validityIcon = $('email-validity-icon'), validityText = $('email-validity-text');
  const loginForm = $('login-form'), rememberCheckbox = $('remember-me');
  const statusMessage = $('status-message'), statusText = $('status-text'), statusIcon = $('status-icon');
  const submitBtn = $('submit-btn'), btnIcon = $('btn-icon'), btnText = $('btn-text');
  const toastContainer = $('toast-container');

  /* Tài khoản mẫu khớp mock-api/users.json */
  const roleData = {
    owner:    { title: 'Chủ nuôi (Pet Owner)', subtitle: 'Đăng nhập để điều phối lịch hẹn, theo dõi sức khỏe và quản lý thú cưng của bạn.', email: 'owner@demo.com', password: 'demo123' },
    provider: { title: 'Dịch vụ Thú y & Spa (Provider)', subtitle: 'Truy cập cổng phòng khám & Spa để tiếp nhận lịch hẹn và phác đồ điều trị.', email: 'provider@demo.com', password: 'demo123' },
    trainer:  { title: 'Huấn luyện viên (Trainer)', subtitle: 'Quản trị các khóa huấn luyện chuyên môn, theo dõi tiến độ học viên thú cưng.', email: 'trainer@demo.com', password: 'demo123' },
    admin:    { title: 'Quản trị viên (Admin)', subtitle: 'Bảng điều khiển toàn diện hệ sinh thái chăm sóc thú cưng BTL-35 PetCare.', email: 'admin@demo.com', password: 'demo123' }
  };
  let currentRole = 'owner';

  /* ---- Toast ---- */
  function showToast(message, isError) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-box' + (isError ? ' toast-error' : '');
    toast.innerHTML = '<span class="material-symbols-outlined" style="color:' + (isError ? '#f43f5e' : '#10b981') + ';font-size:20px;">' +
      (isError ? 'error' : 'task_alt') + '</span><span>' + PC.esc(message) + '</span>';
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
    }, 3200);
  }

  /* ---- Banner trạng thái ---- */
  function hideStatus() { if (statusMessage) { statusMessage.style.display = 'none'; statusMessage.classList.remove('success', 'error'); } }
  function showStatus(kind, msg) {
    if (!statusMessage) return;
    statusMessage.style.display = 'flex';
    statusMessage.classList.remove('success', 'error');
    statusMessage.classList.add(kind);
    statusIcon.textContent = kind === 'success' ? 'check_circle' : 'error';
    statusText.textContent = msg;
  }
  function displayError(msg) { showStatus('error', msg); showToast(msg, true); }

  /* ---- Ghi nhớ đăng nhập ---- */
  try {
    const saved = localStorage.getItem('petcompanion_remember_me');
    if (saved !== null && rememberCheckbox) rememberCheckbox.checked = saved === 'true';
  } catch (err) { /* bỏ qua */ }
  if (rememberCheckbox) rememberCheckbox.addEventListener('change', (e) => {
    try { localStorage.setItem('petcompanion_remember_me', e.target.checked); } catch (err) { /* bỏ qua */ }
  });

  /* ---- Hiện/ẩn mật khẩu ---- */
  if (togglePasswordBtn) togglePasswordBtn.addEventListener('click', () => {
    const isPw = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPw ? 'text' : 'password');
    eyeIcon.textContent = isPw ? 'visibility_off' : 'visibility';
    togglePasswordBtn.setAttribute('aria-label', isPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });

  /* ---- Kiểm tra email ---- */
  const isValidEmail = (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
  function validateEmailField() {
    const val = emailInput.value.trim(), valid = isValidEmail(val);
    if (clearEmailBtn) clearEmailBtn.style.display = val.length ? 'flex' : 'none';
    if (!val.length) { validityBadge.classList.remove('show', 'invalid'); emailInput.classList.remove('input-error'); return false; }
    validityBadge.classList.add('show');
    validityBadge.classList.toggle('invalid', !valid);
    validityIcon.textContent = valid ? 'check_circle' : 'cancel';
    validityText.textContent = valid ? 'Hợp lệ' : 'Email chưa đúng định dạng';
    if (valid) emailInput.classList.remove('input-error');
    return valid;
  }
  emailInput.addEventListener('input', () => { validateEmailField(); hideStatus(); });
  passwordInput.addEventListener('input', () => { passwordInput.classList.remove('input-error'); hideStatus(); });
  if (clearEmailBtn) clearEmailBtn.addEventListener('click', () => { emailInput.value = ''; validateEmailField(); emailInput.focus(); });

  function flash() {
    [emailInput, passwordInput].forEach((i) => {
      i.classList.remove('input-error'); i.classList.add('flash-ring');
      setTimeout(() => i.classList.remove('flash-ring'), 450);
    });
  }

  /* ---- Chọn vai trò ---- */
  roleBtns.forEach((btn) => btn.addEventListener('click', () => {
    const data = roleData[btn.dataset.role]; if (!data) return;
    currentRole = btn.dataset.role;
    roleBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    roleIndicator.textContent = data.title;
    if (authSubtitle) authSubtitle.textContent = data.subtitle;
    quickEmailLabel.textContent = data.email;
    if (quickPwdLabel) quickPwdLabel.textContent = data.password;
    emailInput.value = data.email; passwordInput.value = data.password;
    validateEmailField(); hideStatus(); flash();
  }));

  /* ---- Tự điền ---- */
  fillDemoBtn.addEventListener('click', () => {
    const data = roleData[currentRole] || roleData.owner;
    emailInput.value = data.email; passwordInput.value = data.password;
    validateEmailField(); hideStatus(); flash();
    showToast('Đã tự điền tài khoản mẫu ' + data.title);
  });

  /* ---- Gửi form ---- */
  function setLoading(on) {
    submitBtn.disabled = on;
    if (btnIcon) btnIcon.style.display = on ? 'none' : 'inline-block';
    btnText.innerHTML = on ? '<span class="spinner"></span> Đang xác thực...' : 'Đăng nhập ngay';
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim(), pw = passwordInput.value;
    hideStatus(); emailInput.classList.remove('input-error'); passwordInput.classList.remove('input-error');

    if (!email) { emailInput.classList.add('input-error'); displayError('Vui lòng nhập Email hoặc Tên đăng nhập!'); return emailInput.focus(); }
    if (!isValidEmail(email)) { emailInput.classList.add('input-error'); displayError('Email không hợp lệ (Ví dụ: name@example.com)!'); return emailInput.focus(); }
    if (!pw) { passwordInput.classList.add('input-error'); displayError('Vui lòng nhập mật khẩu đăng nhập!'); return passwordInput.focus(); }
    if (pw.length < 6) { passwordInput.classList.add('input-error'); displayError('Mật khẩu phải có tối thiểu 6 ký tự!'); return passwordInput.focus(); }

    setLoading(true);
    let redirecting = false;
    try {
      const list = await PC.api.list('users', (u) => String(u.email).toLowerCase() === email.toLowerCase());
      const u = list[0];
      if (!u || u.password !== pw) { passwordInput.classList.add('input-error'); return displayError('Email hoặc mật khẩu không đúng.'); }
      if (u.status === 'locked') return displayError('Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.');

      PC.session.set(u, !!(rememberCheckbox && rememberCheckbox.checked));
      const title = (roleData[u.role] || {}).title || u.role;
      const dest = PC.session.home(u.role);
      if (!dest) {
        showStatus('success', 'Đăng nhập thành công với vai trò ' + title + '! (Giao diện cho vai trò này chưa có trong bản demo.)');
        showToast('Chào mừng trở lại! Đăng nhập thành công (' + title + ')');
        return;
      }
      showStatus('success', 'Đăng nhập thành công với vai trò ' + title + '! Đang chuyển hướng...');
      showToast('Chào mừng trở lại! Đăng nhập thành công (' + title + ')');
      const next = new URLSearchParams(location.search).get('next');
      const target = next && u.role === 'trainer' && /^[a-z0-9-]+\.html$/i.test(next)
        ? '../Trainer/' + next
        : dest;
      redirecting = true;
      setTimeout(() => { location.href = target; }, 1200);
    } catch (err) {
      displayError(err.message || 'Không thể kết nối máy chủ.');
    } finally {
      if (!redirecting) setLoading(false);
    }
  });

  validateEmailField();

  /* Không tự chuyển trang khi mở lại trang đăng nhập: người dùng phải bấm "Đăng nhập" để vào. */
  const qs = new URLSearchParams(location.search);
  const cur = PC.session.get();
  if (qs.get('denied') === '1') {
    displayError('Chỉ tài khoản Huấn luyện viên mới truy cập được trang này. Hãy đăng nhập bằng tài khoản HLV.');
  } else if (cur) {
    showToast('Bạn đang đăng nhập bằng ' + cur.email + '. Đăng nhập lại để đổi tài khoản hoặc vào trang.');
  }
})();
