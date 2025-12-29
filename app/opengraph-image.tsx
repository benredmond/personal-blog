import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Load fonts at module level (cached across requests)
const zodiak = readFileSync(join(process.cwd(), 'public/fonts/zodiak/Zodiak-Bold.ttf'));
const cabinetGrotesk = readFileSync(join(process.cwd(), 'public/fonts/cabinet-grotesk/CabinetGrotesk-Medium.ttf'));

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fffef9',
          position: 'relative',
        }}
      >

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
            maxWidth: '1000px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h1
              style={{
                fontFamily: 'Zodiak',
                fontSize: '72px',
                fontWeight: 700,
                color: '#0a0a0a',
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: '-1px',
              }}
            >
              Ben Redmond
            </h1>
            {/* Vermilion underline */}
            <div
              style={{
                width: '200px',
                height: '4px',
                backgroundColor: '#ff3a2d',
                marginTop: '16px',
              }}
            />
          </div>
          <p
            style={{
              fontFamily: 'Cabinet Grotesk',
              fontSize: '28px',
              fontWeight: 500,
              color: '#666',
              lineHeight: 1.4,
              margin: '24px 0 0 0',
            }}
          >
            Making things. Breaking things. Mostly with AI now.
          </p>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'Cabinet Grotesk',
              fontSize: '24px',
              fontWeight: 500,
              color: '#666',
              letterSpacing: '0.5px',
            }}
          >
            benr.build
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Zodiak',
          data: zodiak,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Cabinet Grotesk',
          data: cabinetGrotesk,
          weight: 500,
          style: 'normal',
        },
      ],
    }
  );
}
