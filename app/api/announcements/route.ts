import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: Request) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';

    let announcements = store.getAll('announcements');

    if (category && category !== 'all') {
      announcements = announcements.filter(a => a.category === category);
    }

    // Pinned first, then by date
    announcements.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    if (payload.role === 'employee') {
      return NextResponse.json({ success: false, error: 'Only managers and admins can create announcements' }, { status: 403 });
    }

    const user = store.getById('users', payload.userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { title, content, category, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const announcement = store.create('announcements', {
      title,
      content,
      author: payload.userId,
      authorName: `${user.firstName} ${user.lastName}`,
      category: category || 'general',
      isPinned: isPinned || false,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: announcement, message: 'Announcement created' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
