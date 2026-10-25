document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('dashAptBody');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const BADGES = {
    pending: ['badge-amber', 'Chờ duyệt'],
    urgent: ['badge-amber', 'Chờ duyệt'],
    processing: ['badge-mint', 'Đang xử lý'],
    'in-progress': ['badge-mint', 'Đang xử lý'],
    approved: ['badge-mint', 'Đã duyệt'],
    completed: ['badge-mint', 'Hoàn thành'],
    cancelled: ['badge-rose', 'Đã hủy']
  };
  const PENDING = ['pending', 'urgent', 'processing', 'in-progress'];

  let appointments = [];

  function stateRow(kind, msg) {
    const isError = kind === 'error';
    return `<tr><td colspan="8"><div style="padding:28px;text-align:center;color:${isError ? 'var(--rose)' : 'var(--text-gray)'}">
      <span class="material-symbols-outlined" style="font-size:30px">${isError ? 'error' : 'progress_activity'}</span>
      <div style="margin:6px 0 10px">${esc(msg)}</div>
      ${isError ? '<button class="btn btn-outline" data-retry>Thử lại</button>' : ''}
    </div></td></tr>`;
  }

  function fromAppointment(apt) {
    return {
      id: apt.id,
      code: apt.code,
      customer: apt.owner || apt.customer || '',
      phone: apt.phone || '',
      pet: apt.pet || '',
      service: apt.service || '',
      serviceChip: apt.serviceChip || 'chip-lav',
      partner: apt.partner || apt.room || 'PetCompanion',
      time: apt.time || '',
      timeSub: apt.timeSub || '',
      timeSubColor: apt.timeSubColor || '',
      status: apt.status || 'pending',
      actions: PENDING.includes(apt.status) ? ['approve', 'cancel', 'apt'] : ['apt']
    };
  }

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
    updateCounts();
  }

  function updateCounts() {
    const pending = appointments.filter(a => PENDING.includes(a.status)).length;
    const chip = document.getElementById('dashPendingCount');
    if (chip) chip.textContent = `${pending} ca chờ duyệt`;
    const foot = document.getElementById('dashFoot');
    if (foot) foot.textContent = `Hiển thị ${appointments.length} ca hẹn gần nhất`;
  }

  tbody.addEventListener('click', e => {
    if (e.target.closest('[data-retry]')) { load(); return; }
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
      apt.timeSub = 'Quản trị viên đã duyệt';
      apt.timeSubColor = 'var(--teal-dark)';
      render();
      UI.toast(`Đã duyệt ca hẹn ${apt.code}.`, 'ok', 'check_circle');
      if (window.MockAPI) {
        MockAPI.patch('appointments', apt.id, {
          status: 'approved',
          statusText: 'Đã duyệt – chờ tiếp nhận',
          action: 'receive',
          timeSub: 'Quản trị viên đã duyệt',
          timeSubColor: 'var(--teal-dark)'
        })
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
      apt.timeSub = 'Đã hủy';
      apt.timeSubColor = 'var(--rose)';
      render();
      UI.toast(`Đã hủy ca hẹn ${apt.code}.`, 'err', 'cancel');
      if (window.MockAPI) {
        MockAPI.patch('appointments', apt.id, {
          status: 'cancelled',
          statusText: 'Đã hủy bởi quản trị viên',
          action: '',
          timeSub: 'Đã hủy',
          timeSubColor: 'var(--rose)'
        })
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

  /* INIT - tải ca hẹn dùng chung với cổng provider */
  async function load() {
    if (!window.MockAPI) {
      tbody.innerHTML = stateRow('error', 'Thiếu core/api.js nên chưa kết nối được mock API.');
      return;
    }
    tbody.innerHTML = stateRow('loading', 'Đang tải danh sách ca hẹn...');
    try {
      const data = await MockAPI.list('appointments');
      appointments = (Array.isArray(data) ? data : []).map(fromAppointment);
      render();
    } catch (err) {
      appointments = [];
      tbody.innerHTML = stateRow('error', err.message || 'Không tải được danh sách ca hẹn.');
      UI.toast('Không tải được ca hẹn từ mock API.', 'err', 'cloud_off');
    }
  }

  load();
});
