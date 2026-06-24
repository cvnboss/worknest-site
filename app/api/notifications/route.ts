import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let notifications = store.getAll('notifications').filter(n => n.userId === payload.userId);

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.isRead);
    }

    notifications.sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime());

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
