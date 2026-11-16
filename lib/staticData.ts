import fs from 'fs';
import path from 'path';

const AGGREGATED_DIR = path.join(process.cwd(), 'data', 'aggregated');

function readJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[DATA ERROR] Fichero requerido no encontrado: ${filePath}. Ejecute 'npm run ingest' antes del build.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function tryReadJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export interface SiteMetadata {
  source: string;
  sourceUrl: string;
  lastIngestDate: string;
  startPeriod: string;
  endPeriod: string;
  totalRegistrations: number;
  totalMonths: number;
  threshold: number;
  coveredYears: string[];
}

export function getMetadata(): SiteMetadata {
  return readJsonFile<SiteMetadata>(path.join(AGGREGATED_DIR, 'metadata.json'));
}

export function getOverview(): any {
  return readJsonFile<any>(path.join(AGGREGATED_DIR, 'overview.json'));
}

export function getPeriodsIndex(): { months: any[]; years: any[] } {
  return readJsonFile<{ months: any[]; years: any[] }>(path.join(AGGREGATED_DIR, 'periods.json'));
}

export function getPeriodData(id: string): any | null {
  return tryReadJsonFile<any>(path.join(AGGREGATED_DIR, 'periods', `${id}.json`));
}

export function getProvincesIndex(): any[] {
  return readJsonFile<any[]>(path.join(AGGREGATED_DIR, 'provinces.json'));
}

export function getProvinceData(slug: string): any | null {
  return tryReadJsonFile<any>(path.join(AGGREGATED_DIR, 'provinces', `${slug}.json`));
}

export function getBrandsIndex(): any[] {
  return readJsonFile<any[]>(path.join(AGGREGATED_DIR, 'brands.json'));
}

export function getBrandData(slug: string): any | null {
  return tryReadJsonFile<any>(path.join(AGGREGATED_DIR, 'brands', `${slug}.json`));
}

export function getModelData(brandSlug: string, modelSlug: string): any | null {
  return tryReadJsonFile<any>(path.join(AGGREGATED_DIR, 'models', `${brandSlug}__${modelSlug}.json`));
}

export function getAllModelFiles(): { brandSlug: string; modelSlug: string }[] {
  const modelsDir = path.join(AGGREGATED_DIR, 'models');
  if (!fs.existsSync(modelsDir)) return [];
  const files = fs.readdirSync(modelsDir);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const base = f.replace('.json', '');
      const [brandSlug, modelSlug] = base.split('__');
      return { brandSlug, modelSlug };
    })
    .filter(item => item.brandSlug && item.modelSlug);
}

export function getElectricosData(): any {
  return readJsonFile<any>(path.join(AGGREGATED_DIR, 'electricos.json'));
}
