import { NextRequest, NextResponse } from 'next/server';
import { queryPeriodData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';
    const tramite = searchParams.get('tramite') || 'todas';

    const data = queryPeriodData(period, tramite);
    if (!data) {
      return NextResponse.json(
        { success: false, error: `No se encontraron datos para el periodo ${period} y trámite ${tramite}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error querying database' },
      { status: 500 }
    );
  }
}
