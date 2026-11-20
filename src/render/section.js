// 栏目列表页：标题、介绍、筛选、卡片与相关栏目。
import { loadContent } from '../content/loader.js';
import { sections, site } from '../data/site.js';
import {
  renderHead,
  collectionSchema,
  breadcrumbSchema,
  withBase,
} from '../utils/seo.js';
import { renderDocument } from './layout.js';
import {
  postCard,
  filterBar,
  emptyState,
  breadcrumbs,
  sectionHeading,
} from './components.js';

export function renderSection({ base = '/', dev = false, section: key }) {
  const def = sections[key];
  const content = loadContent();
  const posts = content.bySection[key] || [];
  const industries = new Set(posts.map((p) => p.industry).filter(Boolean));

  const body = `
<div class="page-head">
  <div class="container container-wide">
    ${breadcrumbs([{ label: '首页', href: '/' }, { label: def.label, href: `/${key}/` }], base)}
    <div class="page-head-inner" style="margin-top:18px">
      <div>
        <p class="kicker">${def.kicker}</p>
        <h1>${def.title}</h1>
        <p class="lede">${def.intro}</p>
      </div>
      <div class="page-head-aside">
        <div class="page-head-stat"><strong>${posts.length}</strong><span>篇研究内容</span></div>
        <div class="page-head-stat"><strong>${industries.size}</strong><span>个细分行业</span></div>
        <div class="page-head-stat"><strong>${content.stats.words > 0 ? Math.round(content.stats.words / 1000) : 0}k</strong><span>全站研究字数</span></div>
      </div>
    </div>
    ${def.note ? `<p class="page-note"><strong>研究说明：</strong>${def.note}</p>` : ''}
  </div>
</div>

<div class="section-tight">
  <div class="container container-wide">
    ${filterBar(def, posts, base)}
    <div class="collection-bar">
      <span>共 <strong data-result-total>${posts.length}</strong> 篇 · 内容持续更新</span>
      <div class="view-tabs" data-sort-tabs role="group" aria-label="排序方式">
        <button type="button" class="is-active" data-sort="date" aria-pressed="true">最新发布</button>
        <button type="button" data-sort="time" aria-pressed="false">阅读时长</button>
      </div>
    </div>
    <div class="grid grid-3" data-card-grid>
      ${posts.map((p) => postCard(p, base)).join('')}
    </div>
    ${emptyState('没有找到匹配的内容。可以尝试减少筛选条件，或用更宽泛的关键词搜索。')}
  </div>
</div>

<div class="section-tight section-deep">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'Continue Reading',
      title: '其他研究方向',
      desc: '小生意不是单一学科。把案例、利润与现金流放在一起看，判断会更完整。',
      base,
    })}
    <div class="grid grid-3">
      ${['cases', 'profit', 'methods']
        .filter((k) => k !== key)
        .map((k) => {
          const s = sections[k];
          const items = (content.bySection[k] || []).slice(0, 2);
          return `<div class="bucket">
        <div class="bucket-head"><h3>${s.label}</h3><span>${items.length} 篇</span></div>
        <div class="bucket-list">
          ${
            items.length
              ? items
                  .map(
                    (p) => `<div class="bucket-item"><a href="${withBase(base, p.url)}">${p.title}</a></div>`,
                  )
                  .join('')
              : '<p class="muted" style="padding:12px 0;font-size:.8125rem">内容整理中。</p>'
          }
        </div>
        <div class="bucket-foot"><a class="text-link" href="${withBase(base, `/${k}/`)}">进入栏目</a></div>
      </div>`;
        })
        .join('')}
    </div>
  </div>
</div>`;

  return renderDocument({
    base,
    dev,
    current: `/${key}/`,
    pageType: 'section',
    head: renderHead({
      base,
      title: def.seoTitle,
      description: def.description,
      path: `/${key}/`,
      jsonLd: [
        collectionSchema(base, {
          title: def.title,
          description: def.description,
          url: `/${key}/`,
          items: posts,
        }),
        breadcrumbSchema(base, [
          { label: '首页', href: '/' },
          { label: def.label, href: `/${key}/` },
        ]),
      ],
    }),
    body,
  });
}