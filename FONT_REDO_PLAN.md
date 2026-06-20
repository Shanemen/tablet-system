# 字体缺字问题 — 方向决策文档

> 读者：Sicong（设计 + 学习工程）。结论先行，技术名词保留英文。
> 由 ultracode 多 agent 流程产出（理解现状 → 4 方向调研 → 对抗验证 edge 兼容性 → KISS/DRY/YAGNI 综合）。分支：`font-redo-edge-safe`。

---

## 1. 一句话结论

**采纳 Direction 2/3（本质同一件事）：把今天那个 768-glyph 的静态 subset 换成一个更大的、构建期自动生成的静态 subset（约 3,500 常用 Traditional CJK + full Basic Latin + Vietnamese ≈ 3,700 glyphs，约 0.7–1.5MB OTF），其余一切不动 —— 路由仍 `runtime='edge'`，仍用 `fetch(origin + /fonts/...)` 拉取。** 这是唯一同时满足「edge-compatible 已被文档证实」「不重蹈上次 500 覆辙」「KISS/DRY/YAGNI 最优」的方案。更聪明的 per-request 动态 subset（Direction 1）已被 Vercel 官方文档**明确判死**，全量字体上 edge（Direction 4b）属于**无法验证的赌博**。

---

## 2. 现状与问题

OG 路由 (`app/api/og/tablet/route.tsx:13`) 固定 `runtime='edge'`，在请求时通过 `fetch(`${request.nextUrl.origin}/fonts/NotoSerifTC-Subset.otf`)` 拉取一个**实测 768 个 glyph、全部为 CJK、零 Latin / 零 Vietnamese** 的静态 subset，交给 `@vercel/og` 的 `ImageResponse`。问题：任何落在这 768 字之外的字符（生僻姓名字、地址里的偏僻路名/区名、以及**所有**英文名和越南文 diacritics）都会 fallback 成豆腐块或错字。Latin/Vietnamese 申请人 100% 渲染失败，纯中文人口约 2–8% 的 tablet 因单字缺失而整体翻车。维护方式是手工往 `scripts/generate-font-subset.py` 里加字、再跑脚本——「永远手动补字」的痛点。

---

## 3. 四个方向对比表

| 方向 | edge-compatible | coverage | complexity | maintenance | KISS/DRY/YAGNI | 推荐 |
|---|---|---|---|---|---|---|
| **1. 请求期动态 subset（harfbuzz/JS subsetter 跑在 edge isolate 内）** | ❌ **blocked**（Vercel 文档：edge 禁用 `WebAssembly.instantiate(buffer)`；且 577KB wasm + @vercel/og 自带 wasm 撑爆 1–2MB code-size 上限；16MB 字体无法 bundle） | 理论 fully，实际 0（跑不起来） | high | high | 全面违反 KISS；**会重演上次 outage 的根因** | **avoid** |
| **2. 构建期生成更大静态 subset（自动化）** | ✅ **yes**（字体走 CDN fetch，不计入 code-size 上限——文档明确区分 bundled vs runtime-fetched） | partially（≈99.9% 中文 + 全 Latin + Vietnamese；极生僻字仍 fallback） | low | low | **最契合三原则**；改动最小、复用现有 offline pipeline | **adopt ✅** |
| **3. 半自动扩充静态 subset（同 2，强调从 config.ts 抽取 fixed strings 去重）** | ✅ yes（同上，机制逐字节不变） | partially（同 2） | low | low | KISS/DRY 双赢（消除脚本与 config 的重复字源） | **adopt ✅** |
| **4a. 维持现状 / 小补丁** | ✅ yes | no（Latin/Vietnamese 仍 100% 坏） | trivial | low | 最纯 YAGNI，但放任真实存在的用户缺陷 | 仅作 baseline |
| **4b. 全量字体上 edge，不 subset** | ❓ **unknown**（需 fetch+parse **24.5MB** 解压后 OTF/请求；satori 不支持 woff2；无任何文档证明 edge isolate 能扛——与上次「未验证的 edge 假设」同类风险） | fully（若能跑） | low | low（删除补字循环，最 DRY 的终局） | 代码简单但运行期代价巨大且未经证实 | **viable-fallback，仅在 2 验证后仍不够时考虑** |

