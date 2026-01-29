import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          fontFamily: 'serif',
        }}
      >
        {/* Subtle pattern background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #fef9c3 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Heart icon placeholder */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
              fontSize: 40,
            }}
          >
            <span style={{ color: '#d97706' }}>&#9829;</span>
          </div>

          <h1
            style={{
              fontSize: 64,
              color: '#1c1917',
              margin: 0,
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            Een herinnering vastleggen
          </h1>

          {/* Amber line */}
          <div
            style={{
              width: 80,
              height: 6,
              backgroundColor: '#f59e0b',
              borderRadius: 4,
              marginBottom: 32,
            }}
          />

          <p
            style={{
              fontSize: 28,
              color: '#78716c',
              maxWidth: 700,
              textAlign: 'center',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            Deel een bijzondere herinnering en ontdek welk onvertaalbaar woord erbij past
          </p>
        </div>

        {/* Emberwords branding */}
        <p
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#d6d3d1',
            letterSpacing: '0.1em',
          }}
        >
          EMBERWORDS
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
