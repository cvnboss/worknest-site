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
    const leave = store.getById('leaves', id);
    if (!leave) return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: leave });
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
    const leave = store.getById('leaves', id);
    if (!leave) return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 });
    if (leave.userId !== payload.userId) {
      return NextResponse.json({ success: false, error: 'You can only edit your own requests' }, { status: 403 });
    }
    if (leave.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Only pending requests can be edited' }, { status: 400 });
    }
    const body = await request.json();
    const updated = store.update('leaves', id, { ...body, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: updated, message: 'Leave request updated' });
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
    const leave = store.getById('leaves', id);
    if (!leave) return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 });
    if (leave.userId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }
    if (leave.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Only pending requests can be deleted' }, { status: 400 });
    }
    store.delete('leaves', id);
    return NextResponse.json({ success: true, message: 'Leave request deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
