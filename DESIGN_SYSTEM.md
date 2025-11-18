# 设计系统规范 (Design System)

本文档定义了淨土道場牌位系統的视觉设计规范，确保整个产品的一致性和可访问性（特别是针对老年用户）。

## 📐 设计原则

1. **可访问性优先**：所有设计决策都考虑老年用户的阅读和使用需求
2. **一致性**：在整个应用中保持统一的视觉语言
3. **清晰度**：高对比度、大字体、清晰的层次结构

---

## 🎨 Typography（字体系统）

### 主标题 (Page Title)
- **用途**: 页面主标题
- **类名**: `.page-title`
- **大小**: `text-3xl sm:text-4xl` (30px/36px → 36px/40px)
- **粗细**: `font-bold`
- **颜色**: `text-primary`
- **间距**: `mb-2`

**示例**:
```tsx
<h1 className="page-title">法会编辑</h1>
```

### 副标题 (Page Subtitle)
- **用途**: 页面副标题或描述
- **类名**: `.page-subtitle`
- **大小**: `text-base` (16px)
- **颜色**: `text-muted-foreground`
- **间距**: 无（跟随父元素）

**示例**:
```tsx
<p className="page-subtitle">编辑当前法会信息</p>
```

### 章节标题 (Section Title)
- **用途**: 页面内的章节标题
- **类名**: `.section-title`
- **大小**: `text-lg` (18px)
- **粗细**: `font-semibold`
- **颜色**: `text-foreground`

**示例**:
```tsx
<h2 className="section-title">統計總覽</h2>
```

### 表单标签 (Form Label)
- **用途**: 表单字段标签
- **类名**: `.form-label`
- **大小**: `text-base` (16px)
- **颜色**: `text-muted-foreground` (灰色，降低视觉权重)
- **间距**: `mb-3`

**示例**:
```tsx
<label className="form-label">
  法会名称（中文）
  <span className="text-red-500 ml-1">*</span>
</label>
```

### 表单输入框文字 (Form Input Text)
- **用途**: 输入框内的文字
- **类名**: `.form-input`
- **大小**: `text-lg` (18px) - 更大字体便于阅读
- **内边距**: `py-3`
- **高度**: `h-auto` (自适应)

**示例**:
```tsx
<Input className="form-input" />
```

### 帮助文字 (Help Text)
- **用途**: 表单字段下方的说明文字
- **类名**: `.form-help-text`
- **大小**: `text-sm` (14px)
- **颜色**: `text-muted-foreground`

**示例**:
```tsx
<p className="form-help-text">超过此时间后，申请表单将自动关闭</p>
```

---

## 📏 Spacing（间距系统）

### 页面容器 (Page Container)
- **类名**: `.page-container`
- **Padding**: `p-6 sm:p-8` (24px → 32px)
- **背景**: `bg-background`
- **最小高度**: `min-h-screen`

### 内容容器宽度
- **标准宽度**: `.page-content` → `max-w-6xl` (1152px)
- **窄宽度**: `.page-content-narrow` → `max-w-3xl` (768px)
  - 用于表单页面（如法会编辑）

### 页面标题区域
- **类名**: `.page-header`
- **间距**: `mb-8` (32px)

### 表单字段间距
- **类名**: `.form-section`
- **间距**: `space-y-6` (24px 垂直间距)

### 按钮组
- **类名**: `.button-group`
- **布局**: `flex justify-end gap-4`
- **顶部间距**: `pt-6`

---

## 🎨 Colors（颜色系统）

### 标签文字颜色
- **标准**: `text-muted-foreground` (灰色，降低视觉权重)
- **副标题**: `text-foreground/80` (主文字颜色，80% 透明度)

### 必填字段标记
- **颜色**: `text-red-500`
- **用法**: `<span className="text-red-500 ml-1">*</span>`

### 主要文字
- **标准**: `text-foreground`
- **次要**: `text-muted-foreground`

---

## 🔘 Buttons（按钮系统）

### 主要按钮 (Primary Button - Large)
- **类名**: `.btn-primary-large`
- **大小**: `text-base px-8 py-3`
- **粗细**: `font-semibold`
- **颜色**: `bg-primary hover:bg-primary/85`
- **效果**: `hover:shadow-md transition-all`

**示例**:
```tsx
<Button className="btn-primary-large">保存修改</Button>
```

### 次要按钮 (Secondary Button - Large)
- **类名**: `.btn-secondary-large`
- **大小**: `text-base px-6 py-3`
- **变体**: 使用 `variant="outline"`

**示例**:
```tsx
<Button variant="outline" className="btn-secondary-large">重置</Button>
```

---

## 📱 Layout Components（布局组件）

### 页面布局结构

```tsx
// 标准页面（列表页面）
<div className="page-container">
  <div className="page-content">
    <div className="page-header">
      <h1 className="page-title">页面标题</h1>
      <p className="page-subtitle">页面描述</p>
    </div>
    {/* 页面内容 */}
  </div>
</div>

// 表单页面（窄宽度）
<div className="page-container">
  <div className="page-content-narrow">
    <div className="page-header">
      <h1 className="page-title">表单标题</h1>
      <p className="page-subtitle">表单描述</p>
    </div>
    <Card className="p-6">
      <form className="form-section">
        {/* 表单字段 */}
      </form>
    </Card>
  </div>
</div>
```

---

## 🔄 Loading States（加载状态）

### 加载容器
- **类名**: `.loading-container`
- **布局**: 居中显示

### 加载文字
- **类名**: `.loading-text`
- **大小**: `text-xl`
- **布局**: `flex items-center gap-3`

**示例**:
```tsx
<div className="loading-container">
  <div className="loading-text">
    <Loader2 className="h-6 w-6 animate-spin" />
    载入中...
  </div>
</div>
```

---

## 📋 使用指南

### 何时使用标准宽度 vs 窄宽度？

- **标准宽度** (`max-w-6xl`): 
  - 列表页面（如牌位管理、申请列表）
  - 需要显示大量数据的页面
  - 需要多列布局的页面

- **窄宽度** (`max-w-3xl`):
  - 表单页面（如法会编辑）
  - 详情页面
  - 单列内容页面

### 字体大小选择

- **主标题**: 始终使用 `.page-title` (响应式：移动端 30px，桌面端 36px)
- **表单输入**: 始终使用 `text-lg` (18px) 以提高可读性
- **标签**: 使用 `text-base` (16px) 配合 `text-muted-foreground` 颜色

### 间距规则

- **页面标题区域**: 始终使用 `mb-8` (32px)
- **表单字段之间**: 使用 `space-y-6` (24px)
- **按钮组**: 使用 `gap-4` (16px) 和 `pt-6` (24px)

---

## 🎯 一致性检查清单

在创建新页面时，请检查：

- [ ] 使用了 `.page-title` 作为主标题
- [ ] 使用了 `.page-subtitle` 作为副标题
- [ ] 表单标签使用了 `.form-label`
- [ ] 输入框使用了 `.form-input`
- [ ] 按钮使用了 `.btn-primary-large` 或 `.btn-secondary-large`
- [ ] 页面容器使用了 `.page-container` 和适当的宽度类
- [ ] 间距符合规范（`mb-8` 用于标题区域，`space-y-6` 用于表单）

---

## 📚 相关文件

- CSS 工具类定义: `app/globals.css`
- UI 组件库: `components/ui/`
- 布局组件: `components/admin/` (待创建)

---

**最后更新**: 2024-11-18
**维护者**: 开发团队

