# Design Decisions — 罗小黑战记

- Entry mode: Step-by-step（用户指定影片）
- Genre: 中国原创动画 / 东方奇幻
- Director: MTJJ（木头）
- Film: 罗小黑战记 (The Legend of Hei, 2019)
- Niche: 宠物健康记录 App
- Pages: Home（首页）、Timeline（大事年表）、AIInsights（AI看板）、Profile（我的）、Login（登录）
- Major page roles: Feed + Timeline + Dashboard + Profile + Auth
- Image placeholders: Yes（宠物头像、背景插画）

## Demo Uniqueness Audit

- Previous-work audit: 当前项目使用 Impeccable 风格 — 暖橙 accent、中性灰白背景、极简卡片。这与罗小黑的自然主义完全不同。
- Recurring traits to avoid: 中性灰白背景、小圆角卡片、单色 accent 按钮、极简留白
- Shell-ban list: 禁止 SaaS 卡片网格、禁止纯白/灰白背景、禁止 8px 小圆角、禁止单薄边框、禁止 backdrop-blur 玻璃效果
- Primary composition family: **Hand-drawn storybook panels** — 每个页面像一页手绘故事书的插画面板
- Wireframe-level uniqueness test: 去色后，罗小黑风格靠粗边框 + 大色块 + 大圆角 + 不对称留白来区别于 Impeccable 的细边框中性卡片

## Research Notes

### Film Palette（自然场景为主 — 适合 App 基调）

- Primary: 森林绿 `#7BA587`（小黑耳朵绿）
- Secondary: 暖木棕 `#C4A882`（木质建筑、画虎店）
- Accent: 琥珀金 `#E8B44F`（烛光、灵力光晕）
- Shadow/Ink: 墨色 `#2C2416`（水墨线条、深夜）
- Surface: 宣纸白 `#F5F0E8`（国画纸本色）
- Text: 墨灰 `#3D3226`
- Highlight: 湖蓝 `#6BA3BE`（天空/海洋片段）

### Director Signatures (MTJJ/木头)

1. **粗线描边 + 扁平色块** — 人物和场景都用粗圆线条勾勒，填充纯色，不用渐变。→ UI: border-2 粗边框 + solid 纯色背景
2. **自然-城市色彩对立** — 森林场景低饱和自然色 vs 城市霓虹高饱和。→ UI: 主界面自然基调 + AI/提醒用温暖辉光点缀
3. **中式留白与不对称** — 画面常一侧密一侧疏，留大量呼吸空间。→ UI: 不对称布局，卡片不填满，大量留白

### Film Translation Notes

- Framing: 画面像国画册页，每屏是一个独立构图，有"框"的感觉。→ UI 卡片用粗边框围合
- Rhythm: 快节奏打斗 + 长镜头日常交替。→ 操作区紧凑，浏览区舒展
- Lighting: 自然光/烛光为主，柔和温暖，无冷硬打光。→ 暖色调阴影，无纯黑
- Space: 大量"空"的留白是中式美学的核心。→ 卡片间距大，不堆砌
- Materiality: 纸、木、石、布 — 自然材质感。→ 背景微纹理
- What should stay restrained: 动效克制 — 罗小黑不是炫技动画，讲究"恰到好处"
