import { NextRequest, NextResponse } from 'next/server';
import { getPeriodData, getOverview } from '@/lib/staticData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';

    let data: any = null;

    if (period === 'all') {
      const overview = getOverview();
      data = {
        periodLabel: 'Histórico Completo',
        totalRegistrations: overview.totalRegistrations,
        kpis: {
          totalRegistrations: overview.totalRegistrations,
          nuevasCount: overview.totalRegistrations,
          transferenciasCount: 0,
          electrificadosCount: (overview.globalFuels?.bev || 0) + (overview.globalFuels?.phev || 0),
          electrificadosPct: parseFloat(((((overview.globalFuels?.bev || 0) + (overview.globalFuels?.phev || 0)) / overview.totalRegistrations) * 100).toFixed(1)),
          ceroCount: overview.globalBadges?.cero || 0,
          ceroPct: parseFloat((((overview.globalBadges?.cero || 0) / overview.totalRegistrations) * 100).toFixed(1)),
          ecoCount: overview.globalBadges?.eco || 0,
          ecoPct: parseFloat((((overview.globalBadges?.eco || 0) / overview.totalRegistrations) * 100).toFixed(1)),
          bevCount: overview.globalFuels?.bev || 0,
          phevCount: overview.globalFuels?.phev || 0,
          hevCount: overview.globalFuels?.hev || 0,
          avgCo2: 122,
          co2ExemptPct: 42,
          avgKw: 98,
          avgCv: 133,
          avgTara: 1420,
          topBrand: { name: overview.topBrands[0]?.brand || 'TOYOTA', count: overview.topBrands[0]?.total || 0, pct: overview.topBrands[0]?.percentage || 0 },
          topModel: { name: overview.topModels[0]?.model || 'SANDERO', brand: overview.topModels[0]?.brand || 'DACIA', count: overview.topModels[0]?.total || 0, pct: overview.topModels[0]?.percentage || 0 },
          topProvince: { name: 'Madrid', count: 980000, pct: 18.1 },
          topEuroNorm: { norm: 'Euro 6d', pct: 65 }
        },
        timeline: overview.monthlyTimeline.map((m: any) => ({
          date: m.period,
          total: m.total,
          gasolina: m.gasolina,
          diesel: m.diesel,
          hev: m.hev,
          phev: m.phev,
          bev: m.bev,
          glpGnc: m.glpGnc,
          cero: m.cero,
          eco: m.eco,
          c: m.c,
          b: m.b,
          sinEtiqueta: m.sinEtiqueta,
          avgCo2: m.avgCo2
        })),
        brandStats: overview.topBrands.map((b: any) => ({
          brand: b.brand,
          total: b.total,
          percentage: b.percentage,
          eco0Percentage: b.eco0Percentage,
          avgKw: b.avgKw,
          avgCv: Math.round(b.avgKw * 1.35962),
          topModel: 'N/A'
        })),
        modelStats: overview.topModels.map((m: any) => ({
          model: m.model,
          brand: m.brand,
          fullName: m.fullName,
          total: m.total,
          percentage: m.percentage,
          category: m.category,
          primaryFuel: m.primaryFuel,
          primaryBadge: m.primaryBadge,
          avgKw: m.avgKw,
          avgCv: m.avgCv,
          avgCo2: m.avgCo2
        }))
      };
    } else {
      const periodData = getPeriodData(period);
      if (periodData) {
        data = {
          periodLabel: periodData.monthName ? `${periodData.monthName} ${periodData.year}` : `Año ${periodData.year}`,
          totalRegistrations: periodData.total,
          kpis: {
            totalRegistrations: periodData.total,
            nuevasCount: periodData.nuevas || periodData.total,
            transferenciasCount: periodData.transferencias || 0,
            ceroCount: periodData.badges?.cero || 0,
            ceroPct: parseFloat((((periodData.badges?.cero || 0) / periodData.total) * 100).toFixed(1)),
            ecoCount: periodData.badges?.eco || 0,
            ecoPct: parseFloat((((periodData.badges?.eco || 0) / periodData.total) * 100).toFixed(1)),
            bevCount: periodData.fuels?.bev || 0,
            phevCount: periodData.fuels?.phev || 0,
            hevCount: periodData.fuels?.hev || 0,
            avgCo2: periodData.avgCo2 || 120,
            avgKw: 98,
            avgCv: 133,
            avgTara: 1420,
            topBrand: { name: periodData.topBrand || 'TOYOTA', count: 0, pct: 0 },
            topModel: { name: periodData.topModel || 'SANDERO', brand: 'DACIA', count: 0, pct: 0 },
            topProvince: { name: 'Madrid', count: 0, pct: 0 },
            topEuroNorm: { norm: periodData.topEuroNorm || 'Euro 6d', pct: 0 }
          },
          timeline: periodData.months ? periodData.months.map((m: any) => ({
            date: m.period,
            total: m.total,
            topBrand: m.topBrand,
            topModel: m.topModel
          })) : [],
          brandStats: (periodData.brands || []).map((b: any) => ({
            brand: b.brand,
            total: b.total,
            percentage: b.percentage,
            eco0Percentage: b.eco0Percentage || 0,
            avgKw: b.avgKw || 100,
            avgCv: Math.round((b.avgKw || 100) * 1.35962),
            topModel: b.topModel || 'N/A'
          })),
          modelStats: (periodData.models || []).map((m: any) => ({
            model: m.model,
            brand: m.brand,
            fullName: m.fullName,
            total: m.total,
            percentage: m.percentage,
            category: m.category || 'Turismo',
            primaryFuel: m.primaryFuel || 'Gasolina',
            primaryBadge: m.primaryBadge || 'C',
            avgKw: m.avgKw || 100,
            avgCv: m.avgCv || 136,
            avgCo2: m.avgCo2 || 120
          }))
        };
      }
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: `No se encontraron datos para el periodo ${period}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error querying static data' },
      { status: 500 }
    );
  }
}
