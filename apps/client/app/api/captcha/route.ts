import svgCaptcha from 'svg-captcha';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// 强制使用 Node.js 运行时
export const runtime = 'nodejs';

export async function GET() {
  try {
    // 1. 暂时移除 loadFont 逻辑，使用默认字体以确保稳定性
    // svg-captcha 默认会在 node_modules 中查找其自带的字体
    
    // 2. 创建验证码
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1iIl', // 增加易混淆字符的排除
      noise: 2,
      color: true,
      background: '#f5f5f4', // 可选：添加背景色与你的 UI 匹配 (stone-100)
      // width: 120, // 可选：指定宽高
      // height: 48,
    });

    // 3. 生成 Hash (保持你原有的逻辑)
    const secret = process.env.NEXTAUTH_SECRET || 'dev_secret';
    // 注意：使用 toLowerCase 确保大小写不敏感验证
    const hash = crypto.createHmac('sha256', secret).update(captcha.text.toLowerCase()).digest('hex');

    const cookieStore = await cookies();
    cookieStore.set('captcha_hash', hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5 minutes
      path: '/',
      sameSite: 'strict'
    });

    // 4. 返回 SVG 图片
    return new NextResponse(captcha.data, {
      headers: {
        'Content-Type': 'image/svg+xml',
        // 禁止缓存，这对验证码至关重要
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      status: 200,
    });
  } catch (error: any) {
    // 打印详细错误到服务端控制台，方便调试
    console.error('[Captcha API Error Details]:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate captcha' }, 
      { status: 500 }
    );
  }
}