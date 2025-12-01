# 信众表单改进 - 实施指南

> **分支**: `devotee-form-improvments`  
> **完成日期**: 2024年12月1日  
> **状态**: ✅ 已完成实施

## 📋 概览

本次改进重构了牌位申请表单，实现了多步骤购物车式流程，支持在一次申请中添加多种类型的牌位，并采用了适老化UI设计。

## 🎯 核心功能

### 1. 多步骤流程
- **Step 1**: 申请人信息（姓名、电话）
- **Step 2**: 选择牌位类型（6种类型大卡片选择）
- **Step 3**: 填写与预览（动态表单 + 图片预览 + 大字确认）
- **Step 4**: 购物车清单总览与提交

### 2. 购物车模式
- ✅ 一个申请可包含多种类型的牌位
- ✅ 用户可以添加、预览、删除牌位
- ✅ localStorage自动保存进度（防止意外离开丢失数据）
- ✅ 按类型分组显示

### 3. 适老化设计
- 大输入框（h-16）
- 大字体（text-xl）
- 大按钮（h-14 至 h-16）
- 整个卡片都是点击热区
- 明确的视觉反馈
- 粘性底部按钮（移动端）

### 4. 灵活配置系统
- 牌位类型配置化（`lib/tablet-types-config.ts`）
- 后期修改字段只需更新配置文件
- 不需要修改组件代码

## 🗂️ 文件结构

### 新增文件

#### 数据库迁移
- `supabase/migrations/20241201_rename_plaque_to_tablet.sql`
  - 将所有 `plaque` 重命名为 `tablet`
  - 更新表名、字段名、索引、注释

- `supabase/migrations/20241201_add_tablet_type_to_name.sql`
  - 给 `application_name` 表添加 `tablet_type` 字段
  - 支持一个 application 包含多种类型的牌位

#### 配置系统
- `lib/tablet-types-config.ts`
  - 牌位类型配置
  - 表单字段定义
  - 验证规则
  - 辅助函数

#### 存储工具
- `lib/utils/application-storage.ts`
  - localStorage 管理
  - 购物车操作（添加、删除、清空）
  - 申请人信息管理

#### UI 组件
- `components/apply/ApplicantInfoStep.tsx` - Step 1
- `components/apply/TabletTypeSelector.tsx` - Step 2
- `components/apply/TabletFormStep.tsx` - Step 3
- `components/apply/CartReviewStep.tsx` - Step 4

### 修改文件

- `app/apply/[slug]/page.tsx`
  - 完全重构为单页应用
  - 步骤式导航
  - URL保持不变

- `app/apply/[slug]/actions.ts`
  - 新增 `submitMultiTypeApplication` 函数
  - 支持多类型牌位提交
  - 保留旧函数以向后兼容

- `app/apply/success/[id]/page.tsx`
  - 更新为使用 `tablet` 命名
  - 支持多类型显示
  - 按类型分组展示

- `app/globals.css`
  - 添加适老化样式类
  - `.form-step-title`
  - `.form-input-large`
  - `.btn-primary-elder`
  - `.preview-text-large`
  - 等等

## 🚀 部署步骤

### 1. 数据库迁移

运行两个迁移文件（按顺序）：

```bash
# 在 Supabase Dashboard > SQL Editor 中执行

# 1. 重命名 plaque -> tablet
-- 执行 supabase/migrations/20241201_rename_plaque_to_tablet.sql

# 2. 添加 tablet_type 字段
-- 执行 supabase/migrations/20241201_add_tablet_type_to_name.sql
```

### 2. 验证数据库更改

```sql
-- 验证表已重命名
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('tablet_job', 'tablet_chunk', 'tablet_template', 'tablet_asset');

-- 验证 application_name 表结构
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'application_name' AND column_name = 'tablet_type';

-- 验证 application 表字段已重命名
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'application' AND column_name = 'tablet_type';
```

### 3. 部署代码

```bash
# 确保在正确的分支
git checkout devotee-form-improvments

# 推送到远程
git push origin devotee-form-improvments

# 在 Vercel 部署（如果配置了自动部署）
# 或手动触发部署
```

### 4. 测试清单

#### 4.1 Step 1 - 申请人信息
- [ ] 输入姓名和电话
- [ ] 验证必填项
- [ ] 验证电话格式
- [ ] 点击"下一步"进入 Step 2
- [ ] 刷新页面，数据应该保留

#### 4.2 Step 2 - 选择牌位类型
- [ ] 显示6种牌位类型卡片
- [ ] 点击任意类型进入 Step 3
- [ ] 返回按钮回到 Step 1
- [ ] 如果已有牌位，显示购物车徽章和数量

#### 4.3 Step 3 - 填写与预览
- [ ] **填写态**: 根据牌位类型显示动态表单
- [ ] 输入数据并点击"生成牌位预览"
- [ ] **预览态**: 显示牌位图片
- [ ] 显示大字确认文本（32px）
- [ ] 点击"返回修改"回到填写态
- [ ] 点击"确认无误"添加到购物车
- [ ] **确认态**: 显示成功消息
- [ ] 三个选项：继续添加同类型、选择其他类型、查看清单

#### 4.4 Step 4 - 购物车清单
- [ ] 显示申请人信息
- [ ] 按类型分组显示所有牌位
- [ ] 每个牌位旁边有删除按钮
- [ ] 点击删除（两次确认）
- [ ] 显示总数统计
- [ ] 点击"确认提交申请"
- [ ] 提交成功后清空 localStorage
- [ ] 跳转到成功页面

