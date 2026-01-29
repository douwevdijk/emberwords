import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word') || 'Emberwords';
  const country = searchParams.get('country') || '';
  const forPerson = searchParams.get('forPerson') || '';
  const meaning = searchParams.get('meaning') || '';

  // Truncate meaning if too long
  const truncatedMeaning = meaning.length > 150 ? meaning.slice(0, 147) + '...' : meaning;

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
          {/* For Person Badge */}
          {forPerson && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#fef3c7',
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 30,
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 20, color: '#92400e' }}>Voor {forPerson}</span>
            </div>
          )}

          {country && (
            <p
              style={{
                fontSize: 20,
                color: '#a8a29e',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: 12,
              }}
            >
              {country}
            </p>
          )}

          <h1
            style={{
              fontSize: 88,
              color: '#1c1917',
              margin: 0,
              marginBottom: 20,
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
              marginBottom: 28,
            }}
          />

          {truncatedMeaning && (
            <p
              style={{
                fontSize: 24,
                color: '#78716c',
                maxWidth: 900,
                textAlign: 'center',
                fontStyle: 'italic',
                lineHeight: 1.5,
                paddingLeft: 40,
                paddingRight: 40,
              }}
            >
              &quot;{truncatedMeaning}&quot;
            </p>
          )}
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
