import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { hashPassword, signToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';
import { createEmployeeAvatar } from '@/lib/utils';

export async function POST(request: Request) {
  ensureSeeded();

  try {
    const body = await request.json();
    const { email, password, firstName, lastName, department } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'All fields are required (email, password, firstName, lastName)' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    const existingUsers = store.getAll('users');
    if (existingUsers.some(u => u.email === email)) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    const user = store.create('users', {
      email,
      password: hashPassword(password),
      firstName,
      lastName,
      role: 'employee',
      department: department || 'Unassigned',
      position: 'New Employee',
      phone: '',
      avatar: createEmployeeAvatar(firstName, lastName, email),
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });

    const token = await signToken({ userId: user.id, email: user.email as string, role: user.role as string });

    const { password: _, ...userWithoutPassword } = user;
    void _;

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Registration successful'
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
