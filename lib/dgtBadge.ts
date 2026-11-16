/**
 * DGT Environmental Badge Engine
 * 
 * Normativa oficial española para la clasificación ambiental de vehículos:
 * - Resolución de 13 de abril de 2016 de la Dirección General de Tráfico (BOE núm. 96, de 21 de abril de 2016).
 * - Resolución de 8 de enero de 2018 de la Dirección General de Tráfico (BOE núm. 18, de 20 de enero de 2018).
 * - Plan Nacional de Calidad del Aire y Protección de la Atmósfera (Plan AIRE).
 */

export type DgtBadgeType = '0 CERO' | 'ECO' | 'C' | 'B' | 'SIN ETIQUETA';

export interface VehicleBadgeInput {
  propulsionCode?: string;
  hybridIndicator?: string;
  euroNorm?: string;
  registrationYear?: number;
  registrationDate?: string;
  electricRangeKm?: number;
  modelName?: string;
  co2?: number;
}

export interface BadgeDeductionResult {
  badge: DgtBadgeType;
  label: string;
  color: string;
  reason: string;
}

/**
 * Deduce con exactitud el distintivo ambiental DGT según el diseño MATRABA y normativa BOE.
 */
export function deduceDgtBadge(vehicle: VehicleBadgeInput): BadgeDeductionResult {
  const pCode = (vehicle.propulsionCode || '').trim();
  const hib = (vehicle.hybridIndicator || '').toUpperCase().trim();
  const euro = (vehicle.euroNorm || '').toUpperCase().trim();
  const model = (vehicle.modelName || '').toUpperCase();
  const range = vehicle.electricRangeKm ?? 0;
  const co2 = vehicle.co2 ?? 0;

  let year = vehicle.registrationYear;
  if (!year && vehicle.registrationDate) {
    const parts = vehicle.registrationDate.split(/[-/]/);
    if (parts.length === 3) {
      // Check if YYYY-MM-DD or DD/MM/YYYY
      if (parts[0].length === 4) year = parseInt(parts[0], 10);
      else if (parts[2].length === 4) year = parseInt(parts[2], 10);
    }
  }

  // 1. DISTINTIVO 0 CERO EMISIONES
  // - BEV: Eléctrico de batería pura
  // - REEV: Eléctrico de autonomía extendida
  // - PHEV: Híbrido enchufable con autonomía >= 40 km
  // - FCEV: Vehículo de pila de combustible / hidrógeno
  const isBev = 
    hib === 'BEV' || 
    pCode.startsWith('03') ||
    model.includes('BEV') || 
    model.includes('ELECTRIC') ||
    model.includes('EV ') ||
    (co2 === 0 && (model.includes('TESLA') || model.includes('BYD') || model.includes('POLESTAR') || model.includes('IONIQ 5') || model.includes('EV6')));

  const isReev = hib === 'REE' || model.includes('REEV') || model.includes('RANGE EXTENDER');

  const isPhev = 
    hib === 'PHE' || 
    hib === 'PHEV' || 
    pCode.startsWith('31') || 
    pCode.startsWith('32') || 
    model.includes('PHEV') || 
    model.includes('PLUG-IN');

  if (isBev || isReev) {
    return {
      badge: '0 CERO',
      label: 'Cero Emisiones (Azul)',
      color: '#008ece',
      reason: 'Vehículo eléctrico puro (BEV/REEV). 0 g CO2/km.'
    };
  }

  if (isPhev) {
    // Si la autonomía es conocida y menor de 40 km, le corresponde ECO; por defecto los PHEV homologados en España tienen >= 40 km
    if (range > 0 && range < 40) {
      return {
        badge: 'ECO',
        label: 'ECO (Verde/Azul)',
        color: '#00a651',
        reason: 'Híbrido enchufable (PHEV) con autonomía eléctrica oficial menor a 40 km.'
      };
    }
    return {
      badge: '0 CERO',
      label: 'Cero Emisiones (Azul)',
      color: '#008ece',
      reason: 'Híbrido enchufable (PHEV) con autonomía eléctrica mínima de 40 km.'
    };
  }

  // 2. DISTINTIVO ECO
  // - HEV: Híbridos no enchufables
  // - MHEV: Microhíbridos / Mild-hybrid
  // - GLP / GNC / GNL: Gas licuado de petróleo / Gas natural comprimido
  const isEcoGasOrHybrid = 
    hib === 'HEV' || 
    hib === 'MHE' || 
    hib === 'MHEV' || 
    pCode.startsWith('11') || 
    pCode.startsWith('12') || 
    pCode.startsWith('21') || 
    pCode.includes('GLP') || 
    pCode.includes('GNC') || 
    model.includes('HEV') || 
    model.includes('HYBRID') || 
    model.includes('MHEV') || 
    model.includes('GLP') || 
    model.includes('GNC') || 
    model.includes('ECO-G') ||
    model.includes('TGI');

  if (isEcoGasOrHybrid) {
    return {
      badge: 'ECO',
      label: 'ECO (Verde/Azul)',
      color: '#00a651',
      reason: 'Vehículo híbrido no enchufable (HEV/MHEV) o bifuel gas (GLP/GNC).'
    };
  }

  // 3. COMBUSTIÓN CONVENCIONAL (GASOLINA / DIÉSEL)
  const isDiesel = 
    pCode.startsWith('02') || 
    pCode.startsWith('04') || 
    pCode.startsWith('05') || 
    model.includes('TDI') || 
    model.includes('DCI') || 
    model.includes('CRDI') || 
    model.includes('HDI') || 
    model.includes('CDI') || 
    model.includes('DIESEL');

  const euroNumberMatch = euro.match(/EURO\s*([0-9]+)/i);
  const euroNumber = euroNumberMatch ? parseInt(euroNumberMatch[1], 10) : null;

  // Gasolina
  if (!isDiesel) {
    if (euroNumber !== null) {
      if (euroNumber >= 4) {
        return {
          badge: 'C',
          label: 'C (Verde)',
          color: '#10b981',
          reason: `Turismo gasolina Euro ${euroNumber} (Euro 4 o superior).`
        };
      }
      if (euroNumber === 3) {
        return {
          badge: 'B',
          label: 'B (Amarillo)',
          color: '#eab308',
          reason: 'Turismo gasolina Euro 3 (criterio DGT 2001-2005).'
        };
      }
      return {
        badge: 'SIN ETIQUETA',
        label: 'Sin Distintivo (A)',
        color: '#ef4444',
        reason: `Turismo gasolina anterior a Euro 3 (Euro ${euroNumber}).`
      };
    }

    if (year !== undefined && year !== null) {
      if (year >= 2006) {
        return {
          badge: 'C',
          label: 'C (Verde)',
          color: '#10b981',
          reason: `Turismo gasolina matriculado en ${year} (criterio DGT 2006 en adelante).`
        };
      }
      if (year >= 2001) {
        return {
          badge: 'B',
          label: 'B (Amarillo)',
          color: '#eab308',
          reason: `Turismo gasolina matriculado en ${year} (criterio DGT 2001-2005).`
        };
      }
      return {
        badge: 'SIN ETIQUETA',
        label: 'Sin Distintivo (A)',
        color: '#ef4444',
        reason: `Turismo gasolina matriculado en ${year} (anterior a 2001).`
      };
    }

    // Default gasolina reciente
    return {
      badge: 'C',
      label: 'C (Verde)',
      color: '#10b981',
      reason: 'Turismo gasolina homologación moderna.'
    };
  }

  // Diésel
  if (euroNumber !== null) {
    if (euroNumber >= 6) {
      return {
        badge: 'C',
        label: 'C (Verde)',
        color: '#10b981',
        reason: `Turismo diésel Euro ${euroNumber} (Euro 6).`
      };
    }
    if (euroNumber === 4 || euroNumber === 5) {
      return {
        badge: 'B',
        label: 'B (Amarillo)',
        color: '#eab308',
        reason: `Turismo diésel Euro ${euroNumber} (Euro 4 o Euro 5).`
      };
    }
    return {
      badge: 'SIN ETIQUETA',
      label: 'Sin Distintivo (A)',
      color: '#ef4444',
      reason: `Turismo diésel anterior a Euro 4 (Euro ${euroNumber}).`
    };
  }

  if (year !== undefined && year !== null) {
    if (year >= 2016 || (year === 2015 && vehicle.registrationDate && new Date(vehicle.registrationDate).getMonth() >= 8)) {
      return {
        badge: 'C',
        label: 'C (Verde)',
        color: '#10b981',
        reason: `Turismo diésel matriculado a partir de septiembre 2015 (${year}), normativa Euro 6.`
      };
    }
    if (year >= 2006) {
      return {
        badge: 'B',
        label: 'B (Amarillo)',
        color: '#eab308',
        reason: `Turismo diésel matriculado en ${year} (criterio DGT 2006 a agosto 2015, Euro 4/5).`
      };
    }
    return {
      badge: 'SIN ETIQUETA',
      label: 'Sin Distintivo (A)',
      color: '#ef4444',
      reason: `Turismo diésel matriculado en ${year} (anterior a 2006).`
    };
  }

  // Default diésel reciente
  return {
    badge: 'C',
    label: 'C (Verde)',
    color: '#10b981',
    reason: 'Turismo diésel Euro 6 moderno.'
  };
}
