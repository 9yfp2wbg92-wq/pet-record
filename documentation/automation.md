# Automation — AI Agent (mockAI)

## Agent: mockAI Health Event Extractor

| Property | Value |
|----------|-------|
| **Trigger** | 用户发布帖子，内容包含健康关键词 (`healthKeywords` in `Home.tsx:73`) |
| **Owner** | 前端用户（无后台） |
| **Auto-run?** | 是 — 关键词匹配后自动触发，无审批 |
| **Location** | `src/utils/mockAI.ts` |

## Inputs

| Input | Source | Risk |
|-------|--------|------|
| `text: string` | 用户输入的帖子内容 | Low — 用户自己的输入 |
| `currentDate: string` | `new Date().toISOString().split('T')[0]` | Low |
| `petNames?: string[]` | 当前用户的宠物名列表 | Low |

## Tool Surface (Agent Capabilities)

| Tool | Description | Guardrails |
|------|-------------|------------|
| 关键词匹配 | 匹配 `疫苗/驱虫/洗澡/体重/就医/异常` 等关键词 | 硬编码关键词列表 |
| 体重提取 | 正则匹配 `(\d+(?:\.\d+)?)\s*(?:kg\|公斤)` | 范围限制 0 < weight < 500 |
| 宠物名识别 | 在文本中查找宠物名出现位置 | 仅对当前用户的宠物名匹配 |
| 事件生成 | 为每个检测到的事件创建 `DetectedEvent` | 硬编码事件类型映射 |

## Output Contract (to App)

```typescript
interface AIExtractedData {
  has_event: boolean;
  events: DetectedEvent[];     // 提取的健康事件
  date: string;                // 事件日期
  raw_text: string;            // 原始文本
  detected_pet_name?: string;  // 识别的宠物名
}
```

## App-Owned Side Effects vs. Agent-Owned Suggestions

| Action | Owner | Enforced? |
|--------|-------|-----------|
| 事件检测 | Agent (mockAI) | ✅ 硬编码规则 |
| 事件展示 | App (AIExtractModalWrapper) | ✅ UI 展示，用户可取消 |
| 事件归档 | App (`handleAIConfirm`) | ⚠️ 用户点击确认后写入，但 petId 由用户选择 |
| 下次提醒间隔 | App (`nextIntervals`) | ⚠️ 用户可编辑，默认值来自 Agent 建议 |

## Controls

| Control | Status | Note |
|---------|--------|------|
| 审批门 | ✅ | AI 弹窗让用户选择确认/取消 |
| 审计日志 | ❌ | 无日志记录 |
| 速率限制 | ❌ | 无限制，可重复触发 |
| 重试机制 | ❌ | 无（mock 2s 延迟） |
| 关闭开关 | ❌ | 无配置项禁用 AI |
| 输出验证 | ⚠️ | 事件类型映射 (`eventTypeMap`) 有默认值兜底 |

## Steering (Prompt)

mockAI 不使用 LLM prompt — 使用硬编码关键词 + 正则匹配。无 prompt injection 风险。
