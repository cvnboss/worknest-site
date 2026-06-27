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
    const user = store.getById('users', id);
    if (!user) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

    const { password: _, ...employee } = user;
    void _;

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('[employees/id GET] error:', error);
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

    if (payload.role !== 'admin' && payload.userId !== (await params).id) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updates = pickFields(body, ['firstName', 'lastName', 'email', 'phone', 'department', 'position', 'status', 'avatar', 'joinDate']);

    const updated = store.update('users', id, updates);
    if (!updated) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

    const { password: _, ...employee } = updated;
    void _;

    return NextResponse.json({ success: true, data: employee, message: 'Employee updated' });
  } catch (error) {
    console.error('[employees/id PUT] error:', error);
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

    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can delete employees' }, { status: 403 });
    }

    const { id } = await params;

    if (id === payload.userId) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 });
    }

    const deleted = store.delete('users', id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Employee deleted' });
  } catch (error) {
    console.error('[employees/id DELETE] error:', error);
    if (error instanceof Error && (error.message.includes('JWS') || error.message.includes('JWT'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
