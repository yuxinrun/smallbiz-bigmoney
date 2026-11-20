// 可复用 UI 组件（返回 HTML 字符串，构建期渲染）。
import { facets as FACETS } from '../data/site.js';
import { withBase } from '../utils/seo.js';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function costBucket(cost) {
  if (cost === null || cost === undefined) return '';
  if (cost <= 3) return 'under3';
  if (cost <= 10) return '3to10';
  if (cost <= 30) return '10to30';
  return 'over30';
}

export function formatDate(iso) {
  const [y, m, d] = String(iso).split('-');
  if (!y) return String(iso);
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
}

export function costLabel(post) {
  if (post.startupLabel) return post.startupLabel;
  if (typeof post.startupCost === 'number') return `启动约 ${post.startupCost} 万`;
  return '';
}

const ICONS = {
  search:
    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4Z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4.2M8.6 13.4l6.8 4.2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  github:
    '<path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 3.8 5.8 4.1 5.8 4.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 10.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"/>',
};

export function icon(name, className = 'icon') {
  const body = ICONS[name] || '';
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function brandMark(base) {
  return `<a class="brand" href="${withBase(base, '/')}" aria-label="${esc('小生意，赚大钱')} 首页">
  <svg class="brand-mark" viewBox="0 0 44 44" role="img" aria-label="品牌标识">
    <rect x="1" y="1" width="42" height="42" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M8 30h28" stroke="currentColor" stroke-width="1.4"/>
    <path d="M12 30V18l6-6v18" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M22 30V12l10 6v12" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="27" cy="22" r="2.2" fill="var(--accent)"/>
  </svg>
  <span class="brand-text"><strong>小生意，赚大钱</strong><small>Small Business Big Money</small></span>
</a>`;
}

export function postCard(post, base, opts = {}) {
  const { size = 'default', showSave = true } = opts;
  const tags = post.tags.slice(0, 2);
  const meta = [post.sectionLabel, post.region === 'global' ? '海外' : '中国', formatDate(post.date)];
  const dataAttrs = [
    'data-card',
    `data-title="${esc(post.title)}"`,
    `data-section="${post.section}"`,
    `data-facet-region="${esc(post.region)}"`,
    `data-facet-industry="${esc(post.industry)}"`,
    `data-facet-model="${esc(post.model)}"`,
    `data-facet-difficulty="${esc(post.difficulty)}"`,
    `data-facet-startupcost="${costBucket(post.startupCost)}"`,
    `data-facet-topic="${esc(post.tags.join('|'))}"`,
    `data-search="${esc((post.title + ' ' + post.description + ' ' + post.tags.join(' ')).toLowerCase())}"`,
    `data-date="${post.date}"`,
    `data-time="${post.readingTime}"`,
  ].join(' ');
  return `<article class="card card-${size}" ${dataAttrs}>
  <a class="card-media" href="${withBase(base, post.url)}" aria-label="${esc(post.title)}">
    <img src="${withBase(base, post.cover)}" alt="${esc(post.coverAlt)}" width="640" height="400" loading="lazy" decoding="async">
    <span class="card-badge">${esc(post.category)}</span>
  </a>
  <div class="card-body">
    <p class="card-meta">${meta.map(esc).join('<span aria-hidden="true">·</span>')}</p>
    <h3 class="card-title"><a href="${withBase(base, post.url)}">${esc(post.title)}</a></h3>
    <p class="card-desc">${esc(post.description)}</p>
    <div class="card-foot">
      <span class="card-time">${icon('clock')}${post.readingTime} 分钟</span>
      <span class="card-tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>
    </div>
  </div>
  ${
    showSave
      ? `<button class="card-save" type="button" data-save="${post.section}/${post.slug}" aria-label="收藏这篇文章" aria-pressed="false">${icon('bookmark')}</button>`
      : ''
  }
</article>`;
}

export function postRow(post, base) {
  return `<a class="post-row" href="${withBase(base, post.url)}">
  <span class="post-row-num" aria-hidden="true">${String(post.readingTime).padStart(2, '0')}</span>
  <span class="post-row-main">
    <span class="post-row-meta">${esc(post.sectionLabel)} · ${formatDate(post.date)}</span>
    <strong>${esc(post.title)}</strong>
    <span class="post-row-desc">${esc(post.description)}</span>
  </span>
  <span class="post-row-arrow" aria-hidden="true">${icon('arrowRight')}</span>
</a>`;
}

export function sectionHeading({ kicker, title, desc, href, linkLabel = '查看全部', base = '/' }) {
  return `<div class="section-heading">
  <div>
    <p class="kicker">${esc(kicker)}</p>
    <h2>${title}</h2>
    ${desc ? `<p class="section-desc">${desc}</p>` : ''}
  </div>
  ${href ? `<a class="text-link" href="${withBase(base, href)}">${esc(linkLabel)}${icon('arrowRight')}</a>` : ''}
</div>`;
}

export function breadcrumbs(items, base) {
  return `<nav class="breadcrumbs" aria-label="面包屑导航"><ol>${items
    .map((item, i) =>
      i === items.length - 1
        ? `<li aria-current="page">${esc(item.label)}</li>`
        : `<li><a href="${withBase(base, item.href)}">${esc(item.label)}</a></li>`,
    )
    .join('')}</ol></nav>`;
}

export function filterBar(section, posts, base) {
  const keys = section.facets || [];
  if (!keys.length) return '';
  const groups = keys.map((key) => {
    const def = FACETS[key];
    if (!def) return '';
    let options = def.options;
    if (def.field === 'tags') {
      const counts = new Map();
      posts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
      options = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([value]) => ({ value, label: value }));
    }
    const available = new Set();
    posts.forEach((p) => {
      const raw = p[def.field];
      if (def.field === 'tags') p.tags.forEach((t) => available.add(t));
      else if (def.field === 'startupCost') available.add(costBucket(p.startupCost));
      else if (raw) available.add(String(raw));
    });
    const visible = options.filter((o) => available.has(o.value));
    if (!visible.length) return '';
    return `<div class="filter-group" data-facet-group="${key}" role="group" aria-label="按${def.label}筛选">
      <span class="filter-label">${esc(def.label)}</span>
      <button type="button" class="chip is-active" data-facet="${key}" data-value="all" aria-pressed="true">全部</button>
      ${visible
        .map(
          (o) =>
            `<button type="button" class="chip" data-facet="${key}" data-value="${esc(o.value)}" aria-pressed="false">${esc(
              o.label,
            )}</button>`,
        )
        .join('')}
    </div>`;
  });
  return `<div class="filter-panel" data-filter-bar>
  <div class="filter-top">
    <label class="filter-search">
      ${icon('search')}
      <input type="search" data-filter-search placeholder="在本栏目内搜索标题、摘要或标签" aria-label="栏目内搜索">
    </label>
    <div class="filter-status" aria-live="polite"><strong data-filter-count>${posts.length}</strong> 篇内容<span class="dot">·</span><button type="button" class="text-button" data-filter-reset>重置筛选</button></div>
  </div>
  <div class="filter-groups">${groups.join('')}</div>
</div>`;
}

