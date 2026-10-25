document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('dashAptBody');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const BADGES = {
    pending: ['badge-amber', 'Chờ duyệt'],
    processing: ['badge-mint', 'Đang xử lý'],
    approved: ['badge-mint', 'Đã duyệt'],
    cancelled: ['badge-rose', 'Đã hủy']
  };

  let appointments = [];

  function actionButtons(apt) {
    return (apt.actions || []).map(action => {
      if (action === 'approve') {
        const icon = apt.status === 'processing' ? 'check' : 'check_circle';
        const title = apt.status === 'processing' ? 'Xác nhận' : 'Duyệt';
        return `<button class="icon-act ok" data-approve="${apt.id}" title="${title}"><span class="material-symbols-outlined">${icon}</span></button>`;
      }
      if (action === 'cancel') {
        return `<button class="icon-act no" data-cancel="${apt.id}" title="Hủy"><span class="material-symbols-outlined">cancel</span></button>`;
      }
      return `<button class="icon-act" data-apt="${apt.id}" title="Chi tiết"><span class="material-symbols-outlined">visibility</span></button>`;
    }).join('');
  }

  function renderRow(apt) {
    const [badgeCls, badgeText] = BADGES[apt.status] || BADGES.pending;
    const subStyle = apt.timeSubColor ? ` style="color:${apt.timeSubColor}"` : '';
    return `<tr>
      <td class="code">${esc(apt.code)}</td>
      <td><div class="cell-main">${esc(apt.customer)}</div><div class="cell-sub">${esc(apt.phone)}</div></td>
      <td><span class="pet"><span class="material-symbols-outlined">pets</span>${esc(apt.pet)}</span></td>
      <td><span class="chip ${esc(apt.serviceChip)}">${esc(apt.service)}</span></td>
      <td>${esc(apt.partner)}</td>
      <td><div class="cell-main">${esc(apt.time)}</div><div class="cell-sub"${subStyle}>${esc(apt.timeSub)}</div></td>
      <td><span class="badge ${badgeCls}"><i></i>${badgeText}</span></td>
      <td class="acts">${actionButtons(apt)}</td>
    </tr>`;
  }

  function render() {
    tbody.innerHTML = appointments.map(renderRow).join('');
  }

  /* Chi tiết ca hẹn */
  tbody.addEventListener('click', e => {
    const viewBtn = e.target.closest('[data-apt]');
    if (viewBtn) {
      const apt = appointments.find(a => String(a.id) === viewBtn.dataset.apt);
      if (!apt) return;
      const [badgeCls, badgeText] = BADGES[apt.status] || BADGES.pending;
      document.getElementById('aptCode').textContent = apt.code;
      document.getElementById('aptBody').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><div class="f-label">Khách hàng</div><b>${esc(apt.customer)}</b></div>
          <div><div class="f-label">Thú cưng</div><b>${esc(apt.pet)}</b></div>
          <div><div class="f-label">Dịch vụ</div><b>${esc(apt.service)}</b></div>
          <div><div class="f-label">Đối tác</div><b>${esc(apt.partner)}</b></div>
          <div><div class="f-label">Thời gian</div><b>${esc(apt.time)}</b></div>
          <div><div class="f-label">Trạng thái</div><span class="badge ${badgeCls}"><i></i>${badgeText}</span></div>
        </div>`;
      UI.open('modalApt');
      return;
    }

    /* Duyệt ca hẹn */
    const approveBtn = e.target.closest('[data-approve]');
    if (approveBtn) {
      const apt = appointments.find(a => String(a.id) === approveBtn.dataset.approve);
      if (!apt) return;
      apt.status = 'approved';
      render();
      UI.toast(`Đã duyệt ca hẹn ${apt.code}.`, 'ok', 'check_circle');
      if (window.MockAPI) {
        MockAPI.patch('dashboard-appointments', apt.id, { status: 'approved' })
          .catch(err => {
            console.warn('[MockAPI]', err.message);
            UI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'err', 'error');
          });
      }
      return;
    }

    /* Hủy ca hẹn */
    const cancelBtn = e.target.closest('[data-cancel]');
    if (cancelBtn) {
      const apt = appointments.find(a => String(a.id) === cancelBtn.dataset.cancel);
      if (!apt) return;
      if (!confirm(`Hủy ca hẹn ${apt.code}?`)) return;
      apt.status = 'cancelled';
      render();
      UI.toast(`Đã hủy ca hẹn ${apt.code}.`, 'err', 'cancel');
      if (window.MockAPI) {
        MockAPI.patch('dashboard-appointments', apt.id, { status: 'cancelled' })
          .catch(err => {
            console.warn('[MockAPI]', err.message);
            UI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'err', 'error');
          });
      }
    }
  });

  /* Xuất dữ liệu / PDF / Broadcast */
  document.getElementById('btnExport').addEventListener('click', () => UI.toast('Đang xuất dữ liệu hệ thống...', 'info', 'download'));
  document.getElementById('btnPdf').addEventListener('click', () => UI.toast('Đang tạo báo cáo PDF / Excel...', 'info', 'picture_as_pdf'));
  document.getElementById('btnBroadcast').addEventListener('click', () => { UI.close('modalBroadcast'); UI.toast('Đã phát thông báo tới toàn hệ thống.', 'ok', 'campaign'); });

  /* INIT - tải ca hẹn từ mock API */
  async function load() {
    if (window.MockAPI) {
      try {
        const data = await MockAPI.list('dashboard-appointments');
        if (Array.isArray(data) && data.length) {
          appointments = data;
          render();
          return;
        }
      } catch (err) {
        console.warn('[MockAPI] dashboard-appointments:', err.message);
      }
    }
    /* Fallback: đọc dữ liệu tĩnh đang có trên trang */
    appointments = [...tbody.querySelectorAll('tr')].map(row => {
      const code = row.querySelector('.code').textContent.trim();
      const id = code.replace('#PET-', '');
      const cells = row.cells;
      const chip = row.querySelector('.chip');
      return {
        id,
        code,
        customer: cells[1].querySelector('.cell-main').textContent.trim(),
        phone: cells[1].querySelector('.cell-sub').textContent.trim(),
        pet: row.querySelector('.pet').textContent.trim(),
        service: chip.textContent.trim(),
        serviceChip: [...chip.classList].find(c => c.startsWith('chip-')),
        partner: cells[4].textContent.trim(),
        time: cells[5].querySelector('.cell-main').textContent.trim(),
        timeSub: cells[5].querySelector('.cell-sub').textContent.trim(),
        timeSubColor: '',
        status: row.querySelector('.badge').textContent.includes('Đã duyệt') ? 'approved' : 'pending',
        actions: [...row.querySelectorAll('[data-approve],[data-cancel],[data-apt]')].map(b =>
          b.dataset.approve ? 'approve' : b.dataset.cancel ? 'cancel' : 'apt')
      };
    });
    /* Modal fallback dùng dữ liệu từ các nút đang có */
    const APTS = {
      1049: { kh: 'Trần Minh Anh', pet: 'Miu Miu (Mèo Anh)', dv: 'Cấp cứu hô hấp', dt: 'Bệnh viện PetCare Q.7', tg: '10:30 Hôm nay', tt: 'Chờ duyệt' },
      1048: { kh: 'Lê Hoàng Yến', pet: 'Rocky (Corgi)', dv: 'Spa & Grooming', dt: 'PawPaws Boutique Spa', tg: '11:15 Hôm nay', tt: 'Đang xử lý' },
      1047: { kh: 'Nguyễn Quốc Thái', pet: 'Simba (Golden)', dv: 'Huấn luyện cơ bản', dt: 'HLV Trọng Nghĩa', tg: '14:00 Chiều nay', tt: 'Chờ duyệt' },
      1046: { kh: 'Đỗ Thùy Trang', pet: 'Bông (Poodle)', dv: 'Tiêm ngừa dại', dt: 'Phòng khám Vets&Friends', tg: '15:30 Chiều nay', tt: 'Đã duyệt' }
    };
    appointments = appointments.map(apt => {
      const legacy = APTS[apt.id];
      return legacy ? {
        ...apt,
        customer: legacy.kh, pet: legacy.pet, service: legacy.dv, partner: legacy.dt, time: legacy.tg
      } : apt;
    });
  }

  load();
});
