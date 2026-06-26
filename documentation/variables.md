# Variables & Secrets

## Configuration Inventory

| Name | Used By | Scope | Source | Rotation | Risk |
|------|---------|-------|--------|----------|------|
| `STORAGE_KEYS` | `src/utils/storage.ts` | Client | Hardcoded constants | N/A | Low — localStorage key names |
| `PET_COLORS` | `src/pages/Timeline.tsx` | Client | Hardcoded array | N/A | Low — UI colors |
| `filterChips` | `src/pages/Timeline.tsx` | Client | Hardcoded array | N/A | Low — UI labels |
| `eventTypeLabels` | `src/pages/Timeline.tsx` | Client | Hardcoded Record | N/A | Low — UI labels |
| `GENDERS` | `src/pages/Profile.tsx` | Client | Hardcoded array | N/A | Low — UI labels |
| `CATEGORIES` | `src/pages/Profile.tsx` | Client | Hardcoded array | N/A | Low — UI labels |
| `healthKeywords` | `src/pages/Home.tsx:73` | Client | Hardcoded array | N/A | Low — AI trigger words |
| `eventTypeMap` | `src/pages/Home.tsx:136` | Client | Hardcoded Record | N/A | Low — AI type mapping |

## Secrets

**无真实 Secret** — 这是一个纯前端应用，没有：
- API keys
- Database credentials
- Auth tokens (JWT/API key)
- Third-party service keys
- Environment variables

## Pre-Go-Live Checklist

如果将来添加后端：

- [ ] 所有 secret 移至服务端环境变量，不打包到前端
- [ ] `localStorage` 存储的用户数据迁移到数据库
- [ ] 添加真实的认证机制（OAuth/JWT）
- [ ] 为 `inviteCode` 添加过期时间和使用次数限制
- [ ] 为 `mockAI` 添加速率限制（如果升级为真实 LLM 调用）
