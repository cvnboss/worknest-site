import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { extractToken, verifyToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';
import { COLLECTIONS, DEPARTMENT_STATUS, MAX_LENGTHS } from '@/lib/constants';
import { isJwtError, normalizeDepartmentName, pickFields } from '@/lib/api-utils';
import type { Department, DepartmentStatus, DepartmentWithStats, Employee, LeaveRequest, Task, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

type DepartmentDetail = DepartmentWithStats & {
  members: Employee[];
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

function omitUserPassword(user: User): Employee {
  const { password: _, ...employee } = user;
  void _;
  return employee;
}

function isDepartmentStatus(value: unknown): value is DepartmentStatus {
  return typeof value === 'string' && DEPARTMENT_STATUS.includes(value as DepartmentStatus);
}

function findDuplicateDepartment(name: string, currentDepartmentId: string): Department | undefined {
  const normalizedName = normalizeDepartmentName(name);
  return getDepartments().find((department) =>
    department.id !== currentDepartmentId && normalizeDepartmentName(department.name) === normalizedName
  );
}

function getValidManager(managerId: unknown): User | undefined | null {
  if (managerId === undefined) return undefined;
  if (managerId === null || managerId === '') return undefined;
  if (typeof managerId !== 'string') return null;

  const manager = store.getById(COLLECTIONS.USERS, managerId) as User | undefined;
  if (!manager || manager.status !== 'active' || (manager.role !== 'admin' && manager.role !== 'manager')) {
    return null;
  }

  return manager;
}

function buildDepartmentDetail(department: Department): DepartmentDetail {
  const members = getUsers()
    .filter((user) => user.department === department.name)
    .map(omitUserPassword);

  return {
    ...department,
    ...getDepartmentStats(department.name),
    members,
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const { id } = await params;
    const department = store.getById(COLLECTIONS.DEPARTMENTS, id) as Department | undefined;
    if (!department) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: buildDepartmentDetail(department) });
  } catch (error) {
    console.error('[departments/id GET] error:', error);
    if (isJwtError(error)) {
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

    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can update departments' }, { status: 403 });
    }

    const { id } = await params;
    const department = store.getById(COLLECTIONS.DEPARTMENTS, id) as Department | undefined;
    if (!department) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updates = pickFields(body, ['name', 'description', 'managerId', 'status']);
    const departmentUpdates: Partial<Department> = {};

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string') {
        return NextResponse.json({ success: false, error: 'Department name must be a string' }, { status: 400 });
      }

      const nextName = updates.name.trim().replace(/\s+/g, ' ');
      if (!nextName) {
        return NextResponse.json({ success: false, error: 'Department name is required' }, { status: 400 });
      }

      if (nextName.length > MAX_LENGTHS.DEPARTMENT_NAME) {
        return NextResponse.json({ success: false, error: 'Department name is too long' }, { status: 400 });
      }

      if (findDuplicateDepartment(nextName, id)) {
        return NextResponse.json({ success: false, error: 'Department name already exists' }, { status: 400 });
      }

      departmentUpdates.name = nextName;
    }

    if (updates.description !== undefined) {
      if (typeof updates.description !== 'string') {
        return NextResponse.json({ success: false, error: 'Department description must be a string' }, { status: 400 });
      }

      const description = updates.description.trim();
      if (description.length > MAX_LENGTHS.DEPARTMENT_DESCRIPTION) {
        return NextResponse.json({ success: false, error: 'Department description is too long' }, { status: 400 });
      }

      departmentUpdates.description = description;
    }

    if (updates.status !== undefined) {
      if (!isDepartmentStatus(updates.status)) {
        return NextResponse.json({ success: false, error: 'Invalid department status' }, { status: 400 });
      }

      departmentUpdates.status = updates.status;
    }

    if (updates.managerId !== undefined) {
      const manager = getValidManager(updates.managerId);
      if (manager === null) {
        return NextResponse.json({ success: false, error: 'Manager must be an active admin or manager' }, { status: 400 });
      }

      departmentUpdates.managerId = manager?.id;
      departmentUpdates.managerName = manager ? `${manager.firstName} ${manager.lastName}` : undefined;
    }

    const nextName = departmentUpdates.name;
    const previousName = department.name;
    const updated = store.update(COLLECTIONS.DEPARTMENTS, id, {
      ...departmentUpdates,
      updatedAt: new Date().toISOString(),
    }) as Department | undefined;

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }

    if (nextName && nextName !== previousName) {
      getUsers()
        .filter((user) => user.department === previousName)
        .forEach((user) => {
          store.update(COLLECTIONS.USERS, user.id, { department: nextName });
        });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Department updated' });
  } catch (error) {
    console.error('[departments/id PUT] error:', error);
    if (isJwtError(error)) {
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
      return NextResponse.json({ success: false, error: 'Only admins can deactivate departments' }, { status: 403 });
    }

    const { id } = await params;
    const department = store.getById(COLLECTIONS.DEPARTMENTS, id) as Department | undefined;
    if (!department) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }

    const updated = store.update(COLLECTIONS.DEPARTMENTS, id, {
      status: 'inactive',
      updatedAt: new Date().toISOString(),
    }) as Department | undefined;

    return NextResponse.json({ success: true, data: updated, message: 'Department deactivated' });
  } catch (error) {
    console.error('[departments/id DELETE] error:', error);
    if (isJwtError(error)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
