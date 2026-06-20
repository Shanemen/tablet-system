# Atlanta 牌位变体 — 实施蓝图 v2.1（GO，含 5 项复审修正）

> 本文是 production 实现的执行依据。由 ultracode 多 agent 流程产出：recon → 设计 → 对抗审查（NO-GO）→ 修正设计 → 对抗复审。
> 所有声明已对照真实 `file:line` 验证。代码/标识符/路径用英文，说明用中文。
> 分支：`atlanta-tablet-variant`。**铁律：默认道场（temple ≠ atlanta）渲染产物逐像素不变。**

---

## 0. 复审定稿的 5 项修正（v2 → v2.1）

对抗复审给出 NO-GO，原因是 v2 有 1 个数值错误 + 4 个精度遗漏。已全部折叠进下文，并在此列明：

1. **祖先统一字号公式底字长度 8 → 9。** `氏歷代祖先往生蓮位` 是 **9 字**（已 `len()` 核实）。
   公式必须 `= max(14, min(32, (521-24) / (fixedTop.length + surname.length + fixedBottom.length)))`，
   **从真实配置字符串 `.length` 计算，绝不硬编码 8 或 9**。4 字姓正确值 ≈ 29.24（非 31.06）。
   评估 golden 同步改为按此公式算。
2. **`shouldKeepTogether` 需 `export`**（`lib/active-areas-config.ts:668` 当前私有）。加 export 是纯增量、零回归。
   且它只负责"数字+单位相邻"判断；land-deity 真正的换行是 `addressBlock` 的**按实际宽度打包**
   （`lineWidth`: CJK=fs / 空格=fs*0.3 / Latin=fs*0.56；32→12 逐 px 缩；`fits = lines*fs*1.28<=midH && maxLineWidth<=midW-14`）。必须忠实移植，不能只说"复用 shouldKeepTogether"。
3. **`TempleInfo` 加字段**（`lib/types/temple.ts:31` 当前只有 `image_style`，已核实）：
   `template_variant?: 'default' | 'atlanta'`。否则 `tsc --noEmit` 门会报错。
4. **冤親債主独立布局**：它是**单列固定串**（`佛力超薦累劫冤親債主往生蓮位` 14 字，x=160 / top=198 / size=32 / weight=500），
   **不走三区 band 模型**。字符串存专用 `centerString` 字段，用独立 `layoutKarmicCenter`，避免被 band 数学误定位。
5. **回归 golden 每步重抓**：`diff===0` 只在同一步骤的前后配对成立。Step 8 换字体/runtime 前，
   先对当前 edge+字体重抓 golden，使 Step 8 的 diff 只度量 runtime/子集化本身的变化。

**只信 `:root` 变量与 `CFG`/`makeTablet` 代码，不信样板里的过时注释**
（嬰靈注释写 36 实际 `--fixed-size:32`；land-deity 注释写底字 `之地基主往生蓮位`，实际 `CFG.fixedBottom='往生蓮位'`、`之地基主` 属横排地址块）。

---

## 1. 架构总览

- DB：`temples.template_variant TEXT NOT NULL DEFAULT 'default'`；atlanta 道场（id=1）设 `'atlanta'`。
- 变体沿用 `image_style` 的现成管道流入：`ceremony.temple.template_variant` → `TabletFormStep` prop → URL 门控参数。
- 渲染：atlanta 走**独立渲染路径**（route.tsx 顶部 `if(variant==='atlanta') return renderAtlantaTablet(...)`，在默认逻辑之前 return）。
  默认逻辑整段不动 → 零回归。**不改 `getTemplateConfig` 签名**（复审确认其单参签名即可，atlanta 不经它）。
- SVG：**6 型共用一张纯装饰花纹**（`prototypes/atlanta/frame-blank.svg` → `public/templates/atlanta/frame.svg`）。
- 颜色：**atlanta 仅 bw**（红/黄纸打印）。白卡片 + 深色花纹原样渲染，无需 recolor。
- 字体：Option B 动态 per-request 子集化 + runtime edge→nodejs，**隔离到最后一步**，先实测漂移再定容差。

---

## A. 数据传输方案（resolves 数据模型 gap）

### A.1 变体流入
- `app/apply/[slug]/page.tsx:294-298`：在 `imageStyle=...` 旁加
  `templateVariant={ceremony?.temple?.template_variant || 'default'}`。
- `TabletFormStep.tsx:31-43`：props 接口加 `templateVariant?: string`（默认 `'default'`）。
- `lib/types/temple.ts:31`：`TempleInfo` 加 `template_variant?: 'default' | 'atlanta'`（修正 #3）。
- 默认道场 `'default'` → 完全走现有路径，URL 字节不变。

