# Compiled Spec — 罗小黑战记 × Pet Record

## External Library Decision
- Q1: Core motion — subtle scale-in entrances + hover border-color shifts
- Q2: CSS-only, no external library needed
- Q3: N/A
- Decision: No external libraries. Native CSS + Tailwind.

## Derived Global Tokens

```css
:root {
  --bg-paper: #F5F0E8;
  --bg-surface: #FBF8F2;
  --ink-primary: #2C2416;
  --ink-secondary: #5C5244;
  --ink-muted: #968A7C;
  --forest: #7BA587;
  --forest-light: #A8C9AE;
  --forest-bg: #EEF4EF;
  --wood: #C4A882;
  --wood-light: #DDCFB8;
  --wood-bg: #F8F3EB;
  --amber-glow: #E8B44F;
  --amber-light: #F5DFA0;
  --lake: #6BA3BE;
  --border: 2px;
  --radius: 16px;
}
```

## Page Specs

### Home: 日记本的第一页
- Signature composition: 3px粗边框发布卡片 + 2px边框帖子卡片
- Heavy interaction: none (product app)
- Atmosphere: 微黄纸色背景 + 粗边框卡片层叠
- Typography: 14px 正文, 11px 日期标签

### Timeline: 森林小径
- Signature composition: 3px森林绿竖线 + 纯色圆点 + 2px边框卡片
- Pet distinction: 每只宠物用不同色系圆点（森林绿/暖木棕/湖蓝/琥珀金/墨灰）
- Atmosphere: 绿色系色块

### AIInsights: 灵力光晕
- Signature composition: 琥珀金 glow 健康报告卡 + 大号数字
- Only one glow on page (健康报告卡)
- Atmosphere: 暖金 accent，其余宣纸底

### Profile: 家庭照片墙
- Signature composition: 3px粗边框宠物头像（相框感）+ 粗体名字
- 宠物标签用纯色扁平色块
- Atmosphere: 暖木棕调

### Login: 故事书扉页
- Signature composition: 120px 4px边框圆形 Logo + 大量留白
- 垂直居中，上下留白
- Atmosphere: 最纯粹的宣纸底 + 墨色文字

## Shared System
- Navigation: 底部 Tab, 2px 上边框, 选中态用粗 underline + 对应色圆点
- Cards: border-2, rounded-[16px], bg-surface, 间距 16-20px
- Buttons: rounded-[20px], border-2, 纯色背景（无渐变）
- Inputs: border-2, rounded-[16px], bg-white
- Tags/Badges: 纯色 bg + 同色系文字, border-2
