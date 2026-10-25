/* ============================================
   PROVIDER APPOINTMENT LIST - JavaScript
   Danh sách ca hẹn & Tiếp nhận
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // 1. DATA - Dữ liệu ca hẹn
  // ==========================================
  const appointments = [
    {
      id: '#APT-1049',
      pet: 'Miu Miu (Mèo Anh)',
      owner: 'Trần Minh Anh',
      phone: '0912.443.xxx',
      service: 'Cấp cứu hô hấp khẩn',
      time: '10:30 Hôm nay',
      room: 'Phòng Khám 01 (BS. Mai)',
      status: 'urgent',
      statusText: '⚠️ CẤP CỨU',
      action: 'receive',
      img: 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg'
    },
    {
      id: '#APT-1048',
      pet: 'Milo (Golden Retriever)',
      owner: 'Nguyễn Văn An',
      phone: '0912.345.xxx',
      service: 'Khám tổng quát & Tẩy giun',
      time: '08:30 (Đã check-in)',
      room: 'Phòng Khám 01 (BS. Mai)',
      status: 'in-progress',
      statusText: 'Đang khám lâm sàng',
      action: 'note',
      img: 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg'
    },
    {
      id: '#APT-1047',
      pet: 'Luna (Mèo Anh lông ngắn)',
      owner: 'Trần Bảo Minh',
      phone: '0988.223.xxx',
      service: 'Spa tắm dưỡng thảo mộc',
      time: '09:30',
      room: 'Khu Spa (KTV. Linh Đan)',
      status: 'in-progress',
      statusText: 'Đang sấy & chải lông',
      action: 'photo',
      img: 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg'
    },
    {
      id: '#APT-1046',
      pet: 'Bông (Poodle trắng)',
      owner: 'Đỗ Thùy Trang',
      phone: '0934.771.xxx',
      service: 'Tiêm phòng dại & 7 bệnh',
      time: '14:00 Chiều nay',
      room: 'Phòng Tiêm chủng (BS. Minh)',
      status: 'pending',
      statusText: 'Chờ khách tới',
      action: 'sms',
      img: 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg'
    }
  ];

  const tbody = document.querySelector('.custom-table tbody');
  const searchInput = document.querySelector('.search-input');
  const statusFilter = document.querySelectorAll('.filter-select')[0];
  const serviceFilter = document.querySelectorAll('.filter-select')[1];
  const totalLabel = document.getElementById('totalCount');

  // ==========================================
  // 2. RENDER TABLE - Vẽ lại bảng
  // ==========================================
  function getStatusBadge(status, statusText) {
    const map = {
      'urgent': 'badge-urgent',
      'in-progress': 'badge-in-progress',
      'pending': 'badge-pending',
      'completed': 'badge-completed'
    };
    return `<span class="badge ${map[status] || 'badge-pending'}">${statusText}</span>`;
  }

  function getActionButton(apt) {
    switch (apt.action) {
      case 'receive':
        return `<button class="btn btn-primary btn-sm btn-receive" data-id="${apt.id}">Tiếp nhận ngay</button>`;
      case 'note':
        return `<a class="btn btn-outline btn-sm" href="provider-service-note.html">Mở biên bản AI</a>`;
      case 'photo':
        return `<button class="btn btn-outline btn-sm btn-photo" data-id="${apt.id}">Cập nhật ảnh</button>`;
      case 'sms':
        return `<button class="btn btn-outline btn-sm btn-sms" data-id="${apt.id}">Gửi SMS nhắc</button>`;
      case 'complete':
        return `<button class="btn btn-outline btn-sm btn-complete" data-id="${apt.id}">Xem kết quả</button>`;
      default:
        return '';
    }
  }

  function renderTable(data) {
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Không tìm thấy ca hẹn nào phù hợp.</td></tr>`;
      totalLabel.textContent = `Tổng cộng: 0 ca`;
      return;
    }

    data.forEach(apt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="apt-code">${apt.id}</td>
        <td>
          <div class="pet-cell">
            <img alt="${apt.pet}" class="pet-thumb" src="${apt.img}">
            <div>
              <div class="cell-strong">${apt.pet}</div>
              <div class="cell-meta">${apt.owner} • ${apt.phone}</div>
            </div>
          </div>
        </td>
        <td>${apt.status === 'urgent' ? '<strong>' + apt.service + '</strong>' : apt.service}</td>
        <td>${apt.status === 'urgent' ? '<strong class="time-urgent">' + apt.time + '</strong>' : apt.time}</td>
        <td>${apt.room}</td>
        <td>${getStatusBadge(apt.status, apt.statusText)}</td>
        <td>
          <div class="action-btns">${getActionButton(apt)}</div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    totalLabel.textContent = `Tổng cộng: ${data.length} ca trong ngày`;

    // Bind action buttons
    bindActionButtons();
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
        apt.pet.toLowerCase().includes(query) ||
        apt.owner.toLowerCase().includes(query) ||
        apt.id.toLowerCase().includes(query) ||
        apt.service.toLowerCase().includes(query) ||
        apt.phone.toLowerCase().includes(query)
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
        data = data.filter(apt => apt.status === filterStatus);
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
          keywords.some(kw => apt.service.toLowerCase().includes(kw.toLowerCase()))
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
  function bindActionButtons() {
    // Tiếp nhận ngay
    document.querySelectorAll('.btn-receive').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        showConfirm(
          'Tiếp nhận ca ' + id,
          `Xác nhận tiếp nhận ca khẩn cấp cho <strong>${apt.pet}</strong>?<br>Chủ nuôi: ${apt.owner}`,
          () => {
            apt.status = 'in-progress';
            apt.statusText = 'Đang xử lý cấp cứu';
            apt.action = 'note';
            renderTable(getFilteredData());
            ProviderUI.toast(`Đã tiếp nhận ca ${id} thành công!`, 'success');
          }
        );
      });
    });

    // Gửi SMS nhắc
    document.querySelectorAll('.btn-sms').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        showConfirm(
          'Gửi SMS nhắc hẹn',
          `Gửi tin nhắn nhắc hẹn đến <strong>${apt.owner}</strong> (${apt.phone})?<br><br><em>"Xin chào ${apt.owner}, nhắc bạn lịch hẹn ${apt.service} cho bé ${apt.pet.split('(')[0].trim()} lúc ${apt.time} tại ${apt.room}. PetCompanion."</em>`,
          () => {
            ProviderUI.toast(`Đã gửi SMS nhắc hẹn đến ${apt.phone} thành công!`, 'success');
          }
        );
      });
    });

    // Cập nhật ảnh
    document.querySelectorAll('.btn-photo').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        ProviderUI.toast(`Chức năng cập nhật ảnh cho ca ${id} (${apt.pet}) - Đang mở camera...`, 'info');
      });
    });

    // Xem kết quả (completed)
    document.querySelectorAll('.btn-complete').forEach(btn => {
      btn.addEventListener('click', function () {
        window.location.href = 'provider-service-note.html';
      });
    });
  }

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

    overlay.querySelector('#saveWalkIn').addEventListener('click', function () {
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

      const roomMap = {
        'Khám bệnh thú y': 'Phòng Khám 01 (BS. Mai)',
        'Tiêm phòng định kỳ': 'Phòng Tiêm chủng (BS. Minh)',
        'Spa & Tắm cắt tỉa': 'Khu Spa (KTV. Linh Đan)',
        'Cấp cứu': 'Phòng Khám 01 (BS. Mai)'
      };

      appointments.unshift({
        id: newId,
        pet: `${pet}${breed ? ' (' + breed + ')' : ''}`,
        owner: owner,
        phone: phone,
        service: service,
        time: timeStr,
        room: roomMap[service] || 'Phòng Khám 01 (BS. Mai)',
        status: isUrgent ? 'urgent' : 'pending',
        statusText: isUrgent ? '⚠️ CẤP CỨU' : 'Chờ tiếp nhận',
        action: isUrgent ? 'receive' : 'sms',
        img: 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg'
      });

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
  // INIT
  // ==========================================
  renderTable(appointments);

});
