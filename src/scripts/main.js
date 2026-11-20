// 客户端入口：样式与交互增强。
import '../styles/main.css';
import { initUI } from './ui.js';
import { initFilters } from './filters.js';
import { initSearch } from './search.js';
import { initArticle } from './article.js';

function boot() {
  initUI();
  initFilters();
  initArticle();
  initSearch().catch(() => {
    /* 搜索页之外不会执行 */
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}