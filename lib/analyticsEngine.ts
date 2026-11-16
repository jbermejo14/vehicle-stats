import { isElectrifiedBadge, PHEV_UNDETERMINED_BADGE } from './dgtBadge';
import { 
  DgtRecord, 
  GlobalKpis, 
  ProvinceStat, 
  BrandStat, 
  ModelStat, 
  TimelineDataPoint, 
  PowerBracketStat, 
  DisplacementBracketStat, 
  Co2BracketStat,
  FilterState,
  AutomotiveGroupStat,
  OriginCountryStat,
  BodyTypeStat,
  WeightPowerBracket,
  MunicipalityStat
} from './dgtTypes';
import { SPAIN_PROVINCES } from './spainProvinces';

export function filterRecords(records: DgtRecord[], filters: FilterState): DgtRecord[] {
  return records.filter(record => {
    // Procedure filter
    if (filters.tramite === 'nuevas' && record.tipoTramite !== 'Nueva') return false;
    if (filters.tramite === 'transferencias' && record.tipoTramite !== 'Transferencia') return false;
    if (filters.tramite === 'bajas' && record.tipoTramite !== 'Otro') return false;

    // Vehicle Category filter
    if (filters.categoria === 'turismos' && record.categoriaLabel !== 'Turismo') return false;
    if (filters.categoria === 'motos' && record.categoriaLabel !== 'Motocicleta' && record.categoriaLabel !== 'Ciclomotor') return false;
    if (filters.categoria === 'furgonetas' && record.categoriaLabel !== 'Comercial') return false;
    if (filters.categoria === 'industriales' && record.categoriaLabel !== 'Industrial') return false;

    // Fuel filter
    if (filters.propulsion && filters.propulsion !== 'todas' && record.propulsion !== filters.propulsion) {
      return false;
    }

    // Badge filter
    if (filters.etiqueta && filters.etiqueta !== 'todas' && record.etiquetaDgt !== filters.etiqueta) {
      return false;
    }

    // Province filter
    if (filters.provincia && filters.provincia !== 'todas' && record.provinciaCod !== filters.provincia) {
      return false;
    }

    // Text search
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const matchBrand = record.marca.toLowerCase().includes(q);
      const matchModel = record.modelo.toLowerCase().includes(q);
      const matchProvince = record.provinciaNombre.toLowerCase().includes(q);
      const matchVin = record.vinParcial.toLowerCase().includes(q);
      if (!matchBrand && !matchModel && !matchProvince && !matchVin) return false;
    }

    // Date range filter
    if (filters.startDate && record.fecMatriculaDate < filters.startDate) return false;
    if (filters.endDate && record.fecMatriculaDate > filters.endDate) return false;

    return true;
  });
}

