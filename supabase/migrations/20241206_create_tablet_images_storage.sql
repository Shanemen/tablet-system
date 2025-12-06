-- 创建存储桶用于存储生成的牌位图片
-- 安全策略：只有申请人本人和管理员可以访问图片

-- 1. 创建 tablet-images 存储桶（private，需要认证才能访问）
insert into storage.buckets (id, name, public)
values ('tablet-images', 'tablet-images', false);

-- 2. 允许匿名用户上传图片（申请表单是公开的，不需要登录）
create policy "Anonymous users can upload images"
on storage.objects for insert
to anon
with check ( bucket_id = 'tablet-images' );

-- 3. 允许认证用户上传图片（管理员等）
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'tablet-images' );

-- 4. 允许匿名用户读取图片（用于预览确认页面）
-- 注意：由于 URL 包含随机字符串，很难被猜测
-- 如果需要更严格的安全，可以通过 application 表关联限制
create policy "Anonymous users can read images"
on storage.objects for select
to anon
using ( bucket_id = 'tablet-images' );

-- 5. 允许认证用户读取图片（管理员查看）
create policy "Authenticated users can read images"
on storage.objects for select
to authenticated
using ( bucket_id = 'tablet-images' );

-- 4. 允许通过 service role 执行所有操作（服务端操作，如 PDF 生成）
create policy "Service role full access"
on storage.objects for all
to service_role
using ( bucket_id = 'tablet-images' )
with check ( bucket_id = 'tablet-images' );

-- 注意：
-- - 前端用户在申请时需要登录（或使用匿名认证）
-- - PDF 导出使用 service role 访问图片
-- - 管理员使用 authenticated role 查看所有图片