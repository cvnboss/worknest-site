import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { extractToken, verifyToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';
import { COLLECTIONS } from '@/lib/constants';
import { isJwtError, omitPassword } from '@/lib/api-utils';
import type { Department, Employee, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

type MembersUpdateBody = {
  userIds?: unknown;
};

function getDepartmentMembers(departmentName: string): Employee[] {
  return (store.getAll(COLLECTIONS.USERS) as User[])
    .filter((user) => user.department === departmentName)
    .map((user) => omitPassword(user));
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

    return NextResponse.json({ success: true, data: getDepartmentMembers(department.name) });
  } catch (error) {
    console.error('[departments/id/members GET] error:', error);
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
      return NextResponse.json({ success: false, error: 'Only admins can update department members' }, { status: 403 });
    }

    const { id } = await params;
    const department = store.getById(COLLECTIONS.DEPARTMENTS, id) as Department | undefined;
    if (!department) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }

    const body = (await request.json()) as MembersUpdateBody;
    if (!Array.isArray(body.userIds) || !body.userIds.every((userId) => typeof userId === 'string')) {
      return NextResponse.json({ success: false, error: 'userIds must be an array of user IDs' }, { status: 400 });
    }

    const uniqueUserIds = Array.from(new Set(body.userIds));
    const users = store.getAll(COLLECTIONS.USERS) as User[];
    const missingUserId = uniqueUserIds.find((userId) => !users.some((user) => user.id === userId));
    if (missingUserId) {
      return NextResponse.json({ success: false, error: `User not found: ${missingUserId}` }, { status: 400 });
    }

    const selectedUserIds = new Set(uniqueUserIds);

    users
      .filter((user) => user.department === department.name && !selectedUserIds.has(user.id))
      .forEach((user) => {
        store.update(COLLECTIONS.USERS, user.id, { department: 'Unassigned' });
      });

    uniqueUserIds.forEach((userId) => {
      store.update(COLLECTIONS.USERS, userId, { department: department.name });
    });

    const updatedMembers = getDepartmentMembers(department.name);
    return NextResponse.json({
      success: true,
      data: updatedMembers,
      message: `Assigned ${uniqueUserIds.length} employee${uniqueUserIds.length === 1 ? '' : 's'} to ${department.name}`,
    });
  } catch (error) {
    console.error('[departments/id/members PUT] error:', error);
    if (isJwtError(error)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
