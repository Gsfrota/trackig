import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://www.trackig.com.br';
const pages = ['index.html', 'como-funciona.html'];

test('built pages expose consistent metadata, factual schema and reachable internal links', async () => {
  execFileSync(process.execPath, ['build.mjs'], { cwd: root });
  const documents = new Map(await Promise.all(pages.map(async (name) => [name, await readFile(path.join(root, 'dist', name), 'utf8')])));
  for (const [name, html] of documents) {
    const url = `${origin}/${name === 'index.html' ? '' : name}`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`));
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title);
    assert.ok(html.includes(`<meta name="twitter:title" content="${title}">`));
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)?.[1]);
    const organization = schema['@graph'].find((node) => node['@type'] === 'Organization');
    const webpage = schema['@graph'].find((node) => node['@type'] === 'WebPage');
    assert.equal(webpage.url, url);
    assert.equal(webpage.name, title);
    assert.equal(webpage.description, description);
    assert.equal(organization.telephone, '+5585991318582');
    assert.equal(organization.email, 'comercial@trackig.com.br');
    assert.equal(organization.url, `${origin}/`);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const destination = new URL(match[1], url);
      if (destination.origin !== origin) continue;
      const target = destination.pathname === '/' ? 'index.html' : destination.pathname.slice(1);
      assert.ok((await stat(path.join(root, 'dist', target))).isFile(), `${name}: missing ${target}`);
      if (destination.hash) {
        const targetHtml = documents.get(target);
        assert.ok(targetHtml?.includes(`id="${decodeURIComponent(destination.hash.slice(1))}"`), `${name}: missing fragment ${match[1]}`);
      }
    }
  }
  const sitemap = await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]), [`${origin}/`, `${origin}/como-funciona.html`]);
  assert.ok((await readFile(path.join(root, 'dist/robots.txt'), 'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`));
  const configuration = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
  for (const rewrite of configuration.rewrites) {
    const markdown = await readFile(path.join(root, 'dist', rewrite.destination.slice(1)), 'utf8');
    assert.ok(markdown.startsWith('# '));
    assert.ok(markdown.includes('comercial@trackig.com.br'));
    assert.ok(markdown.includes('sem telemetria real'));
    const matcher = new RegExp(rewrite.has[0].value);
    assert.ok(matcher.test('text/markdown'));
    for (const value of ['text/markdown;q=0', 'text/markdown, text/html', 'text/html', '*/*']) assert.equal(matcher.test(value), false);
  }
  assert.ok((await readFile(path.join(root, 'dist/llms.txt'), 'utf8')).includes(`${origin}/como-funciona.html`));
});

test('local HTTP serves crawl resources with correct MIME, supports HEAD and returns real 404', async () => {
  const child = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  try {
    const address = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Server startup timeout: ${stderr}`)), 5000);
      child.once('error', (error) => { clearTimeout(timer); reject(error); });
      child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Server exited ${code}: ${stderr}`)); });
      child.stdout.on('data', (chunk) => {
        const url = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
        if (url) { clearTimeout(timer); resolve(url); }
      });
    });
    for (const [route, type] of [['/', 'text/html'], ['/como-funciona.html', 'text/html'], ['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml']]) {
      const response = await fetch(`${address}${route}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(response.status, 200, route);
      assert.ok(response.headers.get('content-type')?.startsWith(type), route);
      assert.ok((await response.text()).length > 0, route);
      const head = await fetch(`${address}${route}`, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
    }
    for (const route of ['/pagina-inexistente', '/README.md', '/assets/inexistente.png']) {
      assert.equal((await fetch(`${address}${route}`, { signal: AbortSignal.timeout(5000) })).status, 404, route);
    }
    const configuration = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
    for (const route of ['/', '/index.html', '/como-funciona.html']) {
      const rewrite = configuration.rewrites.find((entry) => entry.source === route);
      assert.ok(rewrite, route);
      const matcher = new RegExp(rewrite.has[0].value);
      for (const accept of ['text/html', 'text/markdown', 'text/html', 'text/markdown;q=0', 'text/markdown, text/html', 'text/markdown']) {
        const response = await fetch(`${address}${route}`, { headers: { Accept: accept }, signal: AbortSignal.timeout(5000) });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('vary'), 'Accept');
        const markdown = matcher.test(accept);
        assert.ok(response.headers.get('content-type')?.startsWith(markdown ? 'text/markdown' : 'text/html'), `${route} ${accept}`);
        assert.ok((await response.text()).startsWith(markdown ? '# ' : '<!doctype html>'));
      }
    }
    assert.equal((await fetch(`${address}/missing`, { headers: { Accept: 'text/markdown' }, signal: AbortSignal.timeout(5000) })).status, 404);
  } finally {
    child.kill();
  }
});
