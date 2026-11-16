import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DGT Pulse // Telemetría y Estadísticas de Matriculaciones en España';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#07070A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          border: '8px solid #14141A',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: 'rgba(255, 85, 0, 0.15)',
                border: '2px solid #FF5500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                color: '#FF5500',
                marginRight: 18,
              }}
            >
              ⚡
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: '1px' }}>
                DGT PULSE
              </span>
              <span style={{ fontSize: 14, color: '#FF5500', letterSpacing: '2px', fontFamily: 'monospace' }}>
                // TELEMETRY & FLEET ANALYTICS
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              background: 'rgba(255, 85, 0, 0.1)',
              border: '1px solid rgba(255, 85, 0, 0.3)',
              color: '#FF5500',
              fontSize: 14,
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            MICRODATOS OFICIALES MATRABA
          </div>
        </div>

        {/* Center Hero Title */}
        <div style={{ display: 'flex', flexDirection: 'column', margin: '40px 0' }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, maxWidth: '950px' }}>
            Estadísticas y Análisis de Matriculaciones de Vehículos en España
          </span>
          <span style={{ fontSize: 22, color: '#A1A1AA', marginTop: 16, maxWidth: '880px' }}>
            Indexación de 5.4M+ de vehículos oficiales DGT (2024-2026). Mapa provincial 52 provincias, mix eléctrico 0/ECO, cuota OEM y radar municipal IVTM.
          </span>
        </div>

        {/* Bottom Metrics Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 30,
            borderTop: '2px solid #1A1A24',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, color: '#71717A', fontFamily: 'monospace' }}>VOLUMEN TOTAL //</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#FF5500', fontFamily: 'monospace' }}>
              +5.400.000
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, color: '#71717A', fontFamily: 'monospace' }}>COBERTURA //</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace' }}>
              52 Provincias (IGN)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, color: '#71717A', fontFamily: 'monospace' }}>ELECTRIFICACIÓN //</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>
              0 CERO & ECO
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, color: '#71717A', fontFamily: 'monospace' }}>VELOCIDAD //</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace' }}>
              Sub-150ms SQLite
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
