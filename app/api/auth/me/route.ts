import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authorization token is required' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const user = store.getById('users', payload.userId);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    void _;

    return NextResponse.json({ success: true, data: { user: userWithoutPassword } });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}
