// 数据驱动的原创 SVG 商业图表。无第三方依赖，构建期生成静态标记。
// 所有图表均带标题、图例与口径说明，viewBox 响应式适配移动端。

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const fmt = (v) => {
  const n = Math.round(num(v));
  return n.toLocaleString('zh-CN');
};
const pct = (v, digits = 0) => `${num(v).toFixed(digits)}%`;

function wrapText(text, maxChars = 10) {
  const chars = [...String(text)];
  const lines = [];
  for (let i = 0; i < chars.length; i += maxChars) lines.push(chars.slice(i, i + maxChars).join(''));
  return lines;
}

function frame({ title, unit = '', note = '', legend = [], width = 720, height = 380, body, label }) {
  const legendHtml = legend.length
    ? `<div class="chart-legend">${legend
        .map(
          (l) =>
            `<span class="chart-legend-item"><i style="background:${l.color}" aria-hidden="true"></i>${esc(l.label)}</span>`,
        )
        .join('')}</div>`
    : '';
  return `<div class="chart">
  <div class="chart-head"><h4>${esc(title)}</h4>${unit ? `<span class="chart-unit">单位：${esc(unit)}</span>` : ''}</div>
  <div class="chart-canvas"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label || title)}" preserveAspectRatio="xMidYMid meet">${body}</svg></div>
  ${legendHtml}
  ${note ? `<p class="chart-note">${esc(note)}</p>` : ''}
</div>`;
}

const C = {
  navy: 'var(--chart-navy, #1c3350)',
  blue: 'var(--chart-blue, #3f6a94)',
  orange: 'var(--chart-orange, #c2602c)',
  gold: 'var(--chart-gold, #b78a3c)',
  green: 'var(--chart-green, #2f6b4f)',
  line: 'var(--chart-line, #ddd6c9)',
  ink: 'var(--chart-ink, #2a2f38)',
  muted: 'var(--chart-muted, #7a7568)',
};

/* 1. 利润瀑布图 */
function profitWaterfall({ title = '利润瀑布图', unit = '元', note = '', data = {} }) {
  const revenue = num(data.revenue, 42000);
  const variable = num(data.variable, 14000);
  const fixed = num(data.fixed, 16000);
  const tax = num(data.tax, Math.max(0, (revenue - variable - fixed) * 0.05));
  const gross = revenue - variable;
  const operating = gross - fixed;
  const net = operating - tax;
  const steps = [
    { label: '营业收入', value: revenue, from: 0, to: revenue, type: 'total' },
    { label: '变动成本', value: variable, from: revenue, to: gross, type: 'cost' },
    { label: '毛利', value: gross, from: 0, to: gross, type: 'subtotal' },
    { label: '固定成本', value: fixed, from: gross, to: operating, type: 'cost' },
    { label: '经营利润', value: operating, from: 0, to: operating, type: 'subtotal' },
    { label: '税费', value: tax, from: operating, to: net, type: 'cost' },
    { label: '净利润', value: net, from: 0, to: net, type: 'net' },
  ];
  const W = 720, H = 360;
  const pad = { l: 54, r: 18, t: 26, b: 62 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const max = Math.max(...steps.map((s) => Math.max(s.from, s.to)), 1);
  const y = (v) => pad.t + plotH - (v / max) * plotH;
  const bw = Math.min(72, (plotW / steps.length) * 0.58);
  const colors = { total: C.navy, subtotal: C.blue, cost: C.orange, net: C.green };
  let svg = '';
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    const gy = y(max * t);
    svg += `<line x1="${pad.l}" y1="${gy}" x2="${W - pad.r}" y2="${gy}" stroke="${C.line}" stroke-width="1" ${t ? 'stroke-dasharray="2 4"' : ''}/>`;
    svg += `<text x="${pad.l - 8}" y="${gy + 4}" text-anchor="end" class="chart-tick">${fmt(max * t)}</text>`;
  });
  steps.forEach((s, i) => {
    const cx = pad.l + (plotW / steps.length) * (i + 0.5);
    const top = y(Math.max(s.from, s.to));
    const h = Math.max(2, Math.abs(y(s.from) - y(s.to)));
    svg += `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${h}" rx="2" fill="${colors[s.type]}"/>`;
    svg += `<text x="${cx}" y="${top - 7}" text-anchor="middle" class="chart-value">${fmt(s.value)}</text>`;
    const lines = wrapText(s.label, 5);
    lines.forEach((l, li) => {
      svg += `<text x="${cx}" y="${H - pad.b + 20 + li * 15}" text-anchor="middle" class="chart-label">${esc(l)}</text>`;
    });
    if (i < steps.length - 1 && s.type !== 'cost') {
      const next = steps[i + 1];
      const nx = pad.l + (plotW / steps.length) * (i + 1.5) - bw / 2;
      svg += `<line x1="${cx + bw / 2}" y1="${y(s.to)}" x2="${nx}" y2="${y(s.to)}" stroke="${C.muted}" stroke-width="1" stroke-dasharray="3 3"/>`;
    }
  });
  return frame({
    title,
    unit,
    note: note || '口径：收入扣除变动成本得到毛利，再扣除固定成本与税费得到净利润；不含经营者薪酬与折旧。',
    legend: [
      { label: '收入 / 毛利 / 利润', color: C.navy },
      { label: '成本 / 税费', color: C.orange },
      { label: '净利润', color: C.green },
    ],
    width: W,
    height: H,
    body: svg,
  });
}

