# Tablet Rendering Guide
# 牌位渲染指南

> **Purpose**: 总结牌位渲染的最佳实践和通用规则，便于快速开发新的牌位模板。
> 
> **目的**: Document rendering patterns and reusable strategies for tablet templates.

---

## 📐 Core Concepts / 核心概念

### 1. Two Main Areas (两大区域)

每个牌位模板通常包含两个动态区域：

| 区域 | 英文 | 中文 | 用途 | 常见位置 |
|------|------|------|------|---------|
| **Honoree Area** | Center Honoree Area | 中央受祭者区域 | 被祈福/超度者的名字 | 中央 |
| **Petitioner Area** | Left Petitioner Area | 左侧阳上者区域 | 申请人的名字 | 左侧 |

---

## 🎯 Left Petitioner Area (左侧区域) - 标准规范

### **通用配置（99% 相同）**

所有牌位的左侧区域配置**基本一致**，只有 Y 坐标可能略有不同：

```typescript
{
  id: 'left-petitioner',
  x: 8,            // ✅ 固定值 (所有模板相同)
  y: 350-370,      // ⚠️ 唯一变化：根据具体模板调整 (±20px)
  width: 50,       // ✅ 固定值 (所有模板相同)
  height: 300-320, // 根据 Y 坐标计算：670 - y
  purpose: 'petitioner',
  fontSize: 20,    // ✅ 固定值 (所有模板相同)
  lineHeight: 20,  // ✅ 固定值 (所有模板相同)
}
```

### **配置参数说明**

| 参数 | 值 | 说明 | 是否固定？ |
|------|----|----|----------|
| **x** | 8 | 左边距，距离左边缘 8px | ✅ **固定** |
| **y** | 350-370 | 顶部位置，根据模板微调 | ⚠️ **可变** |
| **width** | 50 | 宽度，窄区域 | ✅ **固定** |
| **height** | 300-320 | 高度，计算公式：670 - y | ⚠️ **计算** |
| **fontSize** | 20 | 小字体，适应窄区域 | ✅ **固定** |
| **lineHeight** | 20 | 紧凑行高 | ✅ **固定** |

### **实际案例**

**Karmic Creditors (冤亲债主):**
```typescript
x: 8, y: 350, width: 50, height: 320  // 670 - 350 = 320
fontSize: 20, lineHeight: 20
```

**Ancestors (历代祖先):**
```typescript
x: 8, y: 370, width: 50, height: 300  // 670 - 370 = 300
fontSize: 20, lineHeight: 20
```

**关键点：只有 Y 坐标不同 (350 vs 370)，其他完全相同！** ✅

---

## 🏛️ Center Honoree Area (中央区域) - 标准规范

### **通用配置（高度一致）**

中央区域配置相对灵活，但遵循标准模式：

```typescript
{
  id: 'center',
  x: 45,           // ✅ 标准值 (大多数模板相同)
  y: 280-312,      // ⚠️ 根据模板调整
  width: 230,      // ✅ 标准值 (大多数模板相同)
  height: 178-340, // ⚠️ 根据内容需求调整
  purpose: 'honoree',
  fontSize: 42-46, // 较大字体
  lineHeight: 42-44,
}
```

### **两种模式**

#### **模式 1: Longevity 模式（单区域）**
```typescript
// 长生禄位 - 只有中央区域，无左侧区域
{
  x: 45,
  y: 312,          // 精确测量：佛光注照(306) + 6px padding
  width: 230,
  height: 300,     // 精确测量：(618 - 6) - (306 + 6)
  fontSize: 42,
  lineHeight: 42,
}
```
**特点**：
- 精确测量固定文字位置
- 加 6px padding 避免重叠
- 字体适中 (42px)

---

#### **模式 2: Standard 模式（双区域）**
```typescript
// 其他模板 - 中央 + 左侧
{
  x: 45,
  y: 280,          // 标准起始位置
  width: 230,
  height: 340,     // 标准高度
  fontSize: 46,    // 略大字体
  lineHeight: 44,
}
```
**特点**：
- 使用标准坐标
- 字体稍大 (46px)
- 适用于多数双区域模板

---

#### **模式 3: Ancestors 模式（姓氏专用）**
```typescript
// 历代祖先 - 只显示姓氏（短文本）
{
  x: 45,
  y: 312,          // 与 longevity 一致
  width: 230,
  height: 178,     // ⚠️ 较短：只需容纳 1-2 个字
  fontSize: 46,
  lineHeight: 44,
}
```
**特点**：
- 高度较短 (178px vs 300px)
- 只显示姓氏，不是全名
- 字体较大 (46px)

---

## 📊 Configuration Comparison Table (配置对比表)

