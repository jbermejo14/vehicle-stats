/**
 * Slug generator and thresholds for Programmatic SEO pages
 */

export const MIN_REGISTRATIONS_THRESHOLD = 50;

/**
 * Normalizes any text into a stable, URL-safe, accent-free slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // Split accents from characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing hyphens
}

/**
 * Official province slug to INE code and name mapping
 */
export const PROVINCE_SLUGS: Record<string, { code: string; name: string }> = {
  'alava': { code: '01', name: 'Álava' },
  'albacete': { code: '02', name: 'Albacete' },
  'alicante': { code: '03', name: 'Alicante' },
  'almeria': { code: '04', name: 'Almería' },
  'avila': { code: '05', name: 'Ávila' },
  'badajoz': { code: '06', name: 'Badajoz' },
  'illes-balears': { code: '07', name: 'Illes Balears' },
  'barcelona': { code: '08', name: 'Barcelona' },
  'burgos': { code: '09', name: 'Burgos' },
  'caceres': { code: '10', name: 'Cáceres' },
  'cadiz': { code: '11', name: 'Cádiz' },
  'castellon': { code: '12', name: 'Castellón' },
  'ciudad-real': { code: '13', name: 'Ciudad Real' },
  'cordoba': { code: '14', name: 'Córdoba' },
  'a-coruna': { code: '15', name: 'A Coruña' },
  'cuenca': { code: '16', name: 'Cuenca' },
  'girona': { code: '17', name: 'Girona' },
  'granada': { code: '18', name: 'Granada' },
  'guadalajara': { code: '19', name: 'Guadalajara' },
  'gipuzkoa': { code: '20', name: 'Gipuzkoa' },
  'huelva': { code: '21', name: 'Huelva' },
  'huesca': { code: '22', name: 'Huesca' },
  'jaen': { code: '23', name: 'Jaén' },
  'leon': { code: '24', name: 'León' },
  'lleida': { code: '25', name: 'Lleida' },
  'la-rioja': { code: '26', name: 'La Rioja' },
  'lugo': { code: '27', name: 'Lugo' },
  'madrid': { code: '28', name: 'Madrid' },
  'malaga': { code: '29', name: 'Málaga' },
  'murcia': { code: '30', name: 'Murcia' },
  'navarra': { code: '31', name: 'Navarra' },
  'ourense': { code: '32', name: 'Ourense' },
  'asturias': { code: '33', name: 'Asturias' },
  'palencia': { code: '34', name: 'Palencia' },
  'las-palmas': { code: '35', name: 'Las Palmas' },
  'pontevedra': { code: '36', name: 'Pontevedra' },
  'salamanca': { code: '37', name: 'Salamanca' },
  'santa-cruz-de-tenerife': { code: '38', name: 'Santa Cruz de Tenerife' },
  'cantabria': { code: '39', name: 'Cantabria' },
  'segovia': { code: '40', name: 'Segovia' },
  'sevilla': { code: '41', name: 'Sevilla' },
  'soria': { code: '42', name: 'Soria' },
  'tarragona': { code: '43', name: 'Tarragona' },
  'teruel': { code: '44', name: 'Teruel' },
  'toledo': { code: '45', name: 'Toledo' },
  'valencia': { code: '46', name: 'Valencia' },
  'valladolid': { code: '47', name: 'Valladolid' },
  'bizkaia': { code: '48', name: 'Bizkaia' },
  'zamora': { code: '49', name: 'Zamora' },
  'zaragoza': { code: '50', name: 'Zaragoza' },
  'ceuta': { code: '51', name: 'Ceuta' },
  'melilla': { code: '52', name: 'Melilla' }
};

export const PROVINCE_CODE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(PROVINCE_SLUGS).map(([slug, meta]) => [meta.code, slug])
);