/* 2. 收入与成本结构图 */
function costStructure({ title = '收入与成本结构', unit = '元/月', note = '', data = {} }) {
  const items = Array.isArray(data.items)
    ? data.items
    : [
        { label: '原材料', value: 14000 },
        { label: '房租', value: 7000 },
        { label: '人力', value: 9000 },
        { label: '获客', value: 3000 },
        { label: '其他', value: 2000 },
        { label: '净利', value: 7000, profit: true },
      ];
  const total = items.reduce((s, it) => s + num(it.value), 0) || 1;
  const W = 720, H = 260;
  const x0 = 20, barW = W - 40, barY = 76, barH = 46;
  const palette = [C.navy, C.blue, C.orange, C.gold, C.muted, C.green];
  let svg = '';
  let cursor = x0;
  items.forEach((it, i) => {
    const w = (num(it.value) / total) * barW;
    const color = it.profit ? C.green : palette[i % palette.length];
    svg += `<rect x="${cursor}" y="${barY}" width="${Math.max(w - 2, 1)}" height="${barH}" rx="2" fill="${color}"/>`;
    if (w > 46) {
      svg += `<text x="${cursor + w / 2}" y="${barY + barH / 2 + 4}" text-anchor="middle" class="chart-invert">${pct(
        (num(it.value) / total) * 100,
      )}</text>`;
    }
    cursor += w;
  });
  svg += `<text x="${x0}" y="50" class="chart-label">月度收入构成（100%）</text>`;
  svg += `<text x="${x0}" y="${barY + barH + 26}" class="chart-label">合计 ${fmt(total)} ${unit}</text>`;
  items.forEach((it, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = x0 + col * 232;
    const cy = barY + barH + 66 + row * 34;
    svg += `<rect x="${cx}" y="${cy - 9}" width="9" height="9" rx="2" fill="${it.profit ? C.green : palette[i % palette.length]}"/>`;
    svg += `<text x="${cx + 16}" y="${cy}" class="chart-label">${esc(it.label)}</text>`;
    svg += `<text x="${cx + 150}" y="${cy}" text-anchor="end" class="chart-value">${fmt(it.value)}</text>`;
  });
  return frame({
    title,
    unit,
    note: note || '口径：按月度营业额 100% 拆解，各项占比为该月发生额占营业收入的比例。',
    width: W,
    height: H,
    body: svg,
  });
}

