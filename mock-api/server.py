"""PetCompanion mock API + static server (bản Python, dùng khi máy chưa cài Node.js).

Chạy: python mock-api/server.py  ->  http://localhost:4000
Cùng hợp đồng với server.js: /api/v1/<resource>[/<id>] (GET, POST, PUT, PATCH, DELETE).
"""

import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE_DIR)
DB_FILE = os.path.join(BASE_DIR, "db.json")
PORT = int(os.environ.get("PORT", "4000"))

with open(DB_FILE, encoding="utf-8") as fh:
    INITIAL_DB = json.load(fh)
db = json.loads(json.dumps(INITIAL_DB))


def save_db():
    tmp = DB_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(db, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    os.replace(tmp, DB_FILE)


def next_id(rows):
    return str(max([int(row.get("id", 0)) for row in rows], default=0) + 1)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        pass

    # ---------- helpers ----------
    def send_payload(self, status, payload=None):
        body = b"" if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
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

    def api_route(self):
        url = urlparse(self.path)
        if not url.path.startswith("/api"):
            return None
        parts = [p for p in url.path.split("/") if p]
        return url, parts

    def handle_api(self, method):
        routed = self.api_route()
        if routed is None:
            return False
        url, parts = routed

        if url.path == "/api/health" and method == "GET":
            self.send_payload(200, {"ok": True, "resources": list(db.keys())})
            return True

        if url.path == "/api/reset" and method == "POST":
            db.clear()
            db.update(json.loads(json.dumps(INITIAL_DB)))
            save_db()
            self.send_payload(200, {"reset": True})
            return True

        if len(parts) < 3 or parts[0] != "api" or parts[1] != "v1":
            self.send_payload(404, {"error": "Not found"})
            return True

        resource = parts[2]
        item_id = parts[3] if len(parts) > 3 else None
        if resource not in db or not isinstance(db[resource], list):
            self.send_payload(404, {"error": "Unknown resource: " + resource})
            return True
        rows = db[resource]

        if item_id is None:
            if method == "GET":
                result = list(rows)
                for key, values in parse_qs(url.query, keep_blank_values=True).items():
                    value = values[-1]
                    if key in ("search", "q"):
                        needle = value.lower()
                        result = [r for r in result if needle in json.dumps(r, ensure_ascii=False).lower()]
                    else:
                        result = [r for r in result if str(r.get(key)) == value]
                self.send_payload(200, result)
                return True
            if method == "POST":
                try:
                    body = self.read_json()
                except ValueError as exc:
                    self.send_payload(400, {"error": str(exc)})
                    return True
                row = dict(body)
                row["id"] = next_id(rows)
                rows.append(row)
                save_db()
                self.send_payload(201, row)
                return True
            self.send_payload(405, {"error": "Method not allowed"})
            return True

        index = next((i for i, r in enumerate(rows) if str(r.get("id")) == str(item_id)), None)
        if index is None:
            self.send_payload(404, {"error": "Not found: %s/%s" % (resource, item_id)})
            return True

        if method == "GET":
            self.send_payload(200, rows[index])
            return True

        if method in ("PUT", "PATCH"):
            try:
                body = self.read_json()
            except ValueError as exc:
                self.send_payload(400, {"error": str(exc)})
                return True
            rows[index] = {**rows[index], **body, "id": rows[index]["id"]}
            save_db()
            self.send_payload(200, rows[index])
            return True

        if method == "DELETE":
            rows.pop(index)
            save_db()
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

    def do_GET(self):
        if self.handle_api("GET"):
            return
        path = urlparse(self.path).path
        if path.startswith("/mock-api/"):
            self.send_payload(403, {"error": "Forbidden"})
            return
        if path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_HEAD(self):
        if self.handle_api("GET"):
            return
        if urlparse(self.path).path == "/":
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
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("PetCompanion mock API + static server (Python): http://localhost:%d" % PORT)
    print("REST base: http://localhost:%d/api/v1" % PORT)
    print("Resources: %s" % ", ".join(db.keys()))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()
        sys.exit(0)


if __name__ == "__main__":
    main()
