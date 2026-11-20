// 构建产物：sitemap / robots / RSS / 搜索索引 / manifest。
import { loadContent } from '../content/loader.js';
import { site, sections } from '../data/site.js';
import { absoluteUrl, withBase } from '../utils/seo.js';
import { listPages } from '../render/router.js';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildSearchIndex(base = '/') {
  const { posts } = loadContent();
  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    items: posts.map((p) => ({
      t: p.title,
      d: p.description,
      s: p.section,
      sl: p.sectionLabel,
      u: p.url,
      tags: p.tags,
      date: p.date,
      time: p.readingTime,
      region: p.region,
      industry: p.industry,
      model: p.model,
      cost: p.startupCost,
      text: p.plainText.slice(0, 900),
    })),
  };
}

export function buildSitemap(base = '/') {
  const { posts } = loadContent();
  const latest = posts.map((p) => p.date).sort().pop() || new Date().toISOString().slice(0, 10);
  const urls = listPages().map((path) => {
    const priority = path === '/' ? '1.0' : path.split('/').filter(Boolean).length === 1 ? '0.8' : '0.7';
    const post = posts.find((p) => p.url === path);
    return `  <url>
    <loc>${esc(absoluteUrl(base, path))}</loc>
    <lastmod>${post ? post.date : latest}</lastmod>
    <changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export function buildRobots(base = '/') {
  return `User-agent: *
Allow: /
Disallow: ${withBase(base, '/data/')}

Sitemap: ${absoluteUrl(base, '/sitemap.xml')}
`;
}

export function buildFeed(base = '/') {
  const { posts } = loadContent();
  const latest = posts.slice(0, 20);
  const updated = latest[0] ? new Date(`${latest[0].date}T08:00:00+08:00`).toUTCString() : new Date().toUTCString();
  const items = latest
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(absoluteUrl(base, p.url))}</link>
      <guid isPermaLink="true">${esc(absoluteUrl(base, p.url))}</guid>
      <pubDate>${new Date(`${p.date}T08:00:00+08:00`).toUTCString()}</pubDate>
      <category>${esc(p.sectionLabel)}</category>
      <description>${esc(p.description)}</description>
    </item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${esc(absoluteUrl(base, '/'))}</link>
    <description>${esc(site.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <generator>Small Business Big Money static generator</generator>
${items}
  </channel>
</rss>
`;
}

export function buildManifest(base = '/') {
  return JSON.stringify(
    {
      name: site.name,
      short_name: site.shortName,
      description: site.description,
      lang: 'zh-CN',
      start_url: withBase(base, '/'),
      scope: withBase(base, '/'),
      display: 'standalone',
      background_color: '#fbf8f2',
      theme_color: '#1b2f47',
      icons: [
        {
          src: withBase(base, '/assets/icons/icon-192.svg'),
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: withBase(base, '/assets/icons/icon-512.svg'),
          sizes: '512x512',
          type: 'image/svg+xml',
        },
      ],
    },
    null,
    2,
  );
}

export function buildHtaccessNotice() {
  return '';
}

export { sections };