# Intended vs. Implemented — Audit Report

> 方法：对比 `/documentation/*.md` 中记录的设计意图与 `src/` 中的实际代码实现。
> 日期：2026-06-26
> 范围：全项目

---

## 审计摘要

| 严重度 | 数量 | 说明 |
|--------|------|------|
| 🔴 Critical | 0 | 无 |
| 🟠 High | 2 | 越权删除 + 无级联删除 |
| 🟡 Medium | 5 | 权限缺失、邀请码安全、XSS、孤儿数据 |
| 🟢 Low | 3 | 代码质量、dead code、数据校验 |

---

## Finding #1 🔴 High — deletePet 无所有者检查

- **Documented intent**: [permissions.md](permissions.md) — Owner 和 Shared User 权限应区分
- **Implemented reality**: `src/hooks/usePetStore.ts:306-314` — `deletePet` 函数仅检查 `currentUser` 非空，不区分操作者是 owner 还是 shared user
- **Attack scenario**: 通过邀请码加入家庭的 shared user 可以删除宠物及其所有记录
- **Victim**: 宠物 owner，丢失全部宠物数据
- **Concrete fix**: 
  ```ts
  deletePet: (id) => {
    const state = get();
    const pet = state.pets.find(p => p.id === id);
    if (!pet || pet.ownerUserId !== state.currentUser?.id) return; // 只有 owner 可删除
    // ... 级联删除关联数据 ...
  }
  ```

---

## Finding #2 🟠 High — 删除宠物不级联删除关联数据

- **Documented intent**: [architecture.md](architecture.md) Risk #3 — 应有级联删除
- **Implemented reality**: `src/hooks/usePetStore.ts:306-314` — `deletePet` 仅删除 Pet 本身，不删除关联的 posts、milestones、memes
- **Attack scenario**: N/A（非安全漏洞，是数据完整性问题）
- **Victim**: 用户 localStorage 被孤儿数据污染，长期累积可能影响性能
- **Concrete fix**:
  ```ts
  deletePet: (id) => {
    // 级联删除
    const postIds = storage.getPostsByPetId(id).map(p => p.id);
    postIds.forEach(pid => storage.deletePost(pid));
    const msIds = storage.getMilestonesByPetId(id).map(m => m.id);
    msIds.forEach(mid => storage.deleteMilestone(mid));
    const memeIds = storage.getMemesByPetId(id).map(m => m.id);
    memeIds.forEach(mid => storage.deleteMeme(mid));
    storage.deletePet(id);
    // ... update state ...
  }
  ```

---

## Finding #3 🟡 Medium — addMilestone 不验证 petId 归属

- **Documented intent**: [flows.md](flows.md) Flow 2 — "未验证该 pet 是否属于当前用户"
- **Implemented reality**: `src/pages/Home.tsx:148` — `petId: selectedPetId` 直接传入，`src/hooks/usePetStore.ts:432-447` — `addMilestone` 不检查 petId 归属
- **Attack scenario**: 构造请求向不属于自己的 pet 添加里程碑（虽然 UI 限制了选择范围，但代码层面无防护）
- **Victim**: 宠物 owner，被注入不属于的里程碑数据
- **Concrete fix**: 在 `addMilestone` 中添加 `pets.find(p => p.id === petId)` 校验

---

## Finding #4 🟡 Medium — 邀请码可暴力枚举

- **Documented intent**: [flows.md](flows.md) Flow 4 — 邀请码安全
- **Implemented reality**: `src/utils/storage.ts:210-217` — 6位邀请码，字符集 `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`（30个字符）。`src/hooks/usePetStore.ts:323-346` — `joinPetByInviteCode` 无速率限制、无失败次数限制
- **Attack scenario**: 自动化脚本枚举邀请码加入任意家庭
- **Victim**: 宠物 owner，陌生人获取宠物数据访问权
- **Concrete fix**: 添加连续失败计数器 + 冷却时间，或增加邀请码长度/复杂度

