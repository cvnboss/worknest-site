import { NextResponse } from 'next/server';

export function omitPassword<T extends Record<string, any>>(user: T): Omit<T, 'password'> {
  const { password, ...rest } = user;
  return rest as Omit<T, 'password'>;
}

export function createResponse(data: any, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, ...(message && { message }) }, { status });
}

export function createErrorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export function parsePageParams(url: URL): { page: number; limit: number } {
  const page = parseInt(url.searchParams.get('page') || '1') || 1;
  const limit = parseInt(url.searchParams.get('limit') || '10') || 10;
  return { page: Math.max(1, page), limit: Math.max(1, Math.min(100, limit)) };
}

export function pickFields(body: Record<string, any>, allowedFields: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }
  return result;
}

export function normalizeDepartmentName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isJwtError(error: unknown): boolean {
  return error instanceof Error && (error.message.includes('JWS') || error.message.includes('JWT'));
}
