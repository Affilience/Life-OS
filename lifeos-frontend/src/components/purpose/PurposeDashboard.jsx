import React, { useMemo } from 'react';
import { Compass, Target, Heart, TrendingUp, Star, CheckCircle2, Sparkles } from 'lucide-react';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';
import { usePurposeStore } from '../../stores/purposeStore';

// Helper to get relative time string
const getRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 21) return '2 weeks ago';
  if (diffDays < 30) return '3 weeks ago';
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Icon mapping by importance
const VALUE_ICONS = [TrendingUp, Heart, Compass, Star];
// Color gradients for values
const VALUE_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-amber-500',
];

export default function PurposeDashboard() {
  // Connect to real store
  const {
    personalVision,
    coreValues: storeValues,
    decisions,
    identityCheckIns,
    getDecisionQuality,
    getValuesAlignmentTrend,
  } = usePurposeStore();

  // Map store values to display format
  const coreValues = useMemo(() => {
    if (storeValues.length === 0) {
      // Default values if none set
      return [
        { name: 'Growth & Learning', alignment: 80, description: 'Set your core values in Purpose module', color: 'from-blue-500 to-cyan-500', icon: TrendingUp },
      ];
    }
    return storeValues.slice(0, 4).map((value, index) => ({
      name: value.name,
      alignment: value.importance * 10, // Scale importance (1-10) to percentage
      description: value.description || 'No description',
      color: VALUE_COLORS[index % VALUE_COLORS.length],
      icon: VALUE_ICONS[index % VALUE_ICONS.length],
    }));
  }, [storeValues]);

  // Calculate alignment trend from decisions
  const alignmentTrend = useMemo(() => {
    const trend = getValuesAlignmentTrend();
    if (trend.length < 2) {
      // Default trend if not enough data
      return [
        { label: 'W1', value: 75 },
        { label: 'W2', value: 78 },
        { label: 'W3', value: 80 },
        { label: 'W4', value: 82 },
      ];
    }
    // Take last 6 data points and format
    return trend.slice(-6).map((item, idx) => ({
      label: `W${idx + 1}`,
      value: Math.round(item.alignment),
    }));
  }, [getValuesAlignmentTrend]);

  // Get current alignment score (average of recent or last value)
  const currentAlignment = useMemo(() => {
    if (alignmentTrend.length === 0) return 80;
    const recent = alignmentTrend.slice(-3);
    return Math.round(recent.reduce((sum, item) => sum + item.value, 0) / recent.length);
  }, [alignmentTrend]);

  // Recent identity check-ins for reviews section
  const recentReviews = useMemo(() => {
    return identityCheckIns.slice(0, 3).map(checkIn => ({
      date: getRelativeTime(checkIn.date),
      type: 'Identity Check-In',
      score: checkIn.valuesLived?.length ? (checkIn.valuesLived.length / Math.max(storeValues.length, 1)) * 10 : 7.5,
    }));
  }, [identityCheckIns, storeValues.length]);

  // Decision quality score
  const decisionQuality = useMemo(() => {
    return Math.round(getDecisionQuality());
  }, [getDecisionQuality]);

  // Stats
  const activeGoalsCount = decisions.filter(d => d.outcome === 'pending').length;
  const completedGoalsCount = decisions.filter(d => d.outcome === 'good').length;
  const lastCheckIn = identityCheckIns[0];
  const lastCheckInTime = lastCheckIn ? getRelativeTime(lastCheckIn.date) : 'Never';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#14050a] via-[#0a0a0a] to-[#0a0a0a] pb-20">
      {/* Header with purpose/vision aesthetic */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-900/20 via-red-900/20 to-orange-900/20 backdrop-blur-md border-b border-orange-500/20">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-orange-400" />
            Purpose & Values
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Life vision, core values, and long-term direction
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="Alignment Score"
            value={`${currentAlignment}%`}
            subtitle="values alignment"
            trend={currentAlignment > 75 ? "up" : "neutral"}
            trendValue={currentAlignment > 75 ? "+5%" : ""}
            icon={Compass}
            color="orange"
          />
          <StatCard
            title="Active Decisions"
            value={activeGoalsCount.toString()}
            subtitle="pending review"
            icon={Target}
            color="red"
          />
          <StatCard
            title="Good Decisions"
            value={completedGoalsCount.toString()}
            subtitle="successful outcomes"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Last Check-In"
            value={lastCheckInTime.replace(' ago', '')}
            subtitle={lastCheckIn ? "ago" : ""}
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
                Values Alignment Trend
              </h3>
              <p className="text-xs text-white/60 mt-1">How well actions align with values</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">{currentAlignment}%</div>
              <div className="text-xs text-white/60">current</div>
            </div>
          </div>
          <div className="h-32">
            <MiniLineChart data={alignmentTrend} color="orange" filled={true} showDots={true} />
          </div>
        </div>

        {/* Core Values with Alignment */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
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
                          <p className="text-xs text-white/60">{value.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{value.alignment}%</div>
                          <div className="text-xs text-white/60">alignment</div>
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

        {/* Recent Decisions */}
        <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Recent Decisions
          </h3>
          <div className="space-y-4">
            {decisions.length > 0 ? decisions.slice(0, 3).map((decision, index) => (
              <div key={decision.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{decision.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className={`w-3 h-3 ${
                        decision.outcome === 'good' ? 'text-green-400' :
                        decision.outcome === 'bad' ? 'text-red-400' : 'text-yellow-400'
                      }`} />
                      <span>{decision.category} · {getRelativeTime(decision.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold px-2 py-1 rounded ${
                      decision.outcome === 'good' ? 'bg-green-500/20 text-green-400' :
                      decision.outcome === 'bad' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {decision.outcome === 'pending' ? 'Pending' : decision.outcome}
                    </div>
                  </div>
                </div>
                {decision.chosenOption && (
                  <div className="text-xs text-white/60">
                    <span className="text-white/40">Chose:</span> {decision.chosenOption}
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-4 text-white/50">
                <p>No decisions recorded yet</p>
                <button
                  onClick={() => window.location.href = '/purpose'}
                  className="text-orange-400 hover:text-orange-300 text-sm mt-2"
                >
                  Start journaling decisions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Identity Check-Ins
          </h3>
          <div className="space-y-3">
            {recentReviews.length > 0 ? recentReviews.map((review, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{review.type}</p>
                  <p className="text-xs text-white/60">{review.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-yellow-400">{(review.score || 0).toFixed(1)}</div>
                  <div className="text-xs text-white/60">/ 10</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-white/50">
                <p>No check-ins yet</p>
                <button
                  onClick={() => window.location.href = '/purpose'}
                  className="text-yellow-400 hover:text-yellow-300 text-sm mt-2"
                >
                  Do your first identity check-in
                </button>
              </div>
            )}
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
              {personalVision.ultimate || personalVision.fiveYear || personalVision.oneYear ||
                "Set your life vision in the Purpose & Values module to guide your journey."}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/purpose'}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Update Vision
              </button>
              <button
                onClick={() => window.location.href = '/purpose'}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-all"
              >
                Weekly Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
