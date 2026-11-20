// 站点自检脚本：内容完整性、图片存在性、构建产物链接与 SEO 基础项。
// 用法：npm run check（会先读取 content/ 与 src/data/，若存在 dist/ 则一并检查产物）
import fs from 'node:fs';
import path from 'node:path';

process.env.SITE_URL = process.env.SITE_URL || 'https://example.com';
process.env.BASE_PATH = process.env.BASE_PATH || '/';

const root = process.cwd();
const dist = path.join(root, 'dist');
const errors = [];
const warnings = [];
const info = [];

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const { loadContent, CONTENT_SECTIONS } = await import('../src/content/loader.js');
const { books } = await import('../src/data/books.js');
const { resources } = await import('../src/data/resources.js');
const content = loadContent();
const { posts, stats } = content;

// ---------- 1. 内容数量 ----------
const counts = {
  articles: posts.length,
  cases: posts.filter((p) => p.section === 'cases').length,
  models: posts.filter((p) => p.section === 'business-models').length,
  methods: posts.filter((p) => p.section === 'methods').length,
  books: books.length,
  resources: resources.length,
};
const minimums = { articles: 20, cases: 12, models: 8, methods: 8, books: 10, resources: 20 };
for (const [key, min] of Object.entries(minimums)) {
  if (counts[key] < min) fail(`content count: ${key}=${counts[key]} < required ${min}`);
  else info.push(`count ${key}: ${counts[key]}`);
}

// ---------- 2. 文章字段与图片 ----------
for (const post of posts) {
  const id = `${post.section}/${post.slug}`;
  if (!post.title || post.title.length < 4) fail(`${id}: missing or too short title`);
  if (!post.description || post.description.length < 30) fail(`${id}: description too short`);
  if (!post.date || !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) fail(`${id}: invalid date "${post.date}"`);
  if (!post.tags.length) fail(`${id}: no tags`);
  if (!post.cover.startsWith('/assets/images/covers/')) fail(`${id}: cover not local (${post.cover})`);
  const coverFile = path.join(root, 'public', post.cover.replace(/^\//, ''));
  if (!fs.existsSync(coverFile)) fail(`${id}: cover file missing (${post.cover})`);
  if (!post.takeaways.length) warn(`${id}: no takeaways`);
  if (!post.keyNumbers.length) warn(`${id}: no keyNumbers`);
  if (!post.sources.length) fail(`${id}: no sources`);
  const bodyLength = (post.fullText || post.plainText).length;
  if (bodyLength < 1200) fail(`${id}: body too short (${bodyLength} chars)`);
  if (!post.toc.length) fail(`${id}: no toc`);
  if (post.html.includes('chart-error')) fail(`${id}: chart render error`);
  if (/<p>\s*\{"title"/.test(post.html)) fail(`${id}: leaked chart JSON (check :::chart syntax)`);
  if (post.section === 'cases') {
    if (post.startupCost === null) fail(`${id}: case missing numeric startupCost`);
    if (!post.industry) fail(`${id}: case missing industry`);
    if (!post.model) fail(`${id}: case missing model`);
  }
}

// ---------- 3. 书籍封面清单 ----------
for (const book of books) {
  if (!book.cover) {
    fail(`book ${book.title}: missing cover`);
    continue;
  }
  const file = path.join(root, 'public', book.cover.replace(/^\//, ''));
  if (!fs.existsSync(file)) fail(`book ${book.title}: cover missing (${book.cover})`);
}

// ---------- 4. 构建产物检查 ----------
if (fs.existsSync(dist)) {
  const pages = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) pages.push(full);
    }
  };
  walk(dist);
  info.push(`dist pages: ${pages.length}`);

  const base = process.env.BASE_PATH.endsWith('/') ? process.env.BASE_PATH : `${process.env.BASE_PATH}/`;
  const missing = new Set();
  const externalImages = new Set();

  const resolveLocal = (url) => {
    let clean = url.split('#')[0].split('?')[0];
    if (!clean) return null;
    if (clean.startsWith(base)) clean = clean.slice(base.length - 1);
    if (!clean.startsWith('/')) return null;
    if (clean.startsWith('/assets/') || /\.(svg|png|jpe?g|webp|ico|xml|txt|json|webmanifest|css|js)$/.test(clean)) {
      const file = path.join(dist, clean.replace(/^\//, ''));
      return fs.existsSync(file) ? null : file;
    }
    const dirIndex = path.join(dist, clean.replace(/^\//, ''), 'index.html');
    return fs.existsSync(dirIndex) ? null : dirIndex;
  };

  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(dist, file);
    if (!/<title>[^<]{4,}<\/title>/.test(html)) fail(`${rel}: missing title`);
    if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(`${rel}: missing meta description`);
    if (!/<link rel="canonical" href="https?:\/\//.test(html)) fail(`${rel}: missing canonical`);
    if (/<img[^>]+src="https?:\/\//.test(html)) fail(`${rel}: remote image found`);
    if (html.includes('chart-error')) fail(`${rel}: chart error in output`);
    if (/<p>\s*\{"title"/.test(html)) fail(`${rel}: leaked chart JSON in output`);

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = match[1];
      if (!url || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) continue;
      if (/^https?:\/\//.test(url)) {
        if (match[0].startsWith('src=') && /\.(svg|png|jpe?g|webp|gif)(\?|")/.test(url)) externalImages.add(url);
        continue;
      }
      if (url.startsWith('data:')) continue;
      const missingFile = resolveLocal(url);
      if (missingFile) missing.add(`${rel} -> ${url}`);
    }
  }

  for (const item of missing) fail(`broken local link: ${item}`);
  for (const url of externalImages) fail(`remote image: ${url}`);

  // sitemap 数量应与页面数量一致
  const sitemapPath = path.join(dist, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) fail('dist/sitemap.xml missing');
  else {
    const locs = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>/g)].length;
    info.push(`sitemap urls: ${locs}`);
    if (locs < pages.length - 1) warn(`sitemap urls (${locs}) fewer than pages (${pages.length})`);
  }
  if (!fs.existsSync(path.join(dist, 'robots.txt'))) fail('dist/robots.txt missing');
  if (!fs.existsSync(path.join(dist, '404.html'))) fail('dist/404.html missing');
  if (!fs.existsSync(path.join(dist, 'data', 'search-index.json'))) fail('search index missing');

  const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  if (index.includes('<!--vite-css-->') || index.includes('<!--vite-js-->')) fail('asset placeholder not injected');
} else {
  warn('dist/ not found, skipped build output checks (run npm run build first)');
}

// ---------- 5. 输出 ----------
console.log(`\nSections: ${CONTENT_SECTIONS.join(', ')}`);
console.log(`Words (approx): ${stats.words}`);
for (const line of info) console.log(`  ok  ${line}`);
for (const line of warnings) console.log(`  warn ${line}`);
for (const line of errors) console.log(`  ERR  ${line}`);

console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) process.exit(1);