# 🚀 部署到 Netlify

## 方法一：Netlify Dashboard（最简单）

### 步骤：

1. **构建项目**
```bash
cd /Users/sunnyzhou/NewProject/face-beauty-analyzer
npm run build
```

2. **登录 Netlify**
   - 访问 https://app.netlify.com/
   - 注册/登录账号

3. **拖拽部署**
   - 将整个 `face-beauty-analyzer` 文件夹拖到 Netlify 页面
   - 等待部署完成

4. **修改构建设置**（如果需要）
   - 进入 Site settings → Build & deploy
   - Build command: `npm run build`
   - Publish directory: `.next`

---

## 方法二：Git 集成（推荐，支持持续部署）

### 步骤：

1. **初始化 Git**
```bash
cd /Users/sunnyzhou/NewProject/face-beauty-analyzer
git init
git add .
git commit -m "Initial commit"
```

2. **推送到 GitHub**
```bash
# 先在 GitHub 创建新仓库
git remote add origin https://github.com/你的用户名/face-beauty-analyzer.git
git branch -M main
git push -u origin main
```

3. **在 Netlify 连接**
   - 登录 Netlify
   - 「Add new site」→「Import an existing project」
   - 选择 GitHub，选择你的仓库
   - 点击「Deploy site」

---

## 方法三：Netlify CLI（高级用户）

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 部署
cd /Users/sunnyzhou/NewProject/face-beauty-analyzer
npm run build
netlify deploy --prod
```

---

## ⚠️ 重要提示

1. **摄像头功能需要 HTTPS**：Netlify 自动提供免费 SSL 证书
2. **移动端访问**：确保使用 https:// 开头的地址
3. **摄像头权限**：首次访问时需要允许浏览器访问摄像头

---

## 🔧 故障排查

### 构建失败
- 检查 Node.js 版本：`node --version`（建议 18+）
- 删除 `node_modules` 重新安装：`rm -rf node_modules && npm install`

### 摄像头不能用
- 确保使用 HTTPS（Netlify 自动提供）
- 检查浏览器权限设置
- 尝试使用「上传照片」功能

---

## 📊 部署后

部署成功后，你会得到一个类似这样的 URL：
```
https://你的网站名.netlify.app
```

可以自定义域名：
- 进入 Site settings → Domain management
- 添加自定义域名（需购买域名或使用免费子域名）
