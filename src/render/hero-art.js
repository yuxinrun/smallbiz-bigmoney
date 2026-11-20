// 首页 Hero 原创 SVG 插画：小店 + 经营数据 + 现金流循环。
// 纯手绘路径，无外部素材，颜色全部取自设计变量，自动适配深色模式。

export function heroArt() {
  return `<svg viewBox="0 0 720 620" role="img" aria-labelledby="hero-art-title hero-art-desc">
  <title id="hero-art-title">小生意经营场景插画</title>
  <desc id="hero-art-desc">一家街边小店、上升的经营柱状图、现金流循环与关键经营指标卡片，组合成研究小生意赚钱逻辑的视觉意象。</desc>
  <defs>
    <linearGradient id="ha-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--surface)" />
      <stop offset="100%" stop-color="var(--paper-warm)" />
    </linearGradient>
    <linearGradient id="ha-bar" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="var(--navy)" stop-opacity="0.82" />
      <stop offset="100%" stop-color="var(--navy)" stop-opacity="1" />
    </linearGradient>
    <pattern id="ha-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="var(--line)" stroke-width="0.6" opacity="0.55" />
    </pattern>
  </defs>

  <rect x="12" y="12" width="696" height="596" rx="16" fill="url(#ha-bg)" stroke="var(--line)" />
  <rect x="12" y="12" width="696" height="596" rx="16" fill="url(#ha-grid)" opacity="0.65" />

  <!-- 店铺立面 -->
  <g>
    <rect x="62" y="262" width="258" height="252" rx="3" fill="var(--surface)" stroke="var(--navy)" stroke-width="1.6" />
    <path d="M62 300h258" stroke="var(--navy)" stroke-width="1.4" />
    <!-- 遮阳棚 -->
    <path d="M56 262l16-34h244l16 34z" fill="var(--paper-warm)" stroke="var(--navy)" stroke-width="1.4" />
    <g stroke="var(--accent)" stroke-width="9" opacity="0.88">
      <path d="M92 230l-11 31" />
      <path d="M124 230l-11 31" />
      <path d="M156 230l-11 31" />
      <path d="M188 230l-11 31" />
      <path d="M220 230l-11 31" />
      <path d="M252 230l-11 31" />
      <path d="M284 230l-11 31" />
    </g>
    <!-- 招牌 -->
    <rect x="86" y="272" width="86" height="20" rx="2" fill="var(--navy)" />
    <text x="129" y="286" text-anchor="middle" font-family="Georgia, serif" font-size="9" letter-spacing="2.6" fill="var(--paper)">OPEN</text>
    <!-- 橱窗 -->
    <rect x="84" y="332" width="118" height="92" rx="2" fill="var(--paper-deep)" stroke="var(--navy)" stroke-width="1.3" />
    <path d="M84 372h118M84 398h118" stroke="var(--line-strong)" stroke-width="1" />
    <rect x="98" y="382" width="22" height="14" fill="var(--gold)" opacity="0.55" />
    <rect x="130" y="378" width="16" height="18" fill="var(--accent)" opacity="0.45" />
    <rect x="158" y="386" width="26" height="10" fill="var(--navy)" opacity="0.35" />
    <!-- 门 -->
    <rect x="222" y="332" width="70" height="154" rx="2" fill="var(--paper-warm)" stroke="var(--navy)" stroke-width="1.3" />
    <rect x="236" y="346" width="42" height="60" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="1" />
    <circle cx="278" cy="452" r="3" fill="var(--accent)" />
    <path d="M62 514h258" stroke="var(--navy)" stroke-width="1.6" />
    <path d="M48 524h286" stroke="var(--line-strong)" stroke-width="1.2" />
    <!-- 门口脚垫 -->
    <rect x="214" y="506" width="86" height="8" rx="1" fill="var(--accent)" opacity="0.28" />
  </g>

  <!-- 金币堆 -->
  <g>
    <ellipse cx="330" cy="504" rx="34" ry="9" fill="var(--gold)" opacity="0.32" />
    <ellipse cx="330" cy="494" rx="34" ry="9" fill="var(--gold)" opacity="0.55" />
    <ellipse cx="330" cy="484" rx="34" ry="9" fill="var(--gold)" opacity="0.8" />
    <path d="M316 484c0-5 6-9 14-9s14 4 14 9" fill="none" stroke="var(--surface)" stroke-width="1.2" />
    <text x="330" y="488" text-anchor="middle" font-size="11" font-family="Georgia, serif" fill="var(--surface)">¥</text>
  </g>

  <!-- 经营柱状图 -->
  <g>
    <path d="M382 518h290" stroke="var(--navy)" stroke-width="1.3" opacity="0.55" />
    <g stroke="var(--line-strong)" stroke-dasharray="3 5" stroke-width="0.9" opacity="0.8">
      <path d="M382 470h290" />
      <path d="M382 420h290" />
      <path d="M382 370h290" />
    </g>
    <g>
      <rect x="400" y="452" width="30" height="66" rx="1.5" fill="url(#ha-bar)" opacity="0.42" />
      <rect x="448" y="430" width="30" height="88" rx="1.5" fill="url(#ha-bar)" opacity="0.56" />
      <rect x="496" y="404" width="30" height="114" rx="1.5" fill="url(#ha-bar)" opacity="0.72" />
      <rect x="544" y="376" width="30" height="142" rx="1.5" fill="url(#ha-bar)" opacity="0.86" />
      <rect x="592" y="342" width="30" height="176" rx="1.5" fill="var(--accent)" />
    </g>
    <path d="M415 444l48-20 48-24 48-27 48-32" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" />
    <g fill="var(--surface)" stroke="var(--green)" stroke-width="2">
      <circle cx="415" cy="444" r="3.2" />
      <circle cx="463" cy="424" r="3.2" />
      <circle cx="511" cy="400" r="3.2" />
      <circle cx="559" cy="373" r="3.2" />
      <circle cx="607" cy="341" r="3.6" />
    </g>
    <text x="607" y="328" text-anchor="middle" font-size="10" font-family="Georgia, serif" fill="var(--green)">+38%</text>
    <text x="382" y="540" font-size="9.5" letter-spacing="1.2" fill="var(--muted)">MONTH 01</text>
    <text x="640" y="540" text-anchor="end" font-size="9.5" letter-spacing="1.2" fill="var(--muted)">MONTH 12</text>
  </g>

  <!-- 现金流循环 -->
  <g transform="translate(560 150)">
    <circle cx="0" cy="0" r="52" fill="none" stroke="var(--line)" stroke-width="1.2" stroke-dasharray="3 4" />
    <path d="M-38 -35A52 52 0 0 1 36 -38" fill="none" stroke="var(--navy)" stroke-width="2.2" stroke-linecap="round" />
    <path d="M26 48A52 52 0 0 1 -22 47" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" />
    <path d="M36 -38l-10 -1.5 4 9.5z" fill="var(--navy)" />
    <path d="M-22 47l10 1.5-4-9.5z" fill="var(--accent)" />
    <text x="0" y="-4" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="var(--ink)">¥</text>
    <text x="0" y="14" text-anchor="middle" font-size="8" letter-spacing="1" fill="var(--muted)">CASH FLOW</text>
  </g>

  <!-- 浮动指标卡：复购率 -->
  <g>
    <rect x="368" y="82" width="158" height="62" rx="5" fill="var(--surface)" stroke="var(--line)" />
    <rect x="368" y="82" width="3" height="62" rx="1.5" fill="var(--accent)" />
    <text x="384" y="103" font-size="8.5" letter-spacing="1.2" fill="var(--muted)">REPEAT RATE</text>
    <text x="384" y="128" font-family="Georgia, serif" font-size="21" fill="var(--ink)">38.4%</text>
    <path d="M474 122l10-8 8 5 12-12" fill="none" stroke="var(--green)" stroke-width="1.6" />
    <path d="M504 107h8v8" fill="none" stroke="var(--green)" stroke-width="1.6" />
  </g>

  <!-- 浮动指标卡：客单价 -->
  <g>
    <rect x="76" y="84" width="150" height="58" rx="5" fill="var(--surface)" stroke="var(--line)" />
    <text x="92" y="105" font-size="8.5" letter-spacing="1.2" fill="var(--muted)">AVG. ORDER</text>
    <text x="92" y="128" font-family="Georgia, serif" font-size="20" fill="var(--ink)">¥68.00</text>
    <circle cx="204" cy="116" r="9" fill="var(--accent-soft)" />
    <path d="M199 116l3.5 3.5 6-7" fill="none" stroke="var(--accent)" stroke-width="1.4" />
  </g>

  <!-- 浮动指标卡：现金周转 -->
  <g>
    <rect x="86" y="170" width="132" height="58" rx="5" fill="var(--surface)" stroke="var(--line)" />
    <text x="100" y="191" font-size="8.5" letter-spacing="1.2" fill="var(--muted)">CASH CYCLE</text>
    <text x="100" y="214" font-family="Georgia, serif" font-size="19" fill="var(--ink)">45 <tspan font-family="var(--font-sans)" font-size="9" fill="var(--muted)">天</tspan></text>
    <path d="M176 205a12 12 0 1 1-3 -8" fill="none" stroke="var(--navy)" stroke-width="1.5" />
    <path d="M173 193l1 6-6-1z" fill="var(--navy)" />
  </g>

  <!-- 需求到利润的流动虚线 -->
  <path d="M250 252c40-18 60-22 96-16" fill="none" stroke="var(--line-strong)" stroke-width="1.2" stroke-dasharray="4 5" />
  <circle cx="250" cy="252" r="2.6" fill="var(--accent)" />
  <circle cx="346" cy="236" r="2.6" fill="var(--accent)" />
</svg>`;
}