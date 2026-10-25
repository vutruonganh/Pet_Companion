(function () {
  'use strict';
  const O = window.Owner;

  const tbody = document.getElementById('recordsBody');
  const search = document.getElementById('recSearch');
  const petSelect = document.getElementById('recPet');
  const typeSelect = document.getElementById('recType');
  const periodSelect = document.getElementById('recPeriod');
  const detail = document.getElementById('recordDetail');

  let records = [];
  let pets = [];
  let currentId = null;
  let loadFailed = false;

  function visibleRecords() {
    const query = (search.value || '').trim().toLowerCase();
    const pet = petSelect.value;
    const type = typeSelect.value;
    const period = periodSelect.value;

    return records.filter(function (record) {
      const haystack = [record.code, record.service, record.serviceSub, record.doctor, record.provider, record.petName, record.typeLabel]
        .join(' ').toLowerCase();
      return (!query || haystack.indexOf(query) !== -1) &&
        (pet === 'all' || String(record.petId) === pet) &&
        (type === 'all' || record.type === type) &&
        (period === 'all' || record.date.indexOf(period) === 0);
    });
  }

  function row(record) {
    const pet = O.petById(pets, record.petId);
    const secondary = record.type === 'vet'
      ? { action: 'rating', icon: 'star', label: 'Đánh giá' }
      : record.type === 'spa'
        ? { action: 'rebook', icon: 'restart_alt', label: 'Đặt lại' }
        : { action: 'training', icon: 'menu_book', label: 'Nhật ký' };

    return '<tr data-id="' + O.esc(record.id) + '">' +
      '<td><span class="code-badge">#' + O.esc(record.code) + '</span></td>' +
      '<td><div class="pet-pill">' + O.avatar(pet) + '<span>' + O.esc(record.petName) + '</span></div></td>' +
      '<td><div class="svc-title">' + O.esc(record.service) + '</div><div class="svc-sub">' + O.esc(record.serviceSub || '') + '</div></td>' +
      '<td><div class="provider-name">' + O.esc(record.provider) + '</div><div class="doctor-name">' + O.esc(record.doctor) + '</div></td>' +
      '<td><span style="font-weight:600">' + O.fmtDate(record.date) + '</span><div class="svc-sub">' + O.esc(record.time) + '</div></td>' +
      '<td><span class="price-tag">' + O.money(record.cost) + '</span></td>' +
      '<td><span class="status-pill"><i></i>' + O.esc(record.statusLabel) + '</span></td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-sm" type="button" data-action="detail" data-id="' + O.esc(record.id) + '">' +
          '<span class="material-symbols-outlined" style="font-size:15px">clinical_notes</span>Xem hồ sơ</button>' +
        '<button class="btn-sm ghost" type="button" data-action="' + secondary.action + '" data-id="' + O.esc(record.id) + '">' +
          '<span class="material-symbols-outlined" style="font-size:15px">' + secondary.icon + '</span>' + secondary.label + '</button>' +
      '</div></td></tr>';
  }

  function renderDetail(record) {
    if (!record) {
      detail.innerHTML = '<div class="empty"><span class="material-symbols-outlined">folder_off</span>Không có hồ sơ phù hợp với bộ lọc hiện tại.</div>';
      currentId = null;
      return;
    }
    currentId = record.id;
    const pet = O.petById(pets, record.petId);
    const prescriptions = (record.prescriptions || []).length
      ? '<div class="rec-block"><h3><span class="material-symbols-outlined">medication</span>Đơn thuốc điện tử &amp; liều lượng điều trị</h3>' +
        '<ul class="presc-list">' + record.prescriptions.map(function (item) {
          return '<li class="presc-item"><div><div class="presc-name">' + O.esc(item.name) + '</div>' +
            '<div class="presc-note">' + O.esc(item.note || '') + '</div></div>' +
            '<span class="presc-dose">' + O.esc(item.dosage) + '</span></li>';
        }).join('') + '</ul></div>'
      : '';

    const files = (record.files || []).length
      ? record.files.map(function (file) {
        return '<a class="file-card" href="#" data-file="' + O.esc(file.name) + '">' +
          '<span class="file-icon"><span class="material-symbols-outlined">' + O.esc(file.icon || 'description') + '</span></span>' +
          '<span class="file-meta"><span class="file-title">' + O.esc(file.name) + '</span>' +
          '<span class="file-sub">' + O.esc(file.meta) + '</span></span>' +
          '<span class="material-symbols-outlined" style="color:var(--teal-dark);font-size:20px">download</span></a>';
      }).join('')
      : '<p class="mini-text" style="margin:0">Không có tệp đính kèm cho hồ sơ này.</p>';

    const recheck = record.recheck
      ? '<div class="recheck-box"><b><span class="material-symbols-outlined">alarm_on</span>Lịch tái khám dự kiến</b>' +
        'Hệ thống đã kích hoạt nhắc hẹn tự động vào ngày <strong>' + O.esc(record.recheck) + '</strong>.</div>'
      : '';

    const resultTitle = record.type === 'vet' ? 'Kết luận chẩn đoán của bác sĩ'
      : record.type === 'spa' ? 'Kết quả &amp; nhận xét dịch vụ' : 'Kết quả huấn luyện';
    const adviceTitle = record.type === 'vet' ? 'Lời dặn dò từ ' + (record.doctor || 'bác sĩ') : 'Ghi chú dịch vụ';

    detail.innerHTML =
      '<div class="rec-detail-head">' +
        '<div>' +
          '<div class="meta-row"><span class="chip chip-mint">Biên bản điện tử</span>' +
            '<span class="code-badge">#' + O.esc(record.code) + '</span>' +
            '<span class="status-pill"><i></i>' + O.esc(record.statusLabel) + '</span>' +
            '<span>' + O.fmtDate(record.date) + ' · ' + O.esc(record.time) + '</span></div>' +
          '<h2 class="rec-detail-title">' + O.esc(record.summary || record.service) + '</h2>' +
          '<div class="meta-row" style="margin:10px 0 0">' + O.avatar(pet, 'doc-avatar') +
            '<span>Bé ' + O.esc(record.petName) + ' · ' + O.esc(record.provider) + '</span></div>' +
        '</div>' +
        '<button class="btn btn-outline" type="button" data-print>' +
          '<span class="material-symbols-outlined">print</span>In bệnh án</button>' +
      '</div>' +
      '<div class="rec-detail-grid">' +
        '<div>' +
          '<div class="rec-block"><h3><span class="material-symbols-outlined">stethoscope</span>' + resultTitle + '</h3>' +
            '<p>' + O.esc(record.diagnosis) + '</p></div>' +
          prescriptions +
          '<div class="rec-block"><h3><span class="material-symbols-outlined">tips_and_updates</span>' + O.esc(adviceTitle) + '</h3>' +
            '<div class="advice-box">' + O.esc(record.advice) + '</div></div>' +
        '</div>' +
        '<div>' +
          '<h3 class="rec-side-title"><span class="material-symbols-outlined" style="font-size:18px;color:var(--teal)">attach_file</span>Tài liệu &amp; kết quả</h3>' +
          files + recheck +
        '</div>' +
      '</div>';
  }

  function renderTable() {
    if (loadFailed) return;
    const rows = visibleRecords();
    tbody.innerHTML = rows.length
      ? rows.map(row).join('')
      : '<tr><td colspan="8"><div class="empty"><span class="material-symbols-outlined">search_off</span>Không tìm thấy hồ sơ phù hợp với bộ lọc.</div></td></tr>';

    const keep = rows.find(function (item) { return String(item.id) === String(currentId); });
    renderDetail(keep || rows[0] || null);
  }

  function renderStats() {
    const total = records.reduce(function (sum, item) { return sum + Number(item.cost || 0); }, 0);
    document.getElementById('statRecords').innerHTML = records.length + ' <small>lượt</small>';
    document.getElementById('statCost').innerHTML = total.toLocaleString('vi-VN') + ' <small>đ</small>';
  }

  document.addEventListener('DOMContentLoaded', async function () {
    const owner = O.currentOwner();
    let loadError = null;
    try {
      const data = await Promise.all([
        O.list('medical-records', null, { throwOnError: true }),
        O.list('pets', null, { throwOnError: true })
      ]);
      pets = (Array.isArray(data[1]) ? data[1] : []).filter(function (pet) {
        return O.belongsToOwner(pet, owner);
      });
      const petIds = pets.map(function (pet) { return String(pet.id); });
      records = (Array.isArray(data[0]) ? data[0] : [])
        .filter(function (record) { return petIds.indexOf(String(record.petId)) !== -1; })
        .sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    } catch (error) {
      console.error('[Owner] records', error);
      loadError = error;
      loadFailed = true;
      records = [];
      pets = [];
    }

    petSelect.innerHTML = '<option value="all">Tất cả thú cưng</option>' + pets.map(function (pet) {
      return '<option value="' + O.esc(pet.id) + '">Bé ' + O.esc(pet.name) + ' (' + O.esc(pet.breed || pet.speciesLabel) + ')</option>';
    }).join('');

    const petParam = O.queryParam('pet');
    if (petParam && pets.some(function (pet) { return String(pet.id) === String(petParam); })) {
      petSelect.value = String(petParam);
    }

    renderStats();
    if (loadError) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty">' +
        '<span class="material-symbols-outlined">cloud_off</span>' +
        O.esc(loadError.message || 'Không tải được hồ sơ dịch vụ.') +
        '<button class="btn btn-outline" type="button" data-retry-records style="margin-top:12px">Thử lại</button>' +
        '</div></td></tr>';
      detail.innerHTML = '<div class="empty"><span class="material-symbols-outlined">cloud_off</span>Không tải được hồ sơ dịch vụ từ mock API.</div>';
      window.UI.toast(loadError.message || 'Không tải được hồ sơ dịch vụ từ mock API.', 'err', 'cloud_off');
    } else {
      renderTable();
    }

    search.addEventListener('input', renderTable);
    petSelect.addEventListener('change', renderTable);
    typeSelect.addEventListener('change', renderTable);
    periodSelect.addEventListener('change', renderTable);

    tbody.addEventListener('click', function (event) {
      if (event.target.closest('[data-retry-records]')) { window.location.reload(); return; }
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const record = records.find(function (item) { return String(item.id) === String(button.dataset.id); });
      if (!record) return;

      if (button.dataset.action === 'rating') {
        window.UI.toast('Cảm ơn bạn! Mở biểu mẫu đánh giá cho phiếu #' + record.code + '.', 'info', 'star');
        return;
      }
      if (button.dataset.action === 'rebook') {
        window.location.href = 'owner-care.html?pet=' + encodeURIComponent(record.petId);
        return;
      }
      if (button.dataset.action === 'training') {
        renderDetail(record);
        detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.UI.toast('Đã mở nhật ký huấn luyện #' + record.code + '.', 'ok', 'menu_book');
        return;
      }
      renderDetail(record);
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    detail.addEventListener('click', function (event) {
      if (event.target.closest('[data-print]')) {
        window.print();
        return;
      }
      const file = event.target.closest('[data-file]');
      if (file) {
        event.preventDefault();
        window.UI.toast('Bản demo chưa kèm tệp thật: ' + file.dataset.file, 'info', 'description');
      }
    });

    document.getElementById('btnExportJson').addEventListener('click', function () {
      O.downloadJSON('PetCompanion_Service_Records.json', records);
      window.UI.toast('Đã xuất ' + records.length + ' hồ sơ ra JSON.', 'ok', 'download');
    });

    document.getElementById('btnExportPdf').addEventListener('click', function () {
      window.UI.toast('Đang chuẩn bị gói PDF hóa đơn & bệnh án. Bản demo dùng “In bệnh án” để xuất PDF.', 'info', 'picture_as_pdf');
    });
  });
})();
