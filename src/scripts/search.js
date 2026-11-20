// 全站搜索：加载本地索引，按相关度排序并高亮关键词。
import { getHistory } from './store.js';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function tokenize(query) {
  return query
    .toLowerCase()
    .split(/[\s,，。、；;：:!?！？/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function variants(term) {
  if (term.length >= 4 && /[\u4e00-\u9fff]/.test(term)) {
    return [term, term.slice(0, 2), term.slice(-2)];
  }
  return [term];
}

function hits(haystack, term) {
  return variants(term).some((v) => v && haystack.includes(v));
}

function scoreItem(item, terms) {
  const title = item.t.toLowerCase();
  const desc = (item.d || '').toLowerCase();
  const tags = (item.tags || []).join(' ').toLowerCase();
  const text = (item.text || '').toLowerCase();
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (hits(title, term)) s += 120;
    if (hits(tags, term)) s += 40;
    if (hits(desc, term)) s += 24;
    if (hits(text, term)) s += 6;
    if (!s) return 0;
    total += s;
  }
  return total;
}

function highlight(text, terms) {
  let out = esc(text);
  const all = [...new Set(terms.flatMap((t) => variants(t)).filter((t) => t.length >= 2))].sort(
    (a, b) => b.length - a.length,
  );
  all.forEach((term) => {
    try {
      out = out.replace(new RegExp(escapeReg(esc(term)), 'gi'), (m) => `<mark>${m}</mark>`);
    } catch {
      /* 忽略非法正则 */
    }
  });
  return out;
}

function snippet(item, terms) {
  const text = item.text || '';
  const lower = text.toLowerCase();
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx >= 0) {
      const start = Math.max(0, idx - 46);
      const end = Math.min(text.length, idx + 110);
      return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
    }
  }
  return item.d || text.slice(0, 120);
}

function renderHistory() {
  const block = document.querySelector('[data-history-block]');
  const list = document.querySelector('[data-history-list]');
  if (!block || !list) return;
  // 本机历史可能被手动修改，只允许站内相对路径，避免注入外链或危险协议。
  const history = getHistory().filter(
    (h) => h && typeof h.url === 'string' && /^\/(?![\/\\])/.test(h.url),
  );
  if (!history.length) return;
  block.hidden = false;
  list.innerHTML = history
    .map(
      (h) => `<a class="post-row" href="${esc(h.url)}">
      <span class="post-row-num" aria-hidden="true">↗</span>
      <span class="post-row-main"><strong>${esc(h.title)}</strong><span class="post-row-meta">${esc(
        h.date || '',
      )} · 本机阅读记录</span></span>
      <span class="post-row-arrow" aria-hidden="true">→</span>
    </a>`,
    )
    .join('');
}

export async function initSearch() {
  const form = document.querySelector('[data-search-form]');
  if (!form) return;
  const input = form.querySelector('input[name="q"]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const empty = document.querySelector('[data-search-empty]');
  const base = document.body.dataset.base || '/';
  renderHistory();

  let items = [];
  let ready = false;
  try {
    status.textContent = '正在加载搜索索引…';
    const res = await fetch(`${base}data/search-index.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error('索引加载失败');
    const data = await res.json();
    items = data.items || [];
    ready = true;
  } catch {
    status.textContent = '搜索索引加载失败，请刷新页面重试。';
    return;
  }

  const params = new URLSearchParams(location.search);
  const initial = params.get('q') || '';
  if (initial) input.value = initial;

  const run = (raw) => {
    const query = raw.trim();
    const terms = tokenize(query);
    if (!terms.length) {
      results.innerHTML = '';
      empty.hidden = true;
      status.textContent = `输入关键词开始搜索，共收录 ${items.length} 篇内容。`;
      return;
    }
    const matched = items
      .map((item) => ({ item, score: scoreItem(item, terms) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);

    results.innerHTML = matched
      .map(
        ({ item }) => `<article class="search-result">
        <div>
          <h2><a href="${base.replace(/\/$/, '')}${item.u}">${highlight(item.t, terms)}</a></h2>
          <p>${highlight(snippet(item, terms), terms)}</p>
          <div class="search-meta">${esc(item.sl)} · ${esc(item.date)} · ${item.time} 分钟阅读</div>
        </div>
        <span class="post-row-arrow" aria-hidden="true">→</span>
      </article>`,
      )
      .join('');

    empty.hidden = matched.length !== 0;
    status.textContent =
      matched.length === 0
        ? `没有找到与「${query}」相关的内容。`
        : `找到 ${matched.length} 条与「${query}」相关的内容，按相关度排序。`;
    if (matched.length === 0) results.innerHTML = '';
  };

  const pushUrl = (q) => {
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value;
      run(q);
      pushUrl(q.trim());
    }, 200);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    run(q);
    pushUrl(q);
    if (ready) status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.querySelectorAll('[data-search-tag]').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.searchTag;
      run(input.value);
      pushUrl(input.value);
      input.focus();
    });
  });

  if (initial) run(initial);
  else if (ready) status.textContent = `输入关键词开始搜索，共收录 ${items.length} 篇内容。`;
}