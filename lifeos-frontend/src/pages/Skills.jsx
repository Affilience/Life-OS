import React, { useState } from 'react';
import { Plus, Target, Clock, TrendingUp, Flame, Star, ChevronRight, Filter, Search } from 'lucide-react';

/**
 * Skills - Individual Skill Learning & Tracking
 *
 * Track specific competencies and practice sessions.
 * Different from Constellations which tracks module-level progression.
 *
 * Features:
 * - Create/manage individual skills
 * - Log practice sessions with duration
 * - Track progress levels (Beginner → Expert)
 * - View practice streaks and total time invested
 * - Filter by category and proficiency level
 */

const Skills = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showLogPractice, setShowLogPractice] = useState(false);
  const [logPracticeSkill, setLogPracticeSkill] = useState(null);
  const [practiceMinutes, setPracticeMinutes] = useState('');
  const [practiceNotes, setPracticeNotes] = useState('');

  // Skill categories
  const categories = [
    { id: 'programming', name: 'Programming', icon: '💻', color: 'blue' },
    { id: 'language', name: 'Languages', icon: '🌍', color: 'green' },
    { id: 'creative', name: 'Creative', icon: '🎨', color: 'purple' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: 'red' },
    { id: 'business', name: 'Business', icon: '💼', color: 'yellow' },
    { id: 'other', name: 'Other', icon: '✨', color: 'slate' },
  ];

  // Proficiency levels
  const proficiencyLevels = [
    { id: 'beginner', name: 'Beginner', xpRange: [0, 1000], color: 'slate' },
    { id: 'novice', name: 'Novice', xpRange: [1000, 2500], color: 'green' },
    { id: 'intermediate', name: 'Intermediate', xpRange: [2500, 5000], color: 'blue' },
    { id: 'advanced', name: 'Advanced', xpRange: [5000, 10000], color: 'purple' },
    { id: 'expert', name: 'Expert', xpRange: [10000, Infinity], color: 'orange' },
  ];

  // Mock skills data - will be replaced with store/API
  const mockSkills = [
    {
      id: 1,
      name: 'Python Programming',
      category: 'programming',
      xp: 2800,
      totalMinutes: 1240,
      streak: 7,
      lastPracticed: '2024-01-20',
      description: 'Backend development, data science, automation',
      icon: '🐍',
    },
    {
      id: 2,
      name: 'Spanish',
      category: 'language',
      xp: 1200,
      totalMinutes: 890,
      streak: 14,
      lastPracticed: '2024-01-21',
      description: 'Conversational Spanish for travel and business',
      icon: '🇪🇸',
    },
    {
      id: 3,
      name: 'Digital Marketing',
      category: 'business',
      xp: 1800,
      totalMinutes: 620,
      streak: 3,
      lastPracticed: '2024-01-19',
      description: 'SEO, social media, content marketing',
      icon: '📱',
    },
    {
      id: 4,
      name: 'Guitar',
      category: 'creative',
      xp: 4200,
      totalMinutes: 2840,
      streak: 21,
      lastPracticed: '2024-01-21',
      description: 'Acoustic guitar, fingerstyle and strumming',
      icon: '🎸',
    },
  ];

  // Calculate proficiency level
  const getProficiencyLevel = (xp) => {
    return proficiencyLevels.find(level =>
      xp >= level.xpRange[0] && xp < level.xpRange[1]
    ) || proficiencyLevels[0];
  };

  // Filter skills
  const filteredSkills = mockSkills.filter(skill => {
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const levelData = getProficiencyLevel(skill.xp);
    const matchesLevel = filterLevel === 'all' || levelData.id === filterLevel;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  // Calculate XP progress to next level
  const getXpProgress = (xp) => {
    const currentLevel = getProficiencyLevel(xp);
    const levelIndex = proficiencyLevels.findIndex(l => l.id === currentLevel.id);

    if (levelIndex === proficiencyLevels.length - 1) {
      return { percent: 100, current: xp, next: xp };
    }

    const nextLevel = proficiencyLevels[levelIndex + 1];
    const rangeStart = currentLevel.xpRange[0];
    const rangeEnd = nextLevel.xpRange[0];
    const progress = ((xp - rangeStart) / (rangeEnd - rangeStart)) * 100;

    return {
      percent: Math.min(100, progress),
      current: xp - rangeStart,
      next: rangeEnd - rangeStart,
    };
  };

  // Quick log practice
  const handleQuickLog = (skillId) => {
    const skill = mockSkills.find(s => s.id === skillId);
    setLogPracticeSkill(skill);
    setShowLogPractice(true);
  };

  const handleSavePractice = () => {
    if (!practiceMinutes || practiceMinutes <= 0) {
      alert('Please enter valid practice time');
      return;
    }

    console.log('Logging practice:', {
      skill: logPracticeSkill.name,
      minutes: practiceMinutes,
      notes: practiceNotes
    });

    // TODO: Add to store/API

    // Reset and close
    setPracticeMinutes('');
    setPracticeNotes('');
    setShowLogPractice(false);
    setLogPracticeSkill(null);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent border border-slate-800/50 rounded-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="relative px-4 py-6 text-center">

          {/* Quick Stats */}
          <div className="flex justify-center gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{mockSkills.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Active Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {mockSkills.reduce((sum, s) => sum + s.totalMinutes, 0)}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Total Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {Math.max(...mockSkills.map(s => s.streak))}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Best Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Filters & Search */}
        <div className="mb-6 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1724]/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterCategory === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#1a1724]/50 text-slate-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === cat.id
                    ? `bg-${cat.color}-500 text-white`
                    : 'bg-[#1a1724]/50 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setFilterLevel('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterLevel === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-[#1a1724]/50 text-slate-500 hover:text-white'
              }`}
            >
              All Levels
            </button>
            {proficiencyLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setFilterLevel(level.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterLevel === level.id
                    ? `bg-${level.color}-500/20 text-${level.color}-400 border border-${level.color}-500/30`
                    : 'bg-[#1a1724]/50 text-slate-500 hover:text-white'
                }`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredSkills.map(skill => {
            const proficiency = getProficiencyLevel(skill.xp);
            const progress = getXpProgress(skill.xp);
            const category = categories.find(c => c.id === skill.category);

            return (
              <div
                key={skill.id}
                className="bg-[#1a1724]/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 hover:border-purple-500/30 transition-all cursor-pointer group"
                onClick={() => setSelectedSkill(skill)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center text-2xl">
                      {skill.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {skill.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded bg-${category.color}-500/20 text-${category.color}-400`}>
                          {category.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded bg-${proficiency.color}-500/20 text-${proficiency.color}-400`}>
                          {proficiency.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{skill.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{skill.xp} XP</span>
                    <span>{Math.round(progress.percent)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${proficiency.color}-500 to-${proficiency.color}-400 transition-all duration-500`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{skill.streak}</span>
                    </div>
                    <div className="text-xs text-slate-500">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{Math.round(skill.totalMinutes / 60)}h</span>
                    </div>
                    <div className="text-xs text-slate-500">Time</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{skill.xp}</span>
                    </div>
                    <div className="text-xs text-slate-500">XP</div>
                  </div>
                </div>

                {/* Quick Log Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLog(skill.id);
                  }}
                  className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm font-semibold text-purple-400 transition-all"
                >
                  Log Practice
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <h3 className="text-lg font-semibold text-white mb-2">No skills found</h3>
            <p className="text-sm text-slate-400 mb-6">
              {searchQuery || filterCategory !== 'all' || filterLevel !== 'all'
                ? 'Try adjusting your filters'
                : 'Start tracking your first skill to see it here'}
            </p>
            {!searchQuery && filterCategory === 'all' && filterLevel === 'all' && (
              <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors">
                Add Your First Skill
              </button>
            )}
          </div>
        )}

        {/* Add Skill FAB */}
        <button
          onClick={() => setShowAddSkill(true)}
          className="fixed bottom-20 md:bottom-8 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Add New Skill"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Log Practice Modal */}
      {showLogPractice && logPracticeSkill && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12101a] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{logPracticeSkill.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Log Practice</h3>
                  <p className="text-sm text-slate-400">{logPracticeSkill.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLogPractice(false);
                  setLogPracticeSkill(null);
                  setPracticeMinutes('');
                  setPracticeNotes('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={practiceMinutes}
                  onChange={(e) => setPracticeMinutes(e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-2.5 bg-[#1a1724] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={practiceNotes}
                  onChange={(e) => setPracticeNotes(e.target.value)}
                  placeholder="What did you work on?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#1a1724] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowLogPractice(false);
                    setLogPracticeSkill(null);
                    setPracticeMinutes('');
                    setPracticeNotes('');
                  }}
                  className="flex-1 py-2.5 bg-[#1a1724] hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePractice}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-semibold transition-all"
                >
                  Save Practice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal (Placeholder) */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12101a] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add New Skill</h3>
              <button
                onClick={() => setShowAddSkill(false)}
                className="text-slate-400 hover:text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="text-center py-8 text-slate-400">
              <Target className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>Add new skill functionality coming soon...</p>
              <button
                onClick={() => setShowAddSkill(false)}
                className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Skills;