/* 3. 现金流循环图 */
function cashCycle({ title = '现金周转循环', note = '', data = {} }) {
  const nodes = Array.isArray(data.nodes)
    ? data.nodes
    : [
        { label: '支付采购', note: '现金流出', value: 7 },
        { label: '备货 / 生产', note: '库存占用', value: 10 },
        { label: '销售交付', note: '确认收入', value: 3 },
        { label: '应收账款', note: '账期等待', value: 21 },
        { label: '现金回款', note: '现金流入', value: 2 },
      ];
  const totalDays = num(data.totalDays, nodes.reduce((s, n) => s + num(n.value), 0));
  const W = 720, H = 400;
  const cx = W / 2, cy = H / 2 + 6, r = 118;
  const angleStep = (Math.PI * 2) / nodes.length;
  let svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.line}" stroke-width="22"/>`;
  nodes.forEach((n, i) => {
    const a0 = -Math.PI / 2 + i * angleStep + 0.08;
    const a1 = a0 + angleStep - 0.16;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const color = i % 2 === 0 ? C.navy : C.blue;
    svg += `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="butt"/>`;
    const mid = (a0 + a1) / 2;
    const lx = cx + (r + 44) * Math.cos(mid), ly = cy + (r + 44) * Math.sin(mid);
    const anchor = Math.abs(Math.cos(mid)) < 0.3 ? 'middle' : Math.cos(mid) > 0 ? 'start' : 'end';
    svg += `<text x="${lx}" y="${ly - 4}" text-anchor="${anchor}" class="chart-label strong">${esc(n.label)}</text>`;
    svg += `<text x="${lx}" y="${ly + 13}" text-anchor="${anchor}" class="chart-tick">${esc(n.note || '')}${
      n.value ? ` · ${num(n.value)} 天` : ''
    }</text>`;
  });
  svg += `<text x="${cx}" y="${cy - 8}" text-anchor="middle" class="chart-center">${fmt(totalDays)} 天</text>`;
  svg += `<text x="${cx}" y="${cy + 16}" text-anchor="middle" class="chart-tick">现金周转周期</text>`;
  svg += `<text x="${cx}" y="${cy + 36}" text-anchor="middle" class="chart-tick">${esc(data.caption || '现金 → 库存 → 收入 → 回款')}</text>`;
  return frame({
    title,
    note: note || '口径：周转天数 = 从支付采购到现金回款的间隔。天数越长，需要的周转资金越多。',
    width: W,
    height: H,
    body: svg,
    legend: [
      { label: '现金流出环节', color: C.navy },
      { label: '收入与回款环节', color: C.blue },
    ],
  });
}

