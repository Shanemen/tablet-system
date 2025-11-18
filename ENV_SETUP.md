# 环境变量配置指南

## 本地开发环境 (.env.local)

在项目根目录创建 `.env.local` 文件，包含以下环境变量：

```bash
# Supabase Configuration
# 从 Supabase 项目面板获取: Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://zwlszoowwyjdorezgath.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Base URL for the application
# 本地开发使用 localhost
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Vercel 生产环境配置

在 Vercel 项目设置中添加以下环境变量（Settings → Environment Variables）：

### 必需的环境变量：

1. **NEXT_PUBLIC_SUPABASE_URL**
   - 值：`https://zwlszoowwyjdorezgath.supabase.co`
   - 说明：Supabase 项目 URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - 值：从 Supabase Dashboard → Settings → API → anon public key 复制
   - 说明：Supabase 公开 API 密钥

3. **SUPABASE_SERVICE_ROLE_KEY**
   - 值：从 Supabase Dashboard → Settings → API → service_role key 复制
   - 说明：Supabase 服务角色密钥（⚠️ 保密！不要暴露在客户端）

4. **NEXT_PUBLIC_BASE_URL**
   - 值：`https://your-project-name.vercel.app`
   - 说明：Vercel 部署后的实际域名
   - ⚠️ 注意：首次部署后，需要回来更新这个值为你的实际 Vercel 域名

## 环境变量说明

### NEXT_PUBLIC_* 前缀
- 以 `NEXT_PUBLIC_` 开头的变量会暴露给浏览器端
- 可以在客户端组件中使用

### 无前缀变量
- 只在服务器端可用
- 用于敏感操作，如 `SUPABASE_SERVICE_ROLE_KEY`

## 重要提醒

1. **永远不要提交 `.env.local` 文件到 Git**
   - 已经在 `.gitignore` 中配置忽略

2. **SERVICE_ROLE_KEY 必须保密**
   - 这个密钥可以绕过所有数据库权限限制
   - 只在服务器端使用
   - 不要暴露在客户端代码中

3. **首次部署后记得更新 BASE_URL**
   - 部署到 Vercel 后，获得真实域名
   - 回到 Vercel 项目设置，更新 `NEXT_PUBLIC_BASE_URL`
   - 触发重新部署

