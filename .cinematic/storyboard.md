# Director's Treatment — 罗小黑战记 × Pet Record

## Director Brief

- **Visual thesis**: 像翻阅一本手绘宠物日记 — 粗线描边的卡片像插画框，宣纸底色像故事书的纸页，每只宠物是书中的一个角色
- **Signature technique 1**: 粗线围合 — 卡片/按钮用 2px 圆角边框包围，像 MTJJ 的人物描边
- **Signature technique 2**: 扁平大色块 — 不用渐变，纯色背景层叠，像动画中的色块背景
- **Signature technique 3**: 中式不对称留白 — 卡片不对齐堆叠，留一侧呼吸空间，像国画构图
- **Motion rules**: 150-250ms ease-out，像动画中的缓起缓停。入场用 scale+opacity（像角色登场），不用 translateY 滑动
- **Typography rules**: 中文圆体/卡通体基调（呼应萌系画风），数字用等宽字体

## Site Cinematic Grammar

- **Page-shell logic**: 宣纸底 + 粗框卡片层叠。背景不是纯白 — 是微黄的"纸"的质感
- **Navigation posture**: 底部 Tab 像书签，选中态用粗下划线 + 彩色圆点（像小黑耳朵）
- **Framing discipline**: 所有内容块用 2px `border-2` 围合，圆角 16-20px（大圆角 = 萌系）
- **Density cadence**: 卡片间距大（16-20px gap），每个卡片有呼吸空间
- **Recurring material layers**: 微纸纹理背景、粗边框卡片、扁平色块 accent
- **Allowed composition families**: storybook-panel, asymmetric-two-column, full-bleed-hero-with-frame
- **What may repeat**: 粗边框卡片、圆角按钮、留白节奏、色块标签
- **What must vary page to page**: 主导色彩（每页有自己的色调倾向）、卡片形状节奏
- **Demo uniqueness guardrail**: 不出现纯白背景、不出现细边框卡片、不出现渐变按钮

## Page Arc

### Page 1: Home（首页）

- **Page-role scene**: 日记本的第一页 — 暖木棕调，像翻开一本旧日记
- **Page scene thesis**: 发布框像"新的一页"，帖子卡片像日记条目，每条有手写温度
- **One big idea**: 发帖区域用粗边框 + 纸质感，像在纸上写字
- **Hero dominance statement**: 发布框用最粗的边框（3px）和最大的圆角（20px），是整个页面最重的视觉锚点
- **Restraint statement**: 不用任何渐变，不用阴影 lift 效果。用边框粗细区分层级
- **Material thesis**: 背景微黄纸色，卡片比背景略白，形成"纸上贴纸"的层次
- **Typography thesis**: 帖子正文用 14px 略圆润字体，日期标签用小号手写感字体
- **Narrative arc**: 发布入口 → 信息流列表（像翻日记页）
- **Hero archetype**: Writer's desk — 桌面上的日记本
- **Signature composition**: 发布卡片用 3px border-2 + rounded-[20px] + bg-amber-50，像一张从日记本撕下来的纸
- **Grid fallback test**: 如果变成普通卡片列表，会失去"手写日记"的温度感和粗边框的辨识度
- **Shared system holdback**: 卡片组件等所有页面 scene 确定后再统一
- **UI exposure guardrail**: 不出现细线分隔、纯白背景、渐变按钮

### Page 2: Timeline（大事年表）

- **Page-role scene**: 森林中的小路 — 绿调，时间线像林间小径
- **Page scene thesis**: 竖线像树枝，事件卡片像挂在枝头的叶子/果实
- **One big idea**: 时间线用森林绿粗线，每张卡片用不同深浅的绿色左边框区分
- **Hero dominance statement**: 月份标头像森林路标，粗体中文 + 长横线分隔
- **Restraint statement**: 不用彩色渐变圆点，用扁平纯色圆点
- **Material thesis**: 绿色系的色块层叠，像森林的层次感
- **Typography thesis**: 日期用小号墨灰色，事件标题用森林绿粗体
- **Narrative arc**: 月份标识 → 事件线（从过去到现在）
- **Hero archetype**: Forest path — 森林小径，沿途有标记
- **Signature composition**: 竖线用 3px 粗的森林绿，圆点用纯色 12px 圆
- **Grid fallback test**: 如果变成普通时间线，失去"森林漫步"的空间感

### Page 3: AIInsights（AI看板）

- **Page-role scene**: 灵力光晕 — 金色暖调，像动画中的灵力/妖力显现
- **Page scene thesis**: 数据卡片像灵力符文，倒计时像灵力倒计时
- **One big idea**: 用琥珀金作为唯一高饱和 accent，其他地方用低饱和自然色，制造"灵力显现"的对比
- **Hero dominance statement**: 30天健康报告卡片用暖金边框 + 微光晕（box-shadow amber），是唯一的"发光"元素
- **Restraint statement**: 只在一个卡片上使用发光效果。其他卡片保持扁平
- **Material thesis**: 暖金 accent 像烛光/灵力，宣纸底保持安静
- **Typography thesis**: 数字用大号等宽字体（像计时器），标签用小写圆体
- **Narrative arc**: 健康概览 → 护理倒计时 → 免责声明
- **Hero archetype**: Mystic shrine — 灵力祭坛，有一处发光
- **Signature composition**: 倒计时数字最大、最粗，像灵力值显示
- **Grid fallback test**: 如果变成普通 Dashboard，失去"灵力符文"的独特氛围

### Page 4: Profile（我的）

- **Page-role scene**: 家的角落 — 暖木棕 + 石板灰，像宠物的小窝
- **Page scene thesis**: 宠物卡片像贴在墙上的照片，每个宠物有自己的相框
- **One big idea**: 宠物头像用粗圆角相框 + 粗边框（像拍立得），名字用大号粗体
- **Hero dominance statement**: 宠物头像框是整个页面最大的圆形元素，3px 粗边框
- **Restraint statement**: 不用渐变色标签，用纯色扁平标签
- **Material thesis**: 木色卡片 + 石板灰背景，像家里的木桌和石墙
- **Typography thesis**: 宠物名用 display 大粗体，年龄/品种用小号标签
- **Narrative arc**: 宠物展示 → 家庭共享 → 设置
- **Hero archetype**: Family photo wall — 家庭照片墙
- **Signature composition**: 宠物卡片左右布局：大圆角头像（左）+ 信息栈（右）
- **Grid fallback test**: 如果变成普通列表，失去"相框"的温暖感

### Page 5: Login（登录）

- **Page-role scene**: 故事书的扉页 — 最像国画的一页
- **Page scene thesis**: 大标题 + 大面积留白 + 一个圆形 logo（像印章）
- **One big idea**: Logo 区域用最大的圆 + 最粗的边框，像中国传统印章
- **Hero dominance statement**: Logo 圆是整页视觉重心，120px 直径 + 4px 边框
- **Restraint statement**: 不用背景图、不用渐变、不用玻璃效果
- **Material thesis**: 纯粹的宣纸背景，深墨色文字
- **Typography thesis**: App 名字用最大号 bold，副标题用墨灰色小字留白
- **Narrative arc**: Logo → 输入 → 进入
- **Hero archetype**: Book cover — 书的封面
- **Signature composition**: 垂直居中布局，Logo 在上，输入框在下，大量上下留白
- **Grid fallback test**: 如果变成普通登录页，失去"翻开一本书"的仪式感