/* 4. 盈亏平衡图 */
function breakEven({ title = '盈亏平衡点', unit = '元', note = '', data = {} }) {
  const fixed = num(data.fixedCost, 18000);
  const price = num(data.price, 60);
  const varc = num(data.variableCost, 25);
  const capacity = num(data.capacity, Math.ceil((fixed / Math.max(price - varc, 1)) * 2.2));
  const qStar = fixed / Math.max(price - varc, 1);
  const W = 720, H = 360;
  const pad = { l: 60, r: 24, t: 28, b: 54 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxY = Math.max(price * capacity, fixed + varc * capacity);
  const x = (q) => pad.l + (q / capacity) * plotW;
  const y = (v) => pad.t + plotH - (v / maxY) * plotH;
  let svg = '';
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    svg += `<line x1="${pad.l}" y1="${y(maxY * t)}" x2="${W - pad.r}" y2="${y(maxY * t)}" stroke="${C.line}" stroke-dasharray="2 4"/>`;
    svg += `<text x="${pad.l - 8}" y="${y(maxY * t) + 4}" text-anchor="end" class="chart-tick">${fmt(maxY * t)}</text>`;
  });
  const qx = x(Math.min(qStar, capacity));
  svg += `<rect x="${pad.l}" y="${pad.t}" width="${qx - pad.l}" height="${plotH}" fill="var(--chart-loss, #f6e7dc)" opacity=".55"/>`;
  svg += `<rect x="${qx}" y="${pad.t}" width="${W - pad.r - qx}" height="${plotH}" fill="var(--chart-profit, #e4efe8)" opacity=".6"/>`;
  svg += `<line x1="${pad.l}" y1="${y(0)}" x2="${x(capacity)}" y2="${y(price * capacity)}" stroke="${C.navy}" stroke-width="2.5"/>`;
  svg += `<line x1="${pad.l}" y1="${y(fixed)}" x2="${x(capacity)}" y2="${y(fixed + varc * capacity)}" stroke="${C.orange}" stroke-width="2.5"/>`;
  svg += `<line x1="${pad.l}" y1="${y(fixed)}" x2="${x(capacity)}" y2="${y(fixed)}" stroke="${C.gold}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  svg += `<circle cx="${qx}" cy="${y(fixed + varc * qStar)}" r="5" fill="${C.green}"/>`;
  svg += `<line x1="${qx}" y1="${y(fixed + varc * qStar)}" x2="${qx}" y2="${y(0)}" stroke="${C.green}" stroke-dasharray="3 3"/>`;
  svg += `<text x="${qx + 8}" y="${y(fixed + varc * qStar) - 10}" class="chart-label strong">平衡点约 ${fmt(
    qStar,
  )} 单</text>`;
  svg += `<text x="${W - pad.r}" y="${y(price * capacity) + 18}" text-anchor="end" class="chart-label">收入线</text>`;
  svg += `<text x="${W - pad.r}" y="${y(fixed + varc * capacity) + 18}" text-anchor="end" class="chart-label">总成本线</text>`;
  svg += `<text x="${pad.l}" y="${pad.t + 16}" class="chart-tick">亏损区</text>`;
  svg += `<text x="${W - pad.r}" y="${pad.t + 16}" text-anchor="end" class="chart-tick">盈利区</text>`;
  svg += `<text x="${W / 2}" y="${H - 16}" text-anchor="middle" class="chart-label">月销量（单）</text>`;
  svg += `<text x="${pad.l}" y="${H - 16}" class="chart-tick">0</text>`;
  svg += `<text x="${W - pad.r}" y="${H - 16}" text-anchor="end" class="chart-tick">${fmt(capacity)}</text>`;
  return frame({
    title,
    unit,
    note:
      note ||
      '口径：盈亏平衡销量 = 固定成本 ÷（单价 − 单位变动成本）。未考虑税费、折旧与经营者薪酬，实际平衡点应更高。',
    legend: [
      { label: '销售收入', color: C.navy },
      { label: '总成本', color: C.orange },
      { label: '固定成本', color: C.gold },
      { label: '平衡点', color: C.green },
    ],
    width: W,
    height: H,
    body: svg,
  });
}

/* 5. 商业模式画布 */
function businessCanvas({ title = '商业模式画布', note = '', data = {} }) {
  const cells = [
    { key: 'keyPartners', label: '重要合作', x: 12, y: 16, w: 132, h: 268 },
    { key: 'keyActivities', label: '关键业务', x: 152, y: 16, w: 132, h: 130 },
    { key: 'keyResources', label: '核心资源', x: 152, y: 154, w: 132, h: 130 },
    { key: 'valueProps', label: '价值主张', x: 292, y: 16, w: 136, h: 268 },
    { key: 'customerRelations', label: '客户关系', x: 436, y: 16, w: 132, h: 130 },
    { key: 'channels', label: '渠道', x: 436, y: 154, w: 132, h: 130 },
    { key: 'customerSegments', label: '客户细分', x: 576, y: 16, w: 132, h: 268 },
    { key: 'costStructure', label: '成本结构', x: 12, y: 292, w: 348, h: 116 },
    { key: 'revenueStreams', label: '收入来源', x: 368, y: 292, w: 340, h: 116 },
  ];
  let svg = '';
  cells.forEach((c, i) => {
    const items = Array.isArray(data[c.key]) ? data[c.key] : [];
    svg += `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="4" fill="${
      c.key === 'valueProps' ? 'var(--chart-canvas-accent, #f3ece1)' : 'var(--chart-canvas, #fbf8f2)'
    }" stroke="${C.line}"/>`;
    svg += `<text x="${c.x + 10}" y="${c.y + 20}" class="chart-label strong">${i + 1}. ${c.label}</text>`;
    let ly = c.y + 40;
    items.slice(0, 7).forEach((item) => {
      wrapText(item, c.w > 200 ? 22 : 9).forEach((line) => {
        if (ly < c.y + c.h - 6) {
          svg += `<text x="${c.x + 10}" y="${ly}" class="chart-tick">${esc(line)}</text>`;
          ly += 14;
        }
      });
    });
  });
  return frame({
    title,
    note: note || '用法：把案例中的事实填入九宫格，空白格代表尚未验证的假设，应优先用最小成本测试。',
    width: 720,
    height: 424,
    body: svg,
  });
}

