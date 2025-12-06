-- ============================================================================
-- 安全版本：先检查，避免重复创建错误
-- ============================================================================

-- 步骤 1: 检查 bucket 是否已存在
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'tablet-images';

-- 如果上面查询返回了结果，说明 bucket 已存在，可以跳过步骤 2
-- 如果没有结果，继续执行步骤 2

-- ============================================================================
-- 步骤 2: 创建 bucket（如果不存在）
-- ============================================================================

-- 如果 bucket 已存在，这行会报错，可以忽略
-- 如果 bucket 不存在，这行会成功创建
INSERT INTO storage.buckets (id, name, public)
VALUES ('tablet-images', 'tablet-images', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 步骤 3: 删除旧策略（如果存在，避免重复创建错误）
-- ============================================================================

DROP POLICY IF EXISTS "Anonymous users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read images" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access" ON storage.objects;

-- ============================================================================
-- 步骤 4: 创建新的策略
-- ============================================================================

-- 2. 允许匿名用户上传图片（申请表单是公开的，不需要登录）
CREATE POLICY "Anonymous users can upload images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'tablet-images' );

-- 3. 允许认证用户上传图片（管理员等）
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'tablet-images' );

-- 4. 允许匿名用户读取图片（用于预览确认页面）
-- 注意：由于 URL 包含随机字符串，很难被猜测
-- 如果需要更严格的安全，可以通过 application 表关联限制
CREATE POLICY "Anonymous users can read images"
ON storage.objects FOR SELECT
TO anon
USING ( bucket_id = 'tablet-images' );

-- 5. 允许认证用户读取图片（管理员查看）
CREATE POLICY "Authenticated users can read images"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'tablet-images' );

-- 6. 允许通过 service role 执行所有操作（服务端操作，如 PDF 生成）
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING ( bucket_id = 'tablet-images' )
WITH CHECK ( bucket_id = 'tablet-images' );

-- ============================================================================
-- 步骤 5: 验证设置
-- ============================================================================

-- 检查 bucket
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'tablet-images';

-- 检查策略
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%tablet-images%' 
  OR policyname LIKE '%Anonymous%'
  OR policyname LIKE '%Authenticated%'
  OR policyname LIKE '%Service role%';

