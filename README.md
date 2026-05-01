**中文** | [English](./README-EN.md)

# Happy Eliminate (开心消消乐)

这是一个基于 Svelte、Vite 和 Phaser 3 构建的网页端消除类小游戏。

## 🛠️ 技术栈

- **框架支持**: [Svelte 5](https://svelte.dev/) - 用于构建游戏外的UI和页面交互。
- **构建工具**: [Vite 8](https://vitejs.dev/) - 提供极速的本地开发服务器和生产环境构建。
- **游戏引擎**: [Phaser 3.90](https://phaser.io/) - 用于处理游戏核心场景、精灵渲染和物理逻辑。

## 📂 核心目录结构

```text
├── public/                 # 公共静态资源
│   └── game-assets/        # 游戏素材（背景图案、图块、音效等）
├── scripts/                # 独立的功能及测试脚本
│   └── test-logic.mjs      # 游戏逻辑测试脚本
├── src/
│   ├── game/               # 游戏核心系统
│   │   ├── assets/         # Phaser资源加载清单配置
│   │   ├── audio/          # 游戏音效控制
│   │   ├── phaser/         # Phaser游戏实例、场景 (Scenes) 配置
│   │   ├── simulation/     # 纯净的核心规则、消除逻辑、随机算法与状态推演
│   │   └── stores/         # 提供 Svelte Stores 与 Phaser 之间的数据通讯桥梁
│   ├── lib/                # 可复用的 Svelte 业务组件
│   ├── App.svelte          # 页面入口组件
│   └── main.js             # 客户端挂载入口
```

## 🚀 起步指南

本项目推荐使用 [pnpm](https://pnpm.io/) 作为包管理器。

### 1. 安装依赖

```bash
pnpm install
```

### 2. 本地开发调试

启动开发服务器，支持模块热替换（HMR）：

```bash
pnpm run dev
```

### 3. 测试游戏逻辑

单独执行游戏核心消除逻辑的脚本验证，不依赖浏览器环境：

```bash
pnpm run test:logic
```

### 4. 生产环境构建

将项目进行打包，并可本地预览打包结果：

```bash
pnpm run build
pnpm run preview
```

## 🎮 架构理念

项目采用了 **数据与视图分离** 的设计理念：
- **纯逻辑层 (`src/game/simulation/`)**：处理所有的消除判定、掉落、匹配逻辑，与渲染引擎和UI框架完全解耦。
- **渲染层 (`src/game/phaser/`)**：专注于将逻辑层的状态以生动的动画绘制出来。
- **UI交互层 (`src/lib/` & `App.svelte`)**：借助 Svelte 的响应式数据 (`stores`) 轻松制作和渲染游戏外围面板（如计分板、设置菜单）。
