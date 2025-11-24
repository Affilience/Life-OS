import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './AnalyticsCard.css';

const TIME_RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' }
];

export default function AnalyticsCard({
  title,
  children,
  defaultRange = '30d',
  showRangeSelector = true,
  metric,
  icon: Icon
}) {
  const [selectedRange, setSelectedRange] = useState(defaultRange);

  return (
    <div className="analytics-card">
      <div className="analytics-header">
        <div className="analytics-title-row">
          {Icon && (
            <div className="analytics-icon">
              <Icon size={20} />
            </div>
          )}
          <h3 className="analytics-title">{title}</h3>
        </div>

        {metric && (
          <div className="analytics-metric">
            <div className="metric-value">{metric.value}</div>
            {metric.change !== undefined && (
              <div className={`metric-change ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                {metric.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{Math.abs(metric.change)}%</span>
              </div>
            )}
          </div>
        )}

        {showRangeSelector && (
          <div className="time-range-selector">
            {TIME_RANGES.map(range => (
              <button
                key={range.value}
                className={`range-button ${selectedRange === range.value ? 'active' : ''}`}
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-content">
        {React.cloneElement(children, { timeRange: selectedRange })}
      </div>
    </div>
  );
}
