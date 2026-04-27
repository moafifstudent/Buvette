import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthCookieName, verifyAuthToken } from '@/lib/auth';

export async function GET() {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  const authenticated = verifyAuthToken(token);

  return NextResponse.json({ authenticated });
}
