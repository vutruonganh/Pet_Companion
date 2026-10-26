/* Client fetch dùng chung cho mock API.
   - Chạy qua mock-api/server.js: base = /api/v1
   - Mở trực tiếp file://: base = http://localhost:4000/api/v1
   - Deploy thật (MockAPI.io): đặt window.MOCK_API_BASE = 'https://xxx.mockapi.io/api/v1' trước khi load file này.
*/
(function () {
  const override = typeof window.MOCK_API_BASE === 'string' ? window.MOCK_API_BASE.trim() : '';
  const base = (override || (location.protocol === 'file:'
    ? 'http://localhost:4000/api/v1'
    : location.origin + '/api/v1')).replace(/\/+$/, '');

  /* Portal guard: trang trong /owner|/provider|/trainer|/admin chỉ mở đúng vai trò.
     Đặt GUARD_ROLES = false nếu muốn mở tự do khi quay demo. */
  const GUARD_ROLES = true;
  const SESSION_KEY = 'pc_mock_v1:session';
  const PORTAL_LOGIN = '../login%20register/login.html';

  (function guardPortal() {
    if (!GUARD_ROLES) return;
    const matched = location.pathname.match(/\/(owner|provider|trainer|admin)\/([^/?#]+\.html)/i);
    if (!matched) return;
    let session = null;
    try {
      session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || 'null');
    } catch (err) {
      session = null;
    }
    if (session && String(session.role).toLowerCase() === matched[1].toLowerCase()) return;
    document.documentElement.style.display = 'none';   // không để lộ nội dung trang lúc chuyển hướng
    location.replace(PORTAL_LOGIN + '?' + (session ? 'denied=1' : 'auth=1') +
      '&next=' + encodeURIComponent(matched[1].toLowerCase() + '/' + matched[2]));
  })();

  async function request(path, options) {
    const opts = options || {};
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(base + path, {
        method: opts.method || 'GET',
        headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal
      });
      if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} → HTTP ${res.status}`);
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      if (err && err.name === 'AbortError') {
        throw new Error('Máy chủ mock API không phản hồi kịp (quá 6 giây). Hãy kiểm tra server rồi thử lại.');
      }
      if (err instanceof TypeError) {
        throw new Error('Không kết nối được mock API. Hãy chạy start.bat (cổng 4000) rồi thử lại.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  function query(params) {
    if (!params) return '';
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') usp.append(key, value);
    });
    const qs = usp.toString();
    return qs ? '?' + qs : '';
  }

  window.MockAPI = {
    base,
    list: (resource, params) => request(`/${resource}${query(params)}`),
    get: (resource, id) => request(`/${resource}/${id}`),
    create: (resource, data) => request(`/${resource}`, { method: 'POST', body: data }),
    update: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: data }),
    patch: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PATCH', body: data }),
    remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' })
  };
})();
