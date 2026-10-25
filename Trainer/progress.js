/* progress.js – Tiến độ & AI tóm tắt: pets + trainingPlans + trainingLogs + summaries.
 * "AI" ở đây là bộ tóm tắt theo quy tắc thống kê chạy tại trình duyệt (chưa gọi mô hình thật). */
(function () {
  const h = PC.esc, $ = (s) => document.querySelector(s);
  const meName = (document.querySelector('[data-user-name]') || {}).textContent || 'HLV';
  const side = $('#sidebar'), main = $('#mainCol'), sel = $('#petSelect');
  const LEVEL = { foundation: 'Nền tảng', therapy: 'Trị liệu hành vi', advanced: 'Nâng cao' };
  const RESULT = { excellent: 'Xuất sắc', pass: 'Đạt', practice: 'Cần luyện thêm' };
  const NOTE_ICON = { excellent: 'check_circle', pass: 'psychology_alt', practice: 'tips_and_updates' };
  let pets = [], plans = [], logs = [], sums = [], petId = null, S = null, editing = false;

  window.showNotification = function (msg) {
    const t = $('#tpp-toast'); $('#tpp-toast-text').innerText = msg;
    t.classList.add('active'); setTimeout(() => t.classList.remove('active'), 3500);
  };
  const avgOf = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  const pet = () => pets.find((p) => p.id === petId);
  const petLogs = () => logs.filter((l) => l.petId === petId).sort((a, b) => new Date(a.date) - new Date(b.date));
  const planOf = () => {
    const mine = plans.filter((p) => p.petId === petId && !p.archived);
    return mine.find((p) => ['in_progress', 'attention', 'new'].includes(p.status)) || mine[0];
  };
  const skillTag = (v) => v >= 85 ? ['tpp-tag-master', 'Thành thạo', 'tpp-fill-teal'] : v >= 70 ? ['tpp-tag-good', 'Tốt', 'tpp-fill-blue'] : v >= 60 ? ['tpp-tag-fair', 'Khá', 'tpp-fill-amber'] : ['tpp-tag-practice', 'Cần rèn thêm', 'tpp-fill-coral'];

  async function load() {
    side.innerHTML = PC.stateBox('loading', 'Đang tải dữ liệu tiến độ...'); main.innerHTML = '';
    try {
      [pets, plans, logs, sums] = await Promise.all(['pets', 'trainingPlans', 'trainingLogs', 'summaries'].map((c) => PC.api.list(c)));
    } catch (e) { side.innerHTML = PC.stateBox('error', e.message, 'Thử lại'); return; }
    if (!pets.length) { side.innerHTML = PC.stateBox('empty', 'Chưa có thú cưng nào.'); return; }
    const q = new URLSearchParams(location.search).get('pet');
    petId = (pets.find((p) => p.id === q) || pets.find((p) => logs.some((l) => l.petId === p.id)) || pets[0]).id;
    sel.innerHTML = pets.map((p) => '<option value="' + h(p.id) + '">' + h(p.name) + ' – ' + h(p.breed) + '</option>').join('');
    sel.value = petId;
    initSummary(); renderAll();
  }
  side.addEventListener('click', (e) => { if (e.target.closest('[data-pc-action]')) load(); });

  /* ---- Sidebar: hồ sơ + gói + chỉ số kỹ năng ---- */
  function renderSide() {
    const p = pet(), pl = planOf(), L = petLogs();
    const pct = pl ? (pl.status === 'graduated' ? 100 : Math.min(100, Math.round(pl.week / pl.weeks * 100))) : 0;
    const by = {};
    L.forEach((l) => { (by[l.goal] = by[l.goal] || { sc: [], last: 0 }); by[l.goal].sc.push(+l.score || 0); by[l.goal].last = Math.max(by[l.goal].last, +new Date(l.date)); });
    const skills = Object.entries(by).sort((a, b) => b[1].last - a[1].last).slice(0, 5).map(([g, o]) => {
      const v = avgOf(o.sc), t = skillTag(v);
      return '<div class="tpp-skill-row"><div class="tpp-skill-info"><div class="tpp-skill-name"><span class="material-symbols-outlined" style="font-size:16px;color:var(--text-muted);">target</span> ' + h(g) + '</div>' +
        '<div class="tpp-skill-meta"><span class="tpp-skill-tag ' + t[0] + '">' + t[1] + '</span><span class="tpp-skill-pct">' + v + '%</span></div></div>' +
        '<div class="tpp-bar-bg"><div class="tpp-bar-fill ' + t[2] + '" style="width:' + v + '%;"></div></div></div>';
    }).join('') || '<div class="pcx-meta">Chưa có nhật ký để tính chỉ số.</div>';
    const trainer = L.length ? L[L.length - 1].trainer : meName;
    side.innerHTML =
      '<div class="tpp-card tpp-profile-card"><div class="tpp-avatar-wrapper"><div class="tpp-avatar-img pcx-emoji-avatar" style="font-size:56px">' + PC.emoji(p.species) + '</div><div class="tpp-status-dot" title="Đang trong khóa học"></div></div>' +
      '<h2 class="tpp-pet-name">' + h(p.name) + '</h2><div class="tpp-pet-breed">' + h(p.breed) + ' • ' + h(p.age) + '</div>' +
      '<div class="tpp-specs-grid">' +
      '<div class="tpp-spec-item"><span>Chủ nuôi</span><span>' + h(p.owner) + '</span></div>' +
      '<div class="tpp-spec-item"><span>Mã hồ sơ</span><span>' + h(p.code) + '</span></div>' +
      '<div class="tpp-spec-item"><span>Cấp độ</span><span>' + h(pl ? LEVEL[pl.level] || pl.level : '—') + '</span></div>' +
      '<div class="tpp-spec-item"><span>HLV phụ trách</span><span>' + h(trainer) + '</span></div></div>' +
      '<div class="tpp-package-status"><div class="tpp-pkg-header"><span style="color:var(--teal-deep);">' + h(pl ? pl.title.replace(/\s*\(.*\)$/, '') : 'Chưa có giáo án') + '</span><span style="color:var(--teal-dark);">' + (pl ? 'Tuần ' + pl.week + '/' + pl.weeks : '') + '</span></div>' +
      '<div class="tpp-pkg-bar-bg"><div class="tpp-pkg-bar-fill" style="width:' + pct + '%"></div></div><span class="tpp-pkg-note">Đã hoàn thành ' + pct + '% lộ trình • ' + L.length + ' buổi đã ghi nhật ký</span></div>' +
      '<div style="display:flex;gap:.5rem;justify-content:center;"><button class="tpp-btn tpp-btn-secondary" data-open="health" style="font-size:.78rem;padding:.45rem .85rem;width:100%;"><span class="material-symbols-outlined" style="font-size:16px;">medical_services</span> Hồ sơ thú y</button>' +
      '<button class="tpp-btn tpp-btn-secondary" data-open="chat" style="font-size:.78rem;padding:.45rem .85rem;width:100%;"><span class="material-symbols-outlined" style="font-size:16px;">chat</span> Chat chủ nuôi</button></div></div>' +
      '<div class="tpp-card tpp-skills-card"><div class="tpp-card-header"><h3 class="tpp-card-title"><span class="material-symbols-outlined" style="color:var(--primary);font-size:20px;">query_stats</span> Chỉ số kỹ năng</h3><span style="font-size:.75rem;color:var(--text-muted);font-weight:600;">Theo mục tiêu</span></div>' + skills +
      '<div style="background:var(--surface-container);border-radius:var(--radius-sm);padding:.75rem;font-size:.75rem;color:var(--text-muted);line-height:1.45;margin-top:.5rem;">* Điểm trung bình các buổi tập theo từng mục tiêu, lấy từ nhật ký buổi học.</div></div>';
  }
  side.addEventListener('click', (e) => {
    const n = e.target.closest('[data-note]'); if (n) return showNotification(n.dataset.note);
    const o = e.target.closest('[data-open]'); if (!o) return;
    const pet = pets.find((x) => x.id === petId); if (!pet) return;
    if (o.dataset.open === 'health') openHealth(pet); else openChat(pet);
  });

  /* ---- Hồ sơ thú y (lưu trong localStorage qua PC.api, collection 'petHealth') ---- */
  const HEALTH_DEFAULT = {
    weight: '', vaccineStatus: 'Hoàn tất', dewormDate: '', clinic: 'Bệnh viện PetCare Center',
    vaccines: 'Rabies (Dại) mũi nhắc năm | Đã tiêm\nVanguard Plus 5/L (7 bệnh) | Đã tiêm\nNhỏ gáy Advocate trị ve rận | Sắp đến hạn',
    nutrition: 'Chỉ nên dùng hạt thưởng sấy khô vị thịt nguyên chất, tránh thức ăn nhiều tinh bột bắp để không bị đầy bụng khi tập luyện.'
  };
  async function openHealth(pet) {
    let rec = (await PC.api.list('petHealth', (x) => x.petId === pet.id))[0];
    const v = Object.assign({}, HEALTH_DEFAULT, rec || {});
    const rows = String(v.vaccines).split('\n').filter(Boolean).map((r) => {
      const [name, st] = r.split('|').map((x) => x.trim());
      const ok = /đã tiêm|hoàn tất/i.test(st || '');
      return '<div style="display:flex;justify-content:space-between;padding:.6rem .85rem;border-top:1px solid #e2e8f0"><span>' + h(name) + '</span><span style="font-weight:600;color:' + (ok ? '#10b981' : '#f59e0b') + '">' + h(st || '') + '</span></div>';
    }).join('');
    PC.modal({
      title: 'Sổ theo dõi thú y – Bé ' + pet.name, wide: true, confirmText: 'Lưu hồ sơ', cancelText: 'Đóng hồ sơ',
      body: '<div class="pcx-meta">Mã thú cưng: ' + h(pet.code) + ' • ' + h(v.clinic) + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;text-align:center;margin:.75rem 0">' +
        '<div style="background:#f1f5f9;padding:.75rem;border-radius:8px"><div style="font-size:.72rem;color:#64748b">CÂN NẶNG</div><div style="font-weight:700;margin-top:.2rem">' + (v.weight ? h(v.weight) + ' kg' : '—') + '</div></div>' +
        '<div style="background:#ecfdf5;padding:.75rem;border-radius:8px"><div style="font-size:.72rem;color:#047857">TIÊM PHÒNG</div><div style="font-weight:700;color:#047857;margin-top:.2rem">' + h(v.vaccineStatus) + '</div></div>' +
        '<div style="background:#eff6ff;padding:.75rem;border-radius:8px"><div style="font-size:.72rem;color:#1e40af">TẨY GIUN TIẾP</div><div style="font-weight:700;color:#1e40af;margin-top:.2rem">' + (v.dewormDate ? h(PC.fmtDate(v.dewormDate)) : '—') + '</div></div></div>' +
        '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;font-size:.8rem;margin-bottom:.75rem"><div style="display:flex;justify-content:space-between;padding:.6rem .85rem;background:#f1f5f9;font-weight:600"><span>Vắc xin / Dịch vụ</span><span>Trạng thái</span></div>' + rows + '</div>' +
        '<div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:#92400e;margin-bottom:1rem"><strong>Lưu ý dinh dưỡng trong tập luyện:</strong> ' + h(v.nutrition) + '</div>' +
        '<div class="pcx-sub">Cập nhật hồ sơ</div><div class="pcx-grid2">' +
        '<div class="pcx-field"><label>Cân nặng (kg)</label><input class="pcx-in" id="hW" type="number" step="0.1" min="0" value="' + h(v.weight) + '"></div>' +
        '<div class="pcx-field"><label>Tẩy giun tiếp theo</label><input class="pcx-in" id="hD" type="date" value="' + h(String(v.dewormDate).slice(0, 10)) + '"></div></div>' +
        '<div class="pcx-field"><label>Tình trạng tiêm phòng</label><input class="pcx-in" id="hS" value="' + h(v.vaccineStatus) + '"></div>' +
        '<div class="pcx-field"><label>Lịch tiêm (mỗi dòng: Tên | Trạng thái)</label><textarea class="pcx-in" id="hV" rows="3">' + h(v.vaccines) + '</textarea></div>' +
        '<div class="pcx-field"><label>Lưu ý dinh dưỡng</label><textarea class="pcx-in" id="hN" rows="2">' + h(v.nutrition) + '</textarea></div>',
      onConfirm: async (root) => {
        const g = (id) => root.querySelector(id).value.trim();
        const w = g('#hW'); if (w && (isNaN(+w) || +w <= 0)) throw new Error('Cân nặng phải là số dương.');
        const data = { petId: pet.id, weight: w, dewormDate: g('#hD'), vaccineStatus: g('#hS') || 'Chưa cập nhật', vaccines: g('#hV'), nutrition: g('#hN'), clinic: v.clinic };
        if (rec) await PC.api.update('petHealth', rec.id, data); else await PC.api.create('petHealth', data);
        showNotification('Đã lưu hồ sơ thú y của ' + pet.name + '.');
      }
    });
  }

  /* ---- Chat với chủ nuôi (lưu trong collection 'chats', mỗi thú cưng một cuộc trò chuyện) ---- */
  const REPLIES = ['Dạ cảm ơn thầy nhiều! Gia đình sẽ chú ý rèn thêm theo đúng hướng dẫn.', 'Vâng ạ, em sẽ cho bé luyện lại ở nhà mỗi ngày.', 'Dạ em đã nắm rồi ạ, cảm ơn HLV đã báo.'];
  async function openChat(pet) {
    let rec = (await PC.api.list('chats', (x) => x.petId === pet.id))[0];
    if (!rec) {
      const t0 = new Date(Date.now() - 3600e3).toISOString(), t1 = new Date(Date.now() - 3000e3).toISOString();
      rec = await PC.api.create('chats', { petId: pet.id, messages: [
        { from: 'owner', text: 'Chào HLV, hôm nay bé ' + pet.name + ' về nhà có vẻ rất ngoan. Tuần sau cần chuẩn bị thêm gì không ạ?', at: t0 },
        { from: 'trainer', text: 'Chào anh/chị, ' + pet.name + ' hôm nay học rất tốt. Ở nhà cứ duy trì khen thưởng cách quãng như báo cáo đề xuất nhé!', at: t1 }
      ] });
    }
    const bubble = (m) => m.from === 'trainer'
      ? '<div style="align-self:flex-end;max-width:80%;background:#0d9488;color:#fff;border-radius:12px 12px 2px 12px;padding:.7rem .9rem;font-size:.85rem">' + h(m.text) + '<div style="font-size:.7rem;opacity:.8;margin-top:.25rem;text-align:right">' + PC.fmtTime(m.at) + '</div></div>'
      : '<div style="align-self:flex-start;max-width:80%;background:#fff;border-radius:12px 12px 12px 2px;padding:.7rem .9rem;font-size:.85rem;box-shadow:0 1px 3px rgba(0,0,0,.06)">' + h(m.text) + '<div style="font-size:.7rem;color:#64748b;margin-top:.25rem;text-align:right">' + PC.fmtTime(m.at) + '</div></div>';
    const m = PC.modal({
      title: 'Chat với ' + pet.owner + ' – chủ nuôi bé ' + pet.name, cancelText: 'Đóng',
      body: '<div id="chatBox" style="display:flex;flex-direction:column;gap:.85rem;height:280px;overflow-y:auto;background:#f8fafc;padding:1rem;border-radius:8px">' + rec.messages.map(bubble).join('') + '</div>' +
        '<form id="chatForm" style="display:flex;gap:.5rem;margin-top:.75rem"><input class="pcx-in" id="chatIn" placeholder="Nhập tin nhắn cho ' + h(pet.owner) + '..." autocomplete="off" style="flex:1"><button class="pcx-btn pcx-btn-primary" type="submit">Gửi</button></form>'
    });
    const box = m.el.querySelector('#chatBox'), inp = m.el.querySelector('#chatIn');
    const push = async (msg) => {
      rec.messages.push(msg); box.insertAdjacentHTML('beforeend', bubble(msg)); box.scrollTop = box.scrollHeight;
      await PC.api.update('chats', rec.id, { messages: rec.messages });
    };
    box.scrollTop = box.scrollHeight; inp.focus();
    m.el.querySelector('#chatForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const text = inp.value.trim(); if (!text) return;
      inp.value = '';
      await push({ from: 'trainer', text, at: new Date().toISOString() });
      setTimeout(() => { if (document.body.contains(m.el)) push({ from: 'owner', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: new Date().toISOString() }); }, 900);
    });
  }

  /* ---- AI tóm tắt (theo quy tắc) ---- */
  function analyze(sel) {
    const p = pet(), pl = planOf(), n = sel.length;
    const scores = sel.map((l) => +l.score || 0), avg = avgOf(scores);
    const okN = sel.filter((l) => l.result === 'pass' || l.result === 'excellent').length, rate = Math.round(okN / n * 100);
    const delta = scores[n - 1] - scores[0], g = {};
    sel.forEach((l) => (g[l.goal] = g[l.goal] || []).push(+l.score || 0));
    const gs = Object.entries(g).map(([k, a]) => ({ k, v: avgOf(a) })).sort((a, b) => b.v - a.v), best = gs[0], weak = gs[gs.length - 1];
    const trend = n < 2 ? 'Mới có 1 buổi nên chưa đủ dữ liệu để đánh giá xu hướng' :
      delta >= 10 ? 'Điểm buổi gần nhất cao hơn buổi đầu <strong>' + delta + ' điểm</strong>' :
      delta <= -10 ? 'Điểm buổi gần nhất thấp hơn buổi đầu <strong>' + (-delta) + ' điểm</strong>, cần xem lại cường độ' : 'Điểm số khá ổn định giữa các buổi';
    const nextGoal = pl && (pl.goals || []).find((x) => x.state !== 'done');
    const advice = avg >= 80 ? 'Có thể tăng độ khó: kéo dài thời gian/khoảng cách và thêm yếu tố gây xao nhãng' :
      avg >= 60 ? 'Giữ cường độ hiện tại, củng cố <strong>' + h(weak.k) + '</strong> bằng thưởng cách quãng (variable reinforcement)' :
      'Giảm độ khó, chia nhỏ mục tiêu và thưởng thường xuyên hơn để lấy lại sự tự tin';
    const trainers = [...new Set(sel.map((l) => l.trainer))].join(', ');
    return {
      html: 'Bé <strong>' + h(p.name) + '</strong> có <strong>' + n + ' buổi</strong> được phân tích (' + PC.fmtShort(sel[0].date) + '–' + PC.fmtShort(sel[n - 1].date) + '), điểm trung bình <strong>' + avg + '/100</strong>, ' + okN + '/' + n + ' buổi đạt yêu cầu. ' + trend + '. Tiến bộ tốt nhất: <strong>' + h(best.k) + '</strong> (' + best.v + '/100)' + (weak.k !== best.k ? '; cần củng cố: <strong>' + h(weak.k) + '</strong> (' + weak.v + '/100)' : '') + '.',
      planHtml: advice + '.' + (nextGoal ? ' Mục tiêu kế tiếp trong giáo án: <strong>' + h(nextGoal.text) + '</strong>.' : ''),
      reasonHtml: 'Dựa trên <strong>' + n + ' nhật ký</strong> (điểm: ' + scores.join(', ') + '), tỷ lệ đạt <strong>' + rate + '%</strong> và ghi chú của ' + h(trainers) + '. Bản tóm tắt tạo bằng quy tắc thống kê đơn giản – HLV nên xem lại trước khi gửi.'
    };
  }
  function initSummary() {
    editing = false;
    const L = petLogs(), saved = sums.filter((s) => s.petId === petId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    if (saved) { S = Object.assign({}, saved); return; }
    S = { petId, sessionIds: L.slice(-3).map((l) => l.id), status: 'new' };
    if (L.length) Object.assign(S, analyze(L.slice(-3)));
  }
  function renderAI() {
    const L = petLogs();
    if (!L.length) { main.querySelector('#aiMount').innerHTML = PC.stateBox('empty', 'Chưa có nhật ký buổi tập để AI phân tích.', 'Thêm ghi chú buổi mới'); return; }
    const pills = L.slice(-5).map((l) => '<label class="tpp-checkbox-pill"><input type="checkbox" data-id="' + h(l.id) + '"' + (S.sessionIds.includes(l.id) ? ' checked' : '') + '><span>Buổi ' + l.session + ' (' + PC.fmtShort(l.date) + ')</span></label>').join('');
    const st = S.status === 'sent' ? 'Đã gửi báo cáo cho chủ nuôi lúc ' + PC.fmtTime(S.sentAt) + ' ' + PC.fmtDate(S.sentAt) : S.status === 'draft' ? 'Bản nháp đã lưu lúc ' + PC.fmtTime(S.updatedAt) + ' ' + PC.fmtDate(S.updatedAt) : 'Đã hoàn tất phân tích dựa trên ' + S.sessionIds.length + ' buổi đã chọn';
    main.querySelector('#aiMount').innerHTML =
      '<div class="tpp-ai-selector-box"><div class="tpp-ai-select-group"><span class="tpp-ai-select-label">Dữ liệu phân tích:</span><div class="tpp-pill-checkboxes" id="pills">' + pills + '</div></div>' +
      '<button class="tpp-btn-reanalyze" id="btn-reanalyze" data-ai="regen"><span class="material-symbols-outlined" style="font-size:16px;">refresh</span> Phân tích lại</button></div>' +
      '<div class="tpp-ai-status-pulse" id="ai-status-bar"><div class="tpp-pulse-dot"></div><span>' + h(st) + '</span></div>' +
      '<div class="tpp-ai-content-body"><div class="tpp-ai-section"><div class="tpp-ai-sec-title"><span class="material-symbols-outlined">insights</span> Bản tóm tắt tiến độ súc tích</div><p class="tpp-ai-paragraph" id="ai-summary-text">' + S.html + '</p></div>' +
      '<div class="tpp-plan-box"><div class="tpp-ai-sec-title"><span class="material-symbols-outlined">edit_calendar</span> Đề xuất điều chỉnh giáo án tuần tới</div><p id="ai-plan-text">' + S.planHtml + '</p></div>' +
      '<div class="tpp-reason-box"><span class="material-symbols-outlined tpp-reason-icon">help</span><div class="tpp-reason-content"><strong>Căn cứ suy luận:</strong> ' + S.reasonHtml + '</div></div></div>' +
      '<div class="tpp-ai-actions"><button class="tpp-btn tpp-btn-ghost" data-ai="draft"><span class="material-symbols-outlined" style="font-size:16px;">bookmark_border</span> Lưu bản nháp</button>' +
      '<button class="tpp-btn tpp-btn-secondary" data-ai="edit" id="btnEdit"><span class="material-symbols-outlined" style="font-size:16px;">edit_note</span> Chỉnh sửa nội dung</button>' +
      '<button class="tpp-btn tpp-btn-secondary" data-ai="regen"><span class="material-symbols-outlined" style="font-size:16px;">cycle</span> Tạo lại tóm tắt</button>' +
      '<button class="tpp-btn tpp-btn-primary" data-ai="send"><span class="material-symbols-outlined" style="font-size:18px;">send</span> Chấp nhận &amp; Gửi báo cáo cho Chủ nuôi</button></div>';
  }
  function checkedLogs() {
    const ids = [...main.querySelectorAll('#pills input:checked')].map((i) => i.dataset.id);
    return petLogs().filter((l) => ids.includes(l.id));
  }
  function regen() {
    const sel = checkedLogs();
    if (!sel.length) return showNotification('Hãy chọn ít nhất một buổi để phân tích.');
    const bar = $('#ai-status-bar'), btn = $('#btn-reanalyze');
    bar.innerHTML = '<div class="tpp-pulse-dot" style="background:#f59e0b;"></div><span style="color:#b45309;">Đang phân tích ' + sel.length + ' nhật ký...</span>';
    btn.disabled = true; btn.style.opacity = '.5';
    setTimeout(() => {
      S = Object.assign({}, S, analyze(sel), { sessionIds: sel.map((l) => l.id), status: S.id ? 'draft' : 'new' });
      editing = false; renderAI(); showNotification('Đã tạo lại bản tóm tắt.');
    }, 700);
  }
  async function persist(status) {
    const rec = { petId, sessionIds: S.sessionIds, html: S.html, planHtml: S.planHtml, reasonHtml: S.reasonHtml, status, updatedAt: new Date().toISOString() };
    if (status === 'sent') rec.sentAt = rec.updatedAt;
    if (S.id) await PC.api.update('summaries', S.id, rec); else S.id = (await PC.api.create('summaries', rec)).id;
    Object.assign(S, rec);
  }
  function readEdits() {
    const toHtml = (el) => h(el.innerText.trim()).replace(/\n/g, '<br>');
    S.html = toHtml($('#ai-summary-text')); S.planHtml = toHtml($('#ai-plan-text'));
  }
  main.addEventListener('change', (e) => {
    const i = e.target.closest('#pills input'); if (i) showNotification('Đã ' + (i.checked ? 'thêm' : 'bỏ') + ' buổi này khỏi phạm vi phân tích. Bấm “Phân tích lại” để cập nhật.');
  });
  main.addEventListener('click', async (e) => {
    if (e.target.closest('[data-pc-action]')) return openNewSession();
    const b = e.target.closest('[data-ai]'); if (!b) return;
    try {
      if (b.dataset.ai === 'regen') regen();
      else if (b.dataset.ai === 'edit') {
        const els = [$('#ai-summary-text'), $('#ai-plan-text')];
        if (!editing) { editing = true; els.forEach((x) => x.setAttribute('contenteditable', 'true')); b.lastChild.textContent = ' Xong chỉnh sửa'; }
        else { readEdits(); await persist('draft'); editing = false; renderAI(); showNotification('Đã lưu nội dung chỉnh sửa của HLV!'); }
      } else if (b.dataset.ai === 'draft') { if (editing) readEdits(); await persist('draft'); editing = false; renderAI(); showNotification('Đã lưu bản nháp tóm tắt.'); }
      else if (b.dataset.ai === 'send') { if (editing) readEdits(); await persist('sent'); editing = false; renderAI(); showNotification('✅ Đã gửi báo cáo tiến độ cho chủ nuôi (' + pet().owner + ').'); }
    } catch (err) { showNotification('Lỗi: ' + err.message); }
  });

  /* ---- Timeline nhật ký ---- */
  function renderTimeline() {
    const L = petLogs().slice().reverse();
    const body = L.length ? '<div class="tpp-timeline">' + L.map((l, i) =>
      '<div class="tpp-tl-item"><div class="tpp-tl-dot' + (i === 0 ? ' today' : '') + '"></div><div class="tpp-tl-header"><span class="tpp-tl-session-num">Buổi ' + l.session + ' (' + PC.fmtDate(l.date) + ')</span>' +
      '<span class="tpp-tl-date">' + PC.fmtTime(l.date) + ' • ' + h(l.area) + '</span><span class="tpp-tl-score-badge">Điểm ' + h(l.score) + '/100 • ' + h(RESULT[l.result] || l.result) + '</span></div>' +
      '<div class="tpp-tl-box"><div>Mục tiêu buổi tập: ' + h(l.goal) + '</div><div class="tpp-tl-trainer-note"><span class="material-symbols-outlined">' + (NOTE_ICON[l.result] || 'psychology_alt') + '</span><span><strong>Ghi chú ' + h(l.trainer) + ':</strong> ' + h(l.note) + '</span></div></div></div>').join('') + '</div>'
      : PC.stateBox('empty', 'Chưa có buổi tập nào được ghi nhận.', 'Thêm ghi chú buổi mới');
    main.querySelector('#tlMount').innerHTML = body;
  }

  function renderAll() {
    renderSide();
    main.innerHTML =
      '<section class="tpp-ai-card"><div class="tpp-ai-glow-bg"></div><div class="tpp-ai-topbar"><div class="tpp-ai-brand"><div class="tpp-ai-icon-sparkle"><span class="material-symbols-outlined" style="font-size:22px;">auto_awesome</span></div>' +
      '<div class="tpp-ai-title-wrap"><h2>AI Training Log Analyzer</h2><span class="tpp-ai-sub-badge">AI Engine BTL-35 • Huấn luyện phản xạ &amp; Tâm lý học K9</span></div></div>' +
      '<span style="font-size:.75rem;color:var(--text-muted);font-weight:600;">Mô hình: tóm tắt theo quy tắc (mô phỏng)</span></div><div id="aiMount"></div></section>' +
      '<section class="tpp-timeline-card"><div class="tpp-timeline-header-wrap"><div><h3 class="tpp-card-title"><span class="material-symbols-outlined" style="color:var(--primary);font-size:22px;">history_edu</span> Nhật ký buổi huấn luyện chi tiết</h3>' +
      '<p style="font-size:.85rem;color:var(--text-muted);margin:.2rem 0 0 0;">Ghi chép quan sát thực tế và đánh giá từng buổi học</p></div>' +
      '<button class="tpp-btn tpp-btn-primary" id="btnNewSession"><span class="material-symbols-outlined" style="font-size:18px;">add_circle</span> Thêm ghi chú buổi mới</button></div><div id="tlMount"></div></section>';
    renderAI(); renderTimeline();
    $('#btnNewSession').addEventListener('click', openNewSession);
  }

  /* ---- Modal thêm buổi tập ---- */
  function openNewSession() {
    const L = petLogs(), pl = planOf();
    const next = L.reduce((m, l) => Math.max(m, +l.session || 0), 0) + 1;
    const goals = [...new Set([...(pl ? pl.goals.map((g) => g.text) : []), ...L.map((l) => l.goal)])];
    PC.modal({
      title: 'Thêm ghi chú buổi mới – ' + pet().name, confirmText: 'Lưu buổi tập', wide: true,
      body: '<div class="pcx-grid2"><div class="pcx-field"><label>Buổi số</label><input class="pcx-in" id="sNo" type="number" min="1" value="' + next + '"></div>' +
        '<div class="pcx-field"><label>Thời gian</label><input class="pcx-in" id="sDate" type="datetime-local" value="' + PC.nowLocalInput() + '"></div></div>' +
        '<div class="pcx-field"><label>Mục tiêu buổi tập *</label><input class="pcx-in" id="sGoal" list="goalList" placeholder="Chọn hoặc gõ mục tiêu"><datalist id="goalList">' + goals.map((g) => '<option value="' + h(g) + '">').join('') + '</datalist></div>' +
        '<div class="pcx-grid2"><div class="pcx-field"><label>Địa điểm</label><input class="pcx-in" id="sArea" placeholder="VD: Sân tập K9"></div>' +
        '<div class="pcx-field"><label>Điểm (0–100)</label><input class="pcx-in" id="sScore" type="number" min="0" max="100" value="70"></div></div>' +
        '<div class="pcx-field"><label>Kết quả</label><select class="pcx-in" id="sResult"><option value="excellent">Xuất sắc</option><option value="pass" selected>Đạt</option><option value="practice">Cần luyện thêm</option></select></div>' +
        '<div class="pcx-field"><label>Ghi chú của HLV</label><textarea class="pcx-in" id="sNote" placeholder="Quan sát thực tế trong buổi tập..."></textarea></div>',
      onConfirm: async (root) => {
        const v = (id) => root.querySelector(id).value.trim();
        if (!v('#sGoal')) throw new Error('Vui lòng nhập mục tiêu buổi tập.');
        const score = +v('#sScore'); if (!(score >= 0 && score <= 100)) throw new Error('Điểm phải nằm trong khoảng 0–100.');
        if (!v('#sDate')) throw new Error('Vui lòng chọn thời gian.');
        const c = await PC.api.create('trainingLogs', { petId, session: +v('#sNo') || next, date: v('#sDate'), goal: v('#sGoal'), result: v('#sResult'), note: v('#sNote'), trainer: meName, area: v('#sArea') || '—', score });
        logs.push(c);
        S.sessionIds = petLogs().slice(-3).map((l) => l.id);
        if (!S.html && petLogs().length) Object.assign(S, analyze(petLogs().slice(-3)));
        renderAll(); showNotification('Đã ghi nhận buổi tập mới.');
      }
    });
  }

  sel.addEventListener('change', () => {
    petId = sel.value; history.replaceState(null, '', '?pet=' + encodeURIComponent(petId));
    initSummary(); renderAll();
  });
  load();
})();
