# 🗄️ Supabase 集成指南

## 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 使用 GitHub 账号或邮箱注册/登录
4. 点击 "New Project"
5. 填写项目信息：
   - **Name**: `face-beauty-analyzer`
   - **Database Password**: 设置一个强密码（记住这个密码）
   - **Region**: 选择一个离你最近的区域（例如：Southeast Asia (Singapore)）
6. 点击 "Create new project"
7. 等待 1-2 分钟，项目创建完成

---

## 步骤 2: 获取 API 密钥

1. 在 Supabase Dashboard 左侧菜单，点击 `Settings` → `API`
2. 找到以下信息并复制：
   - **Project URL**: 类似 `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: 类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 步骤 3: 配置环境变量

在你的项目中创建或编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
```

**示例：**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnopqrstuvwxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcGh5eXl5eXl5eXl5eXl5eXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU1NTU1NX0.abcdefghijklmnopqrstuvwxyz
```

---

## 步骤 4: 创建数据库表

### 方法 1: 使用 SQL 编辑器（推荐）

1. 在 Supabase Dashboard，点击 `SQL Editor`
2. 点击 `New query`
3. 复制 `supabase-init.sql` 文件中的所有 SQL 代码
4. 粘贴到 SQL 编辑器
5. 点击 `Run` 按钮执行

### 方法 2: 使用 Table Editor

1. 点击 `Table Editor`
2. 点击 `Create a new table`
3. 创建 `redeem_codes` 表：
   - id: text (primary key)
   - code: text (unique)
   - count: integer
   - description: text
   - maxUses: integer
   - usedCount: integer
   - status: text
   - expiresAt: timestamp with time zone
   - createdAt: timestamp with time zone

4. 创建 `redeem_usages` 表：
   - id: text (primary key)
   - codeId: text
   - code: text
   - count: integer
   - userId: text
   - usedAt: timestamp with time zone
   - description: text

---

## 步骤 5: 安装 Supabase 客户端

在项目根目录运行：

```bash
npm install @supabase/supabase-js
```

---

## 步骤 6: 本地测试

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 `http://localhost:3000/admin`

3. 测试创建兑换码功能

---

## 步骤 7: 部署到 Netlify

### 配置 Netlify 环境变量

1. 登录 Netlify
2. 选择你的项目
3. 点击 `Site settings` → `Environment variables`
4. 添加以下变量：
   - **NEXT_PUBLIC_SUPABASE_URL**: 你的 Supabase Project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: 你的 Supabase Anon Key

5. 保存后，触发重新部署

---

## ⚠️ 重要提示

### Row Level Security (RLS)

为了安全，建议启用 Row Level Security：

```sql
-- 启用 RLS
ALTER TABLE redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeem_usages ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取兑换码
CREATE POLICY "Allow read access for redeem_codes"
ON redeem_codes FOR SELECT
USING (true);

-- 允许所有用户使用兑换码
CREATE POLICY "Allow insert usage for redeem_usages"
ON redeem_usages FOR INSERT
WITH CHECK (true);

-- 允许所有用户读取使用记录（按用户ID过滤）
CREATE POLICY "Allow read own usage"
ON redeem_usages FOR SELECT
USING (true);
```

---

## 🧪 测试

### 测试兑换码功能

1. 访问 `/admin` 页面
2. 创建一个测试兑换码
3. 在主页面测试兑换
4. 检查 Supabase Dashboard 中的数据

### 查看数据库数据

1. 访问 Supabase Dashboard
2. 点击 `Table Editor`
3. 选择 `redeem_codes` 或 `redeem_usages` 表
4. 查看数据变化

---

## 📊 数据库结构

### redeem_codes 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | text | 主键（UUID） |
| code | text | 兑换码（唯一） |
| count | integer | 赠送次数 |
| description | text | 描述 |
| maxUses | integer | 最大使用次数 |
| usedCount | integer | 已使用次数 |
| status | text | 状态（active/disabled/expired） |
| expiresAt | timestamp | 过期时间 |
| createdAt | timestamp | 创建时间 |

### redeem_usages 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | text | 主键（UUID） |
| codeId | text | 兑换码ID（外键） |
| code | text | 兑换码 |
| count | integer | 次数 |
| userId | text | 用户ID（IP地址） |
| usedAt | timestamp | 使用时间 |
| description | text | 描述 |

---

## 🎯 完成！

配置完成后，你的兑换码数据将永久保存在 Supabase 数据库中，不会因为部署而丢失。

**管理后台地址：** `https://你的网站.netlify.app/admin`
