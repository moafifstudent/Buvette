import { NextResponse } from 'next/server';
import { createAuthToken, getAuthCookieName } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || '');
    const password = String(body.password || '');

    if (
      username !== (process.env.ADMIN_USERNAME || 'admin') ||
      password !== (process.env.ADMIN_PASSWORD || 'admin123')
    ) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createAuthToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
