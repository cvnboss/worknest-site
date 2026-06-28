import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { extractToken, verifyToken } from '@/lib/auth';
import { getAuditActorFromPayload, recordAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can reset seed data' }, { status: 403 });
    }

    store.reset();
    ensureSeeded();
    recordAuditLog({
      actor: getAuditActorFromPayload(payload),
      action: 'reset',
      entityType: 'system',
      entityId: 'seed',
      entityLabel: 'Seed data',
      summary: 'Reset seed data',
      metadata: {
        reset: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'All data has been reset to initial seed state',
    });
  } catch (error) {
    console.error('[seed] error:', error);
    if (error instanceof Error && (error.message.includes('JWS') || error.message.includes('JWT'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
