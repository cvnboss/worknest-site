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
    const user = store.getById('users', id);
    if (!user) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...employee } = user;

    // Leave history
    const leaveHistory = store.getAll('leaves')
      .filter(l => l.userId === id)
      .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

    // Tasks assigned to this employee
    const tasks = store.getAll('tasks')
      .filter(t => t.assignee === id)
      .sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime());

    // Compute stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const reviewTasks = tasks.filter(t => t.status === 'review').length;

    // Leave days calculation
    const calcDays = (start: string, end: string) => {
      const s = new Date(start);
      const e = new Date(end);
      return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    };

    const leaveDaysUsed = leaveHistory
      .filter(l => l.status === 'approved')
      .reduce((sum, l) => sum + calcDays(l.startDate as string, l.endDate as string), 0);

    const leaveDaysPending = leaveHistory
      .filter(l => l.status === 'pending')
      .reduce((sum, l) => sum + calcDays(l.startDate as string, l.endDate as string), 0);

    return NextResponse.json({
      success: true,
      data: {
        employee,
        leaveHistory,
        tasks,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          reviewTasks,
          leaveDaysUsed,
          leaveDaysPending,
        },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
