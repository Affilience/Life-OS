import React, { useMemo } from 'react';
import { Moon, TrendingUp, Clock, Activity } from 'lucide-react';
import AnalyticsCard from '../shared/AnalyticsCard';
import TrendLineChart from '../charts/TrendLineChart';
import ComparisonBarChart from '../charts/ComparisonBarChart';
import { useHealthStore } from '../../stores/healthStore';
import './SleepAnalytics.css';

export default function SleepAnalytics() {
  const { sleepLogs } = useHealthStore();

  // Calculate all sleep analytics from store data
  const { qualityScoreData, durationData, deepSleepData, consistencyData, insights } = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    // Build last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push({
        dateStr: d.toISOString().split('T')[0],
        dayOfWeek: d.getDay()
      });
    }

    // Match sleep logs to days
    const dailyData = last7Days.map(({ dateStr, dayOfWeek }) => {
      const dayLogs = (sleepLogs || []).filter(log => log.date === dateStr || log.timestamp?.startsWith(dateStr));
      const log = dayLogs[0];

      return {
        date: dayLabels[dayOfWeek],
        quality: log?.quality || 0,
        duration: log?.duration || log?.hours || 0,
        deepSleep: log?.deepSleep || (log?.duration ? log.duration * 0.2 : 0), // Estimate 20% deep sleep
        bedtime: log?.bedtime || null,
        wakeTime: log?.wakeTime || null
      };
    });

    // Calculate consistency based on sleep timing variance
    const avgDuration = dailyData.reduce((sum, d) => sum + d.duration, 0) / 7;
    const consistencyArr = dailyData.map(d => ({
      date: d.date,
      consistency: d.duration > 0
        ? Math.round(Math.max(0, 100 - Math.abs(d.duration - avgDuration) * 15))
        : 0
    }));

    // Build chart data arrays
    const qualityArr = dailyData.map(d => ({ date: d.date, score: d.quality || 0 }));
    const durationArr = dailyData.map(d => ({ date: d.date, hours: parseFloat((d.duration || 0).toFixed(1)) }));
    const deepSleepArr = dailyData.map(d => ({ date: d.date, hours: parseFloat((d.deepSleep || 0).toFixed(1)) }));

    // Calculate averages for metrics
    const daysWithData = dailyData.filter(d => d.duration > 0).length;
    const avgQuality = daysWithData > 0
      ? Math.round(dailyData.reduce((sum, d) => sum + d.quality, 0) / daysWithData)
      : 0;
    const avgDur = daysWithData > 0
      ? (dailyData.reduce((sum, d) => sum + d.duration, 0) / daysWithData).toFixed(1)
      : '0';
    const avgDeep = daysWithData > 0
      ? (dailyData.reduce((sum, d) => sum + d.deepSleep, 0) / daysWithData).toFixed(1)
      : '0';
    const avgConsistency = daysWithData > 0
      ? Math.round(consistencyArr.reduce((sum, d) => sum + d.consistency, 0) / daysWithData)
      : 0;

    return {
      qualityScoreData: qualityArr,
      durationData: durationArr,
      deepSleepData: deepSleepArr,
      consistencyData: consistencyArr,
      insights: {
        avgQuality,
        avgDuration: avgDur,
        avgDeepSleep: avgDeep,
        avgConsistency,
        daysTracked: daysWithData
      }
    };
  }, [sleepLogs]);
  return (
    <div className="sleep-analytics">
      {/* Sleep Quality Score Trend */}
      <AnalyticsCard
        title="Sleep Quality Score"
        icon={Moon}
        metric={{
          value: `${insights.avgQuality}/100`,
          change: 0
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
          value: `${insights.avgDuration} hrs`,
          change: 0
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
          value: `${insights.avgDeepSleep} hrs`,
          change: 0
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
          value: `${insights.avgConsistency}%`,
          change: 0
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
            <div className="insight-label">Avg Duration</div>
            <div className="insight-value">{insights.avgDuration} hrs</div>
            <div className="insight-trend positive">Target: 8 hrs</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Days Tracked</div>
            <div className="insight-value">{insights.daysTracked}/7</div>
            <div className="insight-trend positive">This week</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Deep Sleep</div>
            <div className="insight-value">{insights.avgDeepSleep} hrs</div>
            <div className="insight-trend positive">~{insights.avgDuration > 0 ? Math.round((parseFloat(insights.avgDeepSleep) / parseFloat(insights.avgDuration)) * 100) : 0}% of total</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Sleep Quality</div>
            <div className="insight-value">{insights.avgQuality}%</div>
            <div className="insight-trend positive">Weekly avg</div>
          </div>
        </div>
      </div>
    </div>
  );
}
