import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'DGT Pulse // Telemetry & Fleet Analytics',
  description: 'Plataforma de visualización y análisis de telemetría automotriz y microdatos de matriculaciones de la DGT en España.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-background text-telemetry-white antialiased min-h-screen bg-grid-pattern">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
