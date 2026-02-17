# 兑换码系统使用指南

## 功能特性

✅ **实时联网监控**
- 所有兑换码数据存储在服务器端
- 多用户实时共享兑换码使用状态
- 防止同一兑换码被多个用户重复使用

✅ **灵活的管理**
- 支持自定义兑换码（手动输入或自动生成）
- 可设置赠送次数、最大使用次数、过期时间
- 支持启用/禁用兑换码
- 实时查看使用情况和统计

✅ **用户限制**
- 每个用户只能使用一次（基于IP地址）
- 兑换码可设置最大使用次数
- 支持过期时间设置

## 快速开始

### 1. 用户端使用

用户在首页点击"兑换码 / 获取更多次数"，输入兑换码即可兑换。

### 2. 管理后台

访问 `/admin` 进入管理后台，可以：

- **创建兑换码**
  - 手动输入兑换码或点击"生成"自动生成
  - 设置赠送次数
  - 设置描述信息
  - 设置最大使用次数（默认为1，表示每个用户只能用一次）
  - 设置过期时间（可选）

- **查看统计**
  - 总兑换码数量
  - 有效兑换码数量
  - 总使用次数
  - 已用完数量

- **管理兑换码**
  - 查看所有兑换码列表
  - 启用/禁用兑换码
  - 删除兑换码
  - 查看每个兑换码的使用进度条

### 3. API 接口

#### 验证兑换码
```
GET /api/redeem?code=BEAUTY2026
```

响应：
```json
{
  "valid": true,
  "code": {
    "id": "initial1",
    "code": "BEAUTY2026",
    "count": 5,
    "description": "新年快乐赠送5次",
    "maxUses": 1,
    "usedCount": 0,
    "status": "active",
    "expiresAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

#### 使用兑换码
```
POST /api/redeem
Content-Type: application/json

{
  "code": "BEAUTY2026"
}
```

响应：
```json
{
  "success": true,
  "message": "新年快乐赠送5次",
  "count": 5,
  "newCount": 5
}
```

#### 获取所有兑换码
```
GET /api/redeem
```

响应：
```json
{
  "success": true,
  "codes": [...],
  "totalUsed": 0
}
```

#### 创建兑换码（管理员）
```
POST /api/admin/redeem-codes
Content-Type: application/json

{
  "code": "NEWCODE123",
  "count": 10,
  "description": "活动赠送",
  "maxUses": 1,
  "expiresAt": "2026-12-31T23:59:59"
}
```

#### 更新兑换码（管理员）
```
PUT /api/admin/redeem-codes
Content-Type: application/json

{
  "codeId": "initial1",
  "status": "disabled"
}
```

#### 删除兑换码（管理员）
```
DELETE /api/redeem
Content-Type: application/json

{
  "codeId": "initial1"
}
```

## 数据存储

兑换码数据存储在项目根目录的 `data` 文件夹中：

- `redeem-codes.json` - 兑换码配置
- `used-codes.json` - 兑换使用记录

### redeem-codes.json 格式
```json
[
  {
    "id": "unique_id",
    "code": "BEAUTY2026",
    "count": 5,
    "description": "新年快乐赠送5次",
    "maxUses": 1,
    "usedCount": 0,
    "status": "active",
    "expiresAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

### used-codes.json 格式
```json
[
  {
    "id": "usage_id",
    "codeId": "code_id",
    "code": "BEAUTY2026",
    "count": 5,
    "userId": "user_ip",
    "usedAt": "2026-01-01T00:00:00.000Z",
    "description": "新年快乐赠送5次"
  }
]
```

## 测试兑换码

系统预置了三个测试兑换码：

| 兑换码 | 次数 | 描述 |
|--------|------|------|
| BEAUTY2026 | 5次 | 新年快乐赠送5次 |
| AI666 | 10次 | 专属兑换码赠送10次 |
| TEST888 | 1次 | 测试兑换码赠送1次 |

## 多用户测试

为了测试多用户场景：

1. **不同浏览器**
   - Chrome、Firefox、Safari 分别访问
   - 每个浏览器有不同的IP标识

2. **隐身模式**
   - 打开隐身窗口测试
   - 清除Cookie后测试

3. **不同设备**
   - 手机和电脑分别访问
   - 不同网络环境

## 注意事项

⚠️ **数据安全**
- 生产环境应该使用数据库（MongoDB/MySQL）代替文件存储
- 添加管理员认证，保护管理后台
- API接口添加速率限制

⚠️ **用户识别**
- 当前使用IP地址识别用户
- 生产环境建议使用用户ID或Token
- 移动端IP可能变化，影响重复使用检测

⚠️ **数据备份**
- 定期备份 `data` 文件夹
- 可以使用Git版本控制
- 或自动备份到云存储

⚠️ **部署注意事项**
- 确保 `data` 文件夹有写入权限
- Next.js部署到Vercel等平台时，需要使用持久化存储
- 推荐使用数据库替代文件存储

## 常见问题

### Q: 兑换码显示已使用过？
A: 每个用户（IP）只能使用一次。如果需要测试，可以：
- 清除 `data/used-codes.json` 中的记录
- 使用不同的设备或网络
- 使用隐身模式

### Q: 如何批量创建兑换码？
A: 可以使用管理后台逐个创建，或者编写脚本批量生成并写入 `redeem-codes.json`

### Q: 如何修改已创建的兑换码？
A: 目前不支持修改兑换码内容，但可以禁用后创建新的

### Q: 部署到Vercel后数据会丢失吗？
A: Vercel的文件系统是临时的，重启后数据会丢失。建议使用数据库或外部存储。

## 进阶功能建议

1. **数据库集成**
   - MongoDB/MySQL 替代文件存储
   - 支持更复杂的查询和统计

2. **用户系统**
   - 用户注册登录
   - 更精确的用户识别

3. **兑换码分类**
   - 按活动分类
   - 批量管理

4. **统计分析**
   - 兑换码使用趋势
   - 用户行为分析

5. **导出功能**
   - 导出兑换码列表
   - 导出使用记录

6. **邮件通知**
   - 兑换码过期提醒
   - 使用统计报告
