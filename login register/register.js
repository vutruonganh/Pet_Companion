/* register.js – toàn bộ hành vi trang đăng ký, lấy từ bản Stitch
 * (chọn vai trò, hiện/ẩn mật khẩu, đo độ mạnh 4 mức, kiểm tra từng trường, trạng thái đang xử lý)
 * + ghi tài khoản mới vào users qua PC.api và chuyển về trang đăng nhập. */
document.addEventListener('DOMContentLoaded', function () {
  const $ = (id) => document.getElementById(id);
  const show = (el, on) => { if (el) el.classList.toggle('visible', !!on); };

  /* 1. Chọn vai trò ---------------------------------------------------- */
  const roleCards = document.querySelectorAll('.role-card');
  const roleNotice = $('roleNotice');
  const roleNoticeMap = {
    owner: { text: 'Quyền chủ nuôi chuẩn', color: 'var(--primary)' },
    provider: { text: 'Cần xác thực GPKD sau khi tạo', color: 'var(--warning)' },
    trainer: { text: 'Kích hoạt cổng biên soạn bài tập', color: 'var(--teal-dark)' }
  };
  roleCards.forEach((card) => {
    card.addEventListener('click', function (e) {
      e.preventDefault();               // <label> sẽ tự kích hoạt radio lần nữa, nên chặn để không chạy 2 lần
      roleCards.forEach((c) => {
        c.classList.remove('active');
        const r = c.querySelector('input[type="radio"]'); if (r) r.checked = false;
      });
      this.classList.add('active');
      const radio = this.querySelector('input[type="radio"]'); if (radio) radio.checked = true;
      const info = roleNoticeMap[this.getAttribute('data-role')];
      if (info && roleNotice) { roleNotice.textContent = info.text; roleNotice.style.color = info.color; }
    });
  });

  /* 2. Hiện/ẩn mật khẩu ------------------------------------------------ */
  function setupPasswordToggle(btnId, inputId, iconId) {
    const btn = $(btnId), input = $(inputId), icon = $(iconId);
    if (!btn || !input || !icon) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      icon.textContent = hidden ? 'visibility_off' : 'visibility';
      btn.setAttribute('aria-label', hidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
  }
  setupPasswordToggle('togglePasswordBtn', 'userPassword', 'pwdToggleIcon');
  setupPasswordToggle('toggleConfirmBtn', 'confirmPassword', 'confirmToggleIcon');

  /* 3. Độ mạnh mật khẩu (4 mức) ---------------------------------------- */
  const pwdInput = $('userPassword'), confirmInput = $('confirmPassword');
  const bars = [$('bar1'), $('bar2'), $('bar3'), $('bar4')];
  const strengthLabel = $('strengthLabel');
  const LEVELS = [
    null,
    { color: '#ef4444', text: 'Yếu' },
    { color: '#f59e0b', text: 'Trung bình' },
    { color: '#3b82f6', text: 'Khá' },
    { color: '#10b981', text: 'Mạnh' }
  ];
  function setRule(el, ok) {
    if (!el) return;
    const icon = el.querySelector('.material-symbols-outlined');
    el.classList.toggle('valid', ok);
    if (icon) icon.textContent = ok ? 'check_circle' : 'radio_button_unchecked';
  }
  function checkPasswordStrength() {
    const v = pwdInput ? pwdInput.value : '';
    const rules = [v.length >= 8, /[a-z]/.test(v) && /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)];
    setRule($('hintLength'), rules[0]); setRule($('hintCase'), rules[1]);
    setRule($('hintNumber'), rules[2]); setRule($('hintSpecial'), rules[3]);
    bars.forEach((b) => { if (b) b.style.backgroundColor = '#e2e8f0'; });
    if (!v) {
      strengthLabel.textContent = 'Chưa nhập'; strengthLabel.style.color = 'var(--text-gray)';
      checkPasswordMatch();
      return 0;
    }
    const score = rules.filter(Boolean).length;
    const lv = LEVELS[score];
    if (lv) {
      for (let i = 0; i < score; i++) if (bars[i]) bars[i].style.backgroundColor = lv.color;
      strengthLabel.textContent = lv.text; strengthLabel.style.color = lv.color;
    } else {                              // có nhập nhưng chưa đạt điều kiện nào
      strengthLabel.textContent = 'Rất yếu'; strengthLabel.style.color = '#ef4444';
      if (bars[0]) bars[0].style.backgroundColor = '#ef4444';
    }
    checkPasswordMatch();
    return score;
  }
  if (pwdInput) pwdInput.addEventListener('input', checkPasswordStrength);

  /* 4. Xác nhận mật khẩu ----------------------------------------------- */
  const confirmError = $('confirmError'), confirmSuccess = $('confirmSuccess');
  function checkPasswordMatch() {
    const pwd = pwdInput ? pwdInput.value : '', c = confirmInput ? confirmInput.value : '';
    if (!c) { show(confirmError, false); show(confirmSuccess, false); return false; }
    const same = pwd === c;
    show(confirmError, !same); show(confirmSuccess, same);
    return same;
  }
  if (confirmInput) confirmInput.addEventListener('input', checkPasswordMatch);

  /* 5. Kiểm tra từng trường -------------------------------------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  const cleanPhone = (s) => s.trim().replace(/[\s.-]/g, '');
  const phoneOk = (v) => PHONE_RE.test(v) && ((v.startsWith('0') && v.length === 10) || (v.startsWith('84') && v.length === 11));

  const nameInput = $('fullName'), nameError = $('nameError');
  function validateName() {
    const ok = (nameInput ? nameInput.value.trim() : '').length >= 2;
    show(nameError, !ok); return ok;
  }
  if (nameInput) {
    nameInput.addEventListener('input', () => { if (nameInput.value.trim().length >= 2) show(nameError, false); });
    nameInput.addEventListener('blur', validateName);
  }

  const emailInput = $('userEmail'), emailError = $('emailError');
  function validateEmail() {
    const ok = EMAIL_RE.test(emailInput ? emailInput.value.trim() : '');
    show(emailError, !ok); return ok;
  }
  if (emailInput) {
    emailInput.addEventListener('input', () => { if (EMAIL_RE.test(emailInput.value.trim())) show(emailError, false); });
    emailInput.addEventListener('blur', validateEmail);
  }

  const phoneInput = $('userPhone'), phoneError = $('phoneError');
  function validatePhone() {
    const ok = phoneOk(cleanPhone(phoneInput ? phoneInput.value : ''));
    show(phoneError, !ok); return ok;
  }
  if (phoneInput) {
    phoneInput.addEventListener('input', () => { if (phoneOk(cleanPhone(phoneInput.value))) show(phoneError, false); });
    phoneInput.addEventListener('blur', validatePhone);
  }

  const agreeTerms = $('agreeTerms'), termsError = $('termsError');
  function validateTerms() {
    const ok = !!(agreeTerms && agreeTerms.checked);
    show(termsError, !ok); return ok;
  }
  if (agreeTerms) agreeTerms.addEventListener('change', () => { if (agreeTerms.checked) show(termsError, false); });

  /* 6. Gửi form: kiểm tra → trạng thái đang xử lý → ghi vào users → chuyển trang */
  const form = $('registerForm'), submitBtn = $('submitBtn'), submitAlert = $('submitAlert');
  const BTN_DEFAULT = '<span>Đăng ký tài khoản</span><span class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>';
  function alertBox(kind, icon, msg) {
    submitAlert.className = 'alert-box ' + kind;
    submitAlert.style.display = 'flex';
    submitAlert.innerHTML = '<span class="material-symbols-outlined">' + icon + '</span><span>' + PC.esc(msg) + '</span>';
  }
  function resetButton() { submitBtn.disabled = false; submitBtn.style.background = ''; submitBtn.innerHTML = BTN_DEFAULT; }

  if (form) form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const checks = [validateName(), validateEmail(), validatePhone(), (checkPasswordStrength(), pwdInput.value.length >= 8), checkPasswordMatch(), validateTerms()];
    if (checks.includes(false)) return alertBox('error', 'warning', 'Vui lòng kiểm tra và điền đầy đủ các thông tin hợp lệ bên trên.');

    submitAlert.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 0.9s linear infinite; font-size: 20px;">sync</span><span>Đang tạo tài khoản...</span>';

    const email = emailInput.value.trim().toLowerCase();
    try {
      const exist = await PC.api.list('users', (u) => String(u.email).toLowerCase() === email);
      if (exist.length) throw new Error('Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.');
      await PC.api.create('users', {
        name: nameInput.value.trim(),
        email,
        password: pwdInput.value,
        phone: cleanPhone(phoneInput.value),
        role: document.querySelector('input[name="accountRole"]:checked').value,
        status: 'active'
      });
      alertBox('success', 'check_circle', 'Đăng ký thành công! Đang chuyển bạn đến trang đăng nhập...');
      submitBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">done_all</span><span>Đã tạo tài khoản thành công</span>';
      submitBtn.style.background = 'var(--success)';
      setTimeout(() => { location.href = 'login.html'; }, 1500);
    } catch (err) {
      alertBox('error', 'error', err.message || 'Không thể tạo tài khoản.');
      resetButton();
    }
  });
});
