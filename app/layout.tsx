import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/context/DataContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dgt-pulse.es';

export const viewport: Viewport = {
  themeColor: '#FF5500',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'DGT Pulse // Estadísticas y Telemetría de Matriculaciones en España',
    template: '%s | DGT Pulse',
  },
  description: 'Plataforma líder de análisis de microdatos oficiales de la Dirección General de Tráfico (DGT). Estadísticas históricas de más de 5,4M de matriculaciones, mapa provincial interactivo, etiquetas ambientales 0/ECO, cuota por marcas y radar fiscal municipal.',
  keywords: [
    'matriculaciones dgt',
    'estadisticas vehiculos espana',
    'microdatos dgt matraba',
    'coches electricos matriculados espana',
    'etiquetas ambientales dgt',
    'distintivo ambiental 0 cero eco',
    'marcas coches mas vendidas espana',
    'parque de vehiculos espana',
    'tasa motorizacion provincias ine',
    'paraisos fiscales ivtm flotas renting',
    'impuesto matriculacion iedmt',
    'emisiones co2 wltp flota espana',
    'made in spain factorias automovil',
    'consorcios oem automocion vag stellantis',
  ],
  authors: [{ name: 'DGT Pulse Analytics Team', url: baseUrl }],
  creator: 'DGT Pulse',
  publisher: 'DGT Pulse',
  category: 'Automotive & Telemetry Analytics',
  applicationName: 'DGT Pulse',
  generator: 'Next.js 14',
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: baseUrl,
    siteName: 'DGT Pulse // Fleet & Automotive Telemetry',
    title: 'DGT Pulse // Estadísticas y Telemetría de Matriculaciones en España',
    description: 'Análisis de más de 5.400.000 de matriculaciones oficiales DGT. Mix energético, 52 provincias, cuota de mercado OEM y radar fiscal municipal.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DGT Pulse // Estadísticas de Matriculaciones DGT',
    description: 'Telemetría y análisis de 5.4M+ de vehículos oficiales DGT en España. Datos históricos 2024-2026, mapa provincial y electrificación.',
    creator: '@dgtpulse',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Rich JSON-LD Structured Data Schema (Dataset + WebApplication + Organization)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${baseUrl}/#webapp`,
      name: 'DGT Pulse',
      url: baseUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      inLanguage: 'es-ES',
      description: 'Consola de telemetría automotriz y analítica de microdatos masivos de matriculaciones de la Dirección General de Tráfico (DGT) en España.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
      featureList: [
        'Serie multi-anual de 5.400.000+ de matriculaciones oficiales (2024-2026)',
        'Mapa coroplético interactivo de las 52 provincias españolas con cálculo per cápita INE',
        'Mix de propulsión y distintivos ambientales DGT (0 CERO, ECO, C, B, Sin Etiqueta)',
        'Ranking Top 20 marcas y Top 25 modelos con comparador 1v1',
        'Análisis de grupos automovilísticos matrices (Consorcios OEM)',
        'Trazabilidad geográfica de factorías y Made in Spain mediante código WMI',
        'Radar municipal y detección de paraísos fiscales del IVTM para flotas y renting',
        'Distribución de potencia (kW/CV), relación peso/potencia (kg/CV) y masa homologada',
        'Tramos impositivos del Impuesto de Matriculación (IEDMT) y normas Euro',
      ],
    },
    {
      '@type': 'Dataset',
      '@id': `${baseUrl}/#dataset`,
      name: 'Microdatos de Matriculaciones de Vehículos en España (DGT MATRABA)',
      description: 'Microdatos anonimizados del Registro General de Vehículos de la DGT conteniendo datos técnicos, energéticos y geográficos de matriculación.',
      url: baseUrl,
      license: 'https://datos.gob.es/es/aviso-legal',
      spatialCoverage: {
        '@type': 'Place',
        name: 'España',
        geo: {
          '@type': 'GeoShape',
          box: '27.6 -18.2 43.8 4.3',
        },
      },
      temporalCoverage: '2024-01-01/2026-10-31',
      creator: {
        '@type': 'Organization',
        name: 'Dirección General de Tráfico (DGT)',
        url: 'https://www.dgt.es',
      },
      publisher: {
        '@type': 'Organization',
        name: 'DGT Pulse',
        url: baseUrl,
      },
      variableMeasured: [
        'Fecha de matriculación',
        'Marca y modelo del vehículo',
        'Categoría y carrocería europea (M1, N1, L3e, AF, AB, AA)',
        'Tipo de combustible y propulsión (Gasolina, Diésel, HEV, PHEV, BEV, GLP)',
        'Distintivo ambiental DGT',
        'Potencia neta máxima en kW y CV',
        'Emisiones oficiales de CO2 WLTP',
        'Tara y masa máxima autorizada (MMA)',
        'Provincia y municipio de matriculación',
        'Código WMI de fabricante y factoría de ensamblaje',
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'DGT Pulse Analytics',
      url: baseUrl,
      logo: `${baseUrl}/icon.png`,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-telemetry-white antialiased min-h-screen bg-grid-pattern">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
