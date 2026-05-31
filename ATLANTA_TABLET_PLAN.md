# Atlanta Pure Land — Custom Tablet Layout Plan / 亚特兰大道场专属牌位排版方案

> Status: **Planning + mockups only.** This year's deliverable is (1) this plan doc and
> (2) standalone HTML mockups for the temple to review — **no production code changes yet.**
> This doc is the blueprint for the eventual real implementation.

---

## Context / 背景（为什么做）

亚特兰大净宗学会（`temples.id = 1`, `image_style = 'bw'`）希望牌位排版用一套**自己的风格**，
其他道场（如靈山美佛寺 `id = 2`）保持现状。当前系统所有牌位模板 **100% 共用**，无任何 per-temple 分支。

道场核心痛点（来自 `Tablet FINAL LAYOUT - Atlanta Pureland` deck, 19 页）：

1. **固定字太小**——「佛光注照」「長生祿位」「佛力超薦」等目前**焊死在 SVG 里**（轮廓路径），
   大小/位置都是死的，挤压了用户名字的填写空间，且无法放大。
2. **根因解法**：把固定字**从 SVG 拿出来、改成 real-time 渲染**，让固定字 + 动态名字
   由同一引擎**统一排版、互相让位**。
3. 英文 / 越南文名字要**横排**（现在是旋转 90° 竖排）；太长堆多行、长单词带连字符断行。
4. 中间名字 / 称谓太长 → 中文分列、Latin 文换行。

**最硬性的约束**：绝不能影响其他道场——"如果影响到其他道场，大家都没得用"。这是架构第一原则。

---

## Target Architecture / 目标架构（真实实现的蓝本）

### 原则一：命名 variant + 默认路径逐字节不变

- `temples` 表加 `template_variant TEXT NOT NULL DEFAULT 'default'`；亚特兰大设 `'atlanta'`。
- 现有 6 个配置**原封不动**作为 `default` variant；亚特兰大作为**独立 registry 条目**。
- 解析改成 `getTemplateConfig(templateId, variant = 'default')`——带默认值参数，O(1) 查表，不增成本。
- **绝不写散落的 `if (temple === 'atlanta')`**；所有分歧收敛进 `lib/templates/atlanta/` 独立文件。

### 为什么对其他道场零性能 / 零回归影响

1. **O(1) 查表**——加默认参数不改变非 Atlanta 的代码路径。
2. **默认输出可证明逐字节不变**——default 配置不动，回归风险为零。
3. **Edge 渲染无状态、按请求**——Atlanta 请求才加载 `atlanta/*` 素材，其他道场零额外读取、无打包膨胀。
4. **零额外 DB 查询**——variant 从 apply 页本就 load 的 temple 派生（`app/apply/[slug]/page.tsx`）。
5. **管道已现成**——`temple.image_style` 已走通"道场属性 → `style` 参数 → OG URL"
   （`components/apply/TabletFormStep.tsx:177,445`），variant 照抄加 `&variant=`。

### 原则二：背景"去文字化" + 所有文字皆 config 元素

| | default（现状） | atlanta（新） |
|---|---|---|
| 背景 SVG | 固定字焊死在里面 | **纯装饰边框**（顶华盖 + 两侧卍纹 + 底莲花，6 种共用，**无任何文字**）|
| 文字 | 引擎只叠 1~2 个动态名字 | **所有文字 real-time 渲染** |

**所有文字** = 顶/底固定字（佛光注照、長生祿位…）
+ **左侧标签（陽上 / 稱謂 / 敬薦 / 叩薦 / 父 / 母）**
+ 中间动态主体 + 左侧动态阳上者名。
左侧标签和顶/底固定字一样，写死内容、real-time 渲染，**没有一个字焊在 SVG 里** → 左侧布局也能随风格调整。

**数据模型**：扩展 `ActiveArea`，新增 `purpose: 'fixed'` + `content: string`：
- `fixed` 元素：渲染写死的字符串，有自己的 `x/y/width/height/fontSize`
  → **想多大就多大、放哪就放哪**，这就是"放大固定字 + 左侧标签自由排"的实现。
