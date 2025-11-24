import React from 'react';
import { Compass, Target, Heart, TrendingUp, Star, CheckCircle2, Sparkles } from 'lucide-react';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';

export default function PurposeDashboard() {
  // Mock data
  const alignmentTrend = [
    { label: 'W1', value: 65 },
    { label: 'W2', value: 70 },
    { label: 'W3', value: 68 },
    { label: 'W4', value: 75 },
    { label: 'W5', value: 78 },
    { label: 'W6', value: 82 },
  ];

  const coreValues = [
    {
      name: 'Growth & Learning',
      alignment: 92,
      description: 'Continuous improvement and knowledge',
      color: 'from-blue-500 to-cyan-500',
      icon: TrendingUp
    },
    {
      name: 'Impact & Contribution',
      alignment: 78,
      description: 'Making a positive difference',
      color: 'from-purple-500 to-pink-500',
      icon: Heart
    },
    {
      name: 'Freedom & Autonomy',
      alignment: 85,
      description: 'Independence and self-direction',
      color: 'from-orange-500 to-red-500',
      icon: Compass
    },
    {
      name: 'Excellence & Mastery',
      alignment: 88,
      description: 'Pursuing high standards',
      color: 'from-green-500 to-emerald-500',
      icon: Star
    },
  ];

  const longTermGoals = [
    {
      goal: 'Build successful software business',
      progress: 35,
      milestone: 'Launched MVP',
      nextStep: 'Acquire first 100 users',
      timeline: '6 months'
    },
    {
      goal: 'Achieve financial independence',
      progress: 22,
      milestone: 'Emergency fund complete',
      nextStep: 'Reach $50k savings',
      timeline: '2 years'
    },
    {
      goal: 'Master full-stack development',
      progress: 68,
      milestone: 'Built 5 production apps',
      nextStep: 'Learn advanced architecture',
      timeline: '3 months'
    },
  ];

  const recentReviews = [
    { date: '1 week ago', type: 'Weekly Review', score: 8.5 },
    { date: '2 weeks ago', type: 'Weekly Review', score: 7.8 },
    { date: '3 weeks ago', type: 'Weekly Review', score: 8.2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#14050a] via-[#0a0a0a] to-[#0a0a0a] pb-20">
      {/* Header with purpose/vision aesthetic */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-900/20 via-red-900/20 to-orange-900/20 backdrop-blur-md border-b border-orange-500/20">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-orange-400" />
            Purpose & Values
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Life vision, core values, and long-term direction
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Alignment Score"
            value="82%"
            subtitle="values alignment"
            trend="up"
            trendValue="+7%"
            icon={Compass}
            color="orange"
          />
          <StatCard
            title="Active Goals"
            value="8"
            subtitle="in progress"
            trend="up"
            trendValue="+2"
            icon={Target}
            color="red"
          />
          <StatCard
            title="Completed"
            value="23"
            subtitle="goals achieved"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Last Review"
            value="1w"
            subtitle="ago"
            icon={Star}
            color="purple"
          />
        </div>

        {/* Alignment Trend */}
        <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Values Alignment (6 Weeks)
              </h3>
              <p className="text-xs text-gray-400 mt-1">How well actions align with values</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">82%</div>
              <div className="text-xs text-gray-400">current</div>
            </div>
          </div>
          <div className="h-32">
            <MiniLineChart data={alignmentTrend} color="orange" filled={true} showDots={true} />
          </div>
        </div>

        {/* Core Values with Alignment */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Core Values
          </h3>
          <div className="space-y-4">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${value.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="text-white font-semibold">{value.name}</h4>
                          <p className="text-xs text-gray-400">{value.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{value.alignment}%</div>
                          <div className="text-xs text-gray-400">alignment</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${value.color} rounded-full transition-all duration-500`}
                      style={{ width: `${value.alignment}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Long-Term Goals */}
        <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Long-Term Goals
          </h3>
          <div className="space-y-4">
            {longTermGoals.map((item, index) => (
              <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{item.goal}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Latest: {item.milestone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{item.progress}%</div>
                    <div className="text-xs text-gray-400">{item.timeline}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Next:</span>
                    <span className="text-gray-300">{item.nextStep}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Recent Reviews
          </h3>
          <div className="space-y-3">
            {recentReviews.map((review, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{review.type}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-yellow-400">{review.score}</div>
                  <div className="text-xs text-gray-400">/ 10</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Life Vision Card */}
        <div className="bg-gradient-to-br from-orange-600/20 via-red-600/20 to-orange-600/20 border border-orange-400/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-semibold">Life Vision</h3>
            </div>
            <p className="text-gray-300 text-sm italic mb-4">
              "Build a successful software business while maintaining freedom, continuous growth, and financial independence. Make meaningful impact through technology and innovation."
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all">
                Update Vision
              </button>
              <button className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-all">
                Weekly Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
