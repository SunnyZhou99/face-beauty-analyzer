# 支付和兑换码功能接入教程

## 一、支付功能接入

### 方案1：使用微信支付（适合国内用户）

#### 1.1 注册微信支付商户号
1. 访问 [微信支付商户平台](https://pay.weixin.qq.com/)
2. 注册商户账号，完成企业认证
3. 获取商户号 (mch_id) 和 API 密钥 (APIv3 密钥)

#### 1.2 后端集成（Node.js 示例）

创建 `lib/payment.js`：

```javascript
const crypto = require('crypto');
const axios = require('axios');

// 微信支付配置
const WECHAT_PAY = {
  appId: '你的AppID',
  mchId: '你的商户号',
  apiKey: '你的API密钥',
  notifyUrl: 'https://你的域名.com/api/payment/callback'
};

// 生成微信支付订单
async function createWechatPayOrder(orderData) {
  const {
    orderId,
    amount, // 单位：分
    description
  } = orderData;

  // 构建请求参数
  const params = {
    appid: WECHAT_PAY.appId,
    mchid: WECHAT_PAY.mchId,
    description,
    out_trade_no: orderId,
    notify_url: WECHAT_PAY.notifyUrl,
    amount: {
      total: amount
    },
    payer: {
      openid: '用户openid'
    }
  };

  // 生成签名
  const sign = generateSignature(params, WECHAT_PAY.apiKey);

  // 发送请求
  const response = await axios.post('https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi', params, {
    headers: {
      'Authorization': `WECHATPAY2-SHA256-RSA2048 ${sign}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

// 生成签名
function generateSignature(params, apiKey) {
  // 实现签名逻辑
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = `${timestamp}\n${nonce}\n${JSON.stringify(params)}\n`;
  const signature = crypto.sign('sha256', message, apiKey).toString('base64');
  return `mchid="${WECHAT_PAY.mchId}",nonce_str="${nonce}",timestamp="${timestamp}",signature="${signature}"`;
}
```

#### 1.3 前端调用

在 `app/page.tsx` 中修改 `handlePayment` 函数：

```typescript
const handlePayment = async (count: number, price: string) => {
  try {
    // 调用后端创建订单
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count,
        amount: parseFloat(price) * 100, // 转换为分
        description: `购买${count}次颜值分析`
      })
    });

    const result = await response.json();

    if (result.success) {
      // 调起微信支付
      if (typeof window !== 'undefined' && (window as any).WeixinJSBridge) {
        (window as any).WeixinJSBridge.invoke('getBrandWCPayRequest', {
          appId: result.appId,
          timeStamp: result.timeStamp,
          nonceStr: result.nonceStr,
          package: result.package,
          signType: 'MD5',
          paySign: result.paySign
        }, (res) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            // 支付成功
            const current = getRemainingCount();
            const newCount = current + count;
            localStorage.setItem('analysisCount', String(newCount));
            setRemainingCount(newCount);
            setShowRedeemModal(false);
            alert(`购买成功！获得 ${count} 次分析机会`);
          }
        });
      } else {
        alert('请在微信中打开');
      }
    }
  } catch (error) {
    console.error('支付失败:', error);
    alert('支付失败，请重试');
  }
};
```

### 方案2：使用支付宝（适合国内用户）

#### 2.1 注册支付宝商家
1. 访问 [支付宝开放平台](https://open.alipay.com/)
2. 创建应用，获取 AppID
3. 配置密钥

#### 2.2 后端集成

```javascript
const AlipaySDK = require('alipay-sdk').default;

const alipaySdk = new AlipaySDK({
  appId: '你的AppID',
  privateKey: '你的应用私钥',
  alipayPublicKey: '支付宝公钥'
});

// 创建支付宝订单
async function createAlipayOrder(orderData) {
  const result = await alipaySdk.exec('alipay.trade.create', {
    notify_url: 'https://你的域名.com/api/payment/alipay-callback',
    bizContent: {
      out_trade_no: orderData.orderId,
      total_amount: orderData.amount / 100,
      subject: orderData.description
    }
  });
  return result;
}
```

#### 2.3 前端调用

```typescript
const handleAlipayPayment = async (count: number, price: string) => {
  const response = await fetch('/api/payment/alipay-create', {
    method: 'POST',
    body: JSON.stringify({ count, amount: parseFloat(price) * 100 })
  });

  const result = await response.json();

  // 跳转到支付宝支付页面
  const div = document.createElement('div');
  div.innerHTML = result.orderString;
  document.body.appendChild(div);
  document.forms[0].submit();
};
```

### 方案3：使用 Stripe（适合海外用户）

#### 3.1 注册 Stripe
1. 访问 [Stripe官网](https://stripe.com/)
2. 注册账号，获取 Publishable Key 和 Secret Key

#### 3.2 后端集成

```javascript
const stripe = require('stripe')('sk_test_你的密钥');

// 创建支付意图
async function createStripePaymentIntent(amount, currency = 'cny') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: {
      type: 'analysis-count'
    }
  });

  return paymentIntent;
}
```

#### 3.3 前端集成

在 `components/StripePayment.tsx` 中：

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_你的公钥');

function StripePayment({ amount, onSuccess }) {
  const handlePayment = async () => {
    const stripe = await stripePromise;
    const response = await fetch('/api/payment/stripe-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const { clientSecret } = await response.json();

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (!error) {
      onSuccess();
    }
  };

  return <button onClick={handlePayment}>支付</button>;
}
```

### 方案4：使用云支付平台（推荐新手）

#### 4.1 Ping++（聚合支付）
- 官网：https://www.pingxx.com/
- 支持微信、支付宝、银联等
- 文档完善，接入简单

