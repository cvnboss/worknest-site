import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const { id } = await params;
    const ann = store.getById('announcements', id);
    if (!ann) return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });

    const user = store.getById('users', payload.userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 });
    }

    const comment = {
      id: crypto.randomUUID(),
      content: content.trim(),
      author: payload.userId,
      authorName: `${user.firstName} ${user.lastName}`,
      createdAt: new Date().toISOString(),
    };

    const comments = [...(ann.comments as Array<unknown> || []), comment];
    store.update('announcements', id, { comments, updatedAt: new Date().toISOString() });

    return NextResponse.json({ success: true, data: comment, message: 'Comment added' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
