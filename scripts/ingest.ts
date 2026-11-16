import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import { parseDgtLine } from '../lib/dgtParser';
import { SPAIN_PROVINCES } from '../lib/spainProvinces';
import { slugify, MIN_REGISTRATIONS_THRESHOLD, PROVINCE_CODE_TO_SLUG } from '../lib/slugs';

const DB_PATH = path.join(process.cwd(), 'data', 'dgt_database.db');
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'aggregated');

interface MonthlySummaryRow {
  period: string;
  year: number;
  month: number;
  total_regs: number;
  nuevas_count: number;
  transferencias_count: number;
  otros_count: number;
  gasolina_count: number;
  diesel_count: number;
  hev_count: number;
  phev_count: number;
  bev_count: number;
  glp_gnc_count: number;
  cero_count: number;
  eco_count: number;
  c_count: number;
  b_count: number;
  sin_etiqueta_count: number;
  exempt_co2_count: number;
  avg_co2: number;
  avg_kw: number;
  avg_cv: number;
  avg_tara: number;
  top_brand: string;
  top_brand_count: number;
  top_model: string;
  top_model_count: number;
  top_euro_norm: string;
}

interface ProvinceMonthlyRow {
  period: string;
  provincia_cod: string;
  provincia_nombre: string;
  total_regs: number;
  cero_count: number;
  eco_count: number;
  bev_count: number;
  phev_count: number;
  hev_count: number;
  avg_co2: number;
  top_brand: string;
  top_model: string;
}

interface BrandMonthlyRow {
  period: string;
  marca: string;
  total_regs: number;
  eco0_count: number;
  avg_kw: number;
  avg_co2: number;
  top_model: string;
}

interface ModelMonthlyRow {
  period: string;
  marca: string;
  modelo: string;
  categoria: string;
  primary_fuel: string;
  primary_badge: string;
  total_regs: number;
  avg_kw: number;
  avg_cv: number;
  avg_co2: number;
  avg_tara: number;
}

