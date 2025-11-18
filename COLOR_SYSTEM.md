# 颜色系统参考 (Color System Reference)

本文档列出了项目中所有可用的颜色，以及如何在 Tailwind CSS 中使用它们。

## 🎨 颜色调色板概览

项目使用 **OKLCH** 颜色空间，这是一个感知均匀的颜色空间，确保颜色在不同亮度下保持一致的外观。

### 设计主题
- **浅色模式**: 优雅的佛教风格 - 奶油色、金色和深蓝色
- **深色模式**: 深海军蓝配温暖金色点缀

---

## 📋 核心颜色 (Core Colors)

### 1. Background（背景色）
- **CSS 变量**: `--background`
- **Tailwind 类**: `bg-background`
- **浅色模式**: `oklch(0.97 0.002 60)` - 浅奶油色
- **深色模式**: `oklch(0.15 0.01 240)` - 深海军蓝
- **用途**: 页面主背景

### 2. Foreground（前景色/文字色）
- **CSS 变量**: `--foreground`
- **Tailwind 类**: `text-foreground`
- **浅色模式**: `oklch(0.25 0 0)` - 深灰色（主要文字）
- **深色模式**: `oklch(0.94 0.001 60)` - 浅色（主要文字）
- **用途**: 主要文字颜色

### 3. Primary（主色）
- **CSS 变量**: `--primary`
- **Tailwind 类**: `bg-primary`, `text-primary`, `border-primary`
- **浅色模式**: `oklch(0.35 0.12 240)` - 深蓝色
- **深色模式**: `oklch(0.55 0.18 240)` - 亮蓝色
- **用途**: 主要按钮、链接、标题、强调元素
- **示例**: 
  ```tsx
  <Button className="bg-primary">主要按钮</Button>
  <h1 className="text-primary">标题</h1>
  ```

### 4. Primary Foreground（主色前景）
- **CSS 变量**: `--primary-foreground`
- **Tailwind 类**: `text-primary-foreground`
- **浅色模式**: `oklch(0.98 0 0)` - 白色
- **深色模式**: `oklch(0.15 0.01 240)` - 深色
- **用途**: 主色背景上的文字颜色

### 5. Secondary（次要色）
- **CSS 变量**: `--secondary`
- **Tailwind 类**: `bg-secondary`, `text-secondary`
- **注意**: 项目中**未实际使用**此颜色
- **用途**: 保留用于未来扩展

### 6. Muted（静音色）
- **CSS 变量**: `--muted`
- **Tailwind 类**: `bg-muted`
- **浅色模式**: `oklch(0.92 0.001 60)` - 浅灰色背景
- **深色模式**: `oklch(0.32 0.01 240)` - 深灰色背景
- **用途**: 卡片背景、输入框背景、静音区域

### 7. Muted Foreground（静音前景色）
- **CSS 变量**: `--muted-foreground`
- **Tailwind 类**: `text-muted-foreground`
- **浅色模式**: `oklch(0.55 0 0)` - 中灰色
- **深色模式**: `oklch(0.65 0 0)` - 浅灰色
- **用途**: 标签、副标题、帮助文字、次要信息
- **示例**:
  ```tsx
  <label className="text-muted-foreground">标签文字</label>
  <p className="text-muted-foreground">帮助文字</p>
  ```

### 8. Accent（强调色）
- **CSS 变量**: `--accent`
- **Tailwind 类**: `bg-accent`, `text-accent`, `hover:bg-accent`
- **注意**: 项目中**未实际使用**此颜色
- **用途**: 保留用于未来扩展

### 9. Destructive（破坏性/危险色）
- **CSS 变量**: `--destructive`
- **Tailwind 类**: `bg-destructive`, `text-destructive`, `border-destructive`
- **浅色模式**: `oklch(0.6 0.2 30)` - 橙红色
- **深色模式**: `oklch(0.58 0.22 30)` - 深橙红色
- **用途**: 删除按钮、错误消息、警告
- **示例**:
  ```tsx
  <Button variant="destructive">删除</Button>
  <span className="text-destructive">错误信息</span>
  ```

### 10. Border（边框色）
- **CSS 变量**: `--border`
- **Tailwind 类**: `border-border`
- **浅色模式**: `oklch(0.9 0.002 60)` - 浅灰色边框
- **深色模式**: `oklch(0.3 0.02 240)` - 深灰色边框
- **用途**: 边框、分隔线

### 11. Input（输入框背景）
- **CSS 变量**: `--input`
- **Tailwind 类**: `bg-input`
- **浅色模式**: `oklch(0.96 0.002 60)` - 非常浅的灰色
- **深色模式**: `oklch(0.25 0.015 240)` - 深灰色
- **用途**: 输入框背景

