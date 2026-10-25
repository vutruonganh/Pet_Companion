/* ============================================
   PROVIDER COMMON - UI dùng chung cho module Provider
   Dựa trên design system core/base.css + core/base.js
   ============================================ */

window.ProviderUI = {
  toast(message, type = 'info') {
    const map = {
      success: { cls: 'ok', icon: 'check_circle' },
      info: { cls: 'info', icon: 'info' },
      warning: { cls: 'warn', icon: 'warning' },
      error: { cls: 'err', icon: 'error' }
    };
    const conf = map[type] || map.info;
    if (window.UI) UI.toast(message, conf.cls, conf.icon);
  },

  modal({ id = 'pModal', title = '', icon = 'assignment', body = '', footer = '', width = '560px' }) {
    document.querySelectorAll('.modal-ov.on').forEach(m => m.remove());
    document.getElementById(id)?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-ov on';
    overlay.id = id;
    overlay.innerHTML = `
      <div class="modal" style="max-width:${width}">
        <div class="modal-head">
          <div class="modal-title"><span class="material-symbols-outlined">${icon}</span>${title}</div>
          <button class="modal-x" data-close="${id}" type="button"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot">${footer}</div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }
};
