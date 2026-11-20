import { defineConfig } from 'vite';
import { ssgPlugin } from './scripts/ssg.js';

// GitHub Pages 项目页使用子路径：在 CI 中通过 BASE_PATH 注入。
// 自定义域名或根路径部署时留空即可。
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [ssgPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
  },
});