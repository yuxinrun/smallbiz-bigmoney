// 内容层：读取 content/**/*.md，解析 frontmatter 与正文。
// 仅在构建期（Node）运行，浏览器端使用预渲染结果与搜索索引。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown } from '../markdown.js';
import { renderChart } from '../render/charts.js';
import { books } from '../data/books.js';
import { resources } from '../data/resources.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT_DIR = path.join(ROOT, 'content');

export const CONTENT_SECTIONS = [
  'cases',
  'startup',
  'business-models',
  'profit',
  'cash-flow',
  'methods',
  'industries',
  'failures',
];

const SECTION_LABELS = {
  cases: '赚钱案例',
  startup: '小成本创业',
  'business-models': '商业模式',
  profit: '利润结构',
  'cash-flow': '现金流经营',
  methods: '经营方法论',
  industries: '行业机会',
  failures: '失败案例',
};

function coerce(value) {
  const v = value.trim();
  if (!v) return '';
  if (/^\[.*\]$/.test(v)) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
  }
  if (/^\{.*\}$/.test(v) || /^\[.*\]$/.test(v)) {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v.replace(/^['"]|['"]$/g, '');
}

export function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: normalized };
  const data = {};
  let currentKey = null;
  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(coerce(listItem[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      data[kv[1]] = kv[2] === '' ? '' : coerce(kv[2]);
    }
  }
  return { data, body: normalized.slice(match[0].length) };
}

function countReadingTime(text) {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 380 + words / 220));
}

export function formatDate(iso, style = 'full') {
  const [y, m, d] = String(iso).split('-');
  if (!y) return String(iso);
  if (style === 'compact') return `${y}.${m}`;
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}

export function assetPath(p = '') {
  if (!p) return p;
  if (/^https?:\/\//.test(p)) return p;
  return p.startsWith('/') ? p : `/${p}`;
}

function readSection(section) {
  const dir = path.join(CONTENT_DIR, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const slug = file.replace(/\.md$/, '');
      const parsed = renderMarkdown(body, {
        renderChart: (type, config) => renderChart(type, config),
      });
      const title = data.title || slug;
      return {
        slug,
        section,
        sectionLabel: SECTION_LABELS[section] || section,
        title,
        subtitle: data.subtitle || '',
        description: data.description || data.summary || '',
        category: data.category || SECTION_LABELS[section],
        tags: Array.isArray(data.tags) ? data.tags : [],
        date: data.date || '2026-01-01',
        readingTime: data.readingTime || countReadingTime(parsed.text),
        cover: assetPath(data.cover || `/assets/images/covers/${slug}.svg`),
        coverAlt: data.coverAlt || `${title} 配图`,
        featured: Boolean(data.featured),
        region: data.region || 'cn',
        industry: data.industry || '',
        model: data.model || '',
        startupCost: typeof data.startupCost === 'number' ? data.startupCost : null,
        startupLabel: data.startupLabel || '',
        difficulty: data.difficulty || '',
        payback: data.payback || '',
        summary: data.summary || '',
        keyNumbers: Array.isArray(data.keyNumbers) ? data.keyNumbers : [],
        takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
        economics: data.economics && typeof data.economics === 'object' ? data.economics : null,
        body,
        html: parsed.html,
        toc: parsed.toc,
        plainText: parsed.text,
        fullText: parsed.textFull || parsed.text,
      };
    });
}

function byDateDesc(a, b) {
  return String(b.date).localeCompare(String(a.date));
}

let cache = null;

export function resetContentCache() {
  cache = null;
}

export function loadContent() {
  if (cache) return cache;
  const posts = CONTENT_SECTIONS.flatMap(readSection).sort(byDateDesc);
  posts.forEach((p) => {
    p.url = `/${p.section}/${p.slug}/`;
  });

  const bySection = {};
  for (const section of CONTENT_SECTIONS) {
    bySection[section] = posts.filter((p) => p.section === section).sort(byDateDesc);
  }

  const featured = posts.filter((p) => p.featured);
  const stats = {
    articles: posts.length,
    cases: bySection.cases.length,
    models: bySection['business-models'].length,
    industries: new Set(posts.map((p) => p.industry).filter(Boolean)).size,
    methods: bySection.methods.length,
    books: books.length,
    resources: resources.length,
    words: posts.reduce((sum, p) => sum + ((p.fullText || p.plainText).length || 0), 0),
  };

  const tagCount = new Map();
  posts.forEach((p) => p.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));

  cache = { posts, bySection, featured, stats, tags, books, resources };
  return cache;
}

export function getPost(section, slug) {
  return loadContent().posts.find((p) => p.section === section && p.slug === slug) || null;
}

export function relatedPosts(post, limit = 3) {
  const all = loadContent().posts.filter((p) => p.slug !== post.slug || p.section !== post.section);
  const score = (p) => {
    let s = 0;
    if (p.section === post.section) s += 3;
    if (p.industry && p.industry === post.industry) s += 2;
    if (p.model && p.model === post.model) s += 1;
    s += p.tags.filter((t) => post.tags.includes(t)).length * 2;
    return s;
  };
  return all
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || byDateDesc(a.p, b.p))
    .slice(0, limit)
    .map((x) => x.p);
}

export function siblingPosts(post) {
  const list = loadContent().bySection[post.section] || [];
  const index = list.findIndex((p) => p.slug === post.slug);
  return {
    prev: index < list.length - 1 ? list[index + 1] : null,
    next: index > 0 ? list[index - 1] : null,
  };
}

export function allRoutes() {
  const content = loadContent();
  const routes = [
    '/',
    '/search/',
    '/about/',
    ...Object.keys(SECTION_LABELS).map((s) => `/${s}/`),
    '/books/',
    '/resources/',
  ];
  content.posts.forEach((p) => routes.push(p.url));
  return routes;
}