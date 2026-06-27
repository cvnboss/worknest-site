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
    const search = url.searchParams.get('search') || '';
    const department = url.searchParams.get('department') || '';
    const status = url.searchParams.get('status') || '';
    const sortBy = url.searchParams.get('sortBy') || 'firstName';
    const sortOrder = (url.searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const page = parseInt(url.searchParams.get('page') || '1') || 1;
    const limit = parseInt(url.searchParams.get('limit') || '10') || 10;

    let employees = store.getAll('users').map(u => {
      const { password: _, ...emp } = u;
      void _;
      return emp;
    });

    if (search) {
      const lower = search.toLowerCase();
      employees = employees.filter(e =>
        (e.firstName as string).toLowerCase().includes(lower) ||
        (e.lastName as string).toLowerCase().includes(lower) ||
        (e.email as string).toLowerCase().includes(lower) ||
        (e.position as string).toLowerCase().includes(lower)
      );
    }

    if (department && department !== 'all') {
      employees = employees.filter(e => e.department === department);
    }

    if (status && status !== 'all') {
      employees = employees.filter(e => e.status === status);
    }

    employees = store.sort(employees, sortBy, sortOrder);
    const result = store.paginate(employees, page, limit);

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

    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can create employees' }, { status: 403 });
    }

    const body = await request.json();
    const { email, firstName, lastName, department, position, phone, role, status } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'Required fields: email, firstName, lastName' }, { status: 400 });
    }

    const existing = store.getAll('users').find(u => u.email === email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 });
    }

    const { hashPassword } = await import('@/lib/auth');
    const employee = store.create('users', {
      email,
      password: hashPassword('password123'),
      firstName,
      lastName,
      role: role || 'employee',
      department: department || 'Unassigned',
      position: position || '',
      phone: phone || '',
      avatar: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: status || 'active',
    });

    const { password: _, ...empWithoutPassword } = employee;
    void _;

    return NextResponse.json({ success: true, data: empWithoutPassword, message: 'Employee created' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
