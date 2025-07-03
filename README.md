# React Lusion - Interactive WebGL Experience

一个基于 React 18 和 Three.js 的交互式 WebGL 体验项目，展示了波浪形变效果、页面过渡动画和平滑滚动功能。

## 技术栈

- **Vite + React 18** - 现代化前端开发框架
- **Three.js** - WebGL 渲染库
- **GLSL Shader** - 自定义顶点和片段着色器
- **GSAP** - 高性能动画库
- **React Router v6** - 页面路由管理
- **Lenis** - 平滑滚动库

## 功能特点

- 全屏 Three.js 场景，使用自定义着色器实现波浪效果
- 鼠标移动实时影响波浪形变
- 页面加载和切换动画
- 平滑滚动与 WebGL 场景联动
- 响应式设计

## 项目结构

```
/public
  /vite.svg
/src
  /animations
    /scroll.js      # 平滑滚动和滚动触发
    /transition.js  # 页面过渡动画
  /pages
    /About.jsx      # 关于页面
    /Home.jsx       # 首页
  /webgl
    /objects
      /WavePlane.js # 波浪平面对象
    /shaders
      /wave.frag.glsl # 片段着色器
      /wave.vert.glsl # 顶点着色器
    /renderer.js    # Three.js 渲染器
  /App.jsx          # 主应用组件
  /index.css        # 全局样式
  /main.jsx         # 应用入口
```

## 安装和运行

1. 克隆仓库

```bash
git clone https://github.com/yourusername/react-lusion.git
cd react-lusion
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 打开浏览器访问 http://localhost:5173

## 自定义

- 修改 `src/webgl/shaders` 中的着色器代码来改变视觉效果
- 调整 `src/webgl/objects/WavePlane.js` 中的参数来改变波浪行为
- 在 `src/animations` 中修改动画设置

## 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `dist` 目录中。

## 许可

MIT# Lusion
