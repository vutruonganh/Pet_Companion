/* ============================================
   PROVIDER APPOINTMENT LIST - JavaScript
   Danh sách ca hẹn & Tiếp nhận
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // 1. DATA - Ca hẹn dùng chung bảng appointments
  // ==========================================
  let appointments = [];

  const tbody = document.querySelector('.custom-table tbody');
  const searchInput = document.querySelector('.search-input');
  const statusFilter = document.querySelectorAll('.filter-select')[0];
  const serviceFilter = document.querySelectorAll('.filter-select')[1];
  const totalLabel = document.getElementById('totalCount');
  const PLACEHOLDER = 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function stateRow(kind, msg) {
    const isError = kind === 'error';
    return `<tr><td colspan="7" style="padding:26px;text-align:center;color:${isError ? 'var(--rose)' : 'var(--muted)'}">
      <span class="material-symbols-outlined" style="font-size:30px">${isError ? 'error' : kind === 'empty' ? 'inbox' : 'progress_activity'}</span>
      <div style="margin:6px 0 10px">${esc(msg)}</div>
      ${isError ? '<button class="btn btn-primary btn-sm" data-retry>Thử lại</button>' : ''}
    </td></tr>`;
  }

  function showState(kind, msg) {
    tbody.innerHTML = stateRow(kind, msg);
    totalLabel.textContent = kind === 'error' ? 'Không tải được dữ liệu' : kind === 'empty' ? 'Tổng cộng: 0 ca' : 'Đang tải ca hẹn...';
  }

  /* Ánh xạ trạng thái chuẩn của bảng appointments sang góc nhìn provider */
  function viewOf(apt) {
    switch (apt.status) {
      case 'urgent':
        return { status: 'urgent', badge: 'badge-urgent', text: apt.statusText || 'CẤP CỨU', action: apt.action || 'receive' };
      case 'pending':
        return { status: 'pending', badge: 'badge-pending', text: apt.statusText || 'Chờ tiếp nhận', action: 'sms' };
      case 'approved':
        return { status: 'pending', badge: 'badge-pending', text: 'Đã duyệt – chờ tiếp nhận', action: 'receive' };
      case 'processing':
      case 'in-progress':
        return { status: 'in-progress', badge: 'badge-in-progress', text: apt.statusText || 'Đang thực hiện', action: apt.action || 'note' };
      case 'completed':
        return { status: 'completed', badge: 'badge-completed', text: 'Đã hoàn thành', action: 'complete' };
      case 'cancelled':
        return { status: 'cancelled', badge: 'badge-urgent', text: 'Đã hủy', action: '' };
      default:
        return { status: 'pending', badge: 'badge-pending', text: apt.statusText || 'Chờ tiếp nhận', action: 'sms' };
    }
  }

  // ==========================================
  // 2. RENDER TABLE - Vẽ lại bảng
  // ==========================================
  function getStatusBadge(view) {
    return `<span class="badge ${view.badge}">${esc(view.text)}</span>`;
  }

  function getActionButton(apt, view) {
    switch (view.action) {
      case 'receive':
        return `<button class="btn btn-primary btn-sm btn-receive" data-id="${esc(apt.code)}">Tiếp nhận ngay</button>`;
      case 'note':
        return `<a class="btn btn-outline btn-sm" href="provider-service-note.html">Mở biên bản AI</a>`;
      case 'photo':
        return `<button class="btn btn-outline btn-sm btn-photo" data-id="${esc(apt.code)}">Cập nhật ảnh</button>`;
      case 'sms':
        return `<button class="btn btn-outline btn-sm btn-sms" data-id="${esc(apt.code)}">Gửi SMS nhắc</button>`;
      case 'complete':
        return `<button class="btn btn-outline btn-sm btn-complete" data-id="${esc(apt.code)}">Xem kết quả</button>`;
      default:
        return '';
    }
  }

  function renderTable(data) {
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = stateRow('empty', 'Không tìm thấy ca hẹn nào phù hợp.');
      totalLabel.textContent = 'Tổng cộng: 0 ca';
      return;
    }

    data.forEach(apt => {
      const view = viewOf(apt);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="apt-code">${esc(apt.code)}</td>
        <td>
          <div class="pet-cell">
            <img alt="${esc(apt.pet)}" class="pet-thumb" src="${esc(apt.img || PLACEHOLDER)}">
            <div>
              <div class="cell-strong">${esc(apt.pet)}</div>
              <div class="cell-meta">${esc(apt.owner)} • ${esc(apt.phone)}</div>
            </div>
          </div>
        </td>
        <td>${view.status === 'urgent' ? '<strong>' + esc(apt.service) + '</strong>' : esc(apt.service)}</td>
        <td>${view.status === 'urgent' ? '<strong class="time-urgent">' + esc(apt.time) + '</strong>' : esc(apt.time)}</td>
        <td>${esc(apt.room || 'Chưa phân phòng')}</td>
        <td>${getStatusBadge(view)}</td>
        <td>
          <div class="action-btns">${getActionButton(apt, view)}</div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    totalLabel.textContent = `Tổng cộng: ${data.length} ca trong ngày`;
  }

  // ==========================================
  // 3. FILTER & SEARCH - Lọc và tìm kiếm
  // ==========================================
  function getFilteredData() {
    let data = [...appointments];

    // Search text
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      data = data.filter(apt =>
        String(apt.pet || '').toLowerCase().includes(query) ||
        String(apt.owner || '').toLowerCase().includes(query) ||
        String(apt.code || '').toLowerCase().includes(query) ||
        String(apt.service || '').toLowerCase().includes(query) ||
        String(apt.phone || '').toLowerCase().includes(query)
      );
    }

    // Status filter
    const statusVal = statusFilter.value;
    if (statusVal !== 'Tất cả trạng thái') {
      const statusMap = {
        'Chờ tiếp nhận': 'pending',
        'Đang thực hiện': 'in-progress',
        'Đã hoàn thành': 'completed',
        'Khẩn cấp': 'urgent'
      };
      const filterStatus = statusMap[statusVal];
      if (filterStatus) {
        data = data.filter(apt => viewOf(apt).status === filterStatus);
      }
    }

    // Service filter
    const serviceVal = serviceFilter.value;
    if (serviceVal !== 'Tất cả dịch vụ') {
      const serviceMap = {
        'Khám bệnh thú y': ['Khám', 'Cấp cứu', 'Tẩy giun'],
        'Tiêm phòng định kỳ': ['Tiêm phòng'],
        'Spa & Tắm cắt tỉa': ['Spa', 'tắm', 'Grooming']
      };
      const keywords = serviceMap[serviceVal] || [];
      if (keywords.length) {
        data = data.filter(apt =>
          keywords.some(kw => String(apt.service || '').toLowerCase().includes(kw.toLowerCase()))
        );
      }
    }

    return data;
  }

  // Search input - live search
  let searchTimer;
  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderTable(getFilteredData()), 200);
  });

  // Filter selects
  statusFilter.addEventListener('change', () => renderTable(getFilteredData()));
  serviceFilter.addEventListener('change', () => renderTable(getFilteredData()));

  // ==========================================
  // 4. ACTION BUTTONS - Các nút thao tác
  // ==========================================
  tbody.addEventListener('click', function (e) {
    if (e.target.closest('[data-retry]')) { loadAppointments(); return; }

    const receiveBtn = e.target.closest('.btn-receive');
    if (receiveBtn) {
      const id = receiveBtn.dataset.id;
      const apt = appointments.find(a => a.code === id);
      if (!apt) return;

      showConfirm(
        'Tiếp nhận ca ' + id,
        `Xác nhận tiếp nhận ca khẩn cấp cho <strong>${esc(apt.pet)}</strong>?<br>Chủ nuôi: ${esc(apt.owner)}`,
        () => {
          apt.status = 'processing';
          apt.statusText = 'Đang xử lý cấp cứu';
          apt.action = 'note';
          renderTable(getFilteredData());
          ProviderUI.toast(`Đã tiếp nhận ca ${id} thành công!`, 'success');

          if (window.MockAPI && apt.id) {
            MockAPI.patch('appointments', apt.id, {
              status: 'processing',
              statusText: 'Đang xử lý cấp cứu',
              action: 'note',
              timeSub: 'Đang xử lý tại phòng khám',
              timeSubColor: 'var(--teal-dark)'
            }).catch(err => {
              console.warn('[MockAPI]', err.message);
              ProviderUI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'warning');
            });
          }
        }
      );
      return;
    }

    const smsBtn = e.target.closest('.btn-sms');
    if (smsBtn) {
      const id = smsBtn.dataset.id;
      const apt = appointments.find(a => a.code === id);
      if (!apt) return;

      showConfirm(
        'Gửi SMS nhắc hẹn',
        `Gửi tin nhắn nhắc hẹn đến <strong>${esc(apt.owner)}</strong> (${esc(apt.phone)})?<br><br><em>"Xin chào ${esc(apt.owner)}, nhắc bạn lịch hẹn ${esc(apt.service)} cho bé ${esc(String(apt.pet).split('(')[0].trim())} lúc ${esc(apt.time)} tại ${esc(apt.room)}. PetCompanion."</em>`,
        () => {
          ProviderUI.toast(`Đã gửi SMS nhắc hẹn đến ${apt.phone} thành công!`, 'success');
        }
      );
      return;
    }

    const photoBtn = e.target.closest('.btn-photo');
    if (photoBtn) {
      const id = photoBtn.dataset.id;
      const apt = appointments.find(a => a.code === id);
      if (!apt) return;
      ProviderUI.toast(`Chức năng cập nhật ảnh cho ca ${id} (${apt.pet}) - Đang mở camera...`, 'info');
      return;
    }

    if (e.target.closest('.btn-complete')) {
      window.location.href = 'provider-service-note.html';
    }
  });

  // ==========================================
  // 5. HEADER BUTTONS
  // ==========================================
  // In danh sách ngày
  const printBtn = document.getElementById('btnPrint');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      ProviderUI.toast('Đang chuẩn bị in danh sách ca hẹn...', 'info');
      setTimeout(() => window.print(), 500);
    });
  }

  // Tiếp nhận trực tiếp (Walk-in)
  const walkInBtn = document.getElementById('btnWalkIn');
  if (walkInBtn) {
    walkInBtn.addEventListener('click', function () {
      showWalkInModal();
    });
  }

  function showWalkInModal() {
    const overlay = ProviderUI.modal({
      id: 'walkInModal',
      icon: 'directions_walk',
      title: 'Tiếp nhận trực tiếp (Walk-in)',
      width: '520px',
      body: `
        <div class="f-group">
          <label class="f-label">Tên thú cưng *</label>
          <input class="f-input" id="wiPet" type="text" placeholder="VD: Buddy, Mimi...">
        </div>
        <div class="f-group">
          <label class="f-label">Giống loài</label>
          <input class="f-input" id="wiBreed" type="text" placeholder="VD: Corgi, Mèo Ba Tư...">
        </div>
        <div class="f-group">
          <label class="f-label">Chủ nuôi *</label>
          <input class="f-input" id="wiOwner" type="text" placeholder="Họ tên chủ nuôi">
        </div>
        <div class="f-group">
          <label class="f-label">Số điện thoại *</label>
          <input class="f-input" id="wiPhone" type="tel" placeholder="0912.xxx.xxx">
        </div>
        <div class="f-group">
          <label class="f-label">Dịch vụ yêu cầu *</label>
          <select class="f-input" id="wiService">
            <option value="">-- Chọn dịch vụ --</option>
            <option>Khám bệnh thú y</option>
            <option>Tiêm phòng định kỳ</option>
            <option>Spa & Tắm cắt tỉa</option>
            <option>Cấp cứu</option>
          </select>
        </div>
        <div class="f-group" style="margin-bottom:0">
          <label class="f-label">Triệu chứng / Ghi chú</label>
          <textarea class="f-input" id="wiNote" placeholder="Mô tả triệu chứng hoặc yêu cầu..."></textarea>
        </div>
      `,
      footer: `
        <button class="btn btn-outline" data-close="walkInModal">Hủy</button>
        <button class="btn btn-primary" id="saveWalkIn">Tiếp nhận & Phân phòng</button>
      `
    });

    overlay.querySelector('#saveWalkIn').addEventListener('click', async function () {
      const pet = document.getElementById('wiPet').value.trim();
      const breed = document.getElementById('wiBreed').value.trim();
      const owner = document.getElementById('wiOwner').value.trim();
      const phone = document.getElementById('wiPhone').value.trim();
      const service = document.getElementById('wiService').value;

      if (!pet || !owner || !phone || !service) {
        ProviderUI.toast('Vui lòng điền đầy đủ thông tin bắt buộc (*).', 'warning');
        return;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} (Walk-in)`;
      const isUrgent = service.includes('Cấp cứu');
      const newId = `#APT-${Math.floor(1050 + Math.random() * 100)}`;
      const serviceChip = isUrgent ? 'chip-rose' : service.includes('Spa') ? 'chip-pink' : 'chip-mint';

      const roomMap = {
        'Khám bệnh thú y': 'Phòng Khám 01 (BS. Mai)',
        'Tiêm phòng định kỳ': 'Phòng Tiêm chủng (BS. Minh)',
        'Spa & Tắm cắt tỉa': 'Khu Spa (KTV. Linh Đan)',
        'Cấp cứu': 'Phòng Khám 01 (BS. Mai)'
      };

      const newApt = {
        code: newId,
        pet: `${pet}${breed ? ' (' + breed + ')' : ''}`,
        owner: owner,
        phone: phone,
        service: service,
        serviceChip: serviceChip,
        time: timeStr,
        timeSub: isUrgent ? 'Walk-in ưu tiên' : 'Walk-in tiếp nhận',
        timeSubColor: isUrgent ? 'var(--rose)' : '',
        room: roomMap[service] || 'Phòng Khám 01 (BS. Mai)',
        partner: 'PetCompanion Provider',
        status: isUrgent ? 'urgent' : 'pending',
        statusText: isUrgent ? 'Cấp cứu' : 'Chờ duyệt',
        action: isUrgent ? 'receive' : 'sms',
        img: PLACEHOLDER
      };

      this.disabled = true;
      let saved = null;
      if (window.MockAPI) {
        try {
          saved = await MockAPI.create('appointments', newApt);
        } catch (err) {
          console.warn('[MockAPI]', err.message);
          this.disabled = false;
          ProviderUI.toast('Không kết nối được mock API — ca hẹn chỉ lưu tạm trên giao diện.', 'warning');
        }
      }

      appointments.unshift(saved || newApt);
      overlay.remove();
      renderTable(getFilteredData());
      ProviderUI.toast(`Đã tiếp nhận Walk-in: ${pet} (${owner}) - Mã: ${newId}`, 'success');
    });
  }

  // ==========================================
  // 6. CONFIRM DIALOG
  // ==========================================
  function showConfirm(title, message, onConfirm) {
    const overlay = ProviderUI.modal({
      id: 'confirmModal',
      icon: 'help',
      title: title,
      width: '460px',
      body: `<p class="confirm-text">${message}</p>`,
      footer: `
        <button class="btn btn-outline" data-close="confirmModal">Hủy</button>
        <button class="btn btn-primary" id="confirmBtn">Xác nhận</button>
      `
    });

    overlay.querySelector('#confirmBtn').addEventListener('click', function () {
      overlay.remove();
      onConfirm();
    });
  }

  // ==========================================
  // INIT - Tải dữ liệu dùng chung từ mock API
  // ==========================================
  async function loadAppointments() {
    showState('loading', 'Đang tải danh sách ca hẹn...');
    if (!window.MockAPI) {
      showState('error', 'Thiếu core/api.js nên chưa kết nối được mock API.');
      return;
    }
    try {
      const data = await MockAPI.list('appointments');
      if (!Array.isArray(data)) throw new Error('Dữ liệu ca hẹn không hợp lệ.');
      appointments = data;
      renderTable(getFilteredData());
    } catch (err) {
      console.warn('[MockAPI] appointments:', err.message);
      appointments = [];
      showState('error', err.message || 'Không tải được danh sách ca hẹn.');
      ProviderUI.toast('Không tải được ca hẹn từ mock API.', 'warning');
    }
  }

  loadAppointments();

});
