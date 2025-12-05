import React, { useState, useMemo } from 'react';
import { Plus, Target, Clock, TrendingUp, Flame } from 'lucide-react';
import useSkillsStore, {
  getProficiencyLevel,
  getXpProgress,
  SKILL_CATEGORIES,
} from '../stores/skillsStore';
import LogPracticeModal from '../components/skills/LogPracticeModal';
import SkillDetailView from '../components/skills/SkillDetailView';

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
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showLogPractice, setShowLogPractice] = useState(false);
  const [logPracticeSkill, setLogPracticeSkill] = useState(null);

  // New skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('other');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [newSkillIcon, setNewSkillIcon] = useState('✨');

  // Get skills from store
  const { skills, getOverallStats, addSkill, getSkillStats } = useSkillsStore();
  const overallStats = useMemo(() => getOverallStats(), [skills, getOverallStats]);


  // Quick log practice
  const handleQuickLog = (skill) => {
    setLogPracticeSkill(skill);
    setShowLogPractice(true);
  };

  // Handle practice logged
  const handlePracticeLogged = (result) => {
    // Could show a toast notification here
    console.log('Practice logged:', result);
  };

  // Handle add new skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      description: newSkillDescription.trim(),
      icon: newSkillIcon,
    });

    // Reset form
    setNewSkillName('');
    setNewSkillCategory('other');
    setNewSkillDescription('');
    setNewSkillIcon('✨');
    setShowAddSkill(false);
  };

  // Skill icon options
  const iconOptions = ['✨', '💻', '🎸', '🎨', '📱', '🌍', '💪', '📚', '🎯', '🚀', '⚡', '🔥', '🎮', '🎹', '📷', '✍️'];

  // If a skill is selected, show detail view
  if (selectedSkill) {
    return (
      <SkillDetailView
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onLogPractice={() => {
          setLogPracticeSkill(selectedSkill);
          setShowLogPractice(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent border border-slate-800/50 rounded-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="relative px-4 py-6 text-center">

          {/* Quick Stats */}
          <div className="flex justify-center gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{overallStats.totalSkills}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Active Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {overallStats.totalHours}h
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Total Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {overallStats.bestStreak}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Best Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {skills.map(skill => {
            const proficiency = getProficiencyLevel(skill.xp);
            const progress = getXpProgress(skill.xp);
            const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
            const stats = getSkillStats(skill.id);

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
                        <span className={`text-xs px-2 py-0.5 rounded bg-${category?.color || 'slate'}-500/20 text-${category?.color || 'slate'}-400`}>
                          {category?.name || skill.category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded bg-${proficiency.color}-500/20 text-${proficiency.color}-400`}>
                          {proficiency.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {skill.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{skill.description}</p>
                )}

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
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{stats?.streak || 0}</span>
                    </div>
                    <div className="text-xs text-slate-500">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{stats?.totalHours || 0}h</span>
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
                    handleQuickLog(skill);
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
        {skills.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <h3 className="text-lg font-semibold text-white mb-2">No skills yet</h3>
            <p className="text-sm text-slate-400 mb-6">
              Start tracking your first skill to see it here
            </p>
            <button
              onClick={() => setShowAddSkill(true)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
            >
              Add Your First Skill
            </button>
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
        <LogPracticeModal
          skill={logPracticeSkill}
          onClose={() => {
            setShowLogPractice(false);
            setLogPracticeSkill(null);
          }}
          onSuccess={(result) => {
            handlePracticeLogged(result);
            // Refresh selected skill if viewing detail
            if (selectedSkill && selectedSkill.id === logPracticeSkill.id) {
              const updatedSkill = skills.find(s => s.id === selectedSkill.id);
              if (updatedSkill) setSelectedSkill(updatedSkill);
            }
          }}
        />
      )}

      {/* Add Skill Modal */}
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

            <div className="space-y-4">
              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewSkillIcon(icon)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        newSkillIcon === icon
                          ? 'bg-purple-500/30 border-2 border-purple-500'
                          : 'bg-[#1a1724] border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g., JavaScript, Piano, Photography"
                  className="w-full px-4 py-2.5 bg-[#1a1724] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SKILL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewSkillCategory(cat.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                        newSkillCategory === cat.id
                          ? `bg-${cat.color}-500/20 text-${cat.color}-400 border border-${cat.color}-500/30`
                          : 'bg-[#1a1724] text-slate-400 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newSkillDescription}
                  onChange={(e) => setNewSkillDescription(e.target.value)}
                  placeholder="What aspects of this skill do you want to develop?"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#1a1724] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddSkill(false);
                    setNewSkillName('');
                    setNewSkillCategory('other');
                    setNewSkillDescription('');
                    setNewSkillIcon('✨');
                  }}
                  className="flex-1 py-2.5 bg-[#1a1724] hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSkill}
                  disabled={!newSkillName.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
