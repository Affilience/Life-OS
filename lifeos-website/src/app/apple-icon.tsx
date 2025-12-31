import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0c0a10 0%, #1a1625 100%)',
          borderRadius: '40px',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 200 200">
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
            strokeWidth="10"
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
            strokeWidth="4"
            transform="rotate(-30 100 100)"
          />
          <circle cx="165" cy="85" r="8" fill="#22d3ee" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