> Direction 2 与 3 在代码层面是同一件事（换静态文件 + 改 offline 脚本），下面合并为推荐方案。

---

## 4. 推荐方案 — 最小可行改动

**核心思想：请求路径一行代码都不改，只换「那个被 fetch 的静态文件」的内容 + 把生成它的 offline 脚本自动化。**

### 要构建什么
一个新的静态 OTF，字符集 = 以下并集（去重）：
1. **全部 fixed strings**，从 `lib/atlanta/config.ts` **程序化抽取**（而非在脚本里手抄）——这 31 个 fixed 字今天已 100% 覆盖，抽取只是为了**防止脚本与 config 漂移**（DRY）。
2. 一份维护好的 **top-N 常用 Traditional 频率表**（建议 N≈3,500，覆盖约 99.9% 中文行文）。
3. **full Basic Latin + 数字 + 常用标点**（约 95 glyphs）。
4. **Vietnamese**（Latin Ext-A + Latin Ext Additional U+1E00–1EFF，约 250 glyphs）。

实测尺寸参考（研究中真实构建）：N=3,500 CJK + Latin + Vietnamese ≈ **687KB OTF**（efficient fonttools build）至 ~1.46MB（若沿用现 checked-in 文件更密的 CFF 构建）。均**稳稳低于 1MB 的相关阈值**，且因走 fetch 不计入 edge code-size。

### 改哪些文件
- **`scripts/generate-font-subset.py`** — 把第 12–52 行那 6 块手抄字符串，替换为：从 `lib/atlanta/config.ts` 抽取 fixed strings + 频率表 + Latin + Vietnamese。这是**唯一的逻辑改动**，且仍跑在 offline、已验证的 `fontTools` 路径上（repo 已有 fontTools 4.60.1）。
- **`public/fonts/NotoSerifTC-Subset.otf`** — 重新生成、提交（**文件名保持不变**，这样 `route.tsx:308` 和 `render.tsx:146` 的 fetch 路径零改动）。
- **`package.json`** — 加一个 npm script 把上面这步变成可重复命令（DRY）。
- **`scripts/verify-font-chars.py`** — 加断言作为 gate（见 §5）。

### DRY 复用
完全复用今天的 edge fetch 机制：`runtime='edge'` 不动、`fetch(origin)+arrayBuffer()+ImageResponse({fonts})` 不动、Atlanta 的 400+500 双注册 (`render.tsx:166-167`) 不动。**请求路径零新增依赖、零 wasm、零 fs。**

### 格式：先保 OTF
保持 OTF（satori **不支持 woff2**）。woff2 能省一半字节，但会引入「@vercel/og 在 edge 上 brotli 解压」这一未验证变量——**YAGNI，先不做**，OTF 已稳稳在预算内。

---

## 5. ⚠️ 安全验证协议（强制 —— 这是第一教训）

> 上次 outage 的根因不是 subset 逻辑，而是为了用 `subset-font` 把 `runtime` 从 edge 翻成 nodejs，导致 @vercel/og 自带 wasm 在真实 lambda 上加载失败、**每个请求 500**。而 `next dev` 在本地 node 上 wasm 全部正常 → 本地全绿 → 假信心 → 「赌 prod」→ 事故。**本地绿色对这类改动毫无意义。**

**只有真实 Vercel PREVIEW 部署能验证以下残留未知（取自各 verdict）：**
1. **per-request parse cost / heap**：glyph 数 768 → ~3,700，satori 每请求 `opentype.parse()` 的 CPU/内存会上升（基线 ~25ms/parse）。需确认仍远在 edge **25s first-byte** 窗口内、p95 latency 无明显回退。**这是本方案唯一真正新增的运行期变量，只能在 preview 上测。**
2. **Atlanta 双注册内存**：`render.tsx:166-167` 把同一 buffer 注册两次（400 + `fontData.slice(0)` 500）。更大的 face 在该路径下内存翻倍，须**专门测 Atlanta 路径**。
3. **default 路径像素一致性**：重新 subset 可能改变 glyph hinting/outline。**最安全做法 = 复用当前 subset 的完全相同 source + flags**。

