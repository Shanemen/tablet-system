# Vercel 部署指南

本指南将帮助你将牌位管理系统部署到 Vercel。

## 前提条件

- ✅ 代码已推送到 GitHub 仓库
- ✅ Supabase 项目已创建并配置（线上实例）
- ✅ 数据库迁移已完成
- ✅ 有 Vercel 账号（可以用 GitHub 登录）

---

## 第一步：推送代码到 GitHub

1. 确保所有改动已提交：
```bash
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

---

## 第二步：连接 Vercel

### 2.1 登录 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 点击右上角 "Sign Up" 或 "Login"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub 账号

### 2.2 创建新项目
1. 在 Vercel Dashboard，点击 "Add New..."
2. 选择 "Project"
3. 在 Import Git Repository 页面，找到你的 `Tablet-system` 仓库
4. 点击 "Import"

---

## 第三步：配置项目

### 3.1 项目设置
- **Project Name**: `tablet-system`（或你喜欢的名字）
- **Framework Preset**: Next.js（应该自动检测）
- **Root Directory**: `./tablet-system`（如果仓库根目录不是 Next.js 项目）
  - ⚠️ 重要：点击 "Edit" 按钮
  - 选择 `tablet-system` 文件夹作为根目录
  - 这是因为你的 Next.js 项目在 `tablet-system` 子文件夹中

### 3.2 环境变量配置（重要！）

点击 "Environment Variables" 展开，添加以下变量：

#### 必需的 3 个环境变量：

1. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://zwlszoowwyjdorezgath.supabase.co
   ```

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   从 Supabase Dashboard → Settings → API → anon public 复制
   ```

3. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   从 Supabase Dashboard → Settings → API → service_role 复制
   ```

#### 可选（首次部署时可以先不加）：

4. **NEXT_PUBLIC_BASE_URL**
   ```
   https://tablet-system.vercel.app
   ```
   ⚠️ 注意：首次部署后才知道实际域名，可以先不填，部署后再添加

---

## 第四步：开始部署

1. 确认所有设置正确
2. 点击 "Deploy" 按钮
3. 等待 2-5 分钟（首次部署较慢）
4. 看到 "🎉 Congratulations!" 表示部署成功

---

## 第五步：获取你的域名

部署成功后，Vercel 会自动分配一个域名，格式类似：
```
https://tablet-system-xxxx.vercel.app
```

或者如果项目名可用：
```
https://tablet-system.vercel.app
```

### 5.1 更新 BASE_URL 环境变量（重要！）

1. 复制你获得的 Vercel 域名
2. 在 Vercel 项目页面，点击 "Settings"
3. 左侧菜单点击 "Environment Variables"
4. 添加或更新 `NEXT_PUBLIC_BASE_URL`：
   ```
   https://你的实际域名.vercel.app
   ```
5. 点击 "Save"

### 5.2 触发重新部署

1. 点击顶部 "Deployments" 标签
2. 点击最新的部署右侧的 "..." 菜单
3. 选择 "Redeploy"
4. 确认重新部署

---

## 第六步：在 Supabase 配置域名白名单

1. 打开 Supabase Dashboard
2. 进入你的项目
3. 左侧菜单：Authentication → URL Configuration
4. 在 "Site URL" 输入你的 Vercel 域名：
   ```
   https://tablet-system.vercel.app
   ```
5. 在 "Redirect URLs" 添加：
   ```
   https://tablet-system.vercel.app/**
   ```
6. 点击 "Save"

---

## 第七步：测试部署

### 7.1 测试管理员登录
1. 访问 `https://你的域名.vercel.app/admin/login`
2. 使用 Supabase 中创建的管理员账号登录
3. 确认能够正常登录和访问管理面板

### 7.2 测试法会创建和申请链接
1. 创建一个测试法会
2. 检查生成的申请链接是否是 `https://你的域名.vercel.app/apply/xxx`
3. 扫描二维码，确认能够访问申请表单
4. 提交一个测试申请，确认数据正确保存

---

## 常见问题

### Q1: 部署失败，显示 "Build Error"
**A**: 检查以下几点：
- Root Directory 是否设置为 `tablet-system`
- 环境变量是否都正确配置
- GitHub 仓库代码是否最新

### Q2: 登录失败，显示 "Auth error"
**A**: 
- 确认 Supabase 环境变量正确
- 检查 Supabase URL Configuration 中是否添加了 Vercel 域名

### Q3: 申请链接还是显示 localhost
**A**: 
- 确认添加了 `NEXT_PUBLIC_BASE_URL` 环境变量
- 确认已经重新部署（添加环境变量后需要重新部署）

### Q4: 如何更新代码？
**A**: 
```bash
git add .
git commit -m "更新说明"
git push origin main
```
推送到 GitHub 后，Vercel 会自动检测并重新部署（约 2-3 分钟）

---

## 自动部署

✅ 配置完成后，每次推送代码到 GitHub，Vercel 会自动：
1. 检测到代码变更
2. 自动构建
3. 自动部署
4. 发送部署通知邮件

你不需要手动操作，只管推送代码即可！

---

## 下一步

- 🎯 测试所有功能是否正常
- 🎯 创建真实的法会并分享给信众
- 🎯 监控 Vercel Analytics 查看访问数据
- 🎯 如需自定义域名，在 Vercel Settings → Domains 添加

---

## 需要帮助？

- Vercel 文档：https://vercel.com/docs
- Supabase 文档：https://supabase.com/docs
- Next.js 文档：https://nextjs.org/docs

