/* ============================================
   PROVIDER CALENDAR - JavaScript
   Lịch phòng khám & Điều phối ca hẹn
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // 1. MINI CALENDAR - Chuyển tháng & chọn ngày
  // ==========================================
  const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Dữ liệu ca hẹn theo ngày (key = 'YYYY-MM-DD') - nạp từ mock API
  let eventsData = {};

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function groupEventsByDate(list) {
    const grouped = {};
    list.forEach(event => {
      if (!event.date) return;
      if (!grouped[event.date]) grouped[event.date] = [];
      grouped[event.date].push(event);
    });
    return grouped;
  }

  const TYPE_CHIPS = {
    emergency: { cls: 'chip-rose', text: '⚠️ Cấp cứu' },
    medical: { cls: 'chip-blue', text: '🩺 Khám bệnh' },
    spa: { cls: 'chip-pink', text: '✂️ Spa' },
    vaccine: { cls: 'chip-mint', text: '💉 Tiêm chủng' }
  };

  let currentYear = 2025;
  let currentMonth = 10; // 0-indexed, 10 = November
  let selectedDate = '2025-11-15';

  const calTitle = document.querySelector('.mini-cal-title');
  const calGrid = document.querySelector('.mini-grid');
  const navBtns = document.querySelectorAll('.cal-nav-btn');
  const scheduleDate = document.querySelector('.schedule-date');

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Mon=0
  }

  function formatDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const WEEKDAY_NAMES_VN = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  function formatDateDisplay(dateStr) {
    const d = new Date(dateStr);
    const weekday = WEEKDAY_NAMES_VN[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${weekday}, Ngày ${day} Tháng ${month}, ${year}`;
  }

  function renderMiniCalendar() {
    calTitle.textContent = `${MONTH_NAMES[currentMonth]}, ${currentYear}`;

    // Clear grid (keep day names)
    calGrid.innerHTML = '';
    DAY_NAMES.forEach(name => {
      const el = document.createElement('div');
      el.className = 'day-name';
      el.textContent = name;
      calGrid.appendChild(el);
    });

    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'day-cell';
      empty.style.visibility = 'hidden';
      calGrid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatDateKey(currentYear, currentMonth, d);
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.textContent = d;

      if (eventsData[dateKey]) {
        cell.classList.add('has-events');
      }
      if (dateKey === selectedDate) {
        cell.classList.add('active');
      }

      cell.addEventListener('click', function () {
        selectedDate = dateKey;
        renderMiniCalendar();
        renderTimeline();
        scheduleDate.textContent = `Hôm nay: ${formatDateDisplay(selectedDate)}`;
      });

      calGrid.appendChild(cell);
    }
  }

  // Nav buttons
  if (navBtns.length >= 2) {
    navBtns[0].addEventListener('click', function () {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderMiniCalendar();
    });
    navBtns[1].addEventListener('click', function () {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderMiniCalendar();
    });
  }

  // ==========================================
  // 2. TIMELINE MATRIX - Render ca hẹn theo ngày
  // ==========================================
  const timelineTable = document.querySelector('.timeline-table');
  const ROOMS = ['Phòng Khám 01 (BS. Mai)', 'Phòng Tiêm Chủng (BS. Minh)', 'Khu Spa Grooming (KTV. Đan)'];
  const TIME_SLOTS = ['08:30', '09:30', '10:30', '11:30', '13:30', '14:30', '15:30'];

  function renderTimeline() {
    timelineTable.innerHTML = '';

    // Headers
    const headerTime = document.createElement('div');
    headerTime.className = 'timeline-col-header';
    headerTime.textContent = 'Khung giờ';
    timelineTable.appendChild(headerTime);

    ROOMS.forEach(room => {
      const h = document.createElement('div');
      h.className = 'timeline-col-header';
      h.textContent = room;
      timelineTable.appendChild(h);
    });

    const dayEvents = eventsData[selectedDate] || [];

    // Time slots
    TIME_SLOTS.forEach(slot => {
      // Time label
      const label = document.createElement('div');
      label.className = 'time-slot-label';
      label.textContent = slot;
      timelineTable.appendChild(label);

      // Room cells
      ROOMS.forEach((room, roomIndex) => {
        const cell = document.createElement('div');
        cell.className = 'slot-cell';

        const roomEvents = dayEvents.filter(e => e.room === roomIndex && e.time.startsWith(slot));

        if (roomEvents.length > 0) {
          roomEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'apt-card ' + event.type;

            const codeClass = event.type === 'emergency' ? ' class="apt-code-urgent"' : '';
            card.innerHTML = `
              <div class="apt-time"><span>${esc(event.time)}</span><span${codeClass}>${esc(event.code)}</span></div>
              <div class="apt-pet">${esc(event.pet)}</div>
              <div class="apt-owner">Khách: ${esc(event.owner)} • ${esc(event.service)}</div>
            `;

            card.addEventListener('click', function () {
              showAppointmentDetail(event);
            });

            cell.appendChild(card);
          });
        } else {
          cell.innerHTML = '<span class="slot-empty">Phòng trống</span>';
        }

        timelineTable.appendChild(cell);
      });
    });
  }

  // ==========================================
  // 3. APPOINTMENT DETAIL - Modal chi tiết ca hẹn
  // ==========================================
  function showAppointmentDetail(event) {
    const chip = TYPE_CHIPS[event.type] || { cls: 'chip-gray', text: `📋 ${event.type}` };

    ProviderUI.modal({
      id: 'aptDetailModal',
      icon: 'assignment',
      title: `Chi tiết ca hẹn ${event.code}`,
      width: '520px',
      body: `
        <div class="detail-row"><span class="detail-label">Thú cưng:</span><span class="detail-val">${esc(event.pet)}</span></div>
        <div class="detail-row"><span class="detail-label">Chủ nuôi:</span><span class="detail-val">${esc(event.owner)}</span></div>
        <div class="detail-row"><span class="detail-label">Dịch vụ:</span><span class="detail-val">${esc(event.service)}</span></div>
        <div class="detail-row"><span class="detail-label">Thời gian:</span><span class="detail-val">${esc(event.time)}</span></div>
        <div class="detail-row"><span class="detail-label">Phòng:</span><span class="detail-val">${esc(ROOMS[event.room] || 'Chưa phân phòng')}</span></div>
        <div class="detail-row"><span class="detail-label">Loại:</span><span class="detail-val"><span class="chip ${chip.cls}">${chip.text}</span></span></div>
      `,
      footer: `
        <button class="btn btn-outline" data-close="aptDetailModal">Đóng</button>
        <a href="provider-service-note.html" class="btn btn-primary">Mở biên bản dịch vụ</a>
      `
    });
  }

  // ==========================================
  // 4. VIEW MODE TABS - Chuyển chế độ xem
  // ==========================================
  const viewTabs = document.querySelectorAll('.view-tab');
  viewTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      viewTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const mode = this.textContent.trim();
      ProviderUI.toast(`Đã chuyển sang chế độ: ${mode}`, 'info');
    });
  });

  // ==========================================
  // 5. SEARCH - Tìm kiếm thú cưng / mã ca
  // ==========================================
  const searchInput = document.querySelector('.nav-search input');
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const query = this.value.trim().toLowerCase();
        if (!query) return;

        // Search across all events
        let found = [];
        Object.keys(eventsData).forEach(dateKey => {
          eventsData[dateKey].forEach(event => {
            if (event.pet.toLowerCase().includes(query) ||
                event.owner.toLowerCase().includes(query) ||
                event.code.toLowerCase().includes(query) ||
                event.service.toLowerCase().includes(query)) {
              found.push({ ...event, date: dateKey });
            }
          });
        });

        if (found.length > 0) {
          // Navigate to date of first result
          const firstDate = found[0].date;
          const parts = firstDate.split('-');
          currentYear = parseInt(parts[0]);
          currentMonth = parseInt(parts[1]) - 1;
          selectedDate = firstDate;
          renderMiniCalendar();
          renderTimeline();
          scheduleDate.textContent = `Hôm nay: ${formatDateDisplay(selectedDate)}`;
          ProviderUI.toast(`Tìm thấy ${found.length} kết quả. Đang hiển thị ngày ${parts[2]}/${parts[1]}/${parts[0]}.`, 'success');

          // Highlight matching cards after render
          setTimeout(() => {
            document.querySelectorAll('.apt-card').forEach(card => {
              const text = card.textContent.toLowerCase();
              if (text.includes(query)) {
                card.style.outline = '3px solid var(--teal)';
                card.style.outlineOffset = '2px';
                setTimeout(() => {
                  card.style.outline = '';
                  card.style.outlineOffset = '';
                }, 3000);
              }
            });
          }, 100);
        } else {
          ProviderUI.toast('Không tìm thấy kết quả phù hợp.', 'warning');
        }
      }
    });
  }

  // ==========================================
  // 6. ACTION BUTTONS
  // ==========================================
  // Xuất lịch làm việc
  const exportBtn = document.getElementById('btnExportSchedule');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      const dayEvents = eventsData[selectedDate] || [];
      if (dayEvents.length === 0) {
        ProviderUI.toast('Không có ca hẹn nào trong ngày này để xuất.', 'warning');
        return;
      }

      let content = `LỊCH LÀM VIỆC - ${formatDateDisplay(selectedDate)}\n`;
      content += '='.repeat(50) + '\n\n';
      dayEvents.forEach((e, i) => {
        content += `${i + 1}. [${e.time}] ${e.code}\n`;
        content += `   Thú cưng: ${e.pet}\n`;
        content += `   Chủ nuôi: ${e.owner}\n`;
        content += `   Dịch vụ: ${e.service}\n`;
        content += `   Phòng: ${ROOMS[e.room]}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lich-lam-viec-${selectedDate}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      ProviderUI.toast('Đã xuất lịch làm việc thành công!', 'success');
    });
  }

  // Đặt lịch tiếp nhận mới
  const newAptBtn = document.getElementById('btnNewAppointment');
  if (newAptBtn) {
    newAptBtn.addEventListener('click', function () {
      showNewAppointmentModal();
    });
  }

  function showNewAppointmentModal() {
    const overlay = ProviderUI.modal({
      id: 'newAptModal',
      icon: 'event_available',
      title: 'Đặt lịch tiếp nhận mới',
      width: '520px',
      body: `
        <div class="f-group">
          <label class="f-label">Tên thú cưng *</label>
          <input class="f-input" id="newPetName" type="text" placeholder="VD: Milo, Luna...">
        </div>
        <div class="f-group">
          <label class="f-label">Giống loài</label>
          <input class="f-input" id="newPetBreed" type="text" placeholder="VD: Golden Retriever, Mèo Anh...">
        </div>
        <div class="f-group">
          <label class="f-label">Chủ nuôi *</label>
          <input class="f-input" id="newOwner" type="text" placeholder="Họ tên chủ nuôi">
        </div>
        <div class="f-group">
          <label class="f-label">Số điện thoại *</label>
          <input class="f-input" id="newPhone" type="tel" placeholder="0912.xxx.xxx">
        </div>
        <div class="f-group">
          <label class="f-label">Dịch vụ *</label>
          <select class="f-input" id="newService">
            <option value="">-- Chọn dịch vụ --</option>
            <option>Khám tổng quát</option>
            <option>Tiêm phòng</option>
            <option>Spa & Grooming</option>
            <option>Siêu âm</option>
            <option>Cấp cứu</option>
          </select>
        </div>
        <div class="f-group">
          <label class="f-label">Khung giờ *</label>
          <select class="f-input" id="newTimeSlot">
            <option value="">-- Chọn khung giờ --</option>
            <option>08:30</option>
            <option>09:30</option>
            <option>10:30</option>
            <option>11:30</option>
            <option>13:30</option>
            <option>14:30</option>
            <option>15:30</option>
          </select>
        </div>
        <div class="f-group" style="margin-bottom:0">
          <label class="f-label">Phòng *</label>
          <select class="f-input" id="newRoom">
            <option value="">-- Chọn phòng --</option>
            <option value="0">Phòng Khám 01 (BS. Mai)</option>
            <option value="1">Phòng Tiêm Chủng (BS. Minh)</option>
            <option value="2">Khu Spa Grooming (KTV. Đan)</option>
          </select>
        </div>
      `,
      footer: `
        <button class="btn btn-outline" data-close="newAptModal">Hủy</button>
        <button class="btn btn-primary" id="saveNewApt">Xác nhận đặt lịch</button>
      `
    });

    overlay.querySelector('#saveNewApt').addEventListener('click', async function () {
      const petName = document.getElementById('newPetName').value.trim();
      const petBreed = document.getElementById('newPetBreed').value.trim();
      const owner = document.getElementById('newOwner').value.trim();
      const phone = document.getElementById('newPhone').value.trim();
      const service = document.getElementById('newService').value;
      const timeSlot = document.getElementById('newTimeSlot').value;
      const room = document.getElementById('newRoom').value;

      if (!petName || !owner || !phone || !service || !timeSlot || room === '') {
        ProviderUI.toast('Vui lòng điền đầy đủ thông tin bắt buộc (*).', 'warning');
        return;
      }

      const endHour = parseInt(timeSlot.split(':')[0]) + 1;
      const endTime = `${String(endHour).padStart(2, '0')}:${timeSlot.split(':')[1]}`;
      const newCode = `#APT-${Math.floor(1000 + Math.random() * 9000)}`;

      const newEvent = {
        date: selectedDate,
        time: `${timeSlot} - ${endTime}`,
        code: newCode,
        pet: `🐾 ${petName}${petBreed ? ' (' + petBreed + ')' : ''}`,
        owner: owner,
        service: service,
        room: parseInt(room),
        type: service.includes('Spa') ? 'spa' : service.includes('Tiêm') ? 'vaccine' : service.includes('Cấp cứu') ? 'emergency' : 'medical'
      };

      let saved = null;
      if (window.MockAPI) {
        try {
          saved = await MockAPI.create('calendar-events', newEvent);
        } catch (err) {
          console.warn('[MockAPI]', err.message);
          ProviderUI.toast('Không kết nối được mock API — lịch hẹn chỉ lưu tạm trên giao diện.', 'warning');
        }
      }
      const storedEvent = saved || newEvent;

      if (!eventsData[selectedDate]) eventsData[selectedDate] = [];
      eventsData[selectedDate].push(storedEvent);

      overlay.remove();
      renderMiniCalendar();
      renderTimeline();
      updateStats();
      ProviderUI.toast(`Đã đặt lịch thành công cho ${petName} lúc ${timeSlot}! Mã: ${newCode}`, 'success');
    });
  }

  // ==========================================
  // 7. UPDATE STATS - Cập nhật KPI
  // ==========================================
  function updateStats() {
    const dayEvents = eventsData[selectedDate] || [];
    const statVals = document.querySelectorAll('.stat-val');
    if (statVals.length >= 3) {
      const medical = dayEvents.filter(e => ['medical', 'emergency', 'vaccine', 'ultrasound'].includes(e.type)).length;
      const spa = dayEvents.filter(e => e.type === 'spa').length;
      statVals[0].textContent = `${medical + spa} ca`;
      statVals[1].textContent = `${spa} ca`;
    }
  }

  // ==========================================
  // INIT - Tải ca hẹn dùng chung từ mock API
  // ==========================================
  async function loadEvents() {
    if (window.MockAPI) {
      try {
        const data = await MockAPI.list('calendar-events');
        if (!Array.isArray(data)) throw new Error('Dữ liệu lịch hẹn không hợp lệ.');
        eventsData = groupEventsByDate(data);
      } catch (err) {
        console.warn('[MockAPI] calendar-events:', err.message);
        eventsData = {};
        ProviderUI.toast('Không tải được lịch hẹn từ mock API. Hãy kiểm tra server rồi tải lại trang.', 'warning');
      }
    } else {
      eventsData = {};
      ProviderUI.toast('Thiếu core/api.js nên chưa kết nối được mock API.', 'warning');
    }
    renderMiniCalendar();
    renderTimeline();
    updateStats();
  }

  loadEvents();

});
