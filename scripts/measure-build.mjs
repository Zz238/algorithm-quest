import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { gzipSync } from 'node:zlib';
const directory = resolve(process.argv[2] || 'dist'),
  manifest = JSON.parse(readFileSync(join(directory, '.vite/manifest.json'), 'utf8'));
const included = new Set();
function visit(key) {
  if (included.has(key) || !manifest[key]) return;
  included.add(key);
  for (const child of manifest[key].imports || []) visit(child);
}
visit('index.html');
visit('src/pages/CatalogPage.vue');
const files = [...included].map((k) => manifest[k].file).filter((f) => f.endsWith('.js'));
const size = (names) =>
  names.reduce(
    (out, name) => {
      const content = readFileSync(join(directory, name));
      out.bytes += content.length;
      out.gzip += gzipSync(content).length;
      return out;
    },
    { bytes: 0, gzip: 0 },
  );
function walk(path) {
  return readdirSync(path).flatMap((name) => {
    const p = join(path, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const total = walk(join(directory, 'assets'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.slice(directory.length + 1));
console.log(
  JSON.stringify(
    {
      home: { ...size(files), files },
      allJavaScript: size(total),
      note: 'Build-byte measurement, including initial catalog dependencies. CheerpJ CDN resources are loaded only after a run action and are excluded.',
    },
    null,
    2,
  ),
);
