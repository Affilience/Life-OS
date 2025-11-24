import React from 'react';
import { Moon, TrendingUp, Clock, Activity } from 'lucide-react';
import AnalyticsCard from '../shared/AnalyticsCard';
import TrendLineChart from '../charts/TrendLineChart';
import ComparisonBarChart from '../charts/ComparisonBarChart';
import './SleepAnalytics.css';

// Mock data - would come from API in production
const qualityScoreData = [
  { date: 'Mon', score: 78 },
  { date: 'Tue', score: 85 },
  { date: 'Wed', score: 72 },
  { date: 'Thu', score: 88 },
  { date: 'Fri', score: 90 },
  { date: 'Sat', score: 82 },
  { date: 'Sun', score: 87 }
];

const durationData = [
  { date: 'Mon', hours: 7.2 },
  { date: 'Tue', hours: 8.1 },
  { date: 'Wed', hours: 6.5 },
  { date: 'Thu', hours: 7.8 },
  { date: 'Fri', hours: 8.5 },
  { date: 'Sat', hours: 9.0 },
  { date: 'Sun', hours: 8.2 }
];

const deepSleepData = [
  { date: 'Mon', hours: 1.8 },
  { date: 'Tue', hours: 2.1 },
  { date: 'Wed', hours: 1.5 },
  { date: 'Thu', hours: 2.3 },
  { date: 'Fri', hours: 2.5 },
  { date: 'Sat', hours: 2.2 },
  { date: 'Sun', hours: 2.4 }
];

const consistencyData = [
  { date: 'Mon', consistency: 85 },
  { date: 'Tue', consistency: 90 },
  { date: 'Wed', consistency: 70 },
  { date: 'Thu', consistency: 88 },
  { date: 'Fri', consistency: 82 },
  { date: 'Sat', consistency: 75 },
  { date: 'Sun', consistency: 92 }
];

export default function SleepAnalytics() {
  return (
    <div className="sleep-analytics">
      {/* Sleep Quality Score Trend */}
      <AnalyticsCard
        title="Sleep Quality Score"
        icon={Moon}
        metric={{
          value: '87/100',
          change: 8.5
        }}
        defaultRange="7d"
      >
        <TrendLineChart
          data={qualityScoreData}
          dataKey="score"
          name="Quality Score"
          color="#10b981"
          goal={85}
          showArea={true}
        />
      </AnalyticsCard>

      {/* Sleep Duration Progression */}
      <AnalyticsCard
        title="Sleep Duration"
        icon={Clock}
        metric={{
          value: '7.9 hrs',
          change: 12.3
        }}
        defaultRange="7d"
      >
        <TrendLineChart
          data={durationData}
          dataKey="hours"
          name="Hours"
          color="#10b981"
          goal={8}
          showArea={true}
        />
      </AnalyticsCard>

      {/* Deep Sleep Trend */}
      <AnalyticsCard
        title="Deep Sleep Duration"
        icon={Activity}
        metric={{
          value: '2.3 hrs',
          change: 15.0
        }}
        defaultRange="7d"
      >
        <TrendLineChart
          data={deepSleepData}
          dataKey="hours"
          name="Deep Sleep"
          color="#10b981"
          goal={2}
          showArea={true}
        />
      </AnalyticsCard>

      {/* Sleep Consistency */}
      <AnalyticsCard
        title="Sleep Consistency"
        icon={TrendingUp}
        metric={{
          value: '83%',
          change: 5.2
        }}
        defaultRange="7d"
      >
        <ComparisonBarChart
          data={consistencyData}
          dataKey="consistency"
          name="Consistency"
          color="#10b981"
        />
      </AnalyticsCard>

      {/* Sleep Insights */}
      <div className="sleep-insights">
        <div className="insights-header">
          <Moon size={24} className="insights-icon" />
          <h3 className="insights-title">Sleep Insights</h3>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-label">Average Bedtime</div>
            <div className="insight-value">10:45 PM</div>
            <div className="insight-trend positive">+15 min earlier</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Average Wake Time</div>
            <div className="insight-value">6:30 AM</div>
            <div className="insight-trend positive">Consistent</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">REM Sleep</div>
            <div className="insight-value">25%</div>
            <div className="insight-trend positive">+3% from avg</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Sleep Efficiency</div>
            <div className="insight-value">92%</div>
            <div className="insight-trend positive">+5% this week</div>
          </div>
        </div>
      </div>
    </div>
  );
}
