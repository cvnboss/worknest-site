import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';
import type { CalendarEvent, Meeting, Task, LeaveRequest, Employee } from '@/lib/types';

export async function GET(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');
    
    if (!startStr || !endStr) {
        return NextResponse.json({ success: false, error: 'start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    
    const events: CalendarEvent[] = [];

    // 1. Meetings
    const meetings = store.getAll('meetings') as Meeting[];
    meetings.filter(m => m.status === 'scheduled').forEach(m => {
        const mDate = new Date(m.date);
        if (mDate >= startDate && mDate <= endDate) {
            // Check if user is attendee or organizer
            if (m.organizer === payload.userId || m.attendees.includes(payload.userId)) {
                events.push({
                    id: `mtg-${m.id}`,
                    type: 'meeting',
                    title: m.title,
                    date: m.date,
                    startTime: m.startTime,
                    endTime: m.endTime,
                    color: 'var(--info)',
                    metadata: { roomName: m.roomName }
                });
            }
        }
    });

    // 2. Task Deadlines
    const tasks = store.getAll('tasks') as Task[];
    tasks.filter(t => t.status !== 'done' && t.dueDate).forEach(t => {
        const tDate = new Date(t.dueDate);
        if (tDate >= startDate && tDate <= endDate) {
            if (t.assignee === payload.userId || t.reporter === payload.userId) {
                const priorityColorMap: Record<string, string> = {
                    urgent: 'var(--danger)',
                    high: 'var(--warning)',
                    medium: 'var(--primary-500)',
                    low: 'var(--text-muted)'
                };
                events.push({
                    id: `tsk-${t.id}`,
                    type: 'task_deadline',
                    title: `Due: ${t.title}`,
                    date: t.dueDate,
                    color: priorityColorMap[t.priority] || 'var(--primary-500)',
                    metadata: { priority: t.priority }
                });
            }
        }
    });

    // 3. Approved Leaves
    const leaves = store.getAll('leaves') as LeaveRequest[];
    leaves.filter(l => l.status === 'approved').forEach(l => {
        const lStart = new Date(l.startDate);
        const lEnd = new Date(l.endDate);
        
        // If overlap
        if (lStart <= endDate && lEnd >= startDate) {
            // Add an event for each day in the range
            let currentDate = new Date(Math.max(lStart.getTime(), startDate.getTime()));
            const maxDate = new Date(Math.min(lEnd.getTime(), endDate.getTime()));
            
            while (currentDate <= maxDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                events.push({
                    id: `lv-${l.id}-${dateStr}`,
                    type: 'leave',
                    title: l.userId === payload.userId ? `My Leave (${l.type})` : `${l.userName} on leave`,
                    date: dateStr,
                    color: 'var(--success)',
                    metadata: { leaveType: l.type }
                });
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
        }
    });

    // 4. Birthdays (mocked based on joinDate month/day for demo since birthDate is missing)
    const users = store.getAll('users') as Employee[];
    users.filter(u => u.status === 'active' && u.joinDate).forEach(u => {
        // use joinDate as fake birthday/anniversary
        const joinDateParts = u.joinDate.split('-');
        if (joinDateParts.length === 3) {
            const startYear = startDate.getUTCFullYear();
            const endYear = endDate.getUTCFullYear();
            for (let year = startYear; year <= endYear; year++) {
                const bdayDateStr = `${year}-${joinDateParts[1]}-${joinDateParts[2]}`;
                const bdayDate = new Date(bdayDateStr);
                if (bdayDate >= startDate && bdayDate <= endDate) {
                    events.push({
                        id: `bd-${u.id}-${year}`,
                        type: 'birthday',
                        title: `🎂 ${u.firstName}'s Work Anniversary`,
                        date: bdayDateStr,
                        color: 'var(--warning)',
                        metadata: { employeeName: `${u.firstName} ${u.lastName}` }
                    });
                }
            }
        }
    });

    events.sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
        return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
