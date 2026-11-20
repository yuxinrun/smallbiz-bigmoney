// 生成原创 SVG 封面（文章 / 书籍）。不依赖外部图片，全部为可版本化的矢量素材。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../src/content/loader.js';
import { books } from '../src/data/books.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const COVERS = path.join(ROOT, 'public/assets/images/covers');
const BOOKS = path.join(ROOT, 'public/assets/images/books');

const SECTIONS = [
  'cases',
  'startup',
  'business-models',
  'profit',
  'cash-flow',
  'methods',
  'industries',
  'failures',
];

const LABELS = {
  cases: ['CASE STUDY', '赚钱案例'],
  startup: ['LOW-COST STARTUP', '小成本创业'],
  'business-models': ['BUSINESS MODEL', '商业模式'],
  profit: ['PROFIT STRUCTURE', '利润结构'],
  'cash-flow': ['CASH FLOW', '现金流经营'],
  methods: ['METHODS', '经营方法论'],
  industries: ['INDUSTRY', '行业机会'],
  failures: ['FAILURE ANALYSIS', '失败案例'],
};

const THEMES = [
  { bg: '#fbf8f2', ink: '#1b2f47', accent: '#c25a2b', soft: '#efe7d9' },
  { bg: '#1b2f47', ink: '#f6f1e7', accent: '#e08a5a', soft: '#2c4a69' },
  { bg: '#f4eee3', ink: '#232a33', accent: '#b78a3c', soft: '#e2d8c6' },
  { bg: '#eef1ea', ink: '#22402f', accent: '#c25a2b', soft: '#d8e2d6' },
  { bg: '#f7f2e8', ink: '#3a2b1c', accent: '#a9853f', soft: '#e8dcc6' },
  { bg: '#20262e', ink: '#f2ede3', accent: '#c9a25c', soft: '#313944' },
];

const xml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function wrapTitle(title, perLine = 11, maxLines = 3) {
  const clean = title.replace(/[：:]/g, '：');
  const chars = [...clean];
  const lines = [];
  for (let i = 0; i < chars.length && lines.length < maxLines; i += perLine) {
    lines.push(chars.slice(i, i + perLine).join(''));
  }
  if (chars.length > perLine * maxLines) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…';
  }
  return lines;
}

