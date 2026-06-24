import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { comparePassword, signToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function POST(request: Request) {
  ensureSeeded();

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const users = store.getAll('users');
    const user = users.find(u => u.email === email);

    if (!user || !comparePassword(password, user.password as string)) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status === 'inactive') {
      return NextResponse.json({ success: false, error: 'Account is inactive. Please contact administrator.' }, { status: 403 });
    }

    const token = await signToken({ userId: user.id, email: user.email as string, role: user.role as string });

    const { password: _, ...userWithoutPassword } = user;
    void _;

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Login successful'
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
