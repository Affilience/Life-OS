import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface KpiRingProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export function KpiRing({ data, height = 160 }: KpiRingProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const COLORS = ['#7A5CFF', '#A78BFA', '#C4B5FD', '#DDD6FE'];

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={height} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
            dataKey="value"
            animationDuration={240}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: item.color || COLORS[i % COLORS.length],
                }}
              />
              <span className="text-white/60">{item.label}</span>
            </div>
            <span className="text-white font-medium">£{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
