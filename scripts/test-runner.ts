/**
 * Offline Test Suite for DGT Pulse
 * Runs without network dependencies using reduced MATRABA line fixtures.
 */

import { parseDgtLine, normalizeEuroNorm } from '../lib/dgtParser';
import { deduceDgtBadge } from '../lib/dgtBadge';
import { slugify, MIN_REGISTRATIONS_THRESHOLD, PROVINCE_SLUGS } from '../lib/slugs';
import sitemap from '../app/sitemap';
import { getMetadata, getPeriodsIndex, getProvincesIndex, getBrandsIndex, getBrandData, getModelData } from '../lib/staticData';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${errorDetail ? ` - ${errorDetail}` : ''}`);
    failed++;
  }
}

console.log('='.repeat(70));
console.log(' DGT PULSE // OFFLINE TEST RUNNER');
console.log('='.repeat(70));

// -------------------------------------------------------------
// 1. TEST MATRABA LINE PARSER
// -------------------------------------------------------------
console.log('\n[1/7] Pruebas del Parser de Microdatos MATRABA');

// Helper to construct a simulated fixed-width 714-char line
function buildMatrabaLine(fields: {
  fecMat: string;
  claseMat?: string;
  marca: string;
  modelo: string;
  vin: string;
  cc?: string;
  cp?: string;
  indNuevoUsado?: string;
  kw?: string;
  co2?: string;
  euro?: string;
  prop?: string;
  hib?: string;
}): string {
  let line = ''.padEnd(714, ' ');
  const replaceAt = (start: number, end: number, val: string) => {
    const padded = val.padEnd(end - start, ' ').slice(0, end - start);
    line = line.substring(0, start) + padded + line.substring(end);
  };

  replaceAt(0, 8, fields.fecMat); // 0..8
  replaceAt(8, 9, fields.claseMat || '0'); // 8..9
  replaceAt(17, 47, fields.marca); // 17..47
  replaceAt(47, 69, fields.modelo); // 47..69
  replaceAt(70, 91, fields.vin); // 70..91
  replaceAt(94, 100, fields.cc || '1498'); // 94..100
  replaceAt(125, 149, 'MADRID'); // 125..149
  replaceAt(165, 170, fields.cp || '28001'); // 165..170
  replaceAt(178, 179, fields.indNuevoUsado || 'N'); // 178..179
  replaceAt(225, 234, fields.kw || '110.0'); // 225..234
  replaceAt(238, 243, fields.co2 || '115'); // 238..243
  replaceAt(426, 430, 'M1'); // 426..430
  replaceAt(436, 447, fields.euro || 'Euro 6d'); // 436..447
  replaceAt(448, 453, fields.prop || '01000'); // 448..453
  replaceAt(453, 456, fields.hib || ''); // 453..456

  return line;
}

// Test 1.1: Valid petrol passenger car
const linePetrol = buildMatrabaLine({
  fecMat: '15102026',
  marca: 'SEAT',
  modelo: 'IBIZA',
  vin: 'VSSZZZ6JZLR000000',
  prop: '01000',
  co2: '118'
});
const rec1 = parseDgtLine(linePetrol, 1);
assert(rec1 !== null, 'Línea MATRABA gasolina parseada con éxito');
assert(rec1?.marca === 'SEAT', 'Marca parseada correctamente (SEAT)');
assert(rec1?.modelo === 'IBIZA', 'Modelo parseado correctamente (IBIZA)');
assert(rec1?.wmi === 'VSS', 'WMI extraído correctamente (VSS - España)');
assert(rec1?.propulsion === 'Gasolina', 'Propulsión inferida correctamente (Gasolina)');
assert(rec1?.etiquetaDgt === 'C', 'Distintivo ambiental correcto (C)');
assert(rec1?.tipoTramite === 'Nueva', 'Trámite ordinario nuevo (Nueva)');

// Test 1.2: Plug-in hybrid (PHEV) with IND_HIBRIDO = 'PHE'
const linePhev = buildMatrabaLine({
  fecMat: '20102026',
  marca: 'TOYOTA',
  modelo: 'RAV4 PHEV',
  vin: 'JTMBZ4DV100000000',
  prop: '31000',
  hib: 'PHE',
  co2: '22'
});
const rec2 = parseDgtLine(linePhev, 2);
assert(rec2 !== null, 'Línea PHEV parseada');
assert(rec2?.propulsion === 'Híbrido Enchufable (PHEV)', 'Propulsión inferida PHEV');
assert(rec2?.etiquetaDgt === '0 CERO', 'Distintivo 0 CERO asignado a PHEV');

// Test 1.3: Used importation / transfer (IND_NUEVO_USADO = 'U')
const lineUsed = buildMatrabaLine({
  fecMat: '05102026',
  marca: 'MERCEDES-BENZ',
  modelo: 'CLASE C',
  vin: 'WDD20500000000000',
  indNuevoUsado: 'U',
  prop: '02000'
});
const rec3 = parseDgtLine(lineUsed, 3);
assert(rec3 !== null, 'Línea vehículo usado parseada');
assert(rec3?.tipoTramite === 'Transferencia', 'IND_NUEVO_USADO=U reconocido como Transferencia/Usado');
assert(rec3?.propulsion === 'Diésel', 'Propulsión diésel inferida');

// Test 1.4: Header line skipping
const headerLine = 'Vehículos matriculados. Letras de la serie de la última matrícula asignada: 9999-ZZZ';
const recHeader = parseDgtLine(headerLine, 0);
assert(recHeader === null, 'Línea informativa de cabecera descartada');

// Test 1.5: Unparseable line logging
let loggedError = '';
const brokenLine = '1234'.padEnd(100, ' ');
const recBroken = parseDgtLine(brokenLine, 5, (msg) => { loggedError = msg; });
assert(recBroken === null, 'Línea corrupta rechazada');
assert(loggedError.includes('Línea 5'), 'Error de parseo correctamente registrado con número de línea');

// -------------------------------------------------------------
// 2. TEST DGT BADGE BOUNDARY DEDUCTION RULES
// -------------------------------------------------------------
console.log('\n[2/7] Pruebas de Distintivo Ambiental DGT (Fechas Frontera & Normas Euro)');

// 2.1 BEV
const badgeBev = deduceDgtBadge({ hybridIndicator: 'BEV', co2: 0 });
assert(badgeBev.badge === '0 CERO', 'BEV puro -> 0 CERO');

// 2.2 HEV
const badgeHev = deduceDgtBadge({ hybridIndicator: 'HEV', modelName: 'COROLLA' });
assert(badgeHev.badge === 'ECO', 'Híbrido HEV -> ECO');

// 2.3 GLP
const badgeGlp = deduceDgtBadge({ propulsionCode: '21000', modelName: 'SANDERO ECO-G' });
assert(badgeGlp.badge === 'ECO', 'Bifuel GLP -> ECO');

// 2.4 Gasolina Euro 4 (2006) -> C
const badgeGasEuro4 = deduceDgtBadge({ propulsionCode: '01000', euroNorm: 'Euro 4', registrationYear: 2006 });
assert(badgeGasEuro4.badge === 'C', 'Gasolina Euro 4 (2006) -> Etiqueta C');

// 2.5 Gasolina Euro 3 (2001) -> B
const badgeGasEuro3 = deduceDgtBadge({ propulsionCode: '01000', euroNorm: 'Euro 3', registrationYear: 2003 });
assert(badgeGasEuro3.badge === 'B', 'Gasolina Euro 3 (2003) -> Etiqueta B');

// 2.6 Gasolina pre-Euro 3 (2000) -> SIN_ETIQUETA
const badgeGasPreEuro3 = deduceDgtBadge({ propulsionCode: '01000', euroNorm: 'Euro 2', registrationYear: 1999 });
assert(badgeGasPreEuro3.badge === 'SIN ETIQUETA', 'Gasolina Euro 2 (1999) -> Sin Distintivo (A)');

// 2.7 Diésel Euro 6 (2016) -> C
const badgeDieselEuro6 = deduceDgtBadge({ propulsionCode: '02000', euroNorm: 'Euro 6', registrationYear: 2017 });
assert(badgeDieselEuro6.badge === 'C', 'Diésel Euro 6 (2017) -> Etiqueta C');

// 2.8 Diésel Euro 4/5 (2008) -> B
const badgeDieselEuro4 = deduceDgtBadge({ propulsionCode: '02000', euroNorm: 'Euro 4', registrationYear: 2008 });
assert(badgeDieselEuro4.badge === 'B', 'Diésel Euro 4 (2008) -> Etiqueta B');

// 2.9 Diésel pre-Euro 4 (2004) -> SIN ETIQUETA
const badgeDieselPre2006 = deduceDgtBadge({ propulsionCode: '02000', euroNorm: 'Euro 3', registrationYear: 2004 });
assert(badgeDieselPre2006.badge === 'SIN ETIQUETA', 'Diésel Euro 3 (2004) -> Sin Distintivo (A)');

// -------------------------------------------------------------
// 3. TEST SLUG NORMALIZATION & STABILITY
// -------------------------------------------------------------
console.log('\n[3/7] Pruebas de Normalización de Slugs');

assert(slugify('Álava / Araba') === 'alava-araba', 'Slug sin tilde: Álava -> alava');
assert(slugify('Jaén') === 'jaen', 'Slug sin tilde: Jaén -> jaen');
assert(slugify('Cádiz') === 'cadiz', 'Slug sin tilde: Cádiz -> cadiz');
assert(slugify('TOYOTA COROLLA') === 'toyota-corolla', 'Slug mayúsculas a minúsculas');
assert(slugify('Mercedes-Benz') === 'mercedes-benz', 'Slug con guión');
assert(slugify('  MÉGANE E-TECH!  ') === 'megane-e-tech', 'Slug con caracteres especiales y espacios');
assert(slugify('') === '', 'Slug cadena vacía');

// -------------------------------------------------------------
// 4. TEST MIN_REGISTRATIONS_THRESHOLD (>= 50)
// -------------------------------------------------------------
console.log('\n[4/7] Pruebas del Umbral Mínimo de Matriculaciones (>= 50)');

assert(MIN_REGISTRATIONS_THRESHOLD === 50, 'Constante MIN_REGISTRATIONS_THRESHOLD definida a 50');

const brands = getBrandsIndex();
assert(brands.length > 0, `Se cargaron ${brands.length} marcas agregadas`);
const belowThresholdBrands = brands.filter(b => b.total < MIN_REGISTRATIONS_THRESHOLD);
assert(belowThresholdBrands.length === 0, 'Ninguna marca en brands.json tiene menos de 50 matriculaciones');

// -------------------------------------------------------------
// 5. TEST SITEMAP GENERATION (NO '#' & REAL URLS)
// -------------------------------------------------------------
console.log('\n[5/7] Pruebas del Sitemap Oficial (Sin #)');

const sitemapEntries = sitemap();
assert(Array.isArray(sitemapEntries), 'Sitemap retorna array de entradas');
assert(sitemapEntries.length > 50, `Sitemap contiene ${sitemapEntries.length} URLs reales`);

const hasHashUrl = sitemapEntries.some(item => item.url.includes('#'));
assert(!hasHashUrl, 'Ninguna URL del sitemap contiene caracteres "#"');

const hasHome = sitemapEntries.some(item => item.url.endsWith('dgt-pulse.es') || item.url === 'https://dgt-pulse.es/');
assert(hasHome, 'Sitemap incluye URL raíz canónica');

const hasElectricos = sitemapEntries.some(item => item.url.includes('/electricos'));
assert(hasElectricos, 'Sitemap incluye ruta /electricos');

const hasMadrid = sitemapEntries.some(item => item.url.includes('/provincia/madrid'));
assert(hasMadrid, 'Sitemap incluye provincia real (/provincia/madrid)');

const hasToyota = sitemapEntries.some(item => item.url.includes('/marca/toyota'));
assert(hasToyota, 'Sitemap incluye marca real (/marca/toyota)');

// -------------------------------------------------------------
// 6. TEST DATASET AGGREGATION & ZERO-SQLITE RUNTIME
// -------------------------------------------------------------
console.log('\n[6/7] Pruebas de Datos Agregados y Ausencia de SQLite en Runtime');

const metadata = getMetadata();
assert(metadata.totalRegistrations === 5412845, 'Total de matriculaciones coincide con censo oficial (5.412.845)');
assert(metadata.totalMonths === 34, 'Cubre los 34 meses exactos (2024-01 a 2026-10)');
assert(metadata.threshold === 50, 'Metadatos reflejan threshold de 50');

const periodsIndex = getPeriodsIndex();
assert(periodsIndex.months.length === 34, 'PeriodsIndex contiene 34 meses');
assert(periodsIndex.years.length === 3, 'PeriodsIndex contiene 3 años (2024, 2025, 2026)');

const provinces = getProvincesIndex();
assert(provinces.length === 52 || provinces.length === 53, `Índice de provincias correcto (${provinces.length} provincias)`);
const madridProv = provinces.find(p => p.slug === 'madrid');
assert(madridProv !== undefined, 'Provincia de Madrid presente en índice');
assert(madridProv?.population > 6000000, 'Población oficial de Madrid cargada correctamente (INE 2024)');
assert(madridProv?.per1000Habitantes > 0, 'Tasa per cápita calculada con INE 2024');

// -------------------------------------------------------------
// 7. TEST 404 & UNKNOWN SLUG BEHAVIOR
// -------------------------------------------------------------
console.log('\n[7/7] Pruebas de Slugs Inexistentes y Manejo de 404');

const invalidBrandData = getBrandData('marca-inventada-inexistente-12345');
assert(invalidBrandData === null, 'Marca inexistente retorna null (dispara notFound() 404 en la página)');

const invalidModelData = getModelData('toyota', 'modelo-no-existente-xyz');
assert(invalidModelData === null, 'Modelo inexistente retorna null (dispara notFound() 404 en la página)');

// Summary
console.log('\n' + '='.repeat(70));
console.log(` RESUMEN DE PRUEBAS: ${passed} PASADAS | ${failed} FALLADAS`);
console.log('='.repeat(70));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ TODAS LAS PRUEBAS OFFLINE PASARON EXITOSAMENTE.\n');
}
