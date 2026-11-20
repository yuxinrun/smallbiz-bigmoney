// 商业书单页。
import { loadContent } from '../content/loader.js';
import { sections } from '../data/site.js';
import { renderHead, breadcrumbSchema, collectionSchema, withBase } from '../utils/seo.js';
import { renderDocument } from './layout.js';
import { bookCard, breadcrumbs, icon, sectionHeading } from './components.js';

export function renderBooks({ base = '/', dev = false }) {
  const { books } = loadContent();
  const def = sections.books;
  const categories = [...new Set(books.map((b) => b.category))];

  const body = `
<div class="page-head">
  <div class="container container-wide">
    ${breadcrumbs([{ label: '首页', href: '/' }, { label: '商业书单', href: '/books/' }], base)}
    <div class="page-head-inner" style="margin-top:18px">
      <div>
        <p class="kicker">${def.kicker}</p>
        <h1>${def.title}</h1>
        <p class="lede">${def.intro}</p>
      </div>
      <div class="page-head-aside">
        <div class="page-head-stat"><strong>${books.length}</strong><span>本精选书籍</span></div>
        <div class="page-head-stat"><strong>${categories.length}</strong><span>个阅读主题</span></div>
      </div>
    </div>
    <p class="page-note"><strong>选书说明：</strong>${def.note}每本书都标注“解决什么问题、适合什么阶段、有什么局限”，而不是只给一句推荐语。</p>
  </div>
</div>

<div class="section-tight">
  <div class="container container-wide">
    <div class="filter-panel" data-book-filter-bar>
      <div class="filter-top">
        <label class="filter-search">
          ${icon('search')}
          <input type="search" data-book-search placeholder="搜索书名、作者或主题" aria-label="搜索书籍">
        </label>
        <div class="filter-status"><strong data-book-count>${books.length}</strong> 本书<span class="dot">·</span><button type="button" class="text-button" data-book-reset>重置</button></div>
      </div>
      <div class="filter-groups">
        <div class="filter-group">
          <span class="filter-label">主题</span>
          <button type="button" class="chip is-active" data-book-category="all">全部</button>
          ${categories.map((c) => `<button type="button" class="chip" data-book-category="${c}">${c}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="books-grid" data-book-grid>
      ${books.map((b) => `<div data-book-item data-category="${b.category}" data-keywords="${(b.title + b.author + b.category + b.summary).toLowerCase()}">${bookCard(b, base)}</div>`).join('')}
    </div>
    <div class="empty-state" data-book-empty hidden><p class="empty-title">没有匹配的书</p><p>试试其他关键词，或重置筛选。</p></div>
  </div>
</div>

<div class="section-tight section-deep">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'How to Read',
      title: '怎么读，才有用',
      desc: '经营类书籍最大的风险，是把“读过了”当成“会做了”。建议按下面的顺序读，并强制输出。',
      base,
    })}
    <div class="grid grid-3">
      <div class="bucket"><div class="bucket-head"><h3>1. 先读“算账”</h3><span>财务</span></div><p style="margin-top:12px;font-size:.875rem;line-height:1.8;color:var(--muted)">先建立利润、成本、现金流的基本概念，再看案例。否则很容易被故事带走，忽略数字。</p></div>
      <div class="bucket"><div class="bucket-head"><h3>2. 再读“需求”</h3><span>客户</span></div><p style="margin-top:12px;font-size:.875rem;line-height:1.8;color:var(--muted)">理解客户如何做决策、如何被影响。读完后用一周时间访谈 5 位真实客户，比做笔记更重要。</p></div>
      <div class="bucket"><div class="bucket-head"><h3>3. 最后读“系统”</h3><span>经营</span></div><p style="margin-top:12px;font-size:.875rem;line-height:1.8;color:var(--muted)">当业务跑通、开始雇人或扩品类时，再读流程化与组织。过早系统化会扼杀小生意的灵活性。</p></div>
    </div>
    <p style="margin-top:24px;font-size:.8125rem;color:var(--muted)">书籍信息与出版年份以公开资料为准；不同版本、译本与出版社可能存在差异。外部链接指向公开检索页，不构成购买推荐。</p>
  </div>
</div>`;

  return renderDocument({
    base,
    dev,
    current: '/books/',
    pageType: 'books',
    head: renderHead({
      base,
      title: def.seoTitle,
      description: def.description,
      path: '/books/',
      jsonLd: [
        collectionSchema(base, {
          title: def.title,
          description: def.description,
          url: '/books/',
          items: books.map((b) => ({ title: `《${b.title}》`, url: '/books/' })),
        }),
        breadcrumbSchema(base, [
          { label: '首页', href: '/' },
          { label: '商业书单', href: '/books/' },
        ]),
      ],
    }),
    body,
  });
}