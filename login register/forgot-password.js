let timerInterval = null;

(function () {
  const contact = new URLSearchParams(location.search).get('contact');
  const input = document.getElementById('recovery-contact');
  if (contact && input) input.value = contact;
})();

function handlePasswordReset() {
  const input = document.getElementById('recovery-contact');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  const btnSpinner = document.getElementById('btnSpinner');
  const checkSuccess = document.getElementById('checkSuccess');
  const alertBox = document.getElementById('notificationAlert');
  const hint = document.getElementById('validationHint');
  const step2 = document.getElementById('stepNode2');
  const stepTrack = document.getElementById('stepTrack');

  const val = input.value.trim();
  // Basic check for either email pattern or phone digit count
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = /^[0-9]{9,11}$/.test(val.replace(/\s+/g, ''));

  if (!val || (!isEmail && !isPhone)) {
    hint.style.display = 'block';
    input.classList.add('error');
    return;
  }

  hint.style.display = 'none';
  input.classList.remove('error');

  // Loading state
  submitBtn.disabled = true;
  btnText.textContent = 'Đang gửi mã...';
  btnIcon.style.display = 'none';
  btnSpinner.style.display = 'inline-block';

  setTimeout(() => {
    // Successful mock
    btnSpinner.style.display = 'none';
    btnIcon.style.display = 'inline-block';
    btnIcon.textContent = 'check';
    btnText.textContent = 'Đã gửi mã';
    submitBtn.classList.add('success-state');
    
    checkSuccess.style.display = 'flex';
    alertBox.classList.add('visible');

    const continueLink = document.getElementById('continueLink');
    if (continueLink) continueLink.href = 'otp-verification.html?contact=' + encodeURIComponent(val);

    // Advance stepper to Step 2
    step2.classList.add('active');
    stepTrack.style.width = '50%';

    startCountdown(60);
  }, 1000);
}

function startCountdown(duration) {
  let timeLeft = duration;
  const countEl = document.getElementById('countdownSec');
  const noticeEl = document.getElementById('timerNotice');
  const resendBtn = document.getElementById('resendBtn');

  noticeEl.style.display = 'inline-block';
  resendBtn.style.display = 'none';

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    if (countEl) countEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      noticeEl.style.display = 'none';
      resendBtn.style.display = 'inline-block';
    }
  }, 1000);
}

function resendCode() {
  const resendBtn = document.getElementById('resendBtn');
  resendBtn.textContent = 'Đang gửi lại...';
  setTimeout(() => {
    resendBtn.textContent = 'Gửi lại ngay';
    startCountdown(60);
  }, 600);
}