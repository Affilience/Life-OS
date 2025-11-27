import React from 'react';
import { Sparkles, TrendingUp, BarChart3, CheckCircle2, Calendar } from 'lucide-react';

export default function WeeklyInsightsWidget() {
  // Quick insights - valuable metrics (placeholder data for now)
  const insights = [
    {
      label: 'Weekly XP',
      value: '2,450',
      change: '+18%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Avg Daily Score',
      value: '87',
      change: '+5 pts',
      trend: 'up',
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Completion Rate',
      value: '76%',
      change: '+12%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Active Days',
      value: '24/30',
      change: '80%',
      trend: 'stable',
      icon: Calendar,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2 flex-shrink-0">
        <Sparkles className="w-4 h-4" />
        Weekly Insights
      </h3>
      <div className="flex-1 grid grid-cols-2 gap-2 overflow-hidden">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.label} className={`${insight.bgColor} border border-white/10 rounded-xl p-3`}>
              <div className="flex items-start justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${insight.color}`} />
                <span className={`text-[10px] font-medium ${insight.trend === 'up' ? 'text-green-400' : 'text-white/60'}`}>
                  {insight.change}
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-0.5">{insight.value}</div>
              <div className="text-[10px] text-white/60">{insight.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