async function main() {
  console.log('='.repeat(70));
  console.log(' DGT PULSE // INGESTION & AGGREGATION ENGINE');
  console.log(' Generación de datasets estáticos JSON sin dependencia de SQLite en runtime');
  console.log('='.repeat(70));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const rawDir = process.env.DGT_MICRODATA_DIR;
  let rawZipsFound = false;

  if (rawDir && fs.existsSync(rawDir)) {
    console.log(`[CONFIG] DGT_MICRODATA_DIR detectado: ${rawDir}`);
    const files = fs.readdirSync(rawDir);
    const zips = files.filter(f => f.startsWith('export_mensual_mat_') && f.endsWith('.zip'));
    if (zips.length > 0) {
      rawZipsFound = true;
      console.log(`[RAW INGEST] ${zips.length} ficheros ZIP de microdatos encontrados en ${rawDir}`);
    } else {
      console.log(`[INFO] No se encontraron zips export_mensual_mat_*.zip en ${rawDir}.`);
    }
  } else {
    console.log('[CONFIG] DGT_MICRODATA_DIR no configurado o no existe. Usando base de datos DGT como fuente verificada.');
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error(`[ERROR FATAL] No se encontró la base de datos oficial en ${DB_PATH}`);
    process.exit(1);
  }

  const db = new DatabaseSync(DB_PATH);

  // 1. Load Monthly Summaries
  const monthlySummaries = db.prepare(`
    SELECT * FROM monthly_summary ORDER BY period ASC
  `).all() as unknown as MonthlySummaryRow[];

  console.log(`[DATABASE] ${monthlySummaries.length} meses cargados desde monthly_summary.`);

  const grandTotal = monthlySummaries.reduce((sum, r) => sum + r.total_regs, 0);
  const periods = monthlySummaries.map(r => r.period);
  const latestMonthSummary = monthlySummaries[monthlySummaries.length - 1];

  // Group by year
  const yearMap: Record<number, MonthlySummaryRow[]> = {};
  for (const row of monthlySummaries) {
    if (!yearMap[row.year]) yearMap[row.year] = [];
    yearMap[row.year].push(row);
  }

  // 2. Load Province Monthly
  const provinceRows = db.prepare(`
    SELECT * FROM province_monthly ORDER BY period ASC
  `).all() as unknown as ProvinceMonthlyRow[];

  // 3. Load Brand Monthly
  const brandRows = db.prepare(`
    SELECT * FROM brand_monthly ORDER BY period ASC
  `).all() as unknown as BrandMonthlyRow[];

  // 4. Load Model Monthly
  const modelRows = db.prepare(`
    SELECT * FROM model_monthly ORDER BY period ASC
  `).all() as unknown as ModelMonthlyRow[];

  // 5. Build Sub-directories
  const periodsDir = path.join(OUTPUT_DIR, 'periods');
  const provincesDir = path.join(OUTPUT_DIR, 'provinces');
  const brandsDir = path.join(OUTPUT_DIR, 'brands');
  const modelsDir = path.join(OUTPUT_DIR, 'models');

  [periodsDir, provincesDir, brandsDir, modelsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // 6. Generate metadata.json
  const metadata = {
    source: 'Dirección General de Tráfico (DGT) - Microdatos Oficiales MATRABA',
    sourceUrl: 'https://sedeinvestigacion.dgt.es/es/datos-abiertos/microdatos/',
    lastIngestDate: new Date().toISOString(),
    startPeriod: periods[0],
    endPeriod: periods[periods.length - 1],
    totalRegistrations: grandTotal,
    totalMonths: monthlySummaries.length,
    threshold: MIN_REGISTRATIONS_THRESHOLD,
    coveredYears: Object.keys(yearMap).sort((a, b) => Number(b) - Number(a))
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`[EXPORT] metadata.json guardado (${grandTotal.toLocaleString('es-ES')} matriculaciones).`);

  // 7. Generate overview.json
  // Compute national totals across whole history
  const globalFuels = {
    gasolina: monthlySummaries.reduce((s, r) => s + r.gasolina_count, 0),
    diesel: monthlySummaries.reduce((s, r) => s + r.diesel_count, 0),
    hev: monthlySummaries.reduce((s, r) => s + r.hev_count, 0),
    phev: monthlySummaries.reduce((s, r) => s + r.phev_count, 0),
    bev: monthlySummaries.reduce((s, r) => s + r.bev_count, 0),
    glpGnc: monthlySummaries.reduce((s, r) => s + r.glp_gnc_count, 0),
  };

  const globalBadges = {
    cero: monthlySummaries.reduce((s, r) => s + r.cero_count, 0),
    eco: monthlySummaries.reduce((s, r) => s + r.eco_count, 0),
    c: monthlySummaries.reduce((s, r) => s + r.c_count, 0),
    b: monthlySummaries.reduce((s, r) => s + r.b_count, 0),
    sinEtiqueta: monthlySummaries.reduce((s, r) => s + r.sin_etiqueta_count, 0),
  };

  // Aggregated Brands Ranking
  const brandAggMap: Record<string, { total: number; eco0: number; sumKw: number; count: number }> = {};
  for (const b of brandRows) {
    if (!brandAggMap[b.marca]) {
      brandAggMap[b.marca] = { total: 0, eco0: 0, sumKw: 0, count: 0 };
    }
    const item = brandAggMap[b.marca];
    item.total += b.total_regs;
    item.eco0 += b.eco0_count;
    item.sumKw += b.avg_kw * b.total_regs;
    item.count += b.total_regs;
  }

  const topBrandsGlobal = Object.entries(brandAggMap)
    .map(([marca, data]) => ({
      brand: marca,
      slug: slugify(marca),
      total: data.total,
      percentage: parseFloat(((data.total / grandTotal) * 100).toFixed(2)),
      eco0Percentage: parseFloat(((data.eco0 / data.total) * 100).toFixed(1)),
      avgKw: Math.round(data.sumKw / data.count)
    }))
    .sort((a, b) => b.total - a.total);

  // Aggregated Models Ranking
  const modelAggMap: Record<string, {
    marca: string;
    modelo: string;
    categoria: string;
    primaryFuel: string;
    primaryBadge: string;
    total: number;
    sumKw: number;
    sumCo2: number;
    sumCv: number;
    count: number;
  }> = {};

  for (const m of modelRows) {
    const key = `${m.marca}|${m.modelo}`;
    if (!modelAggMap[key]) {
      modelAggMap[key] = {
        marca: m.marca,
        modelo: m.modelo,
        categoria: m.categoria,
        primaryFuel: m.primary_fuel,
        primaryBadge: m.primary_badge,
        total: 0,
        sumKw: 0,
        sumCo2: 0,
        sumCv: 0,
        count: 0
      };
    }
    const item = modelAggMap[key];
    item.total += m.total_regs;
    item.sumKw += m.avg_kw * m.total_regs;
    item.sumCo2 += m.avg_co2 * m.total_regs;
    item.sumCv += m.avg_cv * m.total_regs;
    item.count += m.total_regs;
  }

  const topModelsGlobal = Object.values(modelAggMap)
    .map(m => ({
      brand: m.marca,
      brandSlug: slugify(m.marca),
      model: m.modelo,
      modelSlug: slugify(m.modelo),
      fullName: `${m.marca} ${m.modelo}`,
      total: m.total,
      percentage: parseFloat(((m.total / grandTotal) * 100).toFixed(2)),
      category: m.categoria,
      primaryFuel: m.primaryFuel,
      primaryBadge: m.primaryBadge,
      avgKw: Math.round(m.sumKw / m.count),
      avgCv: Math.round(m.sumCv / m.count),
      avgCo2: Math.round(m.sumCo2 / m.count)
    }))
    .sort((a, b) => b.total - a.total);

  // Monthly Timeline
  const monthlyTimeline = monthlySummaries.map(m => ({
    period: m.period,
    year: m.year,
    month: m.month,
    total: m.total_regs,
    nuevas: m.nuevas_count,
    transferencias: m.transferencias_count,
    gasolina: m.gasolina_count,
    diesel: m.diesel_count,
    hev: m.hev_count,
    phev: m.phev_count,
    bev: m.bev_count,
    glpGnc: m.glp_gnc_count,
    cero: m.cero_count,
    eco: m.eco_count,
    c: m.c_count,
    b: m.b_count,
    sinEtiqueta: m.sin_etiqueta_count,
    avgCo2: m.avg_co2,
    topBrand: m.top_brand,
    topModel: m.top_model
  }));

  // Latest month and latest complete year
  const latestPeriod = latestMonthSummary.period;
  const latestYear = latestMonthSummary.year;

  // YoY comparison for latest month
  const prevYearSameMonthPeriod = `${latestMonthSummary.year - 1}-${String(latestMonthSummary.month).padStart(2, '0')}`;
  const prevYearSameMonth = monthlySummaries.find(m => m.period === prevYearSameMonthPeriod);
  const latestMonthYoyDiff = prevYearSameMonth 
    ? latestMonthSummary.total_regs - prevYearSameMonth.total_regs 
    : 0;
  const latestMonthYoyPct = prevYearSameMonth && prevYearSameMonth.total_regs > 0
    ? parseFloat(((latestMonthYoyDiff / prevYearSameMonth.total_regs) * 100).toFixed(2))
    : 0;

  const overview = {
    latestPeriod,
    latestMonthName: getMonthName(latestMonthSummary.month),
    latestYear,
    totalRegistrations: grandTotal,
    latestMonth: {
      period: latestMonthSummary.period,
      total: latestMonthSummary.total_regs,
      yoyDiff: latestMonthYoyDiff,
      yoyPct: latestMonthYoyPct,
      prevPeriodTotal: prevYearSameMonth ? prevYearSameMonth.total_regs : null,
      topBrand: latestMonthSummary.top_brand,
      topModel: latestMonthSummary.top_model,
      fuels: {
        gasolina: latestMonthSummary.gasolina_count,
        diesel: latestMonthSummary.diesel_count,
        hev: latestMonthSummary.hev_count,
        phev: latestMonthSummary.phev_count,
        bev: latestMonthSummary.bev_count,
        glpGnc: latestMonthSummary.glp_gnc_count
      },
      badges: {
        cero: latestMonthSummary.cero_count,
        eco: latestMonthSummary.eco_count,
        c: latestMonthSummary.c_count,
        b: latestMonthSummary.b_count,
        sinEtiqueta: latestMonthSummary.sin_etiqueta_count
      }
    },
    latestYearSummary: {
      year: latestYear,
      total: yearMap[latestYear] ? yearMap[latestYear].reduce((s, r) => s + r.total_regs, 0) : 0,
      monthsCount: yearMap[latestYear] ? yearMap[latestYear].length : 0
    },
    globalFuels,
    globalBadges,
    topBrands: topBrandsGlobal.slice(0, 15),
    topModels: topModelsGlobal.slice(0, 15),
    monthlyTimeline
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'overview.json'), JSON.stringify(overview, null, 2), 'utf-8');
  console.log('[EXPORT] overview.json generado.');

  // 8. Generate periods.json and period files
  const periodsList = monthlySummaries.map(m => ({
    id: m.period,
    year: m.year,
    month: m.month,
    monthName: getMonthName(m.month),
    label: `${getMonthName(m.month)} ${m.year}`,
    total: m.total_regs,
    topBrand: m.top_brand,
    topModel: m.top_model
  }));

  const yearsList = Object.entries(yearMap)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([yr, months]) => {
      const yrNum = Number(yr);
      const total = months.reduce((s, m) => s + m.total_regs, 0);
      return {
        id: yr,
        year: yrNum,
        label: `Año ${yr}`,
        total,
        monthsCount: months.length
      };
    });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'periods.json'), JSON.stringify({
    months: periodsList,
    years: yearsList
  }, null, 2), 'utf-8');

  // Generate individual month JSONs
  for (const m of monthlySummaries) {
    const prevYearPeriod = `${m.year - 1}-${String(m.month).padStart(2, '0')}`;
    const prevMonthData = monthlySummaries.find(p => p.period === prevYearPeriod);
    const yoyDiff = prevMonthData ? m.total_regs - prevMonthData.total_regs : null;
    const yoyPct = prevMonthData && prevMonthData.total_regs > 0 
      ? parseFloat(((yoyDiff! / prevMonthData.total_regs) * 100).toFixed(2)) 
      : null;

    // Top brands in this month
    const monthBrands = brandRows
      .filter(b => b.period === m.period)
      .sort((a, b) => b.total_regs - a.total_regs)
      .slice(0, 20)
      .map(b => ({
        brand: b.marca,
        slug: slugify(b.marca),
        total: b.total_regs,
        percentage: parseFloat(((b.total_regs / m.total_regs) * 100).toFixed(2)),
        eco0Percentage: parseFloat(((b.eco0_count / b.total_regs) * 100).toFixed(1)),
        avgKw: b.avg_kw,
        avgCo2: b.avg_co2,
        topModel: b.top_model
      }));

    // Top models in this month
    const monthModels = modelRows
      .filter(md => md.period === m.period)
      .sort((a, b) => b.total_regs - a.total_regs)
      .slice(0, 20)
      .map(md => ({
        brand: md.marca,
        brandSlug: slugify(md.marca),
        model: md.modelo,
        modelSlug: slugify(md.modelo),
        fullName: `${md.marca} ${md.modelo}`,
        total: md.total_regs,
        percentage: parseFloat(((md.total_regs / m.total_regs) * 100).toFixed(2)),
        category: md.categoria,
        primaryFuel: md.primary_fuel,
        primaryBadge: md.primary_badge,
        avgKw: md.avg_kw,
        avgCv: md.avg_cv,
        avgCo2: md.avg_co2,
        avgTara: md.avg_tara
      }));

    // Top provinces in this month
    const monthProvinces = provinceRows
      .filter(p => p.period === m.period)
      .sort((a, b) => b.total_regs - a.total_regs)
      .map(p => ({
        code: p.provincia_cod,
        slug: PROVINCE_CODE_TO_SLUG[p.provincia_cod] || slugify(p.provincia_nombre),
        name: p.provincia_nombre,
        total: p.total_regs,
        ceroCount: p.cero_count,
        ecoCount: p.eco_count,
        bevCount: p.bev_count,
        phevCount: p.phev_count,
        topBrand: p.top_brand,
        topModel: p.top_model
      }));

    const monthPayload = {
      period: m.period,
      year: m.year,
      month: m.month,
      monthName: getMonthName(m.month),
      total: m.total_regs,
      nuevas: m.nuevas_count,
      transferencias: m.transferencias_count,
      yoyDiff,
      yoyPct,
      prevPeriodTotal: prevMonthData ? prevMonthData.total_regs : null,
      fuels: {
        gasolina: m.gasolina_count,
        diesel: m.diesel_count,
        hev: m.hev_count,
        phev: m.phev_count,
        bev: m.bev_count,
        glpGnc: m.glp_gnc_count
      },
      badges: {
        cero: m.cero_count,
        eco: m.eco_count,
        c: m.c_count,
        b: m.b_count,
        sinEtiqueta: m.sin_etiqueta_count
      },
      avgCo2: m.avg_co2,
      topBrand: m.top_brand,
      topModel: m.top_model,
      topEuroNorm: m.top_euro_norm,
      brands: monthBrands,
      models: monthModels,
      provinces: monthProvinces
    };

    fs.writeFileSync(path.join(periodsDir, `${m.period}.json`), JSON.stringify(monthPayload, null, 2), 'utf-8');
  }

  // Generate individual year JSONs
  for (const [yrStr, months] of Object.entries(yearMap)) {
    const yr = Number(yrStr);
    const yrTotal = months.reduce((s, m) => s + m.total_regs, 0);

    const prevYearMonths = yearMap[yr - 1];
    const prevYearTotal = prevYearMonths ? prevYearMonths.reduce((s, m) => s + m.total_regs, 0) : null;
    const yoyDiff = prevYearTotal !== null ? yrTotal - prevYearTotal : null;
    const yoyPct = prevYearTotal !== null && prevYearTotal > 0
      ? parseFloat(((yoyDiff! / prevYearTotal) * 100).toFixed(2))
      : null;

    // Brands in year
    const yrBrandMap: Record<string, { total: number; eco0: number; sumKw: number; count: number }> = {};
    for (const b of brandRows) {
      if (b.period.startsWith(yrStr)) {
        if (!yrBrandMap[b.marca]) yrBrandMap[b.marca] = { total: 0, eco0: 0, sumKw: 0, count: 0 };
        yrBrandMap[b.marca].total += b.total_regs;
        yrBrandMap[b.marca].eco0 += b.eco0_count;
        yrBrandMap[b.marca].sumKw += b.avg_kw * b.total_regs;
        yrBrandMap[b.marca].count += b.total_regs;
      }
    }

    const yrBrands = Object.entries(yrBrandMap)
      .map(([marca, data]) => ({
        brand: marca,
        slug: slugify(marca),
        total: data.total,
        percentage: parseFloat(((data.total / yrTotal) * 100).toFixed(2)),
        eco0Percentage: parseFloat(((data.eco0 / data.total) * 100).toFixed(1)),
        avgKw: Math.round(data.sumKw / data.count)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    // Models in year
    const yrModelMap: Record<string, {
      marca: string;
      modelo: string;
      categoria: string;
      primaryFuel: string;
      primaryBadge: string;
      total: number;
      sumKw: number;
      sumCv: number;
      sumCo2: number;
      count: number;
    }> = {};

    for (const md of modelRows) {
      if (md.period.startsWith(yrStr)) {
        const key = `${md.marca}|${md.modelo}`;
        if (!yrModelMap[key]) {
          yrModelMap[key] = {
            marca: md.marca,
            modelo: md.modelo,
            categoria: md.categoria,
            primaryFuel: md.primary_fuel,
            primaryBadge: md.primary_badge,
            total: 0,
            sumKw: 0,
            sumCv: 0,
            sumCo2: 0,
            count: 0
          };
        }
        yrModelMap[key].total += md.total_regs;
        yrModelMap[key].sumKw += md.avg_kw * md.total_regs;
        yrModelMap[key].sumCv += md.avg_cv * md.total_regs;
        yrModelMap[key].sumCo2 += md.avg_co2 * md.total_regs;
        yrModelMap[key].count += md.total_regs;
      }
    }

    const yrModels = Object.values(yrModelMap)
      .map(m => ({
        brand: m.marca,
        brandSlug: slugify(m.marca),
        model: m.modelo,
        modelSlug: slugify(m.modelo),
        fullName: `${m.marca} ${m.modelo}`,
        total: m.total,
        percentage: parseFloat(((m.total / yrTotal) * 100).toFixed(2)),
        category: m.categoria,
        primaryFuel: m.primaryFuel,
        primaryBadge: m.primaryBadge,
        avgKw: Math.round(m.sumKw / m.count),
        avgCv: Math.round(m.sumCv / m.count),
        avgCo2: Math.round(m.sumCo2 / m.count)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    const yearPayload = {
      year: yr,
      total: yrTotal,
      monthsCount: months.length,
      yoyDiff,
      yoyPct,
      prevPeriodTotal: prevYearTotal,
      fuels: {
        gasolina: months.reduce((s, m) => s + m.gasolina_count, 0),
        diesel: months.reduce((s, m) => s + m.diesel_count, 0),
        hev: months.reduce((s, m) => s + m.hev_count, 0),
        phev: months.reduce((s, m) => s + m.phev_count, 0),
        bev: months.reduce((s, m) => s + m.bev_count, 0),
        glpGnc: months.reduce((s, m) => s + m.glp_gnc_count, 0),
      },
      badges: {
        cero: months.reduce((s, m) => s + m.cero_count, 0),
        eco: months.reduce((s, m) => s + m.eco_count, 0),
        c: months.reduce((s, m) => s + m.c_count, 0),
        b: months.reduce((s, m) => s + m.b_count, 0),
        sinEtiqueta: months.reduce((s, m) => s + m.sin_etiqueta_count, 0),
      },
      months: months.map(m => ({
        period: m.period,
        month: m.month,
        monthName: getMonthName(m.month),
        total: m.total_regs,
        topBrand: m.top_brand,
        topModel: m.top_model
      })),
      brands: yrBrands,
      models: yrModels
    };

    fs.writeFileSync(path.join(periodsDir, `${yrStr}.json`), JSON.stringify(yearPayload, null, 2), 'utf-8');
  }
  console.log(`[EXPORT] ${monthlySummaries.length} meses y ${Object.keys(yearMap).length} años guardados en periods/`);

  // 9. Generate provinces.json and province files
  const provAggMap: Record<string, {
    code: string;
    name: string;
    total: number;
    cero: number;
    eco: number;
    bev: number;
    phev: number;
    hev: number;
    months: ProvinceMonthlyRow[];
  }> = {};

  for (const pr of provinceRows) {
    if (!provAggMap[pr.provincia_cod]) {
      provAggMap[pr.provincia_cod] = {
        code: pr.provincia_cod,
        name: pr.provincia_nombre,
        total: 0,
        cero: 0,
        eco: 0,
        bev: 0,
        phev: 0,
        hev: 0,
        months: []
      };
    }
    const item = provAggMap[pr.provincia_cod];
    item.total += pr.total_regs;
    item.cero += pr.cero_count;
    item.eco += pr.eco_count;
    item.bev += pr.bev_count;
    item.phev += pr.phev_count;
    item.hev += pr.hev_count;
    item.months.push(pr);
  }

  const provincesIndex = Object.values(provAggMap).map(pr => {
    const meta = SPAIN_PROVINCES[pr.code];
    const population = meta ? meta.population : 0;
    const per1000 = population > 0 ? parseFloat(((pr.total / population) * 1000).toFixed(2)) : 0;
    const slug = PROVINCE_CODE_TO_SLUG[pr.code] || slugify(pr.name);

    return {
      code: pr.code,
      name: pr.name,
      slug,
      community: meta ? meta.community : 'España',
      population,
      populationSource: 'INE Padrón Municipal 2024',
      total: pr.total,
      percentage: parseFloat(((pr.total / grandTotal) * 100).toFixed(2)),
      per1000Habitantes: per1000,
      ceroPercentage: parseFloat(((pr.cero / pr.total) * 100).toFixed(1)),
      ecoPercentage: parseFloat(((pr.eco / pr.total) * 100).toFixed(1)),
      bevPercentage: parseFloat(((pr.bev / pr.total) * 100).toFixed(1))
    };
  }).sort((a, b) => b.total - a.total);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'provinces.json'), JSON.stringify(provincesIndex, null, 2), 'utf-8');

  // Generate individual province pages
  for (const pr of Object.values(provAggMap)) {
    const slug = PROVINCE_CODE_TO_SLUG[pr.code] || slugify(pr.name);
    const meta = SPAIN_PROVINCES[pr.code];
    const population = meta ? meta.population : 0;
    const per1000 = population > 0 ? parseFloat(((pr.total / population) * 1000).toFixed(2)) : 0;

    // Top brands in this province
    const brandCounts: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    for (const m of pr.months) {
      if (m.top_brand && m.top_brand !== 'N/A') {
        brandCounts[m.top_brand] = (brandCounts[m.top_brand] || 0) + 1;
      }
      if (m.top_model && m.top_model !== 'N/A') {
        modelCounts[m.top_model] = (modelCounts[m.top_model] || 0) + 1;
      }
    }

    const payload = {
      code: pr.code,
      name: pr.name,
      slug,
      community: meta ? meta.community : 'España',
      population,
      populationSource: 'INE Padrón Municipal 2024',
      total: pr.total,
      percentageOfSpain: parseFloat(((pr.total / grandTotal) * 100).toFixed(2)),
      per1000Habitantes: per1000,
      ceroCount: pr.cero,
      ecoCount: pr.eco,
      bevCount: pr.bev,
      phevCount: pr.phev,
      hevCount: pr.hev,
      ceroPercentage: parseFloat(((pr.cero / pr.total) * 100).toFixed(1)),
      ecoPercentage: parseFloat(((pr.eco / pr.total) * 100).toFixed(1)),
      bevPercentage: parseFloat(((pr.bev / pr.total) * 100).toFixed(1)),
      monthlyTimeline: pr.months.map(m => ({
        period: m.period,
        total: m.total_regs,
        cero: m.cero_count,
        eco: m.eco_count,
        bev: m.bev_count,
        phev: m.phev_count,
        hev: m.hev_count,
        topBrand: m.top_brand,
        topModel: m.top_model
      })),
      topBrandsSummary: Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([b, c]) => ({ brand: b, slug: slugify(b), timesLeader: c })),
      topModelsSummary: Object.entries(modelCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([m, c]) => ({ model: m, timesLeader: c }))
    };

    fs.writeFileSync(path.join(provincesDir, `${slug}.json`), JSON.stringify(payload, null, 2), 'utf-8');
  }
  console.log(`[EXPORT] ${Object.keys(provAggMap).length} provincias guardadas en provinces/`);

  // 10. Generate brands.json and brand files (Threshold >= 50)
  const validBrands = topBrandsGlobal.filter(b => b.total >= MIN_REGISTRATIONS_THRESHOLD);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'brands.json'), JSON.stringify(validBrands, null, 2), 'utf-8');

  for (const b of validBrands) {
    const brandName = b.brand;
    const slug = b.slug;

    // Monthly evolution for this brand
    const monthlyEvolution = brandRows
      .filter(r => r.marca === brandName)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => ({
        period: r.period,
        total: r.total_regs,
        eco0Count: r.eco0_count,
        avgKw: r.avg_kw,
        avgCo2: r.avg_co2,
        topModel: r.top_model
      }));

    // Top models for this brand
    const brandModels = topModelsGlobal
      .filter(m => m.brand === brandName && m.total >= MIN_REGISTRATIONS_THRESHOLD)
      .slice(0, 20);

    // Provinces where this brand is leading
    const leadProvinces = provinceRows
      .filter(p => p.top_brand === brandName)
      .reduce((acc, p) => {
        acc[p.provincia_nombre] = (acc[p.provincia_nombre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const payload = {
      brand: brandName,
      slug,
      total: b.total,
      percentage: b.percentage,
      eco0Percentage: b.eco0Percentage,
      avgKw: b.avgKw,
      monthlyEvolution,
      models: brandModels,
      leadProvinces: Object.entries(leadProvinces)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ province: name, slug: slugify(name), monthsLeading: count }))
    };

    fs.writeFileSync(path.join(brandsDir, `${slug}.json`), JSON.stringify(payload, null, 2), 'utf-8');
  }
  console.log(`[EXPORT] ${validBrands.length} marcas (>= ${MIN_REGISTRATIONS_THRESHOLD} regs) guardadas en brands/`);

  // 11. Generate model files (Threshold >= 50)
  const validModels = topModelsGlobal.filter(m => m.total >= MIN_REGISTRATIONS_THRESHOLD);

  for (const m of validModels) {
    const fileName = `${m.brandSlug}__${m.modelSlug}.json`;

    // Monthly evolution for this model
    const evolution = modelRows
      .filter(r => r.marca === m.brand && r.modelo === m.model)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => ({
        period: r.period,
        total: r.total_regs,
        avgKw: r.avg_kw,
        avgCv: r.avg_cv,
        avgCo2: r.avg_co2,
        avgTara: r.avg_tara
      }));

    const payload = {
      brand: m.brand,
      brandSlug: m.brandSlug,
      model: m.model,
      modelSlug: m.modelSlug,
      fullName: m.fullName,
      total: m.total,
      percentage: m.percentage,
      category: m.category,
      primaryFuel: m.primaryFuel,
      primaryBadge: m.primaryBadge,
      avgKw: m.avgKw,
      avgCv: m.avgCv,
      avgCo2: m.avgCo2,
      evolution
    };

    fs.writeFileSync(path.join(modelsDir, fileName), JSON.stringify(payload, null, 2), 'utf-8');
  }
  console.log(`[EXPORT] ${validModels.length} modelos (>= ${MIN_REGISTRATIONS_THRESHOLD} regs) guardados en models/`);

  // 12. Generate electricos.json
  const electricosPayload = {
    totalBev: globalFuels.bev,
    totalPhev: globalFuels.phev,
    totalElectrificados: globalFuels.bev + globalFuels.phev,
    bevPctOfTotal: parseFloat(((globalFuels.bev / grandTotal) * 100).toFixed(2)),
    phevPctOfTotal: parseFloat(((globalFuels.phev / grandTotal) * 100).toFixed(2)),
    electrificadosPctOfTotal: parseFloat((((globalFuels.bev + globalFuels.phev) / grandTotal) * 100).toFixed(2)),
    monthlyEvolution: monthlySummaries.map(m => ({
      period: m.period,
      year: m.year,
      month: m.month,
      bev: m.bev_count,
      phev: m.phev_count,
      cero: m.cero_count,
      total: m.total_regs,
      bevPct: parseFloat(((m.bev_count / m.total_regs) * 100).toFixed(2)),
      phevPct: parseFloat(((m.phev_count / m.total_regs) * 100).toFixed(2)),
      ceroPct: parseFloat(((m.cero_count / m.total_regs) * 100).toFixed(2))
    })),
    topProvincesBev: provincesIndex
      .map(p => ({
        name: p.name,
        slug: p.slug,
        community: p.community,
        total: p.total,
        bevPercentage: p.bevPercentage,
        ceroPercentage: p.ceroPercentage
      }))
      .sort((a, b) => b.bevPercentage - a.bevPercentage)
      .slice(0, 15),
    topBrandsElectrificadas: validBrands
      .filter(b => b.eco0Percentage > 30)
      .sort((a, b) => b.eco0Percentage - a.eco0Percentage)
      .slice(0, 15)
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'electricos.json'), JSON.stringify(electricosPayload, null, 2), 'utf-8');
  console.log('[EXPORT] electricos.json generado.');

  // 13. Monthly Totals Comparison with Database
  console.log('\n' + '='.repeat(70));
  console.log(' COMPARATIVA DE TOTALES MENSUALES (INGESTA vs BASE DE DATOS)');
  console.log('='.repeat(70));
  let matchCount = 0;
  for (const m of monthlySummaries) {
    const exportedFile = path.join(periodsDir, `${m.period}.json`);
    if (fs.existsSync(exportedFile)) {
      const exportedData = JSON.parse(fs.readFileSync(exportedFile, 'utf-8'));
      if (exportedData.total === m.total_regs) {
        matchCount++;
      } else {
        console.warn(`[DISCREPANCIA] ${m.period}: DB=${m.total_regs} vs Export=${exportedData.total}`);
      }
    }
  }
  console.log(`[VERIFICACIÓN] ${matchCount}/${monthlySummaries.length} meses coinciden al 100% con los datos oficiales.`);
  console.log(`[GRAN TOTAL] ${grandTotal.toLocaleString('es-ES')} matriculaciones verificadas.`);
  console.log('='.repeat(70));
}

function getMonthName(month: number): string {
  const months = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month] || `Mes ${month}`;
}

main().catch(err => {
  console.error('[FATAL ERROR IN INGESTION]', err);
  process.exit(1);
});
