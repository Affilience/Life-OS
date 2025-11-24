import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Stat card component for KPI display
 */
export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = 'purple',
  size = 'md'
}) {
  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-4 h-4" />;
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-white/60';
  };

  return (
    <div className={`bg-[#1a1724] border border-white/10 rounded-xl p-${size === 'sm' ? '4' : '5'} hover:border-${color}-500/30 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <p className={`text-${size === 'sm' ? '2xl' : '3xl'} font-bold text-white`}>{value}</p>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Footer */}
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2 text-sm">
          {trendValue && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-white/50">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