export function computeGlobalKpis(records: DgtRecord[]): GlobalKpis {
  const total = records.length;
  if (total === 0) {
    return {
      totalRegistrations: 0,
      nuevasCount: 0,
      transferenciasCount: 0,
      electrificadosCount: 0,
      electrificadosPct: 0,
      ceroCount: 0,
      ceroPct: 0,
      ecoCount: 0,
      ecoPct: 0,
      bevCount: 0,
      phevCount: 0,
      hevCount: 0,
      avgCo2: 0,
      co2ExemptPct: 0,
      avgKw: 0,
      avgCv: 0,
      avgTara: 0,
      topBrand: { name: 'N/A', count: 0, pct: 0 },
      topModel: { name: 'N/A', brand: 'N/A', count: 0, pct: 0 },
      topProvince: { name: 'N/A', count: 0, pct: 0 },
      topEuroNorm: { norm: 'N/A', pct: 0 }
    };
  }

  let nuevasCount = 0;
  let transferenciasCount = 0;
  let ceroCount = 0;
  let ecoCount = 0;
  let bevCount = 0;
  let phevCount = 0;
  let phevUndeterminedCount = 0;
  let hevCount = 0;
  let exemptCount = 0;
  let sumCo2 = 0;
  let co2Count = 0;
  let sumKw = 0;
  let sumCv = 0;
  let sumTara = 0;
  let taraCount = 0;

  const brandMap: Record<string, number> = {};
  const modelMap: Record<string, { brand: string; count: number }> = {};
  const provMap: Record<string, number> = {};
  const euroMap: Record<string, number> = {};

  for (const r of records) {
    if (r.tipoTramite === 'Nueva') nuevasCount++;
    if (r.tipoTramite === 'Transferencia') transferenciasCount++;

    if (r.etiquetaDgt === '0 CERO') ceroCount++;
    if (r.etiquetaDgt === 'ECO') ecoCount++;
    if (r.etiquetaDgt === PHEV_UNDETERMINED_BADGE) phevUndeterminedCount++;

    if (r.propulsion === 'Eléctrico Puro (BEV)') bevCount++;
    if (r.propulsion === 'Híbrido Enchufable (PHEV)') phevCount++;
    if (r.propulsion === 'Híbrido (HEV)') hevCount++;

    if (r.emisionesCo2 <= 120) exemptCount++;
    if (r.emisionesCo2 > 0) {
      sumCo2 += r.emisionesCo2;
      co2Count++;
    }

    if (r.potenciaKw > 0) {
      sumKw += r.potenciaKw;
      sumCv += r.potenciaCv;
    }

    if (r.tara > 0) {
      sumTara += r.tara;
      taraCount++;
    }

    // Tallies
    brandMap[r.marca] = (brandMap[r.marca] || 0) + 1;
    
    const modelKey = `${r.marca} ${r.modelo}`;
    if (!modelMap[modelKey]) {
      modelMap[modelKey] = { brand: r.marca, count: 0 };
    }
    modelMap[modelKey].count++;

    provMap[r.provinciaNombre] = (provMap[r.provinciaNombre] || 0) + 1;
    euroMap[r.normativaEuro] = (euroMap[r.normativaEuro] || 0) + 1;
  }

  const electrificadosCount = ceroCount + ecoCount + phevUndeterminedCount;
  const electrificadosPct = parseFloat(((electrificadosCount / total) * 100).toFixed(1));
  const ceroPct = parseFloat(((ceroCount / total) * 100).toFixed(1));
  const ecoPct = parseFloat(((ecoCount / total) * 100).toFixed(1));
  const co2ExemptPct = parseFloat(((exemptCount / total) * 100).toFixed(1));
  const avgCo2 = co2Count > 0 ? parseFloat((sumCo2 / co2Count).toFixed(1)) : 0;
  const avgKw = parseFloat((sumKw / total).toFixed(1));
  const avgCv = Math.round(sumCv / total);
  const avgTara = taraCount > 0 ? Math.round(sumTara / taraCount) : 0;

  // Top brand
  let topBrandName = 'N/A';
  let topBrandCount = 0;
  for (const [brand, count] of Object.entries(brandMap)) {
    if (count > topBrandCount) {
      topBrandCount = count;
      topBrandName = brand;
    }
  }

  // Top model
  let topModelKey = 'N/A';
  let topModelBrand = 'N/A';
  let topModelCount = 0;
  for (const [key, val] of Object.entries(modelMap)) {
    if (val.count > topModelCount) {
      topModelCount = val.count;
      topModelKey = key;
      topModelBrand = val.brand;
    }
  }

  // Top province
  let topProvName = 'N/A';
  let topProvCount = 0;
  for (const [prov, count] of Object.entries(provMap)) {
    if (count > topProvCount) {
      topProvCount = count;
      topProvName = prov;
    }
  }

  // Top Euro norm
  let topEuroName = 'N/A';
  let topEuroCount = 0;
  for (const [norm, count] of Object.entries(euroMap)) {
    if (count > topEuroCount) {
      topEuroCount = count;
      topEuroName = norm;
    }
  }

  return {
    totalRegistrations: total,
    nuevasCount,
    transferenciasCount,
    electrificadosCount,
    electrificadosPct,
    ceroCount,
    ceroPct,
    ecoCount,
    ecoPct,
    bevCount,
    phevCount,
    hevCount,
    avgCo2,
    co2ExemptPct,
    avgKw,
    avgCv,
    avgTara,
    topBrand: {
      name: topBrandName,
      count: topBrandCount,
      pct: parseFloat(((topBrandCount / total) * 100).toFixed(1))
    },
    topModel: {
      name: topModelKey.replace(topModelBrand, '').trim() || topModelKey,
      brand: topModelBrand,
      count: topModelCount,
      pct: parseFloat(((topModelCount / total) * 100).toFixed(1))
    },
    topProvince: {
      name: topProvName,
      count: topProvCount,
      pct: parseFloat(((topProvCount / total) * 100).toFixed(1))
    },
    topEuroNorm: {
      norm: topEuroName,
      pct: parseFloat(((topEuroCount / total) * 100).toFixed(1))
    }
  };
}

