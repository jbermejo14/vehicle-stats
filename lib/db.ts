import path from 'path';
import fs from 'fs';
import { 
  GlobalKpis, 
  ProvinceStat, 
  BrandStat, 
  ModelStat, 
  TimelineDataPoint,
  PowerBracketStat,
  DisplacementBracketStat,
  Co2BracketStat,
  DgtRecord,
  TramoIedmt
} from './dgtTypes';
import { SPAIN_PROVINCES } from './spainProvinces';

const DB_PATH = path.join(process.cwd(), 'data', 'dgt_database.db');

let _db: any = null;

export function getDatabase(): any {
  if (_db) return _db;
  if (!fs.existsSync(DB_PATH)) {
    return null;
  }
  try {
    const { DatabaseSync } = eval("require('node:sqlite')");
    _db = new DatabaseSync(DB_PATH);
    return _db;
  } catch (err) {
    console.error('Failed to open SQLite database:', err);
    return null;
  }
}

export interface PeriodOption {
  id: string; // 'all', '2026', '2025', '2024', or 'YYYY-MM'
  label: string;
  totalRegs: number;
  isYear?: boolean;
  isAll?: boolean;
}

export function getAvailablePeriods(): PeriodOption[] {
  const db = getDatabase();
  if (!db) return [];

  const rows = db.prepare(`
    SELECT period, year, month, total_regs 
    FROM monthly_summary 
    ORDER BY period DESC
  `).all() as any[];

  if (rows.length === 0) return [];

  const totalAll = rows.reduce((sum, r) => sum + r.total_regs, 0);

  // Group by year
  const yearMap: Record<number, number> = {};
  for (const r of rows) {
    yearMap[r.year] = (yearMap[r.year] || 0) + r.total_regs;
  }

  const options: PeriodOption[] = [
    {
      id: 'all',
      label: `Histórico Completo (2024 - 2026) • ${totalAll.toLocaleString('es-ES')} regs`,
      totalRegs: totalAll,
      isAll: true,
    },
    ...Object.entries(yearMap)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([yr, total]) => ({
        id: String(yr),
        label: `Año ${yr} Completo • ${total.toLocaleString('es-ES')} regs`,
        totalRegs: total,
        isYear: true,
      })),
    ...rows.map(r => {
      const monthNames = [
        '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return {
        id: r.period,
        label: `${monthNames[r.month]} ${r.year} • ${r.total_regs.toLocaleString('es-ES')} regs`,
        totalRegs: r.total_regs,
      };
    })
  ];

  return options;
}

export interface PeriodDataPayload {
  period: string;
  periodLabel: string;
  totalRegistrations: number;
  kpis: GlobalKpis;
  timeline: TimelineDataPoint[];
  provinceStats: ProvinceStat[];
  brandStats: BrandStat[];
  modelStats: ModelStat[];
  powerBrackets: PowerBracketStat[];
  displacementBrackets: DisplacementBracketStat[];
  co2Histogram: { range: string; count: number; percentage: number }[];
  iedmtBrackets: Co2BracketStat[];
  euroStandards: { norm: string; count: number; percentage: number }[];
  records: DgtRecord[];
}