### 12. Ring（焦点环）
- **CSS 变量**: `--ring`
- **Tailwind 类**: `ring-ring`, `focus-visible:ring-ring`
- **浅色模式**: `oklch(0.35 0.12 240)` - 深蓝色（与 primary 相同）
- **深色模式**: `oklch(0.55 0.18 240)` - 亮蓝色
- **用途**: 焦点状态、键盘导航指示

---

## 🎯 Card Colors（卡片颜色）

### Card Background
- **CSS 变量**: `--card`
- **Tailwind 类**: `bg-card`
- **浅色模式**: `oklch(0.99 0 0)` - 白色
- **深色模式**: `oklch(0.22 0.015 240)` - 深蓝灰色

### Card Foreground
- **CSS 变量**: `--card-foreground`
- **Tailwind 类**: `text-card-foreground`
- **用途**: 卡片内的文字颜色

---

## 📊 Chart Colors（图表颜色）

项目定义了 5 种图表颜色，用于数据可视化：

### Chart 1
- **CSS 变量**: `--chart-1`
- **浅色模式**: `oklch(0.35 0.12 240)` - 深蓝色
- **深色模式**: `oklch(0.55 0.18 240)` - 亮蓝色

### Chart 2
- **CSS 变量**: `--chart-2`
- **浅色模式**: `oklch(0.5 0.15 140)` - 青绿色
- **深色模式**: `oklch(0.6 0.16 140)` - 亮青绿色

### Chart 3
- **CSS 变量**: `--chart-3`
- **浅色模式**: `oklch(0.72 0.18 60)` - 金色
- **深色模式**: `oklch(0.78 0.22 50)` - 暖金色

### Chart 4
- **CSS 变量**: `--chart-4`
- **浅色模式**: `oklch(0.6 0.2 30)` - 橙红色
- **深色模式**: `oklch(0.65 0.18 30)` - 亮橙红色

### Chart 5
- **CSS 变量**: `--chart-5`
- **浅色模式**: `oklch(0.65 0.16 20)` - 橙黄色
- **深色模式**: `oklch(0.7 0.17 20)` - 亮橙黄色

---

## 🎯 项目中实际使用的颜色

### 主要使用的颜色

1. **Primary（主色 - 深蓝色）**
   - `bg-primary` - 主色背景（按钮、激活状态）
   - `text-primary` - 主色文字（标题、链接、强调）
   - `border-primary` - 主色边框
   - `bg-primary/10` - 主色10%透明度（状态标签背景、悬停效果）
   - `bg-primary/40` - 主色40%透明度（边框）
   - `bg-primary/50` - 主色50%透明度（边框）
   - `bg-primary/85` - 主色85%透明度（按钮悬停）
   - `hover:bg-primary/85` - 悬停时85%透明度

2. **Muted（灰色）**
   - `bg-muted` - 灰色背景（卡片、输入框、悬停状态）
   - `text-muted-foreground` - 灰色文字（标签、帮助文字、次要信息）
   - `bg-muted/30` - 灰色30%透明度（区域背景）

3. **Foreground（文字色）**
   - `text-foreground` - 主要文字颜色
   - `text-foreground/60` - 60%透明度（占位符、次要文字）

4. **Border（边框）**
   - `border-border` - 标准边框
   - `border-border/50` - 50%透明度边框

5. **状态颜色（Status Colors）**
   - **已导出**: `text-slate-700 bg-muted` - 深灰色文字 + 灰色背景
   - **待处理**: `text-primary bg-primary/10` - 主色文字 + 主色10%背景
   - **有问题**: `text-[#770002] bg-[#770002]/10` - 深红色文字 + 深红色10%背景

6. **其他实用颜色**
   - `bg-white` - 白色背景
   - `bg-gray-200` - 灰色背景（进度条）
   - `text-slate-600` / `text-slate-700` / `text-slate-900` - 石板灰系列
   - `text-red-500` - 红色（必填标记、错误）
   - `bg-black/50` - 黑色50%透明度（遮罩层）

## 🎨 常用颜色组合

### 文字颜色组合

```tsx
// 主要文字
<p className="text-foreground">主要文字</p>

// 次要文字/标签
<label className="text-muted-foreground">标签</label>

// 主色文字（用于标题、链接）
<h1 className="text-primary">标题</h1>

// 破坏性文字（错误、警告）
<span className="text-destructive">错误信息</span>
```

### 背景颜色组合

```tsx
// 页面背景
<div className="bg-background">页面内容</div>

// 卡片背景
<Card className="bg-card">卡片内容</Card>

// 静音背景（输入框、次要区域）
<div className="bg-muted">静音区域</div>

// 主色背景
<Button className="bg-primary text-primary-foreground">按钮</Button>
```

