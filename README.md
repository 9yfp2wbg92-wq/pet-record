# 🐾 宠记 (Pet Record)

> 朝夕相伴 · 岁岁留痕 — 宠物生活记录与健康管理应用

[![Tech](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**宠记** 帮助宠物主人系统化记录宝贝的日常生活和健康事件。通过 AI 智能识别日常文字中的健康信息，自动归档为可追溯的时间轴档案。支持多宠物、多用户切换、家庭成员共享。

---

## ✨ 核心功能

| 模块 | 说明 |
|------|------|
| 📝 **动态记录** | 发布文字+图片动态，AI 自动识别疫苗/驱虫/体重/就医等健康事件并归档 |
| 📅 **大事年表** | 按月份分组的时间轴，疫苗/驱虫/洗澡/体重/就医/异常分类筛选，倒序展示 |
| 🤖 **AI 看板** | 30 天健康报告、护理倒计时提醒，基于日常记录自动生成 |
| 🐱 **宠物档案** | 支持多只宠物，每只独立档案（品种/生日/到家日期/头像），每只专属配色 |
| 👨‍👩‍👧‍👦 **家庭共享** | 6 位邀请码共享宠物记录，家人可共同记录宝贝成长 |
| 🔒 **本地存储** | 数据存储在浏览器 localStorage，无需注册账号，隐私安全 |

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 状态管理 | Zustand（localStorage 持久化） |
| 路由 | React Router DOM v7 |
| 样式 | Tailwind CSS 3.4 |
| 图标 | Lucide React（手绘风格粗描边） |
| AI | 前端模拟 AI（Mock AI Extract，纯客户端正则+关键词匹配） |

---

## 🚀 本地开发

```bash
# 克隆仓库
git clone https://github.com/9yfp2wbg92-wq/pet-record.git
cd pet-record

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

开发服务器默认运行在 `http://localhost:5173`。

---

## 🌐 线上 Demo

👉 **[https://pet-record.vercel.app](https://pet-record.vercel.app)**

---

## 📱 截图

![应用 Logo](docs/assets/app-logo.jpg)

> 截图展示：登录页 Logo 与整体 UI 风格

---

## 📁 项目结构

```
pet-record/
├── src/
│   ├── components/     # 可复用组件（PetSelector, BottomNav, ScrollToTop…）
│   ├── hooks/          # Zustand store（usePetStore）
│   ├── pages/          # 页面（Home, Timeline, AIInsights, Profile, Login）
│   ├── utils/          # 工具（storage, mockAI, petColors）
│   └── types.ts        # TypeScript 类型定义
├── docs/               # 产品文档 & 流程图
├── public/             # 静态资源（favicon, logo）
└── documentation/      # 技术文档（架构/权限/流程）
```

---

## 📋 项目状态

当前为 **前端原型阶段**：
- ✅ 完整的前端交互流程（注册、记录、大事记、AI 看板）
- ✅ 数据存储在浏览器 localStorage，支持多用户切换
- ✅ AI 功能通过前端模拟实现（正则+关键词匹配）
- 🚧 后续计划：接入后端 API，实现真实数据持久化和用户认证
- 🚧 计划支持：PWA 离线使用、数据导出、真实 AI 图像识别

---

## 🤖 AI 辅助开发

本项目使用 **Claude Code** 辅助开发，包括 UI 设计迭代、安全审计、代码审查等。

---

## 📄 License

MIT © 2026