/* 6. 客户转化漏斗 */
function funnel({ title = '客户转化漏斗', note = '', data = {} }) {
  const steps = Array.isArray(data.steps) && data.steps.length
    ? data.steps
    : [
        { label: '曝光', value: 100000 },
        { label: '访问 / 到店', value: 12000 },
        { label: '咨询', value: 2400 },
        { label: '下单', value: 720 },
        { label: '复购', value: 260 },
      ];
  const W = 720, H = 360;
  const top = 30, layerH = 46, gap = 10;
  const maxW = 560;
  let svg = '';
  steps.forEach((s, i) => {
    const w = Math.max((num(s.value) / num(steps[0].value, 1)) * maxW, 60);
    const y = top + i * (layerH + gap);
    const x = (W - w) / 2;
    const color = i === 0 ? C.navy : i === steps.length - 1 ? C.green : C.blue;
    svg += `<path d="M ${x} ${y} h ${w} l ${-(w - Math.max(w * 0.82, 60)) / 2} ${layerH} h ${-Math.max(
      w * 0.82,
      60,
    )} Z" fill="${color}" opacity="${1 - i * 0.08}"/>`;
    svg += `<text x="${W / 2}" y="${y + 28}" text-anchor="middle" class="chart-invert strong">${esc(s.label)}</text>`;
    svg += `<text x="${W - 24}" y="${y + 28}" text-anchor="end" class="chart-value">${fmt(s.value)}</text>`;
    if (i > 0) {
      const rate = (num(s.value) / num(steps[i - 1].value, 1)) * 100;
      svg += `<text x="${W - 24}" y="${y + 44}" text-anchor="end" class="chart-tick">环节转化 ${pct(
        rate,
        1,
      )}</text>`;
    }
  });
  const overall = (num(steps[steps.length - 1].value) / num(steps[0].value, 1)) * 100;
  svg += `<text x="24" y="${H - 16}" class="chart-tick">整体转化率 ${pct(overall, 2)}</text>`;
  return frame({
    title,
    note: note || '口径：各环节为同一统计周期内的去重人数。漏斗越往下越窄，优先改善流失最大的那一层。',
    width: W,
    height: H,
    body: svg,
  });
}

/* 7. 客户复购循环 */
function retentionLoop({ title = '客户复购循环', note = '', data = {} }) {
  const steps = Array.isArray(data.steps) && data.steps.length
    ? data.steps
    : [
        { label: '首次购买', note: '建立信任' },
        { label: '交付体验', note: '超出预期' },
        { label: '主动触达', note: '提醒复购' },
        { label: '再次购买', note: '形成习惯' },
        { label: '转介绍', note: '带来新客' },
      ];
  const W = 720, H = 380;
  const cx = W / 2, cy = H / 2 + 4, r = 112;
  const step = (Math.PI * 2) / steps.length;
  let svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="4 5"/>`;
  steps.forEach((s, i) => {
    const a = -Math.PI / 2 + i * step;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    svg += `<circle cx="${x}" cy="${y}" r="44" fill="var(--chart-node, #fbf8f2)" stroke="${i === 0 ? C.orange : C.navy}" stroke-width="1.5"/>`;
    wrapText(s.label, 5).forEach((line, li) => {
      svg += `<text x="${x}" y="${y - 2 + li * 14}" text-anchor="middle" class="chart-label strong">${esc(line)}</text>`;
    });
    if (s.note) svg += `<text x="${x}" y="${y + 30}" text-anchor="middle" class="chart-tick">${esc(s.note)}</text>`;
    const na = a + step / 2;
    const ax = cx + r * Math.cos(na), ay = cy + r * Math.sin(na);
    svg += `<circle cx="${ax}" cy="${ay}" r="3" fill="${C.gold}"/>`;
  });
  svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="chart-center">${esc(
    data.rate || '复购',
  )}</text>`;
  svg += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" class="chart-tick">${esc(
    data.caption || '循环次数决定利润',
  )}</text>`;
  return frame({
    title,
    note:
      note ||
      '口径：复购率 = 统计周期内购买 2 次及以上的客户数 ÷ 总客户数。小生意应优先提高复购，而非无限拉新。',
    width: W,
    height: H,
    body: svg,
  });
}

/* 8. 供应链流程图 */
function supplyChain({ title = '供应链流程', note = '', data = {} }) {
  const steps = Array.isArray(data.steps) && data.steps.length
    ? data.steps
    : [
        { label: '供应商', note: '账期 / 起订量' },
        { label: '仓储', note: '库存周转' },
        { label: '加工 / 分拣', note: '损耗率' },
        { label: '门店 / 前置仓', note: '补货频率' },
        { label: '交付客户', note: '履约成本' },
      ];
  const W = 720, H = 300;
  const gap = 14;
  const boxW = (W - 48 - gap * (steps.length - 1)) / steps.length;
  let svg = '';
  steps.forEach((s, i) => {
    const x = 24 + i * (boxW + gap);
    const y = 70;
    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="108" rx="6" fill="var(--chart-node, #fbf8f2)" stroke="${
      i === 0 ? C.orange : C.line
    }"/>`;
    svg += `<text x="${x + 12}" y="${y + 24}" class="chart-tick">STEP ${String(i + 1).padStart(2, '0')}</text>`;
    wrapText(s.label, boxW > 120 ? 8 : 6).forEach((line, li) => {
      svg += `<text x="${x + 12}" y="${y + 50 + li * 18}" class="chart-label strong">${esc(line)}</text>`;
    });
    wrapText(s.note || '', boxW > 120 ? 10 : 8).forEach((line, li) => {
      svg += `<text x="${x + 12}" y="${y + 88 + li * 14}" class="chart-tick">${esc(line)}</text>`;
    });
    if (i < steps.length - 1) {
      const ax = x + boxW + 3, ay = y + 54;
      svg += `<path d="M ${ax} ${ay} h ${gap - 6} m -4 -4 l 4 4 l -4 4" fill="none" stroke="${C.muted}" stroke-width="1.5"/>`;
    }
  });
  svg += `<text x="24" y="40" class="chart-label">货物与信息的流动方向</text>`;
  svg += `<text x="24" y="236" class="chart-tick">${esc(
    data.caption || '每增加一个环节，都会增加成本、时间与信息失真。',
  )}</text>`;
  return frame({
    title,
    note: note || '口径：流程图为经营结构抽象，实际环节可能合并或外包。',
    width: W,
    height: H,
    body: svg,
  });
}

