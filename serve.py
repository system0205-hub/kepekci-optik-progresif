import http.server
import os
import sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'progresif-oneri'))
print(f"Serving from: {os.getcwd()}", flush=True)

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

server = http.server.HTTPServer(('0.0.0.0', 8090), NoCacheHandler)
print("Server running on http://localhost:8090 (no-cache)", flush=True)
server.serve_forever()
