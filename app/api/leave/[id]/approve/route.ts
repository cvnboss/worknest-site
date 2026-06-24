import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    if (payload.role !== 'manager' && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only managers and admins can approve/reject leave requests' }, { status: 403 });
    }

    const { id } = await params;
    const leave = store.getById('leaves', id);
    if (!leave) return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 });

    if (leave.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Only pending requests can be approved/rejected' }, { status: 400 });
    }

    const body = await request.json();
    const { action, note } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Action must be "approve" or "reject"' }, { status: 400 });
    }

    const reviewer = store.getById('users', payload.userId);
    const updated = store.update('leaves', id, {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: payload.userId,
      reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Unknown',
      reviewNote: note || '',
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Leave request ${action === 'approve' ? 'approved' : 'rejected'}`
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
