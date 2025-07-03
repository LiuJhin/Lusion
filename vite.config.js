import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    glsl() // 添加GLSL插件以支持导入.glsl文件
  ],
  server: {
    host: true
  }
})