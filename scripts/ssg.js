// Vite 插件：开发期按路由实时渲染；构建期输出预渲染静态页面与 SEO 文件。
import fs from 'node:fs';
import path from 'node:path';
import { renderPage, renderNotFound, listPages, normalizePath } from '../src/render/router.js';
import { resetContentCache } from '../src/content/loader.js';
import {
  buildFeed,
  buildManifest,
  buildRobots,
  buildSearchIndex,
  buildSitemap,
} from '../src/utils/outputs.js';

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
};

function injectAssets(html, cssTags, jsTags) {
  return html
    .replace('<!--vite-css-->', cssTags.join('\n'))
    .replace('<!--vite-js-->', jsTags.join('\n'));
}

export function ssgPlugin() {
  let config;
  let root;
  return {
    name: 'sbbm-ssg',
    configResolved(resolved) {
      config = resolved;
      root = resolved.root;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        // 构建期文件：开发时也提供，便于校对。
        const special = {
          '/sitemap.xml': [buildSitemap(server.config.base), 'application/xml; charset=utf-8'],
          '/robots.txt': [buildRobots(server.config.base), 'text/plain; charset=utf-8'],
          '/feed.xml': [buildFeed(server.config.base), 'application/rss+xml; charset=utf-8'],
          '/manifest.webmanifest': [
            buildManifest(server.config.base),
            'application/manifest+json; charset=utf-8',
          ],
          '/data/search-index.json': [
            JSON.stringify(buildSearchIndex(server.config.base)),
            'application/json; charset=utf-8',
          ],
        };
        if (special[pathname]) {
          resetContentCache();
          res.setHeader('Content-Type', special[pathname][1]);
          res.end(special[pathname][0]);
          return;
        }

        const isPage =
          !pathname.startsWith('/@') &&
          !pathname.startsWith('/src/') &&
          !pathname.startsWith('/assets/') &&
          !pathname.startsWith('/node_modules/') &&
          (!pathname.includes('.') || pathname.endsWith('.html'));
        if (!isPage) return next();

        try {
          resetContentCache();
          const html =
            renderPage(pathname, { base: server.config.base, dev: true }) ||
            renderNotFound({ base: server.config.base, dev: true });
          res.statusCode = html.includes('<title>页面未找到') ? 404 : 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
    closeBundle() {
      const outDir = path.resolve(root, config.build.outDir);
      const shellPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(shellPath)) return;

      const shell = fs.readFileSync(shellPath, 'utf8');
      const cssTags = [...shell.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map((m) => m[0]);
      const jsTags = [...shell.matchAll(/<script[^>]+type="module"[^>]*><\/script>/g)].map((m) => m[0]);

      resetContentCache();
      const routes = listPages();
      for (const route of routes) {
        const normalized = normalizePath(route);
        const html = renderPage(normalized, { base: config.base, dev: false }) || '';
        if (!html) continue;
        const file =
          normalized === '/'
            ? path.join(outDir, 'index.html')
            : path.join(outDir, normalized.replace(/^\//, ''), 'index.html');
        write(file, injectAssets(html, cssTags, jsTags));
      }

      write(
        path.join(outDir, '404.html'),
        injectAssets(renderNotFound({ base: config.base, dev: false }), cssTags, jsTags),
      );

      write(path.join(outDir, 'sitemap.xml'), buildSitemap(config.base));
      write(path.join(outDir, 'robots.txt'), buildRobots(config.base));
      write(path.join(outDir, 'feed.xml'), buildFeed(config.base));
      write(path.join(outDir, 'manifest.webmanifest'), buildManifest(config.base));
      write(path.join(outDir, 'data', 'search-index.json'), JSON.stringify(buildSearchIndex(config.base)));
      write(path.join(outDir, '.nojekyll'), '');

      const pages = routes.length + 1;
      this.info?.(`\n  SSG 已生成 ${pages} 个页面（含 404），sitemap / robots / feed / 搜索索引已写入。`);
    },
  };
}