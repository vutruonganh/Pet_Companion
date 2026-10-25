document.addEventListener('DOMContentLoaded',()=>{
  const rows=[...document.querySelectorAll('#sBody tr')];
  let cat='all';
  /* Lọc tab + search */
  const apply=()=>{
    const q=document.getElementById('sSearch').value.trim().toLowerCase();
    let n=0;
    rows.forEach(r=>{
      const ok=(cat==='all'||r.dataset.cat===cat)&&(!q||r.dataset.key.includes(q));
      r.style.display=ok?'':'none'; if(ok)n++;
    });
    document.getElementById('sCount').textContent=`Hiển thị ${n} / 24 dịch vụ khả dụng`;
  };
  document.querySelectorAll('#tabs .tab').forEach(t=>t.addEventListener('click',()=>{
    document.querySelectorAll('#tabs .tab').forEach(x=>x.classList.remove('on'));
    t.classList.add('on'); cat=t.dataset.cat; apply();
  }));
  document.getElementById('sSearch').addEventListener('input',apply);
  /* Toggle trạng thái cung ứng */
  document.querySelectorAll('.switch input').forEach(sw=>sw.addEventListener('change',()=>{
    const cell=sw.closest('.st-cell'), sku=sw.dataset.sku;
    if(sw.checked){cell.innerHTML='';cell.append(sw.closest('label'));const b=document.createElement('b');b.className='st-on';b.textContent='Đang cung ứng';cell.append(b);UI.toast(`Đã bật cung ứng dịch vụ ${sku}.`,'ok','toggle_on');}
    else{const b=cell.querySelector('b');b.className='st-off';b.textContent='Tạm dừng nhận';UI.toast(`Đã tạm dừng nhận dịch vụ ${sku}.`,'info','toggle_off');}
  }));
  /* Sửa / ẩn */
  document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>UI.toast(`Mở trình chỉnh sửa ${b.dataset.edit}...`,'info','edit')));
  document.querySelectorAll('[data-hide]').forEach(b=>b.addEventListener('click',()=>{
    const row=b.closest('tr'); row.style.opacity=row.style.opacity==='0.45'?'':'0.45';
    UI.toast(row.style.opacity?'Đã ẩn dịch vụ khỏi khách hàng.':'Đã hiện lại dịch vụ.','info','visibility_off');
  }));
  /* Lưu checklist */
  document.getElementById('btnSaveCk').addEventListener('click',()=>{
    if(!document.querySelector('[data-step="temp"]').checked||!document.querySelector('[data-step="eyes"]').checked){
      UI.toast('Không thể bỏ bước kiểm tra bắt buộc!','err','error');return;
    }
    UI.close('modalChecklist');UI.toast('Đã lưu cấu hình AI Checklist BTL-35.','ok','save');
  });
  /* Tạo dịch vụ mới */
  document.getElementById('btnSaveNew').addEventListener('click',()=>{
    const name=document.getElementById('nName').value.trim();
    const price=document.getElementById('nPrice').value;
    if(!name||!price){UI.toast('Vui lòng nhập đủ tên và giá dịch vụ.','err','error');return;}
    const catSel=document.getElementById('nCat');
    const map={'y-te':['chip-mint','sq-mint','clinical_notes'],'spa':['chip-pink','sq-pink','content_cut'],'hl':['chip-amber','sq-amber','sports_score']};
    const [chip,sq,icon]=map[catSel.value];
    const sku=(catSel.value==='y-te'?'MED':catSel.value==='spa'?'SPA':'TRN')+'-NEW-'+Math.floor(Math.random()*90+10);
    const tr=document.createElement('tr');
    tr.dataset.cat=catSel.value; tr.dataset.key=name.toLowerCase()+' '+sku.toLowerCase();
    tr.innerHTML=`<td><div class="s-cell"><span class="sq ${sq}"><span class="material-symbols-outlined">${icon}</span></span><div><div class="cell-main">${name}</div><div class="cell-sub">SKU: ${sku} • Mới tạo</div></div></div></td>
      <td><span class="chip ${chip}">${catSel.options[catSel.selectedIndex].text}</span></td>
      <td><span class="dur"><span class="material-symbols-outlined">schedule</span>${document.getElementById('nDur').value||'—'}</span></td>
      <td class="price">${Number(price).toLocaleString('vi-VN')} đ</td>
      <td><span class="chip chip-gray"><span class="material-symbols-outlined">local_hospital</span>0 đối tác</span></td>
      <td><span class="st-cell"><label class="switch"><input type="checkbox" checked data-sku="${sku}"><i></i></label><b class="st-on">Đang cung ứng</b></span></td>
      <td class="acts"><button class="icon-act" data-open="modalChecklist"><span class="material-symbols-outlined">auto_awesome</span></button><button class="icon-act" data-edit="${sku}"><span class="material-symbols-outlined">edit</span></button><button class="icon-act" data-hide="${sku}"><span class="material-symbols-outlined">visibility_off</span></button></td>`;
    document.getElementById('sBody').append(tr);
    UI.close('modalCreate'); apply();
    UI.toast(`Đã tạo dịch vụ "${name}" (${sku}).`,'ok','add_circle');
  });
  /* Xuất + phân trang */
  document.getElementById('btnExport').addEventListener('click',()=>UI.toast('Đang xuất biểu phí PDF...','info','download'));
  document.querySelectorAll('.pager .pg').forEach(p=>p.addEventListener('click',()=>{
    if(p.disabled||p.querySelector('.material-symbols-outlined'))return;
    document.querySelectorAll('.pager .pg').forEach(x=>x.classList.remove('on'));p.classList.add('on');
    UI.toast(`Chuyển sang trang ${p.textContent}...`,'info','swap_horiz');
  }));
});