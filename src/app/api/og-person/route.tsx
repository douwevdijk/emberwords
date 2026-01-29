import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Herinneringen';
  const description = searchParams.get('description') || '';
  const count = searchParams.get('count') || '0';

  // Truncate description if too long
  const truncatedDescription = description.length > 100 ? description.slice(0, 97) + '...' : description;

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
          {/* Flame icon circle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              backgroundColor: '#fef3c7',
              borderRadius: 50,
              marginBottom: 32,
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>

          {/* Title badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fef3c7',
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 30,
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 22, color: '#92400e' }}>Herinneringen voor</span>
          </div>

          {/* Person name */}
          <h1
            style={{
              fontSize: 80,
              color: '#1c1917',
              margin: 0,
              marginBottom: 20,
              fontWeight: 400,
            }}
          >
            {name}
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

          {/* Description or count */}
          {truncatedDescription ? (
            <p
              style={{
                fontSize: 24,
                color: '#78716c',
                maxWidth: 800,
                textAlign: 'center',
                fontStyle: 'italic',
                lineHeight: 1.5,
                paddingLeft: 40,
                paddingRight: 40,
              }}
            >
              {truncatedDescription}
            </p>
          ) : (
            <p
              style={{
                fontSize: 24,
                color: '#78716c',
                textAlign: 'center',
              }}
            >
              {count === '0' ? 'Deel jouw herinneringen' : `${count} ${count === '1' ? 'herinnering' : 'herinneringen'}`}
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
