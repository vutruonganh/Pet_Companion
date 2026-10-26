/* =====================================================================
 * api.js – MockAPI dùng chung cho các trang Trainer / Đăng nhập
 * ---------------------------------------------------------------------
 * - Dữ liệu nằm trong mock-api/seed.json và được phục vụ qua REST /api/v1
 *   (cần nạp core/api.js trước file này để có window.MockAPI).
 * - Mọi vai trò đọc cùng một bộ bảng: accounts, pets, appointments...
 *   Nhờ vậy thay đổi ở trang admin/provider/owner/trainer đều nhìn thấy nhau.
 * - Demo trạng thái:  ?fail=1 (API lỗi)  |  ?empty=1 (danh sách rỗng)
 * - Khôi phục dữ liệu gốc: await PC.api.reset()  rồi tải lại trang.
 * ===================================================================== */
(function () {
  const NS = 'pc_mock_v1:';
  const FAIL = /[?&]fail=1/.test(location.search);
  const EMPTY = /[?&]empty=1/.test(location.search);
  const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));

  function client() {
    if (!window.MockAPI) throw new Error('Thiếu core/api.js – chưa nạp được client MockAPI.');
    return window.MockAPI;
  }

  async function call(fn) {
    try { return await fn(); }
    catch (e) {
      if (e && e.name === 'AbortError') throw new Error('MockAPI không phản hồi kịp. Kiểm tra server rồi thử lại.');
      if (e instanceof TypeError) throw new Error('Không kết nối được MockAPI. Hãy chạy start.bat (cổng 4000).');
      throw e;
    }
  }

  const api = {
    /** Lấy danh sách. filter: hàm (item) => boolean (tuỳ chọn) */
    async list(c, filter) {
      if (FAIL) throw new Error('Máy chủ giả lập đang lỗi (đang bật ?fail=1)');
      let d = await call(() => client().list(c));
      if (EMPTY) d = [];
      if (filter) d = d.filter(filter);
      return clone(d);
    },
    async get(c, id) {
      try { return clone(await call(() => client().get(c, id))); }
      catch (e) { if (/HTTP 404/.test(e.message)) return null; throw e; }
    },
    create: (c, item) => call(() => client().create(c, item)).then(clone),
    /** PATCH để giữ nguyên các trường không gửi lên, đúng như API cũ */
    update: (c, id, patch) => call(() => client().patch(c, id, patch)).then(clone),
    async remove(c, id) { await call(() => client().remove(c, id)); return { ok: true }; },
    async reset() {
      const root = client().base.replace(/\/api\/v1\/?$/, '');
      const r = await fetch(root + '/api/reset', { method: 'POST' });
      if (!r.ok) throw new Error('Không khôi phục được dữ liệu gốc (HTTP ' + r.status + ').');
      return r.json();
    }
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
  const PAGE = (location.pathname.split('/').pop() || '').toLowerCase();
  const LOGIN_PAGE = '../login%20register/login.html';
  const HOME = {
    owner: '../owner/owner-pets.html',
    trainer: '../trainer/training-plans.html',
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
