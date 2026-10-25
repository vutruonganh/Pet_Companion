/* exercises.js – Thư viện bài tập: exercises (CRUD) + gán vào trainingPlans.exerciseIds */
(function () {
  const h = PC.esc, $ = (s) => document.querySelector(s);
  const list = $('#exerciseContainer'), panel = $('#detailPreviewBox');
  const CAT = { obedience: 'Vâng lời cơ bản', behavior: 'Sửa đổi hành vi', agility: 'Thể lực & Agility', social: 'Kỹ năng giao tiếp' };
  const DIFF = { easy: { n: 2, t: 'Dễ' }, medium: { n: 3, t: 'Trung bình' }, hard: { n: 4, t: 'Nâng cao' } };
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  let items = [], plans = [], pets = [], tab = 'all', selected = null, mode = 'retry';

  async function load() {
    mode = 'retry';
    list.innerHTML = PC.stateBox('loading', 'Đang tải thư viện bài tập...');
    try {
      [items, plans, pets] = await Promise.all(['exercises', 'trainingPlans', 'pets'].map((c) => PC.api.list(c)));
      items = items.filter((e) => !e.archived);
      renderStats(); renderTabs(); render();
    } catch (e) { list.innerHTML = PC.stateBox('error', e.message, 'Thử lại'); }
  }

  function renderStats() {
    const learners = items.reduce((a, e) => a + (+e.learners || 0), 0);
    const s = (cls, icon, n, l) => '<div class="stat-card"><div class="stat-icon ' + cls + '"><span class="material-symbols-outlined text-[28px]">' + icon + '</span></div><div class="stat-data"><span class="stat-number">' + n + '</span><span class="stat-label">' + l + '</span></div></div>';
    $('#statsGrid').innerHTML = s('teal', 'menu_book', items.length, 'Bài tập trong hệ thống') +
      s('orange', 'category', new Set(items.map((e) => e.category)).size, 'Nhóm kỹ năng đang có bài tập') +
      s('blue', 'groups', learners, 'Lượt học viên đã luyện');
  }
  function renderTabs() {
    const t = [['all', 'Tất cả']].concat(Object.entries(CAT));
    $('#tabsRow').innerHTML = t.map(([k, l]) => '<button class="tab-item' + (tab === k ? ' active' : '') + '" data-tab="' + k + '" type="button"><span>' + h(l) + '</span><span class="tab-badge">' + (k === 'all' ? items.length : items.filter((e) => e.category === k).length) + '</span></button>').join('');
  }

  function filtered() {
    const q = $('#exerciseSearchInput').value.trim().toLowerCase(), df = $('#difficultyFilter').value, du = $('#durationFilter').value;
    return items.filter((e) => {
      const hay = (e.id + ' ' + e.title + ' ' + (e.props || '') + ' ' + (e.desc || '')).toLowerCase();
      const d = +e.duration || 0;
      return (tab === 'all' || e.category === tab) && (!q || hay.includes(q)) && (!df || e.difficulty === df) &&
        (!du || (du === 'lt15' ? d < 15 : du === 'mid' ? d >= 15 && d <= 25 : d > 25));
    });
  }

  function card(e) {
    const d = DIFF[e.difficulty] || DIFF.easy;
    return '<article class="exercise-card' + (e.id === selected ? ' active-selected' : '') + '" data-id="' + h(e.id) + '">' +
      '<div class="exercise-top-row"><div class="ex-code-title"><span class="ex-code-pill">#' + h(e.id) + '</span><h3 class="ex-name">' + h(e.title) + '</h3></div><span class="category-chip ' + h(e.category) + '">' + h(CAT[e.category] || e.category) + '</span></div>' +
      '<div class="ex-meta-grid">' +
      '<div class="meta-item"><span class="meta-label"><span class="material-symbols-outlined text-[15px]">schedule</span> Thời lượng</span><span class="meta-val">' + h(e.duration) + ' phút/lần</span></div>' +
      '<div class="meta-item"><span class="meta-label"><span class="material-symbols-outlined text-[15px]">grade</span> Độ khó</span><span class="meta-val"><span class="rating-stars">' + stars(d.n) + '</span> (' + d.t + ')</span></div>' +
      '<div class="meta-item" style="grid-column: span 2;"><span class="meta-label"><span class="material-symbols-outlined text-[15px]">construction</span> Dụng cụ</span><span class="meta-val">' + h(e.props || '—') + '</span></div></div>' +
      '<div class="ex-criteria-box"><strong>Tiêu chí đạt:</strong> ' + h((e.criteria || []).join('; ') || '—') + '</div>' +
      '<div class="ex-actions-row"><span style="font-size:0.8rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:0.3rem;"><span class="material-symbols-outlined text-[16px] text-primary">groups</span> ' + (e.learners || 0) + ' học viên đã luyện</span>' +
      '<div class="action-sub-group">' +
      '<button class="btn-action-sm" data-act="edit" type="button"><span class="material-symbols-outlined text-[15px]">edit</span> Sửa</button>' +
      '<button class="btn-action-sm" data-act="del" type="button"><span class="material-symbols-outlined text-[15px]">delete</span> Xóa</button>' +
      '<button class="btn-action-sm btn-action-primary-sm" data-act="assign" type="button"><span class="material-symbols-outlined text-[15px]">bookmark_add</span> Gán vào giáo án</button></div></div></article>';
  }

  function render() {
    const f = filtered();
    if (!f.length) {
      mode = items.length ? 'none' : 'create';
      list.innerHTML = PC.stateBox('empty', items.length ? 'Không có bài tập nào khớp bộ lọc.' : 'Thư viện chưa có bài tập nào.', items.length ? '' : 'Thêm bài tập đầu tiên');
    } else { mode = 'none'; list.innerHTML = f.map(card).join(''); }
    if (!items.find((e) => e.id === selected)) selected = f[0] ? f[0].id : null;
    renderDetail();
  }

  function renderDetail() {
    const e = items.find((x) => x.id === selected);
    if (!e) { panel.innerHTML = '<div class="detail-body"><div class="pcx-meta">Chọn một bài tập để xem chi tiết.</div></div>'; return; }
    const bg = e.img ? "background-image:url('" + h(e.img) + "')" : 'background:linear-gradient(135deg,#14b8a6,#0d9488)';
    panel.innerHTML = '<div class="detail-panel-banner" style="' + bg + '"><div class="banner-overlay"></div><div class="banner-content"><span class="banner-tag">' + h(CAT[e.category] || e.category) + '</span><h4 class="banner-title">#' + h(e.id) + ': ' + h(e.title) + '</h4>' +
      '<button type="button" id="panelVideoBtn" class="btn-action-sm" style="margin-top:.5rem;background:rgba(255,255,255,.92)"><span class="material-symbols-outlined text-[15px]">play_circle</span> Xem video hướng dẫn (' + videoLen(e) + ')</button></div></div>' +
      '<div class="detail-body"><p style="font-size:.85rem;line-height:1.5;color:var(--text-muted);margin:0">' + h(e.desc || '') + '</p>' +
      '<div><h5 class="detail-section-title"><span class="material-symbols-outlined">format_list_numbered</span> Quy trình huấn luyện (' + (e.steps || []).length + ' bước)</h5><div class="guide-steps-list">' +
      (e.steps || []).map((s, i) => '<div class="step-item"><div class="step-badge">' + (i + 1) + '</div><div class="step-info"><div class="step-title">' + h(s.t) + '</div><p class="step-desc">' + h(s.d) + '</p></div></div>').join('') + '</div></div>' +
      ((e.criteria || []).length ? '<div><h5 class="detail-section-title"><span class="material-symbols-outlined">task_alt</span> Tiêu chí đạt</h5><ul style="margin:0;padding-left:1.1rem;font-size:.82rem;line-height:1.6">' + e.criteria.map((c) => '<li>' + h(c) + '</li>').join('') + '</ul></div>' : '') +
      ((e.mistakes || []).length ? '<div class="note-box"><span class="material-symbols-outlined">warning</span><span><strong>Lỗi thường gặp:</strong><br>' + e.mistakes.map((m) => '• ' + h(m)).join('<br>') + '</span></div>' : '') + '</div>';
  }

  /* ---- Form thêm / sửa ---- */
  const lines = (v) => v.split('\n').map((x) => x.trim()).filter(Boolean);
  function openForm(ex) {
    const e = ex || { title: '', category: 'obedience', difficulty: 'easy', duration: 10, props: '', desc: '', criteria: [], steps: [], mistakes: [], img: '' };
    const opt = (o, cur) => Object.entries(o).map(([k, v]) => '<option value="' + k + '"' + (k === cur ? ' selected' : '') + '>' + h(typeof v === 'string' ? v : v.t) + '</option>').join('');
    PC.modal({
      title: ex ? 'Chỉnh sửa bài tập #' + ex.id : '+ Thêm bài tập huấn luyện mới', wide: true, confirmText: ex ? 'Lưu thay đổi' : 'Lưu vào kho bài tập',
      body: '<div class="pcx-field"><label>Tên bài tập *</label><input class="pcx-in" id="fTitle" value="' + h(e.title) + '" placeholder="VD: Lệnh Bắt tay (Shake hands / Paw)"></div>' +
        '<div class="pcx-grid2"><div class="pcx-field"><label>Nhóm kỹ năng</label><select class="pcx-in" id="fCat">' + opt(CAT, e.category) + '</select></div>' +
        '<div class="pcx-field"><label>Độ khó</label><select class="pcx-in" id="fDiff">' + opt(DIFF, e.difficulty) + '</select></div></div>' +
        '<div class="pcx-grid2"><div class="pcx-field"><label>Thời lượng (phút) *</label><input class="pcx-in" id="fDur" type="number" min="1" max="180" value="' + h(e.duration) + '"></div>' +
        '<div class="pcx-field"><label>Dụng cụ</label><input class="pcx-in" id="fProps" value="' + h(e.props) + '" placeholder="Clicker, bánh thưởng..."></div></div>' +
        '<div class="pcx-field"><label>Mô tả</label><textarea class="pcx-in" id="fDesc">' + h(e.desc) + '</textarea></div>' +
        '<div class="pcx-field"><label>Tiêu chí đạt</label><textarea class="pcx-in" id="fCrit">' + h((e.criteria || []).join('\n')) + '</textarea><small>Mỗi dòng một tiêu chí.</small></div>' +
        '<div class="pcx-field"><label>Các bước</label><textarea class="pcx-in" id="fSteps" rows="4">' + h((e.steps || []).map((s) => s.t + ' | ' + s.d).join('\n')) + '</textarea><small>Mỗi dòng một bước, dạng: Tiêu đề | Mô tả.</small></div>' +
        '<div class="pcx-field"><label>Lỗi thường gặp</label><textarea class="pcx-in" id="fMist">' + h((e.mistakes || []).join('\n')) + '</textarea><small>Mỗi dòng một lỗi.</small></div>' +
        '<div class="pcx-field"><label>Link ảnh minh họa (tuỳ chọn)</label><input class="pcx-in" id="fImg" value="' + h(e.img || '') + '"></div>',
      onConfirm: async (root) => {
        const v = (id) => root.querySelector(id).value.trim();
        if (v('#fTitle').length < 3) throw new Error('Vui lòng nhập tên bài tập (ít nhất 3 ký tự).');
        const dur = +v('#fDur'); if (!(dur >= 1)) throw new Error('Thời lượng phải lớn hơn 0.');
        const data = {
          title: v('#fTitle'), category: v('#fCat'), difficulty: v('#fDiff'), duration: dur, props: v('#fProps'), desc: v('#fDesc'),
          criteria: lines(root.querySelector('#fCrit').value), mistakes: lines(root.querySelector('#fMist').value), img: v('#fImg'),
          steps: lines(root.querySelector('#fSteps').value).map((l) => { const i = l.indexOf('|'); return i < 0 ? { t: l, d: '' } : { t: l.slice(0, i).trim(), d: l.slice(i + 1).trim() }; }),
          updatedAt: new Date().toISOString()
        };
        if (ex) { await PC.api.update('exercises', ex.id, data); selected = ex.id; PC.toast('Đã cập nhật bài tập.'); }
        else { const c = await PC.api.create('exercises', Object.assign({ learners: 0, propKeys: [], archived: false }, data)); selected = c.id; PC.toast('Đã lưu bài tập mới vào thư viện.'); }
        await load();
      }
    });
  }

  /* ---- Gán vào giáo án (1 bài hoặc nhiều bài = "đóng gói khóa học") ---- */
  function openAssign(preIds) {
    const open = plans.filter((p) => !p.archived);
    if (!open.length) return PC.toast('Chưa có giáo án nào để gán.', false);
    const petName = (id) => (pets.find((p) => p.id === id) || {}).name || '';
    PC.modal({
      title: preIds.length === 1 ? 'Gán bài tập vào giáo án' : 'Đóng gói khóa học', confirmText: 'Gán vào giáo án',
      body: '<div class="pcx-field"><label>Giáo án</label><select class="pcx-in" id="aPlan">' + open.map((p) => '<option value="' + h(p.id) + '">' + h(petName(p.petId)) + ' – ' + h(p.title) + '</option>').join('') + '</select></div>' +
        '<div class="pcx-field"><label>Bài tập</label><div class="pcx-checklist">' + items.map((e) => '<label><input type="checkbox" value="' + h(e.id) + '"' + (preIds.includes(e.id) ? ' checked' : '') + '> ' + h(e.title) + '</label>').join('') + '</div></div>',
      onConfirm: async (root) => {
        const ids = [...root.querySelectorAll('.pcx-checklist input:checked')].map((i) => i.value);
        if (!ids.length) throw new Error('Hãy chọn ít nhất một bài tập.');
        const p = plans.find((x) => x.id === root.querySelector('#aPlan').value);
        const merged = [...new Set([...(p.exerciseIds || []), ...ids])];
        await PC.api.update('trainingPlans', p.id, { exerciseIds: merged });
        PC.toast('Đã gán ' + ids.length + ' bài tập vào giáo án.'); await load();
      }
    });
  }

  async function remove(e) {
    if (!confirm('Xóa bài tập "' + e.title + '" khỏi thư viện?')) return;
    try {
      await PC.api.remove('exercises', e.id);
      for (const p of plans.filter((x) => (x.exerciseIds || []).includes(e.id)))
        await PC.api.update('trainingPlans', p.id, { exerciseIds: p.exerciseIds.filter((i) => i !== e.id) });
      PC.toast('Đã xóa bài tập.'); await load();
    } catch (err) { PC.toast(err.message, false); }
  }

  /* ---- Video hướng dẫn (mô phỏng, như bản Stitch) ---- */
  const mmss = (sec) => Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  const videoSecs = (e) => Math.max(30, ((e.steps || []).length || 3) * 30 + (+e.duration || 10));
  const videoLen = (e) => mmss(videoSecs(e));

  function openVideo(e) {
    const total = videoSecs(e);
    let t = 0, timer = null;
    const m = PC.modal({
      title: e.title, wide: true, cancelText: 'Đóng',
      body: '<div style="font-size:11px;font-weight:700;color:#0d9488;letter-spacing:.04em;margin-bottom:8px">MÔ PHỎNG THỰC ĐỊA HD 1080P (#' + h(e.id) + ')</div>' +
        '<div style="position:relative;aspect-ratio:16/9;background:#0f172a;border-radius:12px;display:flex;flex-direction:column;justify-content:space-between;padding:14px;color:#fff">' +
        '<div style="font-size:12px;background:rgba(0,0,0,.4);padding:4px 12px;border-radius:999px;width:fit-content">Chuẩn hóa SV3 Trainer Arena</div>' +
        '<div style="text-align:center"><button type="button" id="vPlay" aria-label="Phát video" style="width:64px;height:64px;border-radius:50%;border:0;background:rgba(20,184,166,.92);color:#fff;cursor:pointer"><span class="material-symbols-outlined" id="vIcon" style="font-size:36px">play_arrow</span></button>' +
        '<p id="vStatus" style="margin:10px 0 0;font-size:14px;font-weight:600;color:#e2e8f0">Nhấp để phát video thao tác chuẩn cùng HLV K9</p></div>' +
        '<div style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.6);padding:8px 12px;border-radius:8px;font-size:12px"><div style="flex:1;height:6px;background:#334155;border-radius:99px;overflow:hidden"><div id="vBar" style="height:100%;width:0;background:#2dd4bf"></div></div><span id="vTime">0:00 / ' + mmss(total) + '</span></div></div>',
      onConfirm: null
    });
    const $v = (id) => m.el.querySelector(id);
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const draw = () => { $v('#vBar').style.width = Math.min(100, t / total * 100) + '%'; $v('#vTime').textContent = mmss(t) + ' / ' + mmss(total); };
    m.el.addEventListener('click', (ev) => { if (ev.target.closest('.pcx-x,[data-cancel]')) stop(); });
    $v('#vPlay').addEventListener('click', () => {
      if (timer) { stop(); $v('#vIcon').textContent = 'play_arrow'; $v('#vStatus').textContent = 'Tạm dừng video'; return; }
      if (t >= total) t = 0;
      $v('#vIcon').textContent = 'pause';
      $v('#vStatus').textContent = 'Đang phát video hướng dẫn chuẩn tốc độ cao 60FPS...';
      PC.toast('Đang mô phỏng phát video bài tập huấn luyện HD!');
      timer = setInterval(() => {
        t += 1; draw();
        if (t >= total) { stop(); $v('#vIcon').textContent = 'replay'; $v('#vStatus').textContent = 'Đã phát xong video.'; }
      }, 250);                      // tua nhanh 4x để xem thử
    });
    new MutationObserver(() => { if (!document.body.contains(m.el)) stop(); }).observe(document.body, { childList: true });
  }

  /* ---- Sự kiện ---- */
  list.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-pc-action]')) return mode === 'create' ? openForm() : load();
    const c = ev.target.closest('.exercise-card'); if (!c) return;
    const e = items.find((x) => x.id === c.dataset.id); if (!e) return;
    const b = ev.target.closest('[data-act]');
    if (b) { if (b.dataset.act === 'edit') openForm(e); else if (b.dataset.act === 'del') remove(e); else openAssign([e.id]); return; }
    selected = e.id; render();
  });
  $('#tabsRow').addEventListener('click', (ev) => { const b = ev.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; renderTabs(); render(); });
  ['#exerciseSearchInput', '#difficultyFilter', '#durationFilter'].forEach((s) => $(s).addEventListener(s === '#exerciseSearchInput' ? 'input' : 'change', render));
  $('#btnAddExercise').addEventListener('click', () => openForm());
  $('#btnPackage').addEventListener('click', () => openAssign([]));
  panel.addEventListener('click', (ev) => { if (!ev.target.closest('#panelVideoBtn')) return; const e = items.find((x) => x.id === selected); if (e) openVideo(e); });
  load();
})();
