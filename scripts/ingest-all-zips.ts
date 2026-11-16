import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import { parseDgtLine } from '../lib/dgtParser';
import { SPAIN_PROVINCES } from '../lib/spainProvinces';
import { DgtRecord } from '../lib/dgtTypes';

const DOWNLOADS_DIR = 'C:/Users/jpber/Downloads';
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'dgt_database.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

console.log('='.repeat(70));
console.log(' DGT PULSE // BATCH INGESTOR: 2024-01 HASTA 2026-10 (34 MESES)');
console.log('='.repeat(70));
console.log(`[TARGET DATABASE] ${DB_PATH}`);

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);

// Create Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS monthly_summary (
    period TEXT PRIMARY KEY,
    year INTEGER,
    month INTEGER,
    total_regs INTEGER,
    nuevas_count INTEGER,
    transferencias_count INTEGER,
    otros_count INTEGER,
    gasolina_count INTEGER,
    diesel_count INTEGER,
    hev_count INTEGER,
    phev_count INTEGER,
    bev_count INTEGER,
    glp_gnc_count INTEGER,
    cero_count INTEGER,
    eco_count INTEGER,
    c_count INTEGER,
    b_count INTEGER,
    sin_etiqueta_count INTEGER,
    exempt_co2_count INTEGER,
    avg_co2 REAL,
    avg_kw REAL,
    avg_cv REAL,
    avg_tara REAL,
    top_brand TEXT,
    top_brand_count INTEGER,
    top_model TEXT,
    top_model_count INTEGER,
    top_euro_norm TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_timeline (
    date_iso TEXT PRIMARY KEY,
    period TEXT,
    total INTEGER,
    gasolina INTEGER,
    diesel INTEGER,
    hev INTEGER,
    phev INTEGER,
    bev INTEGER,
    glp_gnc INTEGER,
    cero INTEGER,
    eco INTEGER,
    c INTEGER,
    b INTEGER,
    sin_etiqueta INTEGER,
    avg_co2 REAL
  );

  CREATE TABLE IF NOT EXISTS province_monthly (
    period TEXT,
    provincia_cod TEXT,
    provincia_nombre TEXT,
    total_regs INTEGER,
    cero_count INTEGER,
    eco_count INTEGER,
    bev_count INTEGER,
    phev_count INTEGER,
    hev_count INTEGER,
    avg_co2 REAL,
    top_brand TEXT,
    top_model TEXT,
    PRIMARY KEY (period, provincia_cod)
  );

  CREATE TABLE IF NOT EXISTS brand_monthly (
    period TEXT,
    marca TEXT,
    total_regs INTEGER,
    eco0_count INTEGER,
    avg_kw REAL,
    avg_co2 REAL,
    top_model TEXT,
    PRIMARY KEY (period, marca)
  );

  CREATE TABLE IF NOT EXISTS model_monthly (
    period TEXT,
    marca TEXT,
    modelo TEXT,
    categoria TEXT,
    primary_fuel TEXT,
    primary_badge TEXT,
    total_regs INTEGER,
    avg_kw REAL,
    avg_cv REAL,
    avg_co2 REAL,
    avg_tara REAL,
    PRIMARY KEY (period, marca, modelo)
  );

  CREATE TABLE IF NOT EXISTS power_brackets_monthly (
    period TEXT,
    bracket TEXT,
    count INTEGER,
    percentage REAL,
    PRIMARY KEY (period, bracket)
  );

  CREATE TABLE IF NOT EXISTS displacement_brackets_monthly (
    period TEXT,
    bracket TEXT,
    count INTEGER,
    percentage REAL,
    PRIMARY KEY (period, bracket)
  );

  CREATE TABLE IF NOT EXISTS co2_brackets_monthly (
    period TEXT,
    bracket TEXT,
    count INTEGER,
    percentage REAL,
    PRIMARY KEY (period, bracket)
  );

  CREATE TABLE IF NOT EXISTS euro_standards_monthly (
    period TEXT,
    norm TEXT,
    count INTEGER,
    percentage REAL,
    PRIMARY KEY (period, norm)
  );

  CREATE TABLE IF NOT EXISTS detailed_records (
    id TEXT PRIMARY KEY,
    period TEXT,
    fec_matricula TEXT,
    fec_matricula_date TEXT,
    clase_matricula TEXT,
    tipo_tramite TEXT,
    marca TEXT,
    modelo TEXT,
    vin_parcial TEXT,
    wmi TEXT,
    tipo_vehiculo_cod TEXT,
    categoria TEXT,
    categoria_label TEXT,
    carroceria TEXT,
    cilindrada INTEGER,
    potencia_fiscal REAL,
    potencia_kw REAL,
    potencia_cv INTEGER,
    tara INTEGER,
    mma INTEGER,
    plazas INTEGER,
    municipio TEXT,
    codigo_postal TEXT,
    provincia_cod TEXT,
    provincia_nombre TEXT,
    comunidad_autonoma TEXT,
    emisiones_co2 INTEGER,
    normativa_euro TEXT,
    tramo_iedmt TEXT,
    propulsion_cod TEXT,
    hibrido_ind TEXT,
    propulsion TEXT,
    etiqueta_dgt TEXT,
    batalla INTEGER,
    fabricante TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_records_period ON detailed_records(period);
  CREATE INDEX IF NOT EXISTS idx_records_brand ON detailed_records(marca);
  CREATE INDEX IF NOT EXISTS idx_records_fuel ON detailed_records(propulsion);
  CREATE INDEX IF NOT EXISTS idx_records_badge ON detailed_records(etiqueta_dgt);
  CREATE INDEX IF NOT EXISTS idx_records_prov ON detailed_records(provincia_cod);
`);

// Prepared Statements for high speed insertion
const insertSummary = db.prepare(`
  INSERT OR REPLACE INTO monthly_summary VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const insertDaily = db.prepare(`
  INSERT OR REPLACE INTO daily_timeline VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const insertProvince = db.prepare(`
  INSERT OR REPLACE INTO province_monthly VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const insertBrand = db.prepare(`
  INSERT OR REPLACE INTO brand_monthly VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`);

const insertModel = db.prepare(`
  INSERT OR REPLACE INTO model_monthly VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const insertPowerBracket = db.prepare(`
  INSERT OR REPLACE INTO power_brackets_monthly VALUES (?, ?, ?, ?)
`);

const insertDisplacementBracket = db.prepare(`
  INSERT OR REPLACE INTO displacement_brackets_monthly VALUES (?, ?, ?, ?)
`);

const insertCo2Bracket = db.prepare(`
  INSERT OR REPLACE INTO co2_brackets_monthly VALUES (?, ?, ?, ?)
`);

const insertEuroNorm = db.prepare(`
  INSERT OR REPLACE INTO euro_standards_monthly VALUES (?, ?, ?, ?)
`);

const insertRecord = db.prepare(`
  INSERT OR REPLACE INTO detailed_records VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

// Find all monthly zip files in Downloads
const allFiles = fs.readdirSync(DOWNLOADS_DIR);
const zipFiles = allFiles
  .filter(f => f.startsWith('export_mensual_mat_') && f.endsWith('.zip') && !f.includes('(1)'))
  .sort();

console.log(`[DISCOVERY] ${zipFiles.length} ficheros mensuales DGT encontrados.`);

let grandTotalRegistrations = 0;
const overallStartTime = Date.now();

for (let fileIdx = 0; fileIdx < zipFiles.length; fileIdx++) {
  const fileName = zipFiles[fileIdx];
  const zipPath = path.join(DOWNLOADS_DIR, fileName);
  const match = fileName.match(/export_mensual_mat_(\d{4})(\d{2})\.zip/);
  if (!match) continue;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const period = `${year}-${String(month).padStart(2, '0')}`;

  const monthStartTime = Date.now();
  const zipStat = fs.statSync(zipPath);
  if (zipStat.size < 1000) continue; // Skip corrupted empty files

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  if (entries.length === 0) continue;

  const rawBuffer = entries[0].getData();
  const rawText = rawBuffer.toString('latin1');
  const lines = rawText.split(/\r?\n/);

  // Month Aggregators
  let totalRegs = 0;
  let nuevasCount = 0;
  let transferenciasCount = 0;
  let otrosCount = 0;

  let gasolinaCount = 0;
  let dieselCount = 0;
  let hevCount = 0;
  let phevCount = 0;
  let bevCount = 0;
  let glpGncCount = 0;

  let ceroCount = 0;
  let ecoCount = 0;
  let cCount = 0;
  let bCount = 0;
  let sinEtiquetaCount = 0;

  let exemptCo2Count = 0;
  let sumCo2 = 0;
  let co2Count = 0;
  let sumKw = 0;
  let sumCv = 0;
  let sumTara = 0;
  let taraCount = 0;

  const dailyMap: Record<string, {
    total: number;
    gasolina: number;
    diesel: number;
    hev: number;
    phev: number;
    bev: number;
    glpGnc: number;
    cero: number;
    eco: number;
    c: number;
    b: number;
    sinEtiqueta: number;
    sumCo2: number;
    co2Count: number;
  }> = {};

  const provMap: Record<string, {
    count: number;
    cero: number;
    eco: number;
    bev: number;
    phev: number;
    hev: number;
    sumCo2: number;
    co2Count: number;
    brands: Record<string, number>;
    models: Record<string, number>;
  }> = {};

  const brandMap: Record<string, {
    count: number;
    eco0: number;
    sumKw: number;
    sumCo2: number;
    co2Count: number;
    models: Record<string, number>;
  }> = {};

  const modelMap: Record<string, {
    brand: string;
    model: string;
    category: string;
    fuels: Record<string, number>;
    badges: Record<string, number>;
    count: number;
    sumKw: number;
    sumCv: number;
    sumCo2: number;
    co2Count: number;
    sumTara: number;
    taraCount: number;
  }> = {};

  const powerBrackets = [
    { range: '< 50 kW (< 68 CV)', min: 0, max: 50, count: 0 },
    { range: '50 - 75 kW (68-102 CV)', min: 50, max: 75, count: 0 },
    { range: '75 - 100 kW (102-136 CV)', min: 75, max: 100, count: 0 },
    { range: '100 - 150 kW (136-204 CV)', min: 100, max: 150, count: 0 },
    { range: '150 - 200 kW (204-272 CV)', min: 150, max: 200, count: 0 },
    { range: '> 200 kW (> 272 CV)', min: 200, max: 9999, count: 0 },
  ];

  const displacementBrackets = [
    { range: 'Eléctrico (0 cc)', min: 0, max: 1, count: 0 },
    { range: '< 1.000 cc (Urbano)', min: 1, max: 1000, count: 0 },
    { range: '1.000 - 1.499 cc (Compacto)', min: 1000, max: 1500, count: 0 },
    { range: '1.500 - 1.999 cc (Medio)', min: 1500, max: 2000, count: 0 },
    { range: '≥ 2.000 cc (Gran Cilindrada)', min: 2000, max: 99999, count: 0 },
  ];

  const co2Buckets = [
    { range: '0 g/km (BEV)', min: 0, max: 1, count: 0 },
    { range: '1 - 50 g/km (PHEV)', min: 1, max: 51, count: 0 },
    { range: '51 - 100 g/km (Motos/Eco)', min: 51, max: 101, count: 0 },
    { range: '101 - 120 g/km (HEV/Eco)', min: 101, max: 121, count: 0 },
    { range: '121 - 140 g/km', min: 121, max: 141, count: 0 },
    { range: '141 - 160 g/km', min: 141, max: 161, count: 0 },
    { range: '161 - 200 g/km', min: 161, max: 201, count: 0 },
    { range: '> 200 g/km', min: 201, max: 9999, count: 0 }
  ];

  const euroMap: Record<string, number> = {};
  const sampledRecords: DgtRecord[] = [];
  const sampleStride = Math.max(1, Math.floor(lines.length / 800)); // ~800 records per month

  // Loop lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.length < 80) continue;
    if (line.includes('Vehículos matriculados') || line.includes('Vehculos')) continue;

    const record = parseDgtLine(line, i);
    if (!record) continue;

    totalRegs++;

    if (record.tipoTramite === 'Nueva') nuevasCount++;
    else if (record.tipoTramite === 'Transferencia') transferenciasCount++;
    else otrosCount++;

    if (record.propulsion === 'Gasolina') gasolinaCount++;
    else if (record.propulsion === 'Diésel') dieselCount++;
    else if (record.propulsion === 'Híbrido (HEV)') hevCount++;
    else if (record.propulsion === 'Híbrido Enchufable (PHEV)') phevCount++;
    else if (record.propulsion === 'Eléctrico Puro (BEV)') bevCount++;
    else if (record.propulsion === 'GLP / GNC') glpGncCount++;

    if (record.etiquetaDgt === '0 CERO') ceroCount++;
    else if (record.etiquetaDgt === 'ECO') ecoCount++;
    else if (record.etiquetaDgt === 'C') cCount++;
    else if (record.etiquetaDgt === 'B') bCount++;
    else sinEtiquetaCount++;

    if (record.emisionesCo2 <= 120) exemptCo2Count++;
    if (record.emisionesCo2 > 0) {
      sumCo2 += record.emisionesCo2;
      co2Count++;
    }

    if (record.potenciaKw > 0) {
      sumKw += record.potenciaKw;
      sumCv += record.potenciaCv;
    }

    if (record.tara > 0) {
      sumTara += record.tara;
      taraCount++;
    }

    // Daily
    const dIso = record.fecMatriculaDate || `${period}-01`;
    if (!dailyMap[dIso]) {
      dailyMap[dIso] = {
        total: 0, gasolina: 0, diesel: 0, hev: 0, phev: 0, bev: 0, glpGnc: 0,
        cero: 0, eco: 0, c: 0, b: 0, sinEtiqueta: 0, sumCo2: 0, co2Count: 0
      };
    }
    const dItem = dailyMap[dIso];
    dItem.total++;
    if (record.propulsion === 'Gasolina') dItem.gasolina++;
    else if (record.propulsion === 'Diésel') dItem.diesel++;
    else if (record.propulsion === 'Híbrido (HEV)') dItem.hev++;
    else if (record.propulsion === 'Híbrido Enchufable (PHEV)') dItem.phev++;
    else if (record.propulsion === 'Eléctrico Puro (BEV)') dItem.bev++;
    else if (record.propulsion === 'GLP / GNC') dItem.glpGnc++;

    if (record.etiquetaDgt === '0 CERO') dItem.cero++;
    else if (record.etiquetaDgt === 'ECO') dItem.eco++;
    else if (record.etiquetaDgt === 'C') dItem.c++;
    else if (record.etiquetaDgt === 'B') dItem.b++;
    else dItem.sinEtiqueta++;

    if (record.emisionesCo2 > 0) {
      dItem.sumCo2 += record.emisionesCo2;
      dItem.co2Count++;
    }

    // Province
    const pCode = record.provinciaCod.padStart(2, '0');
    if (!provMap[pCode]) {
      provMap[pCode] = {
        count: 0, cero: 0, eco: 0, bev: 0, phev: 0, hev: 0, sumCo2: 0, co2Count: 0,
        brands: {}, models: {}
      };
    }
    const prItem = provMap[pCode];
    prItem.count++;
    if (record.etiquetaDgt === '0 CERO') prItem.cero++;
    if (record.etiquetaDgt === 'ECO') prItem.eco++;
    if (record.propulsion === 'Eléctrico Puro (BEV)') prItem.bev++;
    if (record.propulsion === 'Híbrido Enchufable (PHEV)') prItem.phev++;
    if (record.propulsion === 'Híbrido (HEV)') prItem.hev++;
    if (record.emisionesCo2 > 0) {
      prItem.sumCo2 += record.emisionesCo2;
      prItem.co2Count++;
    }
    prItem.brands[record.marca] = (prItem.brands[record.marca] || 0) + 1;
    prItem.models[record.modelo] = (prItem.models[record.modelo] || 0) + 1;

    // Brand
    if (!brandMap[record.marca]) {
      brandMap[record.marca] = {
        count: 0, eco0: 0, sumKw: 0, sumCo2: 0, co2Count: 0, models: {}
      };
    }
    const brItem = brandMap[record.marca];
    brItem.count++;
    if (record.etiquetaDgt === '0 CERO' || record.etiquetaDgt === 'ECO') brItem.eco0++;
    brItem.sumKw += record.potenciaKw;
    if (record.emisionesCo2 > 0) {
      brItem.sumCo2 += record.emisionesCo2;
      brItem.co2Count++;
    }
    brItem.models[record.modelo] = (brItem.models[record.modelo] || 0) + 1;

    // Model
    const modelKey = `${record.marca}|${record.modelo}`;
    if (!modelMap[modelKey]) {
      modelMap[modelKey] = {
        brand: record.marca,
        model: record.modelo,
        category: record.categoriaLabel,
        fuels: {},
        badges: {},
        count: 0,
        sumKw: 0,
        sumCv: 0,
        sumCo2: 0,
        co2Count: 0,
        sumTara: 0,
        taraCount: 0
      };
    }
    const mdItem = modelMap[modelKey];
    mdItem.count++;
    mdItem.fuels[record.propulsion] = (mdItem.fuels[record.propulsion] || 0) + 1;
    mdItem.badges[record.etiquetaDgt] = (mdItem.badges[record.etiquetaDgt] || 0) + 1;
    mdItem.sumKw += record.potenciaKw;
    mdItem.sumCv += record.potenciaCv;
    if (record.emisionesCo2 > 0) {
      mdItem.sumCo2 += record.emisionesCo2;
      mdItem.co2Count++;
    }
    if (record.tara > 0) {
      mdItem.sumTara += record.tara;
      mdItem.taraCount++;
    }

    // Power Bracket
    for (const pb of powerBrackets) {
      if (record.potenciaKw >= pb.min && record.potenciaKw < pb.max) {
        pb.count++;
        break;
      }
    }

    // Displacement Bracket
    for (const db of displacementBrackets) {
      if (record.cilindrada >= db.min && record.cilindrada < db.max) {
        db.count++;
        break;
      }
    }

    // CO2 Bucket
    for (const cb of co2Buckets) {
      if (record.emisionesCo2 >= cb.min && record.emisionesCo2 < cb.max) {
        cb.count++;
        break;
      }
    }

    // Euro Norm
    euroMap[record.normativaEuro] = (euroMap[record.normativaEuro] || 0) + 1;

    // Sample record
    if (i % sampleStride === 0 && sampledRecords.length < 800) {
      sampledRecords.push(record);
    }
  }

  // Find top brand
  let topBrand = 'N/A';
  let topBrandCount = 0;
  for (const [b, data] of Object.entries(brandMap)) {
    if (data.count > topBrandCount) {
      topBrandCount = data.count;
      topBrand = b;
    }
  }

  // Find top model
  let topModel = 'N/A';
  let topModelCount = 0;
  for (const [_, data] of Object.entries(modelMap)) {
    if (data.count > topModelCount) {
      topModelCount = data.count;
      topModel = `${data.brand} ${data.model}`;
    }
  }

  // Find top Euro norm
  let topEuroNorm = 'Euro 6e';
  let maxEuroCount = 0;
  for (const [norm, c] of Object.entries(euroMap)) {
    if (c > maxEuroCount) {
      maxEuroCount = c;
      topEuroNorm = norm;
    }
  }

  const avgCo2 = co2Count > 0 ? parseFloat((sumCo2 / co2Count).toFixed(1)) : 0;
  const avgKw = totalRegs > 0 ? parseFloat((sumKw / totalRegs).toFixed(1)) : 0;
  const avgCv = totalRegs > 0 ? Math.round(sumCv / totalRegs) : 0;
  const avgTara = taraCount > 0 ? Math.round(sumTara / taraCount) : 0;

  // Execute database transaction for this month
  db.exec('BEGIN TRANSACTION');

  // Insert Monthly Summary
  insertSummary.run(
    period,
    year,
    month,
    totalRegs,
    nuevasCount,
    transferenciasCount,
    otrosCount,
    gasolinaCount,
    dieselCount,
    hevCount,
    phevCount,
    bevCount,
    glpGncCount,
    ceroCount,
    ecoCount,
    cCount,
    bCount,
    sinEtiquetaCount,
    exemptCo2Count,
    avgCo2,
    avgKw,
    avgCv,
    avgTara,
    topBrand,
    topBrandCount,
    topModel,
    topModelCount,
    topEuroNorm
  );

  // Insert Daily Timeline
  for (const [dateIso, d] of Object.entries(dailyMap)) {
    const dAvgCo2 = d.co2Count > 0 ? parseFloat((d.sumCo2 / d.co2Count).toFixed(1)) : 0;
    insertDaily.run(
      dateIso,
      period,
      d.total,
      d.gasolina,
      d.diesel,
      d.hev,
      d.phev,
      d.bev,
      d.glpGnc,
      d.cero,
      d.eco,
      d.c,
      d.b,
      d.sinEtiqueta,
      dAvgCo2
    );
  }

  // Insert Province Monthly
  for (const [pCode, pData] of Object.entries(provMap)) {
    const provMeta = SPAIN_PROVINCES[pCode];
    const provName = provMeta ? provMeta.name : pCode;
    const pAvgCo2 = pData.co2Count > 0 ? parseFloat((pData.sumCo2 / pData.co2Count).toFixed(1)) : 0;

    let pTopBrand = 'N/A';
    let pMaxB = 0;
    for (const [b, c] of Object.entries(pData.brands)) {
      if (c > pMaxB) { pMaxB = c; pTopBrand = b; }
    }

    let pTopModel = 'N/A';
    let pMaxM = 0;
    for (const [m, c] of Object.entries(pData.models)) {
      if (c > pMaxM) { pMaxM = c; pTopModel = m; }
    }

    insertProvince.run(
      period,
      pCode,
      provName,
      pData.count,
      pData.cero,
      pData.eco,
      pData.bev,
      pData.phev,
      pData.hev,
      pAvgCo2,
      pTopBrand,
      pTopModel
    );
  }

  // Insert Top Brands (Top 30 per month)
  const sortedBrands = Object.entries(brandMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 30);

  for (const [bName, bData] of sortedBrands) {
    let bTopM = 'N/A';
    let bMaxM = 0;
    for (const [m, c] of Object.entries(bData.models)) {
      if (c > bMaxM) { bMaxM = c; bTopM = m; }
    }
    const bAvgKw = Math.round(bData.sumKw / bData.count);
    const bAvgCo2 = bData.co2Count > 0 ? Math.round(bData.sumCo2 / bData.co2Count) : 0;

    insertBrand.run(
      period,
      bName,
      bData.count,
      bData.eco0,
      bAvgKw,
      bAvgCo2,
      bTopM
    );
  }

  // Insert Top Models (Top 35 per month)
  const sortedModels = Object.values(modelMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 35);

  for (const md of sortedModels) {
    let dominantFuel = 'Gasolina';
    let maxF = 0;
    for (const [f, c] of Object.entries(md.fuels)) {
      if (c > maxF) { maxF = c; dominantFuel = f; }
    }

    let dominantBadge = 'C';
    let maxB = 0;
    for (const [b, c] of Object.entries(md.badges)) {
      if (c > maxB) { maxB = c; dominantBadge = b; }
    }

    const mdAvgKw = Math.round(md.sumKw / md.count);
    const mdAvgCv = Math.round(md.sumCv / md.count);
    const mdAvgCo2 = md.co2Count > 0 ? Math.round(md.sumCo2 / md.co2Count) : 0;
    const mdAvgTara = md.taraCount > 0 ? Math.round(md.sumTara / md.taraCount) : 0;

    insertModel.run(
      period,
      md.brand,
      md.model,
      md.category,
      dominantFuel,
      dominantBadge,
      md.count,
      mdAvgKw,
      mdAvgCv,
      mdAvgCo2,
      mdAvgTara
    );
  }

  // Insert Power Brackets
  for (const pb of powerBrackets) {
    const pct = totalRegs > 0 ? parseFloat(((pb.count / totalRegs) * 100).toFixed(1)) : 0;
    insertPowerBracket.run(period, pb.range, pb.count, pct);
  }

  // Insert Displacement Brackets
  for (const dbItem of displacementBrackets) {
    const pct = totalRegs > 0 ? parseFloat(((dbItem.count / totalRegs) * 100).toFixed(1)) : 0;
    insertDisplacementBracket.run(period, dbItem.range, dbItem.count, pct);
  }

  // Insert CO2 Brackets
  for (const cb of co2Buckets) {
    const pct = totalRegs > 0 ? parseFloat(((cb.count / totalRegs) * 100).toFixed(1)) : 0;
    insertCo2Bracket.run(period, cb.range, cb.count, pct);
  }

  // Insert Euro Norms
  for (const [norm, c] of Object.entries(euroMap)) {
    const pct = totalRegs > 0 ? parseFloat(((c / totalRegs) * 100).toFixed(1)) : 0;
    insertEuroNorm.run(period, norm, c, pct);
  }

  // Insert Detailed Sample Records
  for (let sIdx = 0; sIdx < sampledRecords.length; sIdx++) {
    const r = sampledRecords[sIdx];
    insertRecord.run(
      `${period}-${sIdx + 1}`,
      period,
      r.fecMatricula,
      r.fecMatriculaDate,
      r.claseMatricula,
      r.tipoTramite,
      r.marca,
      r.modelo,
      r.vinParcial,
      r.wmi,
      r.tipoVehiculoCod,
      r.categoria,
      r.categoriaLabel,
      r.carroceria,
      r.cilindrada,
      r.potenciaFiscal,
      r.potenciaKw,
      r.potenciaCv,
      r.tara,
      r.mma,
      r.plazas,
      r.municipio,
      r.codigoPostal,
      r.provinciaCod,
      r.provinciaNombre,
      r.comunidadAutonoma,
      r.emisionesCo2,
      r.normativaEuro,
      r.tramoIedmt,
      r.propulsionCod,
      r.hibridoInd,
      r.propulsion,
      r.etiquetaDgt,
      r.batalla,
      r.fabricante
    );
  }

  db.exec('COMMIT');

  const monthElapsed = ((Date.now() - monthStartTime) / 1000).toFixed(2);
  const eco0Pct = totalRegs > 0 ? (((ceroCount + ecoCount) / totalRegs) * 100).toFixed(1) : '0';
  grandTotalRegistrations += totalRegs;

  console.log(
    `[${fileIdx + 1}/${zipFiles.length}] Periodo ${period}: ${totalRegs.toLocaleString('es-ES')} regs (${monthElapsed}s) | Líder: ${topBrand.padEnd(12)} | ECO/0: ${eco0Pct}% | CO2: ${avgCo2}g`
  );
}

const totalSec = ((Date.now() - overallStartTime) / 1000).toFixed(1);
console.log('='.repeat(70));
console.log(`[EXITO TOTAL] Se han procesado e insertado ${grandTotalRegistrations.toLocaleString('es-ES')} matriculaciones en ${totalSec}s.`);
console.log(`[BASE DE DATOS] Guardada en ${DB_PATH} (${(fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2)} MB)`);
console.log('='.repeat(70));
