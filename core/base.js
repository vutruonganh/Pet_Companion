window.UI={
  toast(msg,type='ok',icon='check_circle'){
    let box=document.querySelector('.toasts');
    if(!box){box=document.createElement('div');box.className='toasts';document.body.appendChild(box);}
    const t=document.createElement('div');t.className='toast '+type;
    t.innerHTML=`<span class="material-symbols-outlined">${icon}</span><span>${msg}</span>`;
    box.appendChild(t);setTimeout(()=>t.remove(),3600);
  },
  open(id){document.getElementById(id)?.classList.add('on')},
  close(id){document.getElementById(id)?.classList.remove('on')}
};
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-open]'); if(o)UI.open(o.dataset.open);
  const c=e.target.closest('[data-close]'); if(c)UI.close(c.dataset.close);
  if(e.target.classList.contains('modal-ov'))e.target.classList.remove('on');
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-ov.on').forEach(m=>m.classList.remove('on'))});
/* Avatar fallback: ảnh lỗi → hiện initials */
document.addEventListener('error',e=>{
  const img=e.target;
  if(img.tagName==='IMG'&&img.dataset.fallback){
    const d=document.createElement('div');
    d.className=img.dataset.fbClass||'avatar-fb';
    d.textContent=img.dataset.fallback;
    img.replaceWith(d);
  }
},true);