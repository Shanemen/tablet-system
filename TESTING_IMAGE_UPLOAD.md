# 测试图片上传功能

## ✅ 准备工作已完成

- [x] Supabase Storage bucket `tablet-images` 已创建
- [x] Bucket 设置为 Private（安全）
- [x] 所有策略已配置
- [x] 开发服务器已启动

## 🧪 测试步骤

### 1. 确保有测试法会数据

在 Supabase SQL Editor 中运行（如果还没有）：

```sql
-- 检查是否有法会数据
SELECT id, name_zh, slug, deadline_at, status 
FROM ceremony 
WHERE status = 'active';

-- 如果没有，创建一个测试法会
INSERT INTO ceremony (name_zh, name_en, slug, start_at, deadline_at, location, status) 
VALUES (
  '2024年12月測試法會', 
  '2024 December Test Ceremony', 
  'test-ceremony-2024-12', 
  '2024-12-31 14:00:00', 
  '2024-12-30 23:59:59', 
  '淨土道場', 
  'active'
)
ON CONFLICT (slug) DO NOTHING;
```

### 2. 访问申请页面

**从 localhost 测试**（推荐）：
```
http://localhost:3000/apply/test-ceremony-2024-12
```

或者使用已有的法会 slug（如果有）：
```
http://localhost:3000/apply/[你的法会slug]
```

**从手机测试**（需要同一网络）：
1. 找到你的电脑 IP 地址：
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```
2. 在手机浏览器访问：
   ```
   http://[你的IP]:3000/apply/test-ceremony-2024-12
   ```

### 3. 测试流程

1. **填写申请人信息**
   - 姓名：测试用户
   - 电话：0912345678
   - 点击「下一步」

2. **选择牌位类型**
   - 点击任意一个牌位类型（例如「長生祿位」）
   - 点击「添加」

3. **填写牌位信息**
   - 填写名字（例如：王大明）
   - 点击「預覽牌位」
   - 等待预览图片生成

4. **确认并上传** ⭐ **关键步骤**
   - 点击「確認，加入清單」
   - **观察浏览器控制台**（F12 → Console）
   - 应该看到：
     - ✅ 图片生成成功
     - ✅ 上传成功（没有错误）
     - ✅ 获取到永久 URL

5. **验证上传**
   - 打开 Supabase Dashboard
   - 进入 **Storage** → **tablet-images**
   - 应该看到新上传的图片文件（文件名类似：`1234567890-longevity-abc123.png`）

6. **继续测试**
   - 添加更多牌位（不同类型）
   - 查看预览确认页面
   - 最终提交申请

### 4. 检查数据库

提交申请后，在 SQL Editor 中运行：

```sql
-- 查看最新的申请
SELECT 
  a.id,
  a.applicant_name,
  a.phone,
  a.created_at,
  COUNT(an.id) as tablet_count
FROM application a
LEFT JOIN application_name an ON an.application_id = a.id
GROUP BY a.id, a.applicant_name, a.phone, a.created_at
ORDER BY a.created_at DESC
LIMIT 5;

-- 查看牌位和图片 URL
SELECT 
  an.id,
  an.display_name,
  an.tablet_type,
  an.image_url,
  an.image_generation_status,
  CASE 
    WHEN an.image_url IS NOT NULL THEN '✅ 有图片'
    ELSE '❌ 无图片'
  END as status
FROM application_name an
ORDER BY an.id DESC
LIMIT 10;
```

**期望结果**：
- ✅ `image_url` 不为空
- ✅ `image_url` 包含 Supabase Storage URL
- ✅ `image_generation_status = 'generated'`

## 🐛 常见问题排查

### 问题 1: 上传失败，控制台显示错误

**检查**：
1. 打开浏览器 DevTools（F12）→ Console
2. 查看错误信息

**可能原因**：
- ❌ Supabase 环境变量未配置
- ❌ Bucket 名称不匹配
- ❌ 权限策略未正确设置

**解决**：
```bash
# 检查环境变量
cat .env.local | grep SUPABASE

# 应该看到：
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 问题 2: 图片生成失败

**检查**：
- `/api/og/tablet` 路由是否正常工作
- 访问：`http://localhost:3000/api/og/tablet?name=测试&type=longevity`
- 应该看到图片

### 问题 3: 上传成功但数据库没有 image_url

**检查**：
- `app/apply/[slug]/actions.ts` 是否正确保存
- 查看服务器日志（终端输出）

### 问题 4: 手机无法访问

**检查**：
- 手机和电脑在同一 Wi-Fi 网络
- 防火墙是否阻止了端口 3000
- 使用电脑 IP 而不是 localhost

## ✅ 成功标准

测试成功的标志：

1. ✅ 用户点击「確認，加入清單」后，图片成功上传
2. ✅ Supabase Storage 中可以看到图片文件
3. ✅ 预览确认页面显示图片（使用永久 URL）
4. ✅ 提交申请后，数据库 `application_name.image_url` 有值
5. ✅ 图片 URL 是 Supabase Storage 的永久 URL（不是 `/api/og/tablet`）

## 📱 移动端测试建议

虽然可以从 localhost 测试，但建议也在手机上测试：

1. **响应式设计**：确保移动端 UI 正常
2. **触摸交互**：测试按钮点击、表单输入
3. **图片显示**：确保图片在手机上正确显示
4. **网络环境**：测试真实网络条件下的上传速度

## 🎯 下一步

测试成功后：
1. ✅ 验证管理后台可以读取图片
2. ✅ 实现 PDF 导出功能（使用保存的 image_url）
3. ✅ 添加错误处理和用户提示
4. ✅ 优化图片上传性能（如果需要）

