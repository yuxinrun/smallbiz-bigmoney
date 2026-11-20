// 首页：独立设计的杂志式首页。
import { loadContent } from '../content/loader.js';
import { site, sections } from '../data/site.js';
import {
  renderHead,
  websiteSchema,
  organizationSchema,
  withBase,
} from '../utils/seo.js';
import { renderDocument } from './layout.js';
import { heroArt } from './hero-art.js';
import { postCard, sectionHeading, postRow, icon, formatDate } from './components.js';
import { renderChart } from './charts.js';

const LOGIC_STEPS = [
  { title: '真实需求', desc: '客户已经在为某个问题付出时间或金钱，而不是你希望他需要。', icon: 'search' },
  { title: '可交付产品', desc: '把能力变成边界清晰、质量稳定的产品或服务，能被重复购买。', icon: 'check' },
  { title: '获客路径', desc: '找到客户本来就在的地方，用可计算成本的方式触达。', icon: 'globe' },
  { title: '转化设计', desc: '降低第一次尝试的门槛，让付钱这件事足够简单。', icon: 'filter' },
  { title: '复购机制', desc: '需求会重复发生，且客户没有更好的替代选择。', icon: 'bookmark' },
  { title: '利润结构', desc: '收入减去所有真实成本后，仍然剩下值得投入的净利。', icon: 'clock' },
  { title: '现金流', desc: '钱在需要付出去之前回来，生意才有继续经营的可能。', icon: 'arrowRight' },
  { title: '长期经营', desc: '口碑、信任与经营系统，构成别人难以复制的壁垒。', icon: 'book' },
];

const MODEL_NOTES = [
  {
    title: '收入从哪里来',
    desc: '先分清一次性收入与重复性收入。前者靠获客能力，后者靠交付质量与转换成本，两者的经营重心完全不同。',
  },
  {
    title: '成本花在哪里',
    desc: '固定成本决定你能亏多久，变动成本决定每多做一单是否更赚钱。小生意最常见的错误，是用固定成本去赌不确定的销量。',
  },
  {
    title: '现金如何转起来',
    desc: '从付钱采购到收到客户回款，中间的时间差就是现金缺口。缺口越大，越需要准备安全现金。',
  },
];

