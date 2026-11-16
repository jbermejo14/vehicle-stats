import type { DgtBadgeType } from './dgtBadge';

export type TramiteTipo = 'todas' | 'nuevas' | 'transferencias' | 'bajas';

export type CategoriaVehiculo = 'todos' | 'turismos' | 'motos' | 'furgonetas' | 'industriales';

export type EtiquetaDgt = DgtBadgeType;

export type TipoPropulsion = 
  | 'Gasolina'
  | 'Diésel'
  | 'Híbrido (HEV)'
  | 'Híbrido Enchufable (PHEV)'
  | 'Eléctrico Puro (BEV)'
  | 'GLP / GNC'
  | 'Otro';

export type TramoIedmt = 'Exento (0%)' | 'Tramo 1 (4,75%)' | 'Tramo 2 (9,75%)' | 'Tramo 3 (14,75%)';

export interface DgtRecord {
  id: string;
  fecMatricula: string; // DDMMYYYY or YYYY-MM-DD
  fecMatriculaDate: string; // ISO date YYYY-MM-DD
  claseMatricula: string; // '0' = Ordinaria/Nueva, '7' = Rematriculación/Transferencia, '6' = Ciclomotor, etc.
  tipoTramite: 'Nueva' | 'Transferencia' | 'Ciclomotor' | 'Otro';
  marca: string;
  modelo: string;
  vinParcial: string;
  wmi: string; // 3 chars
  tipoVehiculoCod: string; // 400, 500, 900, 251, etc.
  categoria: string; // M1, L3e, N1, etc.
  categoriaLabel: 'Turismo' | 'Motocicleta' | 'Ciclomotor' | 'Comercial' | 'Industrial' | 'Otro';
  carroceria: string;
  cilindrada: number; // cc
  potenciaFiscal: number; // CVF
  potenciaKw: number; // kW
  potenciaCv: number; // CV = kW * 1.35962
  tara: number; // kg
  mma: number; // kg
  plazas: number;
  municipio: string;
  municipioIne: string;
  codigoPostal: string;
  provinciaCod: string; // 2 digits (e.g. '28')
  provinciaNombre: string; // e.g. 'Madrid'
  comunidadAutonoma: string;
  emisionesCo2: number; // g/km
  normativaEuro: string; // Euro 6e, Euro 6e-bis, Euro 5, etc.
  tramoIedmt: TramoIedmt;
  propulsionCod: string;
  hibridoInd: string; // HEV, PHEV, BEV, MHEV or empty
  propulsion: TipoPropulsion;
  etiquetaDgt: EtiquetaDgt;
  batalla: number; // mm
  viaDelantera: number; // mm
  viaTrasera: number; // mm
  fabricante: string;
}

export interface ProvinceStat {
  code: string;
  name: string;
  community: string;
  population: number;
  totalRegistrations: number;
  ratePer1000: number; // registrations per 1,000 residents
  electrifiedPct: number; // % 0 + ECO
  bevPct: number;
  phevPct: number;
  hevPct: number;
  topBrand: string;
  topModel: string;
  avgCo2: number;
}

export interface BrandStat {
  brand: string;
  total: number;
  percentage: number;
  eco0Pct: number;
  avgKw: number;
  avgCo2: number;
  topModel: string;
}

export interface ModelStat {
  model: string;
  brand: string;
  fullName: string;
  total: number;
  percentage: number;
  category: string;
  primaryFuel: TipoPropulsion;
  primaryBadge: EtiquetaDgt;
  avgKw: number;
  avgCv: number;
  avgCo2: number;
  avgTara: number;
}

export interface TimelineDataPoint {
  date: string;
  displayDate: string;
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
  avgCo2: number;
}

export interface PowerBracketStat {
  range: string;
  minKw: number;
  maxKw: number;
  count: number;
  percentage: number;
}

export interface DisplacementBracketStat {
  range: string;
  minCc: number;
  maxCc: number;
  count: number;
  percentage: number;
}

export interface FuelStat {
  name: TipoPropulsion;
  count: number;
  percentage: number;
  color: string;
}

export interface BadgeStat {
  name: EtiquetaDgt;
  count: number;
  percentage: number;
  color: string;
}

export interface FuelBadgeCrossMatrix {
  fuels: TipoPropulsion[];
  badges: EtiquetaDgt[];
  grid: Record<string, Record<string, number>>;
}

export interface Co2BracketStat {
  range: string;
  tramoIedmt: TramoIedmt;
  count: number;
  percentage: number;
  taxRate: string;
}

export interface GlobalKpis {
  totalRegistrations: number;
  nuevasCount: number;
  transferenciasCount: number;
  electrificadosCount: number; // 0 + ECO
  electrificadosPct: number;
  ceroCount: number;
  ceroPct: number;
  ecoCount: number;
  ecoPct: number;
  bevCount: number;
  phevCount: number;
  hevCount: number;
  avgCo2: number;
  co2ExemptPct: number; // emissions <= 120 g/km
  avgKw: number;
  avgCv: number;
  avgTara: number;
  topBrand: { name: string; count: number; pct: number };
  topModel: { name: string; brand: string; count: number; pct: number };
  topProvince: { name: string; count: number; pct: number };
  topEuroNorm: { norm: string; pct: number };
}

export interface FilterState {
  tramite: TramiteTipo;
  categoria: CategoriaVehiculo;
  propulsion: string; // 'todas' or specific
  etiqueta: string; // 'todas' or specific
  provincia: string; // 'todas' or code
  search: string;
  startDate?: string;
  endDate?: string;
}

export interface AutomotiveGroupStat {
  groupName: string;
  total: number;
  percentage: number;
  brands: string[];
  eco0Pct: number;
  avgCo2: number;
  topBrand: string;
}

export interface OriginCountryStat {
  country: string;
  code: string;
  flag: string;
  total: number;
  percentage: number;
  isDomestic: boolean;
  topBrands: string[];
}

export interface BodyTypeStat {
  code: string;
  label: string;
  category: string;
  total: number;
  percentage: number;
  avgKw: number;
  avgTara: number;
}

export interface WeightPowerBracket {
  range: string;
  label: string;
  minRatio: number;
  maxRatio: number;
  count: number;
  percentage: number;
  color: string;
}

export interface MunicipalityStat {
  municipio: string;
  provincia: string;
  total: number;
  sampleCount?: number;
  percentage: number;
  isFleetHub: boolean;
  fleetHubReason?: string;
}