| Template | Center Area | Left Area | 
|----------|-------------|-----------|
| **Longevity**<br>長生祿位 | x:45, y:312<br>w:230, h:300<br>font:42 | ❌ None |
| **Karmic Creditors**<br>冤親債主 | ❌ Fixed text | x:8, y:350<br>w:50, h:320<br>font:20 |
| **Ancestors**<br>歷代祖先 | x:45, y:312<br>w:230, h:178<br>font:46 | x:8, y:370<br>w:50, h:300<br>font:20 |
| **Deceased**<br>往生蓮位 | x:45, y:280<br>w:230, h:340<br>font:46 | x:15, y:280<br>w:60, h:340<br>font:32 |

---

## 🔤 English Name Handling (英文名字处理)

### **核心策略：自动检测 + 旋转 90 度**

```typescript
// 1. 检测英文
if (isEnglishText(text)) {
  // 英文处理逻辑
}

// 2. 计算字体和分行
const { fontSize, lines } = calculateEnglishFont(text, activeArea)

// 3. 旋转 90 度显示
<div style={{ transform: 'rotate(90deg)' }}>
  {lines.map(line => <div>{line}</div>)}
</div>
```

---

### **算法详解**

#### **约束条件**

旋转 90 度后：
- **文字长度** 受限于 `activeArea.height` (竖直方向)
- **文字堆叠高度** 受限于 `activeArea.width` (水平方向)

```typescript
availableLength = activeArea.height      // 文字能多长
availableStackHeight = activeArea.width  // 文字能多高（多行时）
BASE_SIZE = activeArea.fontSize          // 基础字体大小
```

---

#### **三步决策流程**

**Step 1: 尝试单行 (Single Line)**

```typescript
// 估算文字长度
textLength = text.length * fontSize * 0.6  // 0.6 是字符宽度比例

if (textLength <= availableLength) {
  // ✅ 可以使用 BASE_SIZE
  return { fontSize: BASE_SIZE, mode: 'single-line' }
} else {
  // ❌ 需要缩小
  scaledFontSize = (availableLength / textLength) * BASE_SIZE
}
```

**Step 2: 评估单行可行性**

```typescript
if (scaledFontSize >= BASE_SIZE * 0.6) {
  // ✅ 字体还算合理 (>= 60% 基础大小)
  // 使用单行
  return { fontSize: scaledFontSize, mode: 'single-line' }
}
// ❌ 字体太小，考虑分行
```

**Step 3: 尝试多行 (Multi-line)**

```typescript
// 按空格分词
const words = text.split(' ')

// 尝试所有可能的分割点
for (let i = 1; i < words.length; i++) {
  const line1 = words.slice(0, i).join(' ')
  const line2 = words.slice(i).join(' ')
  
  // 检查两个约束：
  // 1. 每行长度 <= availableLength
  // 2. 两行堆叠高度 <= availableStackHeight
  
  if (bothConstraintsMet) {
    // 找到最优分割点（字体最大）
  }
}

// 比较单行 vs 多行
if (multiLineFontSize > singleLineFontSize * 1.2) {
  return { fontSize: multiLineFontSize, mode: 'multi-line', lines: [line1, line2] }
}
```

---

### **实际案例分析**

#### **Case 1: 短名字 (最常见)**

**Input**: `"John Smith"` (10 chars)  
**Area**: Center (h:178, w:230, base:46)

```
Step 1: 估算长度
  10 * 46 * 0.6 = 276px
  276 > 178 ❌ 超出

Step 2: 缩小字体
  (178 / 276) * 46 = 29.7px
  29.7 >= 46 * 0.6 = 27.6 ✅ 可接受

Result: ✅ 单行，29.7px
```

---

#### **Case 2: 长名字 (需要分行)**

**Input**: `"Christopher Washington"` (23 chars)  
**Area**: Left (h:300, w:50, base:20)

```
Step 1: 单行估算
  23 * 20 * 0.6 = 276px
  276 < 300 ✅ 长度可以

Step 2: 检查可行性
  字体 20px >= 20 * 0.6 = 12 ✅

BUT: 看起来很拥挤，尝试分行

Step 3: 多行尝试
  Split: "Christopher" / "Washington"
  Max length: max(12, 10) = 12 chars
  12 * 20 * 0.6 = 144px < 300 ✅
  
  Stack height: 2 * 20 * 1.1 = 44px < 50 ✅

Result: ✅ 两行，20px (更清晰)
```

---

#### **Case 3: 超长复姓 (极限情况)**

**Input**: `"Washington-Williamson"` (21 chars)  
**Area**: Center (h:178, w:230, base:46)

