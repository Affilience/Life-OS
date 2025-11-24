import React from 'react';

interface KpiGaugeProps {
  value: number;
  max?: number;
  height?: number;
}

export function KpiGauge({ value, max = 100, height = 120 }: KpiGaugeProps) {
  const percentage = (value / max) * 100;
  const radius = height / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  return (
    <div className="relative flex items-center justify-center" style={{ height }}>
      <svg width={height} height={height} className="transform -rotate-90">
        {/* Background arc */}
        <circle
          cx={height / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={height / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke="#7A5CFF"
          strokeWidth="8"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{value.toFixed(0)}</div>
          <div className="text-xs text-white/50">/ {max}</div>
        </div>
      </div>
    </div>
  );
}