/* 9. 商业价值链图 */
function valueChain({ title = '商业价值链', note = '', data = {} }) {
  const steps = Array.isArray(data.steps) && data.steps.length
    ? data.steps
    : [
        { label: '研发 / 选品', margin: 8 },
        { label: '采购', margin: 6 },
        { label: '生产 / 加工', margin: 12 },
        { label: '品牌', margin: 18 },
        { label: '渠道', margin: 22, active: true },
        { label: '零售 / 服务', margin: 28 },
      ];
  const W = 720, H = 320;
  const pad = { l: 44, r: 24, t: 40, b: 58 };
  const plotH = 150;
  const stepW = (W - pad.l - pad.r) / steps.length;
  const maxM = Math.max(...steps.map((s) => num(s.margin)), 20);
  let svg = '';
  steps.forEach((s, i) => {
    const x = pad.l + i * stepW;
    const h = (num(s.margin) / maxM) * plotH;
    const y = pad.t + plotH - h;
    const color = s.active ? C.orange : C.blue;
    svg += `<rect x="${x + stepW * 0.16}" y="${y}" width="${stepW * 0.68}" height="${h}" rx="3" fill="${color}" opacity="${
      s.active ? 1 : 0.72
    }"/>`;
    svg += `<text x="${x + stepW / 2}" y="${y - 8}" text-anchor="middle" class="chart-value">${pct(s.margin)}</text>`;
    wrapText(s.label, 5).forEach((line, li) => {
      svg += `<text x="${x + stepW / 2}" y="${pad.t + plotH + 22 + li * 15}" text-anchor="middle" class="chart-label">${esc(
        line,
      )}</text>`;
    });
    if (s.active) {
      svg += `<text x="${x + stepW / 2}" y="${H - 14}" text-anchor="middle" class="chart-tick">↑ 本案例所处环节</text>`;
    }
    if (i < steps.length - 1) {
      svg += `<path d="M ${x + stepW - 4} ${pad.t + 20} h 8" stroke="${C.muted}"/>`;
    }
  });
  svg += `<text x="${pad.l}" y="24" class="chart-label">各环节典型毛利率（%）</text>`;
  return frame({
    title,
    note: note || '口径：毛利率为各环节的行业常见区间中位数示意，用于判断价值分布，不代表具体企业数据。',
    width: W,
    height: H,
    body: svg,
  });
}

