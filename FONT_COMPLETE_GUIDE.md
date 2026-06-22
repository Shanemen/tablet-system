# 🎨 字体完整指南 (Font Complete Guide)

**最后更新**: 2026-06-21
**状态**: ✅ 生产就绪（CJK 3,671 字 + 拉丁/越南文）

> 本文档 2026-06-21 整篇重写，反映真实架构。术语/路径/代码保留英文。

---

## 0. 一句话心智模型：我们是「剪」字，不是「画」字

牌位渲染用的字体是从一个**完整源字体**里**剪（subset）出我们需要的字**拼成的小字体。我们**不创造字形**——源字体里没有的字，剪不出来。所以「覆盖率」由两件事决定：① 我们在字符清单里列了哪些字；② 源字体本身有没有这些字形。

---

## 1. 运行时架构（出图时发生什么）

### 1.1 OG 路由固定 `runtime='edge'`（铁律，勿改）

`app/api/og/tablet/route.tsx:13` → `export const runtime = 'edge'`。

**为什么必须留在 edge**：出图引擎 `@vercel/og`（`ImageResponse`）依赖 resvg/yoga wasm，在 Vercel 上**只在 edge runtime 稳定**。曾经为了用 `subset-font`（动态子集）把 runtime 切到 nodejs，导致 @vercel/og 的 wasm 在 lambda 加载失败、**每个请求 500**、全站出图挂掉，靠 Instant Rollback 才恢复。**结论：字体走「构建期静态子集 + 运行时 fetch」，绝不在请求里跑 wasm 子集化、绝不切 nodejs。**

### 1.2 两个字体，都在 edge 运行时 fetch

路由用 `fetch(${origin}/fonts/...)` 拉字体喂给 `ImageResponse`：

| 字体文件 | 覆盖 | 字数 | 大小 |
|---|---|---|---|
| `public/fonts/NotoSerifTC-Subset.otf` | 繁体 CJK（牌位主体） | **3,671** | ~1.62 MB |
| `public/fonts/NotoSerif-LatinVi.ttf` | ASCII + 越南文变音 | 785 | ~96 KB |

两者都注册进 `ImageResponse.fonts`（`route.tsx:399` / `lib/atlanta/render.tsx`）：
`{ name: 'Noto Serif TC', ... }` + `{ name: 'Noto Serif', ... }`，`fontFamily: 'Noto Serif TC, Noto Serif'`。satori 按字形覆盖**逐字 fallback**：CJK 用 TC，拉丁/越南文用 Noto Serif。Atlanta 路径额外注册 weight 400 + 500。

### 1.3 简繁转换发生在「客户端」，不在路由里

⚠️ 常见误解：路由不做简繁转换。真实数据流：

```
用户输入「陈小华」(简体)
   ↓  TabletFormStep.tsx 调 convertToTraditional()（client 版，见 §2）
   ↓  得到「陳小華」(繁体)
   ↓  拼进 OG URL: /api/og/tablet?name=陳小華&...&fv=3671
   ↓  route.tsx 收到的已经是繁体，直接喂 satori 渲染
   ↓  牌位 PNG（繁体，字体统一）
```

字体只装繁体（用户的简体在到达路由前已被转成繁体）。

---

## 2. 简繁转换

**唯一在用的转换器**：`lib/utils/chinese-converter-client.ts`
- **异步、懒加载**：opencc-js 约 300KB，仅在检测到含简体时才 `import('opencc-js')`，避免拖累不需要转换的用户（zh-TW / 英文输入）。
- 配置 `Converter({ from: 'cn', to: 'tw' })`（≈ s2tw）。
- 使用方：`TabletFormStep.tsx`、`lib/utils/application-storage.ts`、`app/admin/dashboard/page.tsx`。
- （旧的同步 server 版 `lib/utils/chinese-converter.ts` 已删除——无人引用的死代码。）

### 姓氏转换陷阱（重要）
opencc cn→tw 会把某些**姓氏**转成偏好异体，渲染出错字：
- `于`（姓）→ 被误转成 `於`（介词）。转换器已在转换后**还原 `于`**（`fixSurnameVariants`：`於`→`于`）。本 app 全是名字/地址，`於` 不会合法出现，故安全。
- `钟`（姓）正确繁体是 `鍾`，opencc 默认给 `鐘`（钟表）。两个字形都在子集里，但如遇相关问题需注意。
- 加新姓氏字时，务必确认 opencc 给的是不是姓氏正确的那个繁体形。

---

## 3. 字体构建流水线（怎么剪字）

