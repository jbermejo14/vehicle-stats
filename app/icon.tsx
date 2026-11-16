import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FF5500',
          fontWeight: 900,
          borderRadius: 6,
          border: '1.5px solid #FF5500',
          boxShadow: '0 0 10px rgba(255, 85, 0, 0.6)',
        }}
      >
        ⚡
      </div>
    ),
    { ...size }
  );
}
