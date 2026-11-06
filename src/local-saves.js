import {
  GUEST_DOCUMENT_KEY,
  GUEST_KEY,
  accountKey,
  cleanDocument,
  documentFromProgress,
  emptyDocument,
  fingerprint,
} from './cloud-progress.js';
import { cleanProgress } from './logic.js';

export function inspectSave(storage, key, decode) {
  if (!storage) return { status: 'unavailable', key };
  let raw;
  try {
    raw = storage.getItem(key);
  } catch {
    return { status: 'unavailable', key };
  }
  if (raw == null) return { status: 'missing', key };
  try {
    return { status: 'ok', key, value: decode(JSON.parse(raw)) };
  } catch {
    return { status: 'corrupt', key, raw };
  }
}
function recoveryKey({ key, raw }) {
  return key + ':recovery:' + fingerprint(raw);
}
export function preserveCorruptSave(storage, entry) {
  const key = recoveryKey(entry);
  try {
    const previous = storage.getItem(key);
    if (previous === null) storage.setItem(key, entry.raw);
    else if (previous !== entry.raw) return false;
    return true;
  } catch {
    return false;
  }
}
function listRecoveries(storage, keys) {
  const recoveries = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && keys.some((k) => key.startsWith(k + ':recovery:')))
        recoveries.push({ key, raw: storage.getItem(key) });
    }
  } catch {
    /* Browser may deny listing. */
  }
  return recoveries;
}

export function decodeSnapshot(raw, ids) {
  return {
    document: cleanDocument(raw, ids),
    generation: typeof raw.localGeneration === 'string' ? raw.localGeneration : 'legacy',
    resetScope: ['progress', 'notes', 'all'].includes(raw.localResetScope) ? raw.localResetScope : '',
  };
}
export function readLocalSave(storage, owner, ids, device) {
  const key = owner === 'guest' ? GUEST_DOCUMENT_KEY : accountKey(owner);
  const saved = inspectSave(storage, key, (raw) => decodeSnapshot(raw, ids));
  // Once a current document exists, the old compatibility key is only a backup.
  const legacy =
    owner === 'guest' ? inspectSave(storage, GUEST_KEY, (raw) => cleanProgress(raw, ids)) : null;
  const snapshot =
    saved.status === 'ok'
      ? saved.value
      : {
          generation: 'legacy',
          resetScope: '',
          document:
            legacy?.status === 'ok' ? documentFromProgress(legacy.value, ids, device) : emptyDocument(),
        };
  const issues = [saved, legacy].filter((e) => e?.status === 'corrupt');
  const protectedKeys = issues.filter((e) => !preserveCorruptSave(storage, e)).map((e) => e.key);
  const recoveries = listRecoveries(storage, [key, ...(legacy ? [GUEST_KEY] : [])]);
  for (const issue of issues) {
    const id = recoveryKey(issue);
    if (!recoveries.some((r) => r.key === id)) recoveries.push({ key: id, raw: issue.raw });
  }
  return {
    ...snapshot,
    recoveries,
    protectedKeys,
    status:
      saved.status === 'unavailable' || legacy?.status === 'unavailable'
        ? 'unavailable'
        : issues.length
          ? 'corrupt'
          : 'ok',
  };
}
export function encodeSnapshot(document, generation, resetScope) {
  return JSON.stringify({ ...document, localGeneration: generation, localResetScope: resetScope });
}
