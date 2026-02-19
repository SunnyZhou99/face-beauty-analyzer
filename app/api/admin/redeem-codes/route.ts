import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const DATA_DIR = path.join(process.cwd(), 'data');
const REDEEM_CODES_FILE = path.join(DATA_DIR, 'redeem-codes.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readRedeemCodes(): Promise<any[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(REDEEM_CODES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveRedeemCodes(codes: any[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(REDEEM_CODES_FILE, JSON.stringify(codes, null, 2));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// POST: 创建兑换码
export async function POST(request: NextRequest) {
  try {
    const { code, count, description, maxUses, expiresAt } = await request.json();

    if (!code || !count) {
      return NextResponse.json({ success: false, message: '请填写完整信息' }, { status: 400 });
    }

    const codes = await readRedeemCodes();

    // 检查兑换码是否已存在
    const existingCode = codes.find(c => c.code === code.toUpperCase());
    if (existingCode) {
      return NextResponse.json({ success: false, message: '兑换码已存在' }, { status: 400 });
    }

    const newCode = {
      id: generateId(),
      code: code.toUpperCase(),
      count: parseInt(count),
      description: description || `兑换码赠送${count}次`,
      maxUses: maxUses || 1,
      usedCount: 0,
      status: 'active',
      expiresAt: expiresAt || null,
      createdAt: new Date().toISOString()
    };

    codes.push(newCode);
    await saveRedeemCodes(codes);

    return NextResponse.json({
      success: true,
      message: '兑换码创建成功',
      code: newCode
    });
  } catch (error) {
    console.error('Error creating code:', error);
    return NextResponse.json({ success: false, message: '创建失败' }, { status: 500 });
  }
}

// PUT: 更新兑换码
export async function PUT(request: NextRequest) {
  try {
    const { codeId, count, description, maxUses, status, expiresAt } = await request.json();

    const codes = await readRedeemCodes();
    const codeIndex = codes.findIndex(c => c.id === codeId);

    if (codeIndex === -1) {
      return NextResponse.json({ success: false, message: '兑换码不存在' }, { status: 404 });
    }

    // 更新字段
    if (count !== undefined) codes[codeIndex].count = parseInt(count);
    if (description !== undefined) codes[codeIndex].description = description;
    if (maxUses !== undefined) codes[codeIndex].maxUses = maxUses;
    if (status !== undefined) codes[codeIndex].status = status;
    if (expiresAt !== undefined) codes[codeIndex].expiresAt = expiresAt;

    await saveRedeemCodes(codes);

    return NextResponse.json({
      success: true,
      message: '兑换码更新成功',
      code: codes[codeIndex]
    });
  } catch (error) {
    console.error('Error updating code:', error);
    return NextResponse.json({ success: false, message: '更新失败' }, { status: 500 });
  }
}
