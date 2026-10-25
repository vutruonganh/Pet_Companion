/* Shell + helper dùng chung cho 3 trang cổng chủ nuôi.
   Phụ thuộc: ../core/base.js (UI toast/modal), ../core/api.js (MockAPI). */
(function () {
  'use strict';

  const NAV = [
    { key: 'pets', href: 'owner-pets.html', icon: 'pets', label: 'Hồ sơ thú cưng' },
    { key: 'care', href: 'owner-care.html', icon: 'calendar_month', label: 'Lịch chăm sóc' },
    { key: 'records', href: 'owner-records.html', icon: 'receipt_long', label: 'Lịch sử dịch vụ' },
    { key: 'ai', href: 'owner-care.html#ai', icon: 'auto_awesome', label: 'AI Trợ lý PetCare', badge: 'AI' }
  ];

  const PAGE = document.body.dataset.page || 'pets';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function money(value) {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const parts = String(iso).split('-');
    return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : iso;
  }

  function weekday(iso) {
    const date = new Date(iso + 'T00:00:00');
    return ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()];
  }

  function todayISO() {
    const now = new Date();
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  }

  function initials(name) {
    const text = String(name || '?').trim();
    const words = text.split(/\s+/);
    return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : text.slice(0, 2)).toUpperCase();
  }

  function avatar(pet, className) {
    const cls = className || 'pet-avatar-img';
    if (pet && pet.avatar) {
      return '<img class="' + cls + '" src="' + esc(pet.avatar) + '" alt="' + esc(pet.name) +
        '" data-fallback="' + esc(initials(pet.name)) + '" data-fb-class="avatar-fb">';
    }
    return '<div class="avatar-fb ' + cls + '">' + esc(initials(pet && pet.name)) + '</div>';
  }

  function petById(pets, id) {
    return (pets || []).find(function (pet) { return String(pet.id) === String(id); }) || { id: id, name: 'Thú cưng' };
  }

  function badge(status) {
    const map = {
      healthy: ['badge-mint', 'check_circle'],
      'needs-care': ['badge-amber', 'schedule'],
      cancelled: ['badge-rose', 'cancel']
    };
    return map[status] || ['badge-mint', 'check_circle'];
  }

  const TYPE_META = {
    medical: { label: 'Khám & Tiêm chủng', icon: 'vaccines' },
    spa: { label: 'Spa & Cắt tỉa', icon: 'content_cut' },
    medication: { label: 'Uống thuốc định kỳ', icon: 'medication' }
  };

  function planStatusClass(status) {
    if (status === 'pending') return 'status-pill pending';
    if (status === 'cancelled') return 'status-pill cancelled';
    return 'status-pill';
  }

  function queryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  async function list(resource, params) {
    try {
      return await window.MockAPI.list(resource, params);
    } catch (error) {
      console.error('[Owner]', error);
      window.UI.toast('Không tải được dữ liệu. Hãy chạy start.bat rồi mở lại trang.', 'err', 'cloud_off');
      return [];
    }
  }

  window.Owner = {
    esc: esc,
    money: money,
    fmtDate: fmtDate,
    weekday: weekday,
    todayISO: todayISO,
    initials: initials,
    avatar: avatar,
    petById: petById,
    badge: badge,
    TYPE_META: TYPE_META,
    planStatusClass: planStatusClass,
    queryParam: queryParam,
    downloadJSON: downloadJSON,
    list: list
  };

  function headerHTML() {
    const links = NAV.map(function (item) {
      const active = item.key === PAGE ? ' active' : '';
      const badgeHtml = item.badge ? '<span class="ai-badge">' + item.badge + '</span>' : '';
      return '<a class="nav-link' + active + '" href="' + item.href + '">' +
        '<span class="material-symbols-outlined">' + item.icon + '</span>' + item.label + badgeHtml + '</a>';
    }).join('');

    return '<header class="topnav">' +
      '<a class="brand" href="../index.html" style="text-decoration:none;color:inherit"><img class="brand-logo" src="../assets/logoPet-trim.png" alt="PetCompanion"></a>' +
      '<span class="admin-pill">Chủ nuôi<br>(Owner)</span>' +
      '<nav class="nav-links">' + links + '</nav>' +
      '<label class="nav-search"><span class="material-symbols-outlined">search</span><input id="gSearch" placeholder="Tìm kiếm nhanh..." aria-label="Tìm kiếm"></label>' +
      '<button class="nav-bell" id="gBell" type="button" aria-label="Thông báo"><span class="material-symbols-outlined">notifications</span><span class="dot"></span></button>' +
      '<div class="nav-user"><b>Nguyễn Văn An</b><span>Chủ nuôi đã xác minh</span></div>' +
      '</header>';
  }

  function footerHTML() {
    return '<footer class="sys-footer">' +
      '<div class="live"><i></i>Hệ thống phòng khám &amp; Trợ lý AI đang hoạt động bình thường</div>' +
      '<div class="foot-links">' +
      '<a href="owner-pets.html">Hồ sơ thú cưng</a>' +
      '<a href="owner-care.html">Lịch chăm sóc</a>' +
      '<a href="owner-records.html">Lịch sử dịch vụ</a>' +
      '<a href="../index.html">Chọn vai trò</a>' +
      '<span>© 2026 PetCompanion Vietnam</span>' +
      '</div></footer>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertAdjacentHTML('afterbegin', headerHTML());
    document.body.insertAdjacentHTML('beforeend', footerHTML());

    const bell = document.getElementById('gBell');
    if (bell) {
      bell.addEventListener('click', function () {
        window.UI.toast('Bạn có 3 thông báo chăm sóc mới trong tuần này.', 'info', 'notifications');
      });
    }

    const search = document.getElementById('gSearch');
    if (search) {
      search.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;
        const value = search.value.trim();
        if (!value) return;
        const target = document.querySelector('[data-global-search]');
        if (target) {
          target.value = value;
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.focus();
        } else {
          window.location.href = 'owner-pets.html?q=' + encodeURIComponent(value);
        }
      });
    }
  });
})();