function decoration(kind, t, W = 1200, H = 750) {
  const cx = W - 230;
  const cy = 330;
  if (kind === 0) {
    // 柱状图
    const bars = [90, 140, 200, 260, 330];
    return `<g>
      <path d="M${cx - 190} ${cy + 190}h380" stroke="${t.ink}" stroke-width="2" opacity=".5"/>
      ${bars
        .map(
          (h, i) =>
            `<rect x="${cx - 170 + i * 74}" y="${cy + 190 - h}" width="42" height="${h}" rx="2" fill="${
              i === bars.length - 1 ? t.accent : t.ink
            }" opacity="${i === bars.length - 1 ? 1 : 0.16 + i * 0.09}"/>`,
        )
        .join('')}
      <path d="M${cx - 149} ${cy + 100}l74-26 74-38 74-40 74-48" fill="none" stroke="${t.accent}" stroke-width="2.4" opacity=".8"/>
    </g>`;
  }
  if (kind === 1) {
    // 同心圆
    return `<g fill="none" stroke="${t.ink}">
      <circle cx="${cx}" cy="${cy}" r="210" stroke-width="1.2" opacity=".28"/>
      <circle cx="${cx}" cy="${cy}" r="150" stroke-width="1.2" opacity=".4"/>
      <circle cx="${cx}" cy="${cy}" r="92" stroke-width="1.4" opacity=".55"/>
      <circle cx="${cx}" cy="${cy}" r="42" fill="${t.accent}" stroke="none" opacity=".92"/>
      <path d="M${cx - 230} ${cy}h460M${cx} ${cy - 230}v460" stroke-width="1" opacity=".18"/>
    </g>`;
  }
  if (kind === 2) {
    // 网格与方块
    let cells = '';
    for (let r = 0; r < 5; r += 1) {
      for (let c = 0; c < 5; c += 1) {
        if ((r + c) % 3 === 0) {
          cells += `<rect x="${cx - 180 + c * 74}" y="${cy - 180 + r * 74}" width="58" height="58" fill="${
            (r + c) % 6 === 0 ? t.accent : t.ink
          }" opacity="${(r + c) % 6 === 0 ? 0.9 : 0.12 + (r + c) * 0.02}"/>`;
        } else {
          cells += `<rect x="${cx - 180 + c * 74}" y="${cy - 180 + r * 74}" width="58" height="58" fill="none" stroke="${
            t.ink
          }" stroke-width="1" opacity=".22"/>`;
        }
      }
    }
    return cells;
  }
  if (kind === 3) {
    // 折线上升
    return `<g>
      <path d="M${cx - 220} ${cy + 180}h440" stroke="${t.ink}" stroke-width="1.4" opacity=".4"/>
      <path d="M${cx - 210} ${cy + 120}l88-54 82 22 92-96 84 26 76-120" fill="none" stroke="${t.ink}" stroke-width="2.2"/>
      <path d="M${cx - 210} ${cy + 120}l88-54 82 22 92-96 84 26 76-120v300h-422z" fill="${t.ink}" opacity=".06"/>
      <circle cx="${cx + 212}" cy="${cy - 102}" r="9" fill="${t.accent}"/>
      <circle cx="${cx - 122}" cy="${cy + 66}" r="4" fill="${t.accent}"/>
      <circle cx="${cx + 52}" cy="${cy - 8}" r="4" fill="${t.accent}"/>
    </g>`;
  }
  if (kind === 4) {
    // 半圆与竖线
    let lines = '';
    for (let i = 0; i < 9; i += 1) {
      lines += `<path d="M${cx - 200 + i * 50} ${cy + 190}v-${120 + (i % 4) * 44}" stroke="${
        i === 6 ? t.accent : t.ink
      }" stroke-width="${i === 6 ? 6 : 2}" opacity="${i === 6 ? 0.95 : 0.24}"/>`;
    }
    return `<g>
      <path d="M${cx - 230} ${cy + 190}a230 230 0 0 1 460 0" fill="none" stroke="${t.ink}" stroke-width="1.2" opacity=".35"/>
      ${lines}
    </g>`;
  }
  // 对角条纹与三角
  return `<g>
    <path d="M${cx - 260} ${cy + 230}L${cx + 230} ${cy - 240}" stroke="${t.ink}" stroke-width="1" opacity=".22"/>
    <path d="M${cx - 200} ${cy + 230}L${cx + 290} ${cy - 240}" stroke="${t.ink}" stroke-width="1" opacity=".16"/>
    <path d="M${cx - 70} ${cy + 180}l180-300 180 300z" fill="none" stroke="${t.ink}" stroke-width="2" opacity=".55"/>
    <circle cx="${cx + 110}" cy="${cy - 120}" r="58" fill="${t.accent}" opacity=".88"/>
  </g>`;
}

function coverSvg({ title, section, index, subtitle }) {
  const t = THEMES[index % THEMES.length];
  const [en, cn] = LABELS[section] || ['RESEARCH', '研究'];
  const lines = wrapTitle(title);
  const lineHeight = 62;
  const startY = lines.length === 2 ? 500 : 462;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750" role="img" aria-label="${xml(
    title,
  )}">
  <rect width="1200" height="750" fill="${t.bg}"/>
  <rect x="0" y="0" width="1200" height="8" fill="${t.ink}" opacity=".9"/>
  <g opacity=".5">${decoration(index % 6, t)}</g>
  <path d="M72 120h96" stroke="${t.accent}" stroke-width="2"/>
  <text x="72" y="104" font-family="Georgia, serif" font-size="15" letter-spacing="3.4" fill="${t.ink}" opacity=".62">${en}<tspan dx="16" font-family="'PingFang SC','Microsoft YaHei',sans-serif" letter-spacing="2">${cn}</tspan></text>
  ${lines
    .map(
      (line, i) =>
        `<text x="72" y="${startY + i * lineHeight}" font-family="'Noto Serif SC','Songti SC',serif" font-size="56" font-weight="600" letter-spacing="1" fill="${
          t.ink
        }">${xml(line)}</text>`,
    )
    .join('')}
  <text x="74" y="${startY + lines.length * lineHeight + 26}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="19" fill="${
    t.ink
  }" opacity=".58">${xml(subtitle || '需求 · 成本 · 利润 · 现金流')}</text>
  <path d="M72 668h420" stroke="${t.ink}" stroke-width="1" opacity=".3"/>
  <text x="72" y="700" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="15" letter-spacing="2" fill="${
    t.ink
  }" opacity=".65">小生意，赚大钱</text>
  <text x="1128" y="700" text-anchor="end" font-family="Georgia, serif" font-size="13" letter-spacing="2.4" fill="${
    t.ink
  }" opacity=".5">SMALL BUSINESS BIG MONEY</text>
  <rect x="1094" y="72" width="34" height="34" fill="none" stroke="${t.ink}" stroke-width="1.4" opacity=".55"/>
  <path d="M1101 98h20M1105 98V88l5-4v14M1114 98V83l7 4v11" fill="none" stroke="${t.ink}" stroke-width="1.2" opacity=".55"/>
