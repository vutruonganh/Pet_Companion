/* ============================================
   PROVIDER SERVICE NOTE - JavaScript
   Biên bản dịch vụ & Checklist AI
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'petcompanion_service_note_draft_milo';
  const NOTE_ID = '1';

  // ==========================================
  // 1. SELECTORS & STATE
  // ==========================================
  const clinicalExamInput = document.getElementById('clinicalExam');
  const prescriptionInput = document.getElementById('prescription');
  const ownerNoteInput = document.getElementById('ownerNote');

  const aiTag = document.querySelector('.ai-tag');
  const aiBanner = document.querySelector('.ai-banner');

  const saveDraftBtn = document.getElementById('btnSaveDraft');
  const signDocBtn = document.getElementById('btnSign');

  let isSigned = false;

  // ==========================================
  // 2. CHECKLIST AI - Quản lý & Cập nhật tiến độ
  // ==========================================
  // Thêm badge tiến độ vào header AI
  const progressBadge = document.createElement('span');
  progressBadge.className = 'checklist-progress';
  if (aiTag) {
    aiTag.parentNode.insertBefore(progressBadge, aiTag);
  }

  function updateChecklistProgress() {
    const total = document.querySelectorAll('.checklist-item input[type="checkbox"]').length;
    const checked = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;

    if (checked === total) {
      progressBadge.classList.add('done');
      progressBadge.textContent = `✓ Đã kiểm 100% (${checked}/${total})`;
    } else {
      progressBadge.classList.remove('done');
      progressBadge.textContent = `${checked}/${total} đã kiểm`;
    }
  }

  function bindChecklistEvents() {
    document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(chk => {
      chk.onchange = function () {
        updateChecklistProgress();
        autoSaveDraft();
      };
    });
  }

  bindChecklistEvents();
  updateChecklistProgress();

  // Thêm nút Thêm hạng mục kiểm tra thủ công hoặc AI đề xuất
  const addChecklistBtn = document.createElement('button');
  addChecklistBtn.type = 'button';
  addChecklistBtn.className = 'btn-add-checklist';
  addChecklistBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">add</span> Thêm mục kiểm tra an toàn';

  if (aiBanner) {
    aiBanner.appendChild(addChecklistBtn);
  }

  addChecklistBtn.addEventListener('click', function () {
    const itemText = prompt('Nhập nội dung hạng mục kiểm tra an toàn mới:');
    if (itemText && itemText.trim()) {
      const newId = 'chk_' + Date.now();
      const div = document.createElement('div');
      div.className = 'checklist-item';
      div.innerHTML = `
        <input id="${newId}" type="checkbox">
        <label for="${newId}">${itemText.trim()}</label>
      `;
      addChecklistBtn.parentNode.insertBefore(div, addChecklistBtn);
      bindChecklistEvents();
      updateChecklistProgress();
      ProviderUI.toast('Đã bổ sung mục kiểm tra an toàn mới!', 'success');
      autoSaveDraft();
    }
  });

  // ==========================================
  // 3. CHI PHÍ DỊCH VỤ - Tính toán & Thêm khoản thu
  // ==========================================
  const costCard = document.getElementById('costCard');

  function recalculateTotal() {
    if (!costCard) return;
    const costItems = costCard.querySelectorAll('.summary-item:not(:last-child)');
    let total = 0;

    costItems.forEach(item => {
      const valText = item.querySelector('.summary-val')?.textContent || '';
      const num = parseInt(valText.replace(/[^\d]/g, ''), 10);
      if (!isNaN(num)) {
        total += num;
      }
    });

    const totalValEl = costCard.querySelector('.summary-item:last-child .summary-val');
    if (totalValEl) {
      totalValEl.textContent = total.toLocaleString('vi-VN') + ' đ';
    }
  }

  // Thêm nút "Thêm chi phí/vật tư" vào card chi phí
  if (costCard) {
    const addCostBtn = document.createElement('button');
    addCostBtn.type = 'button';
    addCostBtn.className = 'btn-add-cost';
    addCostBtn.innerHTML = '+ Thêm vật tư / Dịch vụ phát sinh';

    const lastItem = costCard.querySelector('.summary-item:last-child');
    if (lastItem) {
      lastItem.parentNode.insertBefore(addCostBtn, lastItem);
    }

    addCostBtn.addEventListener('click', function () {
      const name = prompt('Nhập tên dịch vụ hoặc thuốc/vật tư tiêu hao:');
      if (!name || !name.trim()) return;
      const priceStr = prompt('Nhập đơn giá (VNĐ):', '50000');
      const price = parseInt(priceStr?.replace(/[^\d]/g, ''), 10);
      if (isNaN(price) || price <= 0) {
        ProviderUI.toast('Số tiền không hợp lệ!', 'warning');
        return;
      }

      const itemDiv = document.createElement('div');
      itemDiv.className = 'summary-item';
      itemDiv.innerHTML = `
        <span class="summary-label">${name.trim()}</span>
        <span class="summary-val">${price.toLocaleString('vi-VN')} đ</span>
      `;

      addCostBtn.parentNode.insertBefore(itemDiv, addCostBtn);
      recalculateTotal();
      autoSaveDraft();
      ProviderUI.toast(`Đã thêm chi phí: ${name} (${price.toLocaleString('vi-VN')} đ)`, 'success');
    });
  }

  // ==========================================
  // 4. LƯU BẢN NHÁP (DRAFT) & KHÔI PHỤC
  // ==========================================
  function getFormData() {
    const checklistStates = [];
    document.querySelectorAll('.checklist-item').forEach(item => {
      const chk = item.querySelector('input[type="checkbox"]');
      const lbl = item.querySelector('label');
      checklistStates.push({
        id: chk?.id,
        text: lbl?.textContent || '',
        checked: chk?.checked || false
      });
    });

    return {
      clinicalExam: clinicalExamInput?.value || '',
      prescription: prescriptionInput?.value || '',
      ownerNote: ownerNoteInput?.value || '',
      checklist: checklistStates,
      timestamp: new Date().toISOString()
    };
  }

  function autoSaveDraft() {
    try {
      const data = getFormData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Lỗi auto save draft:', e);
    }
  }

  // Lắng nghe thay đổi input để autosave
  if (clinicalExamInput) clinicalExamInput.addEventListener('input', autoSaveDraft);
  if (prescriptionInput) prescriptionInput.addEventListener('input', autoSaveDraft);
  if (ownerNoteInput) ownerNoteInput.addEventListener('input', autoSaveDraft);

  // Nút "Lưu bản nháp" chủ động
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', async function () {
      autoSaveDraft();
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const synced = await syncNote();
      if (synced) {
        ProviderUI.toast(`Đã lưu bản nháp thành công lúc ${timeStr}!`, 'success');
      } else {
        ProviderUI.toast('Đã lưu nháp trên trình duyệt — không kết nối được mock API.', 'warning');
      }
    });
  }

  // Khôi phục bản nháp khi tải trang
  function restoreDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data.clinicalExam && clinicalExamInput) clinicalExamInput.value = data.clinicalExam;
      if (data.prescription && prescriptionInput) prescriptionInput.value = data.prescription;
      if (data.ownerNote && ownerNoteInput) ownerNoteInput.value = data.ownerNote;

      if (Array.isArray(data.checklist)) {
        const items = document.querySelectorAll('.checklist-item');
        data.checklist.forEach((itemData, index) => {
          if (items[index]) {
            const chk = items[index].querySelector('input[type="checkbox"]');
            if (chk) chk.checked = itemData.checked;
          }
        });
        updateChecklistProgress();
      }
    } catch (e) {
      console.warn('Lỗi restore draft:', e);
    }
  }

  // ==========================================
  // 4B. MOCK API - Đồng bộ biên bản (fetch CRUD)
  // ==========================================
  function getChecklistData() {
    return [...document.querySelectorAll('.checklist-item')].map(item => {
      const chk = item.querySelector('input[type="checkbox"]');
      return {
        id: chk?.id || '',
        text: item.querySelector('label')?.textContent || '',
        checked: !!chk?.checked
      };
    });
  }

  function getCostData() {
    if (!costCard) return [];
    return [...costCard.querySelectorAll('.summary-item:not(.summary-total)')].map(item => ({
      name: item.querySelector('.summary-label')?.textContent || '',
      amount: parseInt((item.querySelector('.summary-val')?.textContent || '').replace(/[^\d]/g, ''), 10) || 0
    }));
  }

  function buildNotePayload() {
    return {
      clinicalExam: clinicalExamInput?.value || '',
      prescription: prescriptionInput?.value || '',
      ownerNote: ownerNoteInput?.value || '',
      checklist: getChecklistData(),
      costs: getCostData()
    };
  }

  async function syncNote(extra) {
    if (!window.MockAPI) return false;
    try {
      await MockAPI.update('service-notes', NOTE_ID, { ...buildNotePayload(), ...(extra || {}) });
      return true;
    } catch (err) {
      console.warn('[MockAPI] service-notes:', err.message);
      return false;
    }
  }

  /* Biên bản đã ký phải trở thành hồ sơ dịch vụ trong app chủ nuôi (bảng medical-records) */
  function prescriptionItems(text) {
    return String(text || '').split('\n')
      .map(line => line.replace(/^\s*\d+[.)]\s*/, '').trim())
      .filter(Boolean)
      .map(line => {
        const sep = line.indexOf(':');
        return sep === -1
          ? { name: line, note: '', dosage: 'Theo chỉ định' }
          : { name: line.slice(0, sep).trim(), note: '', dosage: line.slice(sep + 1).trim() };
      });
  }

  async function publishMedicalRecord(signedAt) {
    if (!window.MockAPI) return false;
    const patientName = (document.querySelector('.patient-name')?.textContent || '').trim() || 'Milo';

    let petId = null;
    try {
      const pets = await MockAPI.list('pets');
      const pet = (pets || []).find(p => String(p.name).toLowerCase() === patientName.toLowerCase());
      if (pet) petId = String(pet.id);
    } catch (err) {
      console.warn('[MockAPI] pets:', err.message);
    }
    if (!petId) {
      console.warn('[ServiceNote] không tìm thấy thú cưng', patientName, 'trong bảng pets');
      return false;
    }

    const when = new Date(signedAt);
    const pad = n => String(n).padStart(2, '0');
    const costs = getCostData();
    const checklist = getChecklistData();

    await MockAPI.create('medical-records', {
      code: 'SR-' + when.getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      petId: petId,
      petName: patientName,
      type: 'vet',
      typeLabel: 'Thú y & Xét nghiệm',
      service: costs[0]?.name || 'Khám tổng quát',
      serviceSub: checklist.filter(item => item.checked).length + '/' + checklist.length + ' mục kiểm tra lâm sàng',
      provider: 'PetCare Clinic Q.1',
      doctor: 'BS. Hoàng Mai (Chuyên khoa Nội)',
      date: `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`,
      time: `${pad(when.getHours())}:${pad(when.getMinutes())}`,
      cost: costs.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0),
      status: 'completed',
      statusLabel: 'Hoàn thành – đã ký số',
      summary: 'Biên bản dịch vụ điện tử – Bé ' + patientName,
      diagnosis: clinicalExamInput?.value || '',
      prescriptions: prescriptionItems(prescriptionInput?.value),
      advice: ownerNoteInput?.value || '',
      files: [],
      serviceNoteId: NOTE_ID
    });
    return true;
  }

  function appendChecklistItem(id, text, checked) {
    if (!id || document.getElementById(id)) return;
    const div = document.createElement('div');
    div.className = 'checklist-item';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = !!checked;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = text;
    div.append(input, label);
    addChecklistBtn.parentNode.insertBefore(div, addChecklistBtn);
  }

  function applyCosts(costs) {
    if (!costCard) return;
    const items = [...costCard.querySelectorAll('.summary-item:not(.summary-total)')];
    costs.forEach((cost, index) => {
      let item = items[index];
      if (!item) {
        item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = '<span class="summary-label"></span><span class="summary-val"></span>';
        const addBtn = costCard.querySelector('.btn-add-cost');
        costCard.querySelector('.card-body').insertBefore(item, addBtn);
      }
      item.querySelector('.summary-label').textContent = cost.name || '';
      item.querySelector('.summary-val').textContent = (Number(cost.amount) || 0).toLocaleString('vi-VN') + ' đ';
    });
    recalculateTotal();
  }

  function applyNote(note) {
    if (typeof note.clinicalExam === 'string' && clinicalExamInput) clinicalExamInput.value = note.clinicalExam;
    if (typeof note.prescription === 'string' && prescriptionInput) prescriptionInput.value = note.prescription;
    if (typeof note.ownerNote === 'string' && ownerNoteInput) ownerNoteInput.value = note.ownerNote;

    if (Array.isArray(note.checklist)) {
      note.checklist.forEach(item => {
        const chk = document.getElementById(item.id);
        if (chk) {
          chk.checked = !!item.checked;
        } else if (item.id && item.id.startsWith('chk_')) {
          appendChecklistItem(item.id, item.text || '', item.checked);
        }
      });
      bindChecklistEvents();
      updateChecklistProgress();
    }

    if (Array.isArray(note.costs)) applyCosts(note.costs);
    if (note.status === 'signed') applySignedState(note.signedAt);
  }

  async function loadNote() {
    let note = null;
    if (window.MockAPI) {
      try {
        note = await MockAPI.get('service-notes', NOTE_ID);
      } catch (err) {
        console.warn('[MockAPI] service-notes:', err.message);
      }
    }
    if (note) applyNote(note);
    restoreDraft();
    updateChecklistProgress();
  }

  loadNote();

  // ==========================================
  // 5. HOÀN TẤT & KÝ SỐ ĐIỆN TỬ
  // ==========================================
  if (signDocBtn) {
    signDocBtn.addEventListener('click', function () {
      if (isSigned) {
        ProviderUI.toast('Biên bản y khoa này đã được ký số xác thực.', 'info');
        return;
      }

      const totalChecklist = document.querySelectorAll('.checklist-item input[type="checkbox"]').length;
      const checkedChecklist = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;

      if (checkedChecklist < totalChecklist) {
        showConfirm(
          'Checklist an toàn chưa đủ',
          `Còn <strong>${totalChecklist - checkedChecklist}</strong> mục kiểm tra an toàn theo chuẩn BTL-35 chưa được xác nhận hoàn tất.<br><br>Bạn có chắc chắn muốn tiến hành Ký số điện tử không?`,
          () => openSignModal()
        );
      } else {
        openSignModal();
      }
    });
  }

  function openSignModal() {
    const overlay = ProviderUI.modal({
      id: 'signModal',
      icon: 'draw',
      title: 'Xác thực Ký số y khoa điện tử',
      width: '520px',
      body: `
        <div class="sign-cert">
          <div class="cert-head">Chứng thư số Bác sĩ điều trị</div>
          <div class="cert-row">Họ tên: <strong>BS. Hoàng Mai</strong></div>
          <div class="cert-row">Mã số hành nghề: <strong>VN-VET-2025-08819</strong></div>
          <div class="cert-row">Cơ quan cấp phép: Chi cục Thú y TP.HCM</div>
          <div class="cert-key">Khóa ký số: RSA-2048 SHA256withRSA (Chuẩn BTL-35)</div>
        </div>
        <div class="f-group">
          <label class="f-label" for="signPin">Mã PIN xác thực Ký số / Smart OTP *</label>
          <input class="f-input sign-pin" id="signPin" type="password" placeholder="Nhập mã PIN 6 số (mặc định: 123456)" maxlength="6" value="123456">
        </div>
        <div class="sign-hint">
          🔒 Sau khi ký số, biên bản chẩn đoán và đơn thuốc sẽ được niêm phong, cấp mã tra cứu bảo mật trên sổ khám điện tử PetCompanion của chủ nuôi.
        </div>
      `,
      footer: `
        <button class="btn btn-outline" data-close="signModal">Hủy bỏ</button>
        <button class="btn btn-primary" id="btnConfirmSign">Ký số & Phát hành hồ sơ</button>
      `
    });

    overlay.querySelector('#btnConfirmSign').addEventListener('click', function () {
      const pin = document.getElementById('signPin').value.trim();
      if (!pin) {
        ProviderUI.toast('Vui lòng nhập mã PIN xác thực.', 'warning');
        return;
      }

      this.disabled = true;
      this.textContent = 'Đang tạo chữ ký số & băm SHA-256...';

      setTimeout(async () => {
        const signedAt = new Date().toISOString();
        const synced = await syncNote({ status: 'signed', signedAt });
        let published = false;
        try {
          published = await publishMedicalRecord(signedAt);
        } catch (err) {
          console.warn('[MockAPI] medical-records:', err.message);
        }
        overlay.remove();
        applySignedState(signedAt);
        if (synced) {
          ProviderUI.toast('Đã ký số điện tử thành công! Hồ sơ y bạ đã phát hành đến App Chủ nuôi.', 'success');
        } else {
          ProviderUI.toast('Đã ký số trên giao diện — không kết nối được mock API.', 'warning');
        }
        if (synced && !published) {
          ProviderUI.toast('Chưa đồng bộ được sang Lịch sử dịch vụ của chủ nuôi (không khớp hồ sơ thú cưng).', 'warning');
        }
      }, 1000);
    });
  }

  function applySignedState(signedAt) {
    isSigned = true;

    // Đổi nút ký số thành badge đã ký
    if (signDocBtn) {
      signDocBtn.innerHTML = '<span class="material-symbols-outlined">verified</span>Đã Ký số y khoa';
      signDocBtn.classList.add('btn-signed');
    }

    if (saveDraftBtn) {
      saveDraftBtn.innerHTML = '<span class="material-symbols-outlined">print</span>In bệnh án điện tử';
      saveDraftBtn.onclick = () => window.print();
    }

    // Khóa form
    if (clinicalExamInput) clinicalExamInput.readOnly = true;
    if (prescriptionInput) prescriptionInput.readOnly = true;
    if (ownerNoteInput) ownerNoteInput.readOnly = true;
    document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(chk => chk.disabled = true);
    if (addChecklistBtn) addChecklistBtn.style.display = 'none';

    // Thêm con dấu Ký số điện tử vào góc trên card kết quả chẩn đoán
    const clinicalCard = document.getElementById('clinicalCard');
    if (clinicalCard && !document.querySelector('.stamp-signed')) {
      const stamp = document.createElement('div');
      stamp.className = 'stamp-signed';
      const signedDate = signedAt ? new Date(signedAt) : new Date();
      const when = isNaN(signedDate.getTime()) ? new Date() : signedDate;
      const timeStr = `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')} - ${when.toLocaleDateString('vi-VN')}`;
      stamp.innerHTML = `
        <div class="stamp-title">✓ ĐÃ KÝ SỐ ĐIỆN TỬ</div>
        <div class="stamp-name">BS. HOÀNG MAI</div>
        <div class="stamp-meta">PetCare Clinic • ${timeStr}</div>
      `;
      const firstGroup = clinicalCard.querySelector('.f-group');
      if (firstGroup) {
        firstGroup.parentNode.insertBefore(stamp, firstGroup);
      }
    }
  }

  // ==========================================
  // 6. CONFIRM MODAL
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
        <button class="btn btn-primary" id="confirmActionBtn">Tiếp tục</button>
      `
    });

    overlay.querySelector('#confirmActionBtn').addEventListener('click', function () {
      overlay.remove();
      onConfirm();
    });
  }

});