### A.2 变体门控的新参数（仅 `variant==='atlanta'` 附加）
URL 构建两处：`handleConfirm`（`TabletFormStep.tsx:174-180`）与 previewing 块（`:442-448`）。
两处都加 `if (templateVariant === 'atlanta') await appendAtlantaParams(apiUrl, tabletType, formData)`。
**所有新增 `searchParams.set` 都在 if 内** → 默认 URL 逐字节不变。

`appendAtlantaParams`（async，逐字段 `convertToTraditional`，不拼接）：

| type | atlanta 新增 params | 来自 formData（已核实存在于 `lib/tablet-types-config.ts`）|
|---|---|---|
| longevity | `family`(可选) | `is_family`(:73) ；`name`(:66/89) raw 不 glue 闔家 |
| deceased | `title`,`pet_title`,`pet_name` | `deceased_title`(:96)/`petitioner_title`(:110)/`petitioner_name`(:103)；`name`=亡者名，不前置 title |
| ancestors | `surname`,`descendant` | `surname`(:128)/`descendant_name`(:136) |
| karmic-creditors | 无 | 现有 `name`+`applicant` 足够 |
| aborted-spirits | `father`,`mother` | `father_name`(:184)/`mother_name`(:191)；`name`=嬰靈描述 |
| land-deity | `address`,`applicant_name` | `address`(:209)/`applicant_name`(:217) |

### A.3 繁体转换 + cart 文案
- 新参数逐字段 `await convertToTraditional(...)`（不拼接）。**注意**：previewing 块在 render 路径上，
  繁转/拼参数必须放在 **async preview handler** 里（memoize），不能每次 re-render 同步触发（残留风险）。
- cart displayText：加纯函数 `getAtlantaDisplayText(type, fd)`（`lib/atlanta/display.ts`），
  `variant==='atlanta'` 时替代。**`getPreviewText`/`getPetitionerText` 本体一字不改**（默认 UI/cart 依赖）。

---

## B. Atlanta 渲染引擎（resolves 渲染常量不符）

不复用 `renderVerticalText`/`calculateFontSize`（gap=0.3、weight=400、CJK 计数判定全不符）。
新建 `lib/atlanta/` 模块：纯函数布局（可单测）+ 独立渲染。

### B.1 共享常量（`lib/atlanta/constants.ts`，源自各 html `:root`）
```ts
export const BAND = { x: 80, width: 160, top: 195, bottom: 716 } // bandH = 521
export const FIXED_SIZE = 32          // --fixed-size 全 6 型
export const FIXED_WEIGHT = 500       // --fixed-weight 全 6 型
export const INK = '#2b2620'
export const LEFT = { x: 30, size: 20, yangTop: 215, jianTop: 676, gap: 8 } // jianTop=716-2*20
export function isLatin(s: string): boolean { return /[A-Za-z]/.test(s) } // 非 isEnglishText 计数法
```

