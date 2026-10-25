"""PetCompanion mock API + static server (bản Python, dùng khi máy chưa cài Node.js).

Chạy: python mock-api/server.py  ->  http://localhost:4000

- seed.json : dữ liệu gốc, không bị ghi đè
- db.json   : dữ liệu đang chạy; POST /api/reset sẽ chép lại từ seed.json
- REST      : /api/v1/<resource>[/<id>]  (GET, POST, PUT, PATCH, DELETE)
- Hỗ trợ ?search=, ?sortBy=, ?order=asc|desc, ?page=, ?limit= và lọc theo trường.
"""

import json
import os
import re
import shutil
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE_DIR)
SEED_FILE = os.path.join(BASE_DIR, "seed.json")
DB_FILE = os.path.join(BASE_DIR, "db.json")
PORT = int(os.environ.get("PORT", "4000"))
LOCK = threading.Lock()
RESERVED = {"search", "q", "sortBy", "order", "page", "limit"}

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
}


def load_db():
    with open(DB_FILE, encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, dict):
        raise ValueError("db.json phải là một object")
    return data


def save_db(data):
    tmp = DB_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    os.replace(tmp, DB_FILE)


def as_int(value, default):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def next_id(rows):
    """Sinh id mới theo kiểu đang dùng: 1, 2... hoặc TP-007, L-012, u6, p6."""
    numeric = []
    families = {}
    for row in rows:
        rid = str(row.get("id", ""))
        if rid.isdigit():
            numeric.append(int(rid))
            continue
        match = re.match(r"^(.*?)(\d+)$", rid)
        if match:
            prefix, digits = match.group(1), match.group(2)
            previous = families.get(prefix)
            if previous is None or int(digits) > previous[0]:
                families[prefix] = (int(digits), len(digits))

    if families and not numeric:
        prefix, (number, width) = next(iter(families.items()))
        candidate = prefix + str(number + 1).zfill(width)
    else:
        candidate = str(max(numeric, default=0) + 1)

    existing = {str(row.get("id")) for row in rows}
    while candidate in existing:
        match = re.match(r"^(.*?)(\d+)$", candidate)
        if not match:
            candidate += "-1"
            continue
        prefix, digits = match.group(1), match.group(2)
        candidate = prefix + str(int(digits) + 1).zfill(len(digits))
    return candidate


