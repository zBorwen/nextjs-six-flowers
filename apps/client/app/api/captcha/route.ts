import svgCaptcha from 'svg-captcha';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  const captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: '0o1i',
    noise: 2,
    color: true,
  });

  const secret = process.env.NEXTAUTH_SECRET || 'dev_secret';
  const hash = crypto.createHmac('sha256', secret).update(captcha.text.toLowerCase()).digest('hex');

  const cookieStore = await cookies();
  cookieStore.set('captcha_hash', hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300, // 5 minutes
    path: '/',
  });

  return new NextResponse(captcha.data, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
