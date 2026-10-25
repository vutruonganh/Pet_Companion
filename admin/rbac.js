document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('uBody');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ROLE_MAP = {
    'chu-nuoi': ['chip-blue', 'pets', 'Chủ nuôi'],
    'bac-si': ['chip-mint', 'medical_services', 'Bác sĩ thú y / Đối tác'],
    'hlv': ['chip-amber', 'sports_score', 'Huấn luyện viên'],
    'spa': ['chip-pink', 'content_cut', 'Đối tác Spa']
  };
  const STATUS_BADGE = {
    active: ['badge-mint', 'Đang hoạt động'],
    pending: ['badge-amber', 'Chờ kích hoạt'],
    locked: ['badge-rose', 'Đang khóa']
  };

  let users = null;
  const AUTH_TO_DIR = { owner: 'chu-nuoi', provider: 'bac-si', trainer: 'hlv' };
  const DIR_TO_AUTH = { 'chu-nuoi': 'owner', 'bac-si': 'provider', hlv: 'trainer', spa: 'provider' };
  const initials = (name) => String(name || '?').trim().split(/\s+/).filter(Boolean).map((w) => w[0]).slice(-2).join('').toUpperCase();
  const dirRoleOf = (u) => u.dirRole || AUTH_TO_DIR[u.role] || 'chu-nuoi';

  function stateRow(kind, msg) {
    const isError = kind === 'error';
    return `<tr><td colspan="7"><div style="padding:28px;text-align:center;color:${isError ? 'var(--rose)' : 'var(--text-gray)'}">
      <span class="material-symbols-outlined" style="font-size:30px">${isError ? 'error' : 'progress_activity'}</span>
      <div style="margin:6px 0 10px">${esc(msg)}</div>
      ${isError ? '<button class="btn btn-outline" data-retry>Thử lại</button>' : ''}
    </div></td></tr>`;
  }

  function actionButtons(u) {
    const view = `<button class="icon-act" data-view title="${u.status === 'locked' ? 'Thông tin' : 'Xem'}"><span class="material-symbols-outlined">${u.status === 'locked' ? 'info' : 'visibility'}</span></button>`;
    const manage = '<button class="icon-act" data-mg title="Quản lý"><span class="material-symbols-outlined">manage_accounts</span></button>';
    const reset = '<button class="icon-act" data-rs title="Đặt lại khóa"><span class="material-symbols-outlined">lock_reset</span></button>';
    const mail = '<button class="icon-act" data-mail title="Gửi mail kích hoạt" style="color:var(--amber)"><span class="material-symbols-outlined">forward_to_inbox</span></button>';
    const lock = '<button class="icon-act no" data-lock title="Khóa"><span class="material-symbols-outlined">block</span></button>';
    const unlock = '<button class="icon-act ok" data-unlock title="Mở khóa"><span class="material-symbols-outlined">lock_open</span></button>';
    const delOutline = '<button class="icon-act no" data-del title="Xóa"><span class="material-symbols-outlined">delete_outline</span></button>';
    const delForever = '<button class="icon-act no" data-del title="Xóa vĩnh viễn"><span class="material-symbols-outlined">delete_forever</span></button>';

    if (u.status === 'pending') return mail + manage + reset + delOutline;
    if (u.status === 'locked') return view + unlock + delForever;
    return view + manage + reset + lock;
  }

  function renderRow(u) {
    const [badgeCls, badgeText] = STATUS_BADGE[u.status] || STATUS_BADGE.pending;
    const dirRole = dirRoleOf(u);
    const [chip, roleIcon, roleLabel] = ROLE_MAP[dirRole] || ROLE_MAP['chu-nuoi'];
    const avatarFallback = u.avatarFallback || initials(u.name);
    const uid = u.uid || u.id;
    const avatar = u.avatar
      ? `<img class="avatar" src="${esc(u.avatar)}" data-fallback="${esc(avatarFallback)}" alt="">`
      : `<div class="avatar-fb">${esc(avatarFallback)}</div>`;
    return `<tr data-role="${esc(dirRole)}" data-status="${esc(u.status)}" data-key="${esc(`${u.name} ${uid} ${u.email} ${u.phone}`.toLowerCase())}">
      <td><div class="u-cell">${avatar}<div><div class="cell-main">${esc(u.name)}</div><div class="mono">${esc(uid)}</div></div></div></td>
      <td><span class="chip ${esc(u.chip || chip)}"><span class="material-symbols-outlined">${esc(u.roleIcon || roleIcon)}</span>${esc(u.roleLabel || roleLabel)}</span></td>
      <td><div class="cell-main" style="font-weight:600">${esc(u.email)}</div><div class="cell-sub">${esc(u.phone)}</div></td>
      <td><span class="chip chip-gray"><span class="material-symbols-outlined">${esc(u.petsIcon || 'cruelty_free')}</span>${esc(u.petsLabel || '0 bé cưng')}</span></td>
      <td><div class="cell-main">${esc(u.joined || 'Hôm nay')}</div><div class="cell-sub">${esc(u.lastActive || 'Chưa kích hoạt')}</div></td>
      <td><span class="badge ${badgeCls}"><i></i>${badgeText}</span></td>
      <td class="acts">${actionButtons(u)}</td>
    </tr>`;
  }

  function render() {
    tbody.innerHTML = users.map(renderRow).join('');
    apply();
  }

  /* ── Lọc 3 điều kiện ── */
  function apply() {
    const r = document.getElementById('uRole').value, s = document.getElementById('uStatus').value;
    const q = document.getElementById('uSearch').value.trim().toLowerCase();
    let n = 0;
    [...tbody.querySelectorAll('tr')].forEach(row => {
      const ok = (r === 'all' || row.dataset.role === r) && (s === 'all' || row.dataset.status === s) && (!q || row.dataset.key.includes(q));
      row.style.display = ok ? '' : 'none'; if (ok) n++;
    });
    document.getElementById('uCount').textContent = `Hiển thị ${n} trên ${users ? users.length : 0} tài khoản hệ thống`;
  }
  ['uRole', 'uStatus'].forEach(id => document.getElementById(id).addEventListener('change', apply));
  document.getElementById('uSearch').addEventListener('input', apply);

  /* ── Hành động CRUD trên bảng ── */
  tbody.addEventListener('click', async e => {
    if (e.target.closest('[data-retry]')) { load(); return; }
    const row = e.target.closest('tr');
    if (!row) return;
    const uid = row.querySelector('.mono').textContent;
    const user = users?.find(u => u.uid === uid);

    if (e.target.closest('[data-view]')) {
      const name = row.querySelector('.cell-main').textContent;
      const role = row.querySelector('.chip').textContent.trim();
      const tt = row.querySelector('.badge').textContent.trim();
      document.getElementById('viewBody').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><div class="f-label">Họ tên</div><b>${name}</b></div>
          <div><div class="f-label">Mã định danh</div><span class="mono">${uid}</span></div>
          <div><div class="f-label">Vai trò</div><b>${role}</b></div>
          <div><div class="f-label">Trạng thái</div><span class="badge badge-mint"><i></i>${tt}</span></div>
        </div>`;
      UI.open('modalView');
      return;
    }
    if (e.target.closest('[data-mg]')) { UI.toast('Mở trình quản lý phân quyền...', 'info', 'manage_accounts'); return; }
    if (e.target.closest('[data-rs]')) { UI.toast('Đã gửi yêu cầu đặt lại khóa 2FA.', 'ok', 'lock_reset'); return; }
    if (e.target.closest('[data-mail]')) { UI.toast('Đã gửi lại email kích hoạt.', 'ok', 'forward_to_inbox'); return; }

    if (e.target.closest('[data-lock]')) {
      if (!confirm(`Khóa tài khoản ${uid}? Hành động sẽ ghi vào Audit Trail.`)) return;
      row.dataset.status = 'locked';
      if (user) {
        user.status = 'locked';
        row.outerHTML = renderRow(user);
        apply();
        if (window.MockAPI) {
          try { await MockAPI.patch('accounts', user.id, { status: 'locked' }); }
          catch (err) { console.warn('[MockAPI]', err.message); UI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'err', 'error'); }
        }
      }
      UI.toast(`Đã khóa tài khoản ${uid}.`, 'ok', 'block');
      return;
    }
    if (e.target.closest('[data-unlock]')) {
      row.dataset.status = 'active';
      if (user) {
        user.status = 'active';
        row.outerHTML = renderRow(user);
        apply();
        if (window.MockAPI) {
          try { await MockAPI.patch('accounts', user.id, { status: 'active' }); }
          catch (err) { console.warn('[MockAPI]', err.message); UI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'err', 'error'); }
        }
      }
      UI.toast(`Đã mở khóa tài khoản ${uid}.`, 'ok', 'lock_open');
      return;
    }
    if (e.target.closest('[data-del]')) {
      if (!confirm(`XÓA VĨNH VIỄN tài khoản ${uid}? Không thể hoàn tác!`)) return;
      if (user) {
        if (window.MockAPI) {
          try { await MockAPI.remove('accounts', user.id); }
          catch (err) { console.warn('[MockAPI]', err.message); UI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'err', 'error'); }
        }
        users = users.filter(u => u.uid !== uid);
        render();
      } else {
        row.style.transition = 'opacity .3s'; row.style.opacity = '0';
        setTimeout(() => { row.remove(); apply(); }, 300);
      }
      UI.toast(`Đã xóa vĩnh viễn ${uid}.`, 'err', 'delete_forever');
      return;
    }
  });

  /* ── Thêm người dùng ── */
  document.getElementById('btnSaveUser').addEventListener('click', async () => {
    const name = document.getElementById('aName').value.trim();
    const email = document.getElementById('aEmail').value.trim();
    const phone = document.getElementById('aPhone').value.trim();
    if (!name) { UI.toast('Vui lòng nhập họ tên.', 'err', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { UI.toast('Email không hợp lệ.', 'err', 'error'); return; }
    if (!phone) { UI.toast('Vui lòng nhập SĐT.', 'err', 'error'); return; }
    const role = document.getElementById('aRole');
    const [chip, icon, label] = ROLE_MAP[role.value];
    const uid = 'UID-VN' + Math.floor(Math.random() * 9000 + 1000);
    const initials = name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    const payload = {
      name: name,
      uid: uid,
      role: DIR_TO_AUTH[role.value] || 'owner',
      dirRole: role.value,
      password: 'demo123',
      roleLabel: label,
      chip: chip,
      roleIcon: icon,
      email: email,
      phone: phone,
      petsLabel: '0 bé cưng',
      petsIcon: 'cruelty_free',
      joined: 'Hôm nay',
      lastActive: 'Chưa kích hoạt',
      status: 'pending',
      avatar: '',
      avatarFallback: initials
    };

    let saved = null;
    if (window.MockAPI) {
      try { saved = await MockAPI.create('accounts', payload); }
      catch (err) {
        console.warn('[MockAPI]', err.message);
        UI.toast('Không kết nối được mock API — tài khoản chỉ lưu tạm trên giao diện.', 'err', 'error');
      }
    }
    const user = saved || payload;
    if (users) {
      users.unshift(user);
      render();
    } else {
      tbody.insertAdjacentHTML('afterbegin', renderRow(user));
      apply();
    }
    ['aName', 'aEmail', 'aPhone'].forEach(id => document.getElementById(id).value = '');
    UI.close('modalAdd');
    UI.toast(`Đã tạo tài khoản "${name}" (${uid}).`, 'ok', 'person_add');
  });

  /* ── Xuất CSV thật ── */
  document.getElementById('btnCsv').addEventListener('click', () => {
    const data = [...tbody.querySelectorAll('tr')].filter(r => r.style.display !== 'none').map(r => ({
      UID: r.querySelector('.mono').textContent,
      Ten: r.querySelector('.cell-main').textContent,
      Email: r.dataset.key.split(' ').slice(-2).join(' '),
      TrangThai: r.dataset.status
    }));
    if (!data.length) { UI.toast('Không có tài khoản nào để xuất.', 'info', 'ios_share'); return; }
    const csv = [Object.keys(data[0]).join(','), ...data.map(d => Object.values(d).map(v => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'petcompanion_users.csv'; a.click(); URL.revokeObjectURL(a.href);
    UI.toast(`Đã xuất ${data.length} tài khoản ra CSV.`, 'ok', 'ios_share');
  });

  /* ── Phân trang ── */
  document.querySelectorAll('.pager .pg').forEach(p => p.addEventListener('click', () => {
    if (p.disabled || p.querySelector('.material-symbols-outlined') || p.classList.contains('pg-dots')) return;
    document.querySelectorAll('.pager .pg').forEach(x => x.classList.remove('on')); p.classList.add('on');
    UI.toast(`Chuyển sang trang ${p.textContent}...`, 'info', 'swap_horiz');
  }));

  /* ── INIT - tải danh bạ người dùng từ mock API ── */
  async function load() {
    if (!window.MockAPI) {
      tbody.innerHTML = stateRow('error', 'Thiếu core/api.js nên chưa kết nối được mock API.');
      return;
    }
    tbody.innerHTML = stateRow('loading', 'Đang tải danh bạ người dùng...');
    try {
      const data = await MockAPI.list('accounts');
      users = (Array.isArray(data) ? data : []).filter(u => u.role !== 'admin');
      render();
    } catch (err) {
      users = null;
      tbody.innerHTML = stateRow('error', err.message || 'Không tải được danh bạ người dùng.');
      UI.toast('Không tải được danh bạ người dùng từ mock API.', 'err', 'cloud_off');
    }
  }

  load();
});