```
Step 1: 单行估算
  21 * 46 * 0.6 = 579.6px
  579.6 > 178 ❌❌ 严重超出

Step 2: 缩小字体
  (178 / 579.6) * 46 = 14.1px
  14.1 < 46 * 0.6 = 27.6 ❌ 太小

Step 3: 尝试分行
  Split by hyphen: "Washington-" / "Williamson"
  Or: "Washington" / "-Williamson"
  
  每行约 10-11 chars
  11 * fontSize * 0.6 <= 178
  fontSize <= 26.9px
  
  Stack height: 2 * 26.9 * 1.1 = 59px < 230 ✅

Result: ✅ 两行，约 27px
```

---

### **字体大小范围**

| 情况 | 字体范围 | 显示效果 |
|------|---------|---------|
| **理想** | 100% BASE_SIZE | 完美显示 ✨ |
| **良好** | 60-100% BASE_SIZE | 清晰可读 ✓ |
| **可接受** | 40-60% BASE_SIZE | 略小但可读 ⚠️ |
| **极限** | 12px (最小值) | 保证最低可读性 ⚠️⚠️ |

---

## 🎨 Rendering Code (渲染代码)

### **英文渲染（旋转 90 度）**

```typescript
if (isEnglish) {
  const { fontSize, lines } = calculateEnglishFont(text, activeArea)
  
  return (
    <div style={{
      position: 'absolute',
      left: activeArea.x,
      top: activeArea.y,
      width: activeArea.width,
      height: activeArea.height,
      display: 'flex',
      justifyContent: 'center',  // 水平居中
      alignItems: 'center',      // 垂直居中
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(90deg)', // 🔑 旋转 90 度
        gap: fontSize * 0.1,        // 行间距
      }}>
        {lines.map((line, index) => (
          <div key={index} style={{
            fontSize,
            fontFamily: 'Noto Serif TC',
            textAlign: 'center',
            whiteSpace: 'nowrap',    // 不换行
          }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**关键点：**
1. ✅ 外层容器：`position: absolute` + `flex` 居中
2. ✅ 内层容器：`transform: rotate(90deg)` 旋转
3. ✅ 多行支持：`flexDirection: 'column'` + `gap`
4. ✅ 不换行：`whiteSpace: 'nowrap'`

---

### **中文渲染（竖排）**

```typescript
// 中文：逐字渲染
const fontSize = calculateFontSize(text, activeArea)
const lineHeight = fontSize
const characters = text.split('')

return (
  <div style={{
    position: 'absolute',
    left: activeArea.x,
    top: activeArea.y,
    width: activeArea.width,
    height: activeArea.height,
    display: 'flex',
    flexDirection: 'column',   // 🔑 竖直排列
    justifyContent: 'center',  // 垂直居中
    alignItems: 'center',      // 水平居中
  }}>
    {characters.map((char, index) => (
      <div key={index} style={{
        fontSize,
        fontFamily: 'Noto Serif TC',
        lineHeight: `${lineHeight}px`,
        textAlign: 'center',
      }}>
        {char}
      </div>
    ))}
  </div>
)
```

**关键点：**
1. ✅ 逐字分割：`text.split('')`
2. ✅ 竖直排列：`flexDirection: 'column'`
3. ✅ 双向居中：`justifyContent` + `alignItems`
4. ✅ 行高等于字体大小：`lineHeight: fontSize`

---

## 📋 Quick Reference Checklist (快速参考清单)

### **开发新模板时的步骤**

- [ ] **Step 1**: 获取 SVG 文件，使用 SVGO 优化
- [ ] **Step 2**: 测量固定文字位置，确定动态区域坐标
- [ ] **Step 3**: 配置 Left Area（照抄标准配置，只改 Y）
- [ ] **Step 4**: 配置 Center Area（根据内容调整 height）
- [ ] **Step 5**: 更新 OG Image API 支持新类型
- [ ] **Step 6**: 测试中英文、长短名字
- [ ] **Step 7**: 添加到申请表单

---

### **配置参数速查**

**Left Petitioner Area (标准配置):**
```typescript
x: 8, width: 50, fontSize: 20, lineHeight: 20  // ✅ 固定
y: 350-370  // ⚠️ 根据模板调整
height: 670 - y  // ⚠️ 自动计算
```

**Center Honoree Area (参考值):**
```typescript
// Longevity 模式
x: 45, y: 312, width: 230, height: 300, fontSize: 42

// Standard 模式
x: 45, y: 280, width: 230, height: 340, fontSize: 46

