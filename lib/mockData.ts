import { DgtRecord, EtiquetaDgt, TipoPropulsion, TramoIedmt } from './dgtTypes';
import { SPAIN_PROVINCES } from './spainProvinces';
import { calculateTramoIedmt } from './dgtParser';

export interface VehicleTemplate {
  marca: string;
  modelo: string;
  fabricante: string;
  categoria: string;
  categoriaLabel: 'Turismo' | 'Motocicleta' | 'Ciclomotor' | 'Comercial' | 'Industrial' | 'Otro';
  propulsion: TipoPropulsion;
  etiquetaDgt: EtiquetaDgt;
  cilindrada: number;
  potenciaKw: number;
  co2: number;
  tara: number;
  mma: number;
  batalla: number;
  euro: string;
  wmi: string;
  marketWeight: number; // probability weight
}

export const REAL_2026_TEMPLATES: VehicleTemplate[] = [
  {
    marca: 'DACIA',
    modelo: 'SANDERO STEPWAY ECO-G',
    fabricante: 'RENAULT SAS',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'GLP / GNC',
    etiquetaDgt: 'ECO',
    cilindrada: 999,
    potenciaKw: 74,
    co2: 114,
    tara: 1154,
    mma: 1618,
    batalla: 2604,
    euro: 'Euro 6e',
    wmi: 'UU1',
    marketWeight: 42
  },
  {
    marca: 'TOYOTA',
    modelo: 'COROLLA 140H ACTIVE PLUS',
    fabricante: 'TOYOTA MOTOR EUROPE NV/SA',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Híbrido (HEV)',
    etiquetaDgt: 'ECO',
    cilindrada: 1798,
    potenciaKw: 103,
    co2: 101,
    tara: 1420,
    mma: 1870,
    batalla: 2640,
    euro: 'Euro 6e-bis',
    wmi: 'SB1',
    marketWeight: 38
  },
  {
    marca: 'TOYOTA',
    modelo: 'YARIS CROSS 120H',
    fabricante: 'TOYOTA MOTOR EUROPE NV/SA',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Híbrido (HEV)',
    etiquetaDgt: 'ECO',
    cilindrada: 1490,
    potenciaKw: 85,
    co2: 102,
    tara: 1250,
    mma: 1690,
    batalla: 2560,
    euro: 'Euro 6e-bis',
    wmi: 'VN1',
    marketWeight: 35
  },
  {
    marca: 'HYUNDAI',
    modelo: 'KONA HEV 1.6 GDI',
    fabricante: 'HYUNDAI MOTOR COMPANY',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Híbrido (HEV)',
    etiquetaDgt: 'ECO',
    cilindrada: 1580,
    potenciaKw: 104,
    co2: 107,
    tara: 1485,
    mma: 1950,
    batalla: 2660,
    euro: 'Euro 6e-bis',
    wmi: 'KMH',
    marketWeight: 32
  },
  {
    marca: 'OPEL',
    modelo: 'FRONTERA GS 1.2 T XHT',
    fabricante: 'STELLANTIS AUTO SAS',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Híbrido (HEV)',
    etiquetaDgt: 'ECO',
    cilindrada: 1199,
    potenciaKw: 100,
    co2: 119,
    tara: 1388,
    mma: 1830,
    batalla: 2670,
    euro: 'Euro 6e-bis',
    wmi: 'VXK',
    marketWeight: 28
  },
  {
    marca: 'OMODA',
    modelo: 'OMODA 5 1.5 HEV PREMIUM',
    fabricante: 'CHERY AUTOMOBILE CO.LTD',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Híbrido (HEV)',
    etiquetaDgt: 'ECO',
    cilindrada: 1499,
    potenciaKw: 105,
    co2: 120,
    tara: 1621,
    mma: 2052,
    batalla: 2610,
    euro: 'Euro 6e-bis',
    wmi: 'LVU',
    marketWeight: 26
  },
  {
    marca: 'MG',
    modelo: 'MG ZS HYBRID+ COMFORT',
    fabricante: 'SAIC MOTOR CORPORATION LTD',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Híbrido (HEV)',
    etiquetaDgt: 'ECO',
    cilindrada: 1498,
    potenciaKw: 145,
    co2: 115,
    tara: 1410,
    mma: 1840,
    batalla: 2610,
    euro: 'Euro 6e',
    wmi: 'LSJ',
    marketWeight: 28
  },
  {
    marca: 'TESLA',
    modelo: 'MODEL Y RWD LONG RANGE',
    fabricante: 'TESLA INC',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Eléctrico Puro (BEV)',
    etiquetaDgt: '0 CERO',
    cilindrada: 0,
    potenciaKw: 220,
    co2: 0,
    tara: 1980,
    mma: 2455,
    batalla: 2890,
    euro: 'Euro 6e',
    wmi: 'XP7',
    marketWeight: 30
  },
  {
    marca: 'BYD',
    modelo: 'SEAL DESIGN RWD',
    fabricante: 'BYD AUTO INDUSTRY COMPANY',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Eléctrico Puro (BEV)',
    etiquetaDgt: '0 CERO',
    cilindrada: 0,
    potenciaKw: 230,
    co2: 0,
    tara: 2055,
    mma: 2501,
    batalla: 2920,
    euro: 'Euro 6e-bis',
    wmi: 'LGX',
    marketWeight: 22
  },
  {
    marca: 'HYUNDAI',
    modelo: 'I20 1.0 T-GDI KLASS',
    fabricante: 'HYUNDAI MOTOR TÜRKIYE',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Gasolina',
    etiquetaDgt: 'C',
    cilindrada: 998,
    potenciaKw: 66,
    co2: 129,
    tara: 1170,
    mma: 1625,
    batalla: 2580,
    euro: 'Euro 6e-bis',
    wmi: 'NLH',
    marketWeight: 25
  },
  {
    marca: 'AUDI',
    modelo: 'AUDI Q5 40 TDI S LINE',
    fabricante: 'AUDI AG',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Diésel',
    etiquetaDgt: 'ECO',
    cilindrada: 1968,
    potenciaKw: 150,
    co2: 159,
    tara: 2030,
    mma: 2595,
    batalla: 2827,
    euro: 'Euro 6e-bis',
    wmi: 'WAU',
    marketWeight: 18
  },
  {
    marca: 'KIA',
    modelo: 'SPORTAGE 1.6 CRDI MHEV',
    fabricante: 'KIA CORPORATION',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Diésel',
    etiquetaDgt: 'ECO',
    cilindrada: 1598,
    potenciaKw: 100,
    co2: 132,
    tara: 1565,
    mma: 2080,
    batalla: 2680,
    euro: 'Euro 6e-bis',
    wmi: 'U5Y',
    marketWeight: 24
  },
  {
    marca: 'CUPRA',
    modelo: 'FORMENTOR 1.5 E-HYBRID',
    fabricante: 'SEAT S.A.',
    categoria: 'M1',
    categoriaLabel: 'Turismo',
    propulsion: 'Híbrido Enchufable (PHEV)',
    etiquetaDgt: '0 CERO',
    cilindrada: 1498,
    potenciaKw: 150,
    co2: 29,
    tara: 1680,
    mma: 2190,
    batalla: 2680,
    euro: 'Euro 6e-bis',
    wmi: 'VSS',
    marketWeight: 24
  },
  {
    marca: 'SYM',
    modelo: 'SYMPHONY 125 SR CBS',
    fabricante: 'XIAMEN XIASHING MOTORCYCLES',
    categoria: 'L3e',
    categoriaLabel: 'Motocicleta',
    propulsion: 'Gasolina',
    etiquetaDgt: 'C',
    cilindrada: 125,
    potenciaKw: 8.4,
    co2: 56,
    tara: 125,
    mma: 275,
    batalla: 1355,
    euro: 'Euro 5+',
    wmi: 'LXM',
    marketWeight: 25
  },
  {
    marca: 'ZONTES',
    modelo: '350 E MAXI-SCOOTER',
    fabricante: 'GUANGDONG TAYO MOTORCYCLE',
    categoria: 'L3e',
    categoriaLabel: 'Motocicleta',
    propulsion: 'Gasolina',
    etiquetaDgt: 'C',
    cilindrada: 349,
    potenciaKw: 27,
    co2: 78,
    tara: 198,
    mma: 360,
    batalla: 1565,
    euro: 'Euro 5+',
    wmi: 'L38',
    marketWeight: 16
  },
  {
    marca: 'RENAULT',
    modelo: 'KANGOO E-TECH ELECTRIC',
    fabricante: 'RENAULT SAS',
    categoria: 'N1',
    categoriaLabel: 'Comercial',
    propulsion: 'Eléctrico Puro (BEV)',
    etiquetaDgt: '0 CERO',
    cilindrada: 0,
    potenciaKw: 90,
    co2: 0,
    tara: 1720,
    mma: 2230,
    batalla: 2716,
    euro: 'Euro 6e',
    wmi: 'VF1',
    marketWeight: 14
  }
];

