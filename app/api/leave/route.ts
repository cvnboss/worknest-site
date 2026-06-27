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

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const userId = url.searchParams.get('userId') || '';
    const view = url.searchParams.get('view') || 'my';
    const page = parseInt(url.searchParams.get('page') || '1') || 1;
    const limit = parseInt(url.searchParams.get('limit') || '20') || 20;

    let leaves = store.getAll('leaves');

    if (view === 'my') {
      leaves = leaves.filter(l => l.userId === payload.userId);
    }

    if (status && status !== 'all') {
      leaves = leaves.filter(l => l.status === status);
    }
    if (type && type !== 'all') {
      leaves = leaves.filter(l => l.type === type);
    }
    if (userId) {
      leaves = leaves.filter(l => l.userId === userId);
    }

    leaves = store.sort(leaves, 'createdAt', 'desc');
    const result = store.paginate(leaves, page, limit);

    return NextResponse.json({ success: true, ...result });
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
    const { type, startDate, endDate, reason } = body;

    if (!type || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, error: 'Required fields: type, startDate, endDate, reason' }, { status: 400 });
    }

    const validTypes = ['annual', 'sick', 'personal', 'remote'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid leave type' }, { status: 400 });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ success: false, error: 'Start date must be before or equal to end date' }, { status: 400 });
    }

    if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid date format' }, { status: 400 });
    }

    const leave = store.create('leaves', {
      userId: payload.userId,
      userName: `${user.firstName} ${user.lastName}`,
      type,
      startDate,
      endDate,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: leave, message: 'Leave request created' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
