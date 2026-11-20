# 图片与视觉资源清单

本清单记录站点正式使用的全部图片资源。项目不引用任何外部图片地址，所有素材均随仓库分发，可离线构建、离线浏览。

## 一、总体原则

1. **全部本地化**：页面中出现的每一张图片都存放在 `public/` 下，构建时复制到 `dist/`，不存在「只写地址、没有文件」的情况。
2. **原创优先**：封面、Hero 插画、图标、书籍封面均为项目原创 SVG，不使用来源不明的商业图片，也不下载杂志配图。
3. **可版本化**：SVG 为纯文本，可 diff、可审计、体积极小（单张 1–5 KB），无需额外压缩流程。
4. **可追溯**：每张图片的生成方式、尺寸、用途在本文件中登记；文章中的经营数字口径在正文「数据说明」段落登记。
5. **无障碍**：所有 `<img>` 均带 `alt`；装饰性 SVG 使用 `aria-hidden="true"`；信息型 SVG 带 `role="img"` 与 `aria-label`。

## 二、资源分类

| 类型 | 数量 | 目录 | 尺寸 | 格式 | 来源 | 许可 |
| --- | --- | --- | --- | --- | --- | --- |
| 文章封面 | 42 | `public/assets/images/covers/` | 1200 × 750 | SVG | 原创，`npm run images` 生成 | MIT（随仓库） |
| 书籍封面 | 12 | `public/assets/images/books/` | 600 × 900 | SVG | 原创，`npm run images` 生成 | MIT（随仓库） |
| 社交分享图 | 1 | `public/assets/images/og-default.svg` | 1200 × 630 | SVG | 原创 | MIT（随仓库） |
| 品牌图标 | 5 | `public/assets/icons/` | 64 / 180 / 192 / 256 / 512 | SVG | 原创 | MIT（随仓库） |
| Hero 插画 | 1 | 由 `src/render/hero-art.js` 内联输出 | 响应式 viewBox | 内联 SVG | 原创 | MIT（随仓库） |
| 数据图表 | 12 类 | 由 `src/render/charts.js` 构建期渲染 | 响应式 viewBox | 内联 SVG | 原创，数据驱动 | MIT（随仓库） |
| README 截图 | 9 | `docs/screenshots/` | 见下表 | PNG / JPEG | 真实浏览器截图 | 同上 |

> 说明：`docs/screenshots/` 只用于 README 与验收记录，不参与站点构建，也不会出现在线上页面。

## 三、文章封面（42 张）

生成脚本：`scripts/generate-images.js`（`npm run images`）。

- 输入：`content/**/*.md` 的 frontmatter（`title`、`subtitle`、`cover`）。
- 规则：按栏目分配英文/中文栏目标签，按文章序号轮换 6 套配色与 6 种装饰图形（柱状图、折线、环形、节点、网格、路径），标题按 11 字换行、最多 3 行。
- 输出：与 frontmatter `cover` 字段一一对应的 SVG 文件，文件名即文章 slug。
- 重新生成：修改文章标题或新增文章后执行 `npm run images`，再 `npm run build`。
- 覆盖范围：案例 12、商业模式 8、方法论 8、利润 3、现金流 2、创业 3、行业 3、失败 3。

## 四、书籍封面（12 张）

- 生成脚本同上，数据来源 `src/data/books.js`。
- 设计为统一的「Small Business Library」书脊版式，仅配色与书名不同，避免使用出版社封面带来的版权问题。
- 尺寸 600 × 900，列表中按 2:3 比例预留空间，避免布局偏移。

## 五、图标与品牌

| 文件 | 用途 | 尺寸 |
| --- | --- | --- |
| `icons/favicon.svg` | 浏览器标签图标 | 64 × 64 |
| `icons/apple-touch-icon.svg` | iOS 主屏图标 | 180 × 180 |
| `icons/icon-192.svg` | PWA / Android 图标 | 192 × 192 |
| `icons/icon-512.svg` | PWA 启动图标 | 512 × 512 |
| `icons/logo.svg` | 站点 Logo（页头、页脚内联引用） | 256 × 256 |

界面中的线性图标（搜索、月亮、太阳、菜单、箭头等）由 `src/render/components.js` 的 `icon()` 以内联 SVG 输出，无独立文件、无第三方图标库。

## 六、Hero 插画与数据图表

- **Hero 插画**：`src/render/hero-art.js` 内联输出，包含店铺立面、商品货架、现金流曲线、供应链节点等元素，纯矢量、随主题变色、无外部依赖。
- **数据图表**：`src/render/charts.js` 实现 12 种图表（利润瀑布、成本结构、现金流循环、盈亏平衡、商业模式画布、转化漏斗、复购循环、供应链、价值链、30 天路线图、单客经济、收入结构）。图表由文章 frontmatter 附近的 `:::chart` JSON 驱动，构建期渲染为内联 SVG，包含标题、图例、口径说明与 `aria-label`。
- 图表配色使用 `--chart-*` CSS 变量，深浅色主题自动适配。

## 七、README 截图

由 `scripts/screenshots.js`（`npm run screenshots`）通过本机 Chrome DevTools 协议生成，全部为真实页面渲染结果，未使用设计稿或合成图。

| 文件 | 页面 | 视口 |
| --- | --- | --- |
| `home-desktop.png` | 首页 | 1440 × 1000 |
| `home-full.jpg` | 首页整页 | 1440 × 9000 上限 |
| `home-mobile.png` | 首页 | 390 × 844（DPR 2） |
| `home-mobile-menu.png` | 首页移动菜单 | 390 × 844（DPR 2） |
| `cases-desktop.png` | 赚钱案例列表 | 1440 × 1100 |
| `article-desktop.png` | 案例详情 | 1440 × 1200 |
| `article-mobile.png` | 案例详情 | 390 × 844（DPR 2） |
| `chart-profit-waterfall.png` | 利润瀑布图 | 元素裁剪 |
| `search-desktop.png` | 全站搜索 | 1440 × 1000 |

生成前置条件：`npm run build` 完成、`npm run preview` 已启动（默认 `http://127.0.0.1:4173`）。若本机 Chrome/Edge 不在默认路径，通过 `CHROME_PATH` 指定。

## 八、新增图片的流程

1. 优先使用原创 SVG，放入 `public/assets/images/` 对应子目录。
2. 文章封面通过 `npm run images` 生成，不要手工维护 42 个文件。
3. 在文章 frontmatter 中填写 `cover: /assets/images/covers/<slug>.svg`。
4. 图片必须有 `alt`；尺寸写入 `width`/`height` 或 CSS `aspect-ratio`，避免布局偏移。
5. 在本文件登记来源、尺寸与许可。
6. 运行 `npm run check`，脚本会校验封面文件是否存在、页面是否引用远程图片。

## 九、版权说明

除文中明确标注引用的公开资料外，本仓库内的封面、插画、图标、图表均为原创，随代码以 MIT 许可发布（见 `LICENSE`）。文章正文采用 CC BY-NC-SA 4.0 许可，非商业转载请注明出处，商业使用需获得授权。若未来引入第三方图片，必须同时满足：可商用授权、记录来源链接与获取日期、登记到本清单。