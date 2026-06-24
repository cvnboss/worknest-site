import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const priority = url.searchParams.get('priority') || '';
    const assignee = url.searchParams.get('assignee') || '';
    const search = url.searchParams.get('search') || '';

    let tasks = store.getAll('tasks');

    // Phân quyền theo role: Employee chỉ xem được tasks được gán cho họ hoặc do họ báo cáo
    if (payload.role === 'employee') {
      tasks = tasks.filter(t => t.assignee === payload.userId || t.reporter === payload.userId);
    }

    if (search) {
      const lower = search.toLowerCase();
      tasks = tasks.filter(t =>
        (t.title as string).toLowerCase().includes(lower) ||
        (t.description as string).toLowerCase().includes(lower)
      );
    }
    if (status && status !== 'all') tasks = tasks.filter(t => t.status === status);
    if (priority && priority !== 'all') tasks = tasks.filter(t => t.priority === priority);
    if (assignee && assignee !== 'all') tasks = tasks.filter(t => t.assignee === assignee);

    tasks = store.sort(tasks, 'updatedAt', 'desc');

    return NextResponse.json({ success: true, data: tasks });
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

    const user = store.getById('users', payload.userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { title, description, assignee, priority, status, dueDate, tags } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const assigneeUser = assignee ? store.getById('users', assignee) : null;

    const task = store.create('tasks', {
      title,
      description: description || '',
      assignee: assignee || payload.userId,
      assigneeName: assigneeUser ? `${assigneeUser.firstName} ${assigneeUser.lastName}` : `${user.firstName} ${user.lastName}`,
      reporter: payload.userId,
      reporterName: `${user.firstName} ${user.lastName}`,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || '',
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: task, message: 'Task created' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
