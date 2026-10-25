document.addEventListener('DOMContentLoaded',()=>{
  const rows=[...document.querySelectorAll('#uBody tr')];
  /* ── Lọc 3 điều kiện ── */
  const apply=()=>{
    const r=document.getElementById('uRole').value, s=document.getElementById('uStatus').value;
    const q=document.getElementById('uSearch').value.trim().toLowerCase();
    let n=0;
    rows.forEach(row=>{
      const ok=(r==='all'||row.dataset.role===r)&&(s==='all'||row.dataset.status===s)&&(!q||row.dataset.key.includes(q));
      row.style.display=ok?'':'none'; if(ok)n++;
    });
    document.getElementById('uCount').textContent=`Hiển thị 1 - ${n} của 1,420 tài khoản hệ thống`;
  };
  ['uRole','uStatus'].forEach(id=>document.getElementById(id).addEventListener('change',apply));
  document.getElementById('uSearch').addEventListener('input',apply);

  /* ── Gắn hành động CRUD cho 1 row ── */
  const bind=row=>{
    row.querySelector('[data-view]')?.addEventListener('click',()=>{
      const name=row.querySelector('.cell-main').textContent, uid=row.querySelector('.mono').textContent;
      const role=row.querySelector('.chip').textContent.trim(), tt=row.querySelector('.badge').textContent.trim();
      document.getElementById('viewBody').innerHTML=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><div class="f-label">Họ tên</div><b>${name}</b></div>
          <div><div class="f-label">Mã định danh</div><span class="mono">${uid}</span></div>
          <div><div class="f-label">Vai trò</div><b>${role}</b></div>
          <div><div class="f-label">Trạng thái</div><span class="badge badge-mint"><i></i>${tt}</span></div>
        </div>`;
      UI.open('modalView');
    });
    row.querySelector('[data-mg]')?.addEventListener('click',()=>UI.toast('Mở trình quản lý phân quyền...','info','manage_accounts'));
    row.querySelector('[data-rs]')?.addEventListener('click',()=>UI.toast('Đã gửi yêu cầu đặt lại khóa 2FA.','ok','lock_reset'));
    row.querySelector('[data-mail]')?.addEventListener('click',()=>UI.toast('Đã gửi lại email kích hoạt.','ok','forward_to_inbox'));
    row.querySelector('[data-lock]')?.addEventListener('click',e=>{
      const uid=row.querySelector('.mono').textContent;
      if(!confirm(`Khóa tài khoản ${uid}? Hành động sẽ ghi vào Audit Trail.`))return;
      row.dataset.status='locked';
      row.querySelector('td:nth-child(6)').innerHTML='<span class="badge badge-rose"><i></i>Đang khóa</span>';
      e.currentTarget.outerHTML='<button class="icon-act ok" data-unlock title="Mở khóa"><span class="material-symbols-outlined">lock_open</span></button>';
      bind(row); apply(); UI.toast(`Đã khóa tài khoản ${uid}.`,'ok','block');
    });
    row.querySelector('[data-unlock]')?.addEventListener('click',e=>{
      const uid=row.querySelector('.mono').textContent;
      row.dataset.status='active';
      row.querySelector('td:nth-child(6)').innerHTML='<span class="badge badge-mint"><i></i>Đang hoạt động</span>';
      e.currentTarget.outerHTML='<button class="icon-act no" data-lock title="Khóa"><span class="material-symbols-outlined">block</span></button>';
      bind(row); apply(); UI.toast(`Đã mở khóa tài khoản ${uid}.`,'ok','lock_open');
    });
    row.querySelector('[data-del]')?.addEventListener('click',()=>{
      const uid=row.querySelector('.mono').textContent;
      if(!confirm(`XÓA VĨNH VIỄN tài khoản ${uid}? Không thể hoàn tác!`))return;
      row.style.transition='opacity .3s';row.style.opacity='0';
      setTimeout(()=>{row.remove();apply();},300);
      UI.toast(`Đã xóa vĩnh viễn ${uid}.`,'err','delete_forever');
    });
  };
  rows.forEach(bind);

  /* ── Thêm người dùng ── */
  document.getElementById('btnSaveUser').addEventListener('click',()=>{
    const name=document.getElementById('aName').value.trim();
    const email=document.getElementById('aEmail').value.trim();
    const phone=document.getElementById('aPhone').value.trim();
    if(!name){UI.toast('Vui lòng nhập họ tên.','err','error');return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){UI.toast('Email không hợp lệ.','err','error');return;}
    if(!phone){UI.toast('Vui lòng nhập SĐT.','err','error');return;}
    const role=document.getElementById('aRole');
    const map={'chu-nuoi':['chip-blue','pets','Chủ nuôi'],'bac-si':['chip-mint','medical_services','Bác sĩ thú y / Đối tác'],'hlv':['chip-amber','sports_score','Huấn luyện viên'],'spa':['chip-pink','content_cut','Đối tác Spa']};
    const [chip,icon,label]=map[role.value];
    const uid='UID-VN'+Math.floor(Math.random()*9000+1000);
    const initials=name.split(' ').map(w=>w[0]).slice(-2).join('').toUpperCase();
    const tr=document.createElement('tr');
    tr.dataset.role=role.value;tr.dataset.status='pending';
    tr.dataset.key=`${name} ${uid} ${email} ${phone}`.toLowerCase();
    tr.innerHTML=`<td><div class="u-cell"><div class="avatar-fb">${initials}</div><div><div class="cell-main">${name}</div><div class="mono">${uid}</div></div></div></td>
      <td><span class="chip ${chip}"><span class="material-symbols-outlined">${icon}</span>${label}</span></td>
      <td><div class="cell-main" style="font-weight:600">${email}</div><div class="cell-sub">${phone}</div></td>
      <td><span class="chip chip-gray"><span class="material-symbols-outlined">cruelty_free</span>0 bé cưng</span></td>
      <td><div class="cell-main">Hôm nay</div><div class="cell-sub">Chưa kích hoạt</div></td>
      <td><span class="badge badge-amber"><i></i>Chờ kích hoạt</span></td>
      <td class="acts"><button class="icon-act" data-mail style="color:var(--amber)"><span class="material-symbols-outlined">forward_to_inbox</span></button><button class="icon-act" data-mg><span class="material-symbols-outlined">manage_accounts</span></button><button class="icon-act" data-rs><span class="material-symbols-outlined">lock_reset</span></button><button class="icon-act no" data-del><span class="material-symbols-outlined">delete_outline</span></button></td>`;
    document.getElementById('uBody').prepend(tr);
    bind(tr);
    ['aName','aEmail','aPhone'].forEach(id=>document.getElementById(id).value='');
    UI.close('modalAdd'); apply();
    UI.toast(`Đã tạo tài khoản "${name}" (${uid}).`,'ok','person_add');
  });

  /* ── Xuất CSV thật ── */
  document.getElementById('btnCsv').addEventListener('click',()=>{
    const data=rows.filter(r=>r.style.display!=='none').map(r=>({
      UID:r.querySelector('.mono').textContent,
      Ten:r.querySelector('.cell-main').textContent,
      Email:r.dataset.key.split(' ').slice(-2).join(' '),
      TrangThai:r.dataset.status
    }));
    const csv=[Object.keys(data[0]).join(','),...data.map(d=>Object.values(d).map(v=>`"${v}"`).join(','))].join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
    a.download='petcompanion_users.csv';a.click();URL.revokeObjectURL(a.href);
    UI.toast(`Đã xuất ${data.length} tài khoản ra CSV.`,'ok','ios_share');
  });

  /* ── Phân trang ── */
  document.querySelectorAll('.pager .pg').forEach(p=>p.addEventListener('click',()=>{
    if(p.disabled||p.querySelector('.material-symbols-outlined')||p.classList.contains('pg-dots'))return;
    document.querySelectorAll('.pager .pg').forEach(x=>x.classList.remove('on'));p.classList.add('on');
    UI.toast(`Chuyển sang trang ${p.textContent}...`,'info','swap_horiz');
  }));
  apply();
});