---

## Finding #5 🟡 Medium — 用户输入直接存入 localStorage 无 sanitization

- **Documented intent**: [architecture.md](architecture.md) Risk #6
- **Implemented reality**: `src/pages/Home.tsx:89-100` — 帖子内容直接 `JSON.stringify` 存入 localStorage，渲染时直接回显。React 默认会转义 JSX 内容，但 `img src` 为 `data:` URL 时仍可能存在风险
- **Attack scenario**: 恶意构造的 base64 图片数据可能包含危险内容
- **Victim**: 用户自己（XSS 对自己攻击价值低，但存在理论风险）
- **Concrete fix**: 对图片 data URL 做大小和类型校验

---

## Finding #6 🟡 Medium — updatePet 允许 shared user 修改宠物信息

- **Documented intent**: [permissions.md](permissions.md) — shared user 可 update 标记 ⚠️
- **Implemented reality**: `src/hooks/usePetStore.ts:201-303` — `updatePet` 无 owner 检查，shared user 可修改宠物名、品种、生日等信息
- **Attack scenario**: shared user 恶意修改宠物信息
- **Victim**: 宠物 owner
- **Concrete fix**: 在 `updatePet` 中检查 `pet.ownerUserId === currentUser.id`，或对 shared user 限制可修改字段

---

## Finding #7 🟡 Medium — mockAI 缺少事件去重

- **Documented intent**: [automation.md](automation.md) — Agent 无速率限制
- **Implemented reality**: `src/utils/mockAI.ts` — 每次触发都生成新事件，相同内容重复发布会产生重复 milestone
- **Attack scenario**: N/A（非恶意场景，是用户体验问题）
- **Victim**: 用户，时间轴中出现重复事件
- **Concrete fix**: 在 `addMilestone` 中添加去重逻辑（同 petId + 同 type + 同日期 → 跳过或合并）

---

## Finding #8 🟢 Low — 死代码组件

- **Code evidence**: 
  - `src/components/AIExtractModal.tsx` — 与 Home.tsx 内联的 `AIExtractModalWrapper` 功能重复
  - `src/pages/Meme.tsx` — 表情包页面，App.tsx 路由中未注册
- **Impact**: 增加 bundle size，混淆代码阅读
- **Concrete fix**: 删除或正式接入路由

---

## Finding #9 🟢 Low — 日期字段双名（createdAt / timestamp）

- **Documented intent**: [architecture.md](architecture.md) — Post 类型设计
- **Implemented reality**: `src/types.ts:48-49` — Post 同时有 `createdAt?: string` 和 `timestamp?: string`。代码中需要到处写 `createdAt || timestamp` 来兼容
- **Impact**: 增加维护负担和 bug 风险
- **Concrete fix**: 统一为 `createdAt`，写迁移脚本处理旧数据

---

## Finding #10 🟢 Low — 无数据 schema 校验

- **Documented intent**: [tests.md](tests.md) Gap #6
- **Implemented reality**: `src/utils/storage.ts` — 所有 getter 函数直接 `JSON.parse(data)` 后使用，无 schema 校验。如果 localStorage 数据被手动修改或损坏，会导致运行时错误
- **Concrete fix**: 使用 zod 或手写校验函数验证从 localStorage 读取的数据结构

---

## 审计结论

| 维度 | 评分 | 说明 |
|------|------|------|
| 安全性 | ⚠️ Fair | 客户端应用安全风险较低，但权限模型需要加固 |
| 数据完整性 | ⚠️ Fair | 缺少级联删除和 schema 校验 |
| 代码质量 | ✅ Good | TypeScript + 清晰的模块结构 |
| 可维护性 | ✅ Good | 组件拆分合理，状态管理清晰 |
| 测试覆盖 | ❌ None | 零测试 |

**可发布性**: ⚠️ 完成 2 个 High 发现修复后建议发布。Low 发现不阻塞。
