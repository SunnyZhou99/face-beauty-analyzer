import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // 从环境变量获取管理员密码
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: '登录成功'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '密码错误'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: '登录失败' },
      { status: 500 }
    );
  }
}