</svg>`;
}

function bookSvg(book, index) {
  const t = THEMES[(index + 1) % THEMES.length];
  const lines = wrapTitle(book.title, 5, 3);
  const startY = 380;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900" role="img" aria-label="《${xml(
    book.title,
  )}》封面">
  <rect width="600" height="900" fill="${t.bg === '#fbf8f2' ? '#1b2f47' : t.bg}"/>
  <rect x="26" y="26" width="548" height="848" fill="none" stroke="${t.ink}" stroke-width="1" opacity=".35"/>
  <text x="52" y="76" font-family="Georgia, serif" font-size="12" letter-spacing="3" fill="${t.ink}" opacity=".55">SMALL BUSINESS LIBRARY</text>
  <path d="M52 96h96" stroke="${t.accent}" stroke-width="2"/>
  ${lines
    .map(
      (line, i) =>
        `<text x="52" y="${startY + i * 78}" font-family="'Noto Serif SC','Songti SC',serif" font-size="64" font-weight="600" fill="${
          t.ink
        }">${xml(line)}</text>`,
    )
    .join('')}
  <text x="54" y="${startY + lines.length * 78 + 34}" font-family="'PingFang SC',sans-serif" font-size="20" fill="${
    t.ink
  }" opacity=".6">${xml(book.author.replace(/（.*?）/g, ''))}</text>
  <g opacity=".85">
    <circle cx="470" cy="700" r="74" fill="none" stroke="${t.accent}" stroke-width="1.4"/>
    <circle cx="470" cy="700" r="44" fill="${t.accent}" opacity=".22"/>
    <path d="M406 760h128" stroke="${t.ink}" stroke-width="1" opacity=".4"/>
  </g>
  <text x="52" y="800" font-family="'PingFang SC',sans-serif" font-size="14" letter-spacing="2" fill="${
    t.ink
  }" opacity=".5">${xml(book.category)} · ${xml(book.year)}</text>
  <text x="52" y="840" font-family="Georgia, serif" font-size="12" letter-spacing="2" fill="${
    t.ink
  }" opacity=".4">小生意，赚大钱 · 商业书单</text>
</svg>`;
}

function main() {
  fs.mkdirSync(COVERS, { recursive: true });
  fs.mkdirSync(BOOKS, { recursive: true });
  let count = 0;

  SECTIONS.forEach((section) => {
    const dir = path.join(CONTENT, section);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .forEach((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const { data } = parseFrontmatter(raw);
        const slug = file.replace(/\.md$/, '');
        const svg = coverSvg({
          title: data.title || slug,
          section,
          index: count,
          subtitle: data.coverSubtitle || data.subtitle || undefined,
        });
        fs.writeFileSync(path.join(COVERS, `${slug}.svg`), svg, 'utf8');
        count += 1;
      });
  });

  books.forEach((book, index) => {
    fs.writeFileSync(path.join(BOOKS, `${book.slug}.svg`), bookSvg(book, index), 'utf8');
  });

  console.log(`已生成 ${count} 张文章封面、${books.length} 张书籍封面（原创 SVG）。`);
}

main();