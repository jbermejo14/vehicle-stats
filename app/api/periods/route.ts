import { NextResponse } from 'next/server';
import { getPeriodsIndex, getMetadata } from '@/lib/staticData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const periodsIndex = getPeriodsIndex();
    const metadata = getMetadata();

    const periods = [
      {
        id: 'all',
        label: `Histórico Completo (${metadata.startPeriod.slice(0, 4)} - ${metadata.endPeriod.slice(0, 4)}) • ${metadata.totalRegistrations.toLocaleString('es-ES')} regs`,
        totalRegs: metadata.totalRegistrations,
        isAll: true,
      },
      ...periodsIndex.years.map(y => ({
        id: String(y.year),
        label: `Año ${y.year} Completo • ${y.total.toLocaleString('es-ES')} regs`,
        totalRegs: y.total,
        isYear: true,
      })),
      ...periodsIndex.months.map(m => ({
        id: m.id,
        label: `${m.label} • ${m.total.toLocaleString('es-ES')} regs`,
        totalRegs: m.total,
      }))
    ];

    return NextResponse.json({ success: true, periods });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching periods' },
      { status: 500 }
    );
  }
}
