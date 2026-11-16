import { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dgt-pulse.es';

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
    title: `${title} | DGT Pulse`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | DGT Pulse`,
      description,
      url,
      siteName: 'DGT Pulse // Telemetría Oficial de Matriculaciones',
      locale: 'es_ES',
      type: ogType,
      ...(publishedTime ? { publishedTime } : {}),
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${title} - DGT Pulse`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | DGT Pulse`,
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
