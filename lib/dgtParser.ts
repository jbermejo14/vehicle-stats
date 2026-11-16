import { DgtRecord, EtiquetaDgt, TipoPropulsion, TramoIedmt } from './dgtTypes';
import { getProvinceByPostalCode } from './spainProvinces';
import { deduceDgtBadge } from './dgtBadge';

export interface ParseResult {
  records: DgtRecord[];
  totalLines: number;
  parsedCount: number;
  skippedCount: number;
  errors: string[];
  executionTimeMs: number;
}

/**
 * Normalizes DGT Euro emissions standard codes
 */
export function normalizeEuroNorm(raw: string): string {
  const clean = raw.trim().toUpperCase();
  if (!clean || clean === '0' || clean === 'ND') return 'Euro 6d';
  if (clean.includes('=6EB') || clean.includes('6EB') || clean.includes('6E-BIS')) return 'Euro 6e-bis';
  if (clean.includes('=6EA') || clean.includes('6EA') || clean.includes('6E')) return 'Euro 6e';
  if (clean.includes('6D')) return 'Euro 6d';
  if (clean.includes('6C')) return 'Euro 6c';
  if (clean.includes('6B')) return 'Euro 6b';
  if (clean.includes('6W')) return 'Euro 6d-TEMP';
  if (clean.includes('EURO 6')) return 'Euro 6';
  if (clean.includes('EURO 5') || clean.includes('=5+') || clean.includes('5+')) return 'Euro 5';
  if (clean.includes('EURO 4')) return 'Euro 4';
  if (clean.includes('EURO 3')) return 'Euro 3';
  return clean.replace(/^0=/, 'Euro ').replace(/^0/, '');
}

/**
 * Infers propulsion type from DGT propulsion code, hybrid indicator and model name
 */
export function inferPropulsion(
  propCode: string,
  hibridoInd: string,
  modelName: string,
  co2: number,
  euroNorm?: string,
  fecMatRaw?: string
): { propulsion: TipoPropulsion; etiqueta: EtiquetaDgt } {
  const hib = hibridoInd.toUpperCase().trim();
  const pCode = propCode.trim();
  const modelUpper = modelName.toUpperCase();

  // 1. Pure Electric (BEV) or Range Extended (REEV)
  if (
    hib === 'BEV' || 
    hib === 'REE' ||
    pCode.startsWith('03') || 
    pCode === '03' || 
    modelUpper.includes('BEV') || 
    modelUpper.includes('ELECTRIC') ||
    modelUpper.includes('EV ') ||
    (co2 === 0 && (modelUpper.includes('TESLA') || modelUpper.includes('SEAL') || modelUpper.includes('ATTO') || modelUpper.includes('ID.4') || modelUpper.includes('ID.3')))
  ) {
    return { propulsion: 'Eléctrico Puro (BEV)', etiqueta: '0 CERO' };
  }

  // 2. Plug-in Hybrid (PHEV)
  if (
    hib.startsWith('PHE') || 
    pCode.startsWith('31') || 
    pCode.startsWith('32') ||
    modelUpper.includes('PHEV') || 
    modelUpper.includes('PLUG-IN') || 
    (co2 > 0 && co2 <= 50 && hib.includes('HEV'))
  ) {
    return { propulsion: 'Híbrido Enchufable (PHEV)', etiqueta: '0 CERO' };
  }

  // 3. Conventional Hybrid (HEV) / Microhybrid (MHEV)
  if (
    hib === 'HEV' || 
    hib === 'MHE' || 
    hib === 'MHEV' || 
    pCode.startsWith('11') || 
    pCode.startsWith('12') ||
    modelUpper.includes('HEV') || 
    modelUpper.includes('HYBRID') || 
    modelUpper.includes('MHEV')
  ) {
    return { propulsion: 'Híbrido (HEV)', etiqueta: 'ECO' };
  }

  // 4. Gas (GLP / GNC / Bifuel)
  if (
    pCode.startsWith('21') ||
    pCode.includes('GLP') || 
    pCode.includes('GNC') || 
    modelUpper.includes('ECO-G') || 
    modelUpper.includes('GLP') || 
    modelUpper.includes('GNC') || 
    modelUpper.includes('TGI')
  ) {
    return { propulsion: 'GLP / GNC', etiqueta: 'ECO' };
  }

  // 5. Diesel (Gasóleo A, B agrícola, o C)
  if (
    pCode.startsWith('02') || 
    pCode.startsWith('04') || 
    pCode.startsWith('05') || 
    pCode === '02' || 
    modelUpper.includes('TDI') || 
    modelUpper.includes('DCI') || 
    modelUpper.includes('CRDI') || 
    modelUpper.includes('HDI') || 
    modelUpper.includes('CDI') || 
    modelUpper.includes('DIESEL')
  ) {
    const badgeResult = deduceDgtBadge({
      propulsionCode: pCode,
      hybridIndicator: hib,
      euroNorm,
      registrationDate: fecMatRaw,
      modelName,
      co2
    });
    return { propulsion: 'Diésel', etiqueta: badgeResult.badge };
  }

  // 6. Default: Gasolina
  const badgeResult = deduceDgtBadge({
    propulsionCode: pCode,
    hybridIndicator: hib,
    euroNorm,
    registrationDate: fecMatRaw,
    modelName,
    co2
  });
  return { propulsion: 'Gasolina', etiqueta: badgeResult.badge };
}