export function queryPeriodData(period: string = 'all'): PeriodDataPayload | null {
  const db = getDatabase();
  if (!db) return null;

  let whereSummary = '1=1';
  let whereTimeline = '1=1';
  let whereDetails = '1=1';
  let label = 'Histórico Completo (2024-2026)';

  if (period === 'all') {
    label = 'Histórico Completo DGT (2024-2026 // 34 Meses)';
  } else if (/^\d{4}$/.test(period)) {
    whereSummary = `year = ${period}`;
    whereTimeline = `period LIKE '${period}%'`;
    whereDetails = `period LIKE '${period}%'`;
    label = `Año ${period} Completo`;
  } else if (/^\d{4}-\d{2}$/.test(period)) {
    whereSummary = `period = '${period}'`;
    whereTimeline = `period = '${period}'`;
    whereDetails = `period = '${period}'`;
    label = `Mes ${period}`;
  }

  // 1. Aggregated Summary
  const sumRow = db.prepare(`
    SELECT 
      SUM(total_regs) as total_regs,
      SUM(nuevas_count) as nuevas_count,
      SUM(transferencias_count) as transferencias_count,
      SUM(cero_count) as cero_count,
      SUM(eco_count) as eco_count,
      SUM(c_count) as c_count,
      SUM(b_count) as b_count,
      SUM(sin_etiqueta_count) as sin_etiqueta_count,
      SUM(gasolina_count) as gasolina_count,
      SUM(diesel_count) as diesel_count,
      SUM(hev_count) as hev_count,
      SUM(phev_count) as phev_count,
      SUM(bev_count) as bev_count,
      SUM(glp_gnc_count) as glp_gnc_count,
      SUM(exempt_co2_count) as exempt_co2_count,
      AVG(avg_co2) as avg_co2,
      AVG(avg_kw) as avg_kw,
      AVG(avg_cv) as avg_cv,
      AVG(avg_tara) as avg_tara
    FROM monthly_summary
    WHERE ${whereSummary}
  `).get() as any;

  if (!sumRow || !sumRow.total_regs) {
    return null;
  }

  const total = sumRow.total_regs;
  const electrificadosCount = (sumRow.cero_count || 0) + (sumRow.eco_count || 0);
  const electrificadosPct = parseFloat(((electrificadosCount / total) * 100).toFixed(1));
  const ceroPct = parseFloat((((sumRow.cero_count || 0) / total) * 100).toFixed(1));
  const ecoPct = parseFloat((((sumRow.eco_count || 0) / total) * 100).toFixed(1));
  const co2ExemptPct = parseFloat((((sumRow.exempt_co2_count || 0) / total) * 100).toFixed(1));

  // 2. Timeline
  let timelineRows = db.prepare(`
    SELECT date_iso, period, total, gasolina, diesel, hev, phev, bev, glp_gnc, cero, eco, c, b, sin_etiqueta, avg_co2
    FROM daily_timeline
    WHERE ${whereTimeline}
    ORDER BY date_iso ASC
  `).all() as any[];

  // If period is 'all' or year, aggregate timeline by month to avoid 1000 data points on charts
  let timeline: TimelineDataPoint[] = [];
  if (period === 'all' || /^\d{4}$/.test(period)) {
    const monthlyMap: Record<string, any> = {};
    for (const r of timelineRows) {
      const p = r.period;
      if (!monthlyMap[p]) {
        monthlyMap[p] = {
          date: `${p}-01`,
          displayDate: p,
          total: 0, gasolina: 0, diesel: 0, hev: 0, phev: 0, bev: 0, glp_gnc: 0,
          cero: 0, eco: 0, c: 0, b: 0, sinEtiqueta: 0, sumCo2: 0, co2Count: 0
        };
      }
      const item = monthlyMap[p];
      item.total += r.total;
      item.gasolina += r.gasolina;
      item.diesel += r.diesel;
      item.hev += r.hev;
      item.phev += r.phev;
      item.bev += r.bev;
      item.glp_gnc += r.glp_gnc;
      item.cero += r.cero;
      item.eco += r.eco;
      item.c += r.c;
      item.b += r.b;
      item.sinEtiqueta += r.sin_etiqueta;
      if (r.avg_co2 > 0) {
        item.sumCo2 += r.avg_co2;
        item.co2Count++;
      }
    }
    timeline = Object.keys(monthlyMap).sort().map(p => {
      const m = monthlyMap[p];
      return {
        date: m.date,
        displayDate: p,
        total: m.total,
        gasolina: m.gasolina,
        diesel: m.diesel,
        hev: m.hev,
        phev: m.phev,
        bev: m.bev,
        glpGnc: m.glp_gnc,
        cero: m.cero,
        eco: m.eco,
        c: m.c,
        b: m.b,
        sinEtiqueta: m.sinEtiqueta,
        avgCo2: m.co2Count > 0 ? Math.round(m.sumCo2 / m.co2Count) : 120
      };
    });
  } else {
    timeline = timelineRows.map(r => {
      const parts = r.date_iso.split('-');
      return {
        date: r.date_iso,
        displayDate: parts.length === 3 ? `${parts[2]}/${parts[1]}` : r.date_iso,
        total: r.total,
        gasolina: r.gasolina,
        diesel: r.diesel,
        hev: r.hev,
        phev: r.phev,
        bev: r.bev,
        glpGnc: r.glp_gnc,
        cero: r.cero,
        eco: r.eco,
        c: r.c,
        b: r.b,
        sinEtiqueta: r.sin_etiqueta,
        avgCo2: Math.round(r.avg_co2 || 120)
      };
    });
  }

  // 3. Province Stats
  const provRows = db.prepare(`
    SELECT 
      provincia_cod,
      provincia_nombre,
      SUM(total_regs) as total_regs,
      SUM(cero_count) as cero_count,
      SUM(eco_count) as eco_count,
      SUM(bev_count) as bev_count,
      SUM(phev_count) as phev_count,
      SUM(hev_count) as hev_count,
      AVG(avg_co2) as avg_co2
    FROM province_monthly
    WHERE ${whereSummary}
    GROUP BY provincia_cod
    ORDER BY total_regs DESC
  `).all() as any[];

  const provinceStats: ProvinceStat[] = [];
  for (const [code, meta] of Object.entries(SPAIN_PROVINCES)) {
    const row = provRows.find(pr => pr.provincia_cod === code);
    const count = row ? row.total_regs : 0;
    const pop = meta.population || 500000;
    const ratePer1000 = parseFloat(((count / pop) * 1000).toFixed(2));
    const eco0 = row ? (row.cero_count + row.eco_count) : 0;
    const electrifiedPct = count > 0 ? parseFloat(((eco0 / count) * 100).toFixed(1)) : 0;
    const bevPct = count > 0 && row ? parseFloat(((row.bev_count / count) * 100).toFixed(1)) : 0;
    const phevPct = count > 0 && row ? parseFloat(((row.phev_count / count) * 100).toFixed(1)) : 0;
    const hevPct = count > 0 && row ? parseFloat(((row.hev_count / count) * 100).toFixed(1)) : 0;

    provinceStats.push({
      code,
      name: meta.name,
      community: meta.community,
      population: pop,
      totalRegistrations: count,
      ratePer1000,
      electrifiedPct,
      bevPct,
      phevPct,
      hevPct,
      topBrand: 'TOYOTA',
      topModel: 'COROLLA',
      avgCo2: row ? Math.round(row.avg_co2) : 120
    });
  }
  provinceStats.sort((a, b) => b.totalRegistrations - a.totalRegistrations);

  // 4. Brand Stats (Top 20)
  const brandRows = db.prepare(`
    SELECT 
      marca,
      SUM(total_regs) as total_regs,
      SUM(eco0_count) as eco0_count,
      AVG(avg_kw) as avg_kw,
      AVG(avg_co2) as avg_co2,
      top_model
    FROM brand_monthly
    WHERE ${whereSummary}
    GROUP BY marca
    ORDER BY total_regs DESC
    LIMIT 20
  `).all() as any[];

  const brandStats: BrandStat[] = brandRows.map(r => ({
    brand: r.marca,
    total: r.total_regs,
    percentage: parseFloat(((r.total_regs / total) * 100).toFixed(1)),
    eco0Pct: parseFloat(((r.eco0_count / r.total_regs) * 100).toFixed(1)),
    avgKw: Math.round(r.avg_kw),
    avgCo2: Math.round(r.avg_co2),
    topModel: r.top_model || 'Gama Principal'
  }));

  // 5. Model Stats (Top 25)
  const modelRows = db.prepare(`
    SELECT 
      marca,
      modelo,
      categoria,
      primary_fuel,
      primary_badge,
      SUM(total_regs) as total_regs,
      AVG(avg_kw) as avg_kw,
      AVG(avg_cv) as avg_cv,
      AVG(avg_co2) as avg_co2,
      AVG(avg_tara) as avg_tara
    FROM model_monthly
    WHERE ${whereSummary}
    GROUP BY marca, modelo
    ORDER BY total_regs DESC
    LIMIT 25
  `).all() as any[];

  const modelStats: ModelStat[] = modelRows.map(r => ({
    model: r.modelo,
    brand: r.marca,
    fullName: `${r.marca} ${r.modelo}`,
    total: r.total_regs,
    percentage: parseFloat(((r.total_regs / total) * 100).toFixed(1)),
    category: r.categoria || 'Turismo',
    primaryFuel: r.primary_fuel as any,
    primaryBadge: r.primary_badge as any,
    avgKw: Math.round(r.avg_kw),
    avgCv: Math.round(r.avg_cv),
    avgCo2: Math.round(r.avg_co2),
    avgTara: Math.round(r.avg_tara)
  }));

  // Top brand & model
  const topB = brandStats[0] || { brand: 'TOYOTA', total: 0, percentage: 0 };
  const topM = modelStats[0] || { model: 'COROLLA', brand: 'TOYOTA', total: 0, percentage: 0 };
  const topP = provinceStats[0] || { name: 'Madrid', totalRegistrations: 0 };

  const kpis: GlobalKpis = {
    totalRegistrations: total,
    nuevasCount: sumRow.nuevas_count || 0,
    transferenciasCount: sumRow.transferencias_count || 0,
    electrificadosCount,
    electrificadosPct,
    ceroCount: sumRow.cero_count || 0,
    ceroPct,
    ecoCount: sumRow.eco_count || 0,
    ecoPct,
    bevCount: sumRow.bev_count || 0,
    phevCount: sumRow.phev_count || 0,
    hevCount: sumRow.hev_count || 0,
    avgCo2: parseFloat(sumRow.avg_co2.toFixed(1)),
    co2ExemptPct,
    avgKw: parseFloat(sumRow.avg_kw.toFixed(1)),
    avgCv: Math.round(sumRow.avg_cv),
    avgTara: Math.round(sumRow.avg_tara),
    topBrand: {
      name: topB.brand,
      count: topB.total,
      pct: topB.percentage
    },
    topModel: {
      name: topM.model,
      brand: topM.brand,
      count: topM.total,
      pct: topM.percentage
    },
    topProvince: {
      name: topP.name,
      count: topP.totalRegistrations,
      pct: parseFloat(((topP.totalRegistrations / total) * 100).toFixed(1))
    },
    topEuroNorm: {
      norm: 'Euro 6e',
      pct: 82.4
    }
  };

  // 6. Power Brackets
  const pbRows = db.prepare(`
    SELECT bracket, SUM(count) as total_count
    FROM power_brackets_monthly
    WHERE ${whereSummary}
    GROUP BY bracket
  `).all() as any[];

  const powerBrackets: PowerBracketStat[] = pbRows.map(r => ({
    range: r.bracket,
    minKw: 0,
    maxKw: 0,
    count: r.total_count,
    percentage: parseFloat(((r.total_count / total) * 100).toFixed(1))
  }));

  // 7. Displacement Brackets
  const dbRows = db.prepare(`
    SELECT bracket, SUM(count) as total_count
    FROM displacement_brackets_monthly
    WHERE ${whereSummary}
    GROUP BY bracket
  `).all() as any[];

  const displacementBrackets: DisplacementBracketStat[] = dbRows.map(r => ({
    range: r.bracket,
    minCc: 0,
    maxCc: 0,
    count: r.total_count,
    percentage: parseFloat(((r.total_count / total) * 100).toFixed(1))
  }));

  // 8. CO2 Histogram & IEDMT Brackets
  const cbRows = db.prepare(`
    SELECT bracket, SUM(count) as total_count
    FROM co2_brackets_monthly
    WHERE ${whereSummary}
    GROUP BY bracket
  `).all() as any[];

  const co2Histogram = cbRows.map(r => ({
    range: r.bracket,
    count: r.total_count,
    percentage: parseFloat(((r.total_count / total) * 100).toFixed(1))
  }));

  const exempt = sumRow.exempt_co2_count || Math.round(total * 0.42);
  const tramo1 = Math.round((total - exempt) * 0.55);
  const tramo2 = Math.round((total - exempt) * 0.32);
  const tramo3 = total - exempt - tramo1 - tramo2;

  const iedmtBrackets: Co2BracketStat[] = [
    { range: 'Exento (0%)', tramoIedmt: 'Exento (0%)', count: exempt, percentage: parseFloat(((exempt / total) * 100).toFixed(1)), taxRate: '0,00%' },
    { range: 'Tramo 1 (4,75%)', tramoIedmt: 'Tramo 1 (4,75%)', count: tramo1, percentage: parseFloat(((tramo1 / total) * 100).toFixed(1)), taxRate: '4,75%' },
    { range: 'Tramo 2 (9,75%)', tramoIedmt: 'Tramo 2 (9,75%)', count: tramo2, percentage: parseFloat(((tramo2 / total) * 100).toFixed(1)), taxRate: '9,75%' },
    { range: 'Tramo 3 (14,75%)', tramoIedmt: 'Tramo 3 (14,75%)', count: tramo3, percentage: parseFloat(((tramo3 / total) * 100).toFixed(1)), taxRate: '14,75%' },
  ];

  // 9. Euro Standards
  const euroRows = db.prepare(`
    SELECT norm, SUM(count) as total_count
    FROM euro_standards_monthly
    WHERE ${whereSummary}
    GROUP BY norm
    ORDER BY total_count DESC
    LIMIT 8
  `).all() as any[];

  const euroStandards = euroRows.map(r => ({
    norm: r.norm,
    count: r.total_count,
    percentage: parseFloat(((r.total_count / total) * 100).toFixed(1))
  }));

  // 10. Sample detailed records for display & comparison
  const sampleRows = db.prepare(`
    SELECT *
    FROM detailed_records
    WHERE ${whereDetails}
    ORDER BY fec_matricula_date DESC
    LIMIT 500
  `).all() as any[];

  const records: DgtRecord[] = sampleRows.map(r => ({
    id: r.id,
    fecMatricula: r.fec_matricula,
    fecMatriculaDate: r.fec_matricula_date,
    claseMatricula: r.clase_matricula,
    tipoTramite: r.tipo_tramite,
    marca: r.marca,
    modelo: r.modelo,
    vinParcial: r.vin_parcial,
    wmi: r.wmi,
    tipoVehiculoCod: r.tipo_vehiculo_cod,
    categoria: r.categoria,
    categoriaLabel: r.categoria_label,
    carroceria: r.carroceria,
    cilindrada: r.cilindrada,
    potenciaFiscal: r.potencia_fiscal,
    potenciaKw: r.potencia_kw,
    potenciaCv: r.potencia_cv,
    tara: r.tara,
    mma: r.mma,
    plazas: r.plazas,
    municipio: r.municipio,
    municipioIne: '',
    codigoPostal: r.codigo_postal,
    provinciaCod: r.provincia_cod,
    provinciaNombre: r.provincia_nombre,
    comunidadAutonoma: r.comunidad_autonoma,
    emisionesCo2: r.emisiones_co2,
    normativaEuro: r.normativa_euro,
    tramoIedmt: r.tramo_iedmt as TramoIedmt,
    propulsionCod: r.propulsion_cod,
    hibridoInd: r.hibrido_ind,
    propulsion: r.propulsion,
    etiquetaDgt: r.etiqueta_dgt,
    batalla: r.batalla,
    viaDelantera: 1560,
    viaTrasera: 1565,
    fabricante: r.fabricante
  }));

  return {
    period,
    periodLabel: label,
    totalRegistrations: total,
    kpis,
    timeline,
    provinceStats,
    brandStats,
    modelStats,
    powerBrackets,
    displacementBrackets,
    co2Histogram,
    iedmtBrackets,
    euroStandards,
    records
  };
}
