// 使用本机 Chrome 的 DevTools 协议做真实浏览器验收与截图，不引入额外依赖。
// 前置：npm run build && npm run preview（默认 http://127.0.0.1:4173）
// 用法：node scripts/screenshots.js
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'screenshots');
const SITE = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const PORT = Number(process.env.CDP_PORT || 9222);
const CHROME =
  process.env.CHROME_PATH ||
  ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(
    (p) => fs.existsSync(p),
  );

if (!CHROME) {
  console.error('Chrome/Edge not found. Set CHROME_PATH.');
  process.exit(1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(url) {
    this.url = url;
    this.seq = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }
  async open() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.listeners.get(msg.method) || []) fn(msg.params);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 30000);
    });
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(fn);
  }
  waitEvent(method, timeout = 20000) {
    return new Promise((resolve, reject) => {
      const off = () => this.listeners.get(method)?.delete(handler);
      const handler = (params) => {
        off();
        clearTimeout(timer);
        resolve(params);
      };
      const timer = setTimeout(() => {
        off();
        reject(new Error(`Event timeout: ${method}`));
      }, timeout);
      this.on(method, handler);
    });
  }
}

async function waitForEndpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome 还在启动
    }
    await sleep(250);
  }
  throw new Error('CDP endpoint not ready');
}

const results = [];
const consoleErrors = [];
const httpErrors = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
};

const profile = path.join(ROOT, 'node_modules', '.cache', `sbbm-chrome-${Date.now()}`);
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

