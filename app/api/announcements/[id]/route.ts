import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);
    const { id } = await params;
    const ann = store.getById('announcements', id);
    if (!ann) return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: ann });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    const { id } = await params;
    const ann = store.getById('announcements', id);
    if (!ann) return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    if (ann.author !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only author or admin can edit' }, { status: 403 });
    }
    const body = await request.json();
    const updated = store.update('announcements', id, { ...body, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: updated, message: 'Announcement updated' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    const { id } = await params;
    const ann = store.getById('announcements', id);
    if (!ann) return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    if (ann.author !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only author or admin can delete' }, { status: 403 });
    }
    store.delete('announcements', id);
    return NextResponse.json({ success: true, message: 'Announcement deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