```
NotoSerifTC-Full.ttf  ──(generate 脚本: 定到 wght=400 再剪)──>  public/fonts/NotoSerifTC-Subset.otf
(完整源, 20,748 字, 16MB, gitignore)        ↑ 读取                (成品, 3,671 字, ship)
                              scripts/subset-cjk-chars.txt  ← 唯一字符来源（SOURCE OF TRUTH）
```

### 3.1 源字体（原材料，不入库）
- **完整 Noto Serif TC 可变字体**，放在 repo 根：`NotoSerifTC-Full.ttf`（20,748 字，16MB）。
- **gitignore，不提交**（仅 build 时用、不 ship；它多大都不影响运行时）。
- 下载：`https://raw.githubusercontent.com/google/fonts/main/ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf` → 存为 `NotoSerifTC-Full.ttf`。
- （历史：2026-06-21 前曾用 `NotoSerifTC-Regular.woff2`（6,606 字的 fontsource 切片）当源，它本身缺很多名字用字，已被完整字体取代。）

### 3.2 字符清单（唯一来源）
- `scripts/subset-cjk-chars.txt`——一行连续字符串，3,671 个繁体字。**加字/删字只改这里。**

### 3.3 脚本
- `scripts/generate-font-subset.py` → **只读 `subset-cjk-chars.txt`**，把完整可变字体定到 wght=400，再 subset 成 OTF。这是唯一的生成入口。
- `scripts/verify-font-chars.py` → 验证覆盖（固定串、姓名样本、拉丁/越南文、简体泄漏黑名单）。
- ⛔ **`scripts/build-cjk-charset.py` 绝对不要跑** ——它是一次性的旧生成器，现已失效（P2 依赖的硬编码块已删、P3 依赖的 /tmp 频率表已没），跑它会**覆盖并缩小** `subset-cjk-chars.txt`，把 3,671 字连同后加的字一起冲掉。它已加硬 guard，无 `--yes-i-really-want-to-overwrite-the-charset` 拒绝运行。这就是历史上「加了字却没用上」的坑之一。

---

## 4. 操作手册：加字 / 改字

1. **编辑** `scripts/subset-cjk-chars.txt`，把新字追加进去（去重无所谓，脚本会 dedupe）。
2. **确认源字体在位**：repo 根有 `NotoSerifTC-Full.ttf`（没有就按 §3.1 下载）。
3. **重建**：`python3 scripts/generate-font-subset.py`
4. **过验证闸**（缺一不可）：
   - `python3 scripts/verify-font-chars.py` → ALL PASSED。
   - **防静默丢字**：每个清单里的字都在新 OTF 的 cmap（源字体没有的字会被悄悄跳过——脚本里那些字会 build 不进去，需留意）。
   - **零 drift**：`set(subset-cjk-chars.txt) == cmap(OTF)`。
   - **零回归**：现有字的字形坐标 + advance 与旧 OTF 逐字节一致（换源/改 flag 时尤其要查，防默认道场像素变化）。
5. **一起提交** `subset-cjk-chars.txt` + `NotoSerifTC-Subset.otf`（永不分家，防 drift）。
6. **撞缓存**：把 `components/apply/TabletFormStep.tsx` 里的 `OG_ASSET_VERSION`（即 OG URL 的 `fv` 参数）改成新值（如字数）——见 §5。
7. **部署**：merge 到 main 后，去 Vercel 确认 **Production 指向最新部署**（见 §5）。

> 注：若某个想加的字连**完整源字体**里都没有（极罕见异体/方言字），那是真加不进去，只能放弃或换更全的源。

---

## 5. 缓存与部署（「为什么改了字还看不到」）

字体改了线上不生效，几乎总是这三层之一：

1. **@vercel/og 的一年 CDN 缓存**：`ImageResponse` 生产环境默认 `cache-control: public, immutable, max-age=31536000`。同一套 URL 参数的出图会被边缘缓存一整年。
   → **对策**：OG URL 带版本参数 `fv`（来自 `OG_ASSET_VERSION`）。换字体就改这个数 → URL 变 → CDN 视为新请求重渲。
2. **Supabase 出图快照**：确认牌位时，PNG 被上传到 Supabase storage，cart/订单存的是**静态 PNG 链接**。**历史旧订单的图是当时字体的死快照，换字体不会更新它们**，只能重新生成。
3. **Vercel 部署没更新 / 被 rollback 钉住**：Vercel 从 **main 部署 = 生产**。但 Production 可能被 **Instant Rollback 钉在旧部署**上，新 commit 即使 build 成功也不服务。
   → **对策**：merge 后去 Vercel → Deployments → 最新 main 部署 → `•••` → **Promote to Production**。

