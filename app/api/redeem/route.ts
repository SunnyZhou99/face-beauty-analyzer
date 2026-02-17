import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const REDEEM_CODES_FILE = path.join(DATA_DIR, 'redeem-codes.json');
const USED_CODES_FILE = path.join(DATA_DIR, 'used-codes.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 读取兑换码数据
async function readRedeemCodes(): Promise<any[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(REDEEM_CODES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 保存兑换码数据
async function saveRedeemCodes(codes: any[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(REDEEM_CODES_FILE, JSON.stringify(codes, null, 2));
}

// 读取已使用的兑换码
async function readUsedCodes(): Promise<any[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(USED_CODES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 保存已使用的兑换码
async function saveUsedCodes(codes: any[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USED_CODES_FILE, JSON.stringify(codes, null, 2));
}

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// GET: 获取所有兑换码
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    // 如果指定了code，验证兑换码
    if (code) {
      const codes = await readRedeemCodes();
      const usedCodes = await readUsedCodes();

      const upperCode = code.toUpperCase().trim();
      const redeemCode = codes.find(c => c.code === upperCode);

      if (!redeemCode) {
        return NextResponse.json({ valid: false, message: '兑换码不存在' });
      }

      // 检查状态
      if (redeemCode.status !== 'active') {
        return NextResponse.json({ valid: false, message: '兑换码已失效' });
      }

      // 检查过期时间
      if (redeemCode.expiresAt && new Date() > new Date(redeemCode.expiresAt)) {
        return NextResponse.json({ valid: false, message: '兑换码已过期' });
      }

      // 检查使用次数
      if (redeemCode.usedCount >= redeemCode.maxUses) {
        return NextResponse.json({ valid: false, message: '兑换码已被用完' });
      }

      // 检查用户是否已使用（需要userId，这里暂时用IP作为标识）
      const userId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
      const userUsed = usedCodes.filter(c => c.codeId === redeemCode.id && c.userId === userId);

      if (userUsed.length > 0) {
        return NextResponse.json({ valid: false, message: '您已使用过此兑换码' });
      }

      return NextResponse.json({
        valid: true,
        code: redeemCode
      });
    }

    // 否则返回所有兑换码列表
    const codes = await readRedeemCodes();
    const usedCodes = await readUsedCodes();

    // 为每个兑换码添加使用统计
    const codesWithStats = codes.map(code => ({
      ...code,
      usedCount: usedCodes.filter(u => u.codeId === code.id).length
    }));

    return NextResponse.json({
      success: true,
      codes: codesWithStats,
      totalUsed: usedCodes.length
    });
  } catch (error) {
    console.error('Error reading redeem codes:', error);
    return NextResponse.json({ success: false, error: '读取兑换码失败' }, { status: 500 });
  }
}

// POST: 使用兑换码
export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, message: '请输入兑换码' }, { status: 400 });
    }

    const codes = await readRedeemCodes();
    const usedCodes = await readUsedCodes();

    const upperCode = code.toUpperCase().trim();
    const redeemCode = codes.find(c => c.code === upperCode);

    if (!redeemCode) {
      return NextResponse.json({ success: false, message: '兑换码不存在' }, { status: 400 });
    }

    // 检查状态
    if (redeemCode.status !== 'active') {
      return NextResponse.json({ success: false, message: '兑换码已失效' }, { status: 400 });
    }

    // 检查过期时间
    if (redeemCode.expiresAt && new Date() > new Date(redeemCode.expiresAt)) {
      return NextResponse.json({ success: false, message: '兑换码已过期' }, { status: 400 });
    }

    // 检查使用次数
    if (redeemCode.usedCount >= redeemCode.maxUses) {
      return NextResponse.json({ success: false, message: '兑换码已被用完' }, { status: 400 });
    }

    // 使用IP或提供的userId作为用户标识
    const finalUserId = userId || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';

    // 检查用户是否已使用
    const userUsed = usedCodes.filter(c => c.codeId === redeemCode.id && c.userId === finalUserId);
    if (userUsed.length > 0) {
      return NextResponse.json({ success: false, message: '您已使用过此兑换码' }, { status: 400 });
    }

    // 记录使用
    const usageRecord = {
      id: generateId(),
      codeId: redeemCode.id,
      code: redeemCode.code,
      count: redeemCode.count,
      userId: finalUserId,
      usedAt: new Date().toISOString(),
      description: redeemCode.description
    };

    usedCodes.push(usageRecord);
    await saveUsedCodes(usedCodes);

    // 更新兑换码使用次数
    redeemCode.usedCount += 1;
    if (redeemCode.usedCount >= redeemCode.maxUses) {
      redeemCode.status = 'disabled';
    }
    await saveRedeemCodes(codes);

    return NextResponse.json({
      success: true,
      message: redeemCode.description,
      count: redeemCode.count,
      newCount: redeemCode.count // 这里应该从用户数据计算，简化处理
    });
  } catch (error) {
    console.error('Error redeeming code:', error);
    return NextResponse.json({ success: false, message: '兑换失败' }, { status: 500 });
  }
}

// DELETE: 删除兑换码
export async function DELETE(request: NextRequest) {
  try {
    const { codeId } = await request.json();

    const codes = await readRedeemCodes();
    const filteredCodes = codes.filter(c => c.id !== codeId);

    if (codes.length === filteredCodes.length) {
      return NextResponse.json({ success: false, message: '兑换码不存在' }, { status: 404 });
    }

    await saveRedeemCodes(filteredCodes);

    return NextResponse.json({ success: true, message: '兑换码已删除' });
  } catch (error) {
    console.error('Error deleting code:', error);
    return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
  }
}