#### 4.5 成功页面
- [ ] 显示成功图标和消息
- [ ] 显示总数
- [ ] 按类型分组显示所有牌位预览图
- [ ] 每个类型显示数量
- [ ] 返回表单按钮

#### 4.6 数据持久化测试
- [ ] 填写部分数据后关闭浏览器
- [ ] 重新打开，数据应该还在
- [ ] 提交成功后，localStorage应该被清空

#### 4.7 多类型测试
- [ ] 添加2个长生祿位
- [ ] 添加3个往生蓮位
- [ ] 添加1个冤親債主
- [ ] 查看购物车，应该显示6个牌位
- [ ] 提交成功
- [ ] 在成功页面应该按类型分组显示

#### 4.8 错误处理
- [ ] 不填写姓名尝试下一步 → 显示错误
- [ ] 不填写电话尝试下一步 → 显示错误
- [ ] 不填写牌位名字尝试预览 → 显示错误
- [ ] 冤親債主输入"闔家"→ 显示验证错误
- [ ] 空购物车尝试提交 → 显示错误

## 🔧 配置更新

### 更新牌位类型字段

要修改牌位类型的表单字段，只需编辑 `lib/tablet-types-config.ts`：

```typescript
{
  value: 'longevity',
  label: '長生祿位',
  description: '為在世親友祈福',
  fields: [
    {
      name: 'name',
      label: '祈福受益人姓名',
      type: 'text',
      required: true,
      placeholder: '例如：陳小華',
      helpText: '請輸入祈福對象的姓名（最多8個字）',
      maxLength: 8,
    },
    // 添加更多字段...
  ],
  previewFields: ['name'],
}
```

支持的字段类型：
- `text` - 单行文本
- `textarea` - 多行文本
- `select` - 下拉选择（需要配置 options）
- `number` - 数字

## 📊 技术架构

### 状态管理
- React State: 控制当前步骤、表单数据
- localStorage: 持久化存储（防止数据丢失）

### 数据流
```
用户输入 → localStorage → React State → 提交 → Supabase → 成功页面 → 清空 localStorage
```

### 数据库结构
```
application (1)
  ├─ applicant_name (姓名)
  ├─ phone (电话)
  └─ tablet_type (主要类型，向后兼容)

application_name (N)
  ├─ application_id (外键)
  ├─ display_name (显示名称)
  ├─ tablet_type (该牌位的类型) ← 新增
  ├─ order_index (顺序)
  └─ is_main (是否主名)
```

## 🎨 设计系统

### 适老化样式类

| 类名 | 用途 | 规格 |
|------|------|------|
| `.form-step-title` | 步骤标题 | 32px, 粗体 |
| `.form-input-large` | 大输入框 | h-16, text-xl |
| `.btn-primary-elder` | 主按钮 | h-16, text-xl, 圆角大 |
| `.preview-text-large` | 预览确认文本 | 32px, 粗体, 字间距 |
| `.card-button` | 卡片按钮 | 触摸友好，整个卡片可点击 |

### 颜色系统
- 主色：深蓝色（佛教风格）
- 强调色：金黄色
- 成功色：绿色
- 错误色：红色

## 🐛 已知问题与限制

1. **localStorage 限制**
   - 浏览器清理数据后会丢失
   - 无痕模式可能不可用
   - 解决方案：提示用户不要清理浏览器数据

2. **向后兼容**
   - 旧的单类型提交函数仍然保留
   - `application.tablet_type` 字段保留为主类型
   - 实际类型存储在 `application_name.tablet_type`

3. **待完善功能**
   - 往生蓮位的称谓下拉框（需要后期配置）
   - 嬰靈排位的父母姓名字段（需要后期配置）
   - 地基主的详细地址验证（需要后期配置）

## 📱 移动端优化

- 粘性底部按钮（主操作按钮）
- 响应式布局（单列 → 双列）
- 触摸友好的点击热区（最小 44x44px）
- 滚动到视图（防止键盘遮挡）

## 🔒 安全性

- ✅ Server Actions（防止 CSRF）
- ✅ 输入验证（前端 + 后端）
- ✅ SQL 参数化查询（防止 SQL 注入）
- ✅ RLS 策略（数据库层权限控制）

## 📈 性能优化

- localStorage 而非服务器草稿（减少数据库负载）
- 单页应用（无页面刷新）
- 懒加载图片（预览图按需生成）
- 客户端验证（减少服务器请求）

## 🎉 完成状态

- ✅ 数据库迁移（2个文件）
- ✅ 配置系统（灵活可扩展）
- ✅ localStorage 工具（完整功能）
- ✅ Step 1 组件（申请人信息）
- ✅ Step 2 组件（类型选择）
- ✅ Step 3 组件（填写预览）
- ✅ Step 4 组件（购物车清单）
- ✅ 主页面重构（单页应用）
- ✅ 提交逻辑（多类型支持）
- ✅ 成功页面（多类型展示）
- ✅ 适老化样式（完整）
- ✅ 无 Linter 错误

## 📞 支持

如有问题，请联系开发团队或查看相关文档：
- `TABLET_FORM_GUIDELINES.md` - 牌位表单填写指南
- `TABLET_RENDERING_GUIDE.md` - 牌位渲染指南
- `PRD.md` - 产品需求文档

---

**实施完成** ✨

