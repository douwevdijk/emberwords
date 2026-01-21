import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word') || 'Emberwords';
  const country = searchParams.get('country') || '';
  const definition = searchParams.get('definition') || '';

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
            background: 'radial-gradient(circle at 50% 50%, #fef3c7 0%, #ffffff 70%)',
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
          {country && (
            <p
              style={{
                fontSize: 24,
                color: '#a8a29e',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: 16,
              }}
            >
              {country}
            </p>
          )}

          <h1
            style={{
              fontSize: 96,
              color: '#1c1917',
              margin: 0,
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            {word}
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

          {definition && (
            <p
              style={{
                fontSize: 28,
                color: '#78716c',
                maxWidth: 800,
                textAlign: 'center',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              "{definition}"
            </p>
          )}
        </div>

        {/* Emberwords branding */}
        <p
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
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
