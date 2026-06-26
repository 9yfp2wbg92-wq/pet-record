# Flows — Key User Journeys

## Flow 1: 登录 & 注册

- **Actor**: 未登录用户
- **Precondition**: localStorage 无 `currentUserId`
- **Success**: 用户进入主界面，看到宠物列表

| Step | Surface | Action | AuthZ Check | Side Effects |
|------|---------|--------|-------------|--------------|
| 1 | `/login` | 输入用户名 | None | — |
| 2 | Login.tsx:62 | `registerUser(name)` → 创建 User (id=Date.now()) | None | `storage.addUser()`, `storage.setCurrentUserId()` |
| 3 | App.tsx | ProtectedRoute 检测到 currentUser → 渲染主页 | `currentUser !== null` | — |

**Trust boundary crossing**: 无（纯客户端）

---

## Flow 2: 创建帖子 + AI 提取健康事件

- **Actor**: 已登录用户
- **Precondition**: 至少有一只宠物
- **Success**: 帖子发布，AI 事件写入大事年表

| Step | Surface | Action | AuthZ Check | Side Effects |
|------|---------|--------|-------------|--------------|
| 1 | Home.tsx:68 | `handleSubmit()` — 输入含健康关键词 | `currentUser` 非空 | — |
| 2 | Home.tsx:82 | `mockAIExtract(content)` | None | 2s 延迟模拟 |
| 3 | Home.tsx:121 | `handleAIConfirm()` → `addPost()` + `addMilestone()` | None（直接信任 selectedPetId）| 写入 localStorage |
| 4 | usePetStore.ts:348 | `addPost()` | `currentUser` 非空 | `storage.addPost()` |
| 5 | usePetStore.ts:432 | `addMilestone()` | `currentUser` 非空 | `storage.addMilestone()` |

**关键 AuthZ 问题**:
- `handleAIConfirm` 使用 `selectedPetId` 但未验证该 pet 是否属于当前用户或已分享给当前用户
- `addMilestone` 未检查 `petId` 对应的 pet 是否存在或是否当前用户有权操作

---

## Flow 3: 添加宠物

- **Actor**: 已登录用户
- **Precondition**: 无
- **Success**: 新宠物创建，自动创建"到家"里程碑

| Step | Surface | Action | AuthZ Check | Side Effects |
|------|---------|--------|-------------|--------------|
| 1 | Profile.tsx:140 | `handleAddSubmit()` | 检查 name 和 homeDate 非空 | — |
| 2 | usePetStore.ts:124 | `addPet()` | `currentUser` 非空 | 写入 Pet + 创建 home/anniversary 里程碑 + 生成邀请码 |

---

## Flow 4: 通过邀请码加入家庭

- **Actor**: 已登录用户
- **Precondition**: 知道有效的 6 位邀请码
- **Success**: 用户被添加到宠物的 sharedUserIds

| Step | Surface | Action | AuthZ Check | Side Effects |
|------|---------|--------|-------------|--------------|
| 1 | Profile.tsx:176 | `handleJoinByInvite()` | 检查 code 非空 | — |
| 2 | usePetStore.ts:323 | `joinPetByInviteCode()` | 检查用户已是 owner 或 shared → 直接返回 | 添加 sharedUserIds |

**问题**: 邀请码可以暴力枚举（6 位，排除容易混淆字符，共 ~28^6 ≈ 4.8 亿种组合，无速率限制）。

---

## Flow 5: 删除宠物

- **Actor**: 已登录用户
- **Precondition**: 宠物存在
- **Success**: 宠物删除

| Step | Surface | Action | AuthZ Check | Side Effects |
|------|---------|--------|-------------|--------------|
| 1 | Profile.tsx:119 | `handleDeletePet()` | None（仅 UI 确认） | — |
| 2 | usePetStore.ts:306 | `deletePet()` | None（未检查是否为 owner） | 仅删除 Pet，posts/milestones/memes 保留为孤儿数据 |

**问题**: 
- 未检查删除者是否为宠物 owner（sharedUser 也可以删）
- 未级联删除关联的 posts、milestones、memes
