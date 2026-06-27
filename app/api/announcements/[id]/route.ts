import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { pickFields } from '@/lib/api-utils';
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
  } catch (error) {
    console.error('[announcements/id GET] error:', error);
    if (error instanceof Error && (error.message.includes('JWS') || error.message.includes('JWT'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
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
    const updates = pickFields(body, ['title', 'content', 'category', 'isPinned']);
    const updated = store.update('announcements', id, { ...updates, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: updated, message: 'Announcement updated' });
  } catch (error) {
    console.error('[announcements/id PUT] error:', error);
    if (error instanceof Error && (error.message.includes('JWS') || error.message.includes('JWT'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
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
  } catch (error) {
    console.error('[announcements/id DELETE] error:', error);
    if (error instanceof Error && (error.message.includes('JWS') || error.message.includes('JWT'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
