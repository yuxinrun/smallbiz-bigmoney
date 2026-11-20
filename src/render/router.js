// 路由：把 URL 映射到页面渲染器。dev 与 build 共用。
import { CONTENT_SECTIONS, getPost, loadContent } from '../content/loader.js';
import { sections, site } from '../data/site.js';
import { renderHead, breadcrumbSchema, withBase } from '../utils/seo.js';
import { renderDocument } from './layout.js';
import { renderHome } from './home.js';
import { renderSection } from './section.js';
import { renderArticle } from './article.js';
import { renderBooks } from './books.js';
import { renderResources } from './resources.js';
import { renderAbout } from './about.js';
import { renderSearch } from './search.js';
import { breadcrumbs, icon } from './components.js';

export function normalizePath(pathname = '/') {
  let path = String(pathname).split('?')[0].split('#')[0];
  path = decodeURIComponent(path);
  if (path.endsWith('/index.html')) path = path.slice(0, -'index.html'.length);
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;
  return path;
}

export function renderNotFound({ base = '/', dev = false }) {
  const body = `<div class="section" style="min-height:56vh">
  <div class="container" style="max-width:720px">
    <p class="kicker">404 · Not Found</p>
    <h1 style="font-size:clamp(2rem,4vw,3rem);margin-top:14px">这个页面没有找到</h1>
    <p class="lede" style="margin-top:14px">可能是链接写错了，或者内容已经调整。你可以从下面的入口继续。</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:26px">
      <a class="btn btn-primary" href="${withBase(base, '/')}">返回首页${icon('arrowRight')}</a>
      <a class="btn btn-ghost" href="${withBase(base, '/search/')}">搜索内容</a>
    </div>
    <div class="grid grid-3" style="margin-top:40px">
      ${['cases', 'methods', 'profit']
        .map(
          (k) =>
            `<a class="bucket" href="${withBase(base, `/${k}/`)}" style="text-decoration:none"><div class="bucket-head"><h3>${
              sections[k].label
            }</h3><span>→</span></div><p style="margin-top:12px;font-size:.8125rem;color:var(--muted)">${
              sections[k].intro
            }</p></a>`,
        )
        .join('')}
    </div>
  </div>
</div>`;

  return renderDocument({
    base,
    dev,
    current: '404',
    pageType: 'notfound',
    head: renderHead({
      base,
      title: '页面未找到',
      description: '你访问的页面不存在。返回首页继续浏览小生意研究内容。',
      path: '/404.html',
      jsonLd: [],
    }),
    body,
  });
}

function renderStatic(key, { base, dev }) {
  if (key === 'books') return renderBooks({ base, dev });
  if (key === 'resources') return renderResources({ base, dev });
  if (key === 'about') return renderAbout({ base, dev });
  return null;
}

export function renderPage(pathname, { base = '/', dev = false } = {}) {
  const path = normalizePath(pathname);
  if (path === '/') return renderHome({ base, dev });
  if (path === '/search/') return renderSearch({ base, dev });
  if (path === '/books/') return renderBooks({ base, dev });
  if (path === '/resources/') return renderResources({ base, dev });
  if (path === '/about/') return renderAbout({ base, dev });
  if (path === '/404.html' || path === '/404/') return renderNotFound({ base, dev });

  const parts = path.split('/').filter(Boolean);
  if (parts.length === 1 && CONTENT_SECTIONS.includes(parts[0])) {
    return renderSection({ base, dev, section: parts[0] });
  }
  if (parts.length === 2 && CONTENT_SECTIONS.includes(parts[0])) {
    const post = getPost(parts[0], parts[1]);
    if (post) return renderArticle({ base, dev, post });
  }
  return null;
}

// 构建期：所有需要输出的静态页面。
export function listPages() {
  const { posts } = loadContent();
  const pages = ['/', '/search/', '/books/', '/resources/', '/about/'];
  CONTENT_SECTIONS.forEach((s) => pages.push(`/${s}/`));
  posts.forEach((p) => pages.push(p.url));
  return pages;
}