// SEO 工具：head 元信息与结构化数据。
import { site } from '../data/site.js';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function normalizeBase(base = '/') {
  const b = base.trim();
  if (!b || b === '/') return '/';
  return `/${b.replace(/^\/|\/$/g, '')}/`;
}

export function withBase(base, p = '/') {
  if (!p) return normalizeBase(base);
  if (/^(https?:|mailto:|tel:|#)/.test(p)) return p;
  const b = normalizeBase(base);
  const path = p.startsWith('/') ? p : `/${p}`;
  if (b === '/') return path;
  return `${b.slice(0, -1)}${path}`;
}

export function absoluteUrl(base, p = '/') {
  const b = normalizeBase(base);
  const origin = site.url.replace(/\/$/, '');
  const path = p.startsWith('/') ? p : `/${p}`;
  // SITE_URL 可能已包含子路径（如 https://user.github.io/repo），此时不再重复拼接。
  const baseNoSlash = b === '/' ? '' : b.slice(0, -1);
  const alreadyHasBase = baseNoSlash && origin.endsWith(baseNoSlash);
  return `${origin}${alreadyHasBase ? '' : baseNoSlash}${path}`;
}

export function ogImageUrl(base, image) {
  if (!image) return absoluteUrl(base, '/assets/images/og-default.svg');
  if (/^https?:/.test(image)) return image;
  return absoluteUrl(base, image);
}

export function renderHead({
  base = '/',
  title,
  description,
  path = '/',
  image = '/assets/images/og-default.svg',
  type = 'website',
  jsonLd = [],
  published,
  modified,
}) {
  const fullTitle = title.includes(site.name) ? title : `${title} | ${site.name}`;
  const canonical = absoluteUrl(base, path);
  const imageAbs = ogImageUrl(base, image);
  const ld = jsonLd.filter(Boolean);

  return `<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(site.publisher)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#fbf8f2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14181f" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${imageAbs}">
<meta property="og:image:alt" content="${esc(title)}">
${published ? `<meta property="article:published_time" content="${esc(published)}">` : ''}
${modified ? `<meta property="article:modified_time" content="${esc(modified)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${imageAbs}">
<link rel="icon" href="${withBase(base, '/assets/icons/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${withBase(base, '/assets/icons/apple-touch-icon.svg')}">
<link rel="manifest" href="${withBase(base, '/manifest.webmanifest')}">
<link rel="sitemap" type="application/xml" href="${withBase(base, '/sitemap.xml')}">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${withBase(
    base,
    '/feed.xml',
  )}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

export function organizationSchema(base = '/') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    alternateName: site.nameEn,
    url: absoluteUrl(base, '/'),
    logo: absoluteUrl(base, '/assets/icons/logo.svg'),
    description: site.description,
    sameAs: [site.github],
  };
}

export function websiteSchema(base = '/') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    alternateName: site.nameEn,
    url: absoluteUrl(base, '/'),
    inLanguage: 'zh-CN',
    description: site.description,
    publisher: { '@type': 'Organization', name: site.name },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl(base, '/search/')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(base, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: absoluteUrl(base, item.href),
    })),
  };
}

export function articleSchema(base, post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: [ogImageUrl(base, post.cover)],
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'zh-CN',
    articleSection: post.sectionLabel,
    keywords: post.tags.join(', '),
    wordCount: (post.fullText || post.plainText).length,
    author: { '@type': 'Organization', name: site.publisher, url: absoluteUrl(base, '/about/') },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl(base, '/assets/icons/logo.svg') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(base, post.url) },
    isAccessibleForFree: true,
  };
}

export function collectionSchema(base, { title, description, url, items = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl(base, url),
    inLanguage: 'zh-CN',
    isPartOf: { '@type': 'WebSite', name: site.name, url: absoluteUrl(base, '/') },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 20).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(base, item.url),
        name: item.title,
      })),
    },
  };
}

export { esc };