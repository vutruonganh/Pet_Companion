(function () {
  'use strict';
  const O = window.Owner;
  const grid = document.getElementById('petsGrid');
  const search = document.getElementById('petSearch');
  const filters = document.getElementById('petFilters');
  const form = document.getElementById('formAddPet');

  let pets = [];
  let plans = [];
  let activeFilter = 'all';

  const SPECIES_LABEL = { dog: 'Chó', cat: 'Mèo', other: 'Khác' };
  const FILTER_LABEL = {
    all: 'Tất cả', dog: 'Chó', cat: 'Mèo', healthy: 'Khỏe mạnh', 'needs-care': 'Cần tái khám'
  };

  function calcAge(iso) {
    if (!iso) return 'Chưa rõ';
    const birth = new Date(iso);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months -= 1;
    if (months < 1) return 'Dưới 1 tháng';
    if (months < 12) return months + ' tháng';
    const years = Math.floor(months / 12);
    const rest = months % 12;
    return rest ? years + ' tuổi ' + rest + ' tháng' : years + ' tuổi';
  }

  function matchesFilter(pet) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'dog' || activeFilter === 'cat') return pet.species === activeFilter;
    return pet.status === activeFilter;
  }

  function visiblePets() {
    const query = (search.value || '').trim().toLowerCase();
    return pets.filter(function (pet) {
      const haystack = [pet.name, pet.breed, pet.speciesLabel, pet.chip, pet.vaccine].join(' ').toLowerCase();
      return matchesFilter(pet) && (!query || haystack.indexOf(query) !== -1);
    });
  }

  function card(pet) {
    const badge = O.badge(pet.status);
    const cover = pet.cover
      ? "background-image:url('" + O.esc(pet.cover) + "')"
      : 'background-image:linear-gradient(135deg,#99f6e4,#ccfbf1)';
    const note = pet.note
      ? '<div class="pet-note"><span class="material-symbols-outlined">notifications_active</span>' +
        '<span><strong>Lưu ý:</strong> ' + O.esc(pet.note) + '</span></div>'
      : '';
    const id = encodeURIComponent(pet.id);

    return '<article class="pet-card" data-id="' + O.esc(pet.id) + '">' +
      '<div class="pet-cover" style="' + cover + '">' +
        '<span class="badge ' + badge[0] + '"><span class="material-symbols-outlined" style="font-size:14px">' + badge[1] + '</span>' + O.esc(pet.statusLabel) + '</span>' +
      '</div>' +
      '<div class="pet-card-body">' +
        '<div class="pet-avatar-wrap">' + O.avatar(pet) + '</div>' +
        '<div class="pet-name-row"><h2 class="pet-name">' + O.esc(pet.name) + '</h2>' +
          '<span class="pet-breed">' + O.esc(pet.breed || pet.speciesLabel) + '</span></div>' +
        '<div class="pet-meta">' +
          '<span class="chip"><span class="material-symbols-outlined" style="font-size:14px">cake</span>' + O.esc(pet.age) + '</span>' +
          '<span class="chip"><span class="material-symbols-outlined" style="font-size:14px">' + O.esc(pet.sexIcon || 'pets') + '</span>' + O.esc(pet.sex) + '</span>' +
          '<span class="chip"><span class="material-symbols-outlined" style="font-size:14px">fitness_center</span>' + O.esc(pet.weight) + '</span>' +
        '</div>' +
        note +
        '<div class="pet-rows">' +
          '<div class="pet-row"><span>Giống</span><span>' + O.esc(pet.breed || pet.speciesLabel) + '</span></div>' +
          '<div class="pet-row"><span>Ngày sinh</span><span>' + O.esc(pet.birth) + '</span></div>' +
          '<div class="pet-row"><span>Microchip ID</span><span>' + O.esc(pet.chip) + '</span></div>' +
          '<div class="pet-row"><span>Tiêm chủng gần nhất</span><span class="accent">' + O.esc(pet.vaccine) + '</span></div>' +
        '</div>' +
        '<div class="pet-actions">' +
          '<a class="btn btn-outline" href="owner-records.html?pet=' + id + '"><span class="material-symbols-outlined">menu_book</span>Sổ y bạ</a>' +
          '<a class="btn btn-primary" href="owner-care.html?pet=' + id + '"><span class="material-symbols-outlined">calendar_month</span>Đặt lịch hẹn</a>' +
        '</div>' +
      '</div></article>';
  }

  const ADD_SLOT =
    '<div class="pet-add" role="button" tabindex="0" data-open="modalAddPet" aria-label="Thêm thú cưng mới">' +
      '<span class="add-circle"><span class="material-symbols-outlined" style="font-size:28px">add</span></span>' +
      '<h3>Thêm bé cưng mới</h3>' +
      '<p>Đăng ký hồ sơ y tế điện tử chuẩn khoa học cho thú cưng mới của bạn.</p>' +
      '<span class="btn btn-outline" style="pointer-events:none">Tạo hồ sơ ngay</span>' +
    '</div>';

  function render() {
    const rows = visiblePets();
    grid.innerHTML = rows.length
      ? rows.map(card).join('') + ADD_SLOT
      : '<div class="empty" style="grid-column:1/-1"><span class="material-symbols-outlined">search_off</span>Không tìm thấy thú cưng phù hợp. Thử xoá bộ lọc hoặc từ khoá khác.</div>' + ADD_SLOT;
    updateFilterCounts();
  }

  function updateFilterCounts() {
    filters.querySelectorAll('.pill-tab').forEach(function (button) {
      const key = button.dataset.filter;
      const count = pets.filter(function (pet) {
        if (key === 'all') return true;
        if (key === 'dog' || key === 'cat') return pet.species === key;
        return pet.status === key;
      }).length;
      button.textContent = FILTER_LABEL[key] + ' (' + count + ')';
    });
  }

  function updateStats() {
    const today = O.todayISO();
    const upcoming = plans.filter(function (plan) {
      return plan.date >= today && plan.status !== 'cancelled';
    }).length;
    document.getElementById('statPets').innerHTML = String(pets.length).padStart(2, '0') + ' <small>bé</small>';
    document.getElementById('statUpcoming').innerHTML = String(upcoming).padStart(2, '0') + ' <small>lịch</small>';
    document.getElementById('aiPetNames').textContent = pets.length
      ? pets.map(function (pet) { return pet.name; }).join(' & ')
      : 'các bé';
  }

  async function reloadPets() {
    const owner = O.currentOwner();
    const rows = await O.list('pets');
    pets = (Array.isArray(rows) ? rows : []).filter(function (pet) {
      return O.belongsToOwner(pet, owner);
    });
    render();
    updateStats();
  }

  function resetForm() {
    form.reset();
  }

  document.addEventListener('DOMContentLoaded', async function () {
    const initialQuery = O.queryParam('q');
    if (initialQuery) search.value = initialQuery;

    const owner = O.currentOwner();
    try {
      const data = await Promise.all([
        O.list('pets', null, { throwOnError: true }),
        O.list('care-plans', null, { throwOnError: true })
      ]);
      pets = (Array.isArray(data[0]) ? data[0] : []).filter(function (pet) {
        return O.belongsToOwner(pet, owner);
      });
      const petIds = pets.map(function (pet) { return String(pet.id); });
      plans = (Array.isArray(data[1]) ? data[1] : []).filter(function (plan) {
        return petIds.indexOf(String(plan.petId)) !== -1;
      });
      render();
      updateStats();
    } catch (error) {
      console.error('[Owner] pets', error);
      pets = [];
      plans = [];
      updateStats();
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><span class="material-symbols-outlined">cloud_off</span>' +
        O.esc(error.message || 'Không tải được hồ sơ thú cưng.') +
        '<button class="btn btn-outline" type="button" data-retry-pets style="margin-top:12px">Thử lại</button></div>';
      window.UI.toast(error.message || 'Không tải được hồ sơ thú cưng từ mock API.', 'err', 'cloud_off');
    }

    search.addEventListener('input', render);

    grid.addEventListener('click', function (event) {
      if (event.target.closest('[data-retry-pets]')) window.location.reload();
    });

    filters.addEventListener('click', function (event) {
      const button = event.target.closest('.pill-tab');
      if (!button) return;
      filters.querySelectorAll('.pill-tab').forEach(function (pill) { pill.classList.remove('active'); });
      button.classList.add('active');
      activeFilter = button.dataset.filter;
      render();
    });

    grid.addEventListener('keydown', function (event) {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('pet-add')) {
        event.preventDefault();
        window.UI.open('modalAddPet');
      }
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      if (!name) { form.querySelector('#petName').focus(); return; }

      const species = String(data.get('species') || 'other');
      const sex = String(data.get('sex') || 'Đực');
      const birth = String(data.get('birth') || '');
      const weight = String(data.get('weight') || '');
      const chip = String(data.get('chip') || '').trim();
      const status = String(data.get('status') || 'healthy');

      const owner = O.currentOwner();
      const payload = {
        owner: owner.name,
        ownerEmail: owner.email,
        name: name,
        species: species,
        speciesLabel: SPECIES_LABEL[species] || 'Khác',
        breed: String(data.get('breed') || '').trim() || SPECIES_LABEL[species],
        sex: sex,
        sexIcon: sex === 'Cái' ? 'female' : 'male',
        age: calcAge(birth),
        birth: birth ? O.fmtDate(birth) : 'Chưa cập nhật',
        weight: weight ? weight + ' kg' : 'Chưa cập nhật',
        chip: chip ? (chip.charAt(0) === '#' ? chip : '#' + chip) : 'Chưa có',
        status: status,
        statusLabel: status === 'healthy' ? 'Sức khỏe tốt' : 'Cần tái khám',
        statusIcon: status === 'healthy' ? 'check_circle' : 'schedule',
        vaccine: 'Chưa cập nhật',
        note: '',
        avatar: '',
        cover: ''
      };

      try {
        await window.MockAPI.create('pets', payload);
        window.UI.close('modalAddPet');
        resetForm();
        window.UI.toast('Đã thêm hồ sơ cho ' + name + '.', 'ok', 'pets');
        await reloadPets();
      } catch (error) {
        console.error('[Owner] create pet', error);
        window.UI.toast('Không lưu được hồ sơ. Kiểm tra mock API đang chạy.', 'err', 'error');
      }
    });
  });
})();
