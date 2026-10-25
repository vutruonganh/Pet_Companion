/* Mock REST API cho PetCompanion.
   Chạy: node mock-api/server.js  → http://localhost:4000
   API: /api/v1/<resource>[/<id>] (GET, POST, PUT, PATCH, DELETE)
   Static: phục vụ luôn toàn bộ project để trang gọi fetch same-origin.
*/
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_FILE = path.join(__dirname, 'db.json');
const PORT = Number(process.env.PORT) || 4000;

const INITIAL_DB = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
let db = JSON.parse(JSON.stringify(INITIAL_DB));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function saveDb() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

function sendJson(res, status, payload) {
  const body = payload === undefined ? '' : JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch (e) { reject(new Error('invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function nextId(rows) {
  const max = rows.reduce((acc, row) => Math.max(acc, Number(row.id) || 0), 0);
  return String(max + 1);
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, resources: Object.keys(db) });
  }
  if (url.pathname === '/api/reset' && req.method === 'POST') {
    db = JSON.parse(JSON.stringify(INITIAL_DB));
    saveDb();
    return sendJson(res, 200, { reset: true });
  }

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api' || parts[1] !== 'v1') return sendJson(res, 404, { error: 'Not found' });

  const resource = parts[2];
  const id = parts[3];
  if (!resource || !Array.isArray(db[resource])) {
    return sendJson(res, 404, { error: `Unknown resource: ${resource || '(empty)'}` });
  }
  const rows = db[resource];

  if (!id) {
    if (req.method === 'GET') {
      let result = rows.slice();
      for (const [key, value] of url.searchParams) {
        if (key === 'search' || key === 'q') {
          const needle = value.toLowerCase();
          result = result.filter(row => JSON.stringify(row).toLowerCase().includes(needle));
        } else {
          result = result.filter(row => String(row[key]) === value);
        }
      }
      return sendJson(res, 200, result);
    }
    if (req.method === 'POST') {
      let body;
      try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: e.message }); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return sendJson(res, 400, { error: 'Body must be a JSON object' });
      }
      const row = { ...body, id: nextId(rows) };
      rows.push(row);
      saveDb();
      return sendJson(res, 201, row);
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const index = rows.findIndex(row => String(row.id) === String(id));
  if (index === -1) return sendJson(res, 404, { error: `Not found: ${resource}/${id}` });

  if (req.method === 'GET') return sendJson(res, 200, rows[index]);

  if (req.method === 'PUT' || req.method === 'PATCH') {
    let body;
    try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: e.message }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJson(res, 400, { error: 'Body must be a JSON object' });
    }
    rows[index] = { ...rows[index], ...body, id: rows[index].id };
    saveDb();
    return sendJson(res, 200, rows[index]);
  }

  if (req.method === 'DELETE') {
    rows.splice(index, 1);
    saveDb();
    return sendJson(res, 204);
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/admin/dashboard.html';
  if (pathname.startsWith('/mock-api/')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }
  const file = path.resolve(ROOT, '.' + pathname);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found: ' + pathname);
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (url.pathname.startsWith('/api')) {
    Promise.resolve(handleApi(req, res, url)).catch(err => {
      console.error(err);
      sendJson(res, 500, { error: 'Internal error' });
    });
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log(`PetCompanion mock API + static server: http://localhost:${PORT}`);
  console.log(`REST base: http://localhost:${PORT}/api/v1`);
  console.log(`Resources: ${Object.keys(db).join(', ')}`);
});
