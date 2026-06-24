import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

export async function POST() {
  store.reset();
  ensureSeeded();

  return NextResponse.json({
    success: true,
    message: 'All data has been reset to initial seed state',
  });
}
