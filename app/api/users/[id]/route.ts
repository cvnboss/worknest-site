import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken, hashPassword, comparePassword } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);
    const { id } = await params;
    const user = store.getById('users', id);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const { password: _, ...userData } = user;
    void _;
    return NextResponse.json({ success: true, data: userData });
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

    if (payload.userId !== id && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    // Handle password change
    if (body.currentPassword && body.newPassword) {
      const user = store.getById('users', id);
      if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

      if (!comparePassword(body.currentPassword, user.password as string)) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }

      if (body.newPassword.length < 6) {
        return NextResponse.json({ success: false, error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      store.update('users', id, { password: hashPassword(body.newPassword) });
      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // Handle profile update
    const { password, currentPassword, newPassword, ...profileUpdates } = body;
    void password; void currentPassword; void newPassword;

    const updated = store.update('users', id, profileUpdates);
    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const { password: _, ...userData } = updated;
    void _;

    return NextResponse.json({ success: true, data: userData, message: 'Profile updated' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
