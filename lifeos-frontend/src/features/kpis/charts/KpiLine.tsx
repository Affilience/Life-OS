import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface KpiLineProps {
  data: any[];
  dataKey?: string;
  height?: number;
  showArea?: boolean;
}

export function KpiLine({ data, dataKey = 'value', height = 140, showArea = true }: KpiLineProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A5CFF" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#7A5CFF" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0].payload;
            return (
              <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded shadow-lg">
                <div className="text-xs text-zinc-400 mb-1">
                  {format(new Date(data.date), 'MMM d')}
                </div>
                <div className="text-sm font-semibold text-white">
                  {payload[0].value?.toFixed(1)}
                </div>
              </div>
            );
          }}
        />
        {showArea && (
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#7A5CFF"
            strokeWidth={2}
            fill="url(#lineGradient)"
            animationDuration={240}
          />
        )}
        {!showArea && (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#7A5CFF"
            strokeWidth={2}
            dot={false}
            animationDuration={240}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
