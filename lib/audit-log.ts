import { COLLECTIONS } from './constants';
import store from './store';
import type { AuditAction, AuditEntityType, AuditLog, User } from './types';

type AuditActor = Pick<AuditLog, 'actorId' | 'actorName' | 'actorRole'>;
type AuditMetadata = Record<string, string | number | boolean | null>;

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RecordAuditLogInput {
  actor: AuditActor;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityLabel?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

const UNSAFE_METADATA_KEY_PARTS = [
  'authorization',
  'body',
  'jwt',
  'password',
  'secret',
  'token',
  'user'
];

export const SYSTEM_AUDIT_ACTOR: AuditActor = {
  actorId: 'system',
  actorName: 'System',
  actorRole: 'admin'
};

function isAuditRole(value: string): value is AuditLog['actorRole'] {
  return value === 'employee' || value === 'manager' || value === 'admin';
}

function isSafeMetadataValue(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function sanitizeMetadata(metadata?: Record<string, unknown>): AuditMetadata | undefined {
  if (!metadata) return undefined;

  const safeEntries = Object.entries(metadata).filter(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    const unsafe = UNSAFE_METADATA_KEY_PARTS.some(part => normalizedKey.includes(part));
    return !unsafe && isSafeMetadataValue(value);
  });

  if (safeEntries.length === 0) return undefined;
  return Object.fromEntries(safeEntries) as AuditMetadata;
}

function trimSummary(summary: string): string {
  return summary.trim().slice(0, 240);
}

export function getAuditActorFromPayload(payload: TokenPayload): AuditActor {
  const user = store.getById(COLLECTIONS.USERS, payload.userId) as User | undefined;
  const role = isAuditRole(payload.role) ? payload.role : 'employee';

  if (!user) {
    return {
      actorId: payload.userId || SYSTEM_AUDIT_ACTOR.actorId,
      actorName: payload.email || SYSTEM_AUDIT_ACTOR.actorName,
      actorRole: role
    };
  }

  return {
    actorId: user.id,
    actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
    actorRole: user.role
  };
}

export function recordAuditLog(input: RecordAuditLogInput): AuditLog | undefined {
  try {
    const summary = trimSummary(input.summary);
    if (!summary) return undefined;

    const log = store.create(COLLECTIONS.AUDIT_LOGS, {
      actorId: input.actor.actorId,
      actorName: input.actor.actorName,
      actorRole: input.actor.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      entityLabel: input.entityLabel,
      summary,
      metadata: sanitizeMetadata(input.metadata),
      createdAt: new Date().toISOString()
    }) as AuditLog;

    return log;
  } catch (error) {
    console.error('[audit-log] failed to record audit log:', error);
    return undefined;
  }
}