export function renderHome({ base = '/', dev = false }) {
  const { posts, bySection, stats, featured, books, resources } = loadContent();

  const lead = featured[0] || posts[0];
  const leadList = posts.filter((p) => p !== lead).slice(0, 4);
  const casePosts = (bySection.cases || []).slice(0, 4);
  const latest = posts.slice(0, 6);
  const methodPosts = (bySection.methods || []).slice(0, 4);

  const buckets = [
    { key: 'under3', label: '3 万以内', hint: '先验证，再投入', posts: [] },
    { key: '3to10', label: '3–10 万', hint: '小团队可启动', posts: [] },
    { key: 'over10', label: '10 万以上', hint: '需要稳定现金流', posts: [] },
  ];
  (bySection.startup || []).forEach((p) => {
    const cost = p.startupCost ?? 5;
    const bucket = cost <= 3 ? buckets[0] : cost <= 10 ? buckets[1] : buckets[2];
    if (bucket.posts.length < 3) bucket.posts.push(p);
  });

  const body = `
<section class="hero">
  <div class="container container-wide">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="kicker">研究型商业知识库 · 第 ${String(stats.articles).padStart(2, '0')} 期内容更新</p>
        <h1 class="hero-title">小生意，<br>赚大钱<span class="dot">。</span></h1>
        <p class="hero-sub">研究小生意的赚钱逻辑，找到普通人真正可以经营的生意。</p>
        <p class="hero-note">不贩卖暴富幻想，只研究真实需求、商业模式、利润结构与长期经营。</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${withBase(base, '/cases/')}">探索赚钱案例${icon('arrowRight')}</a>
          <a class="btn btn-ghost" href="${withBase(base, '/business-models/')}">学习商业模式</a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="false">${heroArt()}</div>
    </div>
    <div class="hero-stats">
      <div class="stat"><span class="stat-value">${stats.articles}<small>篇</small></span><span class="stat-label">深度研究文章</span></div>
      <div class="stat"><span class="stat-value">${stats.cases}<small>个</small></span><span class="stat-label">赚钱案例拆解</span></div>
      <div class="stat"><span class="stat-value">${stats.models}<small>套</small></span><span class="stat-label">商业模式模板</span></div>
      <div class="stat"><span class="stat-value">${stats.industries}<small>类</small></span><span class="stat-label">覆盖细分行业</span></div>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'Weekly Research',
      title: '本周深度研究',
      desc: '每期只挑一个值得认真算清楚的题目：需求是否真实、成本是否被低估、现金能否转回来。',
      href: '/methods/',
      linkLabel: '全部方法论',
      base,
    })}
    ${
      lead
        ? `<div class="home-lead">
      <article class="feature-card">
        <a class="feature-media" href="${withBase(base, lead.url)}">
          <span class="feature-label">本周重点</span>
          <img src="${withBase(base, lead.cover)}" alt="${lead.coverAlt}" width="960" height="540" loading="eager" fetchpriority="high" decoding="async">
        </a>
        <div class="feature-body">
          <p class="card-meta">${lead.sectionLabel}<span aria-hidden="true">·</span>${formatDate(lead.date)}<span aria-hidden="true">·</span>${lead.readingTime} 分钟阅读</p>
          <h3 class="feature-title"><a href="${withBase(base, lead.url)}">${lead.title}</a></h3>
          <p class="feature-desc">${lead.description}</p>
          <div class="feature-foot">
            <div class="tag-row">${lead.tags.slice(0, 3).map((t) => `<span class="tag">${t}</span>`).join('')}</div>
            <a class="text-link" href="${withBase(base, lead.url)}">阅读研究${icon('arrowRight')}</a>
          </div>
        </div>
      </article>
      <div class="lead-list">
        ${leadList
          .map(
            (p, i) => `<a class="lead-item" href="${withBase(base, p.url)}">
          <span>
            <strong>${p.title}</strong>
            <p>${p.sectionLabel} · ${formatDate(p.date)} · ${p.readingTime} 分钟</p>
          </span>
          <span class="lead-num">${String(i + 1).padStart(2, '0')}</span>
          ${icon('arrowRight')}
        </a>`,
          )
          .join('')}
        <div class="lead-item" style="border-bottom:0">
          <span>
            <strong>没有想研究的题目？</strong>
            <p>从全站搜索开始，按行业、启动资金或商业模式筛选。</p>
            <div style="margin-top:10px"><a class="text-link" href="${withBase(base, '/search/')}">进入搜索${icon('arrowRight')}</a></div>
          </span>
        </div>
      </div>
    </div>`
        : '<p class="muted">内容正在整理中。</p>'
    }
  </div>
</section>

<section class="section section-deep">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'Case Studies',
      title: '值得研究的赚钱案例',
      desc: '国内外各选切口：社区服务、细分零售、订阅生意与一人公司。每个案例都拆到成本与回本周期。',
      href: '/cases/',
      linkLabel: '全部案例',
      base,
    })}
    <div class="grid grid-4">
      ${casePosts.map((p) => postCard(p, base)).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'Low-Cost Startup',
      title: '小成本创业：按启动资金找方向',
      desc: '启动资金不是越低越好，而是要与“最坏情况下能承受的损失”匹配。先看回本逻辑，再看金额。',
      href: '/startup/',
      linkLabel: '全部项目',
      base,
    })}
    <div class="bucket-grid">
      ${buckets
        .map(
          (b) => `<div class="bucket">
        <div class="bucket-head"><h3>${b.label}</h3><span>${b.hint}</span></div>
        <div class="bucket-list">
          ${
            b.posts.length
              ? b.posts
                  .map(
                    (p) => `<div class="bucket-item">
              <a href="${withBase(base, p.url)}">${p.title}</a>
              <span>${p.payback || p.difficulty || '研究'}</span>
            </div>`,
                  )
                  .join('')
              : '<p class="muted" style="padding:12px 0;font-size:.8125rem">该区间内容整理中。</p>'
          }
        </div>
        <div class="bucket-foot"><a class="text-link" href="${withBase(base, '/startup/')}">按资金筛选${icon('arrowRight')}</a></div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section-ink">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'Business Model in One Chart',
      title: '一张图看懂商业模式',
      desc: '把生意画成结构，而不是讲成故事。下面两张图使用同一套示例数据，展示收入如何在成本、利润与现金之间流动。',
      href: '/business-models/',
      linkLabel: '商业模式专题',
      base,
    })}
    <div class="model-grid">
      ${renderChart('business-canvas', {
        title: '社区洗衣店的商业模式画布（示例）',
        note: '示例模型：用于演示画布填写方法，不对应任何具体企业。实际研究时应以访谈与账单数据替换。',
        data: {
          keyPartners: ['设备供应商', '物业/房东', '社区团长'],
          keyActivities: ['收衣与分拣', '洗涤与护理', '配送与客服'],
          keyResources: ['门店位置', '洗涤设备', '熟客信任'],
          valueProps: ['离家 500 米', '当天取送', '羽绒服/鞋类专洗'],
          customerRelations: ['熟客记忆', '会员储值', '售后返洗'],
          channels: ['门店自然客流', '业主群', '老客转介绍'],
          customerSegments: ['周边 1.5 公里家庭', '租房年轻人', '换季衣物护理'],
          costStructure: ['房租', '水电与耗材', '设备折旧', '人工'],
          revenueStreams: ['按件洗涤', '会员储值', '鞋包护理', '上门取送'],
        },
      })}
      ${renderChart('cash-cycle', {
        title: '同一门生意的现金周转（示例）',
        note: '示例模型：假设月营业额 4.2 万元、平均 45 天完成一次现金周转，用于说明周转天数如何影响所需周转金。',
        data: {
          nodes: [
            { label: '支付房租与耗材', note: '月初固定支出', value: 3 },
            { label: '收衣备洗', note: '库存与人工占用', value: 7 },
            { label: '交付客户', note: '确认收入', value: 3 },
            { label: '会员储值消费', note: '预收款逐步确认', value: 30 },
            { label: '现金回笼', note: '可再投入', value: 2 },
          ],
          totalDays: 45,
          caption: '预收款越多，现金缺口越小',
        },
      })}
    </div>
    <div class="model-note-grid">
      ${MODEL_NOTES.map(
        (n) => `<div class="model-note"><h3>${n.title}</h3><p>${n.desc}</p></div>`,
      ).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'First Principles',
      title: '赚钱的底层逻辑',
      desc: '任何一门能持续的小生意，都要依次回答这八个问题。任何一环断裂，利润都只是暂时的。',
      href: '/profit/',
      linkLabel: '学习利润结构',
      base,
    })}
    <div class="logic-grid">
      ${LOGIC_STEPS.map(
        (s, i) => `<div class="logic-step">
        <div class="logic-index"><span>STEP ${String(i + 1).padStart(2, '0')}</span>${icon(s.icon)}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>`,
      ).join('')}
    </div>
  </div>
