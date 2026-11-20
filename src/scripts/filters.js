// 列表筛选：栏目 facet、栏目内搜索、排序、URL 状态同步；书籍与资源筛选。

function initFacetFilter() {
  const bar = document.querySelector('[data-filter-bar]');
  const grid = document.querySelector('[data-card-grid]');
  if (!bar || !grid) return;

  const cards = [...grid.querySelectorAll('[data-card]')];
  const chips = [...bar.querySelectorAll('[data-facet]')];
  const searchInput = bar.querySelector('[data-filter-search]');
  const countEl = bar.querySelector('[data-filter-count]');
  const totalEl = document.querySelector('[data-result-total]');
  const emptyEl = document.querySelector('[data-empty]');
  const resetBtn = bar.querySelector('[data-filter-reset]');
  const sortTabs = [...document.querySelectorAll('[data-sort-tabs] [data-sort]')];

  const params = new URLSearchParams(location.search);
  const state = {};
  chips.forEach((chip) => {
    const key = chip.dataset.facet;
    if (key !== 'all' && !(key in state)) state[key] = 'all';
  });
  Object.keys(state).forEach((key) => {
    const fromUrl = params.get(key);
    if (fromUrl) state[key] = fromUrl;
  });
  const initialQuery = params.get('q') || '';
  if (searchInput) searchInput.value = initialQuery;
  let query = initialQuery.trim().toLowerCase();
  let sortBy = 'date';

  const applyChips = () => {
    chips.forEach((chip) => {
      const active = state[chip.dataset.facet] === chip.dataset.value;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  };

  const syncUrl = () => {
    const next = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (value && value !== 'all') next.set(key, value);
    });
    if (query) next.set('q', query);
    const search = next.toString();
    history.replaceState(null, '', `${location.pathname}${search ? `?${search}` : ''}`);
  };

  const matches = (card) => {
    for (const [key, value] of Object.entries(state)) {
      if (!value || value === 'all') continue;
      const raw = card.getAttribute(`data-facet-${key.toLowerCase()}`) || '';
      if (key === 'topic') {
        if (!raw.split('|').includes(value)) return false;
      } else if (raw !== value) {
        return false;
      }
    }
    if (query) {
      const haystack = (card.getAttribute('data-search') || '') + (card.dataset.tags || '');
      if (!haystack.includes(query)) return false;
    }
    return true;
  };

  const apply = () => {
    let visible = 0;
    cards.forEach((card) => {
      const ok = matches(card);
      card.hidden = !ok;
      if (ok) visible += 1;
    });
    if (countEl) countEl.textContent = String(visible);
    if (totalEl) totalEl.textContent = String(cards.length);
    if (emptyEl) emptyEl.hidden = visible !== 0;
  };

  const sortCards = () => {
    const sorted = [...cards].sort((a, b) => {
      if (sortBy === 'time') {
        return Number(a.dataset.time || 0) - Number(b.dataset.time || 0);
      }
      return String(b.dataset.date || '').localeCompare(String(a.dataset.date || ''));
    });
    sorted.forEach((card) => grid.append(card));
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      state[chip.dataset.facet] = chip.dataset.value;
      applyChips();
      apply();
      syncUrl();
    });
  });

  let timer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      query = searchInput.value.trim().toLowerCase();
      apply();
      syncUrl();
    }, 140);
  });

  resetBtn?.addEventListener('click', () => {
    Object.keys(state).forEach((key) => {
      state[key] = 'all';
    });
    query = '';
    if (searchInput) searchInput.value = '';
    applyChips();
    apply();
    syncUrl();
  });

  sortTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      sortBy = btn.dataset.sort;
      sortTabs.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      sortCards();
    });
  });

  applyChips();
  sortCards();
  apply();
}

function initBookFilter() {
  const bar = document.querySelector('[data-book-filter-bar]');
  const grid = document.querySelector('[data-book-grid]');
  if (!bar || !grid) return;
  const items = [...grid.querySelectorAll('[data-book-item]')];
  const chips = [...bar.querySelectorAll('[data-book-category]')];
  const search = bar.querySelector('[data-book-search]');
  const count = bar.querySelector('[data-book-count]');
  const empty = document.querySelector('[data-book-empty]');
  const reset = bar.querySelector('[data-book-reset]');
  let category = 'all';
  let query = '';

  const apply = () => {
    let visible = 0;
    items.forEach((item) => {
      const okCategory = category === 'all' || item.dataset.category === category;
      const okQuery = !query || (item.dataset.keywords || '').includes(query);
      const ok = okCategory && okQuery;
      item.hidden = !ok;
      if (ok) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      category = chip.dataset.bookCategory;
      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      apply();
    });
  });

  let timer;
  search?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      query = search.value.trim().toLowerCase();
      apply();
    }, 140);
  });

  reset?.addEventListener('click', () => {
    category = 'all';
    query = '';
    if (search) search.value = '';
    chips.forEach((c) => c.classList.toggle('is-active', c.dataset.bookCategory === 'all'));
    apply();
  });

  apply();
}

function initResourceFilter() {
  const bar = document.querySelector('[data-resource-filter-bar]');
  const grid = document.querySelector('[data-resource-grid]');
  if (!bar || !grid) return;
  const items = [...grid.querySelectorAll('[data-resource-item]')];
  const regionChips = [...bar.querySelectorAll('[data-resource-region]')];
  const categoryChips = [...bar.querySelectorAll('[data-resource-category]')];
  const search = bar.querySelector('[data-resource-search]');
  const count = bar.querySelector('[data-resource-count]');
  const empty = document.querySelector('[data-resource-empty]');
  const reset = bar.querySelector('[data-resource-reset]');
  let region = 'all';
  let category = 'all';
  let query = '';

  const apply = () => {
    let visible = 0;
    items.forEach((item) => {
      const ok =
        (region === 'all' || item.dataset.region === region) &&
        (category === 'all' || item.dataset.category === category) &&
        (!query || (item.dataset.keywords || '').includes(query));
      item.hidden = !ok;
      if (ok) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
  };

  regionChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      region = chip.dataset.resourceRegion;
      regionChips.forEach((c) => c.classList.toggle('is-active', c === chip));
      apply();
    });
  });
  categoryChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      category = chip.dataset.resourceCategory;
      categoryChips.forEach((c) => c.classList.toggle('is-active', c === chip));
      apply();
    });
  });

  let timer;
  search?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      query = search.value.trim().toLowerCase();
      apply();
    }, 140);
  });

  reset?.addEventListener('click', () => {
    region = 'all';
    category = 'all';
    query = '';
    if (search) search.value = '';
    regionChips.forEach((c) => c.classList.toggle('is-active', c.dataset.resourceRegion === 'all'));
    categoryChips.forEach((c) => c.classList.toggle('is-active', c.dataset.resourceCategory === 'all'));
    apply();
  });

  apply();
}

export function initFilters() {
  initFacetFilter();
  initBookFilter();
  initResourceFilter();
}