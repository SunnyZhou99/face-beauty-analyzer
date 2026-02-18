import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: 创建兑换码
export async function POST(request: NextRequest) {
  try {
    const { code, count, description, maxUses, expiresAt } = await request.json();

    if (!code || !count) {
      return NextResponse.json(
        { success: false, message: '请填写完整信息' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('redeem_codes')
      .insert({
        code: code.toUpperCase().trim(),
        count: parseInt(count),
        description: description || '',
        maxUses: parseInt(maxUses) || 1,
        expiresAt: expiresAt || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      // 检查是否是重复错误
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, message: '该兑换码已存在' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '创建成功',
      code: data
    });
  } catch (error) {
    console.error('Error creating code:', error);
    return NextResponse.json(
      { success: false, message: '创建失败' },
      { status: 500 }
    );
  }
}

// PUT: 更新兑换码状态
export async function PUT(request: NextRequest) {
  try {
    const { codeId, status } = await request.json();

    if (!codeId || !status) {
      return NextResponse.json(
        { success: false, message: '请提供兑换码ID和状态' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('redeem_codes')
      .update({ status })
      .eq('id', codeId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('Error updating code:', error);
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    );
  }
}
