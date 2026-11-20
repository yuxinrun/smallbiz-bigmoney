// LocalStorage：收藏与最近阅读。全部仅保存在本地浏览器。
const SAVED = 'sbbm:saved';
const HISTORY = 'sbbm:history';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getSaved() {
  const list = read(SAVED, []);
  return Array.isArray(list) ? list : [];
}

export function isSaved(id) {
  return getSaved().includes(id);
}

export function toggleSaved(id) {
  const list = getSaved();
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.unshift(id);
  write(SAVED, list.slice(0, 200));
  return index < 0;
}

export function addHistory(entry) {
  if (!entry?.id) return;
  const list = read(HISTORY, []);
  const next = [entry, ...(Array.isArray(list) ? list.filter((x) => x.id !== entry.id) : [])];
  write(HISTORY, next.slice(0, 12));
}

export function getHistory() {
  const list = read(HISTORY, []);
  return Array.isArray(list) ? list : [];
}