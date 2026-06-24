import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: Request) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId') || '';
    const date = url.searchParams.get('date') || '';

    let meetings = store.getAll('meetings');
    if (roomId) meetings = meetings.filter(m => m.roomId === roomId);
    if (date) meetings = meetings.filter(m => m.date === date);

    meetings = store.sort(meetings, 'date', 'asc');

    return NextResponse.json({ success: true, data: meetings });
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
    const { roomId, title, date, startTime, endTime, attendees } = body;

    if (!roomId || !title || !date || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'Required: roomId, title, date, startTime, endTime' }, { status: 400 });
    }

    const room = store.getById('rooms', roomId);
    if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

    // Check for time conflicts
    const existingMeetings = store.getAll('meetings').filter(
      m => m.roomId === roomId && m.date === date && m.status === 'scheduled'
    );

    const hasConflict = existingMeetings.some(m => {
      return startTime < (m.endTime as string) && endTime > (m.startTime as string);
    });

    if (hasConflict) {
      return NextResponse.json({ success: false, error: 'Time slot conflict. Room is already booked.' }, { status: 409 });
    }

    const meeting = store.create('meetings', {
      roomId,
      roomName: room.name,
      title,
      organizer: payload.userId,
      organizerName: `${user.firstName} ${user.lastName}`,
      attendees: attendees || [],
      date,
      startTime,
      endTime,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: meeting, message: 'Meeting booked' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
