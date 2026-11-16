import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DGT Pulse // Telemetría y Matriculaciones en España',
    short_name: 'DGT Pulse',
    description: 'Plataforma oficial de telemetría, matriculaciones y análisis del parque de vehículos en España a partir de microdatos DGT.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#FF5500',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
