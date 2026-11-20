// 文章页增强：目录高亮、复制链接、系统分享。
import { toast } from './ui.js';

function initToc() {
  const prose = document.querySelector('[data-prose]');
  const toc = document.querySelector('[data-toc]');
  if (!prose || !toc) return;
  const headings = [...prose.querySelectorAll('h2[id], h3[id]')];
  if (!headings.length) return;
  const links = new Map(
    [...toc.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]),
  );
  if (!links.size) return;

  const activate = (id) => {
    links.forEach((a, key) => a.classList.toggle('is-active', key === id));
  };

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activate(visible[0].target.id);
    },
    { rootMargin: '-96px 0px -66% 0px', threshold: [0, 1] },
  );
  headings.forEach((h) => observer.observe(h));

  links.forEach((a, id) => {
    a.addEventListener('click', () => activate(id));
  });
}

function initShare() {
  document.querySelectorAll('[data-share-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = location.href;
      try {
        await navigator.clipboard.writeText(url);
        toast('链接已复制');
      } catch {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand('copy');
          toast('链接已复制');
        } catch {
          toast('复制失败，请手动复制地址栏链接');
        }
        input.remove();
      }
    });
  });

  document.querySelectorAll('[data-share-native]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: document.title, url: location.href });
        } catch {
          /* 用户取消，无需提示 */
        }
      } else {
        toast('当前浏览器不支持系统分享，可使用“复制链接”');
      }
    });
  });
}

export function initArticle() {
  if (document.body.dataset.page !== 'article') return;
  initToc();
  initShare();
}