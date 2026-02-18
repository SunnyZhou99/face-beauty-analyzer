import { NextRequest, NextResponse } from 'next/server';
import { supabase, RedeemCode, RedeemUsage } from '@/lib/supabase';

// GET: 获取所有兑换码或验证特定兑换码
export async function GET(request: NextRequest) {
  try {
    console.log('开始 GET 请求');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置');

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    // 如果指定了code，验证兑换码
    if (code) {
      const { data: redeemCode, error } = await supabase
        .from('redeem_codes')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .single();

      if (error || !redeemCode) {
        return NextResponse.json({ valid: false, message: '兑换码不存在' });
      }

      const codeData = redeemCode as RedeemCode;

      // 检查状态
      if (codeData.status !== 'active') {
        return NextResponse.json({ valid: false, message: '兑换码已失效' });
      }

      // 检查过期时间
      if (codeData.expiresat && new Date() > new Date(codeData.expiresat)) {
        return NextResponse.json({ valid: false, message: '兑换码已过期' });
      }

      // 检查使用次数
      if (codeData.usedcount >= codeData.maxuses) {
        return NextResponse.json({ valid: false, message: '兑换码已被用完' });
      }

      // 获取用户 IP
      const userId = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'anonymous';

      // 检查用户是否已使用
      const { data: userUsages, error: usageError } = await supabase
        .from('redeem_usages')
        .select('*')
        .eq('codeId', codeData.id)
        .eq('userId', userId);

      if (usageError || (userUsages && userUsages.length > 0)) {
        return NextResponse.json({ valid: false, message: '您已使用过此兑换码' });
      }

      return NextResponse.json({
        valid: true,
        code: codeData
      });
    }

    // 否则返回所有兑换码列表
    console.log('查询兑换码列表...');
    const { data: codes, error } = await supabase
      .from('redeem_codes')
      .select('*')
      .order('createdAt', { ascending: false });

    console.log('查询结果:', { codes, error });

    if (error) {
      throw error;
    }

    // 为每个兑换码添加使用统计
    const codesWithStats = await Promise.all(
      (codes || []).map(async (code: RedeemCode) => {
        const { count } = await supabase
          .from('redeem_usages')
          .select('*', { count: 'exact', head: true })
          .eq('codeId', code.id);

        return {
          ...code,
          usedCount: count || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      codes: codesWithStats
    });
  } catch (error) {
    console.error('Error reading redeem codes:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: '读取兑换码失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: 使用兑换码
export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: '请输入兑换码' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    // 查找兑换码
    const { data: redeemCode, error: codeError } = await supabase
      .from('redeem_codes')
      .select('*')
      .eq('code', upperCode)
      .single();

    if (codeError || !redeemCode) {
      return NextResponse.json(
        { success: false, message: '兑换码不存在' },
        { status: 400 }
      );
    }

    const codeData = redeemCode as RedeemCode;

    // 检查状态
    if (codeData.status !== 'active') {
      return NextResponse.json(
        { success: false, message: '兑换码已失效' },
        { status: 400 }
      );
    }

    // 检查过期时间
    if (codeData.expiresat && new Date() > new Date(codeData.expiresat)) {
      return NextResponse.json(
        { success: false, message: '兑换码已过期' },
        { status: 400 }
      );
    }

    // 检查使用次数
    if (codeData.usedcount >= codeData.maxuses) {
      return NextResponse.json(
        { success: false, message: '兑换码已被用完' },
        { status: 400 }
      );
    }

    // 使用IP或提供的userId作为用户标识
    const finalUserId = userId ||
                       request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'anonymous';

    // 检查用户是否已使用
    const { data: userUsages, error: usageError } = await supabase
      .from('redeem_usages')
      .select('*')
      .eq('codeId', codeData.id)
      .eq('userId', finalUserId);

    if (usageError || (userUsages && userUsages.length > 0)) {
      return NextResponse.json(
        { success: false, message: '您已使用过此兑换码' },
        { status: 400 }
      );
    }

    // 记录使用
    const { error: insertError } = await supabase
      .from('redeem_usages')
      .insert({
        codeId: codeData.id,
        code: codeData.code,
        count: codeData.count,
        userId: finalUserId,
        description: codeData.description
      });

    if (insertError) {
      throw insertError;
    }

    // 更新兑换码使用次数
    const newUsedCount = codeData.usedcount + 1;
    const newStatus = newUsedCount >= codeData.maxuses ? 'disabled' : codeData.status;

    const { error: updateError } = await supabase
      .from('redeem_codes')
      .update({
        usedcount: newUsedCount,
        status: newStatus
      })
      .eq('id', codeData.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: codeData.description,
      count: codeData.count,
      newCount: codeData.count
    });
  } catch (error) {
    console.error('Error redeeming code:', error);
    return NextResponse.json(
      { success: false, message: '兑换失败' },
      { status: 500 }
    );
  }
}

// DELETE: 删除兑换码
export async function DELETE(request: NextRequest) {
  try {
    const { codeId } = await request.json();

    if (!codeId) {
      return NextResponse.json(
        { success: false, message: '请提供兑换码ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('redeem_codes')
      .delete()
      .eq('id', codeId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: '兑换码已删除' });
  } catch (error) {
    console.error('Error deleting code:', error);
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    );
  }
}