- `honoree` / `petitioner` 元素：照旧拉用户输入。
- 渲染循环（`app/api/og/tablet/route.tsx:331`）只加一个分支 `fixed → area.content`，
  其余渲染原语（`renderVerticalText` / `calculateFontSize`）全部复用。
- **default 配置不含 `fixed` 元素 → 其他道场行为不变。**

### 中间主体的两套排版规则

| | 中文 | 英文 / 越南文 |
|---|---|---|
| 方向 | 竖排（逐字，右→左）| **横排堆行，居中（新模式，需新写）** |
| 短 | 单列 | 1 词/行 |
| 长 | 分两列 | 多行；长单词带连字符断行（`Grand-Mother`，slide 10）|
| 语义单元 | `闔家`单独成列；称谓(`祖父`/`姑父`/`曾祖父`)单独成列且可缩小；4 字姓氏(`愛新覺羅`)排 **2×2**(slide 13) | 称谓(`Mother`/`Father`)单独成行；`and family` 接后面 |
| 超长兜底 | 缩小字号 fit in | 缩小字号 fit in |

> 唯一需要新写的渲染逻辑：**横排堆行模式**（不旋转、flex column、每行居中、长词 hyphenate），
> 封装成独立函数按 variant 选择。现有英文分支是整体 `rotate(90deg)`，保留给 default。

### 各牌位固定字内容 + 调参（数据驱动，每种独立可调）

| 牌位 | 顶固定字 | 底固定字 | 左侧标签 | 固定字尺寸 |
|---|---|---|---|---|
| 長生祿位 longevity | 佛光注照 | 長生祿位 | 无 | 放大 |
| 往生蓮位 deceased | 佛力超薦 | 往生蓮位 | 陽上 / 稱謂 / 敬薦 | 放大 |
| 祖先 ancestors | 佛力超薦 | 氏歷代祖先往生蓮位 | 陽上 / 叩薦 | **缩小**（腾空间，slide 12，30% 起）|
| 冤親債主 karmic | 佛力超薦累劫冤親債主往生蓮位（整串，无动态主体）| — | 陽上 / 敬薦 | 放大；最简单 |
| 嬰靈 aborted-spirits | 佛力超薦 | 往生蓮位 | 陽上 / 父 / 母 / 敬薦 | 放大 |
| 地基主 land-deity | 佛力超薦 | 往生蓮位 | 陽上 / 稱謂 / 敬薦 | 放大；地址保留 `之地基主` 后缀（slide 19 底字是占位）|

### 打印分辨率

用途**以打印为主** → 整画布按倍数渲染（建议 2x/3x，如 960×2544）。
文字全部 real-time（矢量字 → 高分辨率位图）保证清晰；装饰边框保留 SVG（矢量、放大不糊）。

---

## Font & Rendering Strategy / 字体与渲染策略（已决定）

### 渲染位置：保持服务器端（流程不变）

图片由**服务器端** Vercel OG (`app/api/og/tablet/route.tsx`) 渲染。浏览器只负责：发起请求 →
预览 → **用户确认 → 把同一张 PNG blob 上传 Supabase**（`components/apply/TabletFormStep.tsx`）。
"预览 = 最终保存的图" 这条性质保留（上传的就是预览那张）。**这条 customer 预览/确认/上传链在本次改动中完全不变。**

### 字体覆盖：废除人工子集，改用「动态子集」(Option B)

**痛点**：现有 production 用人工精选的 **723 字繁体子集**（`public/fonts/NotoSerifTC-Subset.otf`）。
英文 / 越南文 / 生僻字不在子集里就缺字，需要**不断手动补字**——长期维护负担。

**决定（Option B，动态子集）——彻底取消人工子集维护：**
- 服务器端放**完整字体**：完整 Noto Serif TC（覆盖全部中文）+ 一个**完整拉丁/越南文衬线**字体
  （体积小、彻底覆盖英文 + 越南文声调字符）。
- 每次渲染**只从完整字体抽取本牌位文字用到的那十几个字形**（`subset-font` / fontkit），
  把这个极小的子集喂给 @vercel/og。