// Weighted province selection favoring Madrid, Barcelona, Valencia, Alicante, Málaga, Sevilla, etc.
const PROVINCE_DISTRIBUTION: { code: string; weight: number }[] = [
  { code: '28', weight: 32 }, // Madrid (fleet registration hub)
  { code: '08', weight: 18 }, // Barcelona
  { code: '46', weight: 8 },  // Valencia
  { code: '29', weight: 7 },  // Málaga
  { code: '03', weight: 6 },  // Alicante
  { code: '41', weight: 6 },  // Sevilla
  { code: '30', weight: 4 },  // Murcia
  { code: '35', weight: 4 },  // Las Palmas
  { code: '38', weight: 4 },  // S.C. Tenerife
  { code: '07', weight: 4 },  // Baleares
  { code: '48', weight: 3 },  // Bizkaia
  { code: '50', weight: 3 },  // Zaragoza
  { code: '15', weight: 3 },  // A Coruña
  { code: '36', weight: 2 },  // Pontevedra
  { code: '33', weight: 2 },  // Asturias
  { code: '18', weight: 2 },  // Granada
  { code: '11', weight: 2 },  // Cádiz
  { code: '17', weight: 2 },  // Girona
  { code: '43', weight: 2 },  // Tarragona
  { code: '14', weight: 1.5 },// Córdoba
  { code: '21', weight: 1 },  // Huelva
  { code: '04', weight: 1.5 },// Almería
  { code: '39', weight: 1 },  // Cantabria
  { code: '31', weight: 1.5 },// Navarra
  { code: '20', weight: 1.5 },// Gipuzkoa
  { code: '01', weight: 1 },  // Álava
  { code: '47', weight: 1.5 },// Valladolid
  { code: '45', weight: 1.5 },// Toledo
  { code: '06', weight: 1 },  // Badajoz
  { code: '10', weight: 1 },  // Cáceres
  { code: '24', weight: 1 },  // León
  { code: '09', weight: 1 },  // Burgos
  { code: '02', weight: 1 },  // Albacete
  { code: '13', weight: 1 },  // Ciudad Real
  { code: '12', weight: 1.5 },// Castellón
  { code: '26', weight: 1 },  // La Rioja
  { code: '23', weight: 1 },  // Jaén
  { code: '25', weight: 1 },  // Lleida
  { code: '37', weight: 1 },  // Salamanca
  { code: '27', weight: 1 },  // Lugo
  { code: '32', weight: 1 },  // Ourense
  { code: '19', weight: 1 },  // Guadalajara
  { code: '22', weight: 0.8 },// Huesca
  { code: '44', weight: 0.6 },// Teruel
  { code: '40', weight: 0.8 },// Segovia
  { code: '05', weight: 0.8 },// Ávila
  { code: '34', weight: 0.8 },// Palencia
  { code: '49', weight: 0.8 },// Zamora
  { code: '16', weight: 0.7 },// Cuenca
  { code: '42', weight: 0.5 },// Soria
  { code: '51', weight: 0.4 },// Ceuta
  { code: '52', weight: 0.4 },// Melilla
];