### 边框和分隔线

```tsx
// 标准边框
<div className="border border-border">有边框的元素</div>

// 主色边框
<div className="border border-primary">强调边框</div>
```

---

## 🎯 使用建议

### 1. 文字层次
- **主要文字**: `text-foreground` - 用于正文、重要信息
- **次要文字**: `text-muted-foreground` - 用于标签、帮助文字、副标题
- **强调文字**: `text-primary` - 用于标题、链接
- **错误文字**: `text-destructive` - 用于错误消息、警告

### 2. 背景层次
- **页面背景**: `bg-background` - 最底层
- **卡片背景**: `bg-card` 或 `bg-white` - 内容容器
- **静音背景**: `bg-muted` 或 `bg-muted/30` - 输入框、次要区域、区域背景
- **主色背景**: `bg-primary` - 按钮、强调元素
- **主色淡背景**: `bg-primary/10` - 状态标签、悬停效果

### 3. 交互状态
- **悬停（按钮）**: `hover:bg-primary/85` - 主色85%透明度
- **悬停（次要元素）**: `hover:bg-muted` - 灰色背景
- **悬停（边框按钮）**: `hover:bg-primary/10 hover:border-primary hover:text-primary` - 主色10%背景 + 主色边框和文字
- **焦点**: `focus-visible:ring-ring` - 使用 ring 颜色
- **激活**: `bg-primary text-white` - 主色背景 + 白色文字

### 4. 语义化颜色
- **成功**: 可以使用 `text-green-700` 或自定义（当前未定义）
- **错误**: `text-destructive` 或 `bg-destructive`
- **警告**: 可以使用 `text-yellow-600` 或自定义（当前未定义）
- **信息**: `text-primary` 或 `bg-primary`

---

## 🔍 透明度变体

所有颜色都支持透明度变体：

```tsx
// 50% 透明度
<div className="bg-primary/50">半透明主色</div>
<div className="text-foreground/80">80% 透明度文字</div>

// 常用透明度
- `/10` - 10% 透明度（非常淡）
- `/20` - 20% 透明度
- `/50` - 50% 透明度（半透明）
- `/80` - 80% 透明度
- `/90` - 90% 透明度
```

---

## 📝 实际使用示例

### 表单字段
```tsx
<label className="text-muted-foreground">字段标签</label>
<Input className="bg-input border-border" />
<p className="text-muted-foreground text-sm">帮助文字</p>
```

### 按钮
```tsx
// 主要按钮
<Button className="bg-primary text-primary-foreground">
  保存
</Button>

// 次要按钮
<Button variant="secondary" className="bg-secondary text-secondary-foreground">
  取消
</Button>

// 危险按钮
<Button variant="destructive" className="bg-destructive">
  删除
</Button>
```

### 卡片
```tsx
<Card className="bg-card border-border">
  <h2 className="text-card-foreground">卡片标题</h2>
  <p className="text-muted-foreground">卡片内容</p>
</Card>
```

### 状态标签（实际使用）
```tsx
// 已导出状态
<span className="text-slate-700 bg-muted">已導出</span>

// 待处理状态
<span className="text-primary bg-primary/10">待處理</span>

// 有问题状态
<span className="text-[#770002] bg-[#770002]/10">有問題</span>

// 必填标记
<span className="text-red-500">*</span>
```

---

## 🎨 颜色对比度（可访问性）

所有颜色都经过精心选择，确保：
- **WCAG AA 标准**: 文字和背景对比度至少 4.5:1
- **WCAG AAA 标准**: 大文字（18px+）对比度至少 3:1

### 推荐的文字/背景组合

| 文字颜色 | 背景颜色 | 对比度 | 用途 |
|---------|---------|--------|------|
| `text-foreground` | `bg-background` | ✅ 高 | 主要文字 |
| `text-muted-foreground` | `bg-background` | ✅ 中 | 次要文字 |
| `text-primary-foreground` | `bg-primary` | ✅ 高 | 主色按钮文字 |
| `text-destructive` | `bg-background` | ✅ 高 | 错误信息 |

---

## 🔄 深色模式支持

所有颜色都自动支持深色模式。只需在根元素添加 `.dark` 类：

```tsx
<html className="dark">
  {/* 所有颜色会自动切换到深色模式 */}
</html>
```

---

## 📚 相关文件

- CSS 变量定义: `app/globals.css`
- 设计系统文档: `DESIGN_SYSTEM.md`
- UI 组件: `components/ui/`

---

**最后更新**: 2024-11-18
**维护者**: 开发团队