- 路由从 `edge` 改 **Node runtime**（subset 库 + 较大字体文件需要）；完整字体在模块作用域缓存
  （warm 容器只加载一次）。
- 效果：**任何字符都自动包含**（永不再手动补字）+ 每次字体极小 → 预览快、内存稳。

**繁体转换保留**：渲染前用 opencc（`lib/chinese-converter-client.ts` 的 `convertToTraditional`）
把用户输入（简或繁）**统一转成繁体**再渲染。因此**字体中文侧只需覆盖繁体**，无需简体 → 覆盖面更小。

**否决的其他选项**：
- **A 完整字体直接渲染**——免维护，但完整字体每次冷启动加载 ~10MB，预览慢、内存偏重。
- **C headless Chromium**——保真最高（=这套 HTML），但基建最重、冷启动最慢，与"省事"相悖。
- **D 浏览器端渲染**——渲染需保持服务器端（保留现有 OG 链），排除。

### 字体改动涉及的文件（实现阶段）

| 动作 | 文件 |
|---|---|
| 路由 edge→Node + 每请求动态子集 | `app/api/og/tablet/route.tsx` |
| 放完整 TC 字体 + 完整拉丁/越南文字体 | `public/fonts/`（替换 `NotoSerifTC-Subset.otf` 的用法）|
| 加子集依赖 | `subset-font`（或 fontkit）|

---

## This Year: Mockups (no production code) / 今年：做样板（不改代码）

- **做法**：新建独立目录 `prototypes/atlanta/`，做 standalone HTML 原型，
  用**无文字的装饰边框 SVG**当背景 + flexbox 排版，**完全不碰 `app/` `lib/` `components/`**。
- 线上渲染器（Vercel OG / Satori）本身就是 flexbox → 原型**既给道场看、又是真实实现的精确蓝本**。
- 每种牌位 × 每种 case（2字/3字/4字/闔家/英文/越南文…）一屏，方便截图给道场、实时迭代调参。
- **从長生祿位开始。**
- 样板定稿 → 道场签字 = FINAL → 才进入真实代码实现。

### 样板 = 实现的视觉目标（Reference Mockups）

> **这些 standalone HTML 样板就是将来 production 实现要还原的"标准答案"。**
> 每做一种牌位，先以对应 mockup 为视觉目标，production 渲染（Vercel OG）的输出应与之一致。
> 查看：浏览器直接打开对应 HTML（`file://…/prototypes/atlanta/<type>.html`）。
> 公共装饰边框：`prototypes/atlanta/frame-blank.svg`（道场提供的无文字版，6 种复用）。

**✅ 已完成并验证**

**1. 長生祿位** — `prototypes/atlanta/longevity.html`
- 验证点：固定字放大、`闔家`单独成列、长名自动缩小、英文/越南文**横排堆行**、名字 **≤ 固定字**、不压两侧卍纹
- 定稿参数：
  - 中间竖带 x **80–240**（收窄到卍纹净空内，居中 x=160）、y **195–716**
  - 固定字 `佛光注照`/`長生祿位` **38px**；名字默认 38px 且**代码硬性约束 ≤ 固定字**（永不超过固定字）
  - 横排 Latin：按宽度缩放 + 8px 内边距确保不碰卍纹；家属后缀渲染成 **`& family`**（比 `and family` 短、`&` 两侧留空格）合并一行
  - 标签（caption）强制单行，避免撑乱排版

**2. 冤親債主** — `prototypes/atlanta/karmic-creditors.html`
- 验证点：整串固定字**均匀同字号**、居中；左区位于**卍纹外侧左边距**（不是 center 左边）；左区统一字号
- 定稿参数：
  - 中区 `佛力超薦累劫冤親債主往生蓮位` 单列、**均匀 36px**、居中 x **160**、top y≈198（须清开莲花）
  - 左区（唯一动态：阳上者名）x **30**（卍纹外侧窄条）、`陽上 / 名 / 敬薦` **全部 20px**（中文竖排 / 英文旋转 90°）