export function emptyState(message = '没有匹配的内容，试试减少筛选条件。') {
  return `<div class="empty-state" data-empty hidden>
    <p class="empty-title">暂时没有结果</p>
    <p>${esc(message)}</p>
  </div>`;
}

export function bookCard(book, base = '/') {
  const cover = book.cover
    ? `<img src="${withBase(base, book.cover)}" alt="《${esc(book.title)}》封面" width="160" height="230" loading="lazy" decoding="async">`
    : `<span class="book-cover-fallback"><strong>${esc(book.title)}</strong><small>${esc(book.author)}</small></span>`;
  return `<article class="book-card" id="book-${esc(book.slug)}">
  <div class="book-cover">${cover}</div>
  <div class="book-body">
    <p class="card-meta">${esc(book.category)} · ${esc(book.year)}</p>
    <h3>《${esc(book.title)}》</h3>
    <p class="book-author">${esc(book.author)}</p>
    <p class="book-desc">${esc(book.summary)}</p>
    <dl class="book-facts">
      <div><dt>解决什么问题</dt><dd>${esc(book.problem)}</dd></div>
      <div><dt>适合阶段</dt><dd>${esc(book.stage)}</dd></div>
      <div><dt>阅读提示</dt><dd>${esc(book.caution)}</dd></div>
    </dl>
    <p class="book-link">${book.link ? `<a class="text-link" href="${esc(book.link)}" target="_blank" rel="noopener noreferrer">查看出版信息${icon('arrowRight')}</a>` : '<span class="muted">以公开出版信息为准</span>'}</p>
  </div>
</article>`;
}

export function resourceCard(resource) {
  return `<article class="resource-card" id="res-${esc(resource.slug)}">
  <div class="resource-head">
    <span class="resource-icon" aria-hidden="true">${icon(resource.icon || 'globe')}</span>
    <div>
      <h3><a href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer">${esc(resource.name)}</a></h3>
      <p class="card-meta">${esc(resource.region)} · ${esc(resource.category)}</p>
    </div>
    <span class="resource-price">${esc(resource.price)}</span>
  </div>
  <p class="resource-desc">${esc(resource.summary)}</p>
  <dl class="resource-facts">
    <div><dt>用它做什么</dt><dd>${esc(resource.use)}</dd></div>
    <div><dt>使用门槛</dt><dd>${esc(resource.barrier)}</dd></div>
  </dl>
  <a class="resource-link" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer">访问站点${icon('arrowRight')}</a>
</article>`;
}