### B.2 per-type 配置（`lib/atlanta/config.ts`）
每型：`fixedTop`/`fixedBottom`/`gapFixedName`/`midMin`/`colGap`/`cnTwoColThreshold?`/`colMax?`/`yang`/`jian`/`layout`。
- longevity: 佛光注照 / 長生祿位；gap14；colGap **0.25**；threshold 6；无左栏
- deceased: 佛力超薦 / 往生蓮位；gap14；colGap **0.28**；左栏 陽上/敬薦
- ancestors: 佛力超薦 / **氏歷代祖先往生蓮位（9字）**；gap **12**；左栏 陽上/**叩薦**
- aborted-spirits: 佛力超薦 / 往生蓮位；gap14；colGap0.28；**colMax 6**；左栏 陽上/敬薦
- land-deity: 佛力超薦 / 往生蓮位；gap14；左栏 陽上/敬薦；后缀 `之地基主` 由地址块拥有
- karmic-creditors: **专用 `centerString='佛力超薦累劫冤親債主往生蓮位'`**（修正 #4），不走 band

### B.3 纯布局函数（`lib/atlanta/layout.ts`，返回坐标/字号/列，无 JSX）
共用三角公式：`bandH=521; topH=fixedTop.length*fixedSize; botH=fixedBottom.length*fixedSize;
nameTop=topH+gap; nameBottom=botH+gap; midH=bandH-nameTop-nameBottom; midW=160`。

- `layoutLongevityCenter(name, family)`：`chineseColumns`（闔家剥离→末列即最左；base>6 二等分）；
  CN `fs=max(18,min(32,midH/maxColLen,midW/(cols+(cols-1)*0.25)))`，列距 `fs*0.25`；
  Latin `latinLines`（每词一行，`& family` 合并）。**family 由参数控制，renderer 拼 `name+'闔家'`，不在 URL glue。**
- `layoutDeceasedCenter(title, name)`：**恰 2 列 [title,name]**，title 右先读，**name 永不拆**；
  `fs=max(16,min(32,midH/maxLen,midW/(2+0.28)))`；列距 `fs*0.28`。
- `layoutAncestorsCenter(surname)`（**修正 #1**）：
  `centerSize = max(14, min(32, (BAND.bottom-BAND.top-24) / (cfg.fixedTop.length + surname.length + cfg.fixedBottom.length)))`
  —— 从真实字符串 `.length` 算（fixedTop=4, fixedBottom=**9**）。**surname 永远 1 列**，字号=centerSize；
  该 centerSize 同时设 佛力超薦/氏歷代祖先往生蓮位 的 font-size（整中区统一缩放）。
  自检：`layoutAncestorsCenter('龍').centerSize===32`；`愛新覺羅`≈29.24。
- `layoutAbortedCenter(desc)`：`descCols` 每 6 字一列 fill-then-overflow；`fs=max(16,min(32,midH/maxLen,midW/(cols+(cols-1)*0.28)))`。
- `layoutKarmicCenter()`（**修正 #4**）：单列固定串，x=160, top=198, size=32, weight=500，**忽略 BAND/gap**。
- `layoutLeftMargin(petT, petN, jianLabel)`：陽上@(30,215,20)/jian@(30,676,20)；
  zoneTop=215+40+8, zoneBottom=668, 居中 zoneCenter；CN 两竖组 innerGap6（aborted 父/母 innerGap12）；
  land-deity 仅 name 无前缀；Latin 单行 rotate(90)，`fs=max(8,min(20,span/(len*0.55)))`。
- `layoutAddressBlock(addr, '之地基主', midH, midW)`（**修正 #2**，忠实移植 land-deity.html:86-140）：
  `lineWidth`(CJK=fs/空格=fs*0.3/Latin=fs*0.56)；CN 用 `shouldKeepTogether`（需 export）保数字+单位与 `之地基主` 不拆；
  Latin 按词+suffix 尾 token 按真实宽度 pack；shrink：fs 从 32 起 `while(!fits && fs>12) fs--`；
  `fits = lines*fs*1.28<=midH && max(lineWidth)<=midW-14`。**`之地基主` 在此拼接，且仅此一次。**

### B.4 渲染入口 + weight 500（`lib/atlanta/render.tsx`）
- route.tsx 顶部：`if(searchParams.get('variant')==='atlanta') return renderAtlantaTablet(request, type, searchParams)`
  —— 在默认逻辑**之前** return，默认整段不动。**atlanta 永不到达 `route.tsx:339` 的 `${name}之地基主`**（resolves 双拼）。
- `ImageResponse.fonts` 注册 **400 + 500 两个 weight 字面**（否则 satori 回退 400）。
  过渡期（Step 8 前）可用同一 subset 注册两次；真正 500 字面随 Step 8 子集化引入
  （残留风险：fonts[] 含 500 是必要非充分，真 500 视觉要 Step 8 后才可验）。

---

## C. bw + 共用花纹
- `prototypes/atlanta/frame-blank.svg`（320×848，card `fill="white"`，motif `fill="#3C362E"`）
  → `npx svgo` 压缩（当前 500KB）→ `public/templates/atlanta/frame.svg`。
- `resolveSvg`：atlanta 全 6 型返回同一 `/templates/atlanta/frame.svg`。
- bw 强制：atlanta 分支 `bgColor='#ffffff'`，**不调用 recolor 行**，SVG 原样渲染。

---

## D. 评估 / 质量门
工具（新增 devDep，先 `npm install`）：`vitest`、`pngjs`（解码 PNG）、`pixelmatch`。
scripts：`"test":"vitest run"`、`"typecheck":"tsc --noEmit"`（因 `next.config.mjs:9-11 ignoreBuildErrors:true`，build 不查类型）。

### D.1 回归门（默认道场逐像素不变，Step 1-7 每步跑）
```ts
import { PNG } from 'pngjs'; import pixelmatch from 'pixelmatch'
const a = PNG.sync.read(Buffer.from(await respA.arrayBuffer()))  // DECODE 成 RGBA（修正过的关键）
const b = PNG.sync.read(Buffer.from(await respB.arrayBuffer()))
expect(a.width).toBe(b.width); expect(a.height).toBe(b.height)
expect(pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0 })).toBe(0)
```
- 路由 edge + `fetch(origin/...)` → 起 `next dev` 实服，node `fetch` 打 URL 抓 PNG。
- golden：改动前对 6 型 × 2 style × 若干名字抓 PNG 存盘；**每步重抓 diff===0**（修正 #5：golden 每步配对）。
- 另：`expect(getTemplateConfig('longevity')).toBe(LONGEVITY_TEMPLATE_CONFIG)`（config 层不变的有效断言）。

### D.2 Atlanta 保真（对布局函数输出结构断言 + 1 个集成渲染）
- gap：longevity 0.25；deceased/aborted 0.28。
- weight：`FIXED_WEIGHT===500` 且 `renderAtlantaTablet` 的 `fonts[]` 含一项 `weight===500`。
- deceased：`layoutDeceasedCenter('先父','歐陽蘭君').cols.length===2 && cols[1]==='歐陽蘭君'`（不拆）。
- ancestors（**修正 #1**）：`layoutAncestorsCenter('愛新覺羅').centerSize` ≈ `(521-24)/(4+4+9)`≈29.24 且 **`<=32`（非 ===32）**；`'龍'→32`；列数===1。
- aborted：`descCols('王氏二位嬰靈菩薩')→['王氏二位嬰靈','菩薩']`。
- karmic（**修正 #4**）：`layoutKarmicCenter().top===198 && size===32`（非 band 派生）。
- land-deity（**修正 #2**）：地址块所有行 join 后 `之地基主` 恰 1 次；`'1009號'` 不跨行；长「深圳」地址触发 32→12 缩。
- longevity：`chineseColumns('張三闔家')` 末元素==='闔家'。
- **集成渲染**（实服）：`variant=atlanta&type=deceased&title=先父&name=張三&...`，解码 PNG，
  暗像素列直方图出现**两个峰** → 证 稱謂/name 真是独立列（启发式，阈值需在真实渲染上调，避免 flaky）。
- bw：atlanta 输出背景为白。

### D.3 默认 URL 不变单测
`templateVariant='default'` 时构建的 URL **不含** `variant=`。

---

## E. 实施顺序（分阶段提交，edge 保留到最后）
每步先 `npm install`、`npx tsc --noEmit`，默认不变由 D.1 证明。

- **Step 0 — 工装**：`npm install`；devDeps `vitest pngjs pixelmatch @types/pngjs`；加 scripts；抓默认 golden 基线。
- **Step 1 — 迁移 + 类型**：SQL `temples.template_variant default 'default'`，id=1 设 atlanta；`TempleInfo` 加字段（修正 #3）；apply 页 select 取新列。不碰渲染 → D.1 diff===0。
- **Step 2 — 变体流入**：apply 页 prop + `TabletFormStep` prop（默认 default）。暂不加 URL 参数。D.1 diff===0 + D.3。
- **Step 3 — atlanta config + 纯布局函数**：新建 `lib/atlanta/{constants,config,layout,display}.ts`；`export shouldKeepTogether`（修正 #2）。D.2 纯函数单测全过；生产渲染零改动 → D.1 diff===0。
- **Step 4 — 共享 SVG**：`public/templates/atlanta/frame.svg`（svgo）。默认不引用 → D.1 diff===0。
- **Step 5 — 路由接线 + 新参数 + atlanta 渲染**：route.tsx 顶部 atlanta 提前 return；`lib/atlanta/render.tsx`（JSX+ImageResponse，注册 400+500，bw 强制，resolveSvg 共享 frame）；`TabletFormStep` 两处门控 `appendAtlantaParams`+`getAtlantaDisplayText`。D.1 默认 diff===0；D.2 集成渲染；`tsc`。
- **Step 6 — 收尾校准**：6 型实服截图 vs html 逐型核对；修常量。D.3 清单逐条勾。
- **Step 7 — 确认全程 edge 未动**，默认 D.1 仍 0。
- **Step 8（最后，隔离提交）— 字体 Option B + runtime nodejs**：动态子集 + `runtime='nodejs'`。
  **先实测漂移**：切换前对默认道场抓 N 张，切后重抓跑 D.1。diff===0 则 0 容差合并；**有可见漂移则数据说话**，优先保 edge 或换 edge 兼容子集方案，不放宽回归容差。

---

## 关键文件
- 路由：`app/api/og/tablet/route.tsx`
- 类型/字段：`lib/tablet-types-config.ts`、`lib/types/temple.ts`
- 现有渲染常量 / `shouldKeepTogether`：`lib/active-areas-config.ts`
- 表单两处 URL：`components/apply/TabletFormStep.tsx`（handleConfirm:174-180；previewing:442-448）
- 变体流入点：`app/apply/[slug]/page.tsx:294-298`
- 新建模块：`lib/atlanta/{constants,config,layout,display,render}.{ts,tsx}`
- 共享 SVG：`prototypes/atlanta/frame-blank.svg` → `public/templates/atlanta/frame.svg`
- mockups（视觉标准答案）：`prototypes/atlanta/*.html`
