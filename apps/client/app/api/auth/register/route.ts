import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@rikka/database';
import { RegisterSchema } from '@rikka/shared';

export async function POST(request: Request) {
  try {
      const body = await request.json();
      
      // 1. Validate Schema
      const result = RegisterSchema.safeParse(body);
      if (!result.success) {
          return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
      }
      const { phone, password, captcha } = result.data;

      // 2. Verify Captcha
      const cookieStore = await cookies();
      const captchaHash = cookieStore.get('captcha_hash')?.value;
      if (!captchaHash) {
          return NextResponse.json({ error: "Captcha expired" }, { status: 400 });
      }
      
      const secret = process.env.NEXTAUTH_SECRET || 'dev_secret';
      const expectedHash = crypto.createHmac('sha256', secret).update(captcha.toLowerCase()).digest('hex');
      
      if (captchaHash !== expectedHash) {
           return NextResponse.json({ error: "Invalid captcha" }, { status: 400 });
      }

      // 3. Check existing user
      const existing = await prisma.user.findUnique({
          where: { phone }
      });
      if (existing) {
          return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
      }

      // 4. Create User
      const hashedPassword = await bcrypt.hash(password, 10);
      const name = `Player ${Math.floor(Math.random() * 10000)}`;
      
      await prisma.user.create({
          data: {
              phone,
              password: hashedPassword,
              name,
              score: 1000
          }
      });

      // Clear captcha cookie
      cookieStore.delete('captcha_hash');

      return NextResponse.json({ success: true });

  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
