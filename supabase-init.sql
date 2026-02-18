-- 创建兑换码表
CREATE TABLE IF NOT EXISTS redeem_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  maxUses INTEGER NOT NULL DEFAULT 1,
  usedCount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'expired')),
  expiresAt TIMESTAMP WITH TIME ZONE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建兑换记录表
CREATE TABLE IF NOT EXISTS redeem_usages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  codeId TEXT NOT NULL,
  code TEXT NOT NULL,
  count INTEGER NOT NULL,
  userId TEXT NOT NULL,
  usedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  FOREIGN KEY (codeId) REFERENCES redeem_codes(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_status ON redeem_codes(status);
CREATE INDEX IF NOT EXISTS idx_redeem_usages_codeId ON redeem_usages(codeId);
CREATE INDEX IF NOT EXISTS idx_redeem_usages_userId ON redeem_usages(userId);

-- 插入初始测试数据
INSERT INTO redeem_codes (id, code, count, description, maxUses, usedCount, status)
VALUES
  ('initial1', 'BEAUTY2026', 5, '新年快乐赠送5次', 1, 0, 'active'),
  ('initial2', 'AI666', 10, '专属兑换码赠送10次', 1, 0, 'active'),
  ('initial3', 'TEST888', 1, '测试兑换码赠送1次', 1, 0, 'active')
ON CONFLICT (code) DO NOTHING;
