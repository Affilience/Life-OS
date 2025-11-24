import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface KpiRadarProps {
  data: { label: string; value: number; max: number }[];
  height?: number;
}

export function KpiRadar({ data, height = 160 }: KpiRadarProps) {
  // Normalize to 0-100 scale
  const normalizedData = data.map(d => ({
    subject: d.label,
    value: (d.value / d.max) * 100,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={normalizedData}>
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#a1a1aa', fontSize: 12 }}
        />
        <Radar
          name="Health"
          dataKey="value"
          stroke="#7A5CFF"
          fill="#7A5CFF"
          fillOpacity={0.3}
          animationDuration={240}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
