/* =====================================================================
 * api.js – MOCK API dùng chung cho mọi trang
 * ---------------------------------------------------------------------
 * - Dữ liệu gốc (seed) nằm cùng thư mục mock-api/*.json
 * - Lần đầu: fetch JSON -> chép vào localStorage. Các lần sau đọc/ghi localStorage
 *   (nên thêm/sửa/xóa vẫn còn sau khi tải lại trang).
 * - Mọi hàm đều trả về Promise và có độ trễ giả lập (DELAY) như API thật.
 * - Mở bằng file:// thì fetch bị chặn -> tự dùng mock-api/seed.js (bản sao của JSON).
 * - Demo trạng thái đặc biệt:  ?fail=1  (API lỗi)   |   ?empty=1  (API trả danh sách rỗng)
 * - Xóa dữ liệu đã lưu: PC.api.reset()  (gõ trong Console rồi tải lại trang)
 * ===================================================================== */
(function () {
  const NS = 'pc_mock_v1:';
  const DELAY = 350;
  const FILES = {
    users: 'users.json', pets: 'pets.json', trainingPlans: 'trainingPlans.json',
    exercises: 'exercises.json', trainingLogs: 'trainingLogs.json', summaries: '', petHealth: '', chats: ''  /* không có file JSON: bắt đầu rỗng, chỉ lưu trong localStorage */
  };
  const SELF = document.currentScript ? document.currentScript.src : '';
  const BASE = SELF.replace(/api\.js.*$/, '');
  const FAIL = /[?&]fail=1/.test(location.search);
  const EMPTY = /[?&]empty=1/.test(location.search);

  const wait = (v) => new Promise((r) => setTimeout(() => r(v), DELAY));
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function store(c, d) { try { localStorage.setItem(NS + c, JSON.stringify(d)); } catch (e) { /* bỏ qua */ } }

  async function readSeed(c) {
    try {
      if (!FILES[c]) throw new Error('Không có file seed cho "' + c + '"');
      const r = await fetch(BASE + FILES[c]);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (window.PC_SEED && window.PC_SEED[c]) return clone(window.PC_SEED[c]);
      if (!FILES[c]) return [];
      throw new Error('Không tải được dữ liệu "' + c + '"');
    }
  }
  async function load(c) {
    let raw = null;
    try { raw = localStorage.getItem(NS + c); } catch (e) { /* bỏ qua */ }
    if (raw) return JSON.parse(raw);
    const d = await readSeed(c);
    store(c, d);
    return d;
  }

  const api = {
    /** Lấy danh sách. filter: hàm (item) => boolean (tuỳ chọn) */
    async list(c, filter) {
      if (FAIL) { await wait(); throw new Error('Máy chủ giả lập đang lỗi (đang bật ?fail=1)'); }
      let d = await load(c);
      if (EMPTY) d = [];
      if (filter) d = d.filter(filter);
      return wait(clone(d));
    },
    async get(c, id) { const d = await load(c); return wait(clone(d.find((x) => x.id === id) || null)); },
    async create(c, item) {
      const d = await load(c);
      item = Object.assign({ id: PC.uid(c.slice(0, 2).toUpperCase()) }, item);
      d.push(item); store(c, d);
      return wait(clone(item));
    },
    async update(c, id, patch) {
      const d = await load(c);
      const it = d.find((x) => x.id === id);
      if (!it) throw new Error('Không tìm thấy bản ghi ' + id);
      Object.assign(it, patch); store(c, d);
      return wait(clone(it));
    },
    async remove(c, id) {
      const d = await load(c);
      store(c, d.filter((x) => x.id !== id));
      return wait({ ok: true });
    },
    reset() { Object.keys(FILES).forEach((c) => { try { localStorage.removeItem(NS + c); } catch (e) { /* bỏ qua */ } }); }
  };

  const PC = {
    api,
    uid: (p) => (p || 'ID') + '-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10),
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    toast(msg, ok) {
      let box = document.querySelector('.toasts');
      if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
      const t = document.createElement('div');
      t.className = 'toast ' + (ok === false ? 'err' : 'ok');
      t.setAttribute('role', 'status');
      t.innerHTML = '<span class="material-symbols-outlined">' + (ok === false ? 'error' : 'check_circle') + '</span>' +
        '<span>' + PC.esc(msg) + '</span>';
      box.appendChild(t);
      setTimeout(() => t.remove(), 3600);
    },
    /** Khối trạng thái dùng chung: loading / error / empty */
    stateBox(kind, msg, actionLabel) {
      const icon = { loading: 'progress_activity', error: 'error', empty: 'inbox' }[kind] || 'info';
      return '<div class="pc-state' + (kind === 'loading' ? ' is-loading' : kind === 'error' ? ' is-error' : '') + '">' +
        '<span class="material-symbols-outlined pc-state-icon">' + icon + '</span>' +
        '<p class="pc-state-msg">' + PC.esc(msg) + '</p>' +
        (actionLabel ? '<button type="button" data-pc-action class="pc-state-action">' + PC.esc(actionLabel) + '</button>' : '') + '</div>';
    }
  };

  /* ---------------- Tiện ích giao diện dùng chung cho các trang HLV ---------------- */
  /* ---- Định dạng ngày giờ ---- */
  const p2 = (n) => String(n).padStart(2, '0');
  PC.fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear(); };
  PC.fmtShort = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : p2(d.getDate()) + '/' + p2(d.getMonth() + 1); };
  PC.fmtTime = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : p2(d.getHours()) + ':' + p2(d.getMinutes()); };
  PC.nowLocalInput = () => { const d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + 'T' + p2(d.getHours()) + ':' + p2(d.getMinutes()); };

  /* ---- Emoji theo loài ---- */
  PC.emoji = (species) => (species === 'dog' ? '🐶' : species === 'cat' ? '🐱' : '🐾');

  /* ---- Modal dùng chung ----
   * PC.modal({title, body(HTML đã escape), confirmText, cancelText, onConfirm(root), wide})
   * onConfirm ném Error => hiện lỗi & giữ modal; trả false => giữ modal; còn lại => đóng.
   * Không truyền onConfirm => modal chỉ có nút đóng. Esc / bấm nền / nút × đều đóng. */
  PC.modal = function (o) {
    const ov = document.createElement('div');
    ov.className = 'pcx-overlay';
    ov.innerHTML = '<div class="pcx-modal' + (o.wide ? ' pcx-wide' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="pcx-head"><h3>' + PC.esc(o.title) + '</h3><button type="button" class="pcx-x" aria-label="Đóng">×</button></div>' +
      '<div class="pcx-body">' + o.body + '</div>' +
      '<div class="pcx-foot"><span class="pcx-err" role="alert"></span>' +
      '<button type="button" class="pcx-btn" data-cancel>' + PC.esc(o.cancelText || 'Hủy') + '</button>' +
      (o.onConfirm ? '<button type="button" class="pcx-btn pcx-btn-primary" data-ok>' + PC.esc(o.confirmText || 'Lưu') + '</button>' : '') +
      '</div></div>';
    document.body.appendChild(ov);
    const close = () => { document.removeEventListener('keydown', onKey); ov.remove(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
    ov.querySelector('.pcx-x').onclick = close;
    ov.querySelector('[data-cancel]').onclick = close;
    const ok = ov.querySelector('[data-ok]');
    if (ok) ok.onclick = async () => {
      const err = ov.querySelector('.pcx-err'); err.textContent = ''; ok.disabled = true;
      try { const r = await o.onConfirm(ov); if (r !== false) close(); }
      catch (e) { err.textContent = e.message || 'Có lỗi xảy ra'; }
      finally { ok.disabled = false; }
    };
    const first = ov.querySelector('input,select,textarea'); if (first) first.focus();
    return { el: ov, close };
  };


  /* ---------------- Phiên đăng nhập + điều hướng (dùng chung) ---------------- */
  const SESSION_KEY = NS + 'session';
  const GUARD = true;                       // đặt false nếu muốn mở trang HLV mà không cần đăng nhập
  const TRAINER_ROLES = ['trainer'];          // chỉ huấn luyện viên được vào các trang HLV
  const PAGE = (location.pathname.split('/').pop() || '').toLowerCase();
  const LOGIN_PAGE = '../login%20register/login.html';
  const HOME = {
    trainer: '../Trainer/training-plans.html',
    admin: '../admin/dashboard.html',
    provider: '../provider/provider-appointment-list.html'
  };
  const NAV = { 'kế hoạch huấn luyện': 'training-plans.html', 'thư viện bài tập': 'exercise-library.html', 'tiến độ & nhật ký ai': 'progress.html' };

  PC.session = {
    get() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; } },
    set(u, remember) {
      const s = { id: u.id, name: u.name, email: u.email, role: u.role, at: Date.now() };
      try { (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { /* bỏ qua */ }
      return s;
    },
    clear() { try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) { /* bỏ qua */ } },
    /** Trang đích sau đăng nhập theo vai trò; null nếu vai trò đó chưa có giao diện */
    home(role) { return HOME[role] || null; }
  };
  PC.logout = function () { PC.session.clear(); location.href = LOGIN_PAGE; };

  function wirePage() {
    const s = PC.session.get();
    const isTrainerPage = Object.values(NAV).indexOf(PAGE) !== -1;
    if (isTrainerPage) {
      if (GUARD && (!s || TRAINER_ROLES.indexOf(s.role) === -1)) {
        document.documentElement.style.display = 'none';      // không để lộ nội dung trang trong lúc chuyển hướng
        location.replace(LOGIN_PAGE + '?' + (s ? 'denied=1&' : '') + 'next=' + encodeURIComponent(PAGE));
        return;
      }
      if (s) document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = s.name; });
      document.querySelectorAll('header nav a').forEach((link) => {
        const key = link.textContent.trim().toLowerCase();
        if (NAV[key]) link.setAttribute('href', NAV[key]);
      });
      const logoLink = document.querySelector('header a[href="#"]'); if (logoLink) logoLink.setAttribute('href', 'training-plans.html');
      // Nút đăng xuất: bấm vào khối tên người dùng
      const box = document.querySelector('[data-user-name]');
      const wrap = box && box.closest('.nav-user');
      if (wrap) { wrap.style.cursor = 'pointer'; wrap.title = 'Bấm để đăng xuất'; wrap.addEventListener('click', () => { if (confirm('Đăng xuất khỏi tài khoản?')) PC.logout(); }); }
    }
    const signup = document.querySelector('.auth-signup-link'); if (signup) signup.setAttribute('href', 'register.html');
    const login = document.querySelector('.login-link'); if (login) login.setAttribute('href', 'login.html');
  }
  // api.js nằm cuối <body> nên DOM phía trên đã có sẵn: chạy ngay để progress.js đọc được tên HLV.
  wirePage();
  // Quay lại bằng nút Back sau khi đăng xuất: trang lấy từ bộ nhớ đệm nên phải kiểm tra lại quyền
  window.addEventListener('pageshow', (e) => { if (e.persisted) wirePage(); });
  window.PC = PC;
})();
