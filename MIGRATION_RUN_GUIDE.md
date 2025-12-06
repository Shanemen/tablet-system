# 如何运行 Storage Bucket 迁移

## 快速步骤

### 1. 打开 Supabase Dashboard
- 访问 https://supabase.com/dashboard
- 选择你的项目

### 2. 打开 SQL Editor
- 左侧菜单 → **SQL Editor**
- 点击 **"New query"**

### 3. 运行迁移

**选项 A：使用安全版本（推荐）**
- 打开文件：`supabase/migrations/20241206_create_tablet_images_storage_SAFE.sql`
- 复制全部内容
- 粘贴到 SQL Editor
- 点击 **Run**（或按 `Cmd + Enter` / `Ctrl + Enter`）

**选项 B：使用原始版本**
- 打开文件：`supabase/migrations/20241206_create_tablet_images_storage.sql`
- 复制全部内容
- 粘贴到 SQL Editor
- 点击 **Run**

### 4. 验证结果

运行这个查询来验证：

```sql
-- 检查 bucket 是否创建成功
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'tablet-images';

-- 应该返回一行：id='tablet-images', public=false
```

然后在 Supabase Dashboard 中：
- 左侧菜单 → **Storage**
- 应该看到 **tablet-images** bucket
- 点击进入，查看是否显示为 **Private**

## 常见错误

### 错误：duplicate key value violates unique constraint
**原因**：bucket 已经存在

**解决**：
1. 使用安全版本（`_SAFE.sql`），它会自动处理
2. 或者先删除旧 bucket：
   ```sql
   DELETE FROM storage.buckets WHERE id = 'tablet-images';
   ```
   然后重新运行迁移

### 错误：policy already exists
**原因**：策略已经存在

**解决**：
1. 使用安全版本（`_SAFE.sql`），它会先删除旧策略
2. 或者手动删除：
   ```sql
   DROP POLICY IF EXISTS "Anonymous users can upload images" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
   DROP POLICY IF EXISTS "Anonymous users can read images" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can read images" ON storage.objects;
   DROP POLICY IF EXISTS "Service role full access" ON storage.objects;
   ```

## 验证清单

运行迁移后，确认：

- [ ] ✅ Bucket `tablet-images` 已创建
- [ ] ✅ Bucket 设置为 Private（public = false）
- [ ] ✅ 5 个策略都已创建：
  - [ ] Anonymous users can upload images
  - [ ] Authenticated users can upload images
  - [ ] Anonymous users can read images
  - [ ] Authenticated users can read images
  - [ ] Service role full access

## 测试上传

迁移成功后，可以测试图片上传功能：

1. 启动开发服务器：`npm run dev`
2. 访问申请页面
3. 填写牌位信息并点击「確認，加入清單」
4. 检查 Supabase Storage → tablet-images bucket
5. 应该看到新上传的图片文件

## 下一步

迁移成功后：
1. ✅ 测试前端图片上传功能
2. ✅ 验证图片 URL 正确保存到数据库
3. ✅ 测试预览确认页面显示图片
4. ✅ 测试管理后台读取图片

