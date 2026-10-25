(function () {
  const inputs = Array.from(document.querySelectorAll('.otp-box'));
  const form = document.getElementById('otp-form');
  const countdownEl = document.getElementById('countdown-text');
  const resendBtn = document.getElementById('resend-btn');
  const submitBtn = document.getElementById('btn-submit');
  const errorEl = document.getElementById('otpError');
  const contactEl = document.getElementById('otp-contact');
  const sentTimeEl = document.getElementById('sentTime');
  const changeEmailBtn = document.querySelector('.change-email-btn');

  const contact = new URLSearchParams(location.search).get('contact') || '';

  function maskContact(value) {
    if (!value) return 'tài khoản của bạn';
    if (value.includes('@')) {
      const [local, domain] = value.split('@');
      const head = local.slice(0, Math.min(3, local.length));
      return head + '***@' + domain;
    }
    const digits = value.replace(/\s+/g, '');
    if (digits.length >= 6) return digits.slice(0, 3) + '***' + digits.slice(-3);
    return value;
  }

  function timeLabel(date) {
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
  }

  if (contactEl) contactEl.textContent = maskContact(contact);
  if (changeEmailBtn && contact) {
    changeEmailBtn.href = 'forgot-password.html?contact=' + encodeURIComponent(contact);
  }
  if (sentTimeEl) sentTimeEl.textContent = timeLabel(new Date());

  function clearError() {
    if (!errorEl) return;
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    inputs.forEach((input) => input.classList.remove('error'));
  }

  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      clearError();
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val ? val[0] : '';
      if (val && index < inputs.length - 1) inputs[index + 1].focus();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) inputs[index - 1].focus();
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      clearError();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const numericData = pastedData.replace(/[^0-9]/g, '');
      if (!numericData) return;
      numericData.slice(0, inputs.length).split('').forEach((char, i) => {
        if (inputs[i]) inputs[i].value = char;
      });
      const nextFocus = Math.min(numericData.length, inputs.length - 1);
      inputs[nextFocus].focus();
    });
  });

  let totalSeconds = 180;
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function startCountdown() {
    totalSeconds = 180;
    if (countdownEl) {
      countdownEl.textContent = formatTime(totalSeconds);
      countdownEl.style.color = 'var(--accent-warning)';
    }
    if (resendBtn) resendBtn.disabled = true;
  }

  if (countdownEl) countdownEl.textContent = formatTime(totalSeconds);

  const timer = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      if (countdownEl) countdownEl.textContent = formatTime(totalSeconds);
    } else {
      clearInterval(timer);
      if (countdownEl) {
        countdownEl.textContent = 'Hết hạn';
        countdownEl.style.color = 'var(--accent-error)';
      }
      if (resendBtn) resendBtn.disabled = false;
    }
  }, 1000);

  if (resendBtn) {
    resendBtn.addEventListener('click', () => {
      startCountdown();
      inputs.forEach((input) => { input.value = ''; });
      clearError();
      if (sentTimeEl) sentTimeEl.textContent = timeLabel(new Date());
      inputs[0].focus();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearError();

      const code = inputs.map((input) => input.value).join('');
      if (!/^[0-9]{6}$/.test(code)) {
        if (errorEl) {
          errorEl.textContent = 'Vui lòng nhập đủ 6 chữ số của mã xác thực.';
          errorEl.style.display = 'block';
        }
        inputs.forEach((input) => { if (!input.value) input.classList.add('error'); });
        const empty = inputs.find((input) => !input.value);
        if (empty) empty.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Đang xác thực...';
      }
      const next = 'reset-password.html' + (contact ? '?contact=' + encodeURIComponent(contact) : '');
      setTimeout(() => { location.href = next; }, 700);
    });
  }

  inputs[0] && inputs[0].focus();
})();