/* 10. 30 天行动路线图 */
function roadmap30({ title = '30 天行动路线图', note = '', data = {} }) {
  const weeks = Array.isArray(data.weeks) && data.weeks.length
    ? data.weeks
    : [
        { label: '第 1 周', theme: '验证需求', tasks: ['访谈 10 位目标客户', '记录愿意付费的理由', '列出替代方案'] },
        { label: '第 2 周', theme: '最小供给', tasks: ['做出可交付样品', '确定报价', '跑通一次交付'] },
        { label: '第 3 周', theme: '获取客户', tasks: ['上线 1 个渠道', '完成 10 次触达', '记录获客成本'] },
        { label: '第 4 周', theme: '复盘算账', tasks: ['核算单客毛利', '计算回本周期', '决定加注或停止'] },
      ];
  const W = 720, H = 360;
  const colW = (W - 48) / weeks.length;
  let svg = '';
  weeks.forEach((w, i) => {
    const x = 24 + i * colW;
    svg += `<line x1="${x}" y1="54" x2="${x}" y2="${H - 34}" stroke="${C.line}" stroke-dasharray="3 4"/>`;
    svg += `<circle cx="${x}" cy="54" r="9" fill="${i === 0 ? C.orange : C.navy}"/>`;
    svg += `<text x="${x + 18}" y="50" class="chart-label strong">${esc(w.label)}</text>`;
    svg += `<text x="${x + 18}" y="68" class="chart-tick">${esc(w.theme || '')}</text>`;
    (Array.isArray(w.tasks) ? w.tasks : []).slice(0, 4).forEach((task, ti) => {
      const ty = 104 + ti * 56;
      svg += `<rect x="${x}" y="${ty}" width="${colW - 22}" height="44" rx="4" fill="var(--chart-node, #fbf8f2)" stroke="${C.line}"/>`;
      wrapText(task, 9).forEach((line, li) => {
        svg += `<text x="${x + 10}" y="${ty + 18 + li * 14}" class="chart-tick">${esc(line)}</text>`;
      });
    });
  });
  svg += `<text x="24" y="${H - 12}" class="chart-tick">${esc(
    data.caption || '目标：用最小成本获得真实付费信号，而不是完成一份完美的商业计划书。',
  )}</text>`;
  return frame({
    title,
    note: note || '用法：每周只设一个核心验证目标，未通过则先修正，不要进入下一阶段。',
    width: W,
    height: H,
    body: svg,
  });
}

/* 11. 单客经济模型 */
function unitEconomics({ title = '单客经济模型', unit = '元', note = '', data = {} }) {
  const arpu = num(data.arpu, 120);
  const grossMargin = num(data.grossMargin, 55);
  const retention = num(data.retentionMonths, 8);
  const cac = num(data.cac, 60);
  const gross = arpu * (grossMargin / 100);
  const ltv = gross * retention;
  const ratio = ltv / Math.max(cac, 1);
  const W = 720, H = 300;
  const bars = [
    { label: '单客收入 ARPU', value: arpu, color: C.navy },
    { label: '单客毛利', value: gross, color: C.blue },
    { label: '获客成本 CAC', value: cac, color: C.orange },
    { label: '生命周期毛利 LTV', value: ltv, color: C.green },
  ];
  const max = Math.max(...bars.map((b) => b.value), 1);
  const pad = { l: 150, r: 90, t: 34 };
  const barH = 34, gap = 22;
  let svg = '';
  bars.forEach((b, i) => {
    const y = pad.t + i * (barH + gap);
    const w = (b.value / max) * (W - pad.l - pad.r);
    svg += `<text x="${pad.l - 12}" y="${y + 22}" text-anchor="end" class="chart-label">${esc(b.label)}</text>`;
    svg += `<rect x="${pad.l}" y="${y}" width="${Math.max(w, 3)}" height="${barH}" rx="3" fill="${b.color}"/>`;
    svg += `<text x="${pad.l + w + 10}" y="${y + 22}" class="chart-value">${fmt(b.value)}</text>`;
  });
  svg += `<line x1="${pad.l}" y1="${H - 52}" x2="${W - pad.r}" y2="${H - 52}" stroke="${C.line}"/>`;
  svg += `<text x="${pad.l}" y="${H - 26}" class="chart-label strong">LTV / CAC ≈ ${ratio.toFixed(
    1,
  )} 倍</text>`;
  svg += `<text x="${W - pad.r}" y="${H - 26}" text-anchor="end" class="chart-tick">${
    ratio >= 3 ? '模型健康（≥3 倍）' : '需要改善（<3 倍）'
  }</text>`;
  return frame({
    title,
    unit,
    note: note || `口径：LTV = 单客收入 × 毛利率 × 平均留存月数；CAC 为获取一个付费客户的全部营销费用。`,
    legend: [
      { label: '收入', color: C.navy },
      { label: '毛利', color: C.blue },
      { label: '获客成本', color: C.orange },
      { label: '生命周期毛利', color: C.green },
    ],
    width: W,
    height: H,
    body: svg,
  });
}