/**
 * Calculates IEDMT tax bracket based on Spanish Tax Law (Ley 38/1992 de Impuestos Especiales)
 */
export function calculateTramoIedmt(co2: number): TramoIedmt {
  if (co2 <= 120) return 'Exento (0%)';
  if (co2 < 160) return 'Tramo 1 (4,75%)';
  if (co2 < 200) return 'Tramo 2 (9,75%)';
  return 'Tramo 3 (14,75%)';
}

/**
 * Categorizes vehicle type code into human friendly label
 */
export function categorizeVehicle(tipoCod: string, catItv: string): 'Turismo' | 'Motocicleta' | 'Ciclomotor' | 'Comercial' | 'Industrial' | 'Otro' {
  const cat = catItv.trim().toUpperCase();
  const tipo = tipoCod.trim();

  if (cat.startsWith('M1') || tipo === '400' || tipo === '401' || tipo === '402' || tipo === '40') {
    return 'Turismo';
  }
  if (cat.startsWith('L3') || cat.startsWith('L4') || tipo === '500' || tipo === '501' || tipo === '*05' || tipo === '50') {
    return 'Motocicleta';
  }
  if (cat.startsWith('L1') || cat.startsWith('L2') || tipo === '900' || tipo === '*02' || tipo === '90') {
    return 'Ciclomotor';
  }
  if (cat.startsWith('N1') || tipo === '251' || tipo === '250' || tipo === '240' || tipo === '20') {
    return 'Comercial';
  }
  if (cat.startsWith('N2') || cat.startsWith('N3') || cat.startsWith('M2') || cat.startsWith('M3') || tipo === '30') {
    return 'Industrial';
  }
  return 'Otro';
}

/**
 * Formats DDMMYYYY string to ISO YYYY-MM-DD and display DD/MM/YYYY
 */
export function formatDgtDate(raw: string): { display: string; iso: string } {
  if (!raw || raw.length < 8) {
    const today = new Date().toISOString().split('T')[0];
    return { display: today, iso: today };
  }
  const day = raw.substring(0, 2);
  const month = raw.substring(2, 4);
  const year = raw.substring(4, 8);
  return {
    display: `${day}/${month}/${year}`,
    iso: `${year}-${month}-${day}`
  };
}

/**
 * Parses a single fixed-width DGT MATRABA line (714 chars)
 * Official field offsets per DGT MATRICULACIONES_MATRABA specification.
 */
