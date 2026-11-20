// 优质资源页。
import { loadContent } from '../content/loader.js';
import { sections } from '../data/site.js';
import { renderHead, breadcrumbSchema, collectionSchema } from '../utils/seo.js';
import { renderDocument } from './layout.js';
import { resourceCard, breadcrumbs, icon, sectionHeading } from './components.js';

export function renderResources({ base = '/', dev = false }) {
  const { resources } = loadContent();
  const def = sections.resources;
  const categories = [...new Set(resources.map((r) => r.category))];
  const regions = [...new Set(resources.map((r) => r.region))];

  const body = `
<div class="page-head">
  <div class="container container-wide">
    ${breadcrumbs([{ label: '首页', href: '/' }, { label: '优质资源', href: '/resources/' }], base)}
    <div class="page-head-inner" style="margin-top:18px">
      <div>
        <p class="kicker">${def.kicker}</p>
        <h1>${def.title}</h1>
        <p class="lede">${def.intro}</p>
      </div>
      <div class="page-head-aside">
        <div class="page-head-stat"><strong>${resources.length}</strong><span>个收录资源</span></div>
        <div class="page-head-stat"><strong>${categories.length}</strong><span>个使用场景</span></div>
      </div>
    </div>
    <p class="page-note"><strong>收录说明：</strong>${def.note}所有链接均为公开可访问站点，并标注了免费程度与使用门槛。</p>
  </div>
</div>

<div class="section-tight">
  <div class="container container-wide">
    <div class="filter-panel" data-resource-filter-bar>
      <div class="filter-top">
        <label class="filter-search">
          ${icon('search')}
          <input type="search" data-resource-search placeholder="搜索资源名称或用途" aria-label="搜索资源">
        </label>
        <div class="filter-status"><strong data-resource-count>${resources.length}</strong> 个资源<span class="dot">·</span><button type="button" class="text-button" data-resource-reset>重置</button></div>
      </div>
      <div class="filter-groups">
        <div class="filter-group">
          <span class="filter-label">地区</span>
          <button type="button" class="chip is-active" data-resource-region="all">全部</button>
          ${regions.map((r) => `<button type="button" class="chip" data-resource-region="${r}">${r}</button>`).join('')}
        </div>
        <div class="filter-group">
          <span class="filter-label">场景</span>
          <button type="button" class="chip is-active" data-resource-category="all">全部</button>
          ${categories.map((c) => `<button type="button" class="chip" data-resource-category="${c}">${c}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="resources-grid" data-resource-grid>
      ${resources
        .map(
          (r) => `<div data-resource-item data-region="${r.region}" data-category="${r.category}" data-keywords="${(
            r.name +
            r.summary +
            r.use +
            r.category
          ).toLowerCase()}">${resourceCard(r)}</div>`,
        )
        .join('')}
    </div>
    <div class="empty-state" data-resource-empty hidden><p class="empty-title">没有匹配的资源</p><p>试试其他关键词，或重置筛选。</p></div>

    <p style="margin-top:28px;font-size:.8125rem;line-height:1.8;color:var(--muted)">说明：部分海外服务需要稳定的国际网络环境，部分数据库需要机构订阅或注册。收录不代表商业合作或背书，使用前请自行核对其最新条款。</p>
  </div>
</div>

<div class="section-tight section-deep">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'How We Use Them',
      title: '我们如何使用这些资源',
      desc: '资源的价值不在收藏夹，而在于支撑一个具体判断。以下是我们研究案例时的常规流程。',
      base,
    })}
    <div class="grid grid-3">
      <div class="bucket"><div class="bucket-head"><h3>先确认底线</h3><span>官方数据</span></div><p style="margin-top:12px;font-size:.875rem;line-height:1.8;color:var(--muted)">用统计年鉴、企业信用信息与政策原文，确认行业规模、主体真实性与监管边界。这一步不做，后面的测算都可能建立在错误前提上。</p></div>
      <div class="bucket"><div class="bucket-head"><h3>再估算结构</h3><span>行业研究</span></div><p style="margin-top:12px;font-size:.875rem;line-height:1.8;color:var(--muted)">用行业报告与公开报道交叉验证成本结构、客单价与渠道变化，并记录来源与发布时间，避免使用过期数据。</p></div>
      <div class="bucket"><div class="bucket-head"><h3>最后做测算</h3><span>工具与趋势</span></div><p style="margin-top:12px;font-size:.875rem;line-height:1.8;color:var(--muted)">用趋势工具验证需求方向，用表格建立自己的单店/单客模型。所有外部数字都只是输入，结论必须由自己的模型得出。</p></div>
    </div>
  </div>
</div>`;

  return renderDocument({
    base,
    dev,
    current: '/resources/',
    pageType: 'resources',
    head: renderHead({
      base,
      title: def.seoTitle,
      description: def.description,
      path: '/resources/',
      jsonLd: [
        collectionSchema(base, {
          title: def.title,
          description: def.description,
          url: '/resources/',
          items: resources.map((r) => ({ title: r.name, url: '/resources/' })),
        }),
        breadcrumbSchema(base, [
          { label: '首页', href: '/' },
          { label: '优质资源', href: '/resources/' },
        ]),
      ],
    }),
    body,
  });
}