function pickWeightedProvince(): string {
  const totalWeight = PROVINCE_DISTRIBUTION.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of PROVINCE_DISTRIBUTION) {
    if (random < item.weight) return item.code;
    random -= item.weight;
  }
  return '28';
}

function pickWeightedTemplate(): VehicleTemplate {
  const totalWeight = REAL_2026_TEMPLATES.reduce((sum, item) => sum + item.marketWeight, 0);
  let random = Math.random() * totalWeight;
  for (const item of REAL_2026_TEMPLATES) {
    if (random < item.marketWeight) return item;
    random -= item.marketWeight;
  }
  return REAL_2026_TEMPLATES[0];
}

/**
 * Generates an authentic batch of 2026 DGT vehicle registration records
 */
export function generateRealistic2026Dataset(count: number = 2500): DgtRecord[] {
  const records: DgtRecord[] = [];
  const baseYear = 2026;
  const month = 10; // October 2026

  for (let i = 0; i < count; i++) {
    const tmpl = pickWeightedTemplate();
    const provCode = pickWeightedProvince();
    const provMeta = SPAIN_PROVINCES[provCode] || SPAIN_PROVINCES['28'];

    // Day of the month between 1 and 31
    const day = Math.floor(Math.random() * 31) + 1;
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    const fecMatricula = `${dayStr}/${monthStr}/${baseYear}`;
    const fecMatriculaDate = `${baseYear}-${monthStr}-${dayStr}`;

    // Procedure class: 85% new registrations, 12% transfers, 3% other
    const classRand = Math.random();
    let claseMatricula = '0';
    let tipoTramite: 'Nueva' | 'Transferencia' | 'Ciclomotor' | 'Otro' = 'Nueva';
    if (tmpl.categoriaLabel === 'Ciclomotor') {
      claseMatricula = '6';
      tipoTramite = 'Ciclomotor';
    } else if (classRand > 0.85) {
      claseMatricula = '7';
      tipoTramite = 'Transferencia';
    }

    // Small jitter for realistic variances
    const kwJitter = Math.max(5, tmpl.potenciaKw + (Math.floor(Math.random() * 5) - 2));
    const cv = Math.round(kwJitter * 1.35962);
    const co2Jitter = Math.max(0, tmpl.co2 === 0 ? 0 : tmpl.co2 + (Math.floor(Math.random() * 5) - 2));
    const taraJitter = tmpl.tara + (Math.floor(Math.random() * 20) - 10);
    const tramoIedmt = calculateTramoIedmt(co2Jitter);

    const randomVinSuffix = Math.floor(100000 + Math.random() * 900000);
    const vinParcial = `${tmpl.wmi}X${tmpl.modelo.substring(0, 3).toUpperCase()}${randomVinSuffix}***********`;

    records.push({
      id: `gen-2026-${i + 1}`,
      fecMatricula,
      fecMatriculaDate,
      claseMatricula,
      tipoTramite,
      marca: tmpl.marca,
      modelo: tmpl.modelo,
      vinParcial,
      wmi: tmpl.wmi,
      tipoVehiculoCod: tmpl.categoriaLabel === 'Turismo' ? '400' : (tmpl.categoriaLabel === 'Motocicleta' ? '500' : '251'),
      categoria: tmpl.categoria,
      categoriaLabel: tmpl.categoriaLabel,
      carroceria: 'AF',
      cilindrada: tmpl.cilindrada,
      potenciaFiscal: parseFloat((tmpl.cilindrada > 0 ? (tmpl.cilindrada * 0.007).toFixed(2) : '12.00')),
      potenciaKw: kwJitter,
      potenciaCv: cv,
      tara: taraJitter,
      mma: tmpl.mma,
      plazas: tmpl.categoriaLabel === 'Motocicleta' ? 2 : 5,
      municipio: `${provMeta.shortName} Central`,
      municipioIne: `${provCode}001`,
      codigoPostal: `${provCode}001`,
      provinciaCod: provCode,
      provinciaNombre: provMeta.name,
      comunidadAutonoma: provMeta.community,
      emisionesCo2: co2Jitter,
      normativaEuro: tmpl.euro,
      tramoIedmt,
      propulsionCod: tmpl.propulsion === 'Eléctrico Puro (BEV)' ? '03000' : '01000',
      hibridoInd: tmpl.propulsion.includes('HEV') ? 'HEV' : (tmpl.propulsion.includes('PHEV') ? 'PHEV' : ''),
      propulsion: tmpl.propulsion,
      etiquetaDgt: tmpl.etiquetaDgt,
      batalla: tmpl.batalla,
      viaDelantera: 1560,
      viaTrasera: 1565,
      fabricante: tmpl.fabricante
    });
  }

  // Sort chronologically
  return records.sort((a, b) => a.fecMatriculaDate.localeCompare(b.fecMatriculaDate));
}
