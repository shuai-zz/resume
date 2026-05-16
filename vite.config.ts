import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Cloudflare Pages 构建时自动注入 CF_PAGES=1 → 走根路径；
  // 本地 / GitHub Pages 仍走 /resume/ 子路径。
  base: process.env.CF_PAGES ? '/' : '/resume/',
})