let cdp;
try {
  cdp = new CDP(await waitForEndpoint());
  await cdp.open();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');

  cdp.on('Runtime.exceptionThrown', (p) =>
    consoleErrors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || 'unknown exception'),
  );
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') consoleErrors.push(p.args.map((a) => a.value ?? a.description ?? '').join(' '));
  });
  cdp.on('Log.entryAdded', (p) => {
    if (p.entry.level === 'error') consoleErrors.push(p.entry.text);
  });
  cdp.on('Network.loadingFailed', (p) => {
    if (!p.canceled) httpErrors.push(`${p.errorText} ${p.requestId}`);
  });
  cdp.on('Network.responseReceived', (p) => {
    if (p.response.status >= 400) httpErrors.push(`HTTP ${p.response.status} ${p.response.url}`);
  });

  const evaluate = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'evaluate failed');
    return r.result.value;
  };

  const setViewport = (width, height, mobile = false, scale = 1) =>
    cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile });

  const navigate = async (url) => {
    const loaded = cdp.waitEvent('Page.loadEventFired');
    await cdp.send('Page.navigate', { url: `${SITE}${url}` });
    await loaded;
    await evaluate('document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true');
    await sleep(500);
  };

  const shot = async (file, { clip, format = 'png', quality } = {}) => {
    const params = { format, fromSurface: true, captureBeyondViewport: Boolean(clip) };
    if (quality) params.quality = quality;
    if (clip) params.clip = { ...clip, scale: 1 };
    const { data } = await cdp.send('Page.captureScreenshot', params);
    fs.writeFileSync(path.join(OUT_DIR, file), Buffer.from(data, 'base64'));
    console.log(`  shot ${file}`);
  };

  const fullPageClip = async (maxHeight = 12000) => {
    const m = await cdp.send('Page.getLayoutMetrics');
    const size = m.cssContentSize || m.contentSize;
    return { x: 0, y: 0, width: Math.ceil(size.width), height: Math.min(Math.ceil(size.height), maxHeight) };
  };

  const elementClip = async (selector, index = 0) => {
    const rect = await evaluate(`(() => {
      const els = [...document.querySelectorAll(${JSON.stringify(selector)})];
      const el = els[${index}];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height };
    })()`);
    if (!rect) throw new Error(`element not found: ${selector}[${index}]`);
    return { x: Math.max(0, rect.x - 8), y: Math.max(0, rect.y - 8), width: rect.width + 16, height: rect.height + 16 };
  };

  const waitFor = async (expression, timeout = 6000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (await evaluate(expression)) return true;
      await sleep(150);
    }
    return false;
  };

  // ---------- 首页 ----------
  await setViewport(1440, 1000);
  await navigate('/');
  ok('home: hero rendered', await evaluate("!!document.querySelector('.hero-title')"));
  ok('home: 4 stats', (await evaluate("document.querySelectorAll('.hero-stats .stat').length")) === 4);
  ok('home: no horizontal overflow', await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'));
  const themeBefore = await evaluate("document.documentElement.dataset.theme");
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  await sleep(250);
  const themeAfter = await evaluate("document.documentElement.dataset.theme");
  ok('theme toggle works', themeBefore !== themeAfter, `${themeBefore} -> ${themeAfter}`);
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  await sleep(150);
  await shot('home-desktop.png');
  await shot('home-full.jpg', { clip: await fullPageClip(9000), format: 'jpeg', quality: 84 });

  // ---------- 手机端 ----------
  await setViewport(390, 844, true, 2);
  await navigate('/');
  ok('mobile: no horizontal overflow', await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'));
  await evaluate("document.querySelector('[data-menu-toggle]').click()");
  await sleep(350);
  ok('mobile: menu opens', await evaluate("document.querySelector('[data-mobile-nav]').hidden === false"));
  await shot('home-mobile-menu.png');
  await evaluate("document.querySelector('[data-menu-close]').click()");
  await sleep(350);
  await shot('home-mobile.png');

  // ---------- 案例列表与筛选 ----------
  await setViewport(1440, 1100);
  await navigate('/cases/');
  const totalCards = await evaluate("document.querySelectorAll('[data-card]').length");
  const visibleBefore = await evaluate("[...document.querySelectorAll('[data-card]')].filter((c) => !c.hidden).length");
  await evaluate("document.querySelector('[data-facet=\"region\"][data-value=\"global\"]').click()");
  await sleep(300);
  const visibleAfter = await evaluate("[...document.querySelectorAll('[data-card]')].filter((c) => !c.hidden).length");
  ok('cases: cards rendered', totalCards >= 12, `${totalCards} cards`);
  ok('cases: region filter works', visibleAfter > 0 && visibleAfter < visibleBefore, `${visibleBefore} -> ${visibleAfter}`);
  ok('cases: filter synced to URL', (await evaluate('location.search')).includes('region=global'));
  await evaluate("document.querySelector('[data-filter-reset]').click()");
  await sleep(300);
  await shot('cases-desktop.png');

  // ---------- 文章详情 ----------
  await setViewport(1440, 1200);
  await navigate('/cases/community-laundry/');
  ok('article: h1 present', await evaluate("!!document.querySelector('.article-title')"));
  ok('article: toc present', (await evaluate("document.querySelectorAll('.toc a').length")) > 0);
  ok('article: charts rendered', (await evaluate("document.querySelectorAll('.chart svg').length")) >= 3);
  await evaluate("document.querySelector('[data-save]').click()");
  await sleep(200);
  ok(
    'article: save to localStorage',
    await evaluate("(localStorage.getItem('sbbm:saved') || '').includes('cases/community-laundry')"),
  );
  await evaluate("window.scrollTo(0, 900)");
  await sleep(300);
  ok('article: reading progress moves', await evaluate("parseFloat(document.querySelector('[data-progress] span').style.width) > 0"));
  await evaluate('window.scrollTo(0, 0)');
  await waitFor("!document.querySelector('[data-toast].is-visible')", 4000);
  await sleep(300);
  await shot('article-desktop.png');

  const chartIndex = 1;
  await shot('chart-profit-waterfall.png', { clip: await elementClip('.chart', chartIndex) });

  // ---------- 搜索 ----------
  await setViewport(1440, 1000);
  await navigate('/search/?q=%E7%8E%B0%E9%87%91%E6%B5%81');
  ok('search: results appear', await waitFor("document.querySelectorAll('.search-result').length > 0"));
  const searchCount = await evaluate("document.querySelectorAll('.search-result').length");
  ok('search: result count', searchCount > 0, `${searchCount} results`);
  await shot('search-desktop.png');

  // ---------- 移动端文章 ----------
  await setViewport(390, 844, true, 2);
  await navigate('/cases/community-laundry/');
  ok('mobile article: no horizontal overflow', await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'));
  await shot('article-mobile.png');

  // 站内链接抽样检查（首页所有内部链接）
  await setViewport(1440, 1000);
  await navigate('/');
  const broken = await evaluate(`(async () => {
    const links = [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')))];
    const bad = [];
    for (const href of links) {
      const res = await fetch(href, { method: 'GET' });
      if (!res.ok) bad.push(href + ' -> ' + res.status);
    }
    return bad;
  })()`);
  ok('home: internal links reachable', broken.length === 0, broken.slice(0, 3).join('; '));

  // ---------- 控制台错误 ----------
  const seriousConsole = consoleErrors.filter((e) => !/favicon/i.test(e));
  ok('browser: no console errors', seriousConsole.length === 0, seriousConsole.slice(0, 3).join(' | '));
  const seriousHttp = httpErrors.filter((e) => !/404.*favicon/i.test(e));
  ok('browser: no failed requests', seriousHttp.length === 0, seriousHttp.slice(0, 3).join(' | '));
} catch (error) {
  console.error('FATAL', error);
  results.push({ name: 'script', pass: false, detail: String(error) });
} finally {
  try {
    cdp?.ws?.close();
  } catch {
    // ignore
  }
  chrome.kill();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) process.exit(1);