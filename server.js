/**
 * Hotel IT Inventory Management - Pure Static SPA Server & Gemini API Proxy
 * Ultra-lightweight zero-dependency Node.js server
 */
import http from 'http';
import fs from 'fs';
import path from 'path';

// Robust port detection for dev container (port 3000) and Cloud Run production (PORT env)
const PORT = (() => {
  const portArgIdx = process.argv.findIndex(arg => arg === '--port' || arg === '-p');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    return parseInt(process.argv[portArgIdx + 1], 10);
  }
  if (process.env.APPLET_ID) {
    // In AI Studio dev container, Nginx listens on 8080 and proxies to 3000
    return 3000;
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
})();

const ROOT = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-api-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const reqPath = parsedUrl.pathname;

  // Server-side Gemini API endpoints (chat & streaming proxy)
  if ((reqPath === '/api/gemini/chat' || reqPath === '/api/gemini/stream') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const apiKey = payload.apiKey || req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: {
              message: 'GEMINI_API_KEY is not configured. Please supply an API key in Settings or server environment.'
            }
          }));
          return;
        }

        let model = payload.model || 'gemini-3.8-flash';
        model = model.replace(/^models\//, '');
        if (model === 'gemini-2.5-flash' || model === 'gemini-2.5-flash-preview' || model === 'gemini-2.0-flash' || model === 'gemini-1.5-flash') {
          model = 'gemini-3.8-flash';
        }

        const systemText = payload.systemInstruction || payload.system_instruction;
        const systemInstructionObj = systemText
          ? (typeof systemText === 'string' ? { parts: [{ text: systemText }] } : systemText)
          : undefined;

        const isStream = reqPath === '/api/gemini/stream' || payload.stream === true;
        const apiMethod = isStream ? 'streamGenerateContent' : 'generateContent';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${apiMethod}?key=${encodeURIComponent(apiKey)}`;

        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build'
          },
          body: JSON.stringify({
            contents: payload.contents || [],
            system_instruction: systemInstructionObj,
            generationConfig: payload.generationConfig
          })
        });

        if (isStream) {
          res.writeHead(geminiRes.status, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });
          if (geminiRes.body && geminiRes.body.getReader) {
            const reader = geminiRes.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) { res.end(); break; }
              res.write(value);
            }
          } else {
            const text = await geminiRes.text();
            res.end(text);
          }
          return;
        }

        const data = await geminiRes.json();
        res.writeHead(geminiRes.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: {
            message: err.message || 'Internal server error while connecting to Gemini API'
          }
        }));
      }
    });
    return;
  }

  // Gemini API configuration status endpoint
  if (reqPath === '/api/gemini/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      hasServerKey: !!process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-3.8-flash',
      status: 'ok'
    }));
    return;
  }

  // Health check endpoint for Cloud Run and container health monitors
  if (reqPath === '/healthz' || reqPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  // Static file serving
  let targetPath = reqPath === '/' ? '/index.html' : reqPath;
  let filePath = path.join(ROOT, targetPath);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // SPA fallback
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
