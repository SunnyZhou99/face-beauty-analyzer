# 🚀 完整部署指南

让所有人都能使用你的颜值分析应用！

---

## 方案一：Vercel 部署（最推荐 ⭐）

**优点：**
- 完全免费
- 支持 Next.js API Routes（你的兑换码功能需要）
- 自动 HTTPS
- 全球 CDN 加速
- 自动持续部署

### 步骤 1: 推送代码到 GitHub

```bash
# 进入项目目录
cd /Users/sunnyzhou/NewProject/face-beauty-analyzer

# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始提交：颜值分析应用"

# 在 GitHub 创建新仓库，然后连接
git remote add origin https://github.com/你的用户名/face-beauty-analyzer.git
git branch -M main
git push -u origin main
```

### 步骤 2: 在 Vercel 部署

1. 访问 https://vercel.com/
2. 注册/登录账号（推荐使用 GitHub 账号登录）
3. 点击 "Add New Project"
4. 选择你的 GitHub 仓库 `face-beauty-analyzer`
5. 点击 "Import"
6. 保持默认设置，点击 "Deploy"
7. 等待 2-3 分钟，部署完成！

### 步骤 3: 访问你的网站

部署成功后，你会得到一个 URL：
```
https://你的项目名.vercel.app
```

---

## 方案二：CloudStudio 部署（腾讯云）

如果你在中国大陆，可以考虑使用腾讯云的 CloudStudio。

### 步骤：

1. 在 IDE 集成菜单中点击 "CloudStudio"
2. 完成登录和授权
3. 选择部署配置（Next.js 项目）
4. 一键部署到腾讯云

---

## 方案三：Netlify 部署

**注意：** Netlify 对 Next.js API Routes 支持有限，可能需要额外配置。

### 步骤 1: 推送代码到 GitHub

同上，先推送到 GitHub。

### 步骤 2: 在 Netlify 部署

1. 访问 https://app.netlify.com/
2. 注册/登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择 GitHub，选择你的仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
6. 点击 "Deploy site"

---

## ⚠️ 重要提示

### 1. API Routes 功能
你的应用使用了 Next.js API Routes（兑换码功能）：
- `/api/redeem` - 兑换码验证
- `/api/admin/redeem-codes` - 管理兑换码

**Vercel 完美支持这些功能，Netlify 需要额外配置。**

### 2. 摄像头功能需要 HTTPS
- 所有平台都会自动提供免费 SSL 证书
- 移动端必须使用 HTTPS 才能访问摄像头

### 3. 数据持久化
当前使用文件存储（`data/` 目录）：
- Vercel 会在每次部署时重置
- 建议接入真实数据库（如 Supabase、MongoDB）来存储兑换码数据

---

## 🎯 推荐方案对比

| 特性 | Vercel | Netlify | CloudStudio |
|------|--------|---------|-------------|
| 免费 | ✅ | ✅ | 有免费额度 |
| API Routes | ✅ 完美支持 | ⚠️ 需要配置 | ✅ 支持 |
| 部署速度 | ⚡ 快 | ⚡ 快 | ⚡ 快 |
| 中国访问 | ⚠️ 慢 | ⚠️ 慢 | ✅ 快 |
| 使用难度 | 简单 | 简单 | 简单 |

**结论：**
- 如果主要面向海外用户：用 **Vercel**
- 如果主要面向国内用户：用 **CloudStudio**

---

## 📱 部署后测试清单

部署完成后，测试以下功能：

- [ ] 访问网站（移动端和桌面端）
- [ ] 拍照功能
- [ ] 上传照片功能
- [ ] 颜值分析功能
- [ ] 兑换码功能
- [ ] 兑换码是否正确扣除次数
- [ ] 主题切换（白天/黑夜）

---

## 🔧 常见问题

### Q1: 部署后兑换码不工作？
**A:** 检查 API Routes 是否正常部署。在 Vercel 确保你的 Next.js 版本支持 API Routes。

### Q2: 兑换码数据会丢失？
**A:** 是的，因为使用文件存储。每次部署 Vercel 会重置文件。建议：
1. 使用真实数据库（推荐）
2. 或者在每次部署前备份 `data/` 目录

### Q3: 如何添加真实数据库？
**A:** 点击 IDE 集成菜单中的 "Supabase"，可以快速接入 PostgreSQL 数据库。

---

## 🎉 部署成功后

你的网站就上线了！可以：
- 分享给朋友使用
- 在社交媒体推广
- 添加自定义域名
- 配置分析统计（如 Google Analytics）

---

## 💡 后续优化建议

1. **接入真实数据库** - 使用 Supabase 存储兑换码和用户数据
2. **添加支付功能** - 集成微信支付或支付宝
3. **添加用户系统** - 让用户注册登录
4. **添加更多分析维度** - 如气质分析、时尚建议等
5. **优化性能** - 图片压缩、CDN 加速

---

祝部署顺利！🚀
