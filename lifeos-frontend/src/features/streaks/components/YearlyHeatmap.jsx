import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * YearlyHeatmap - GitHub-style contribution graph for 365 days
 * Clean, minimal design with proper spacing
 */
export function YearlyHeatmap({
  data = [], // Array of { date: 'YYYY-MM-DD', value: number }
  colorScheme = 'green',
  className = ''
}) {
  const { weeks, months, maxValue } = useMemo(() => {
    const today = new Date();
    const dataMap = new Map(data.map(d => [d.date, d]));

    // Start from 364 days ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Adjust to start on Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const weeksData = [];
    const monthsData = [];
    let currentWeek = [];
    let lastMonth = -1;
    let maxVal = 1;

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (6 - today.getDay()));

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayData = dataMap.get(dateString);
      const value = dayData?.value || 0;
      maxVal = Math.max(maxVal, value);

      // Track month changes
      const month = currentDate.getMonth();
      if (month !== lastMonth && currentDate <= today) {
        monthsData.push({
          month: currentDate.toLocaleString('default', { month: 'short' }),
          weekIndex: weeksData.length
        });
        lastMonth = month;
      }

      currentWeek.push({
        date: dateString,
        value,
        isFuture: currentDate > today
      });

      if (currentWeek.length === 7) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeksData.push(currentWeek);
    }

    return { weeks: weeksData, months: monthsData, maxValue: maxVal };
  }, [data]);

  const colorSchemes = {
    fire: ['bg-[#161216]', 'bg-orange-900/50', 'bg-orange-600', 'bg-orange-500', 'bg-orange-400'],
    green: ['bg-[#161216]', 'bg-green-900/50', 'bg-green-600', 'bg-green-500', 'bg-green-400'],
    purple: ['bg-[#161216]', 'bg-purple-900/50', 'bg-purple-600', 'bg-purple-500', 'bg-purple-400'],
    blue: ['bg-[#161216]', 'bg-blue-900/50', 'bg-blue-600', 'bg-blue-500', 'bg-blue-400']
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.green;

  const getIntensityLevel = (value) => {
    if (value === 0) return 0;
    const percentage = (value / maxValue) * 100;
    if (percentage <= 25) return 1;
    if (percentage <= 50) return 2;
    if (percentage <= 75) return 3;
    return 4;
  };

  return (
    <div className={className}>
      {/* Month Labels - positioned with proper spacing */}
      <div className="flex text-xs text-white/40 mb-1" style={{ paddingLeft: '2px' }}>
        {months.map((m, i) => {
          // Only show every other month to avoid crowding
          const nextMonth = months[i + 1];
          const span = nextMonth ? nextMonth.weekIndex - m.weekIndex : 4;
          if (span < 3) return null; // Skip if too narrow

          return (
            <div
              key={i}
              style={{
                width: `${span * 13}px`,
                minWidth: '26px'
              }}
            >
              {m.month}
            </div>
          );
        })}
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-[3px]">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day, dayIndex) => {
              const intensity = day.isFuture ? -1 : getIntensityLevel(day.value);

              return (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: weekIndex * 0.005 }}
                  className={`
                    w-[10px] h-[10px] rounded-[2px]
                    ${day.isFuture ? 'bg-white/5' : colors[intensity]}
                  `}
                  title={day.isFuture ? '' : `${day.date}: ${day.value} activities`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2 text-xs text-white/40">
        <span>Less</span>
        {colors.map((color, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${color}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default YearlyHeatmap;
