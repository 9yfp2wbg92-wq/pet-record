# Architecture

## Product Overview

Pet Record（宠物记录）是一个前端单页应用，帮助宠物主人记录和管理宠物的健康大事件（疫苗、驱虫、洗澡、体重、就医、异常等），支持 AI 从日常文字中自动提取健康事件，支持家庭成员通过邀请码共享宠物记录。

**关键假设：**
- 单用户设备使用（无多租户 SaaS 需求）
- 所有数据存储在浏览器 localStorage（无后端）
- 不需要真实的身份认证（模拟登录）
- AI 功能为前端 mock 实现（非真实 LLM 调用）

## Tech Stack

| 层 | 技术 | 版本 |
|---|------|------|
| 框架 | React | 18 |
| 语言 | TypeScript | ~5.6 |
| 构建 | Vite | 6.4 |
| 样式 | Tailwind CSS | 3.4 |
| 状态管理 | Zustand | latest |
| 路由 | React Router DOM | 7 |
| 图标 | Lucide React | 0.511 |
| 持久化 | localStorage | N/A |

## Auth / Session Flow

1. 用户打开应用 → `App.tsx` 调用 `loadData()` 从 localStorage 读取 `currentUserId`
2. 如果 `currentUserId` 存在 → 直接进入主界面
3. 如果不存在 → 重定向到 `/login`
4. 登录：输入用户名 → `registerUser()` 创建 User 对象、写入 localStorage、设置 currentUserId
5. 无密码、无 token、无 session 过期机制

## Trust Boundaries

```
┌─────────────────────────────────────────┐
│  Browser (trusted: user's own device)   │
│                                          │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │  React   │  │  localStorage         │ │
│  │  App     │◄─┤  (all data, no        │ │
│  │          │  │   encryption)          │ │
│  └──────────┘  └──────────────────────┘ │
│                                          │
│  Trust boundary: NONE (client-only app) │
└─────────────────────────────────────────┘
```

**没有服务器端** — 所有"权限检查"都在客户端进行，可被任意修改。
**没有网络请求** — 没有数据泄露到外部的风险。
**localStorage 无加密** — 任何能访问浏览器的人都能读取全部数据。

## Known Risks / Assumptions

| # | Risk | Code Evidence | Severity |
|---|------|---------------|----------|
| 1 | localStorage 无加密存储所有数据 | `src/utils/storage.ts` — 直接 JSON.stringify | Low（客户端应用） |
| 2 | 邀请码加入无二次确认 | `src/hooks/usePetStore.ts:joinPetByInviteCode` — 直接添加 sharedUserIds | Medium |
| 3 | 删除宠物不级联删除关联数据 | `src/hooks/usePetStore.ts:deletePet` — 仅删除 Pet，posts/milestones 残留 | Medium |
| 4 | 切换用户不刷新数据 | `src/hooks/usePetStore.ts:switchUser` 调用 loadData() 但旧 state 可能残留 | Low |
| 5 | mockAI 无速率限制 | `src/utils/mockAI.ts` — 每次触发都执行 | Low |
| 6 | 无输入 sanitization | 用户输入直接存入 localStorage 和渲染 | Medium（XSS 风险） |

## Related Documents

- [flows.md](flows.md)
- [permissions.md](permissions.md)
- [variables.md](variables.md)
- [automation.md](automation.md)
- [tests.md](tests.md)
- [audit-report.md](audit-report.md)
