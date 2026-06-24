import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function PUT(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const body = await request.json();
    const { ids, all } = body;

    const notifications = store.getAll('notifications').filter(n => n.userId === payload.userId);

    let updatedCount = 0;

    if (all) {
      notifications.forEach(n => {
        if (!n.isRead) {
          store.update('notifications', n.id as string, { isRead: true });
          updatedCount++;
        }
      });
    } else if (Array.isArray(ids)) {
      ids.forEach(id => {
        const n = store.getById('notifications', id);
        if (n && n.userId === payload.userId && !n.isRead) {
          store.update('notifications', id, { isRead: true });
          updatedCount++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${updatedCount} notifications as read`,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
