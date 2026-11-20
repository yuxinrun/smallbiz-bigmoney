// 全站布局：document 骨架、导航、页脚、移动端菜单。
import { site, nav, moreNav, footerGroups } from '../data/site.js';
import { withBase } from '../utils/seo.js';
import { icon, brandMark } from './components.js';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const themeScript = `(function(){try{var k='sbbm-theme',t=localStorage.getItem(k);if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;

function header(base, current) {
  const isActive = (href) => href === current || (href !== '/' && current.startsWith(href));
  return `<header class="site-header" data-header>
  <div class="header-inner">
    ${brandMark(base)}
    <nav class="primary-nav" aria-label="主导航">
      ${nav
        .map(
          (item) =>
            `<a href="${withBase(base, item.href)}"${isActive(item.href) ? ' aria-current="page"' : ''}>${esc(
              item.label,
            )}</a>`,
        )
        .join('')}
    </nav>
    <div class="header-actions">
      <a class="icon-btn" href="${withBase(base, '/search/')}" aria-label="全站搜索" title="搜索">${icon('search')}</a>
      <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="切换深色模式" title="切换主题">
        <span class="theme-icon theme-icon-moon">${icon('moon')}</span>
        <span class="theme-icon theme-icon-sun">${icon('sun')}</span>
      </button>
      <button class="icon-btn menu-toggle" type="button" data-menu-toggle aria-label="打开菜单" aria-expanded="false" aria-controls="mobile-nav">${icon('menu')}</button>
    </div>
  </div>
  <div class="reading-progress" data-progress aria-hidden="true"><span></span></div>
</header>
<div class="mobile-nav" id="mobile-nav" data-mobile-nav hidden>
  <div class="mobile-nav-head">
    <span class="mobile-nav-title">浏览栏目</span>
    <button class="icon-btn" type="button" data-menu-close aria-label="关闭菜单">${icon('close')}</button>
  </div>
  <nav aria-label="移动端导航">
    ${nav
      .map(
        (item) =>
          `<a href="${withBase(base, item.href)}"${isActive(item.href) ? ' aria-current="page"' : ''}>${esc(
            item.label,
          )}<span aria-hidden="true">${icon('arrowRight')}</span></a>`,
      )
      .join('')}
    <p class="mobile-nav-label">更多</p>
    ${moreNav
      .map(
        (item) =>
          `<a href="${withBase(base, item.href)}"${isActive(item.href) ? ' aria-current="page"' : ''}>${esc(
            item.label,
          )}<span aria-hidden="true">${icon('arrowRight')}</span></a>`,
      )
      .join('')}
  </nav>
  <p class="mobile-nav-foot">${esc(site.tagline)}</p>
</div>
<div class="nav-scrim" data-menu-scrim hidden></div>`;
}

function footer(base) {
  return `<footer class="site-footer">
  <div class="footer-main">
    <div class="footer-brand">
      ${brandMark(base)}
      <p class="footer-desc">${esc(site.description)}</p>
      <div class="footer-social">
        <a href="${esc(site.github)}" target="_blank" rel="noopener noreferrer">${icon('github')}GitHub 仓库</a>
        <a href="${withBase(base, '/about/')}">关于我们</a>
      </div>
    </div>
    ${footerGroups
      .map(
        (group) => `<div class="footer-col">
      <h2>${esc(group.title)}</h2>
      ${group.links
        .map((l) => `<a href="${withBase(base, l.href)}">${esc(l.label)}</a>`)
        .join('')}
    </div>`,
      )
      .join('')}
  </div>
  <div class="footer-disclaimer">
    <p><strong>免责声明</strong>${esc(site.disclaimer)}</p>
  </div>
  <div class="footer-bottom">
    <p>© ${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.nameEn)}</p>
    <p>内容研究 · 独立编写 · 数据标注口径</p>
  </div>
</footer>`;
}

export function renderDocument({
  base = '/',
  dev = false,
  head = '',
  body = '',
  current = '/',
  pageType = 'page',
  bodyClass = '',
  slug = '',
}) {
  const devTags = dev
    ? `<script type="module" src="/@vite/client"></script>`
    : `<!--vite-js-->`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${themeScript}</script>
${head}
<!--vite-css-->
</head>
<body data-base="${base}" data-page="${esc(pageType)}" data-slug="${esc(slug)}" class="${bodyClass}">
<a class="skip-link" href="#main">跳到正文</a>
${header(base, current)}
<main id="main">
${body}
</main>
${footer(base)}
<button class="to-top" type="button" data-to-top aria-label="返回顶部">${icon('arrowUp')}<span>顶部</span></button>
<div class="toast" data-toast role="status" aria-live="polite"></div>
${devTags}
</body>
</html>`;
}