def filter_rows(rows, query_string):
    params = parse_qs(query_string, keep_blank_values=True)

    def last(name, default=""):
        values = params.get(name) or [default]
        return values[-1]

    needle = (last("search") or last("q")).strip().casefold()
    result = list(rows)
    if needle:
        result = [
            row for row in result
            if needle in json.dumps(row, ensure_ascii=False).casefold()
        ]

    for name, values in params.items():
        if name in RESERVED:
            continue
        expected = (values[-1] or "").casefold()
        result = [
            row for row in result
            if str(row.get(name, "")).casefold() == expected
        ]

    sort_by = last("sortBy").strip()
    if sort_by:
        descending = last("order", "asc").strip().lower() == "desc"
        result.sort(
            key=lambda row: str(row.get(sort_by, "")).casefold(),
            reverse=descending,
        )

    page = max(1, as_int(last("page"), 1))
    limit = max(0, as_int(last("limit"), 0))
    if limit:
        start = (page - 1) * limit
        result = result[start:start + limit]
    return result


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        pass

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return MIME.get(ext) or super().guess_type(path)

    # ---------- helpers ----------
    def send_payload(self, status, payload=None):
        body = b"" if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        head_only = self.command == "HEAD"
        self.send_response(status)
        if body:
            self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(0 if head_only else len(body)))
        self.end_headers()
        if body and not head_only:
            self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        if length > 1_000_000:
            raise ValueError("payload too large")
        raw = self.rfile.read(length).decode("utf-8")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("invalid JSON body") from exc
        if not isinstance(data, dict):
            raise ValueError("Body must be a JSON object")
        return data

    def health(self, data):
        return {
            "status": "ok",
            "ok": True,
            "service": "MockAPI",
            "resources": {name: len(rows) for name, rows in data.items() if isinstance(rows, list)},
        }

    def handle_api(self, method):
        url = urlparse(self.path)
        if not url.path.startswith("/api"):
            return False
        parts = [part for part in url.path.split("/") if part]

        if url.path == "/api/health" and method in ("GET", "HEAD"):
            with LOCK:
                data = load_db()
            self.send_payload(200, self.health(data))
            return True

        if url.path == "/api/reset" and method == "POST":
            with LOCK:
                shutil.copyfile(SEED_FILE, DB_FILE)
                data = load_db()
            self.send_payload(200, dict(self.health(data), status="reset"))
            return True

        if len(parts) < 3 or parts[0] != "api" or parts[1] != "v1":
            self.send_payload(404, {"error": "Not found"})
            return True

        resource = parts[2]
        item_id = parts[3] if len(parts) > 3 else None

        with LOCK:
            data = load_db()
            rows = data.get(resource)
            if not isinstance(rows, list):
                self.send_payload(404, {"error": "Unknown resource: " + resource})
                return True

            if item_id is None:
                if method in ("GET", "HEAD"):
                    self.send_payload(200, filter_rows(rows, url.query))
                    return True
                if method == "POST":
                    try:
                        body = self.read_json()
                    except ValueError as exc:
                        self.send_payload(400, {"error": str(exc)})
                        return True
                    row = dict(body)
                    row.pop("id", None)
                    row["id"] = next_id(rows)
                    rows.append(row)
                    save_db(data)
                    self.send_payload(201, row)
                    return True
                self.send_payload(405, {"error": "Method not allowed"})
                return True

            index = next(
                (i for i, row in enumerate(rows) if str(row.get("id")) == str(item_id)),
                None,
            )
            if index is None:
                self.send_payload(404, {"error": "Not found: %s/%s" % (resource, item_id)})
                return True

            if method in ("GET", "HEAD"):
                self.send_payload(200, rows[index])
                return True

            if method in ("PUT", "PATCH"):
                try:
                    body = self.read_json()
                except ValueError as exc:
                    self.send_payload(400, {"error": str(exc)})
                    return True
                old = rows[index]
                fields = {key: value for key, value in body.items() if key not in ("id", "createdAt")}
                if method == "PUT":
                    row = {"id": old.get("id")}
                    if "createdAt" in old:
                        row["createdAt"] = old["createdAt"]
                    row.update(fields)
                else:
                    row = {**old, **fields, "id": old.get("id")}
                rows[index] = row
                save_db(data)
                self.send_payload(200, row)
                return True

            if method == "DELETE":
                rows.pop(index)
                save_db(data)
                self.send_payload(204)
                return True

        self.send_payload(405, {"error": "Method not allowed"})
        return True

    # ---------- HTTP verbs ----------
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def blocked_mock_path(self, path):
        # Chỉ cho phép nạp adapter giao diện; mọi file dữ liệu trong mock-api/ đều bị chặn.
        return (path == "/mock-api" or path.startswith("/mock-api/")) and path != "/mock-api/api.js"

    def do_GET(self):
        if self.handle_api("GET"):
            return
        path = unquote(urlparse(self.path).path)
        if self.blocked_mock_path(path):
            self.send_payload(403, {"error": "Forbidden"})
            return
        if path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_HEAD(self):
        if self.handle_api("HEAD"):
            return
        path = unquote(urlparse(self.path).path)
        if self.blocked_mock_path(path):
            self.send_payload(403)
            return
        if path == "/":
            self.path = "/index.html"
        super().do_HEAD()

    def do_POST(self):
        if not self.handle_api("POST"):
            self.send_payload(405, {"error": "Method not allowed"})

    def do_PUT(self):
        if not self.handle_api("PUT"):
            self.send_payload(405, {"error": "Method not allowed"})

    def do_PATCH(self):
        if not self.handle_api("PATCH"):
            self.send_payload(405, {"error": "Method not allowed"})

    def do_DELETE(self):
        if not self.handle_api("DELETE"):
            self.send_payload(405, {"error": "Method not allowed"})


def main():
    if not os.path.exists(DB_FILE):
        shutil.copyfile(SEED_FILE, DB_FILE)
    if len(sys.argv) > 1 and not os.environ.get("PORT"):
        try:
            globals()["PORT"] = int(sys.argv[1])
        except ValueError:
            pass

    try:
        server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError as error:
        print("[mockapi] Khong the mo cong %d: %s" % (PORT, error))
        print("[mockapi] Hay tat ung dung dang dung cong nay hoac dat bien moi truong PORT.")
        raise SystemExit(1)

    with LOCK:
        data = load_db()
    counts = ", ".join("%s=%d" % (name, len(rows)) for name, rows in data.items() if isinstance(rows, list))
    print("PetCompanion MockAPI + static server (Python): http://localhost:%d" % PORT)
    print("REST base  : http://localhost:%d/api/v1" % PORT)
    print("Du lieu    : seed.json -> db.json (POST /api/reset de khoi phuc)")
    print("Resources  : " + counts)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()
        sys.exit(0)


if __name__ == "__main__":
    main()
