import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
// Conservative negotiation: mixed preferences and parameters retain HTML.
const markdownAccept = /^\s*text\/markdown\s*$/;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const negotiated = ['index.html', 'como-funciona.html'].includes(relative);
    if (negotiated && markdownAccept.test(request.headers.accept || '')) relative = relative.replace(/\.html$/, '.md');
    const target = path.resolve(root, relative);
    const permitted = ['index.html', 'como-funciona.html', 'index.md', 'como-funciona.md', 'llms.txt', 'styles.css', 'script.js', 'robots.txt', 'sitemap.xml'].includes(relative) || (relative.startsWith('assets/') && target.startsWith(path.join(root, 'assets') + path.sep));
    if (!permitted || !target.startsWith(root + path.sep) || !(await stat(target)).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    const content = await readFile(target);
    response.writeHead(200, { 'Content-Type': path.extname(target) === '.md' ? 'text/markdown; charset=utf-8' : mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': negotiated ? 'private, no-store' : 'no-cache', 'X-Content-Type-Options': 'nosniff', ...(negotiated ? { Vary: 'Accept' } : {}) });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`TrackIG local: http://127.0.0.1:${server.address().port}`));
