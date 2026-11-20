// 关于我们：研究方法、内容原则与免责声明。
import { loadContent } from '../content/loader.js';
import { sections, site } from '../data/site.js';
import { renderHead, breadcrumbSchema, withBase } from '../utils/seo.js';
import { renderDocument } from './layout.js';
import { breadcrumbs, icon } from './components.js';

const PRINCIPLES = [
  {
    title: '区分事实、测算与假设',
    desc: '公开数据注明来源与时间；基于价格的测算注明公式与口径；无法验证的部分明确标记为研究假设，而不是写成结论。',
  },
  {
    title: '不承诺收益',
    desc: '任何案例都不代表普遍规律。“有人靠这个赚钱”与“你能靠这个赚钱”是两件事，后者取决于位置、能力、资金与执行。',
  },
  {
    title: '先算失败，再谈成功',
    desc: '每篇案例都包含最坏情况下的损失上限、盈亏平衡点与退出方式。不知道如何停止的人，不适合开始。',
  },
  {
    title: '拒绝伪需求与跟风',
    desc: '我们更愿意写“这个方向可能不适合你”，而不是制造焦虑。需求必须由真实的付费行为证明，而不是由热度证明。',
  },
  {
    title: '方法必须可执行',
    desc: '方法论要能落到明天的动作：访谈谁、问什么、记录什么、用什么标准判断继续或停止。',
  },
  {
    title: '允许被更正',
    desc: '如果引用有误、口径不清或结论过时，我们会直接修改并在页面标注更新日期，而不是悄悄删除。',
  },
];

export function renderAbout({ base = '/', dev = false }) {
  const { stats } = loadContent();
  const def = sections.about;

  const body = `
<div class="about-hero">
  <div class="container container-wide">
    ${breadcrumbs([{ label: '首页', href: '/' }, { label: '关于我们', href: '/about/' }], base)}
    <div style="margin-top:18px">
      <p class="kicker">${def.kicker}</p>
      <h1>我们研究小生意，<br>不研究风口。</h1>
      <p class="lede">${def.intro}</p>
    </div>
    <div class="about-metrics">
      <div class="about-metric"><strong>${stats.articles}</strong><span>篇研究文章</span></div>
      <div class="about-metric"><strong>${stats.cases}</strong><span>个案例拆解</span></div>
      <div class="about-metric"><strong>${stats.models}</strong><span>套商业模式</span></div>
    </div>
  </div>
</div>

<div class="section">
  <div class="container container-wide">
    <div class="about-grid">
      <div class="about-block">
        <p class="kicker">Why</p>
        <h2 style="margin-top:10px">为什么做这个站</h2>
        <p>关于小生意的中文内容，长期被两种叙事占据：一种是加盟广告，把个别门店的流水包装成普遍机会；另一种是成功学，用情绪替代计算。</p>
        <p>真正缺的是第三种：把一门生意拆开，算清楚客户为什么付钱、成本花在哪里、现金多久转一圈、普通人复制需要什么条件、失败会损失多少。</p>
        <p>这个站点只做这一件事。它不追求覆盖所有项目，而是试图建立一套可以反复使用的判断框架——让你在面对下一个“赚钱机会”时，知道该问什么问题。</p>
        <blockquote class="pullquote" style="margin-top:24px">小生意不需要宏大的故事，它需要一张算得清的账。<cite>编辑部</cite></blockquote>
      </div>
      <div class="about-block">
        <p class="kicker">Method</p>
        <h2 style="margin-top:10px">我们如何研究</h2>
        <p>每篇案例都按同一套结构展开：案例概况、商业机会、商业模式、成本与利润、获客方法、经营流程、复制可行性、风险与失败原因、30 天行动计划、研究结论。</p>
        <p>证据分为三级，并在文中明确标注：</p>
        <ul class="principle-list">
          <li><span>A</span><div><strong>公开事实</strong><p>官方统计、企业公开信息、可核验的报道与判例。注明来源与访问时间。</p></div></li>
          <li><span>B</span><div><strong>合理测算</strong><p>基于公开价格、租金、人力成本与行业通行结构建立的示例模型，注明公式与假设。</p></div></li>
          <li><span>C</span><div><strong>研究假设</strong><p>尚未被数据验证、但需要在行动前明确说出来的判断。它们不是结论，而是待验证项。</p></div></li>
        </ul>
        <p style="margin-top:16px">我们不会把 C 写成 A。如果一篇案例缺少可靠数字，我们会保留表格结构并标注“待验证”，而不是编造一个看起来合理的数。</p>
      </div>
    </div>
  </div>
</div>

<div class="section section-deep">
  <div class="container container-wide">
    <div class="about-grid">
      <div class="about-block">
        <p class="kicker">Principles</p>
        <h2 style="margin-top:10px">内容原则</h2>
        <p>这些原则不是口号，而是编辑与写作时的硬约束。</p>
      </div>
      <div class="about-block">
        <ul class="principle-list">
          ${PRINCIPLES.map(
            (p, i) => `<li><span>0${i + 1}</span><div><strong>${p.title}</strong><p>${p.desc}</p></div></li>`,
          ).join('')}
        </ul>
      </div>
    </div>
  </div>
</div>

<div class="section">
  <div class="container container-wide">
    <div class="about-grid">
      <div class="about-block">
        <p class="kicker">Not For</p>
        <h2 style="margin-top:10px">这个站不做什么</h2>
        <p>不推荐具体加盟项目，不代销课程，不提供“稳赚”项目名单，不做收益承诺，也不把个别成功者的经历包装成可复制的规律。</p>
        <p>我们不掌握任何读者的资金与风险承受能力，因此无法给出“你该做什么”的结论。我们能做的，是把判断所需的信息与计算方式交给你。</p>
        <div style="margin-top:18px"><a class="text-link" href="${withBase(base, '/failures/')}">看看失败案例${icon('arrowRight')}</a></div>
      </div>
      <div class="about-block">
        <p class="kicker">Corrections</p>
        <h2 style="margin-top:10px">更正与联系</h2>
        <p>如果你发现文中的数据、来源或计算方式有问题，欢迎指出。请尽量附上可核验的原始材料（官方链接、报告页码、公开判例），我们会优先处理事实性错误。</p>
        <p>本站为静态站点，当前不收集用户信息。收藏与阅读记录仅保存在你自己的浏览器 LocalStorage 中，不会上传。</p>
        <p style="margin-top:16px;font-size:.8125rem;color:var(--muted)">内容许可：本站文字采用 CC BY-NC-SA 4.0 许可，非商业转载请注明出处并以相同方式共享；代码与原创图表采用 MIT 许可。</p>
      </div>
    </div>

    <div class="article-disclaimer" style="margin-top:44px">
      <strong>免责声明：</strong>${site.disclaimer}
    </div>
  </div>
</div>`;

  return renderDocument({
    base,
    dev,
    current: '/about/',
    pageType: 'about',
    head: renderHead({
      base,
      title: def.seoTitle,
      description: def.description,
      path: '/about/',
      jsonLd: [
        breadcrumbSchema(base, [
          { label: '首页', href: '/' },
          { label: '关于我们', href: '/about/' },
        ]),
      ],
    }),
    body,
  });
}