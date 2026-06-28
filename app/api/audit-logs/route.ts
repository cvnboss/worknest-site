import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { extractToken, verifyToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';
import { COLLECTIONS } from '@/lib/constants';
import { isJwtError, parsePageParams } from '@/lib/api-utils';
import type { AuditAction, AuditEntityType, AuditLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

const AUDIT_ACTIONS: AuditAction[] = ['create', 'update', 'delete', 'deactivate', 'approve', 'reject', 'assign', 'reset'];
const AUDIT_ENTITY_TYPES: AuditEntityType[] = [
  'department',
  'department_members',
  'employee',
  'leave',
  'meeting',
  'task',
  'announcement',
  'notification',
  'system'
];

function isAuditAction(value: string): value is AuditAction {
  return AUDIT_ACTIONS.includes(value as AuditAction);
}

function isAuditEntityType(value: string): value is AuditEntityType {
  return AUDIT_ENTITY_TYPES.includes(value as AuditEntityType);
}

function parseDateParam(value: string | null, label: string): string | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid ${label}`);
  }
  return new Date(timestamp).toISOString();
}

export async function GET(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can view audit logs' }, { status: 403 });
    }

    const url = new URL(request.url);
    const query = (url.searchParams.get('q') || '').trim().toLowerCase();
    const actorId = (url.searchParams.get('actorId') || '').trim();
    const action = (url.searchParams.get('action') || '').trim();
    const entityType = (url.searchParams.get('entityType') || '').trim();
    const dateFrom = parseDateParam(url.searchParams.get('dateFrom'), 'dateFrom');
    const dateTo = parseDateParam(url.searchParams.get('dateTo'), 'dateTo');
    const { page, limit } = parsePageParams(url);

    if (action && action !== 'all' && !isAuditAction(action)) {
      return NextResponse.json({ success: false, error: 'Invalid audit action' }, { status: 400 });
    }

    if (entityType && entityType !== 'all' && !isAuditEntityType(entityType)) {
      return NextResponse.json({ success: false, error: 'Invalid audit entity type' }, { status: 400 });
    }

    let logs = store.getAll(COLLECTIONS.AUDIT_LOGS) as AuditLog[];

    if (query) {
      logs = logs.filter(log =>
        log.actorName.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query) ||
        (log.entityLabel || '').toLowerCase().includes(query) ||
        log.summary.toLowerCase().includes(query)
      );
    }

    if (actorId && actorId !== 'all') {
      logs = logs.filter(log => log.actorId === actorId);
    }

    if (action && action !== 'all') {
      logs = logs.filter(log => log.action === action);
    }

    if (entityType && entityType !== 'all') {
      logs = logs.filter(log => log.entityType === entityType);
    }

    if (dateFrom) {
      logs = logs.filter(log => log.createdAt >= dateFrom);
    }

    if (dateTo) {
      logs = logs.filter(log => log.createdAt <= dateTo);
    }

    logs = [...logs].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    const paginated = store.paginate(logs, page, limit) as {
      data: AuditLog[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };

    return NextResponse.json({
      success: true,
      data: paginated.data,
      pagination: {
        page: paginated.page,
        limit: paginated.limit,
        total: paginated.total,
        totalPages: paginated.totalPages
      }
    });
  } catch (error) {
    console.error('[audit-logs GET] error:', error);
    if (isJwtError(error)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.startsWith('Invalid date')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
