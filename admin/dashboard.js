document.addEventListener('DOMContentLoaded',()=>{
  const APTS={
    1049:{kh:'Trần Minh Anh',pet:'Miu Miu (Mèo Anh)',dv:'Cấp cứu hô hấp',dt:'Bệnh viện PetCare Q.7',tg:'10:30 Hôm nay',tt:'Chờ duyệt'},
    1048:{kh:'Lê Hoàng Yến',pet:'Rocky (Corgi)',dv:'Spa & Grooming',dt:'PawPaws Boutique Spa',tg:'11:15 Hôm nay',tt:'Đang xử lý'},
    1047:{kh:'Nguyễn Quốc Thái',pet:'Simba (Golden)',dv:'Huấn luyện cơ bản',dt:'HLV Trọng Nghĩa',tg:'14:00 Chiều nay',tt:'Chờ duyệt'},
    1046:{kh:'Đỗ Thùy Trang',pet:'Bông (Poodle)',dv:'Tiêm ngừa dại',dt:'Phòng khám Vets&Friends',tg:'15:30 Chiều nay',tt:'Đã duyệt'}
  };
  /* Chi tiết ca hẹn */
  document.querySelectorAll('[data-apt]').forEach(b=>b.addEventListener('click',()=>{
    const d=APTS[b.dataset.apt]; if(!d)return;
    document.getElementById('aptCode').textContent='#PET-'+b.dataset.apt;
    document.getElementById('aptBody').innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div><div class="f-label">Khách hàng</div><b>${d.kh}</b></div>
        <div><div class="f-label">Thú cưng</div><b>${d.pet}</b></div>
        <div><div class="f-label">Dịch vụ</div><b>${d.dv}</b></div>
        <div><div class="f-label">Đối tác</div><b>${d.dt}</b></div>
        <div><div class="f-label">Thời gian</div><b>${d.tg}</b></div>
        <div><div class="f-label">Trạng thái</div><span class="badge badge-mint"><i></i>${d.tt}</span></div>
      </div>`;
    UI.open('modalApt');
  }));
  /* Duyệt / hủy ca hẹn */
  document.querySelectorAll('[data-approve]').forEach(b=>b.addEventListener('click',()=>{
    const row=b.closest('tr');
    row.querySelector('.badge').className='badge badge-mint';
    row.querySelector('.badge').innerHTML='<i></i>Đã duyệt';
    UI.toast(`Đã duyệt ca hẹn #PET-${b.dataset.approve}.`,'ok','check_circle');
  }));
  document.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>{
    if(!confirm(`Hủy ca hẹn #PET-${b.dataset.cancel}?`))return;
    const row=b.closest('tr');
    row.querySelector('.badge').className='badge badge-rose';
    row.querySelector('.badge').innerHTML='<i></i>Đã hủy';
    UI.toast(`Đã hủy ca hẹn #PET-${b.dataset.cancel}.`,'err','cancel');
  }));
  /* Xuất dữ liệu / PDF / Broadcast */
  document.getElementById('btnExport').addEventListener('click',()=>UI.toast('Đang xuất dữ liệu hệ thống...','info','download'));
  document.getElementById('btnPdf').addEventListener('click',()=>UI.toast('Đang tạo báo cáo PDF / Excel...','info','picture_as_pdf'));
  document.getElementById('btnBroadcast').addEventListener('click',()=>{UI.close('modalBroadcast');UI.toast('Đã phát thông báo tới toàn hệ thống.','ok','campaign');});
});