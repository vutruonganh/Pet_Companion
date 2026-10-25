'use strict';

/* PetCompanion mock API + static server (Node.js).
   Chạy: node mock-api/server.js  ->  http://localhost:4000
   - seed.json : dữ liệu gốc, không bị ghi đè
   - db.json   : dữ liệu đang chạy; POST /api/reset sẽ chép lại từ seed.json
   - REST      : /api/v1/<resource>[/<id>] (GET, POST, PUT, PATCH, DELETE)
   - Hỗ trợ ?search=, ?sortBy=, ?order=asc|desc, ?page=, ?limit= và lọc theo trường.
*/

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SEED_FILE = path.join(__dirname, 'seed.json');
const DB_FILE = path.join(__dirname, 'db.json');
const PORT = Number(process.env.PORT) || 4000;
const RESERVED = new Set(['search', 'q', 'sortBy', 'order', 'page', 'limit']);

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

if (!fs.existsSync(DB_FILE)) fs.copyFileSync(SEED_FILE, DB_FILE);

function readDb() {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('db.json phải là một object');
  }
  return data;
}

function saveDb(data) {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

function nextId(rows) {
  const numeric = [];
  const families = new Map();
  for (const row of rows) {
    const id = String(row.id == null ? '' : row.id);
    if (/^\d+$/.test(id)) {
      numeric.push(Number(id));
      continue;
    }
    const match = id.match(/^(.*?)(\d+)$/);
    if (match) {
      const previous = families.get(match[1]);
      if (!previous || Number(match[2]) > previous.number) {
        families.set(match[1], { number: Number(match[2]), width: match[2].length });
      }
    }
  }

  let candidate;
  if (families.size === 1 && numeric.length === 0) {
    const [prefix, info] = families.entries().next().value;
    candidate = prefix + String(info.number + 1).padStart(info.width, '0');
  } else {
    candidate = String(Math.max(0, ...numeric) + 1);
  }

  const existing = new Set(rows.map((row) => String(row.id)));
  while (existing.has(candidate)) {
    const match = candidate.match(/^(.*?)(\d+)$/);
    candidate = match
      ? match[1] + String(Number(match[2]) + 1).padStart(match[2].length, '0')
      : candidate + '-1';
  }
  return candidate;
}

function filterRows(rows, searchParams) {
  let result = rows.slice();

  const needle = (searchParams.get('search') || searchParams.get('q') || '').trim().toLowerCase();
  if (needle) {
    result = result.filter((row) => JSON.stringify(row).toLowerCase().includes(needle));
  }

  for (const [key, value] of searchParams) {
    if (RESERVED.has(key)) continue;
    const expected = String(value).toLowerCase();
    result = result.filter((row) => String(row[key] == null ? '' : row[key]).toLowerCase() === expected);
  }

  const sortBy = (searchParams.get('sortBy') || '').trim();
  if (sortBy) {
    const direction = (searchParams.get('order') || 'asc').toLowerCase() === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      const left = String(a[sortBy] == null ? '' : a[sortBy]).toLowerCase();
      const right = String(b[sortBy] == null ? '' : b[sortBy]).toLowerCase();
      return left.localeCompare(right) * direction;
    });
  }

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.max(0, parseInt(searchParams.get('limit') || '0', 10) || 0);
  if (limit) {
    const start = (page - 1) * limit;
    result = result.slice(start, start + limit);
  }
  return result;
}

function counts(data) {
  const result = {};
  for (const [name, rows] of Object.entries(data)) {
    if (Array.isArray(rows)) result[name] = rows.length;
  }
  return result;
}

function sendJson(res, status, payload) {
  const body = payload === undefined ? '' : JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': body ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      let data;
      try { data = JSON.parse(raw); }
      catch (error) { return reject(new Error('invalid JSON body')); }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return reject(new Error('Body must be a JSON object'));
      }
      resolve(data);
    });
    req.on('error', reject);
  });
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', ok: true, service: 'MockAPI', resources: counts(readDb()) });
  }

  if (url.pathname === '/api/reset' && req.method === 'POST') {
    fs.copyFileSync(SEED_FILE, DB_FILE);
    return sendJson(res, 200, { status: 'reset', ok: true, service: 'MockAPI', resources: counts(readDb()) });
  }

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api' || parts[1] !== 'v1') {
    return sendJson(res, 404, { error: 'Not found' });
  }

  const resource = parts[2];
  const id = parts[3];
  const data = readDb();
  if (!resource || !Array.isArray(data[resource])) {
    return sendJson(res, 404, { error: 'Unknown resource: ' + (resource || '') });
  }
  const rows = data[resource];

  if (!id) {
    if (req.method === 'GET') {
      return sendJson(res, 200, filterRows(rows, url.searchParams));
    }
    if (req.method === 'POST') {
      let body;
      try { body = await readBody(req); }
      catch (error) { return sendJson(res, 400, { error: error.message }); }
      const row = { ...body };
      delete row.id;
      row.id = nextId(rows);
      rows.push(row);
      saveDb(data);
      return sendJson(res, 201, row);
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const index = rows.findIndex((row) => String(row.id) === String(id));
  if (index === -1) {
    return sendJson(res, 404, { error: `Not found: ${resource}/${id}` });
  }

  if (req.method === 'GET') return sendJson(res, 200, rows[index]);

  if (req.method === 'PUT' || req.method === 'PATCH') {
    let body;
    try { body = await readBody(req); }
    catch (error) { return sendJson(res, 400, { error: error.message }); }
    const old = rows[index];
    const fields = { ...body };
    delete fields.id;
    delete fields.createdAt;
    if (req.method === 'PUT') {
      const row = { id: old.id, ...fields };
      if (old.createdAt) row.createdAt = old.createdAt;
      rows[index] = row;
    } else {
      rows[index] = { ...old, ...fields, id: old.id };
    }
    saveDb(data);
    return sendJson(res, 200, rows[index]);
  }

  if (req.method === 'DELETE') {
    rows.splice(index, 1);
    saveDb(data);
    return sendJson(res, 204);
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
}

function serveStatic(req, res, url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch (error) { return sendJson(res, 400, { error: 'Bad request' }); }
  if (pathname === '/') pathname = '/index.html';
  // Chỉ cho phép nạp adapter giao diện; mọi file dữ liệu trong mock-api/ đều bị chặn.
  if ((pathname === '/mock-api' || pathname.startsWith('/mock-api/')) && pathname !== '/mock-api/api.js') {
    return sendJson(res, 403, { error: 'Forbidden' });
  }

  const file = path.resolve(ROOT, '.' + pathname);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    return sendJson(res, 403, { error: 'Forbidden' });
  }

  fs.stat(file, (error, stat) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found: ' + pathname);
    }
    const target = stat.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (readError, buffer) => {
      if (readError) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not found: ' + pathname);
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
        'Content-Length': buffer.length,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(req.method === 'HEAD' ? undefined : buffer);
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Length': '0'
    });
    return res.end();
  }

  if (url.pathname.startsWith('/api')) {
    Promise.resolve(handleApi(req, res, url)).catch((error) => {
      console.error(error);
      sendJson(res, 500, { error: 'Internal error' });
    });
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, '127.0.0.1', () => {
  const data = readDb();
  console.log(`PetCompanion MockAPI + static server (Node.js): http://localhost:${PORT}`);
  console.log(`REST base : http://localhost:${PORT}/api/v1`);
  console.log('Du lieu   : seed.json -> db.json (POST /api/reset de khoi phuc)');
  console.log('Resources : ' + Object.entries(counts(data)).map(([name, value]) => `${name}=${value}`).join(', '));
});
