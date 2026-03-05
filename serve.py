import http.server
import os
import sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'progresif-oneri'))
print(f"Serving from: {os.getcwd()}", flush=True)

handler = http.server.SimpleHTTPRequestHandler
server = http.server.HTTPServer(('0.0.0.0', 8090), handler)
print("Server running on http://localhost:8090", flush=True)
server.serve_forever()
