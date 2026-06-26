# Permissions

## Role Model

单角色系统 — 所有已登录用户拥有同等权限。无 admin/owner/member 区分。

## Resource × Operation × Role Matrix

| Resource | Operation | Anyone (未登录) | User (已登录) | Owner | Shared User |
|----------|-----------|:---:|:---:|:---:|:---:|
| Pet (自己的) | Read | ❌ | ✅ | ✅ | ✅ |
| Pet (分享的) | Read | ❌ | ✅ | ✅ | ✅ |
| Pet (任意) | Create | ❌ | ✅ | — | — |
| Pet (自己的) | Update | ❌ | ✅ | ✅ | ✅ (⚠️) |
| Pet (自己的) | Delete | ❌ | ✅ | ✅ | ✅ (⚠️) |
| Post | Create | ❌ | ✅ | ✅ | ✅ |
| Post | Read | ❌ | ✅ | ✅ | ✅ |
| Post | Comment | ❌ | ✅ | ✅ | ✅ |
| Post | Like | ❌ | ✅ | ✅ | ✅ |
| Milestone | Create | ❌ | ✅ | ✅ | ✅ (⚠️) |
| Milestone | Update/Delete | ❌ | ✅ | ✅ | ✅ (⚠️) |

## AuthZ Enforcement Points

| Check | Location | Method | Verified? |
|-------|----------|--------|-----------|
| 登录检查 | `App.tsx:13` ProtectedRoute | `currentUser ? children : Navigate` | ✅ |
| 帖子归属 | `Home.tsx:91` | `petId: currentPetId \|\| pets[0]?.id` — 仅前端选择，无强制 | ⚠️ |
| AI 归档归属 | `Home.tsx:148` | `petId: selectedPetId` — 用户可选任意 pet | ⚠️ |
| 宠物操作 | `usePetStore.ts` | 所有 addPet/updatePet/deletePet 仅检查 `currentUser` 非空 | ❌ |
| 里程碑操作 | `usePetStore.ts:432` | 仅检查 `currentUser` 非空 | ❌ |

## Known Gaps

1. **Shared user 可删除宠物** — `deletePet` 未区分 owner vs shared user (`usePetStore.ts:306`)
2. **Shared user 可修改宠物信息** — `updatePet` 无权限区分 (`usePetStore.ts:201`)
3. **无 RLS（Row-Level Security）** — 所有数据查询未按用户过滤，依赖前端展示逻辑
4. **邀请码无过期/使用次数限制** — 一旦知道邀请码即可永久加入
