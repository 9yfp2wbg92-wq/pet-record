# Tests — Verification Map

## Existing Coverage

| # | Use Case | Rule | Expected Behavior | Source | Status |
|---|----------|------|-------------------|--------|--------|
| — | — | — | — | — | — |

**当前项目无测试文件。** `package.json` 中无测试框架依赖（Jest/Vitest 未安装），`src/` 目录下无 `.test.ts` 或 `.spec.ts` 文件。

## Gaps — Unverified Rules

按风险排序：

| # | Rule (from docs) | What Crossing It Exposes | Doc Ref | Code Ref | Risk |
|---|------------------|------------------------|---------|----------|------|
| 1 | 只有 pet owner 可以删除宠物 | shared user 可删除不是自己的宠物 | [permissions.md](permissions.md) | `usePetStore.ts:306` | 🔴 High |
| 2 | 删除宠物应级联删除关联数据 | posts/milestones 孤儿数据占用空间 | [architecture.md](architecture.md) | `usePetStore.ts:306` | 🟡 Medium |
| 3 | AI 归档 petId 应仅限当前用户的宠物 | 用户可选任意 pet 写入里程碑 | [flows.md](flows.md) | `Home.tsx:148` | 🟡 Medium |
| 4 | 邀请码应有安全防护 | 暴力枚举邀请码加入任意家庭 | [flows.md](flows.md) | `usePetStore.ts:323` | 🟡 Medium |
| 5 | 用户输入应 sanitize | XSS via localStorage 回显 | [architecture.md](architecture.md) | `storage.ts` (所有渲染点) | 🟡 Medium |
| 6 | localStorage 数据应校验 | 恶意修改 localStorage 导致渲染错误 | [architecture.md](architecture.md) | `storage.ts` (所有 getter) | 🟢 Low |
| 7 | 日期字段应标准校验 | 无效日期导致排序/显示异常 | [architecture.md](architecture.md) | `storage.ts:111` | 🟢 Low |

## Proposed Tests (Not Yet Written)

### P0 — 必须添加

1. **`deletePet` 权限测试** — 验证 shared user 调用 deletePet 被拒绝（需先添加 owner 检查）
   - Type: 自动化单元测试
   - Source: [permissions.md](permissions.md) → `deletePet` 行

2. **级联删除测试** — 删除宠物后确认关联 posts/milestones 也被删除或标记
   - Type: 自动化单元测试
   - Source: [architecture.md](architecture.md) Risk #3

3. **AI 归档归属测试** — 验证 milestone 的 petId 必须是当前用户拥有的 pet
   - Type: 自动化单元测试
   - Source: [flows.md](flows.md) Flow 2

### P1 — 应该添加

4. **邀请码暴力枚举防护测试** — 验证连续失败后有限流或锁定
   - Type: 自动化单元测试
   - Source: [flows.md](flows.md) Flow 4

5. **XSS 防护测试** — `<script>alert(1)</script>` 存入 localStorage 后渲染不执行
   - Type: 手动审查
   - Source: [architecture.md](architecture.md) Risk #6

### P2 — 可以添加

6. **localStorage schema 校验测试** — 损坏的 JSON 数据不会导致白屏
7. **日期格式容错测试** — 无效日期字符串不会导致排序崩溃
