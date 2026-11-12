const PREFIX = 'AQ1.';
const MAX_BYTES = 1_000_000;
const encode = (bytes) => {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
};
const decode = (text) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
function requireCrypto() {
  if (!globalThis.crypto?.subtle)
    throw Error('当前环境不支持加密，请在 HTTPS 或本机 localhost 中打开，或使用 JSON 备份。');
}
async function derive(password, salt) {
  requireCrypto();
  if (password.length < 8 || password.length > 128)
    throw Error('临时口令需要 8～128 个字符，请与数据串分开传递。');
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}
export async function encryptBackup(progress, password, now = Date.now()) {
  requireCrypto();
  const plaintext = new TextEncoder().encode(JSON.stringify(progress));
  if (plaintext.length > MAX_BYTES) throw Error('备份超过 1 MB，请先整理笔记或使用 JSON 导出。');
  const salt = crypto.getRandomValues(new Uint8Array(16)),
    iv = crypto.getRandomValues(new Uint8Array(12));
  const expires = now + 24 * 60 * 60 * 1000;
  const key = await derive(password, salt);
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode('AQ1:' + expires) },
    key,
    plaintext,
  );
  return (
    PREFIX +
    encode(
      new TextEncoder().encode(
        JSON.stringify({
          version: 1,
          expires,
          salt: encode(salt),
          iv: encode(iv),
          data: encode(new Uint8Array(data)),
        }),
      ),
    )
  );
}
export async function decryptBackup(code, password, now = Date.now()) {
  requireCrypto();
  if (code.length > 2_000_000 || !code.trim().startsWith(PREFIX))
    throw Error('这不是有效的 AQ1 加密数据串。');
  let bundle;
  try {
    bundle = JSON.parse(new TextDecoder().decode(decode(code.trim().slice(PREFIX.length))));
  } catch {
    throw Error('加密数据串不完整，请重新复制全部内容。');
  }
  if (
    bundle.version !== 1 ||
    !Number.isSafeInteger(bundle.expires) ||
    ![bundle.salt, bundle.iv, bundle.data].every((s) => typeof s === 'string')
  )
    throw Error('加密数据串格式不受支持。');
  if (bundle.expires <= now) throw Error('这份数据串已超过 24 小时，请在原设备重新生成。');
  try {
    const salt = decode(bundle.salt),
      iv = decode(bundle.iv),
      data = decode(bundle.data);
    if (salt.length !== 16 || iv.length !== 12 || data.length > MAX_BYTES + 16) throw Error('invalid');
    const key = await derive(password, salt);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode('AQ1:' + bundle.expires) },
      key,
      data,
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw Error('口令不正确或数据已损坏，当前学习记录没有改动。');
  }
}
