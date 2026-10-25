/* plans.js – Kế hoạch huấn luyện: trainingPlans + pets + trainingLogs + exercises */
(function () {
  const h = PC.esc, $ = (s) => document.querySelector(s);
  const grid = $('#plansContainer'), PAGE = 4;
  const LEVEL = { foundation: 'Nền tảng', therapy: 'Trị liệu hành vi', advanced: 'Nâng cao' };
  const STATUS = {
    in_progress: { cls: 'good', icon: 'check_circle', text: 'Đang tiến triển tốt', bar: '' },
    attention: { cls: 'warning', icon: 'hourglass_top', text: 'Cần theo dõi thêm', bar: 'background:linear-gradient(90deg,#f59e0b,#d97706)' },
    graduated: { cls: 'success', icon: 'workspace_premium', text: 'Đạt chuẩn tốt nghiệp', bar: 'background:linear-gradient(90deg,#0ea5e9,#0284c7)' },
    new: { cls: 'active', icon: 'fiber_new', text: 'Mới tạo', bar: '' },
    paused: { cls: 'warning', icon: 'pause_circle', text: 'Tạm dừng', bar: 'background:linear-gradient(90deg,#f59e0b,#d97706)' }
  };
  const GOAL_NEXT = { todo: 'doing', doing: 'done', done: 'todo' };
  const GOAL_ICON = { todo: 'radio_button_unchecked', doing: 'timelapse', done: 'check_circle' };
  let plans = [], pets = [], logs = [], exercises = [], page = 1, mode = 'retry';

  const petOf = (id) => pets.find((p) => p.id === id);
  const pct = (p) => (p.status === 'graduated' ? 100 : Math.min(100, Math.round((p.week / p.weeks) * 100)));

  async function load() {
    mode = 'retry';
    grid.innerHTML = PC.stateBox('loading', 'Đang tải kế hoạch huấn luyện...');
    try {
      [plans, pets, logs, exercises] = await Promise.all(
        ['trainingPlans', 'pets', 'trainingLogs', 'exercises'].map((c) => PC.api.list(c)));
      renderKpi(); render();
    } catch (e) {
      grid.innerHTML = PC.stateBox('error', e.message, 'Thử lại');
    }
  }

  function renderKpi() {
    const live = plans.filter((p) => !p.archived && ['in_progress', 'attention', 'new'].includes(p.status));
    const petCount = new Set(live.map((p) => p.petId)).size, newCount = plans.filter((p) => p.status === 'new').length;
    const ok = logs.filter((l) => l.result === 'pass' || l.result === 'excellent').length;
    const rate = logs.length ? Math.round((ok / logs.length) * 100) : 0;
    const avg = logs.length ? Math.round(logs.reduce((a, l) => a + (+l.score || 0), 0) / logs.length) : 0;
    const k = (icon, cls, val, tag, desc) => '<div class="tp-kpi-card"><div class="tp-kpi-icon ' + cls + '"><span class="material-symbols-outlined" style="font-size: 26px;">' + icon + '</span></div><div class="tp-kpi-info"><div class="tp-kpi-val">' + val + (tag ? '<span class="tp-kpi-tag">' + tag + '</span>' : '') + '</div><div class="tp-kpi-desc">' + desc + '</div></div></div>';
    $('#kpiGrid').innerHTML =
      k('pets', 'teal', petCount + ' bé', newCount ? newCount + ' giáo án mới' : '', 'Đang theo học các khóa huấn luyện tích cực') +
      k('verified', 'emerald', rate + '%', '', 'Tỷ lệ buổi tập đạt yêu cầu (theo nhật ký đã ghi)') +
      k('menu_book', 'amber', plans.filter((p) => !p.archived).length + ' giáo án', '', exercises.length + ' bài tập trong thư viện để gán vào giáo án') +
      k('bar_chart', 'coral', avg + '/100', '', 'Điểm trung bình của ' + logs.length + ' buổi tập đã ghi nhật ký');
  }

  function filtered() {
    const q = $('#searchPlanInput').value.trim().toLowerCase(), lv = $('#levelFilter').value, st = $('#statusFilter').value;
    return plans.filter((p) => !p.archived).filter((p) => {
      const pet = petOf(p.petId) || {};
      const hay = (p.id + ' ' + p.title + ' ' + (pet.name || '') + ' ' + (pet.owner || '')).toLowerCase();
      return (!q || hay.includes(q)) && (lv === 'all' || p.level === lv) && (st === 'all' || p.status === st);
    });
  }

  function card(p) {
    const pet = petOf(p.petId) || { name: '(Không rõ)', breed: '', age: '', owner: '', species: '' };
    const s = STATUS[p.status] || STATUS.new, done = p.status === 'graduated', v = pct(p);
    const goals = (p.goals || []).map((g) => {
      if (g.state === 'done') return '<span class="tp-skill-tag" style="background-color:var(--mint-tint);border-color:var(--mint);color:var(--teal-ink);"><span class="material-symbols-outlined" style="font-size:14px;">check</span> ' + h(g.text) + '</span>';
      const on = g.state === 'doing';
      return '<span class="tp-skill-tag"><span class="material-symbols-outlined" style="font-size:14px;color:' + (on ? 'var(--primary)' : 'var(--text-light)') + ';">' + (on ? 'radio_button_checked' : 'radio_button_unchecked') + '</span> ' + h(g.text) + '</span>';
    }).join('');
    const tags = (p.tags || []).map((t) => '<span class="tp-skill-tag"><span class="material-symbols-outlined" style="font-size:14px;color:var(--primary);">sell</span> ' + h(t) + '</span>').join('');
    const footer = done
      ? '<button class="tp-btn-card-secondary" data-act="path" data-id="' + h(p.id) + '">Xem lộ trình</button>' +
        (p.certified ? '<button class="tp-btn-card-primary tp-btn-card-cert" data-act="showcert" data-id="' + h(p.id) + '"><span class="material-symbols-outlined" style="font-size:16px;">workspace_premium</span> Xem chứng nhận</button>'
          : '<button class="tp-btn-card-primary tp-btn-card-cert" data-act="cert" data-id="' + h(p.id) + '"><span class="material-symbols-outlined" style="font-size:16px;">verified</span> Cấp chứng nhận</button>')
      : '<button class="tp-btn-card-secondary" data-act="path" data-id="' + h(p.id) + '">Xem lộ trình</button>' +
        '<button class="tp-btn-card-primary" data-act="log" data-id="' + h(p.id) + '"><span class="material-symbols-outlined" style="font-size:16px;">edit_note</span> Ghi nhật ký buổi</button>';
    return '<article class="tp-card">' +
      '<div class="tp-card-header"><div class="tp-card-meta"><span class="tp-card-id">#' + h(p.id) + '</span><h2 class="tp-card-title">' + h(p.title) + '</h2></div>' +
      '<span class="tp-status-pill ' + s.cls + '"><span class="material-symbols-outlined" style="font-size:14px;">' + s.icon + '</span> ' + s.text + '</span></div>' +
      '<div class="tp-card-body"><div class="tp-dog-dossier"><div class="tp-dog-avatar pcx-emoji-avatar" style="font-size:26px">' + PC.emoji(pet.species) + '</div>' +
      '<div class="tp-dog-details"><div class="tp-dog-name">' + h(pet.name) + (pet.breed ? ' (' + h(pet.breed) + ')' : '') + '</div>' +
      '<div class="tp-dog-sub">' + h(pet.age) + ' • Chủ: ' + h(pet.owner) + ' • ' + h(LEVEL[p.level] || p.level) + '</div></div></div>' +
      '<div class="tp-progress-section"><div class="tp-progress-labels"><span>Tuần ' + p.week + '/' + p.weeks + ' • ' + p.perWeek + ' buổi/tuần</span><span style="color:var(--primary-dark);">' + v + '%</span></div>' +
      '<div class="tp-progress-bar-bg"><div class="tp-progress-bar-fill" style="width:' + v + '%;' + s.bar + '"></div></div></div>' +
      '<div class="tp-skills-box"><span class="tp-skills-title">' + (done ? 'Mục tiêu đã hoàn thiện:' : 'Mục tiêu hành vi:') + '</span><div class="tp-skill-tags">' + goals + tags + '</div>' +
      (p.note ? '<div class="tp-dog-sub" style="margin-top:.4rem;font-style:italic">📝 ' + h(p.note) + '</div>' : '') + '</div></div>' +
      '<div class="tp-card-footer">' + footer + '</div></article>';
  }

  function render() {
    const items = filtered(), pages = Math.max(1, Math.ceil(items.length / PAGE));
    page = Math.min(page, pages);
    const slice = items.slice((page - 1) * PAGE, page * PAGE);
    if (!items.length) {
      const any = plans.some((p) => !p.archived);
      mode = any ? 'none' : 'create';
      grid.innerHTML = PC.stateBox('empty', any ? 'Không có kế hoạch nào khớp bộ lọc.' : 'Chưa có kế hoạch huấn luyện nào.', any ? '' : 'Tạo giáo án đầu tiên');
    } else { mode = 'none'; grid.innerHTML = slice.map(card).join(''); }
    $('#pageText').innerHTML = 'Hiển thị <strong>' + slice.length + '</strong> trên tổng số <strong>' + items.length + '</strong> kế hoạch huấn luyện';
    let pg = '<button aria-label="Trang trước" class="tp-page-item tp-page-arrow" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled style="opacity:.5;cursor:not-allowed"' : '') + '><span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span></button>';
    for (let i = 1; i <= pages; i++) pg += '<a class="tp-page-item' + (i === page ? ' active' : '') + '" href="javascript:void(0)" data-page="' + i + '">' + i + '</a>';
    pg += '<button aria-label="Trang sau" class="tp-page-item tp-page-arrow" data-page="' + (page + 1) + '"' + (page >= pages ? ' disabled style="opacity:.5;cursor:not-allowed"' : '') + '><span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span></button>';
    $('#pageList').innerHTML = pg;
  }

  /* ---- Modal: xem / sửa lộ trình ---- */
  function openPath(p) {
    const pet = petOf(p.petId) || {};
    const goals = JSON.parse(JSON.stringify(p.goals || []));
    const exs = (p.exerciseIds || []).map((id) => exercises.find((e) => e.id === id)).filter(Boolean);
    const goalsHtml = () => goals.map((g, i) => '<button type="button" class="pcx-goal ' + g.state + '" data-i="' + i + '"><span class="material-symbols-outlined">' + GOAL_ICON[g.state] + '</span>' + h(g.text) + '</button>').join('') || '<div class="pcx-meta">Chưa có mục tiêu.</div>';
    const m = PC.modal({
      title: p.title, wide: true, confirmText: 'Lưu thay đổi',
      body: '<div class="pcx-meta">' + h(pet.name || '') + ' • ' + h(LEVEL[p.level] || p.level) + ' • Tuần ' + p.week + '/' + p.weeks + ' • ' + p.perWeek + ' buổi/tuần</div>' +
        '<div class="pcx-field"><label>Trạng thái</label><select class="pcx-in" id="mStatus">' + Object.entries(STATUS).map(([k, v]) => '<option value="' + k + '"' + (k === p.status ? ' selected' : '') + '>' + v.text + '</option>').join('') + '</select></div>' +
        '<div class="pcx-sub">Mục tiêu (bấm để đổi: chưa làm → đang làm → xong)</div><div id="mGoals" style="display:flex;flex-direction:column;gap:6px">' + goalsHtml() + '</div>' +
        '<div class="pcx-sub">Bài tập đã gán (' + exs.length + ')</div>' +
        (exs.length ? '<div class="pcx-meta">' + exs.map((e) => '• ' + h(e.title)).join('<br>') + '</div>' : '<div class="pcx-meta">Chưa gán bài nào. Vào <b>Thư viện bài tập</b> → “Gán vào giáo án”.</div>') +
        '<div class="pcx-field"><label>Ghi chú</label><textarea class="pcx-in" id="mNote">' + h(p.note || '') + '</textarea></div>',
      onConfirm: async (root) => {
        await PC.api.update('trainingPlans', p.id, { status: root.querySelector('#mStatus').value, goals, note: root.querySelector('#mNote').value.trim() });
        PC.toast('Đã cập nhật lộ trình.'); await load();
      }
    });
    m.el.querySelector('#mGoals').addEventListener('click', (e) => {
      const b = e.target.closest('.pcx-goal'); if (!b) return;
      const g = goals[+b.dataset.i]; g.state = GOAL_NEXT[g.state];
      m.el.querySelector('#mGoals').innerHTML = goalsHtml();
    });
  }

  /* ---- Modal: tạo giáo án mới ---- */
  function openCreate() {
    if (!pets.length) return PC.toast('Chưa có thú cưng nào để tạo giáo án.', false);
    PC.modal({
      title: '+ Tạo giáo án mới', confirmText: 'Tạo giáo án',
      body: '<div class="pcx-field"><label>Thú cưng</label><select class="pcx-in" id="nPet">' + pets.map((p) => '<option value="' + h(p.id) + '">' + h(p.name) + ' – ' + h(p.breed) + ' (chủ: ' + h(p.owner) + ')</option>').join('') + '</select></div>' +
        '<div class="pcx-field"><label>Tên giáo án *</label><input class="pcx-in" id="nTitle" placeholder="VD: Lộ trình nghe lời cơ bản"></div>' +
        '<div class="pcx-grid2"><div class="pcx-field"><label>Cấp độ</label><select class="pcx-in" id="nLevel">' + Object.entries(LEVEL).map(([k, v]) => '<option value="' + k + '">' + v + '</option>').join('') + '</select></div>' +
        '<div class="pcx-field"><label>Số tuần / Số buổi mỗi tuần</label><div class="pcx-grid2"><input class="pcx-in" id="nWeeks" type="number" min="1" max="52" value="4"><input class="pcx-in" id="nPer" type="number" min="1" max="14" value="3"></div></div></div>' +
        '<div class="pcx-field"><label>Mục tiêu hành vi</label><textarea class="pcx-in" id="nGoals" placeholder="Mỗi dòng một mục tiêu"></textarea></div>',
      onConfirm: async (root) => {
        const v = (id) => root.querySelector(id).value.trim();
        if (v('#nTitle').length < 3) throw new Error('Vui lòng nhập tên giáo án (ít nhất 3 ký tự).');
        const weeks = +v('#nWeeks'), per = +v('#nPer');
        if (!(weeks >= 1) || !(per >= 1)) throw new Error('Số tuần và số buổi phải lớn hơn 0.');
        await PC.api.create('trainingPlans', {
          petId: v('#nPet'), title: v('#nTitle'), level: v('#nLevel'), status: 'new', weeks, perWeek: per, week: 1,
          goals: v('#nGoals').split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ text, state: 'todo' })),
          tags: [], note: '', homework: 0, exerciseIds: [], archived: false
        });
        PC.toast('Đã tạo giáo án mới.'); await load();
      }
    });
  }

  /* ---- Modal: ghi nhật ký buổi tập ngay tại trang này ---- */
  function openLog(p) {
    const pet = petOf(p.petId) || {};
    const next = logs.filter((l) => l.petId === p.petId).reduce((m, l) => Math.max(m, +l.session || 0), 0) + 1;
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const trainer = (document.querySelector('[data-user-name]') || {}).textContent || 'HLV';
    PC.modal({
      title: 'Ghi nhật ký buổi – ' + (pet.name || ''), confirmText: 'Lưu buổi tập',
      body: '<div class="pcx-grid2"><div class="pcx-field"><label>Buổi số</label><input class="pcx-in" id="lNo" type="number" min="1" value="' + next + '"></div>' +
        '<div class="pcx-field"><label>Thời gian</label><input class="pcx-in" id="lDate" type="datetime-local" value="' + now + '"></div></div>' +
        '<div class="pcx-field"><label>Mục tiêu buổi tập *</label><input class="pcx-in" id="lGoal" list="lGoals" placeholder="Chọn hoặc gõ mục tiêu"><datalist id="lGoals">' + (p.goals || []).map((g) => '<option value="' + h(g.text) + '">').join('') + '</datalist></div>' +
        '<div class="pcx-grid2"><div class="pcx-field"><label>Địa điểm</label><input class="pcx-in" id="lArea" placeholder="VD: Sân tập K9"></div>' +
        '<div class="pcx-field"><label>Điểm (0–100)</label><input class="pcx-in" id="lScore" type="number" min="0" max="100" value="70"></div></div>' +
        '<div class="pcx-field"><label>Kết quả</label><select class="pcx-in" id="lResult"><option value="excellent">Xuất sắc</option><option value="pass" selected>Đạt</option><option value="practice">Cần luyện thêm</option></select></div>' +
        '<div class="pcx-field"><label>Mức độ tập trung</label><select class="pcx-in" id="lFocus"><option value="high">Rất tập trung (Phấn khích)</option><option value="good" selected>Tốt (Có xao nhãng nhẹ)</option><option value="low">Còn bồn chồn (Cần tăng thưởng)</option></select></div>' +
        '<div class="pcx-field"><label>Ghi chú của HLV</label><textarea class="pcx-in" id="lNote" placeholder="Quan sát thực tế trong buổi tập..."></textarea></div>',
      onConfirm: async (root) => {
        const v = (id) => root.querySelector(id).value.trim();
        if (!v('#lGoal')) throw new Error('Vui lòng nhập mục tiêu buổi tập.');
        const score = +v('#lScore'); if (!(score >= 0 && score <= 100)) throw new Error('Điểm phải nằm trong khoảng 0–100.');
        if (!v('#lDate')) throw new Error('Vui lòng chọn thời gian.');
        logs.push(await PC.api.create('trainingLogs', { petId: p.petId, session: +v('#lNo') || next, date: v('#lDate'), goal: v('#lGoal'), result: v('#lResult'), note: v('#lNote'), focus: v('#lFocus'), trainer, area: v('#lArea') || '—', score }));
        renderKpi(); PC.toast('Đã ghi nhật ký buổi ' + (+v('#lNo') || next) + ' cho ' + (pet.name || '') + '.');
      }
    });
  }

  /* ---- Chứng chỉ tốt nghiệp (như modalCert của bản Stitch) ---- */
  function openCert(p) {
    const pet = petOf(p.petId) || {};
    const mine = logs.filter((l) => l.petId === p.petId && l.score != null);
    const avg = mine.length ? Math.round(mine.reduce((a, l) => a + (+l.score || 0), 0) / mine.length) : null;
    const trainer = (document.querySelector('[data-user-name]') || {}).textContent || 'HLV';
    const code = 'SV3-CERT-' + String(p.id).replace(/\D/g, '').padStart(4, '0').slice(-4);
    if (!document.getElementById('pcCertPrint')) {
      const st = document.createElement('style'); st.id = 'pcCertPrint';
      st.textContent = '@media print{body>*:not(.pcx-overlay){display:none!important}.pcx-overlay{position:static!important;background:none!important;display:block!important}.pcx-modal{box-shadow:none!important;max-height:none!important;width:100%!important}.pcx-head,.pcx-foot{display:none!important}}';
      document.head.appendChild(st);
    }
    const m = PC.modal({
      title: 'Chứng nhận tốt nghiệp K9 SV3', wide: true, cancelText: 'Đóng', confirmText: 'In chứng chỉ / Lưu PDF',
      body: '<div style="border:3px double #14b8a6;border-radius:16px;padding:28px 20px;text-align:center;background:linear-gradient(135deg,#f0fdfa,#fff)">' +
        '<div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#0d9488">PETCOMPANION VIETNAM ACADEMY</div>' +
        '<h2 style="margin:8px 0;font-size:22px">CHỨNG CHỈ TỐT NGHIỆP' + (avg != null && avg >= 85 ? ' XUẤT SẮC' : '') + '</h2>' +
        '<p style="margin:0;color:#64748b;font-size:14px">Chứng nhận học viên hoàn thành toàn bộ khóa học</p>' +
        '<div style="font-size:30px;margin:10px 0">' + PC.emoji(pet.species) + '</div>' +
        '<div style="font-size:20px;font-weight:700">' + h(pet.name || '') + (pet.breed ? ' (' + h(pet.breed) + ')' : '') + '</div>' +
        '<div style="font-size:14px;color:#334155;margin:4px 0 12px">Khóa: ' + h(p.title) + '</div>' +
        '<div style="font-size:14px">Điểm đánh giá thực hành: <strong>' + (avg != null ? avg + '/100' : 'Chưa có dữ liệu') + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:18px;font-size:13px;color:#475569;text-align:left"><div>Ngày cấp: <strong>' + PC.fmtDate(p.certifiedAt || new Date().toISOString()) + '</strong><br>Mã hiệu: <strong>' + code + '</strong></div><div style="text-align:right"><strong>' + h(trainer) + '</strong><br>Huấn luyện viên</div></div></div>',
      onConfirm: () => { window.print(); return false; }
    });
    return m;
  }

  /* ---- Sự kiện ---- */
  grid.addEventListener('click', async (e) => {
    if (e.target.closest('[data-pc-action]')) return mode === 'create' ? openCreate() : load();
    const b = e.target.closest('[data-act]'); if (!b) return;
    const p = plans.find((x) => x.id === b.dataset.id); if (!p) return;
    if (b.dataset.act === 'path') openPath(p);
    else if (b.dataset.act === 'log') openLog(p);
    else if (b.dataset.act === 'showcert') openCert(p);
    else if (b.dataset.act === 'cert') {
      try { const up = await PC.api.update('trainingPlans', p.id, { certified: true, certifiedAt: new Date().toISOString() }); PC.toast('Đã cấp chứng nhận tốt nghiệp cho ' + ((petOf(p.petId) || {}).name || '') + '.'); await load(); openCert(up); }
      catch (err) { PC.toast(err.message, false); }
    }
  });
  $('#pageList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-page]'); if (!b || b.disabled) return;
    page = +b.dataset.page; render();
  });
  ['#searchPlanInput', '#levelFilter', '#statusFilter'].forEach((s) => $(s).addEventListener(s === '#searchPlanInput' ? 'input' : 'change', () => { page = 1; render(); }));
  $('#btnNewPlan').addEventListener('click', openCreate);
  $('#btnExportPdf').addEventListener('click', () => window.print());
  load();
})();
