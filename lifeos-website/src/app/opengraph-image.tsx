import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'LifeOS - Your Life as an RPG';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          background: 'linear-gradient(135deg, #0c0a10 0%, #1a1625 50%, #0c0a10 100%)',
          position: 'relative',
        }}
      >
        {/* Cosmic grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Gradient orb */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(34, 211, 238, 0.1) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 200 200"
            style={{ marginRight: '24px' }}
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path
              d="M60 40 L60 140 L140 140"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="70"
              ry="30"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="3"
              transform="rotate(-30 100 100)"
            />
            <circle cx="165" cy="85" r="6" fill="#22d3ee" />
          </svg>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            LifeOS
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '36px',
            color: '#e2e8f0',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Your Entire Life. One System. Fully Gamified.
        </p>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            marginTop: '16px',
          }}
        >
          Productivity • Health • Finances • Learning • Goals
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