/* 12. 收入构成环形图 */
function revenueMix({ title = '收入构成', unit = '%', note = '', data = {} }) {
  const items = Array.isArray(data.items) && data.items.length
    ? data.items
    : [
        { label: '主产品', value: 62 },
        { label: '增值服务', value: 21 },
        { label: '耗材复购', value: 12 },
        { label: '其他', value: 5 },
      ];
  const total = items.reduce((s, it) => s + num(it.value), 0) || 1;
  const W = 720, H = 300;
  const cx = 190, cy = 150, r = 96, inner = 62;
  const palette = [C.navy, C.orange, C.blue, C.green, C.gold];
  let angle = -Math.PI / 2;
  let svg = '';
  items.forEach((it, i) => {
    const sweep = (num(it.value) / total) * Math.PI * 2;
    const a0 = angle, a1 = angle + sweep;
    const p = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    const [x0, y0] = p(r, a0), [x1, y1] = p(r, a1);
    const [x2, y2] = p(inner, a1), [x3, y3] = p(inner, a0);
    const large = sweep > Math.PI ? 1 : 0;
    svg += `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${inner} ${inner} 0 ${large} 0 ${x3} ${y3} Z" fill="${
      palette[i % palette.length]
    }"/>`;
    angle = a1;
  });
  svg += `<text x="${cx}" y="${cy + 2}" text-anchor="middle" class="chart-center">${items.length}</text>`;
  svg += `<text x="${cx}" y="${cy + 22}" text-anchor="middle" class="chart-tick">收入来源</text>`;
  items.forEach((it, i) => {
    const y = 74 + i * 30;
    svg += `<rect x="350" y="${y - 11}" width="10" height="10" rx="2" fill="${palette[i % palette.length]}"/>`;
    svg += `<text x="368" y="${y}" class="chart-label">${esc(it.label)}</text>`;
    svg += `<text x="${W - 40}" y="${y}" text-anchor="end" class="chart-value">${pct(
      (num(it.value) / total) * 100,
      0,
    )}</text>`;
  });
  svg += `<text x="350" y="${74 + items.length * 30 + 8}" class="chart-tick">${
    data.caption || '收入越集中，抗风险能力越弱。'
  }</text>`;
  return frame({
    title,
    unit,
    note: note || '口径：按最近 12 个月收入结构估算，用于判断业务对单一收入来源的依赖程度。',
    width: W,
    height: H,
    body: svg,
  });
}

const registry = {
  'profit-waterfall': profitWaterfall,
  'cost-structure': costStructure,
  'cash-cycle': cashCycle,
  'break-even': breakEven,
  'business-canvas': businessCanvas,
  funnel,
  'retention-loop': retentionLoop,
  'supply-chain': supplyChain,
  'value-chain': valueChain,
  'roadmap-30': roadmap30,
  'unit-economics': unitEconomics,
  'revenue-mix': revenueMix,
};

export const chartTypes = Object.keys(registry);

export function renderChart(type, config = {}) {
  const fn = registry[type];
  if (!fn) {
    return `<div class="chart chart-error"><p>未知图表类型：${esc(type)}</p></div>`;
  }
  return fn(config);
}