// Ancestors 模式（短文本）
x: 45, y: 312, width: 230, height: 178, fontSize: 46
```

---

## 🔧 Common Patterns (常见模式)

### **Pattern 1: 只有中央区域（如 Longevity）**

```typescript
// 配置
activeAreas: [
  {
    id: 'center',
    purpose: 'honoree',
    // ... center config
  }
]

// API 渲染
textToRender = name  // 直接使用 name 参数
```

---

### **Pattern 2: 只有左侧区域（如 Karmic Creditors）**

```typescript
// 配置
activeAreas: [
  {
    id: 'left-petitioner',
    purpose: 'petitioner',
    // ... left config
  }
]

// API 渲染
const applicant = searchParams.get('applicant')
textToRender = convertToTraditional(applicant)
```

---

### **Pattern 3: 双区域（如 Ancestors, Deceased）**

```typescript
// 配置
activeAreas: [
  { id: 'center', purpose: 'honoree', ... },
  { id: 'left-petitioner', purpose: 'petitioner', ... }
]

// API 渲染
config.activeAreas.map((area) => {
  if (area.purpose === 'honoree') {
    textToRender = name  // 中央：受祭者名字
  } else if (area.purpose === 'petitioner') {
    const applicant = searchParams.get('applicant')
    textToRender = convertToTraditional(applicant)  // 左侧：申请人名字
  }
  return renderVerticalText(textToRender, area, textColor)
})
```

---

## 🎓 Best Practices (最佳实践)

### **1. 不要重复造轮子** ✅
- 使用现有的 `renderVerticalText` 函数
- 使用现有的 `calculateEnglishFont` 算法
- 复制标准配置，只改必要参数

### **2. 保持配置一致性** ✅
- Left Area: 始终使用 x:8, width:50, fontSize:20
- Center Area: 优先使用标准值 x:45, width:230
- 只在必要时调整 Y 和 height

### **3. 测试顺序** ✅
1. 先测试中文短名字（2-4 字）
2. 再测试英文短名字（5-10 chars）
3. 然后测试长名字（10-20 chars）
4. 最后测试极限情况（20+ chars）

### **4. 坐标测量技巧** ✅
- 使用浏览器开发者工具检查 SVG 元素
- 记录固定文字的边界坐标
- 加 6px padding 避免重叠
- 验证：动态文字不应与固定文字重叠

### **5. 字体大小选择** ✅
- Center Area (全名): 42-46px
- Left Area (申请人): 20px
- 窄区域优先使用小字体
- 宽区域可以使用大字体

---

## 🚨 Common Pitfalls (常见陷阱)

### **❌ 错误 1: 左侧区域配置不一致**
```typescript
// ❌ 错误
{ x: 15, width: 60, fontSize: 32 }

// ✅ 正确
{ x: 8, width: 50, fontSize: 20 }
```

### **❌ 错误 2: 截断文字**
```typescript
// ❌ 错误：只取第一个字符
textToRender = name.charAt(0)

// ✅ 正确：使用完整文字
textToRender = name
```

### **❌ 错误 3: 破坏原有渲染逻辑**
```typescript
// ❌ 错误：添加不必要的样式
<div style={{ width: `${fontSize}px`, display: 'flex' }}>

// ✅ 正确：使用原始简洁代码
<div style={{ fontSize, textAlign: 'center' }}>
```

### **❌ 错误 4: 忘记清除缓存**
```bash
# ❌ 错误：直接重启
npm run dev

# ✅ 正确：清除缓存后重启
rm -rf .next && npm run dev
```

---

## 📚 Related Documentation (相关文档)

- **Layout Terminology Guide**: `/LAYOUT_TERMINOLOGY_GUIDE.md` - 术语标准
- **Font Complete Guide**: `/FONT_COMPLETE_GUIDE.md` - 字体优化
- **Active Areas Config**: `/lib/active-areas-config.ts` - 配置文件
- **OG Image API**: `/app/api/og/tablet/route.tsx` - 渲染 API

---

## 🔄 Version History (版本历史)

| Date | Version | Changes |
|------|---------|---------|
| 2024-11-24 | 1.0 | 初始版本：总结 Longevity, Karmic Creditors, Ancestors 三个模板的经验 |

---

## 💡 Quick Tips (快速提示)

1. **复制配置时**：先复制 karmic-creditors 的左侧配置
2. **测量坐标时**：使用浏览器开发者工具 + 右键检查
3. **调试时**：查看终端日志，有 `[OG Image]` 前缀的调试信息
4. **遇到问题**：先重启服务器清除缓存
5. **英文名字**：完全不用担心，代码会自动处理！

---

**Last Updated**: November 24, 2024  
**Maintained by**: Tablet System Development Team  
**Based on**: Longevity, Karmic Creditors, Ancestors templates