#### 4.2 贝宝支付
- 官网：https://www.paypal.com/
- 国际化支持好
- 手续费较低

## 二、兑换码功能实现

### 2.1 后端数据库设计

#### 使用 MongoDB
```javascript
// models/RedeemCode.js
const mongoose = require('mongoose');

const RedeemCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  count: { type: Number, required: true },
  description: { type: String },
  totalUses: { type: Number, default: 0 },
  maxUses: { type: Number, default: 1 }, // 最多使用次数
  status: { type: String, enum: ['active', 'disabled', 'expired'], default: 'active' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RedeemCode', RedeemCodeSchema);
```

#### 使用 MySQL
```sql
CREATE TABLE redeem_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  count INT NOT NULL,
  description VARCHAR(200),
  total_uses INT DEFAULT 0,
  max_uses INT DEFAULT 1,
  status ENUM('active', 'disabled', 'expired') DEFAULT 'active',
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE redeemed_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  code_id INT NOT NULL,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (code_id) REFERENCES redeem_codes(id)
);
```

### 2.2 后端 API 实现

```javascript
// pages/api/redeem.js
import connectDB from '@/lib/mongodb';
import RedeemCode from '@/models/RedeemCode';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await connectDB();

  const { code, userId } = req.body;

  // 查找兑换码
  const redeemCode = await RedeemCode.findOne({ code: code.toUpperCase() });

  if (!redeemCode) {
    return res.status(400).json({ success: false, message: '兑换码无效' });
  }

  // 检查状态
  if (redeemCode.status !== 'active') {
    return res.status(400).json({ success: false, message: '兑换码已失效' });
  }

  // 检查过期时间
  if (redeemCode.expiresAt && new Date() > redeemCode.expiresAt) {
    redeemCode.status = 'expired';
    await redeemCode.save();
    return res.status(400).json({ success: false, message: '兑换码已过期' });
  }

  // 检查使用次数
  if (redeemCode.totalUses >= redeemCode.maxUses) {
    redeemCode.status = 'disabled';
    await redeemCode.save();
    return res.status(400).json({ success: false, message: '兑换码已被用完' });
  }

  // 检查用户是否已使用
  const alreadyRedeemed = await RedeemedCode.findOne({
    userId,
    codeId: redeemCode._id
  });

  if (alreadyRedeemed) {
    return res.status(400).json({ success: false, message: '您已使用过此兑换码' });
  }

  // 执行兑换
  redeemCode.totalUses += 1;
  await redeemCode.save();

  await RedeemedCode.create({
    userId,
    codeId: redeemCode._id
  });

  res.json({
    success: true,
    message: redeemCode.description,
    count: redeemCode.count
  });
}
```

### 2.3 兑换码管理后台

创建 `app/admin/redeem-codes/page.tsx`：

```typescript
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function AdminRedeemCodes() {
  const [code, setCode] = useState('');
  const [count, setCount] = useState(1);
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState(1);

  const createCode = async () => {
    try {
      await axios.post('/api/admin/redeem-code', {
        code,
        count,
        description,
        maxUses
      });
      alert('兑换码创建成功！');
      setCode('');
    } catch (error) {
      alert('创建失败');
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">兑换码管理</h1>

      <div className="max-w-md bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block mb-2">兑换码</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <button onClick={generateRandomCode} className="bg-blue-500 text-white px-4 rounded">
              生成
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2">次数</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">描述</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">最大使用次数</label>
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <button onClick={createCode} className="w-full bg-green-500 text-white py-2 rounded">
          创建兑换码
        </button>
      </div>
    </div>
  );
}
```

### 2.4 前端集成真实兑换码

修改 `lib/utils.ts`：

```typescript
export async function useRedeemCode(code: string, userId: string): Promise<{
  success: boolean;
  message: string;
  newCount?: number;
}> {
  try {
    const response = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId })
    });

    const result = await response.json();

    if (result.success) {
      const current = getRemainingCount();
      const newCount = current + result.count;
      localStorage.setItem('analysisCount', String(newCount));

      // 记录已使用的兑换码
      const usedCodes = JSON.parse(localStorage.getItem('usedRedeemCodes') || '[]');
      usedCodes.push(code.toUpperCase());
      localStorage.setItem('usedRedeemCodes', JSON.stringify(usedCodes));

      return { success: true, message: result.message, newCount };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    return { success: false, message: '兑换失败，请重试' };
  }
}
```

## 三、快速开始建议

### 新手推荐流程：
1. **先使用模拟支付功能**（当前代码）测试流程
2. **选择支付平台**：
   - 国内用户：微信支付或支付宝
   - 海外用户：Stripe 或 PayPal
3. **注册账号并获取密钥**
4. **实现后端 API**
5. **接入前端支付 SDK**
6. **测试支付流程**
7. **部署到生产环境**

### 注意事项：
1. ⚠️ 支付涉及资金，务必测试充分后再上线
2. ⚠️ 保护好支付密钥，不要泄露到前端
3. ⚠️ 兑换码需要后端数据库支持，不能只在前端验证
4. ⚠️ 生产环境需要 HTTPS
5. ⚠️ 需要处理支付回调，确认支付状态

## 四、调试工具

### 测试兑换码（当前前端模拟）：
- `BEAUTY2026` - 5次
- `AI666` - 10次
- `TEST888` - 1次

### 查看数据：
```javascript
// 浏览器控制台
localStorage.getItem('analysisCount') // 查看剩余次数
localStorage.getItem('usedRedeemCodes') // 查看已使用的兑换码
```
