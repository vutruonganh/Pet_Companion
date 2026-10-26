(function () {
  'use strict';
  const O = window.Owner;

  const planList = document.getElementById('planList');
  const calGrid = document.getElementById('calGrid');
  const calLabel = document.getElementById('calLabel');
  const careCount = document.getElementById('careCount');
  const aiPets = document.getElementById('aiPets');
  const aiServices = document.getElementById('aiServices');
  const form = document.getElementById('formNewPlan');

  let pets = [];
  let plans = [];
  let trainers = [];
  let trainingServices = [];
  let month = new Date();
  let selectedDay = null;
  let tab = 'all';
  let aiPetId = null;
  let aiService = 'deworm';

  const DEFAULT_LOCATION = 'PetCare Clinic Quận 1';
  const TRAINING_LOCATION = 'K9 Academy';

  const AI_RECS = {
    deworm: {
      service: 'Uống thuốc tẩy giun định kỳ (NexGard Spectra)',
      type: 'medication', date: '2026-11-18', time: '08:30',
      location: 'Tại nhà', provider: 'Chủ nuôi tự thực hiện',
      reason: 'Dựa trên chu kỳ 3 tháng/lần cho chó trưởng thành trên 25kg.',
      lastUsed: '18/08/2026'
    },
    vaccine: {
      service: 'Tiêm nhắc vắc-xin dại',
      type: 'medical', date: '2026-11-15', time: '10:00',
      location: 'PetCare Clinic Quận 1', provider: 'BS. Trần Văn Minh',
      reason: 'Vắc-xin dại cần nhắc lại sau 12 tháng theo phác đồ của bệnh viện.',
      lastUsed: '15/11/2025'
    }
  };

  function pad(n) { return String(n).padStart(2, '0'); }
  function isoOf(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
  function addDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return isoOf(date);
  }
  function monthStart(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }

  function currentRec() { return AI_RECS[aiService]; }

  function trainerById(id) {
    return trainers.find(function (trainer) { return String(trainer.id) === String(id); }) || { id: '' };
  }

  function trainingServiceById(id) {
    return trainingServices.find(function (service) { return String(service.id) === String(id); }) || { id: '' };
  }

  function fillTrainerSelect() {
    const select = document.getElementById('planTrainer');
    select.innerHTML = trainers.length
      ? '<option value="">— Chọn huấn luyện viên —</option>' + trainers.map(function (trainer) {
          const meta = [trainer.uid || '', trainer.petsLabel || ''].filter(Boolean).join(' · ');
          return '<option value="' + O.esc(trainer.id) + '">' + O.esc(trainer.name) +
            (meta ? ' (' + O.esc(meta) + ')' : '') + '</option>';
        }).join('')
      : '<option value="">Chưa có huấn luyện viên đang hoạt động</option>';
  }

  function fillTrainingServiceSelect() {
    const select = document.getElementById('planTrainingService');
    select.innerHTML = trainingServices.length
      ? '<option value="">— Chọn gói huấn luyện —</option>' + trainingServices.map(function (service) {
          return '<option value="' + O.esc(service.id) + '" data-duration="' + O.esc(service.duration || '') +
            '" data-price="' + O.esc(service.price || 0) + '">' + O.esc(service.name) +
            (service.duration ? ' · ' + O.esc(service.duration) : '') + '</option>';
        }).join('')
      : '<option value="">Chưa có gói huấn luyện nào</option>';
  }

  function updateTrainerHint() {
    const trainer = trainerById(document.getElementById('planTrainer').value);
    const hint = document.getElementById('trainerHint');
    hint.textContent = trainer.id
      ? [trainer.uid, trainer.petsLabel, trainer.phone].filter(Boolean).join(' · ')
      : 'Chọn HLV để xem nơi huấn luyện và số điện thoại.';
  }

  function updateTrainingServiceHint() {
    const select = document.getElementById('planTrainingService');
    const option = select.selectedOptions[0];
    const hint = document.getElementById('trainingServiceHint');
    if (option && option.value) {
      const parts = [option.dataset.duration, option.dataset.price ? O.money(option.dataset.price) : ''].filter(Boolean);
      hint.textContent = parts.join(' · ');
    } else {
      hint.textContent = 'Chọn gói để tự điền thời lượng buổi tập.';
    }
  }

  function syncTypeFields() {
    const type = document.getElementById('planType').value;
    const training = type === 'training';
    document.getElementById('trainerField').hidden = !training;
    document.getElementById('trainingServiceField').hidden = !training;
    document.getElementById('serviceTextField').hidden = training;
    document.getElementById('providerField').hidden = training;
    document.getElementById('planTrainer').required = training;
    document.getElementById('planTrainingService').required = training;
    document.getElementById('planService').required = !training;

    const location = document.getElementById('planLocation');
    const trainer = trainerById(document.getElementById('planTrainer').value);
    if (training) {
      if (!location.value.trim() || location.value === DEFAULT_LOCATION) {
        location.value = trainer.petsLabel || TRAINING_LOCATION;
      }
    } else if (location.value === TRAINING_LOCATION) {
      location.value = DEFAULT_LOCATION;
    }
    updateTrainerHint();
    updateTrainingServiceHint();
  }

  function renderAiPets() {
    aiPets.innerHTML = pets.map(function (pet) {
      const active = String(pet.id) === String(aiPetId) ? ' active' : '';
      return '<button class="ai-pill' + active + '" type="button" data-pet="' + O.esc(pet.id) + '">' +
        O.esc(pet.name) + ' (' + O.esc(pet.breed || pet.speciesLabel) + ')</button>';
    }).join('');
  }

  function renderAi() {
    const rec = currentRec();
    const pet = O.petById(pets, aiPetId);
    aiServices.querySelectorAll('.ai-pill').forEach(function (button) {
      button.classList.toggle('active', button.dataset.service === aiService);
    });
    document.getElementById('aiRecMain').textContent =
      rec.service + ' cho ' + pet.name + ' vào ' + O.weekday(rec.date) + ', ' +
      O.fmtDate(rec.date) + ' lúc ' + rec.time;
    document.getElementById('aiReason').innerHTML = '<strong>Lý do:</strong> ' + O.esc(rec.reason);
    document.getElementById('aiLastUsed').textContent = rec.lastUsed;
  }

  function renderCalendar() {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    calLabel.textContent = 'Tháng ' + pad(monthIndex + 1) + ' / ' + year;

    const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const daysInPrev = new Date(year, monthIndex, 0).getDate();
    const today = O.todayISO();
    const cells = [];

    function cell(date, other) {
      const iso = isoOf(date);
      const classes = ['cal-day'];
      if (other) classes.push('other');
      if (iso === today) classes.push('today');
      if (iso === selectedDay) classes.push('selected');
      const dots = plans.filter(function (plan) {
        return plan.date === iso && plan.status !== 'cancelled';
      }).map(function (plan) {
        return '<span class="cal-dot ' + O.esc(plan.type) + '"></span>';
      }).join('');
      return '<button type="button" class="' + classes.join(' ') + '" data-date="' + iso + '">' +
        date.getDate() + (dots ? '<span class="cal-dots">' + dots + '</span>' : '') + '</button>';
    }

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(cell(new Date(year, monthIndex - 1, daysInPrev - firstWeekday + i + 1), true));
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(cell(new Date(year, monthIndex, day), false));
    }
    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= trailing; i += 1) {
      cells.push(cell(new Date(year, monthIndex + 1, i), true));
    }

    calGrid.innerHTML = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
      .map(function (label) { return '<span class="cal-dow">' + label + '</span>'; }).join('') + cells.join('');
  }

  function planCard(plan) {
    const pet = O.petById(pets, plan.petId);
    const statusClass = O.planStatusClass(plan.status);
    const isTraining = plan.type === 'training';
    const cancelButton = plan.status === 'cancelled' ? '' :
      '<button class="btn btn-ghost" type="button" data-action="cancel" data-id="' + O.esc(plan.id) + '">Hủy / Dời hẹn</button>';

    return '<article class="plan-card ' + O.esc(plan.type) + (plan.status === 'cancelled' ? ' cancelled' : '') + '">' +
      '<div class="plan-top">' +
        '<div class="plan-main">' +
          '<div class="plan-avatar">' + O.avatar(pet) + '</div>' +
          '<div><h3 class="plan-svc">' + O.esc(plan.service) + '</h3>' +
          '<div class="plan-pet">Dành cho: ' + O.esc(plan.petName) + (pet.breed ? ' · ' + O.esc(pet.breed) : '') + '</div></div>' +
        '</div>' +
        '<span class="' + statusClass + '"><i></i>' + O.esc(plan.statusLabel) + '</span>' +
      '</div>' +
      '<div class="plan-facts">' +
        '<div class="plan-fact"><span class="material-symbols-outlined">schedule</span><div><small>Thời gian</small><b>' +
          O.esc(plan.time) + ' · ' + O.fmtDate(plan.date) + '</b></div></div>' +
        '<div class="plan-fact"><span class="material-symbols-outlined">' + (isTraining ? 'school' : 'local_hospital') + '</span><div><small>Địa điểm</small><b>' +
          O.esc(plan.location || '—') + '</b></div></div>' +
        '<div class="plan-fact"><span class="material-symbols-outlined">' + (isTraining ? 'sports_score' : 'badge') + '</span><div><small>' +
          (isTraining ? 'HLV phụ trách' : 'Phụ trách') + '</small><b>' +
          O.esc(plan.provider || '—') + '</b></div></div>' +
      '</div>' +
      '<div class="plan-actions">' + cancelButton +
        '<button class="btn btn-primary" type="button" data-action="detail" data-id="' + O.esc(plan.id) + '">Xem chi tiết</button>' +
      '</div></article>';
  }

  function renderTimeline() {
    const key = month.getFullYear() + '-' + pad(month.getMonth() + 1);
    const monthPlans = plans.filter(function (plan) { return plan.date.indexOf(key) === 0; });
    const today = O.todayISO();

    document.querySelector('#careTabs [data-tab="all"]').textContent = 'Tất cả lịch (' + monthPlans.length + ')';
    document.querySelector('#careTabs [data-tab="upcoming"]').textContent = 'Sắp tới (' +
      monthPlans.filter(function (plan) { return plan.date >= today && plan.status !== 'cancelled'; }).length + ')';
    document.querySelector('#careTabs [data-tab="training"]').textContent = 'Huấn luyện (' +
      monthPlans.filter(function (plan) { return plan.type === 'training' && plan.status !== 'cancelled'; }).length + ')';

    let rows = monthPlans.slice();
    if (tab === 'upcoming') {
      rows = rows.filter(function (plan) { return plan.date >= today && plan.status !== 'cancelled'; });
    } else if (tab === 'training') {
      rows = rows.filter(function (plan) { return plan.type === 'training'; });
    }
    if (selectedDay) {
      rows = rows.filter(function (plan) { return plan.date === selectedDay; });
    }
    rows.sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });

    careCount.textContent = selectedDay
      ? 'Lịch ngày ' + O.fmtDate(selectedDay) + ' · ' + rows.length + ' hoạt động (bấm lại để bỏ lọc)'
      : 'Hiển thị ' + rows.length + ' hoạt động trong tháng ' + pad(month.getMonth() + 1) + '/' + month.getFullYear();

    planList.innerHTML = rows.length
      ? rows.map(planCard).join('')
      : '<div class="empty"><span class="material-symbols-outlined">event_busy</span>Chưa có lịch chăm sóc nào trong tháng này. Dùng nút “Tạo lịch nhắc / Đặt hẹn” hoặc chọn đề xuất của AI.</div>';
  }

  function renderAll() {
    renderCalendar();
    renderTimeline();
  }

  function fillPetSelect() {
    const select = document.getElementById('planPet');
    const current = select.value;
    select.innerHTML = pets.map(function (pet) {
      return '<option value="' + O.esc(pet.id) + '">' + O.esc(pet.name) + ' (' + O.esc(pet.breed || pet.speciesLabel) + ')</option>';
    }).join('');
    if (current) select.value = current;
  }

  function openNewPlan(options) {
    const opts = options || {};
    form.reset();
    fillPetSelect();
    fillTrainerSelect();
    fillTrainingServiceSelect();
    if (opts.petId) document.getElementById('planPet').value = String(opts.petId);
    if (opts.rec) {
      const rec = opts.rec;
      document.getElementById('planService').value = rec.service;
      document.getElementById('planType').value = rec.type;
      document.getElementById('planDate').value = rec.date;
      document.getElementById('planTime').value = rec.time;
      document.getElementById('planLocation').value = rec.location || '';
      document.getElementById('planProvider').value = rec.provider || '';
      document.getElementById('planNote').value = opts.note || '';
    } else {
      document.getElementById('planDate').value = addDays(14);
      document.getElementById('planTime').value = '09:00';
    }
    if (opts.type) document.getElementById('planType').value = opts.type;
    syncTypeFields();
    window.UI.open('modalNewPlan');
  }

  function setMonthOf(iso) {
    const date = new Date(iso + 'T00:00:00');
    month = monthStart(date);
    selectedDay = null;
  }

  async function createPlan(payload) {
    const row = await window.MockAPI.create('care-plans', payload);
    plans.push(row);
    setMonthOf(row.date);
    tab = 'all';
    document.querySelectorAll('#careTabs .pill-tab').forEach(function (button) {
      button.classList.toggle('active', button.dataset.tab === 'all');
    });
    renderAll();
    if (row.type === 'training') {
      try {
        await syncTrainingPlan(row);
      } catch (error) {
        console.warn('[Owner] dong bo giao an sang HLV', error);
        window.UI.toast('Lịch đã lưu nhưng chưa gửi được sang sân giáo án của HLV.', 'warn', 'cloud_off');
      }
    }
    return row;
  }

  function weeksFromDuration(duration) {
    const match = String(duration || '').match(/(\d+)\s*bu/i);
    const sessions = match ? Number(match[1]) : 0;
    return sessions >= 2 ? Math.ceil(sessions / 2) : 4;
  }

  async function syncTrainingPlan(plan) {
    return window.MockAPI.create('trainingPlans', {
      petId: String(plan.petId),
      title: plan.service,
      level: 'foundation',
      status: 'new',
      weeks: weeksFromDuration(plan.duration),
      perWeek: 2,
      week: 1,
      goals: [{ text: plan.service, state: 'todo' }],
      tags: [],
      note: 'Chủ nuôi đặt · mã ' + (plan.code || '-') + ' · ' + (plan.date || '') + ' ' + (plan.time || ''),
      homework: 0,
      exerciseIds: [],
      archived: false,
      carePlanCode: plan.code || '',
      trainerId: plan.trainerId || '',
      trainerName: plan.trainerName || plan.provider || ''
    });
  }

  async function archiveTrainingPlan(plan) {
    const rows = await window.MockAPI.list('trainingPlans', { carePlanCode: plan.code });
    const targets = (Array.isArray(rows) ? rows : []).filter(function (row) { return !row.archived; });
    for (let i = 0; i < targets.length; i++) {
      await window.MockAPI.patch('trainingPlans', targets[i].id, { archived: true });
    }
    return targets.length;
  }

  document.addEventListener('DOMContentLoaded', async function () {
    const owner = O.currentOwner();
    let loadError = null;
    try {
      const data = await Promise.all([
        O.list('pets', null, { throwOnError: true }),
        O.list('care-plans', null, { throwOnError: true }),
        O.list('accounts', null, { throwOnError: true }),
        O.list('services', null, { throwOnError: true })
      ]);
      pets = (Array.isArray(data[0]) ? data[0] : []).filter(function (pet) {
        return O.belongsToOwner(pet, owner);
      });
      const petIds = pets.map(function (pet) { return String(pet.id); });
      plans = (Array.isArray(data[1]) ? data[1] : []).filter(function (plan) {
        return petIds.indexOf(String(plan.petId)) !== -1;
      });
      trainers = (Array.isArray(data[2]) ? data[2] : []).filter(function (account) {
        return account.role === 'trainer' && account.status === 'active';
      });
      trainingServices = (Array.isArray(data[3]) ? data[3] : []).filter(function (service) {
        return service.cat === 'hl' && service.active !== false && !service.hidden;
      });
      aiPetId = pets.length ? pets[0].id : null;
    } catch (error) {
      console.error('[Owner] care', error);
      loadError = error;
      pets = [];
      plans = [];
      trainers = [];
      trainingServices = [];
      aiPetId = null;
    }

    const upcoming = plans.slice()
      .filter(function (plan) { return plan.date >= O.todayISO() && plan.status !== 'cancelled'; })
      .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); })[0];
    month = monthStart(upcoming ? new Date(upcoming.date + 'T00:00:00') : new Date());

    renderAiPets();
    renderAi();
    renderAll();

    if (loadError) {
      careCount.textContent = 'Không tải được lịch chăm sóc';
      planList.innerHTML = '<div class="empty"><span class="material-symbols-outlined">cloud_off</span>' +
        O.esc(loadError.message || 'Không tải được lịch chăm sóc.') +
        '<button class="btn btn-outline" type="button" data-retry-care style="margin-top:12px">Thử lại</button></div>';
      window.UI.toast(loadError.message || 'Không tải được lịch chăm sóc từ mock API.', 'err', 'cloud_off');
    }

    aiPets.addEventListener('click', function (event) {
      const button = event.target.closest('[data-pet]');
      if (!button) return;
      aiPetId = button.dataset.pet;
      renderAiPets();
      renderAi();
    });

    aiServices.addEventListener('click', function (event) {
      const button = event.target.closest('[data-service]');
      if (!button) return;
      aiService = button.dataset.service;
      renderAi();
    });

    document.getElementById('btnAiAccept').addEventListener('click', async function () {
      const rec = currentRec();
      const pet = O.petById(pets, aiPetId);
      if (!pet.id) return;
      const duplicate = plans.some(function (plan) {
        return String(plan.petId) === String(aiPetId) && plan.service === rec.service && plan.date === rec.date;
      });
      if (duplicate) {
        window.UI.toast('Lịch này đã có trong danh sách chăm sóc của ' + pet.name + '.', 'info', 'event_available');
        return;
      }
      try {
        await createPlan({
          code: '#AI-' + rec.date.replace(/-/g, '') + '-' + rec.time.replace(':', ''),
          petId: String(aiPetId), petName: pet.name,
          service: rec.service, type: rec.type,
          typeLabel: O.TYPE_META[rec.type].label, icon: O.TYPE_META[rec.type].icon,
          date: rec.date, time: rec.time, duration: rec.type === 'medication' ? '5 phút' : '45 phút',
          location: rec.location, provider: rec.provider,
          status: 'pending', statusLabel: 'AI đề xuất',
          note: 'Tạo tự động từ AI Care Assistant'
        });
        window.UI.toast('AI đã thêm lịch cho ' + pet.name + ' vào ' + O.fmtDate(rec.date) + '.', 'ok', 'auto_awesome');
      } catch (error) {
        console.error('[Owner] create AI plan', error);
        window.UI.toast('Không lưu được lịch. Kiểm tra mock API đang chạy.', 'err', 'error');
      }
    });

    document.getElementById('btnAiModify').addEventListener('click', function () {
      openNewPlan({ petId: aiPetId, rec: currentRec(), note: 'Điều chỉnh từ đề xuất AI' });
    });

    document.getElementById('btnAiDismiss').addEventListener('click', function () {
      document.getElementById('ai').style.display = 'none';
      window.UI.toast('Đã ẩn đề xuất AI. Bạn vẫn có thể tạo lịch thủ công.', 'info', 'visibility_off');
    });

    document.querySelectorAll('[data-open="modalNewPlan"]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (!document.getElementById('planService').value) {
          fillPetSelect();
          fillTrainerSelect();
          fillTrainingServiceSelect();
          document.getElementById('planDate').value = addDays(14);
          document.getElementById('planTime').value = '09:00';
        }
        syncTypeFields();
      });
    });

    document.getElementById('btnBookTrainer').addEventListener('click', function () {
      openNewPlan({ type: 'training' });
    });

    document.getElementById('planType').addEventListener('change', syncTypeFields);

    document.getElementById('planTrainer').addEventListener('change', function () {
      const trainer = trainerById(this.value);
      const location = document.getElementById('planLocation');
      if (trainer.id && (!location.value.trim() || location.value === TRAINING_LOCATION)) {
        location.value = trainer.petsLabel || TRAINING_LOCATION;
      }
      updateTrainerHint();
    });

    document.getElementById('planTrainingService').addEventListener('change', updateTrainingServiceHint);

    document.getElementById('calPrev').addEventListener('click', function () {
      month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
      selectedDay = null;
      renderAll();
    });

    document.getElementById('calNext').addEventListener('click', function () {
      month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      selectedDay = null;
      renderAll();
    });

    calGrid.addEventListener('click', function (event) {
      const button = event.target.closest('[data-date]');
      if (!button) return;
      const iso = button.dataset.date;
      const date = new Date(iso + 'T00:00:00');
      if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
        month = monthStart(date);
        selectedDay = iso;
      } else {
        selectedDay = selectedDay === iso ? null : iso;
      }
      renderAll();
    });

    document.getElementById('careTabs').addEventListener('click', function (event) {
      const button = event.target.closest('.pill-tab');
      if (!button) return;
      document.querySelectorAll('#careTabs .pill-tab').forEach(function (pill) { pill.classList.remove('active'); });
      button.classList.add('active');
      tab = button.dataset.tab;
      renderTimeline();
    });

    planList.addEventListener('click', async function (event) {
      if (event.target.closest('[data-retry-care]')) { window.location.reload(); return; }
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const plan = plans.find(function (row) { return String(row.id) === String(button.dataset.id); });
      if (!plan) return;

      if (button.dataset.action === 'detail') {
        const note = plan.note ? ' · ' + plan.note : '';
        const trainerInfo = plan.type === 'training' && plan.trainerName
          ? ' · HLV: ' + plan.trainerName + (plan.trainerPhone ? ' (' + plan.trainerPhone + ')' : '')
          : '';
        window.UI.toast('Mã QR tiếp nhận: ' + (plan.code || '—') + trainerInfo + note, 'info', 'qr_code_2');
        return;
      }

      if (button.dataset.action === 'cancel') {
        if (!window.confirm('Hủy lịch "' + plan.service + '" của ' + plan.petName + '?')) return;
        try {
          const updated = await window.MockAPI.patch('care-plans', plan.id, { status: 'cancelled', statusLabel: 'Đã hủy' });
          Object.assign(plan, updated, { status: 'cancelled', statusLabel: 'Đã hủy' });
          renderAll();
          if (plan.type === 'training') {
            try {
              await archiveTrainingPlan(plan);
            } catch (error) {
              console.warn('[Owner] luu giao an da huy', error);
            }
          }
          window.UI.toast('Đã hủy lịch. Gọi 1900 8899 nếu cần dời sang ngày khác.', 'warn', 'event_busy');
        } catch (error) {
          console.error('[Owner] cancel plan', error);
          window.UI.toast('Không cập nhật được lịch.', 'err', 'error');
        }
      }
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const pet = O.petById(pets, data.get('petId'));
      const type = String(data.get('type') || 'medical');
      const isTraining = type === 'training';
      const date = String(data.get('date') || '');
      const time = String(data.get('time') || '');
      let service = '';
      let provider = '';
      let location = '';
      let duration = type === 'medication' ? '5 phút' : '45 phút';
      let extra = {};

      if (isTraining) {
        const trainer = trainerById(data.get('trainerId'));
        const serviceRow = trainingServiceById(data.get('trainingService'));
        if (!trainer.id || !serviceRow.id) {
          window.UI.toast('Chọn huấn luyện viên và gói huấn luyện trước khi lưu.', 'info', 'sports_score');
          return;
        }
        service = String(serviceRow.name || '').trim();
        provider = trainer.name;
        location = String(data.get('location') || '').trim() || trainer.petsLabel || TRAINING_LOCATION;
        duration = serviceRow.duration || '45 phút';
        extra = {
          trainerId: String(trainer.id),
          trainerName: trainer.name,
          trainerEmail: trainer.email || '',
          trainerPhone: trainer.phone || '',
          serviceCode: serviceRow.sku || '',
          servicePrice: serviceRow.price || 0,
          category: 'hl'
        };
      } else {
        service = String(data.get('service') || '').trim();
        provider = String(data.get('provider') || '').trim() || 'BS. Trần Văn Minh';
        location = String(data.get('location') || '').trim() || DEFAULT_LOCATION;
      }

      if (!pet.id || !service || !date || !time) return;

      try {
        const row = await createPlan(Object.assign({
          code: (isTraining ? '#TRN-' : '#PC-') + date.replace(/-/g, '') + '-' + time.replace(':', ''),
          petId: String(pet.id), petName: pet.name,
          service: service, type: type,
          typeLabel: O.TYPE_META[type].label, icon: O.TYPE_META[type].icon,
          date: date, time: time, duration: duration,
          location: location,
          provider: provider,
          status: isTraining ? 'pending' : 'confirmed',
          statusLabel: isTraining ? 'Chờ HLV xác nhận' : 'Đã xác nhận',
          note: String(data.get('note') || '').trim()
        }, extra));
        window.UI.close('modalNewPlan');
        form.reset();
        syncTypeFields();
        window.UI.toast(isTraining
          ? 'Đã gửi yêu cầu đặt lịch với ' + row.provider + ' cho ' + row.petName + ' vào ' + O.fmtDate(row.date) + '.'
          : 'Đã lưu lịch cho ' + row.petName + ' vào ' + O.fmtDate(row.date) + '.', 'ok', isTraining ? 'sports_score' : 'event_available');
      } catch (error) {
        console.error('[Owner] create plan', error);
        window.UI.toast('Không lưu được lịch. Kiểm tra mock API đang chạy.', 'err', 'error');
      }
    });

    const petParam = O.queryParam('pet');
    if (petParam) openNewPlan({ petId: petParam });
  });
})();