**3. 往生蓮位** — `prototypes/atlanta/deceased.html`
- 验证点：中区三段（`佛力超薦` / 称谓+名字[**动态**] / `往生蓮位`），**称谓单独成列**（右先读、名字在左、长名分列）；英文/越南文横排堆行；越南文用**真实称谓**（Mẹ / Bà nội / Ông ngoại）；左区阳上者**按语言匹配**（中文 稱謂+名竖排；英/越 关系+名旋转竖排）
- 定稿参数：中区同長生祿位（band x80–240 / y195–716，固定字 38、中间 ≤ 固定字）；左区 x **30**、字号 **20**

**左区通用规则（所有带左侧阳上者栏的牌位：往生蓮位 / 冤親債主 / 祖先 / 嬰靈 / 地基主）**
- `敬薦` **底部对齐 y=716**（与中区底部 / 莲花中心同高）→ 左区是**完整高度**，长称谓（如 `Great granddaughter…`）不会被挤小
- `陽上` 居顶、`敬薦` 居底，中间的阳上者（中文 稱謂+名 / 英越 关系+名）**垂直居中**在两者之间

**⬜ 待做**（按同一方法，内容以 deck 19 页为依据，逐个调试定稿）
- **4. 祖先**：中间 `[姓]氏歷代祖先往生蓮位`，姓 1/2 字单列、`愛新覺羅` 排 2×2；固定字**缩小**腾空间
- **5. 嬰靈**：中间嬰靈描述（长则分列）+ 左侧 `陽上 / 父 / 母 / 敬薦`
- **6. 地基主**：中间地址（中文竖排多列 / 英文横排多行）+ `之地基主` 后缀 + 左侧 `陽上/稱謂/敬薦`

---

## Real Implementation (later) — files to touch / 真实实现阶段要改的文件（后续）

| 动作 | 文件 |
|---|---|
| 加 variant 字段 | 新 migration（`supabase/migrations/`），`temples.template_variant` |
| 解析加 variant 参数 | `lib/active-areas-config.ts` 的 `getTemplateConfig(templateId, variant)` |
| Atlanta 配置（含 fixed 元素 + 调参）| 新建 `lib/templates/atlanta/active-areas-config.ts` |
| 素材解析（按 variant 选边框）| `app/api/og/tablet/route.tsx` svgFilename 映射抽成 resolver |
| `fixed` 元素渲染 + 横排堆行模式 | `app/api/og/tablet/route.tsx`（加 `renderHorizontalStacked`）|
| variant 透传 | `app/apply/[slug]/page.tsx` → `TabletFormStep.tsx`(174/442 加 `&variant=`) → admin 导出/PDF 重生成路径 |
| Atlanta 装饰边框素材 | `public/templates/atlanta/*.svg`（去文字版）|

**安全网**：variant 处处默认 `'default'`；任一调用点漏传 → 安全回落到共用模板
（对非 Atlanta 道场仍正确，只有 Atlanta 渲染会明显出错、易发现），不会静默污染其他道场。

---

## Verification / 验证

**样板阶段**：浏览器打开 HTML 原型逐屏检查；和 deck 19 页比对；截图给道场。

**真实实现阶段（后续）**：
1. `npm run dev`，访问 `/api/og/tablet?type=longevity&variant=atlanta&name=...` 看 Atlanta 输出。
2. **回归**：同 URL 不带 `variant`（或 `variant=default`），确认输出与改动前**逐字节/逐像素一致** → 证明零影响。
3. 6 种牌位 × 中文/英文 × 含/不含家属，逐一比对 deck。
4. 打印测试：高 DPI 实打一张，确认不糊。

---

## Open Items / 未定项（样板迭代中收敛）

- **越南文**：暂不考虑（架构留口，本次不实现）。
- **长称谓**：变小 fit in 即可（自动缩放）。
- **分列阈值**（"超过6字"按字数还是按是否塞得下）：每种牌位实测调参定稿。
- **祖先固定字缩小幅度**：30% 起，样板上调。
- 需求约 80% 齐全，剩余在样板上和道场对齐后锁定（FINAL，不再反复）。
