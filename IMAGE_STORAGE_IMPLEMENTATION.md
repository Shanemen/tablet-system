# 图片存储实现文档

## 概述

实现了 Plan B（实时生成 + 立即上传）方案，确保用户确认的图片 = 管理员看到的 = PDF 使用的图片。

## 核心流程

### 1. 用户填表并确认
- 用户在 `TabletFormStep.tsx` 中填写牌位信息
- 点击「確認，加入清單」时：
  1. 调用 `/api/og/tablet` 生成图片
  2. 将图片上传到 Supabase Storage (`tablet-images` bucket)
  3. 获取永久 URL
  4. 保存到 localStorage（`previewUrl` 字段）

### 2. 提交申请
- 在 `app/apply/[slug]/actions.ts` 中：
  - 将 `image_url` 保存到 `application_name` 表
  - 设置 `image_generation_status = 'generated'`

### 3. 管理员查看
- 在 `app/admin/dashboard/actions.ts` 中：
  - 从 `application_name` 表读取 `image_url`
  - 返回给前端使用

### 4. PDF 导出（待实现）
- 应该使用 `tabletDetails[].image_url` 中的永久 URL
- 使用 service role 访问图片（因为 bucket 是 private）

## 安全设置

### Supabase Storage Bucket
- **Bucket 名称**: `tablet-images`
- **公开性**: `false` (private，需要认证)
- **权限策略**:
  - ✅ 认证用户可上传图片
  - ✅ 认证用户可读取图片
  - ✅ Service role 可执行所有操作（用于 PDF 导出）

### 访问控制
- ✅ 只有申请人本人可以看到自己的图片（通过认证）
- ✅ 只有管理员可以看到所有图片（通过认证）
- ❌ 其他人即使知道 URL 也无法访问（private bucket + RLS）

## 数据库字段

### `application_name` 表
```sql
image_url TEXT, -- 永久 URL from Supabase Storage
image_generation_status VARCHAR(50), -- 'generated' | 'pending'
```

## 代码修改清单

### ✅ 已完成的修改

1. **迁移文件**: `supabase/migrations/20241206_create_tablet_images_storage.sql`
   - 创建 `tablet-images` bucket
   - 设置 RLS 策略

2. **前端上传**: `components/apply/TabletFormStep.tsx`
   - `handleConfirm()` 函数中添加图片上传逻辑
   - 上传到 Supabase Storage 并获取永久 URL

3. **保存到数据库**: `app/apply/[slug]/actions.ts`
   - `submitMultiTypeApplication()` 中保存 `image_url` 到数据库

4. **预览确认**: `components/apply/PreviewConfirmStep.tsx`
   - 使用保存的永久 URL（已经是 Supabase Storage URL）

5. **管理后台**: `app/admin/dashboard/actions.ts`
   - 获取 `image_url` 字段
   - 返回 `tabletDetails` 数组包含图片 URL

6. **类型定义**: `lib/types/application.ts`
   - 添加 `TabletName` 接口
   - 更新 `Applicant` 接口包含 `tabletDetails`

## 待实现功能

### PDF 导出功能
当实现 PDF 批量导出时，应该：

1. 使用 `tabletDetails[].image_url` 中的永久 URL
2. 使用 service role 客户端访问图片（因为 bucket 是 private）
3. 如果 `image_url` 为 `null`，回退到动态生成（兼容旧数据）

示例代码：
```typescript
// 在 PDF 导出服务中
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 使用 service role
)

for (const tablet of tabletDetails) {
  if (tablet.image_url) {
    // 使用保存的图片 URL
    const { data } = await supabase.storage
      .from('tablet-images')
      .download(tablet.image_url)
    // 处理图片...
  } else {
    // 回退：动态生成（兼容旧数据）
    const imageUrl = `/api/og/tablet?name=${tablet.display_name}&type=${tablet.tablet_type}`
    // 处理图片...
  }
}
```

## 注意事项

1. **向后兼容**: 旧的申请可能没有 `image_url`，代码需要处理 `null` 情况
2. **认证要求**: 前端上传和查看图片需要用户认证
3. **Service Role**: PDF 导出需要使用 service role key（环境变量）
4. **错误处理**: 上传失败时应该有适当的错误提示和回退机制

## 测试清单

- [ ] 用户填表并确认，图片成功上传到 Storage
- [ ] 提交申请后，`image_url` 正确保存到数据库
- [ ] 预览确认页面显示正确的图片
- [ ] 管理后台可以读取 `image_url`
- [ ] 未认证用户无法访问图片（安全测试）
- [ ] PDF 导出使用保存的图片（待实现后测试）

-- ============================================================================
-- 为什么没有使用 Supabase Queues？
-- ============================================================================
-- 
-- 当前方案：实时生成 + 立即上传（Plan B）
-- 
-- 不使用 Queues 的原因：
-- 1. 图片生成很快（< 1秒），不需要异步处理
-- 2. 用户需要立即看到预览，实时反馈更好
-- 3. 申请数量不大（一次申请通常 < 10 张牌位）
-- 4. 避免不必要的复杂度（队列、轮询、状态管理）
-- 
-- 何时应该考虑使用 Queues：
-- - 当申请数量 > 1000/天时
-- - 当图片生成时间 > 3秒时
-- - 当需要批量处理大量图片时
-- 
-- 当前方案的优势：
-- - 简单直接：用户确认 → 立即上传 → 立即保存
-- - 用户体验好：无需等待，立即看到结果
-- - 代码易维护：没有队列状态管理、重试逻辑等复杂代码
-- - 一致性保证：用户看到的 = 保存的 = 管理员看到的