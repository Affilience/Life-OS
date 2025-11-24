import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface KpiAreaProps {
  data: any[];
  dataKeys: string[];
  height?: number;
  stacked?: boolean;
}

export function KpiArea({ data, dataKeys, height = 140, stacked = true }: KpiAreaProps) {
  const COLORS = ['#7A5CFF', '#A78BFA'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          {dataKeys.map((key, i) => (
            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0].payload;
            return (
              <div className="bg-[#1a1724] border border-white/15 px-3 py-2 rounded shadow-lg">
                <div className="text-xs text-white/60 mb-2">
                  {format(new Date(data.date), 'MMM d')}
                </div>
                {payload.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-white">{p.value?.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        {dataKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId={stacked ? "1" : undefined}
            stroke={COLORS[i]}
            strokeWidth={2}
            fill={`url(#gradient-${key})`}
            animationDuration={240}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
