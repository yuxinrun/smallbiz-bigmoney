// 通用 UI：主题、移动导航、阅读进度、返回顶部、Toast、收藏按钮、Newsletter 演示。
import { isSaved, toggleSaved, addHistory } from './store.js';

const THEME_KEY = 'sbbm-theme';

export function toast(message) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove('is-visible'), 2800);
}

function initTheme() {
  const root = document.documentElement;
  const buttons = document.querySelectorAll('[data-theme-toggle]');
  const apply = (theme) => {
    root.dataset.theme = theme;
    buttons.forEach((b) => {
      b.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换深色模式');
    });
  };
  apply(root.dataset.theme || 'light');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* 忽略隐私模式下的写入失败 */
      }
    });
  });
}

function initMenu() {
  const panel = document.querySelector('[data-mobile-nav]');
  const scrim = document.querySelector('[data-menu-scrim]');
  const openBtn = document.querySelector('[data-menu-toggle]');
  const closeBtn = document.querySelector('[data-menu-close]');
  if (!panel || !openBtn) return;

  let open = false;
  const setOpen = (value) => {
    open = value;
    if (value) {
      panel.hidden = false;
      scrim.hidden = false;
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
        scrim.classList.add('is-open');
      });
    } else {
      panel.classList.remove('is-open');
      scrim.classList.remove('is-open');
      window.setTimeout(() => {
        if (!open) {
          panel.hidden = true;
          scrim.hidden = true;
        }
      }, 260);
    }
    openBtn.setAttribute('aria-expanded', String(value));
    document.body.classList.toggle('nav-open', value);
  };

  openBtn.addEventListener('click', () => setOpen(true));
  closeBtn?.addEventListener('click', () => setOpen(false));
  scrim?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}

function initScroll() {
  const progress = document.querySelector('[data-progress] span');
  const toTop = document.querySelector('[data-to-top]');
  const isArticle = document.body.dataset.page === 'article';

  const update = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && isArticle) {
      progress.style.width = `${height > 0 ? Math.min(100, (top / height) * 100) : 0}%`;
    }
    if (toTop) toTop.classList.toggle('is-visible', top > 560);
  };

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true },
  );
  update();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function syncSaveButtons(buttons, id) {
  const saved = isSaved(id);
  buttons.forEach((b) => {
    if (b.dataset.save === id) {
      b.classList.toggle('is-saved', saved);
      b.setAttribute('aria-pressed', String(saved));
      const label = b.querySelector('span');
      if (label) {
        if (b.closest('.article-end') || b.classList.contains('card-save')) {
          label.textContent = saved ? '已收藏' : '收藏';
        }
      }
    }
  });
}

function initSaves() {
  const buttons = [...document.querySelectorAll('[data-save]')];
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    syncSaveButtons(buttons, btn.dataset.save);
    btn.addEventListener('click', () => {
      const saved = toggleSaved(btn.dataset.save);
      syncSaveButtons(buttons, btn.dataset.save);
      toast(saved ? '已收藏，保存在本机浏览器' : '已取消收藏');
    });
  });
}

function initHistory() {
  if (document.body.dataset.page !== 'article') return;
  const id = document.body.dataset.slug;
  const title = document.querySelector('.article-title')?.textContent?.trim();
  if (!id || !title) return;
  addHistory({ id, title, url: location.pathname, date: new Date().toISOString().slice(0, 10) });
}

function initNewsletter() {
  const form = document.querySelector('[data-newsletter]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const value = input?.value?.trim() || '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      toast('请输入有效的邮箱地址');
      input?.focus();
      return;
    }
    toast('演示模式：本站尚未接入邮件服务，未保存你的邮箱');
    form.reset();
  });
}

export function initUI() {
  initTheme();
  initMenu();
  initScroll();
  initSaves();
  initHistory();
  initNewsletter();
}