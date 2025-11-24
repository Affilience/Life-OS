import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface KpiBarProps {
  data: any[];
  dataKey?: string;
  height?: number;
}

export function KpiBar({ data, dataKey = 'value', height = 140 }: KpiBarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <XAxis dataKey="date" hide />
        <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0].payload;
            return (
              <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded shadow-lg">
                <div className="text-xs text-zinc-400 mb-1">
                  {format(new Date(data.date), 'MMM yyyy')}
                </div>
                <div className="text-sm font-semibold text-white">
                  £{payload[0].value?.toLocaleString()}
                </div>
              </div>
            );
          }}
        />
        <Bar
          dataKey={dataKey}
          fill="#7A5CFF"
          radius={[4, 4, 0, 0]}
          animationDuration={240}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
