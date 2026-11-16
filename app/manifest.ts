import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DGT Pulse // Estadísticas de matriculaciones en España',
    short_name: 'DGT Pulse',
    description: 'Estadísticas de matriculaciones a partir de los microdatos de la DGT.',
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
