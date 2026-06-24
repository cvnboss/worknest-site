import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);
    const { id } = await params;
    const task = store.getById('tasks', id);
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: task });
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
    
    const task = store.getById('tasks', id);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Phân quyền cập nhật task: Employee chỉ có quyền sửa task của mình (được assign hoặc do mình report)
    if (payload.role === 'employee' && task.assignee !== payload.userId && task.reporter !== payload.userId) {
      return NextResponse.json({ success: false, error: 'You do not have permission to edit this task' }, { status: 403 });
    }

    const body = await request.json();

    if (body.assignee) {
      const assigneeUser = store.getById('users', body.assignee);
      if (assigneeUser) {
        body.assigneeName = `${assigneeUser.firstName} ${assigneeUser.lastName}`;
      }
    }

    const updated = store.update('tasks', id, { ...body, updatedAt: new Date().toISOString() });
    if (!updated) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Task updated' });
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
    const task = store.getById('tasks', id);
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    if (task.reporter !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only reporter or admin can delete' }, { status: 403 });
    }
    store.delete('tasks', id);
    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
