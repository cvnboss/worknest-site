import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { extractToken, verifyToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';
import { COLLECTIONS, DEPARTMENT_STATUS, MAX_LENGTHS } from '@/lib/constants';
import { isJwtError, normalizeDepartmentName } from '@/lib/api-utils';
import type { Department, DepartmentStatus, DepartmentWithStats, LeaveRequest, Task, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

type DepartmentCreateBody = {
  name?: unknown;
  description?: unknown;
  managerId?: unknown;
  status?: unknown;
};

function getDepartments(): Department[] {
  return store.getAll(COLLECTIONS.DEPARTMENTS) as Department[];
}

function getUsers(): User[] {
  return store.getAll(COLLECTIONS.USERS) as User[];
}

function getDepartmentStats(departmentName: string): Omit<DepartmentWithStats, keyof Department> {
  const users = getUsers();
  const departmentUsers = users.filter((user) => user.department === departmentName);
  const departmentUserIds = new Set(departmentUsers.map((user) => user.id));
  const tasks = store.getAll(COLLECTIONS.TASKS) as Task[];
  const leaves = store.getAll(COLLECTIONS.LEAVES) as LeaveRequest[];

  return {
    employeeCount: departmentUsers.length,
    activeEmployeeCount: departmentUsers.filter((user) => user.status === 'active').length,
    openTaskCount: tasks.filter((task) => departmentUserIds.has(task.assignee) && task.status !== 'done').length,
    pendingLeaveCount: leaves.filter((leave) => departmentUserIds.has(leave.userId) && leave.status === 'pending').length,
  };
}

function withStats(department: Department): DepartmentWithStats {
  return {
    ...department,
    ...getDepartmentStats(department.name),
  };
}

function isDepartmentStatus(value: unknown): value is DepartmentStatus {
  return typeof value === 'string' && DEPARTMENT_STATUS.includes(value as DepartmentStatus);
}

function findDuplicateDepartment(name: string): Department | undefined {
  const normalizedName = normalizeDepartmentName(name);
  return getDepartments().find((department) => normalizeDepartmentName(department.name) === normalizedName);
}

function getValidManager(managerId: unknown): User | undefined | null {
  if (managerId === undefined || managerId === null || managerId === '') return undefined;
  if (typeof managerId !== 'string') return null;

  const manager = store.getById(COLLECTIONS.USERS, managerId) as User | undefined;
  if (!manager || manager.status !== 'active' || (manager.role !== 'admin' && manager.role !== 'manager')) {
    return null;
  }

  return manager;
}

export async function GET(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    const query = (url.searchParams.get('q') || '').trim().toLowerCase();
    const includeStats = url.searchParams.get('includeStats') === 'true';

    if (status !== 'all' && !isDepartmentStatus(status)) {
      return NextResponse.json({ success: false, error: 'Invalid department status' }, { status: 400 });
    }

    let departments = getDepartments();

    if (status !== 'all') {
      departments = departments.filter((department) => department.status === status);
    }

    if (query) {
      departments = departments.filter((department) =>
        department.name.toLowerCase().includes(query) ||
        department.description.toLowerCase().includes(query) ||
        (department.managerName || '').toLowerCase().includes(query)
      );
    }

    departments = [...departments].sort((left, right) => {
      if (left.status !== right.status) return left.status === 'active' ? -1 : 1;
      return left.name.localeCompare(right.name);
    });

    const data = includeStats ? departments.map(withStats) : departments;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[departments GET] error:', error);
    if (isJwtError(error)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can create departments' }, { status: 403 });
    }

    const body = (await request.json()) as DepartmentCreateBody;
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const status = body.status === undefined ? 'active' : body.status;
    const manager = getValidManager(body.managerId);

    if (!name) {
      return NextResponse.json({ success: false, error: 'Department name is required' }, { status: 400 });
    }

    if (name.length > MAX_LENGTHS.DEPARTMENT_NAME) {
      return NextResponse.json({ success: false, error: 'Department name is too long' }, { status: 400 });
    }

    if (description.length > MAX_LENGTHS.DEPARTMENT_DESCRIPTION) {
      return NextResponse.json({ success: false, error: 'Department description is too long' }, { status: 400 });
    }

    if (!isDepartmentStatus(status)) {
      return NextResponse.json({ success: false, error: 'Invalid department status' }, { status: 400 });
    }

    if (manager === null) {
      return NextResponse.json({ success: false, error: 'Manager must be an active admin or manager' }, { status: 400 });
    }

    if (findDuplicateDepartment(name)) {
      return NextResponse.json({ success: false, error: 'Department name already exists' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const department = store.create(COLLECTIONS.DEPARTMENTS, {
      name,
      description,
      managerId: manager?.id,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : undefined,
      status,
      createdAt: now,
      updatedAt: now,
    }) as Department;

    return NextResponse.json({ success: true, data: department, message: 'Department created' }, { status: 201 });
  } catch (error) {
    console.error('[departments POST] error:', error);
    if (isJwtError(error)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
