// 文章详情页：长文阅读、目录、图表、来源、相关阅读。
import { loadContent, relatedPosts, siblingPosts } from '../content/loader.js';
import { sections, site } from '../data/site.js';
import {
  renderHead,
  articleSchema,
  breadcrumbSchema,
  withBase,
  absoluteUrl,
} from '../utils/seo.js';
import { renderDocument } from './layout.js';
import { postCard, breadcrumbs, icon, formatDate, sectionHeading } from './components.js';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function linkify(text) {
  const safe = esc(text);
  return safe.replace(/(https?:\/\/[^\s，。）]+)/g, (url) => {
    const clean = url.replace(/[.,;)]$/, '');
    return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>`;
  });
}

export function renderArticle({ base = '/', dev = false, post }) {
  const def = sections[post.section] || sections.cases;
  const shareUrl = absoluteUrl(base, post.url);
  const shareText = encodeURIComponent(`${post.title} — ${site.name}`);
  const encodedUrl = encodeURIComponent(shareUrl);
  const { prev, next } = siblingPosts(post);
  const related = relatedPosts(post, 3);
  const toc = post.toc.filter((t) => t.level <= 3).slice(0, 16);

  const metaParts = [
    `<span class="meta-item">${formatDate(post.date)}</span>`,
    `<span class="meta-item">${icon('clock')}${post.readingTime} 分钟阅读</span>`,
    post.region ? `<span class="meta-item">${post.region === 'global' ? '海外案例' : '中国案例'}</span>` : '',
    post.industry ? `<span class="meta-item">${post.industry}</span>` : '',
    post.startupLabel || post.startupCost ? `<span class="meta-item">${post.startupLabel || `启动约 ${post.startupCost} 万元`}</span>` : '',
  ].filter(Boolean);

  const body = `
<article class="article-page">
  <div class="container container-wide">
    ${breadcrumbs(
      [
        { label: '首页', href: '/' },
        { label: def.label, href: `/${post.section}/` },
        { label: post.title, href: post.url },
      ],
      base,
    )}
    <header class="article-head">
      <div class="article-kicker">
        <a class="tag" href="${withBase(base, `/${post.section}/`)}">${post.sectionLabel}</a>
        ${post.category && post.category !== post.sectionLabel ? `<span>${esc(post.category)}</span>` : ''}
        ${post.tags.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('<span aria-hidden="true">/</span>')}
      </div>
      <h1 class="article-title">${esc(post.title)}</h1>
      ${post.subtitle ? `<p class="article-subtitle">${esc(post.subtitle)}</p>` : ''}
      <div class="article-meta">
        ${metaParts.join('')}
        <div class="article-meta-actions">
          <button class="share-btn" type="button" data-save="${post.section}/${post.slug}" aria-pressed="false">${icon('bookmark')}<span>收藏</span></button>
          <button class="share-btn" type="button" data-share-copy>${icon('share')}<span>复制链接</span></button>
          <a class="share-btn" href="https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${shareText}" target="_blank" rel="noopener noreferrer">分享到微博</a>
        </div>
      </div>
    </header>
  </div>

  <div class="container container-wide">
    <div class="article-cover">
      <img src="${withBase(base, post.cover)}" alt="${esc(post.coverAlt)}" width="1200" height="600" loading="eager" fetchpriority="high" decoding="async">
    </div>
  </div>

  <div class="container container-wide">
    ${
      post.takeaways.length
        ? `<section class="article-keypoints" aria-label="核心观点">
      <h2>核心观点</h2>
      <ul>${post.takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </section>`
        : ''
    }
    ${
      post.keyNumbers.length
        ? `<section class="article-numbers" aria-label="关键数字">
      <h2>关键数字</h2>
      <ul>${post.keyNumbers.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
    </section>`
        : ''
    }
    ${
      toc.length
        ? `<details class="toc-mobile"><summary>展开本文目录（${toc.length} 节）</summary><ol>${toc
            .map((t) => `<li class="${t.level === 3 ? 'toc-sub' : ''}"><a href="#${t.id}">${esc(t.text)}</a></li>`)
            .join('')}</ol></details>`
        : ''
    }
  </div>

  <div class="container container-wide">
    <div class="article-layout">
      <div>
        <div class="prose" data-prose>
          ${post.html}
        </div>

        <div class="article-end">
          <div class="article-end-actions">
            <div class="share-group">
              <button class="share-btn" type="button" data-save="${post.section}/${post.slug}" aria-pressed="false">${icon('bookmark')}<span>收藏文章</span></button>
              <button class="share-btn" type="button" data-share-copy>${icon('share')}<span>复制链接</span></button>
              <button class="share-btn" type="button" data-share-native>${icon('arrowRight')}<span>系统分享</span></button>
            </div>
            <span class="muted" style="font-size:.75rem">最后更新：${formatDate(post.date)}</span>
          </div>
          <p class="article-disclaimer"><strong>阅读提示：</strong>本文为商业研究内容，不构成投资、财务或法律建议。文中涉及的经营数字分为公开事实、基于公开价格的测算与研究假设三类，已在正文或图表中标注口径。个别案例的成功不代表普遍规律，任何生意都存在失败风险。</p>
        </div>

        <section class="sources">
          <h2>资料来源与口径说明</h2>
          ${
            post.sources.length
              ? `<ol>${post.sources.map((s) => `<li>${linkify(s)}</li>`).join('')}</ol>`
              : '<p style="font-size:.8125rem;color:var(--muted);margin-top:8px">本文未使用外部统计数字；文中测算为示例模型，用于说明计算方法，不代表任何具体企业的真实经营数据。</p>'
          }
        </section>

        <nav class="prev-next" aria-label="上一篇与下一篇">
          ${
            prev
              ? `<a href="${withBase(base, prev.url)}"><span>← 上一篇</span><strong>${esc(prev.title)}</strong></a>`
              : '<a href="' + withBase(base, `/${post.section}/`) + '"><span>← 返回栏目</span><strong>' + esc(def.label) + '</strong></a>'
          }
          ${
            next
              ? `<a class="next" href="${withBase(base, next.url)}"><span>下一篇 →</span><strong>${esc(next.title)}</strong></a>`
              : `<a class="next" href="${withBase(base, '/cases/')}"><span>继续阅读 →</span><strong>更多赚钱案例</strong></a>`
          }
        </nav>
      </div>

      <aside class="article-aside">
        ${
          toc.length
            ? `<nav class="toc" aria-label="文章目录" data-toc>
          <p class="toc-title">本文目录</p>
          <ol>${toc
            .map(
              (t) =>
                `<li class="${t.level === 3 ? 'toc-sub' : ''}"><a href="#${t.id}">${esc(t.text)}</a></li>`,
            )
            .join('')}</ol>
          <div class="toc-foot"><a class="text-link" href="${withBase(base, '/about/')}">关于研究方法</a></div>
        </nav>`
            : ''
        }
      </aside>
    </div>
  </div>

  <div class="section-tight">
    <div class="container container-wide">
      <div class="related-block">
        ${sectionHeading({
          kicker: 'Related',
          title: '相关阅读',
          desc: '按行业、模式与主题匹配，帮助你从不同角度理解同一门生意。',
          href: `/${post.section}/`,
          linkLabel: `更多${def.label}`,
          base,
        })}
        <div class="grid grid-3">${related.map((p) => postCard(p, base)).join('')}</div>
      </div>
    </div>
  </div>
</article>`;

  return renderDocument({
    base,
    dev,
    current: `/${post.section}/`,
    pageType: 'article',
    slug: `${post.section}/${post.slug}`,
    head: renderHead({
      base,
      title: post.title,
      description: post.description,
      path: post.url,
      image: post.cover,
      type: 'article',
      published: post.date,
      modified: post.date,
      jsonLd: [
        articleSchema(base, post),
        breadcrumbSchema(base, [
          { label: '首页', href: '/' },
          { label: def.label, href: `/${post.section}/` },
          { label: post.title, href: post.url },
        ]),
      ],
    }),
    body,
  });
}