**验证步骤（不可跳过第 4 步——这正是上次被忽略的 must-fix #4）：**
1. offline 生成新 OTF；跑 `scripts/verify-font-chars.py` 断言覆盖：31 个 config fixed 字 + `父`/`母` + 一个 Latin 样本 + 越南文样本（`Nguyễn`/`Trần`）+ 一个生僻 CJK 样本。
2. 跑 `scripts/capture-golden.mjs` 在**相同 edge+font 配置**下 re-baseline，对 **default（非 atlanta）**输出做像素 diff——in-set 字符必须逐字节/视觉一致（否则即为非预期回退）。
3. 部署到一个 **preview 分支**，**临时关闭 Deployment Protection**，使 preview URL + apply flow **无需登录即可命中**（上次正是因为 protected preview 挡住端到端测试才去赌 prod）。
4. 在该 preview 上 curl `/api/og/tablet`，对以下每一种输入断言 **HTTP 200 + 正确 glyph（无豆腐）**：常见名 `name=test`、含已新覆盖生僻字的 CJK 名、英文名、越南名、超长 land-deity 地址。
5. 轻并发打多个不同 uncached URL，确认无 500 / 无 timeout / 内存无异常（cold render 首次承担全部 parse 成本）。
6. 全部 preview case 通过后**才** merge 到 main。**Vercel 从 main 部署，merge == prod，绝不直接动 prod。** 保留旧的 321KB subset 作为即时回滚目标。

---

## 6. 明确不做（YAGNI）+ 重做硬约束

**明确不做：**
- ❌ **任何 per-request 动态 subsetting**（Direction 1）——`subset-font` / `harfbuzzjs` / `fontverter` 在本路由**永久禁用**；它们强制 nodejs，正是上次 500 的根因；且 edge 文档明确禁用 `WebAssembly.instantiate(buffer)`。
- ❌ **不为 fixed strings 补字**——31 个 fixed 字已 100% 覆盖，任何「补 fixed 集」都是纯 YAGNI；只需顺手 verify `父`/`母`（aborted-spirits 父母标签）。
- ❌ **暂不切 woff2**（satori 不支持，且引入未验证的 edge 解压路径）；OTF 已够。
- ❌ **暂不上全量 24.5MB 字体**（Direction 4b）——edge 能否 fetch+parse 24.5MB/请求**无任何文档背书**，属未验证赌博；仅当方向 2 上线后仍证明覆盖不足时，再按其 verdict 的协议单独验证。
- ❌ **不切 N>3,500 的肥字体**——源字体 `NotoSerifTC-Regular.woff2` 本身只有 6,317 CJK，且尺寸越大 parse 成本越高；按需增量，勿一步到位。

**重做硬约束（最高优先级）：**
- 🔒 **永不改 OG 路由的 runtime —— 必须保持 `runtime='edge'`。** 这是唯一一条 load-bearing 教训。
- 🔒 **请求路径不得引入任何 nodejs-only / native / wasm / fs 依赖**（包括读 `public/` 的 `fs`——Vercel 不把 `public/` 打进 lambda，必须 `fetch(origin)`）。
- 🔒 **default（非 atlanta）输出必须像素级不变。**
- 🔒 **绝不信任本地 `next dev` 绿色**；只在 preview 验证，绝不动 prod。

---

## 7. 下一步（单一首个动作）

**改写 `scripts/generate-font-subset.py`**：先做最小一步——把字符集来源从「6 块手抄字符串」改为「从 `lib/atlanta/config.ts` 程序化抽取 fixed strings + 引入一份 top-3,500 Traditional 频率表 + full Basic Latin + Vietnamese」，本地跑出新 OTF，再用 `scripts/verify-font-chars.py` 跑 §5 步骤 1 的覆盖断言。**在这一步本地产物通过覆盖断言之前，不碰路由、不部署、不动 main。**
