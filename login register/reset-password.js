function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

(function () {
  const form = document.getElementById('resetPasswordForm');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const strengthText = document.getElementById('strengthText');
  const segments = document.querySelectorAll('.strength-segment');
  const matchStatus = document.getElementById('matchStatus');
  const errorBox = document.getElementById('resetError');
  const successModal = document.getElementById('successModal');
  const ruleItems = document.querySelectorAll('#passwordRules .rule-item');

  const contact = new URLSearchParams(location.search).get('contact');
  const verifiedContact = document.getElementById('verifiedContact');
  if (contact && verifiedContact) verifiedContact.textContent = contact;
  const otpLink = document.querySelector('.breadcrumb-nav a');
  if (contact && otpLink) otpLink.href = 'otp-verification.html?contact=' + encodeURIComponent(contact);

  const tests = {
    length: (v) => v.length >= 8,
    case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    digit: (v) => /[0-9]/.test(v),
    special: (v) => /[^A-Za-z0-9]/.test(v)
  };

  function checkRules(value) {
    let passed = 0;
    ruleItems.forEach((item) => {
      const ok = tests[item.dataset.rule](value);
      item.classList.toggle('valid', ok);
      if (ok) passed++;
    });
    return passed;
  }

  function updateStrength() {
    const value = newPassword.value;
    const score = checkRules(value);
    const level = score === 0 ? '' : score <= 2 ? 'weak' : score === 3 ? 'medium' : 'strong';
    segments.forEach((seg, index) => {
      seg.className = 'strength-segment' + (index < score && level ? ' active-' + level : '');
    });

    strengthText.className = 'strength-text' + (level ? ' ' + level : '');
    if (!value) strengthText.textContent = 'Chưa nhập mật khẩu';
    else if (score <= 1) strengthText.textContent = 'Yếu';
    else if (score === 2) strengthText.textContent = 'Trung bình';
    else if (score === 3) strengthText.textContent = 'Khá mạnh';
    else strengthText.textContent = 'Rất mạnh (Khuyên dùng)';

    return score;
  }

  function updateMatch() {
    if (!confirmPassword.value) {
      matchStatus.className = 'match-status';
      matchStatus.textContent = 'Chưa xác nhận';
    } else if (confirmPassword.value === newPassword.value) {
      matchStatus.className = 'match-status ok';
      matchStatus.textContent = '✓ Khớp mật khẩu';
    } else {
      matchStatus.className = 'match-status bad';
      matchStatus.textContent = '✗ Chưa khớp';
    }
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  }

  newPassword.addEventListener('input', () => {
    newPassword.classList.remove('input-error');
    errorBox.style.display = 'none';
    updateStrength();
    updateMatch();
  });

  confirmPassword.addEventListener('input', () => {
    confirmPassword.classList.remove('input-error');
    errorBox.style.display = 'none';
    updateMatch();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorBox.style.display = 'none';

    const score = updateStrength();
    if (!newPassword.value) {
      newPassword.classList.add('input-error');
      return showError('Vui lòng nhập mật khẩu mới.');
    }
    if (score < 4) {
      newPassword.classList.add('input-error');
      return showError('Mật khẩu cần đáp ứng đủ 4 yêu cầu bảo mật.');
    }
    if (confirmPassword.value !== newPassword.value) {
      confirmPassword.classList.add('input-error');
      return showError('Mật khẩu xác nhận chưa khớp.');
    }

    successModal.classList.add('active');
  });

  updateStrength();
  updateMatch();
})();
