document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('sBody');
  const CAT_MAP = {
    'y-te': { chip: 'chip-mint', sq: 'sq-mint', icon: 'clinical_notes', label: 'Y tế Thú y' },
    'spa': { chip: 'chip-pink', sq: 'sq-pink', icon: 'content_cut', label: 'Spa Grooming' },
    'hl': { chip: 'chip-amber', sq: 'sq-amber', icon: 'sports_score', label: 'Huấn luyện' }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let services = null;
  let cat = 'all';

  function switchInner(sku, active) {
    return `<label class="switch"><input type="checkbox" ${active ? 'checked' : ''} data-sku="${esc(sku)}"><i></i></label><b class="${active ? 'st-on' : 'st-off'}">${active ? 'Đang cung ứng' : 'Tạm dừng nhận'}</b>`;
  }

  function renderRow(s) {
    const durIcon = s.durIcon || (s.cat === 'hl' ? 'event_repeat' : 'schedule');
    const partnerUnit = s.cat === 'hl' ? 'HLV' : 'đối tác';
    return `<tr data-cat="${esc(s.cat)}" data-key="${esc((s.name + ' ' + s.sku).toLowerCase())}"${s.hidden ? ' style="opacity:0.45"' : ''}>
      <td><div class="s-cell"><span class="sq ${esc(s.sq)}"><span class="material-symbols-outlined">${esc(s.icon)}</span></span><div><div class="cell-main">${esc(s.name)}</div><div class="cell-sub">SKU: ${esc(s.sku)} • ${esc(s.desc)}</div></div></div></td>
      <td><span class="chip ${esc(s.chip)}">${esc(s.categoryLabel)}</span></td>
      <td><span class="dur"><span class="material-symbols-outlined">${esc(durIcon)}</span>${esc(s.duration)}</span></td>
      <td class="price">${Number(s.price).toLocaleString('vi-VN')} đ</td>
      <td><span class="chip chip-gray"><span class="material-symbols-outlined">${esc(s.partnerIcon)}</span>${Number(s.partners)} ${partnerUnit}</span></td>
      <td><span class="st-cell">${switchInner(s.sku, s.active)}</span></td>
      <td class="acts"><button class="icon-act" data-open="modalChecklist" title="AI Checklist"><span class="material-symbols-outlined">auto_awesome</span></button><button class="icon-act" data-edit="${esc(s.sku)}" title="Sửa"><span class="material-symbols-outlined">edit</span></button><button class="icon-act" data-hide="${esc(s.sku)}" title="Ẩn"><span class="material-symbols-outlined">visibility_off</span></button></td>
    </tr>`;
  }

  function render() {
    tbody.innerHTML = services.map(renderRow).join('');
    apply();
  }

  /* Lọc tab + search */
  function apply() {
    const q = document.getElementById('sSearch').value.trim().toLowerCase();
    let n = 0;
    [...tbody.querySelectorAll('tr')].forEach(r => {
      const ok = (cat === 'all' || r.dataset.cat === cat) && (!q || r.dataset.key.includes(q));
      r.style.display = ok ? '' : 'none';
      if (ok) n++;
    });
    document.getElementById('sCount').textContent = `Hiển thị ${n} / 24 dịch vụ khả dụng`;
  }

  document.querySelectorAll('#tabs .tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('#tabs .tab').forEach(x => x.classList.remove('on'));
    t.classList.add('on'); cat = t.dataset.cat; apply();
  }));
  document.getElementById('sSearch').addEventListener('input', apply);

  /* Toggle trạng thái cung ứng */
  tbody.addEventListener('change', async e => {
    const sw = e.target.closest('input[data-sku]');
    if (!sw) return;
    const checked = sw.checked;
    const cell = sw.closest('.st-cell');
    const sku = sw.dataset.sku;
    cell.innerHTML = switchInner(sku, checked);
    const svc = services?.find(s => s.sku === sku);
    if (checked) {
      UI.toast(`Đã bật cung ứng dịch vụ ${sku}.`, 'ok', 'toggle_on');
    } else {
      UI.toast(`Đã tạm dừng nhận dịch vụ ${sku}.`, 'info', 'toggle_off');
    }
    if (svc) {
      svc.active = checked;
      if (window.MockAPI) {
        try { await MockAPI.patch('services', svc.id, { active: checked }); }
        catch (err) {
          console.warn('[MockAPI]', err.message);
          UI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'err', 'error');
        }
      }
    }
  });

  /* Sửa / ẩn */
  tbody.addEventListener('click', async e => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      UI.toast(`Mở trình chỉnh sửa ${editBtn.dataset.edit}...`, 'info', 'edit');
      return;
    }
    const hideBtn = e.target.closest('[data-hide]');
    if (hideBtn) {
      const row = hideBtn.closest('tr');
      const willHide = row.style.opacity !== '0.45';
      row.style.opacity = willHide ? '0.45' : '';
      UI.toast(willHide ? 'Đã ẩn dịch vụ khỏi khách hàng.' : 'Đã hiện lại dịch vụ.', 'info', 'visibility_off');
      const svc = services?.find(s => s.sku === hideBtn.dataset.hide);
      if (svc) {
        svc.hidden = willHide;
        if (window.MockAPI) {
          try { await MockAPI.patch('services', svc.id, { hidden: willHide }); }
          catch (err) {
            console.warn('[MockAPI]', err.message);
            UI.toast('Không đồng bộ được máy chủ — thay đổi chỉ lưu tạm.', 'err', 'error');
          }
        }
      }
    }
  });

  /* Lưu checklist */
  document.getElementById('btnSaveCk').addEventListener('click', () => {
    if (!document.querySelector('[data-step="temp"]').checked || !document.querySelector('[data-step="eyes"]').checked) {
      UI.toast('Không thể bỏ bước kiểm tra bắt buộc!', 'err', 'error'); return;
    }
    UI.close('modalChecklist'); UI.toast('Đã lưu cấu hình AI Checklist BTL-35.', 'ok', 'save');
  });

  /* Tạo dịch vụ mới */
  document.getElementById('btnSaveNew').addEventListener('click', async () => {
    const name = document.getElementById('nName').value.trim();
    const price = document.getElementById('nPrice').value;
    if (!name || !price) { UI.toast('Vui lòng nhập đủ tên và giá dịch vụ.', 'err', 'error'); return; }
    const catSel = document.getElementById('nCat');
    const conf = CAT_MAP[catSel.value];
    const sku = (catSel.value === 'y-te' ? 'MED' : catSel.value === 'spa' ? 'SPA' : 'TRN') + '-NEW-' + Math.floor(Math.random() * 90 + 10);
    const payload = {
      name: name,
      sku: sku,
      desc: 'Mới tạo',
      cat: catSel.value,
      categoryLabel: conf.label,
      chip: conf.chip,
      sq: conf.sq,
      icon: conf.icon,
      duration: document.getElementById('nDur').value || '—',
      price: Number(price),
      partners: 0,
      partnerIcon: 'local_hospital',
      active: true,
      hidden: false
    };

    let saved = null;
    if (window.MockAPI) {
      try { saved = await MockAPI.create('services', payload); }
      catch (err) {
        console.warn('[MockAPI]', err.message);
        UI.toast('Không kết nối được mock API — dịch vụ chỉ lưu tạm trên giao diện.', 'err', 'error');
      }
    }
    const row = saved || payload;
    if (services) {
      services.push(row);
      render();
    } else {
      tbody.insertAdjacentHTML('beforeend', renderRow(row));
      apply();
    }
    UI.close('modalCreate');
    UI.toast(`Đã tạo dịch vụ "${name}" (${sku}).`, 'ok', 'add_circle');
  });

  /* Xuất + phân trang */
  document.getElementById('btnExport').addEventListener('click', () => UI.toast('Đang xuất biểu phí PDF...', 'info', 'download'));
  document.querySelectorAll('.pager .pg').forEach(p => p.addEventListener('click', () => {
    if (p.disabled || p.querySelector('.material-symbols-outlined')) return;
    document.querySelectorAll('.pager .pg').forEach(x => x.classList.remove('on')); p.classList.add('on');
    UI.toast(`Chuyển sang trang ${p.textContent}...`, 'info', 'swap_horiz');
  }));

  /* INIT - tải danh mục dịch vụ từ mock API */
  async function load() {
    if (window.MockAPI) {
      try {
        const data = await MockAPI.list('services');
        if (Array.isArray(data)) { services = data; render(); return; }
      } catch (err) {
        console.warn('[MockAPI] services:', err.message);
      }
    }
    apply();
  }

  load();
});
