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

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const isAdminOrManager = payload.role === 'admin' || payload.role === 'manager';

    const totalEmployees = store.getAll('users').filter(u => u.status === 'active').length;
    
    const pendingLeaves = isAdminOrManager 
      ? store.getAll('leaves').filter(l => l.status === 'pending').length
      : store.getAll('leaves').filter(l => l.userId === payload.userId && l.status === 'pending').length;

    const todayMeetings = isAdminOrManager
      ? store.getAll('meetings').filter(m => m.date === today && m.status === 'scheduled').length
      : store.getAll('meetings').filter(m => m.date === today && m.status === 'scheduled' && (m.organizer === payload.userId || m.attendees.includes(payload.userId))).length;

    const openTasks = isAdminOrManager
      ? store.getAll('tasks').filter(t => t.status !== 'done').length
      : store.getAll('tasks').filter(t => t.assignee === payload.userId && t.status !== 'done').length;

    const approvedLeaves = isAdminOrManager
      ? 0
      : store.getAll('leaves').filter(l => l.userId === payload.userId && l.status === 'approved').length;

    const upcomingMeetings = store.getAll('meetings')
      .filter(m => m.date >= today && m.status === 'scheduled' && (m.organizer === payload.userId || m.attendees.includes(payload.userId)))
      .sort((a, b) => {
        const dateCompare = (a.date as string).localeCompare(b.date as string);
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime as string).localeCompare(b.startTime as string);
      })
      .slice(0, 5);

    const myTasks = store.getAll('tasks')
      .filter(t => t.assignee === payload.userId && t.status !== 'done')
      .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime())
      .slice(0, 5);

    const recentActivities = [
      ...store.getAll('leaves').slice(-3).map(l => ({
        id: `act-${l.id}`, type: 'leave' as const,
        message: `${l.userName} requested ${l.type} leave`,
        timestamp: l.createdAt as string, user: l.userName as string,
      })),
      ...store.getAll('meetings').slice(-3).map(m => ({
        id: `act-${m.id}`, type: 'meeting' as const,
        message: `${m.organizerName} booked ${m.roomName}`,
        timestamp: m.createdAt as string, user: m.organizerName as string,
      })),
      ...store.getAll('tasks').slice(-3).map(t => ({
        id: `act-${t.id}`, type: 'task' as const,
        message: `${t.reporterName} created task "${t.title}"`,
        timestamp: t.createdAt as string, user: t.reporterName as string,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 8);

    return NextResponse.json({
      success: true,
      data: { totalEmployees, pendingLeaves, todayMeetings, openTasks, approvedLeaves, upcomingMeetings, myTasks, recentActivities },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
