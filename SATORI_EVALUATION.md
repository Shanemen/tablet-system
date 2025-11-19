# Satori (@vercel/og) 技术评估

## 📅 评估时间
2024-11-19

## 🎯 使用场景
为信众申请生成牌位图片预览（6种类型：长生禄位、往生莲位、历代祖先、冤亲债主、堕胎婴灵、地基主）

---

## ✅ 已验证可行的功能

### 1. **基础图片生成** ✅
- 简单的 HTML/CSS 布局转换为图片
- 动态背景颜色（红色、黄色）
- 基本的文字显示（横排）
- 边框样式（double border）

### 2. **动态内容** ✅
- 通过 URL 参数传递姓名和牌位类型
- 根据类型动态改变颜色和文字内容

### 3. **Edge Runtime** ✅
- 在 Next.js API Routes 中运行
- 本地开发环境可用

---

## ❌ 已发现的限制和问题

### 1. **`.map()` 渲染崩溃** 🔴
**问题：**
```tsx
{name.split('').map((char, i) => (
  <span key={i}>{char}</span>
))}
```
导致 API 返回 `ERR_EMPTY_RESPONSE`

**原因推测：**
- Satori 对 React 的支持有限，可能不完全支持动态生成的多个元素
- `key` prop 可能不被识别
- `.map()` 在 Edge Runtime 中可能不稳定

**状态：** 🟡 待进一步测试

---

### 2. **复杂 Flexbox 布局不稳定** 🟡
**观察：**
- 简单布局（1-2 层）可以工作
- 多层嵌套的 `display: flex` + `flexDirection: column` 可能失败

**状态：** 🟡 待验证复杂度上限

---

## 🔬 待测试的关键功能

### 1. **SVG 背景图加载** 🔬
**需求：** 牌位需要纸张纹理背景（SVG 或 PNG）

**测试方法：**
```tsx
<div style={{
  backgroundImage: `url(data:image/svg+xml;base64,${base64Svg})`,
  // 或
  backgroundImage: `url('/path/to/image.png')`
}}>
```

**关键问题：**
- Satori 是否支持 `backgroundImage`？
- 是否支持 base64 内联图片？
- 是否支持外部 URL？

---

### 2. **自定义中文字体** 🔬
**需求：** 书法字体（楷体、隶书）

**测试方法：**
```tsx
const fontData = await fetch('font.woff').then(res => res.arrayBuffer())

// ...
{
  fonts: [{
    name: 'Noto Serif TC',
    data: fontData,
    style: 'normal',
  }]
}
```

**关键问题：**
- 哪些字体格式被支持？（.ttf, .woff, .woff2）
- 中文字体文件通常很大（5-15MB），会影响性能吗？
- CDN 加载字体是否稳定？

**已知：** 我们在本地测试时移除了字体加载（可能导致崩溃），需要重新测试。

---

### 3. **竖排文字** 🔬
**需求：** 传统牌位使用竖排文字（从右到左）

**方案 A：CSS `writing-mode`**
```tsx
<div style={{ writingMode: 'vertical-rl' }}>
  {name}
</div>
```
- ✅ 简单优雅
- ❓ Satori 是否支持 `writing-mode`？

**方案 B：手动拆分字符**
```tsx
<div style={{ display: 'flex', flexDirection: 'column' }}>
  {/* 不用 .map()，手动写 */}
  <div>王</div>
  <div>大</div>
  <div>明</div>
</div>
```
- ✅ 更稳定
- ❌ 不够动态

**方案 C：旋转 + 绝对定位**
```tsx
<div style={{ transform: 'rotate(-90deg)' }}>
  {name}
</div>
```
- ❓ Satori 是否支持 `transform`？

---

### 4. **边框和装饰** 🔬
**需求：**
- 双线边框 ✅ 已验证可行
- 花纹装饰 🔬 待测试
- 阴影效果 🔬 待测试

---

## 🔄 备选技术方案

如果 Satori 不满足需求，考虑以下方案：

### 方案 A：Node Canvas
```bash
npm install canvas
```
**优点：**
- 完全控制绘图过程
- 支持所有字体和图片
- 性能稳定

**缺点：**
- 需要手动计算坐标和布局
- 代码复杂度高
- 依赖原生模块（部署复杂）

---

### 方案 B：Puppeteer 截图
```bash
npm install puppeteer
```
**优点：**
- 完美的浏览器渲染
- 支持所有 CSS 特性
- 可以直接截图 HTML 页面

**缺点：**
- 启动慢（需要启动浏览器）
- 资源消耗大
- Vercel 免费版可能不支持

---

### 方案 C：直接操作 SVG
**优点：**
- SVG 本身就是矢量图
- 可以导出为 PNG/PDF
- 适合打印

**缺点：**
- 需要手动编写 SVG 模板
- 中文字体支持需要额外处理

---

### 方案 D：Sharp + SVG Composite
```bash
npm install sharp
```
**优点：**
- 高性能图片处理
- 可以合成 SVG 背景 + 文字
- 适合批量生成

**缺点：**
- 需要分别处理背景和文字
- 布局计算复杂

---

## 🎯 下一步行动计划

### Phase 1：等待素材 ⏳
- [ ] 用户提供 6 种牌位的 SVG 背景图
- [ ] 确认书法字体文件（.ttf 或 .woff）

### Phase 2：逐项测试 Satori 🔬
1. [ ] 测试 SVG 背景加载
2. [ ] 测试自定义字体加载
3. [ ] 测试竖排文字（3 种方案）
4. [ ] 测试复杂布局（边框、装饰）

### Phase 3：做出技术决策 🎯
- **如果 Satori 全部通过** → 继续使用，优化性能
- **如果 Satori 部分失败** → 混合方案（Satori + Canvas 补充）
- **如果 Satori 大部分失败** → 切换到 Canvas 或 Puppeteer

---

## 📝 测试记录

### Test 1: 简单文字 + 背景色 ✅
- **日期：** 2024-11-19
- **结果：** 成功
- **代码：**
  ```tsx
  <div style={{ backgroundColor: '#fcd34d', fontSize: 60 }}>
    {name}
  </div>
  ```

### Test 2: 竖排文字 (.map() 方案) ❌
- **日期：** 2024-11-19
- **结果：** 失败（ERR_EMPTY_RESPONSE）
- **代码：**
  ```tsx
  {name.split('').map((char, i) => (
    <span key={i}>{char}</span>
  ))}
  ```

---

## 💡 关键决策点

1. **如果竖排文字无法实现** → 可以接受横排吗？
2. **如果自定义字体失败** → 可以使用系统字体吗？
3. **如果 SVG 背景不支持** → 可以用纯色背景 + 边框代替吗？
4. **性能要求：** 单张图片生成时间应 < 500ms

---

## 🔗 相关资源

- [Satori 官方文档](https://github.com/vercel/satori)
- [@vercel/og 文档](https://vercel.com/docs/functions/edge-functions/og-image-generation)
- [Satori Playground](https://og-playground.vercel.app/)

