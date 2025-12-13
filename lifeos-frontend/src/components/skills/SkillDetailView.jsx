import React, { useState, useMemo } from 'react';
import {
  X, Clock, Flame, TrendingUp, Zap, Calendar, Target,
  Award, ChevronRight, Plus, BarChart3, Edit2, Trash2
} from 'lucide-react';
import useSkillsStore, {
  getProficiencyLevel,
  getXpProgress,
  getPracticeHeatmap,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
} from '../../stores/skillsStore';

/**
 * Skill Detail View
 *
 * Comprehensive breakdown of a skill including:
 * - Progress visualization with level info
 * - 30-day practice heatmap
 * - Weekly practice bar chart
 * - Complete practice session history
 * - Goals and milestones tracking
 */
export default function SkillDetailView({ skill: initialSkill, onClose, onLogPractice }) {
  const { skills, getSkillStats, toggleGoal, addGoal, addMilestone } = useSkillsStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [newGoal, setNewGoal] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Get fresh skill data from the store to ensure we have the latest goals
  const skill = useMemo(() =>
    skills.find(s => s.id === initialSkill.id) || initialSkill,
    [skills, initialSkill.id]
  );

  const stats = useMemo(() => getSkillStats(skill.id), [skill.id, getSkillStats]);
  const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
  const proficiency = getProficiencyLevel(skill.xp);
  const progress = getXpProgress(skill.xp);
  const heatmap30 = useMemo(() => getPracticeHeatmap(skill.sessions || [], 30), [skill.sessions]);

  // Weekly breakdown for bar chart (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (w * 7));

      const weekSessions = (skill.sessions || []).filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const totalMinutes = weekSessions.reduce((sum, s) => sum + s.minutes, 0);

      weeks.push({
        label: `W${4 - w}`,
        minutes: totalMinutes,
        sessions: weekSessions.length,
      });
    }
    return weeks;
  }, [skill.sessions]);

  const maxWeeklyMinutes = Math.max(...weeklyData.map(w => w.minutes), 60);

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      addGoal(skill.id, newGoal.trim());
      setNewGoal('');
      setShowAddGoal(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-slate-700/50 rounded-2xl p-6 mb-4">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-5xl">
                  {skill.icon}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{skill.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded bg-${category?.color || 'slate'}-500/20 text-${category?.color || 'slate'}-400`}>
                      {category?.icon} {category?.name || skill.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded bg-${proficiency.color}-500/20 text-${proficiency.color}-400 font-medium`}>
                      {proficiency.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      Last practiced: {getTimeSince(stats?.lastPracticed)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#1a1724]/50 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-2 text-purple-400 mb-1">
                  <Zap className="w-5 h-5" />
                  <span className="text-xl font-bold">{skill.xp}</span>
                </div>
                <div className="text-xs text-slate-500">Total XP</div>
              </div>
              <div className="bg-[#1a1724]/50 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-2 text-cyan-400 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-bold">{stats?.totalHours || 0}h</span>
                </div>
                <div className="text-xs text-slate-500">Time Invested</div>
              </div>
              <div className="bg-[#1a1724]/50 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
                  <Flame className="w-5 h-5" />
                  <span className="text-xl font-bold">{stats?.streak || 0}</span>
                </div>
                <div className="text-xs text-slate-500">Day Streak</div>
              </div>
              <div className="bg-[#1a1724]/50 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xl font-bold">{stats?.totalSessions || 0}</span>
                </div>
                <div className="text-xs text-slate-500">Sessions</div>
              </div>
            </div>

            {/* Log Practice Button */}
            <button
              onClick={onLogPractice}
              className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Practice Session
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#1a1724]/50 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-[#12101a] border border-slate-700/50 rounded-2xl p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Level Progress */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Level Progress
                  </h3>
                  <div className="bg-[#1a1724] rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium text-${proficiency.color}-400`}>
                        {proficiency.name}
                      </span>
                      <span className="text-sm text-slate-400">
                        {Math.round(progress.percent)}% to next level
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full bg-gradient-to-r from-${proficiency.color}-500 to-${proficiency.color}-400 transition-all duration-500`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{skill.xp} XP</span>
                      <span>{progress.toNextLevel} XP to next level</span>
                    </div>

                    {/* Level milestones */}
                    <div className="mt-4 flex justify-between">
                      {PROFICIENCY_LEVELS.map((level, i) => {
                        const isActive = level.id === proficiency.id;
                        const isPast = PROFICIENCY_LEVELS.findIndex(l => l.id === proficiency.id) > i;
                        return (
                          <div key={level.id} className="text-center">
                            <div
                              className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-medium ${
                                isActive
                                  ? `bg-${level.color}-500 text-white`
                                  : isPast
                                    ? `bg-${level.color}-500/30 text-${level.color}-400`
                                    : 'bg-slate-700 text-slate-500'
                              }`}
                            >
                              {i + 1}
                            </div>
                            <div className={`text-[10px] ${isActive ? `text-${level.color}-400` : 'text-slate-500'}`}>
                              {level.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 30-Day Heatmap */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    30-Day Activity
                  </h3>
                  <div className="bg-[#1a1724] rounded-xl p-4 border border-slate-700/50">
                    <div className="grid grid-cols-10 gap-1">
                      {heatmap30.map((day, i) => {
                        const intensity = day.minutes > 60 ? 3 : day.minutes > 30 ? 2 : day.minutes > 0 ? 1 : 0;
                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded-sm transition-colors ${
                              intensity === 0 ? 'bg-slate-700/50' :
                              intensity === 1 ? 'bg-green-500/30' :
                              intensity === 2 ? 'bg-green-500/60' :
                              'bg-green-500'
                            }`}
                            title={`${formatDate(day.date)}: ${day.minutes}m`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>30 days ago</span>
                      <div className="flex items-center gap-1">
                        <span>Less</span>
                        <div className="w-3 h-3 rounded-sm bg-slate-700/50" />
                        <div className="w-3 h-3 rounded-sm bg-green-500/30" />
                        <div className="w-3 h-3 rounded-sm bg-green-500/60" />
                        <div className="w-3 h-3 rounded-sm bg-green-500" />
                        <span>More</span>
                      </div>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Weekly Practice
                  </h3>
                  <div className="bg-[#1a1724] rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-end gap-2 h-32">
                      {weeklyData.map((week, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex-1 flex items-end">
                            <div
                              className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all duration-300 hover:from-purple-400 hover:to-pink-400"
                              style={{
                                height: `${(week.minutes / maxWeeklyMinutes) * 100}%`,
                                minHeight: week.minutes > 0 ? '8px' : '0',
                              }}
                              title={`${week.minutes} minutes, ${week.sessions} sessions`}
                            />
                          </div>
                          <div className="text-xs text-slate-500 mt-2">{week.label}</div>
                          <div className="text-xs text-slate-400">{week.minutes}m</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {skill.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-slate-400">{skill.description}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Practice History
                  </h3>
                  <span className="text-sm text-slate-500">{skill.sessions?.length || 0} sessions</span>
                </div>

                {skill.sessions && skill.sessions.length > 0 ? (
                  <div className="space-y-3">
                    {skill.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-[#1a1724] rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">{formatDate(session.date)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-cyan-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{session.minutes}m</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-yellow-400">
                                <Zap className="w-4 h-4" />
                                <span className="text-sm font-medium">+{session.xpEarned} XP</span>
                              </div>
                            </div>
                            {session.notes && (
                              <p className="text-sm text-slate-400">{session.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No practice sessions logged yet</p>
                    <button
                      onClick={onLogPractice}
                      className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors"
                    >
                      Log your first session
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-6">
                {/* Active Goals */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Goals
                    </h3>
                    <button
                      onClick={() => setShowAddGoal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Goal
                    </button>
                  </div>

                  {showAddGoal && (
                    <div className="bg-[#1a1724] rounded-xl p-4 border border-purple-500/30 mb-4">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="What do you want to achieve?"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-3"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setNewGoal('');
                            setShowAddGoal(false);
                          }}
                          className="flex-1 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddGoal}
                          className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                        >
                          Add Goal
                        </button>
                      </div>
                    </div>
                  )}

                  {skill.goals && skill.goals.length > 0 ? (
                    <div className="space-y-2">
                      {skill.goals.filter(g => !g.completed).map((goal) => (
                        <div
                          key={goal.id}
                          className="bg-[#1a1724] rounded-xl p-4 border border-slate-700/50 flex items-center gap-3"
                        >
                          <button
                            onClick={() => toggleGoal(skill.id, goal.id)}
                            className="w-6 h-6 rounded-full border-2 border-slate-600 hover:border-purple-500 transition-colors flex-shrink-0"
                          />
                          <span className="flex-1 text-slate-300">{goal.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showAddGoal && (
                      <div className="text-center py-8 text-slate-500">
                        <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No goals set yet</p>
                      </div>
                    )
                  )}
                </div>

                {/* Completed Goals */}
                {skill.goals && skill.goals.some(g => g.completed) && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Completed</h4>
                    <div className="space-y-2">
                      {skill.goals.filter(g => g.completed).map((goal) => (
                        <div
                          key={goal.id}
                          className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 flex items-center gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <span className="flex-1 text-slate-400 line-through">{goal.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Milestones
                  </h3>
                  {skill.milestones && skill.milestones.length > 0 ? (
                    <div className="space-y-2">
                      {skill.milestones.map((milestone, i) => (
                        <div
                          key={i}
                          className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20 flex items-center gap-3"
                        >
                          <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          <span className="text-slate-300">{milestone}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No milestones achieved yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
