// 全站搜索页（客户端检索）。
import { loadContent } from '../content/loader.js';
import { renderHead, breadcrumbSchema, withBase } from '../utils/seo.js';
import { renderDocument } from './layout.js';
import { breadcrumbs, icon } from './components.js';

export function renderSearch({ base = '/', dev = false }) {
  const { tags, stats } = loadContent();
  const hotTags = tags.slice(0, 10);

  const body = `
<div class="search-hero">
  <div class="container container-wide">
    ${breadcrumbs([{ label: '首页', href: '/' }, { label: '全站搜索', href: '/search/' }], base)}
    <div style="margin-top:16px">
      <p class="kicker">Search</p>
      <h1>搜索全部研究内容</h1>
      <p class="lede" style="margin-top:10px">共 ${stats.articles} 篇文章、${stats.cases} 个案例、${stats.models} 套商业模式。支持标题、摘要、正文与标签检索。</p>
      <form class="search-form-large" role="search" data-search-form>
        ${icon('search')}
        <input type="search" name="q" placeholder="例如：社区洗衣店、现金流、定价、复购" aria-label="搜索关键词" autocomplete="off">
        <button type="submit">搜索</button>
      </form>
      <div class="search-suggest">
        <span>热门方向：</span>
        ${hotTags.map((t) => `<button type="button" data-search-tag="${t.tag}">${t.tag}</button>`).join('')}
      </div>
    </div>
  </div>
</div>

<div class="search-shell">
  <div class="container container-wide">
    <p class="search-status" data-search-status>输入关键词开始搜索，或点击上方的热门方向。</p>
    <div class="search-results" data-search-results></div>
    <div class="empty-state" data-search-empty hidden>
      <p class="empty-title">没有找到相关内容</p>
      <p>尝试更短的关键词，例如“现金流”而不是“小生意如何管理现金流”。</p>
    </div>
    <noscript><p class="muted" style="margin-top:20px">搜索功能需要启用 JavaScript。你也可以直接浏览各栏目页面。</p></noscript>
  </div>
</div>`;

  return renderDocument({
    base,
    dev,
    current: '/search/',
    pageType: 'search',
    head: renderHead({
      base,
      title: '全站搜索',
      description: '搜索小生意、赚大钱知识库的全部研究内容：案例、商业模式、利润结构、现金流与经营方法论。',
      path: '/search/',
      jsonLd: [
        breadcrumbSchema(base, [
          { label: '首页', href: '/' },
          { label: '全站搜索', href: '/search/' },
        ]),
      ],
    }),
    body,
  });
}