export function parseDgtLine(line: string, index: number, onLogUnparsed?: (msg: string) => void): DgtRecord | null {
  if (!line || line.trim().length < 80) {
    if (onLogUnparsed && line && line.trim().length > 0) {
      onLogUnparsed(`Línea ${index}: Longitud insuficiente (${line.trim().length} caracteres)`);
    }
    return null;
  }
  // Ignore header line (e.g. "Vehículos matriculados...")
  if (line.includes('Vehículos') || line.includes('Vehculos') || line.includes('Letras de la serie')) {
    return null;
  }

  try {
    const fecMatRaw = line.substring(0, 8).trim();
    if (!fecMatRaw || fecMatRaw.length < 8 || isNaN(Number(fecMatRaw))) {
      if (onLogUnparsed) onLogUnparsed(`Línea ${index}: Fecha de matrícula inválida '${fecMatRaw}'`);
      return null;
    }

    const claseMatricula = line.substring(8, 9).trim() || '0';
    const marca = line.substring(17, 47).trim();
    const modelo = line.substring(47, 69).trim();
    const vinParcial = line.substring(70, 91).trim();
    const wmi = vinParcial.substring(0, 3).toUpperCase();
    const tipoVehiculoCod = line.substring(91, 94).trim();
    
    // Numeric metrics
    const cc = parseInt(line.substring(94, 100).trim(), 10) || 0;
    const cvf = parseFloat(line.substring(100, 106).trim()) || 0;
    
    // Municipality & Postal code
    let municipioRaw = line.substring(125, 149).trim();
    municipioRaw = municipioRaw.replace(/^\d{3,5}/, '').trim();
    const cp = line.substring(165, 170).trim();
    
    const provMeta = getProvinceByPostalCode(cp);
    const provinciaCod = provMeta ? provMeta.code : (cp.length >= 2 ? cp.substring(0, 2) : '28');
    const provinciaNombre = provMeta ? provMeta.name : 'No asignada';
    const comunidadAutonoma = provMeta ? provMeta.community : 'España';

    // New or Used indicator (position 178..179)
    const indNuevoUsado = line.length > 178 ? line.substring(178, 179).trim().toUpperCase() : 'N';

    // Power & emissions
    const kw = parseFloat(line.substring(225, 234).trim()) || 0;
    const cv = Math.round(kw * 1.35962);

    // CO2
    const co2Raw = line.substring(238, 243).trim().replace(/[^0-9]/g, '');
    const co2 = parseInt(co2Raw, 10) || 0;

    const fabricante = line.substring(344, 414).trim();
    const tara = parseInt(line.substring(414, 422).trim(), 10) || 0;
    const mma = parseInt(line.substring(422, 426).trim(), 10) || 0;
    const categoria = line.substring(426, 430).trim();
    const carroceria = line.substring(430, 434).trim();
    const euroNormRaw = line.substring(436, 447).trim();
    const normativaEuro = normalizeEuroNorm(euroNormRaw);

    const propCode = line.substring(448, 453).trim();
    const hibridoInd = line.substring(453, 456).trim();

    const { propulsion, etiqueta } = inferPropulsion(propCode, hibridoInd, modelo, co2, normativaEuro, fecMatRaw);
    const tramoIedmt = calculateTramoIedmt(co2);
    const categoriaLabel = categorizeVehicle(tipoVehiculoCod, categoria);
    const dateInfo = formatDgtDate(fecMatRaw);

    const batalla = parseInt(line.substring(638, 642).trim(), 10) || 0;
    const viaDelantera = parseInt(line.substring(642, 646).trim(), 10) || 0;
    const viaTrasera = parseInt(line.substring(646, 650).trim(), 10) || 0;

    // Tipo de trámite:
    // - Si IND_NUEVO_USADO == 'U': Rematriculación / Vehículo usado importado
    // - Si COD_CLASE_MAT == '6': Ciclomotor
    // - Si COD_CLASE_MAT == '7': Transporte temporal
    // - Si COD_CLASE_MAT == '0' y IND_NUEVO_USADO == 'N': Nueva matriculación ordinaria
    let tipoTramite: 'Nueva' | 'Transferencia' | 'Ciclomotor' | 'Otro' = 'Nueva';
    if (indNuevoUsado === 'U') {
      tipoTramite = 'Transferencia'; // Usado / rematriculado
    } else if (claseMatricula === '6') {
      tipoTramite = 'Ciclomotor';
    } else if (claseMatricula === '7') {
      tipoTramite = 'Otro';
    }

    return {
      id: `dgt-${index}-${vinParcial.slice(0, 6)}`,
      fecMatricula: dateInfo.display,
      fecMatriculaDate: dateInfo.iso,
      claseMatricula,
      tipoTramite,
      marca: marca || 'GENÉRICO',
      modelo: modelo || 'DESCONOCIDO',
      vinParcial,
      wmi,
      tipoVehiculoCod,
      categoria: categoria || 'M1',
      categoriaLabel,
      carroceria,
      cilindrada: cc,
      potenciaFiscal: cvf,
      potenciaKw: kw,
      potenciaCv: cv,
      tara,
      mma,
      plazas: 5,
      municipio: municipioRaw || 'Capital',
      municipioIne: '',
      codigoPostal: cp,
      provinciaCod,
      provinciaNombre,
      comunidadAutonoma,
      emisionesCo2: co2,
      normativaEuro,
      tramoIedmt,
      propulsionCod: propCode,
      hibridoInd,
      propulsion,
      etiquetaDgt: etiqueta,
      batalla,
      viaDelantera,
      viaTrasera,
      fabricante: fabricante || marca
    };
  } catch (err: any) {
    if (onLogUnparsed) onLogUnparsed(`Línea ${index}: Error al interpretar registro: ${err?.message || err}`);
    return null;
  }
}

/**
 * Parses full string content of a DGT fixed width file
 */
export function parseDgtContent(
  text: string, 
  maxLines: number = 20000, 
  onProgress?: (progress: number) => void
): ParseResult {
  const startTime = performance.now();
  const lines = text.split(/\r?\n/);
  const totalLines = lines.length;
  const records: DgtRecord[] = [];
  const errors: string[] = [];
  let skippedCount = 0;

  const limit = Math.min(totalLines, maxLines);

  for (let i = 0; i < limit; i++) {
    const line = lines[i];
    if (!line || line.trim().length === 0) {
      skippedCount++;
      continue;
    }

    const record = parseDgtLine(line, i, (msg) => errors.push(msg));
    if (record) {
      records.push(record);
    } else {
      skippedCount++;
    }

    if (onProgress && i % 2000 === 0) {
      onProgress(Math.round((i / limit) * 100));
    }
  }

  const endTime = performance.now();

  return {
    records,
    totalLines,
    parsedCount: records.length,
    skippedCount,
    errors,
    executionTimeMs: Math.round(endTime - startTime)
  };
}

/**
 * Decode file buffer handling ISO-8859-1 (Latin-1) and UTF-8
 */
export function decodeDgtBuffer(buffer: ArrayBuffer): string {
  try {
    const latinDecoder = new TextDecoder('iso-8859-1');
    return latinDecoder.decode(buffer);
  } catch {
    const utf8Decoder = new TextDecoder('utf-8');
    return utf8Decoder.decode(buffer);
  }
}