export function computeTimeline(records: DgtRecord[]): TimelineDataPoint[] {
  const dayMap: Record<string, {
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

  for (const r of records) {
    const d = r.fecMatriculaDate || '2026-10-01';
    if (!dayMap[d]) {
      dayMap[d] = {
        total: 0,
        gasolina: 0,
        diesel: 0,
        hev: 0,
        phev: 0,
        bev: 0,
        glpGnc: 0,
        cero: 0,
        eco: 0,
        c: 0,
        b: 0,
        sinEtiqueta: 0,
        sumCo2: 0,
        co2Count: 0
      };
    }

    const item = dayMap[d];
    item.total++;

    if (r.propulsion === 'Gasolina') item.gasolina++;
    else if (r.propulsion === 'Diésel') item.diesel++;
    else if (r.propulsion === 'Híbrido (HEV)') item.hev++;
    else if (r.propulsion === 'Híbrido Enchufable (PHEV)') item.phev++;
    else if (r.propulsion === 'Eléctrico Puro (BEV)') item.bev++;
    else if (r.propulsion === 'GLP / GNC') item.glpGnc++;

    if (r.etiquetaDgt === '0 CERO') item.cero++;
    else if (r.etiquetaDgt === 'ECO') item.eco++;
    else if (r.etiquetaDgt === 'C') item.c++;
    else if (r.etiquetaDgt === 'B') item.b++;
    else if (r.etiquetaDgt === 'SIN ETIQUETA') item.sinEtiqueta++;

    if (r.emisionesCo2 > 0) {
      item.sumCo2 += r.emisionesCo2;
      item.co2Count++;
    }
  }

  const sortedDates = Object.keys(dayMap).sort();

  return sortedDates.map(dateKey => {
    const d = dayMap[dateKey];
    const parts = dateKey.split('-');
    const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateKey;

    return {
      date: dateKey,
      displayDate,
      total: d.total,
      gasolina: d.gasolina,
      diesel: d.diesel,
      hev: d.hev,
      phev: d.phev,
      bev: d.bev,
      glpGnc: d.glpGnc,
      cero: d.cero,
      eco: d.eco,
      c: d.c,
      b: d.b,
      sinEtiqueta: d.sinEtiqueta,
      avgCo2: d.co2Count > 0 ? Math.round(d.sumCo2 / d.co2Count) : 0
    };
  });
}

export function computeProvinceStats(records: DgtRecord[]): ProvinceStat[] {
  const provAgg: Record<string, {
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

  for (const r of records) {
    const code = r.provinciaCod.padStart(2, '0');
    if (!provAgg[code]) {
      provAgg[code] = {
        count: 0,
        cero: 0,
        eco: 0,
        bev: 0,
        phev: 0,
        hev: 0,
        sumCo2: 0,
        co2Count: 0,
        brands: {},
        models: {}
      };
    }

    const item = provAgg[code];
    item.count++;

    if (r.etiquetaDgt === '0 CERO') item.cero++;
    if (r.etiquetaDgt === 'ECO') item.eco++;
    if (r.propulsion === 'Eléctrico Puro (BEV)') item.bev++;
    if (r.propulsion === 'Híbrido Enchufable (PHEV)') item.phev++;
    if (r.propulsion === 'Híbrido (HEV)') item.hev++;

    if (r.emisionesCo2 > 0) {
      item.sumCo2 += r.emisionesCo2;
      item.co2Count++;
    }

    item.brands[r.marca] = (item.brands[r.marca] || 0) + 1;
    item.models[r.modelo] = (item.models[r.modelo] || 0) + 1;
  }

  const results: ProvinceStat[] = [];

  for (const [code, meta] of Object.entries(SPAIN_PROVINCES)) {
    const agg = provAgg[code];
    const count = agg ? agg.count : 0;
    const pop = meta.population || 500000;
    const ratePer1000 = parseFloat(((count / pop) * 1000).toFixed(2));

    let topBrand = 'N/A';
    let maxBrandCount = 0;
    let topModel = 'N/A';
    let maxModelCount = 0;

    if (agg) {
      for (const [b, c] of Object.entries(agg.brands)) {
        if (c > maxBrandCount) {
          maxBrandCount = c;
          topBrand = b;
        }
      }
      for (const [m, c] of Object.entries(agg.models)) {
        if (c > maxModelCount) {
          maxModelCount = c;
          topModel = m;
        }
      }
    }

    const electrifiedCount = agg ? agg.cero + agg.eco : 0;
    const electrifiedPct = count > 0 ? parseFloat(((electrifiedCount / count) * 100).toFixed(1)) : 0;
    const bevPct = count > 0 && agg ? parseFloat(((agg.bev / count) * 100).toFixed(1)) : 0;
    const phevPct = count > 0 && agg ? parseFloat(((agg.phev / count) * 100).toFixed(1)) : 0;
    const hevPct = count > 0 && agg ? parseFloat(((agg.hev / count) * 100).toFixed(1)) : 0;
    const avgCo2 = agg && agg.co2Count > 0 ? Math.round(agg.sumCo2 / agg.co2Count) : 0;

    results.push({
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
      topBrand,
      topModel,
      avgCo2
    });
  }

  return results.sort((a, b) => b.totalRegistrations - a.totalRegistrations);
}

export function computeBrandStats(records: DgtRecord[], limit: number = 20): BrandStat[] {
  const total = records.length;
  if (total === 0) return [];

  const map: Record<string, {
    count: number;
    eco0Count: number;
    sumKw: number;
    sumCo2: number;
    co2Count: number;
    models: Record<string, number>;
  }> = {};

  for (const r of records) {
    if (!map[r.marca]) {
      map[r.marca] = {
        count: 0,
        eco0Count: 0,
        sumKw: 0,
        sumCo2: 0,
        co2Count: 0,
        models: {}
      };
    }
    const item = map[r.marca];
    item.count++;
    if (isElectrifiedBadge(r.etiquetaDgt)) {
      item.eco0Count++;
    }
    item.sumKw += r.potenciaKw;
    if (r.emisionesCo2 > 0) {
      item.sumCo2 += r.emisionesCo2;
      item.co2Count++;
    }
    item.models[r.modelo] = (item.models[r.modelo] || 0) + 1;
  }

  const list = Object.entries(map).map(([brand, data]) => {
    let topModel = 'N/A';
    let maxCount = 0;
    for (const [m, c] of Object.entries(data.models)) {
      if (c > maxCount) {
        maxCount = c;
        topModel = m;
      }
    }

    return {
      brand,
      total: data.count,
      percentage: parseFloat(((data.count / total) * 100).toFixed(1)),
      eco0Pct: parseFloat(((data.eco0Count / data.count) * 100).toFixed(1)),
      avgKw: Math.round(data.sumKw / data.count),
      avgCo2: data.co2Count > 0 ? Math.round(data.sumCo2 / data.co2Count) : 0,
      topModel
    };
  });

  return list.sort((a, b) => b.total - a.total).slice(0, limit);
}

export function computeModelStats(records: DgtRecord[], limit: number = 25): ModelStat[] {
  const total = records.length;
  if (total === 0) return [];

  const map: Record<string, {
    brand: string;
    model: string;
    count: number;
    category: string;
    fuels: Record<string, number>;
    badges: Record<string, number>;
    sumKw: number;
    sumCv: number;
    sumCo2: number;
    co2Count: number;
    sumTara: number;
    taraCount: number;
  }> = {};

  for (const r of records) {
    const key = `${r.marca}|${r.modelo}`;
    if (!map[key]) {
      map[key] = {
        brand: r.marca,
        model: r.modelo,
        count: 0,
        category: r.categoriaLabel,
        fuels: {},
        badges: {},
        sumKw: 0,
        sumCv: 0,
        sumCo2: 0,
        co2Count: 0,
        sumTara: 0,
        taraCount: 0
      };
    }
    const item = map[key];
    item.count++;
    item.fuels[r.propulsion] = (item.fuels[r.propulsion] || 0) + 1;
    item.badges[r.etiquetaDgt] = (item.badges[r.etiquetaDgt] || 0) + 1;
    item.sumKw += r.potenciaKw;
    item.sumCv += r.potenciaCv;
    if (r.emisionesCo2 > 0) {
      item.sumCo2 += r.emisionesCo2;
      item.co2Count++;
    }
    if (r.tara > 0) {
      item.sumTara += r.tara;
      item.taraCount++;
    }
  }

  const list = Object.values(map).map(item => {
    // Dominant fuel
    let dominantFuel = 'Gasolina';
    let maxFuelCount = 0;
    for (const [f, c] of Object.entries(item.fuels)) {
      if (c > maxFuelCount) {
        maxFuelCount = c;
        dominantFuel = f;
      }
    }

    // Dominant badge
    let dominantBadge = 'C';
    let maxBadgeCount = 0;
    for (const [b, c] of Object.entries(item.badges)) {
      if (c > maxBadgeCount) {
        maxBadgeCount = c;
        dominantBadge = b;
      }
    }

    return {
      model: item.model,
      brand: item.brand,
      fullName: `${item.brand} ${item.model}`,
      total: item.count,
      percentage: parseFloat(((item.count / total) * 100).toFixed(1)),
      category: item.category,
      primaryFuel: dominantFuel as any,
      primaryBadge: dominantBadge as any,
      avgKw: Math.round(item.sumKw / item.count),
      avgCv: Math.round(item.sumCv / item.count),
      avgCo2: item.co2Count > 0 ? Math.round(item.sumCo2 / item.co2Count) : 0,
      avgTara: item.taraCount > 0 ? Math.round(item.sumTara / item.taraCount) : 0
    };
  });

  return list.sort((a, b) => b.total - a.total).slice(0, limit);
}

export function computePowerBrackets(records: DgtRecord[]): PowerBracketStat[] {
  const brackets: { range: string; minKw: number; maxKw: number; count: number }[] = [
    { range: '< 50 kW (< 68 CV)', minKw: 0, maxKw: 50, count: 0 },
    { range: '50 - 75 kW (68-102 CV)', minKw: 50, maxKw: 75, count: 0 },
    { range: '75 - 100 kW (102-136 CV)', minKw: 75, maxKw: 100, count: 0 },
    { range: '100 - 150 kW (136-204 CV)', minKw: 100, maxKw: 150, count: 0 },
    { range: '150 - 200 kW (204-272 CV)', minKw: 150, maxKw: 200, count: 0 },
    { range: '> 200 kW (> 272 CV)', minKw: 200, maxKw: 9999, count: 0 },
  ];

  const total = records.length;
  for (const r of records) {
    const kw = r.potenciaKw;
    for (const b of brackets) {
      if (kw >= b.minKw && kw < b.maxKw) {
        b.count++;
        break;
      }
    }
  }

  return brackets.map(b => ({
    ...b,
    percentage: total > 0 ? parseFloat(((b.count / total) * 100).toFixed(1)) : 0
  }));
}

export function computeDisplacementBrackets(records: DgtRecord[]): DisplacementBracketStat[] {
  const brackets: { range: string; minCc: number; maxCc: number; count: number }[] = [
    { range: 'Eléctrico (0 cc)', minCc: 0, maxCc: 1, count: 0 },
    { range: '< 1.000 cc (Urbano)', minCc: 1, maxCc: 1000, count: 0 },
    { range: '1.000 - 1.499 cc (Compacto)', minCc: 1000, maxCc: 1500, count: 0 },
    { range: '1.500 - 1.999 cc (Medio)', minCc: 1500, maxCc: 2000, count: 0 },
    { range: '≥ 2.000 cc (Gran Cilindrada)', minCc: 2000, maxCc: 99999, count: 0 },
  ];

  const total = records.length;
  for (const r of records) {
    const cc = r.cilindrada;
    for (const b of brackets) {
      if (cc >= b.minCc && cc < b.maxCc) {
        b.count++;
        break;
      }
    }
  }

  return brackets.map(b => ({
    ...b,
    percentage: total > 0 ? parseFloat(((b.count / total) * 100).toFixed(1)) : 0
  }));
}

export function computeCo2Histogram(records: DgtRecord[]): { range: string; count: number; percentage: number }[] {
  const buckets = [
    { range: '0 g/km (BEV)', min: 0, max: 1, count: 0 },
    { range: '1 - 50 g/km (PHEV)', min: 1, max: 51, count: 0 },
    { range: '51 - 100 g/km (Motos/Eco)', min: 51, max: 101, count: 0 },
    { range: '101 - 120 g/km (HEV/Eco)', min: 101, max: 121, count: 0 },
    { range: '121 - 140 g/km', min: 121, max: 141, count: 0 },
    { range: '141 - 160 g/km', min: 141, max: 161, count: 0 },
    { range: '161 - 200 g/km', min: 161, max: 201, count: 0 },
    { range: '> 200 g/km', min: 201, max: 9999, count: 0 }
  ];

  const total = records.length;
  for (const r of records) {
    const co2 = r.emisionesCo2;
    for (const b of buckets) {
      if (co2 >= b.min && co2 < b.max) {
        b.count++;
        break;
      }
    }
  }

  return buckets.map(b => ({
    range: b.range,
    count: b.count,
    percentage: total > 0 ? parseFloat(((b.count / total) * 100).toFixed(1)) : 0
  }));
}

export function computeIedmtBrackets(records: DgtRecord[]): Co2BracketStat[] {
  const brackets: Record<string, { count: number; taxRate: string }> = {
    'Exento (0%)': { count: 0, taxRate: '0,00%' },
    'Tramo 1 (4,75%)': { count: 0, taxRate: '4,75%' },
    'Tramo 2 (9,75%)': { count: 0, taxRate: '9,75%' },
    'Tramo 3 (14,75%)': { count: 0, taxRate: '14,75%' }
  };

  const total = records.length;
  for (const r of records) {
    if (brackets[r.tramoIedmt]) {
      brackets[r.tramoIedmt].count++;
    }
  }

  return Object.entries(brackets).map(([range, data]) => ({
    range,
    tramoIedmt: range as any,
    count: data.count,
    percentage: total > 0 ? parseFloat(((data.count / total) * 100).toFixed(1)) : 0,
    taxRate: data.taxRate
  }));
}

export function computeEuroStandards(records: DgtRecord[]): { norm: string; count: number; percentage: number }[] {
  const total = records.length;
  const map: Record<string, number> = {};

  for (const r of records) {
    const n = r.normativaEuro || 'Euro 6d';
    map[n] = (map[n] || 0) + 1;
  }

  return Object.entries(map)
    .map(([norm, count]) => ({
      norm,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

// -------------------------------------------------------------
// ADVANCED TELEMETRY // AUTOMOTIVE GROUPS (OEMS)
// -------------------------------------------------------------
const BRAND_TO_GROUP: Record<string, string> = {
  'SEAT': 'Grupo Volkswagen (VAG)',
  'CUPRA': 'Grupo Volkswagen (VAG)',
  'VOLKSWAGEN': 'Grupo Volkswagen (VAG)',
  'AUDI': 'Grupo Volkswagen (VAG)',
  'SKODA': 'Grupo Volkswagen (VAG)',
  'PORSCHE': 'Grupo Volkswagen (VAG)',
  'LAMBORGHINI': 'Grupo Volkswagen (VAG)',
  'BENTLEY': 'Grupo Volkswagen (VAG)',
  'MAN': 'Grupo Volkswagen (VAG)',

  'PEUGEOT': 'Stellantis',
  'CITROEN': 'Stellantis',
  'OPEL': 'Stellantis',
  'FIAT': 'Stellantis',
  'JEEP': 'Stellantis',
  'DS': 'Stellantis',
  'ALFA ROMEO': 'Stellantis',
  'ABARTH': 'Stellantis',
  'LANCIA': 'Stellantis',
  'MASERATI': 'Stellantis',

  'RENAULT': 'Grupo Renault',
  'DACIA': 'Grupo Renault',
  'ALPINE': 'Grupo Renault',
  'MOBILIZE': 'Grupo Renault',

  'TOYOTA': 'Toyota Motor Corp',
  'LEXUS': 'Toyota Motor Corp',

  'HYUNDAI': 'Hyundai Motor Group',
  'KIA': 'Hyundai Motor Group',
  'GENESIS': 'Hyundai Motor Group',

  'BMW': 'BMW Group',
  'MINI': 'BMW Group',
  'ROLLS-ROYCE': 'BMW Group',

  'MERCEDES-BENZ': 'Mercedes-Benz Group',
  'MERCEDES': 'Mercedes-Benz Group',
  'SMART': 'Mercedes-Benz / Geely JV',

  'VOLVO': 'Geely Holding Group',
  'POLESTAR': 'Geely Holding Group',
  'LYNK & CO': 'Geely Holding Group',
  'GEELY': 'Geely Holding Group',
  'LOTUS': 'Geely Holding Group',

  'FORD': 'Ford Motor Company',
  'TESLA': 'Tesla, Inc.',
  
  'MG': 'SAIC Motor Group',
  'MAXUS': 'SAIC Motor Group',

  'BYD': 'BYD Auto',

  'OMODA': 'Chery Automobile',
  'JAECOO': 'Chery Automobile',
  'CHERY': 'Chery Automobile',

  'NISSAN': 'Alianza Renault-Nissan-Mitsubishi',
  'MITSUBISHI': 'Alianza Renault-Nissan-Mitsubishi',

  'MAZDA': 'Mazda Motor Corp',
  'HONDA': 'Honda Motor Co.',
  'SUZUKI': 'Suzuki Motor Corp',

  'LAND ROVER': 'JLR (Tata Motors)',
  'JAGUAR': 'JLR (Tata Motors)',

  'PIAGGIO': 'Grupo Piaggio',
  'VESPA': 'Grupo Piaggio',
  'APRILIA': 'Grupo Piaggio',
  'KYMCO': 'Kymco Kwang Yang',
  'YAMAHA': 'Yamaha Motor Co.',
  'SYM': 'Sanyang Motor (SYM)',
  'KAWASAKI': 'Kawasaki Heavy Ind.'
};

export function computeAutomotiveGroups(records: DgtRecord[]): AutomotiveGroupStat[] {
  const total = records.length;
  if (total === 0) return [];

  const groupMap: Record<string, {
    total: number;
    brandsMap: Record<string, number>;
    eco0Count: number;
    co2Sum: number;
    co2Valid: number;
  }> = {};

  for (const r of records) {
    const brand = r.marca ? r.marca.toUpperCase().trim() : 'GENÉRICO';
    let group = BRAND_TO_GROUP[brand];

    // Fallback if brand not mapped: inspect fabricante
    if (!group) {
      const fab = (r.fabricante || '').toUpperCase();
      if (fab.includes('VOLKSWAGEN') || fab.includes('SEAT') || fab.includes('AUDI') || fab.includes('SKODA')) {
        group = 'Grupo Volkswagen (VAG)';
      } else if (fab.includes('STELLANTIS') || fab.includes('PSA') || fab.includes('FCA')) {
        group = 'Stellantis';
      } else if (fab.includes('RENAULT') || fab.includes('DACIA')) {
        group = 'Grupo Renault';
      } else if (fab.includes('TOYOTA')) {
        group = 'Toyota Motor Corp';
      } else if (fab.includes('BMW') || fab.includes('BAYERISCHE')) {
        group = 'BMW Group';
      } else if (fab.includes('MERCEDES') || fab.includes('DAIMLER')) {
        group = 'Mercedes-Benz Group';
      } else if (fab.includes('HYUNDAI') || fab.includes('KIA')) {
        group = 'Hyundai Motor Group';
      } else if (fab.includes('TESLA')) {
        group = 'Tesla, Inc.';
      } else if (fab.includes('FORD')) {
        group = 'Ford Motor Company';
      } else {
        group = 'Otros / Independientes';
      }
    }

    if (!groupMap[group]) {
      groupMap[group] = {
        total: 0,
        brandsMap: {},
        eco0Count: 0,
        co2Sum: 0,
        co2Valid: 0
      };
    }

    const g = groupMap[group];
    g.total++;
    g.brandsMap[brand] = (g.brandsMap[brand] || 0) + 1;
    if (isElectrifiedBadge(r.etiquetaDgt)) {
      g.eco0Count++;
    }
    if (r.emisionesCo2 > 0) {
      g.co2Sum += r.emisionesCo2;
      g.co2Valid++;
    }
  }

  return Object.entries(groupMap)
    .map(([groupName, data]) => {
      const sortedBrands = Object.entries(data.brandsMap).sort((a, b) => b[1] - a[1]);
      const topBrand = sortedBrands[0] ? sortedBrands[0][0] : 'N/A';
      const brands = sortedBrands.slice(0, 5).map(b => b[0]);

      return {
        groupName,
        total: data.total,
        percentage: parseFloat(((data.total / total) * 100).toFixed(1)),
        brands,
        eco0Pct: parseFloat(((data.eco0Count / data.total) * 100).toFixed(1)),
        avgCo2: data.co2Valid > 0 ? Math.round(data.co2Sum / data.co2Valid) : 120,
        topBrand
      };
    })
    .sort((a, b) => b.total - a.total);
}

// -------------------------------------------------------------
// WMI // ORIGIN COUNTRY & "MADE IN SPAIN"
// -------------------------------------------------------------
export function resolveOriginCountry(wmi: string): { country: string; code: string; flag: string; isDomestic: boolean } {
  const w = (wmi || '').toUpperCase().trim();
  if (!w) return { country: 'Desconocido', code: 'XX', flag: '🌐', isDomestic: false };

  // Spain: VSS, VSE, VS6, VR3, VR7, VSX, VSA, VSG, VSR, VNV or starting with VS
  if (w.startsWith('VS') || w === 'VR3' || w === 'VR7' || w === 'VSR' || w === 'VNV') {
    return { country: 'España (Nacional)', code: 'ES', flag: '🇪🇸', isDomestic: true };
  }
  // Germany: WV, WA, WB, WD, WP, W
  if (w.startsWith('WV') || w.startsWith('WA') || w.startsWith('WB') || w.startsWith('WD') || w.startsWith('WP') || w.startsWith('W')) {
    return { country: 'Alemania', code: 'DE', flag: '🇩🇪', isDomestic: false };
  }
  // France: VF, VR1
  if (w.startsWith('VF') || w === 'VR1') {
    return { country: 'Francia', code: 'FR', flag: '🇫🇷', isDomestic: false };
  }
  // Romania: UU
  if (w.startsWith('UU')) {
    return { country: 'Rumanía', code: 'RO', flag: '🇷🇴', isDomestic: false };
  }
  // Czechia: TM, TJ
  if (w.startsWith('TM') || w.startsWith('TJ')) {
    return { country: 'República Checa', code: 'CZ', flag: '🇨🇿', isDomestic: false };
  }
  // Slovakia: U5, U6
  if (w.startsWith('U5') || w.startsWith('U6')) {
    return { country: 'Eslovaquia', code: 'SK', flag: '🇸🇰', isDomestic: false };
  }
  // China: L (LA-L0)
  if (w.startsWith('L')) {
    return { country: 'China', code: 'CN', flag: '🇨🇳', isDomestic: false };
  }
  // Japan: J (JA-J0)
  if (w.startsWith('J')) {
    return { country: 'Japón', code: 'JP', flag: '🇯🇵', isDomestic: false };
  }
  // South Korea: K (KA-K0)
  if (w.startsWith('K')) {
    return { country: 'Corea del Sur', code: 'KR', flag: '🇰🇷', isDomestic: false };
  }
  // Italy: ZA-ZR
  if (w.startsWith('ZFA') || w.startsWith('ZAR') || w.startsWith('ZAM') || w.startsWith('Z')) {
    return { country: 'Italia', code: 'IT', flag: '🇮🇹', isDomestic: false };
  }
  // UK: SA-SM, WMW
  if (w.startsWith('SA') || w.startsWith('SL') || w.startsWith('SH') || w.startsWith('WMW')) {
    return { country: 'Reino Unido', code: 'GB', flag: '🇬🇧', isDomestic: false };
  }
  // Poland: SU, PL
  if (w.startsWith('SU') || w.startsWith('PL')) {
    return { country: 'Polonia', code: 'PL', flag: '🇵🇱', isDomestic: false };
  }
  // USA: 1, 4, 5
  if (w.startsWith('1') || w.startsWith('4') || w.startsWith('5')) {
    return { country: 'Estados Unidos', code: 'US', flag: '🇺🇸', isDomestic: false };
  }
  // Sweden: YS, YV
  if (w.startsWith('YS') || w.startsWith('YV')) {
    return { country: 'Suecia', code: 'SE', flag: '🇸🇪', isDomestic: false };
  }
  // Turkey: NL, NM
  if (w.startsWith('NL') || w.startsWith('NM')) {
    return { country: 'Turquía', code: 'TR', flag: '🇹🇷', isDomestic: false };
  }

  return { country: 'Otros Países (UE/Global)', code: 'GL', flag: '🌍', isDomestic: false };
}

export function computeOriginCountries(records: DgtRecord[]): OriginCountryStat[] {
  const total = records.length;
  if (total === 0) return [];

  const countryMap: Record<string, {
    country: string;
    code: string;
    flag: string;
    isDomestic: boolean;
    total: number;
    brandsMap: Record<string, number>;
  }> = {};

  for (const r of records) {
    const meta = resolveOriginCountry(r.wmi);
    if (!countryMap[meta.country]) {
      countryMap[meta.country] = {
        ...meta,
        total: 0,
        brandsMap: {}
      };
    }
    const c = countryMap[meta.country];
    c.total++;
    const brand = r.marca ? r.marca.toUpperCase().trim() : 'OTRO';
    c.brandsMap[brand] = (c.brandsMap[brand] || 0) + 1;
  }

  return Object.values(countryMap)
    .map(c => {
      const topBrands = Object.entries(c.brandsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(b => b[0]);

      return {
        country: c.country,
        code: c.code,
        flag: c.flag,
        total: c.total,
        percentage: parseFloat(((c.total / total) * 100).toFixed(1)),
        isDomestic: c.isDomestic,
        topBrands
      };
    })
    .sort((a, b) => b.total - a.total);
}

// -------------------------------------------------------------
// BODY TYPES // AF (SUV), AB (HATCHBACK), AA (SEDAN), ETC.
// -------------------------------------------------------------
const BODY_TYPE_LABELS: Record<string, { label: string; category: string }> = {
  'AF': { label: 'SUV / Crossover / Multiuso', category: 'SUV & Crossover' },
  'AB': { label: 'Dos Volúmenes / Compacto', category: 'Hatchback / Utilitario' },
  'AC': { label: 'Familiar / Station Wagon', category: 'Familiar' },
  'AA': { label: 'Tres Volúmenes / Berlina', category: 'Sedán' },
  'AD': { label: 'Coupé Deportivo', category: 'Deportivo' },
  'AE': { label: 'Descapotable / Cabriolet', category: 'Cabrio' },
  'BB': { label: 'Furgón / Comercial Ligero', category: 'Comercial' },
  'BC': { label: 'Furgoneta Mixta Adaptable', category: 'Comercial' },
  'SA': { label: 'Autocaravana / Camper', category: 'Ocio' },
  'ND': { label: 'Sin Especificar / Chasis Cabina', category: 'Otros' }
};

export function computeBodyTypes(records: DgtRecord[]): BodyTypeStat[] {
  const total = records.length;
  if (total === 0) return [];

  const map: Record<string, { count: number; sumKw: number; sumTara: number; validKw: number; validTara: number }> = {};

  for (const r of records) {
    const rawCode = (r.carroceria || 'ND').toUpperCase().trim();
    const code = BODY_TYPE_LABELS[rawCode] ? rawCode : 'ND';

    if (!map[code]) {
      map[code] = { count: 0, sumKw: 0, sumTara: 0, validKw: 0, validTara: 0 };
    }
    const item = map[code];
    item.count++;
    if (r.potenciaKw > 0) {
      item.sumKw += r.potenciaKw;
      item.validKw++;
    }
    if (r.tara > 0) {
      item.sumTara += r.tara;
      item.validTara++;
    }
  }

  return Object.entries(map)
    .map(([code, d]) => {
      const meta = BODY_TYPE_LABELS[code] || { label: `Carrocería ${code}`, category: 'Otros' };
      return {
        code,
        label: meta.label,
        category: meta.category,
        total: d.count,
        percentage: parseFloat(((d.count / total) * 100).toFixed(1)),
        avgKw: d.validKw > 0 ? Math.round(d.sumKw / d.validKw) : 100,
        avgTara: d.validTara > 0 ? Math.round(d.sumTara / d.validTara) : 1400
      };
    })
    .sort((a, b) => b.total - a.total);
}

// -------------------------------------------------------------
// WEIGHT TO POWER RATIO // KG / CV DYNAMICS
// -------------------------------------------------------------
export function computeWeightPowerBrackets(records: DgtRecord[]): WeightPowerBracket[] {
  const brackets: WeightPowerBracket[] = [
    { range: '< 6 kg/CV', label: 'Superdeportivo / Alto Rendimiento', minRatio: 0, maxRatio: 6, count: 0, percentage: 0, color: '#FF5500' },
    { range: '6 - 8.9 kg/CV', label: 'Dinámico / Deportivo', minRatio: 6, maxRatio: 9, count: 0, percentage: 0, color: '#F97316' },
    { range: '9 - 11.9 kg/CV', label: 'Gama Media / Turismo Estándar', minRatio: 9, maxRatio: 12, count: 0, percentage: 0, color: '#38BDF8' },
    { range: '12 - 14.9 kg/CV', label: 'Utilitario / Urbano Eficiente', minRatio: 12, maxRatio: 15, count: 0, percentage: 0, color: '#10B981' },
    { range: '≥ 15 kg/CV', label: 'Vehículo Pesado / Baja Potencia', minRatio: 15, maxRatio: 9999, count: 0, percentage: 0, color: '#A855F7' }
  ];

  let validCount = 0;
  for (const r of records) {
    if (r.potenciaCv > 0 && r.tara > 0) {
      const ratio = r.tara / r.potenciaCv;
      validCount++;
      for (const b of brackets) {
        if (ratio >= b.minRatio && ratio < b.maxRatio) {
          b.count++;
          break;
        }
      }
    }
  }

  return brackets.map(b => ({
    ...b,
    percentage: validCount > 0 ? parseFloat(((b.count / validCount) * 100).toFixed(1)) : 0
  }));
}

// -------------------------------------------------------------
// MUNICIPALITY STATS // FLEET & IVTM HAVENS
// -------------------------------------------------------------
export const FLEET_HUBS: Record<string, string> = {
  'ALCOBENDAS': 'Sede neurálgica de empresas multinacionales de renting (Arval, LeasePlan) y grandes corporaciones.',
  'MAJADAHONDA': 'Sede de flotas de renting y servicios financieros de automoción.',
  'MORALZARZAL': 'Municipio de la Sierra de Madrid con IVTM bonificado y alta concentración de vehículos de flota.',
  'VENTURADA': 'Municipio de Madrid con tasa mínima de IVTM legal. Foco masivo de domiciliación de vehículos de renting.',
  'ROBLEDO DE CHAVELA': 'Histórico municipio bonificado para matriculación de vehículos de empresa y renting.',
  'BRUNETE': 'Municipio madrileño con condiciones tributarias favorables para flotas de empresas.',
  'NAVACERRADA': 'Enclave de domiciliación de vehículos corporativos y flotas de renting.',
  'ROZAS DE PUERTO REAL': 'Población <600 hab. con miles de vehículos matriculados por cuota mínima de IVTM.',
  'AGUILAR DE CAMPOO': 'Hub de domiciliación en Palencia para flotas de transporte e industriales.',
  'COLMENAR VIEJO': 'Importante sede de empresas de vehículos comerciales y renting.',
  'POZUELO DE ALARCÓN': 'Mayor renta per cápita de España y alta densidad de vehículos de alta gama y directivos.',
  'LAS ROZAS': 'Sede de empresas tecnológicas y flotas ejecutivas.',
  'PATONES': 'Municipio de la Sierra Norte de Madrid (<600 hab.) con cuota mínima legal de IVTM (foco masivo de renting).',
  'COLLADO MEDIANO': 'Municipio madrileño con bonificaciones fiscales para flotas de empresa.',
  'FINESTRAT': 'Enclave en Alicante con alta actividad de rent-a-car y flotas turísticas.',
  'BOADILLA DEL MONTE': 'Gran concentración de sedes financieras de corporaciones y directivos.'
};

export function computeMunicipalityStats(records: DgtRecord[], limit: number = 20): MunicipalityStat[] {
  const total = records.length;
  if (total === 0) return [];

  const map: Record<string, { total: number; provincia: string }> = {};

  for (const r of records) {
    const rawMuni = (r.municipio || '').toUpperCase().trim();
    if (!rawMuni || rawMuni === 'CAPITAL' || rawMuni === 'ND') continue;

    if (!map[rawMuni]) {
      map[rawMuni] = {
        total: 0,
        provincia: r.provinciaNombre || 'Madrid'
      };
    }
    map[rawMuni].total++;
  }

  return Object.entries(map)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, limit)
    .map(([municipio, data]) => {
      const isFleetHub = Boolean(FLEET_HUBS[municipio]);
      return {
        municipio,
        provincia: data.provincia,
        total: data.total,
        percentage: parseFloat(((data.total / total) * 100).toFixed(1)),
        isFleetHub,
        fleetHubReason: FLEET_HUBS[municipio]
      };
    });
}
