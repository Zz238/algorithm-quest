"""Local teaching inference service. Do not expose this unauthenticated demo publicly."""
import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from exercises import recommend

COURSES = json.loads(Path(__file__).with_name('courses.json').read_text(encoding='utf-8'))

class RecommendationHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        if url.path != '/recommend':
            return self.respond(404, {'error': 'not found'})
        params = parse_qs(url.query)
        completed = [name for name in params.get('completed', [''])[0].split(',') if name]
        if not set(completed) <= {c['id'] for c in COURSES}:
            return self.respond(400, {'error': 'unknown course'})
        self.respond(200, {'version': 'content-jaccard-v1', 'items': recommend(COURSES, completed, 3)})

    def respond(self, status, body):
        data = json.dumps(body, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *_args):
        pass

if __name__ == '__main__':
    print('Local demo: http://127.0.0.1:8891/recommend?completed=arrays')
    ThreadingHTTPServer(('127.0.0.1', 8891), RecommendationHandler).serve_forever()
