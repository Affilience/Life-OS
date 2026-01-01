import React from 'react';

/**
 * Ascnd StreakHeatmap Component
 *
 * GitHub-style heatmap showing daily activity/consistency.
 * Displays last N days with intensity-based coloring.
 */

const StreakHeatmap = ({
  data = [], // Array of { date: 'YYYY-MM-DD', value: number }
  days = 90,
  color = 'accent',
  showLabels = true,
  className = '',
  ...props
}) => {
  // Generate last N days
  const generateDays = () => {
    const result = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dataPoint = data.find(d => d.date === dateString);
      result.push({
        date: dateString,
        value: dataPoint?.value || 0,
      });
    }
    return result;
  };

  const daysData = generateDays();
  const maxValue = Math.max(...daysData.map(d => d.value), 1);

  const getIntensity = (value) => {
    if (value === 0) return 0;
    const percentage = (value / maxValue) * 100;
    if (percentage < 25) return 1;
    if (percentage < 50) return 2;
    if (percentage < 75) return 3;
    return 4;
  };

  const colorVariants = {
    accent: [
      'bg-muted',
      'bg-accent/20',
      'bg-accent/40',
      'bg-accent/60',
      'bg-accent',
    ],
    success: [
      'bg-muted',
      'bg-success/20',
      'bg-success/40',
      'bg-success/60',
      'bg-success',
    ],
  };

  const colors = colorVariants[color] || colorVariants.accent;

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < daysData.length; i += 7) {
    weeks.push(daysData.slice(i, i + 7));
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`} {...props}>
      {showLabels && (
        <div className="flex items-center justify-between text-sm text-text-med">
          <span>Last {days} days</span>
          <div className="flex items-center gap-1 text-xs">
            <span>Less</span>
            {colors.map((colorClass, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${colorClass}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => {
              const intensity = getIntensity(day.value);
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    w-3 h-3 rounded-sm transition-all duration-fast
                    ${colors[intensity]}
                    hover:ring-1 hover:ring-text-dim/30 hover:scale-125
                    cursor-pointer
                  `}
                  title={`${day.date}: ${day.value}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakHeatmap;
