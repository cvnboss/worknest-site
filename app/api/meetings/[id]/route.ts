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
    const meeting = store.getById('meetings', id);
    if (!meeting) return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error('[meetings/id GET] error:', error);
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
    const meeting = store.getById('meetings', id);
    if (!meeting) return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });
    if (meeting.organizer !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only organizer or admin can modify' }, { status: 403 });
    }
    const body = await request.json();
    const updates = pickFields(body, ['title', 'roomId', 'roomName', 'attendees', 'date', 'startTime', 'endTime', 'status']);
    const updated = store.update('meetings', id, updates);
    return NextResponse.json({ success: true, data: updated, message: 'Meeting updated' });
  } catch (error) {
    console.error('[meetings/id PUT] error:', error);
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
    const meeting = store.getById('meetings', id);
    if (!meeting) return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });
    if (meeting.organizer !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only organizer or admin can delete' }, { status: 403 });
    }
    store.delete('meetings', id);
    return NextResponse.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    console.error('[meetings/id DELETE] error:', error);
    if (error instanceof Error && (error.message.includes('JWS') || error.message.includes('JWT'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
