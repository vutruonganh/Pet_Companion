/* ============================================
   PROVIDER SERVICE NOTE - JavaScript
   Biên bản dịch vụ & Checklist AI
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'petcompanion_service_note_draft_milo';

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
    saveDraftBtn.addEventListener('click', function () {
      autoSaveDraft();
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      ProviderUI.toast(`Đã lưu bản nháp thành công lúc ${timeStr}!`, 'success');
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

  restoreDraft();

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

      setTimeout(() => {
        overlay.remove();
        applySignedState();
        ProviderUI.toast('Đã ký số điện tử thành công! Hồ sơ y bạ đã phát hành đến App Chủ nuôi.', 'success');
      }, 1000);
    });
  }

  function applySignedState() {
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
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${now.toLocaleDateString('vi-VN')}`;
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