</section>

<section class="section section-tight section-deep">
  <div class="container container-wide">
    <div class="grid grid-main" style="align-items:start">
      <div>
        ${sectionHeading({
          kicker: 'Methods',
          title: '经营方法论',
          desc: '从需求验证到定价、获客与复购，每一篇都给出可以明天执行的步骤。',
          href: '/methods/',
          linkLabel: '全部指南',
          base,
        })}
        <div class="post-rows">
          ${methodPosts.map((p) => postRow(p, base)).join('')}
        </div>
      </div>
      <aside style="border:1px solid var(--line);border-radius:var(--radius);padding:24px;background:var(--surface)">
        <p class="kicker">Checklist</p>
        <h3 style="margin-top:10px;font-size:1.25rem">开业前，先回答这 6 个问题</h3>
        <ol style="margin-top:14px;padding-left:1.2em;font-size:.875rem;line-height:1.9;color:var(--ink-2)">
          <li>谁会为这件事付钱？他现在的替代方案是什么？</li>
          <li>第一笔收入从哪里来？需要多久？</li>
          <li>最坏情况下，我会损失多少、能撑几个月？</li>
          <li>每多做一单，是更赚钱还是更亏钱？</li>
          <li>客户第二次付钱的理由是什么？</li>
          <li>如果三个月没有起色，我的退出方式是什么？</li>
        </ol>
        <div style="margin-top:16px"><a class="text-link" href="${withBase(base, '/methods/validate-demand/')}">需求验证方法${icon('arrowRight')}</a></div>
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="container container-wide">
    <div class="grid grid-main" style="align-items:start">
      <div>
        ${sectionHeading({
          kicker: 'Reading List',
          title: '商业书单',
          desc: '读书不能代替做生意，但能让你少交一些本可以避免的学费。',
          href: '/books/',
          linkLabel: '完整书单',
          base,
        })}
        <div class="book-strip" style="grid-template-columns:1fr 1fr">
          ${books
            .slice(0, 4)
            .map(
              (b) => `<a class="book-mini" href="${withBase(base, '/books/')}#book-${b.slug}">
            <img src="${withBase(base, b.cover)}" alt="《${b.title}》封面" width="74" height="111" loading="lazy" decoding="async">
            <div>
              <h3>《${b.title}》</h3>
              <p>${b.author}</p>
              <div class="book-mini-meta">${b.category} · ${b.year}</div>
            </div>
          </a>`,
            )
            .join('')}
        </div>
      </div>
      <div>
        ${sectionHeading({
          kicker: 'Resources',
          title: '优质商业资源',
          desc: '我们研究案例时真实会打开的数据与工具。',
          href: '/resources/',
          linkLabel: '全部资源',
          base,
        })}
        <div class="resource-list">
          ${resources
            .slice(0, 6)
            .map(
              (r) => `<a class="resource-row" href="${r.url}" target="_blank" rel="noopener noreferrer">
            <span class="resource-icon">${icon(r.icon || 'globe')}</span>
            <strong>${r.name}</strong>
            <p>${r.summary}</p>
            <span class="resource-region">${r.region} · ${r.category}</span>
          </a>`,
            )
            .join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section-deep">
  <div class="container container-wide">
    ${sectionHeading({
      kicker: 'Latest',
      title: '最新文章',
      desc: '按发布时间排列的研究笔记、案例拆解与经营工具。',
      href: '/search/',
      linkLabel: '搜索全部内容',
      base,
    })}
    <div class="grid grid-3">
      ${latest.map((p) => postCard(p, base)).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container container-wide">
    <div class="newsletter">
      <div>
        <p class="kicker">Newsletter</p>
        <h2>每月一封，研究一个小生意</h2>
        <p>不追热点，只发我们真正算过账的案例、利润拆解与经营清单。你可以随时退订。</p>
        <span class="newsletter-badge">演示功能：当前版本未接入邮件服务，提交不会真实订阅</span>
      </div>
      <form class="newsletter-form" data-newsletter novalidate>
        <input type="email" name="email" placeholder="你的邮箱地址" aria-label="邮箱地址" required>
        <button class="btn btn-primary" type="submit">订阅研究简报</button>
        <p class="newsletter-note">本站为静态站点，表单仅用于演示交互；接入邮件服务前不会收集或存储任何邮箱。</p>
      </form>
    </div>
  </div>
</section>`;

  return renderDocument({
    base,
    dev,
    current: '/',
    pageType: 'home',
    head: renderHead({
      base,
      title: `${site.name} | 研究小生意的赚钱逻辑`,
      description: site.description,
      path: '/',
      jsonLd: [websiteSchema(base), organizationSchema(base)],
    }),
    body,
  });
}