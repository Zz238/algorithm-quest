import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dist = path.resolve('dist');
const mime = {
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  ico: 'image/x-icon',
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
};
function readAsset(url, as, relative = dist) {
  if (/^(?:[a-z]+:|\/\/|\/)/i.test(url))
    throw new Error('Offline asset must have a relative URL: ' + url);
  const file = path.resolve(relative, url.split(/[?#]/)[0]);
  if (!file.startsWith(dist + path.sep)) throw new Error('Offline asset is outside dist: ' + url);
  return fs.readFileSync(file, as);
}
function dataUri(url, relative) {
  if (url.startsWith('data:') || url.startsWith('#')) return url;
  const type = mime[path.extname(url.split(/[?#]/)[0]).slice(1).toLowerCase()];
  if (!type) throw new Error('Unknown offline asset type: ' + url);
  return 'data:' + type + ';base64,' + readAsset(url, undefined, relative).toString('base64');
}
export function buildOffline() {
  let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  let modules = 0,
    styles = 0;
  html = html.replace(/<script\b([^>]*\bsrc="([^"]+)"[^>]*)><\/script>/g, (_tag, attrs, url) => {
    if (!attrs.includes('type="module"')) throw new Error('Unexpected external script: ' + url);
    const js = readAsset(url, 'utf8');
    if (
      /(?:^|\n)\s*import\s+(?:[\w{*]|["'])[^;]+\bfrom\b/m.test(js) ||
      /\bimport\(\s*["']\.\.?\//.test(js)
    ) {
      throw new Error('Offline entry still imports another bundle: ' + url);
    }
    modules++;
    return '<script type="module">' + js.replace(/<\/script/gi, '<\\/script') + '</script>';
  });
  html = html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g, (_tag, url) => {
    const directory = path.dirname(path.resolve(dist, url));
    const css = readAsset(url, 'utf8').replace(
      /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g,
      (_, quote, asset) => 'url(' + quote + dataUri(asset.trim(), directory) + quote + ')',
    );
    if (/@import\s/i.test(css)) throw new Error('Unexpected external stylesheet import.');
    styles++;
    return '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>';
  });
  html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '');
  html = html.replace(
    /(<link\b[^>]*rel="icon"[^>]*href=")([^"]+)(")/g,
    (_tag, before, url, after) => before + dataUri(url, dist) + after,
  );
  // Check tags after stripping the inline code; program strings can contain markup.
  const shell = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  assert.equal(modules, 1, 'Vite must emit a single module for the offline file');
  assert(styles >= 1, 'No stylesheet was embedded');
  assert(!/<script\b[^>]*\bsrc=/i.test(html.split('<script type="module">')[0]));
  assert(!/<link\b[^>]*\brel="(?:stylesheet|modulepreload)"/i.test(shell));
  assert(!/<(?:img|source)\b[^>]*\bsrc="(?!data:)/i.test(shell));
  assert(/rel="icon"[^>]+href="data:image\//.test(shell), 'Favicon was not inlined');
  return html;
}
fs.writeFileSync('offline.html', buildOffline());
console.log('Generated offline.html and verified all entry assets are embedded.');
