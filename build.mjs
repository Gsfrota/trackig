import { cp, copyFile, lstat, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, 'dist');
const pages = ['index.html', 'styles.css', 'script.js'];

// Validate the fixed, direct child before any recursive removal.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error('Build output must be the repository dist directory.');
}

async function validateSource(target) {
  const entry = await lstat(target);
  if (entry.isSymbolicLink()) throw new Error('Build sources cannot contain symbolic links.');
  if (entry.isDirectory()) {
    for (const child of await readdir(target)) await validateSource(path.join(target, child));
  } else if (!entry.isFile()) {
    throw new Error('Build sources must be regular files or directories.');
  }
}

for (const page of pages) {
  const target = path.join(root, page);
  await validateSource(target);
  if (!(await lstat(target)).isFile()) throw new Error(`${page} must be a file.`);
}
const assets = path.join(root, 'assets');
await validateSource(assets);
if (!(await lstat(assets)).isDirectory()) throw new Error('Assets must be a directory.');

try {
  const existing = await lstat(output);
  if (existing.isSymbolicLink() || !existing.isDirectory()) {
    throw new Error('Refusing to replace a dist path that is not a regular directory.');
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const page of pages) await copyFile(path.join(root, page), path.join(output, page));
await cp(assets, path.join(output, 'assets'), { recursive: true });
console.log('Static build ready: dist/ (HTML, CSS, JavaScript and assets only).');
