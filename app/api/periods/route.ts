import { NextResponse } from 'next/server';
import { getAvailablePeriods } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const periods = getAvailablePeriods();
    return NextResponse.json({ success: true, periods });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching periods' },
      { status: 500 }
    );
  }
}
