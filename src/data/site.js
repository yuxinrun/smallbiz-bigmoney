// 站点级配置：导航、栏目、筛选维度。
// 该文件只在构建期（Node）使用，浏览器端通过预渲染结果获得全部信息。

const env = typeof process !== 'undefined' ? process.env : {};

export const site = {
  name: '小生意，赚大钱',
  nameEn: 'Small Business Big Money',
  shortName: '小生意',
  tagline: '研究小生意的赚钱逻辑，找到普通人真正可以经营的生意。',
  description:
    '一个专注小生意、低成本创业、商业模式、利润结构与现金流的研究型知识库。不贩卖暴富幻想，只研究真实需求与长期经营。',
  url: (env.SITE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  base: env.BASE_PATH || '/',
  locale: 'zh-CN',
  github: env.SITE_REPO_URL || 'https://github.com/',
  email: 'hello@example.com',
  founded: '2026',
  publisher: '小生意，赚大钱 编辑部',
  disclaimer:
    '本站内容为商业研究与知识分享，不构成投资、财务或法律建议。文中测算均为示例模型，不构成收益承诺。任何生意都存在失败风险，请结合自身情况独立判断。',
};

export const nav = [
  { label: '首页', href: '/' },
  { label: '赚钱案例', href: '/cases/' },
  { label: '小成本创业', href: '/startup/' },
  { label: '商业模式', href: '/business-models/' },
  { label: '利润结构', href: '/profit/' },
  { label: '经营方法论', href: '/methods/' },
  { label: '商业书单', href: '/books/' },
  { label: '优质资源', href: '/resources/' },
];

export const moreNav = [
  { label: '现金流经营', href: '/cash-flow/' },
  { label: '行业机会', href: '/industries/' },
  { label: '失败案例', href: '/failures/' },
  { label: '全站搜索', href: '/search/' },
  { label: '关于我们', href: '/about/' },
];

// 所有内容栏目。books / resources 由结构化数据渲染，其余由 Markdown 文章渲染。
export const sections = {
  cases: {
    label: '赚钱案例',
    navLabel: '赚钱案例',
    en: 'Case Studies',
    kicker: 'Case Studies',
    title: '赚钱案例：拆开看，钱到底从哪里来',
    seoTitle: '赚钱案例 | 国内外小生意真实经营拆解',
    description:
      '拆解国内外可复制的小生意案例：客户需求、收费方式、成本结构、获客路径、回本周期与风险。所有数字标注口径，区分事实、估算与假设。',
    intro:
      '我们不写“月入十万”的故事，而是把一门生意拆成可验证的模块：谁付钱、为什么付、付多少次、成本花在哪、现金多久转一圈。每个案例都给出统一的测算表与 30 天行动清单。',
    note: '案例中的经营数据分为三类：公开事实、基于公开价格的合理测算、研究假设。每篇文末均标注数据口径，请勿将示例模型当作收益承诺。',
    facets: ['region', 'industry', 'startupCost', 'model'],
    ordered: true,
  },
  startup: {
    label: '小成本创业',
    navLabel: '小成本创业',
    en: 'Low-Cost Startup',
    kicker: 'Low-Cost Startup',
    title: '小成本创业：先算清最坏情况，再开始',
    seoTitle: '小成本创业 | 低启动资金的生意与启动路径',
    description:
      '按启动资金、经营难度与回本逻辑筛选小成本创业方向，研究最低启动条件、第一批客户来源与最坏情况下的损失上限。',
    intro:
      '小成本不是“零成本”，而是把可控损失压到最低。这里研究启动资金 10 万元以内、可以先验证再投入的生意形态，以及每一种形态的启动条件与失败成本。',
    note: '启动资金为“从零到正常营业”的一次性投入区间估算，不含经营者本人 6 个月的生活费。',
    facets: ['startupCost', 'difficulty', 'industry'],
  },
  'business-models': {
    label: '商业模式',
    navLabel: '商业模式',
    en: 'Business Models',
    kicker: 'Business Models',
    title: '商业模式：收入从哪里来，凭什么持续',
    seoTitle: '商业模式拆解 | 小生意的收入结构与盈利机制',
    description:
      '拆解订阅、服务、零售、平台、知识产品等商业模式：收入来源、价值链位置、毛利结构、复购机制与可复制性。',
    intro:
      '商业模式不是名词，而是一组因果：你为谁解决了什么问题，以什么方式交付，按什么计价，客户为什么会再次付钱。这里用统一模板拆开每一种模式。',
    note: '模式本身没有优劣，只有与资源、能力、市场阶段的匹配度。',
    facets: ['model', 'industry', 'startupCost'],
  },
  profit: {
    label: '利润结构',
    navLabel: '利润结构',
    en: 'Profit Structure',
    kicker: 'Profit Structure',
    title: '利润结构：毛利、净利与藏在细节里的成本',
    seoTitle: '利润结构 | 毛利率、净利率与盈亏平衡计算',
    description:
      '学习计算一门生意的真实利润：毛利与净利的区别、固定成本与变动成本、盈亏平衡点、回本周期，以及最容易漏算的隐性成本。',
    intro:
      '很多生意不是不赚钱，而是算错了账。把收入、成本、费用、税费和现金周转放在同一张表上，才能看清利润到底薄在哪里。',
    note: '本站测算统一采用“权责发生制 + 现金流视角”双口径，并在图表中注明。',
    facets: ['topic', 'industry'],
  },
  'cash-flow': {
    label: '现金流经营',
    navLabel: '现金流经营',
    en: 'Cash Flow',
    kicker: 'Cash Flow',
    title: '现金流经营：活下来的顺序，先于赚钱',
    seoTitle: '现金流经营 | 小生意为什么死于账面盈利',
    description:
      '研究小生意的现金流循环：账期、库存、预付卡、季节性波动与安全现金储备，理解为什么账面利润不等于活着。',
    intro:
      '利润是观点，现金是事实。小生意最常见的死法不是不赚钱，而是钱回不来。这里研究现金流循环、账期管理与现金安全垫。',
    note: '现金流测算为经营模拟，不构成融资或理财建议。',
    facets: ['topic', 'industry'],
  },
  methods: {
    label: '经营方法论',
    navLabel: '经营方法论',
    en: 'Methods',
    kicker: 'Methods',
    title: '经营方法论：能落地，才算方法',
    seoTitle: '经营方法论 | 小生意从 0 到 1 的实操指南',
    description:
      '从需求验证、定价、获客、复购到现金流管理的实操方法论，每一篇都给出可执行的步骤、检查清单与常见错误。',
    intro:
      '方法论的价值不在于听起来正确，而在于明天能执行。每篇指南都包含步骤、模板、判断标准与失败信号。',
    note: '方法需要结合具体行业调整，请把清单当作起点而不是标准答案。',
    facets: ['topic', 'difficulty'],
  },
  industries: {
    label: '行业机会',
    navLabel: '行业机会',
    en: 'Industries',
    kicker: 'Industries',
    title: '行业机会：结构变化里长出的生意',
    seoTitle: '行业机会 | 小生意值得进入的细分市场',
    description:
      '从人口结构、消费习惯、渠道变化与技术成本出发，判断一个细分行业是否值得小本进入，以及进入的时机与切口。',
    intro:
      '机会不是“风口”，而是需求、支付能力与供给缺口同时成立。这里用结构化问题清单评估行业，而不是给出跟风名单。',
    note: '行业判断具有时效性，文中标注了信息截止时间。',
    facets: ['industry', 'region'],
  },
  failures: {
    label: '失败案例',
    navLabel: '失败案例',
    en: 'Failures',
    kicker: 'Failures',
    title: '失败案例：比成功更值得研究的部分',
    seoTitle: '失败案例 | 小生意倒闭的真实原因',
    description:
      '研究小生意失败的常见结构：伪需求、算错成本、现金流断裂、选址错误、合伙人纠纷与规模不经济，并给出事前检查清单。',
    intro:
      '失败往往不是运气，而是一连串可识别的信号被忽略。复盘失败结构，是为了在投入之前就知道该在哪儿停下来。',
    note: '失败案例以公开报道与行业共性为素材，涉及具体经营者时做匿名化处理。',
    facets: ['topic', 'industry'],
  },
  books: {
    label: '商业书单',
    navLabel: '商业书单',
    en: 'Reading List',
    kicker: 'Reading List',
    title: '商业书单：建立经营者的知识底盘',
    seoTitle: '商业书单 | 小生意经营者值得读的 10 本书',
    description:
      '精选商业经营、财务、定价、消费者行为与创业方法论书籍，说明每本书解决什么问题、适合什么阶段读、有什么局限。',
    intro:
      '读书不能代替做生意，但能让你少交一些本可以避免的学费。这份书单按“看懂生意—算清账—找到客户—长期经营”组织。',
    note: '书籍信息以公开出版资料为准；评分与推荐语为编辑部研究观点。',
  },
  resources: {
    label: '优质资源',
    navLabel: '优质资源',
    en: 'Resources',
    kicker: 'Resources',
    title: '优质资源：研究生意时真正用得上的工具',
    seoTitle: '优质商业资源 | 数据、工具与学习渠道',
    description:
      '精选国内外商业数据、市场研究、财务工具、建站与运营资源，说明每个资源能解决什么问题、免费程度与使用门槛。',
    intro:
      '工具不在多，而在于能否支撑判断。这里只收录我们自己在研究案例时真实会打开的资源。',
    note: '外部资源的内容与可用性由对应站点负责，收录不代表背书。',
  },
  about: {
    label: '关于我们',
    navLabel: '关于我们',
    en: 'About',
    kicker: 'About',
    title: '关于「小生意，赚大钱」',
    seoTitle: '关于我们 | 小生意，赚大钱',
    description:
      '我们是一个研究小生意赚钱逻辑的独立知识库：研究真实需求、成本结构、现金流与可复制性，不贩卖暴富幻想。',
    intro:
      '这个站点存在的理由很简单：关于小生意的内容，要么是加盟广告，要么是成功学。我们想补上第三种——可验证、可计算、可执行的研究。',
  },
};

// 通用筛选维度定义。field 指向文章的元数据字段。
export const facets = {
  region: {
    label: '地区',
    field: 'region',
    options: [
      { value: 'cn', label: '中国案例' },
      { value: 'global', label: '海外案例' },
    ],
  },
  industry: {
    label: '行业',
    field: 'industry',
    options: [
      { value: '生活服务', label: '生活服务' },
      { value: '零售电商', label: '零售电商' },
      { value: '餐饮食品', label: '餐饮食品' },
      { value: '企业服务', label: '企业服务' },
      { value: '知识服务', label: '知识服务' },
      { value: '宠物经济', label: '宠物经济' },
      { value: '银发经济', label: '银发经济' },
      { value: '数字产品', label: '数字产品' },
      { value: '本地制造', label: '本地制造' },
    ],
  },
  startupCost: {
    label: '启动资金',
    field: 'startupCost',
    options: [
      { value: 'under3', label: '3 万以内' },
      { value: '3to10', label: '3–10 万' },
      { value: '10to30', label: '10–30 万' },
      { value: 'over30', label: '30 万以上' },
    ],
  },
  model: {
    label: '商业模式',
    field: 'model',
    options: [
      { value: '本地服务', label: '本地服务' },
      { value: '零售', label: '零售' },
      { value: '订阅', label: '订阅制' },
      { value: '服务制', label: '项目服务' },
      { value: '数字产品', label: '数字产品' },
      { value: '平台撮合', label: '平台撮合' },
      { value: '内容变现', label: '内容变现' },
    ],
  },
  difficulty: {
    label: '经营难度',
    field: 'difficulty',
    options: [
      { value: '低', label: '低：单人可跑' },
      { value: '中', label: '中：需要小团队' },
      { value: '高', label: '高：重运营' },
    ],
  },
  topic: {
    label: '主题',
    field: 'tags',
    options: [],
  },
};

export const footerGroups = [
  {
    title: '研究',
    links: [
      { label: '赚钱案例', href: '/cases/' },
      { label: '商业模式', href: '/business-models/' },
      { label: '利润结构', href: '/profit/' },
      { label: '现金流经营', href: '/cash-flow/' },
    ],
  },
  {
    title: '实战',
    links: [
      { label: '小成本创业', href: '/startup/' },
      { label: '经营方法论', href: '/methods/' },
      { label: '行业机会', href: '/industries/' },
      { label: '失败案例', href: '/failures/' },
    ],
  },
  {
    title: '资料',
    links: [
      { label: '商业书单', href: '/books/' },
      { label: '优质资源', href: '/resources/' },
      { label: '全站搜索', href: '/search/' },
      { label: '关于我们', href: '/about/' },
    ],
  },
];