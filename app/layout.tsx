import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SITE_TITLE_TEMPLATE } from '@/lib/seo';
import { DataProvider } from '@/context/DataContext';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

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
    default: 'DGT Pulse // Estadísticas de matriculaciones a partir de los microdatos de la DGT',
    template: SITE_TITLE_TEMPLATE,
  },
  description: 'Estadísticas de matriculaciones a partir de los microdatos de la Dirección General de Tráfico (DGT). Estadísticas históricas de más de 5,4M de matriculaciones, mapa provincial, etiquetas ambientales 0/ECO y cuota de mercado por marcas.',
  keywords: [
    'matriculaciones dgt',
    'estadisticas vehiculos espana',
    'microdatos dgt matraba',
    'coches electricos matriculados espana',
    'etiquetas ambientales dgt',
    'distintivo ambiental 0 cero eco',
    'marcas coches mas vendidas espana',
    'parque de vehiculos espana',
  ],
  authors: [{ name: 'DGT Pulse Analytics Team', url: baseUrl }],
  creator: 'DGT Pulse',
  publisher: 'DGT Pulse',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: baseUrl,
    siteName: 'DGT Pulse',
    title: 'DGT Pulse // Estadísticas de Matriculaciones en España',
    description: 'Análisis de más de 5.400.000 de matriculaciones de la DGT. Mix energético, 52 provincias y cuota de mercado.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DGT Pulse // Estadísticas de Matriculaciones DGT',
    description: 'Análisis de más de 5,4M de matriculaciones en España a partir de los microdatos de la DGT.',
    creator: '@dgtpulse',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-background text-telemetry-white antialiased min-h-screen bg-grid-pattern flex flex-col">
        <DataProvider>
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </DataProvider>
      </body>
    </html>
  );
}
