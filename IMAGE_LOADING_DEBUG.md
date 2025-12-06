# 图片加载问题诊断

## ✅ 已修复的问题

1. **移除了所有动态生成回退** - 确保只使用保存的 Supabase Storage URL
2. **添加了 URL 验证** - 确保 URL 格式正确
3. **改进了错误处理** - 如果图片缺失或加载失败，显示明确的错误信息

## 🔍 诊断步骤

如果图片仍然无法加载，请按以下步骤检查：

### 1. 检查图片是否真的上传成功

在 Supabase Dashboard：
- Storage → tablet-images
- 查看是否有对应的图片文件
- 文件名格式：`[timestamp]-[type]-[random].png`

### 2. 检查 URL 格式

保存的 URL 应该是：
```
https://[project-id].supabase.co/storage/v1/object/public/tablet-images/[filename].png
```

**示例**：
```
https://zwlszoowwyjdorezgath.supabase.co/storage/v1/object/public/tablet-images/1765045688202-longevity-hvg43o3ro.png
```

### 3. 直接在浏览器中测试 URL

1. 复制图片 URL
2. 在新标签页中打开
3. 检查：
   - ✅ 如果能看到图片 → URL 正确，问题在代码
   - ❌ 如果看到 403/404 → 权限或文件不存在问题

### 4. 检查浏览器控制台

打开 DevTools (F12) → Console，查看：
- 是否有 CORS 错误
- 是否有 403/404 错误
- 是否有其他网络错误

### 5. 检查 RLS 策略

在 Supabase SQL Editor 中运行：

```sql
-- 检查策略是否存在
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (qual::text LIKE '%tablet-images%' OR with_check::text LIKE '%tablet-images%');

-- 应该看到：
-- - Anonymous users can read images (anon)
-- - Authenticated users can read images (authenticated)
```

### 6. 测试图片访问权限

在浏览器控制台中运行（在申请页面）：

```javascript
// 测试图片 URL 访问
const testUrl = 'https://zwlszoowwyjdorezgath.supabase.co/storage/v1/object/public/tablet-images/1765045688202-longevity-hvg43o3ro.png'

fetch(testUrl)
  .then(response => {
    console.log('Status:', response.status)
    console.log('Headers:', [...response.headers.entries()])
    return response.blob()
  })
  .then(blob => console.log('Success! Image size:', blob.size))
  .catch(error => console.error('Error:', error))
```

## 🐛 常见问题

### 问题 1: 403 Forbidden

**原因**：RLS 策略没有正确应用或 bucket 权限设置错误

**解决**：
1. 检查 bucket 是否为 `public = false`（应该是 false，private）
2. 检查 RLS 策略是否正确创建
3. 重新运行迁移 SQL

### 问题 2: 404 Not Found

**原因**：图片文件不存在

**解决**：
1. 检查 Supabase Storage 中是否有文件
2. 检查文件名是否正确
3. 重新上传图片

### 问题 3: CORS 错误

**原因**：跨域请求被阻止

**解决**：
1. 检查 Supabase 项目设置中的 CORS 配置
2. 确保允许你的域名访问

### 问题 4: 图片 URL 格式错误

**原因**：`getPublicUrl` 返回了错误的格式

**解决**：
1. 检查 Supabase Storage API 版本
2. 确保使用正确的 bucket 名称

## 🔧 临时解决方案（仅用于测试）

如果图片确实无法通过 public URL 访问，可以尝试使用 signed URL（但这不是最终方案）：

```typescript
// 在 TabletFormStep.tsx 中
const { data: signedUrlData } = await supabase.storage
  .from('tablet-images')
  .createSignedUrl(fileName, 3600) // 1小时有效期

const imageUrl = signedUrlData?.signedUrl
```

**注意**：signed URL 有过期时间，不适合永久存储。应该修复 RLS 策略让 public URL 正常工作。

## ✅ 正确的流程

1. 用户填写表单 → 生成图片
2. 上传到 Supabase Storage → 获取 **public URL**
3. 保存 public URL 到 localStorage
4. 预览确认页面 → 使用 **相同的 public URL**
5. 提交到数据库 → 保存 **相同的 public URL**
6. 管理员查看 → 使用 **相同的 public URL**
7. PDF 导出 → 使用 **相同的 public URL**

**关键**：所有地方使用 **完全相同的 URL**，确保图片一致性！

