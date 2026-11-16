import { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dgt-pulse.es';

/** Nombre del sitio, que aparece una sola vez en cada título. */
export const SITE_NAME = 'DGT Pulse';

/** Plantilla del layout raíz: añade el nombre del sitio al título que defina cada página. */
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/**
 * Construye los metadatos de una página. El título HTML se devuelve sin el nombre
 * del sitio porque el layout raíz lo añade con SITE_TITLE_TEMPLATE; los títulos de
 * Open Graph y Twitter no pasan por la plantilla y llevan el nombre explícito.
 */
export function constructMetadata({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  publishedTime,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
}): Metadata {
  const url = `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'es_ES',
      type: ogType,
      ...(publishedTime ? { publishedTime } : {}),
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${title} - ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${SITE_URL}${crumb.item}`,
    })),
  };
}

export function generateDatasetJsonLd({
  name,
  description,
  temporalCoverage,
  url,
}: {
  name: string;
  description: string;
  temporalCoverage: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    keywords: ['DGT', 'matriculaciones', 'vehículos', 'España', 'automoción', 'eléctricos', 'BEV', 'PHEV'],
    creator: {
      '@type': 'Organization',
      name: 'Dirección General de Tráfico (DGT)',
      url: 'https://www.dgt.es',
    },
    temporalCoverage,
    spatialCoverage: {
      '@type': 'Place',
      name: 'España',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.4168,
        longitude: -3.7038,
      },
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${SITE_URL}/data/aggregated/overview.json`,
    },
  };
}