**验证线上真换了**：`curl https://<域名>/fonts/NotoSerifTC-Subset.otf` 用 fontTools 看 glyph 数 / 关键字在不在；别只看 git。

---

## 6. 故障排除

**症状：某个字渲染成黑体（fallback）**，按序排查：
1. 这个字（**繁体形**）在 `NotoSerifTC-Subset.otf` 的 cmap 里吗？不在 → §4 加字。
2. 在字体里却还黑？多半是**缓存/快照**（§5）：是不是在看旧订单的 Supabase PNG？线上是不是还没 promote？同 URL 撞 CDN 缓存？用 `&fv=随便改个值` 强制新渲染验证。
3. 用户打的是简体？确认 client 转换有跑（§2）。

**症状：姓氏「于」显示成「於」** → §2 的姓氏陷阱（转换器已修；确认线上跑的是含修复的版本）。

**症状：默认道场牌位像素变了** → 多半换源/改 subset flag 引入了字形变化，跑 §4 的零回归对比。

---

## 7. 选型说明（仍然成立）

**为什么 Noto Serif TC**：庄重碑刻感适合牌位；开源免费无版权；Google 出品字形优美；完整繁体支持；子集化效果好。

**为什么只装繁体**：用户输入在 client 转成繁体后才出图，字体只需繁体；装简体是浪费（§0）。

**为什么客户端转换而非路由转换**：转换在表单一次完成，路由保持纯渲染；opencc-js 懒加载只在需要时下载。

---

## 8. 关键文件

```
tablet-system/
├── NotoSerifTC-Full.ttf                    # 完整源字体 16MB（gitignore，不提交，build 时用）
├── public/fonts/
│   ├── NotoSerifTC-Subset.otf              # ✅ 生产 CJK 子集 3,671 字 (~1.62MB)
│   ├── NotoSerif-LatinVi.ttf               # ✅ 生产 拉丁/越南文 785 字 (~96KB)
│   └── NotoSerif-LatinVi-LICENSE.txt
├── scripts/
│   ├── subset-cjk-chars.txt                # ⭐ 字符 SOURCE OF TRUTH（改这里）
│   ├── generate-font-subset.py             # 生成脚本（只读上面的 txt）
│   ├── verify-font-chars.py                # 验证脚本
│   └── build-cjk-charset.py                # ⛔ 废弃，别跑（有 guard）
├── lib/utils/
│   └── chinese-converter-client.ts         # 简繁转换（async, 含 于→于 修复）
├── app/api/og/tablet/route.tsx             # OG 路由（edge，默认道场）
├── lib/atlanta/render.tsx                  # OG 渲染（edge，Atlanta 变体）
├── components/apply/TabletFormStep.tsx     # 表单（client 转换 + OG_ASSET_VERSION/fv）
└── FONT_COMPLETE_GUIDE.md                  # 📖 本文档
```

| 文件 | 是否提交 |
|---|---|
| `NotoSerifTC-Subset.otf` / `NotoSerif-LatinVi.ttf` | ✅ 是（成品，要 ship） |
| `subset-cjk-chars.txt` / `generate-font-subset.py` / `verify-font-chars.py` | ✅ 是 |
| `NotoSerifTC-Full.ttf`（完整源） | ❌ 否（gitignore，16MB，按需下载） |

---

## 📝 更新日志

### 2026-06-21
- 文档整篇重写以反映真实架构（此前停留在 2024-11，事实大量过时）。
- CJK 子集 3,500 → **3,671**（audit 补齐真实姓名/姓氏/地址/法事用字）。
- 构建源切换为**完整 Noto Serif TC**（可变字体，gitignore）；旧的 6,606 字 fontsource 切片弃用。
- 固化「`subset-cjk-chars.txt` 为唯一字符来源」；`build-cjk-charset.py` 加 guard。
- 修复姓氏 `于→於` 渲染；删除死代码 server 版 converter。
- 记录 `fv` 缓存破除 + Vercel promote 部署流程。

### 历史
- 2026-06-20: CJK 子集 768 → 3,500（edge-safe 静态子集）+ 新增拉丁/越南文字体；动态子集（nodejs）方案因生产 500 回滚废弃。
- 2024-11-23: 初版字体优化（925 定义 / 723 字 / 295KB）+ 简繁转换。
- 2024-11-18 ~ 11-20: 字体选型 + 初始子集。
