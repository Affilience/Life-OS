/**
 * North Star - Purpose & Values
 * Define mission, vision, values, and track important decisions
 * Identity evolution and values alignment
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurposeStore } from '../stores/purposeStore';
import { PurposeSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';
import PageHeader from '../components/shared/PageHeader';
import {
  Compass,
  Target,
  Heart,
  TrendingUp,
  Plus,
  Edit2,
  Star,
  Lightbulb,
  Flag,
  X,
  Check,
} from 'lucide-react';
import Card from '../components/ui/Card';
import ValuesAssessment from '../components/purpose/ValuesAssessment';

const PurposeValues = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { coreValues, initializeFromSupabase } = usePurposeStore();
  const navigate = useNavigate();
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Initialize from Supabase on mount
  useEffect(() => {
    initializeFromSupabase?.();
  }, []);

  // Show setup wizard if purpose module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('purpose');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Compass },
    { id: 'resolutions', name: 'Resolutions', icon: Target, isLink: true, href: '/resolutions' },
    { id: 'mission', name: 'Mission', icon: Flag },
    { id: 'values', name: 'Values', icon: Heart },
    { id: 'vision', name: 'Vision', icon: TrendingUp },
  ];

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onTabChange={setActiveTab} />;
      case 'mission':
        return <MissionView />;
      case 'values':
        return <ValuesView />;
      case 'vision':
        return <VisionView />;
      default:
        return <DashboardView onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="purpose-page min-h-screen bg-[#0c0a10]">
      {/* Page Header */}
      <div className="px-4 pt-6">
        <PageHeader
          title="North Star"
          subtitle="Define your mission, vision, and core values"
          icon={Compass}
          module="missions"
          variant="elevated"
        />
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-[9999] bg-[#0c0a10] border-b border-slate-800" data-tour="purpose-tabs">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                data-tour={`purpose-tab-${tab.id}`}
                onClick={() => {
                  if (tab.isLink && tab.href) {
                    navigate(tab.href);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`relative z-[10000] flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1724]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Setup Wizard (if needed) */}
      {showSetup && (
        <div className="p-4">
          <PurposeSetup
            onComplete={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('purpose');
            }}
            onSkip={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('purpose');
            }}
          />
        </div>
      )}

      {/* Active Tab Content */}
      <div className="tab-content">
        {!showSetup && renderView()}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Dashboard View
function DashboardView({ onTabChange }) {
  const { missionStatement, coreValues, personalVision, getTopValues } =
    usePurposeStore();

  const topValues = getTopValues(3);

  return (
    <div className="space-y-6 p-4" data-tour="purpose-dashboard-section">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="purpose-overview-stats">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-transparent border border-purple-500/20 p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <Heart className="w-8 h-8 text-purple-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{coreValues.length}</div>
          <div className="text-sm text-purple-300/70">Core Values</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent border border-blue-500/20 p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <Target className="w-8 h-8 text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{missionStatement ? '✓' : '—'}</div>
          <div className="text-sm text-blue-300/70">Mission Defined</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 via-pink-600/10 to-transparent border border-pink-500/20 p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <TrendingUp className="w-8 h-8 text-pink-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{Object.values(personalVision || {}).filter(Boolean).length}</div>
          <div className="text-sm text-pink-300/70">Visions Set</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/20 p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <Compass className="w-8 h-8 text-amber-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{topValues.length > 0 ? '🔥' : '—'}</div>
          <div className="text-sm text-amber-300/70">Aligned</div>
        </div>
      </div>

      {/* Mission Statement Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 via-purple-900/20 to-slate-800/50 border border-purple-500/20" data-tour="purpose-mission-preview">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Personal Mission</h3>
              <p className="text-sm text-slate-400">Your guiding purpose</p>
            </div>
          </div>
          {missionStatement ? (
            <blockquote className="text-xl font-medium text-white/90 leading-relaxed pl-4 border-l-4 border-purple-500">
              "{missionStatement}"
            </blockquote>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 mb-4">Your mission statement awaits discovery</p>
              <button
                onClick={() => onTabChange?.('mission')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all"
              >
                Define Your Mission
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Values */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            Your Core Values
          </h3>
        </div>
        <div className="p-5">
          {topValues.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">Define what matters most to you</p>
              <button
                onClick={() => onTabChange?.('values')}
                className="px-5 py-2.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-xl font-medium transition-all border border-pink-500/30"
              >
                Add Your First Value
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {topValues.map((value, idx) => (
                <div
                  key={`${value.id}-${idx}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:border-purple-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{value.name}</h4>
                    <p className="text-sm text-slate-400">{value.description}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-yellow-300">{value.importance}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vision Preview */}
      {personalVision && Object.values(personalVision).some(Boolean) && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Life Vision Snapshot
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalVision.oneYear && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-xs text-blue-400 font-semibold mb-2">1 YEAR</div>
                <p className="text-sm text-slate-300 line-clamp-2">{personalVision.oneYear}</p>
              </div>
            )}
            {personalVision.fiveYear && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-xs text-purple-400 font-semibold mb-2">5 YEARS</div>
                <p className="text-sm text-slate-300 line-clamp-2">{personalVision.fiveYear}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mission View
function MissionView() {
  const { missionStatement, setMissionStatement } = usePurposeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMission, setEditedMission] = useState(missionStatement);

  const handleSave = () => {
    setMissionStatement(editedMission);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 p-4" data-tour="purpose-mission-section">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-slate-800/50 to-blue-900/40 border border-purple-500/20 p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-6 shadow-xl shadow-purple-500/30">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Your Personal Mission</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            What is your purpose? What impact do you want to make on the world?
          </p>
        </div>
      </div>

      {/* Mission Statement Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-800/30 border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="relative p-6">
          {!isEditing ? (
            <div>
              {missionStatement ? (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                    <blockquote className="pl-6 text-xl md:text-2xl font-medium text-white/90 leading-relaxed italic">
                      "{missionStatement}"
                    </blockquote>
                  </div>
                  <button
                    onClick={() => {
                      setEditedMission(missionStatement);
                      setIsEditing(true);
                    }}
                    className="w-full px-5 py-3.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl flex items-center justify-center gap-2 border border-purple-500/20 hover:border-purple-500/40 transition-all font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Mission Statement
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400 mb-6">
                    You haven't defined your mission statement yet.
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-4 rounded-xl font-semibold shadow-xl shadow-purple-500/30 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all"
                  >
                    Define Your Mission
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-3">
                  Your Mission Statement
                </label>
                <textarea
                  value={editedMission}
                  onChange={(e) => setEditedMission(e.target.value)}
                  placeholder="e.g., To build products that empower people to live intentionally and achieve their full potential..."
                  rows={6}
                  className="w-full px-5 py-4 rounded-xl resize-none focus:outline-none bg-slate-900/50 border border-slate-600/50 focus:border-purple-500/50 text-white placeholder:text-slate-500 transition-all text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedMission(missionStatement);
                  }}
                  className="flex-1 px-5 py-3.5 rounded-xl font-medium bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 border border-slate-600/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-5 py-3.5 rounded-xl font-semibold shadow-lg shadow-purple-500/30 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all"
                >
                  Save Mission
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mission Examples */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
        <div className="p-5 border-b border-slate-700/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Examples for Inspiration</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="rounded-xl p-4 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all group cursor-pointer">
            <p className="text-slate-300 italic group-hover:text-white transition-colors">
              "To create businesses that solve real problems while maintaining complete
              freedom and control over my time and decisions."
            </p>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-all group cursor-pointer">
            <p className="text-slate-300 italic group-hover:text-white transition-colors">
              "To master my craft, build exceptional products, and help others achieve
              financial and creative independence."
            </p>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-r from-pink-500/10 to-transparent border border-pink-500/20 hover:border-pink-500/40 transition-all group cursor-pointer">
            <p className="text-slate-300 italic group-hover:text-white transition-colors">
              "To live with intention, continuously learn and grow, and create value that
              outlasts me."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Values View
function ValuesView() {
  const { coreValues, addValue, updateValue, deleteValue } = usePurposeStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  const handleAssessmentComplete = (values) => {
    values.forEach((value) => {
      addValue(value);
    });
    setShowAssessment(false);
  };

  if (showAssessment) {
    return <ValuesAssessment onComplete={handleAssessmentComplete} />;
  }

  return (
    <div className="space-y-6 p-4" data-tour="purpose-values-section">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-900/40 via-slate-800/50 to-purple-900/40 border border-pink-500/20 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-xl shadow-pink-500/30">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Your Core Values</h2>
              <p className="text-slate-400">
                What principles guide your decisions and actions?
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAssessment(true)}
              className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all font-medium"
            >
              <Lightbulb className="w-4 h-4" />
              Take Assessment
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-pink-500/30 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all font-semibold"
              data-tour="add-value-btn"
            >
              <Plus className="w-4 h-4" />
              Add Value
            </button>
          </div>
        </div>
      </div>

      {coreValues.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/30 border border-slate-700/50 p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5" />
          <div className="relative text-center">
            <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No values defined yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start by adding your core values or take the assessment to discover what matters most to you.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-xl shadow-pink-500/30 transition-all"
            >
              Add Your First Value
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {coreValues.map((value, idx) => (
            <ValueCard key={value.id} value={value} rank={idx + 1} />
          ))}
        </div>
      )}

      {showAddModal && <AddValueModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

// Vision View
function VisionView() {
  const { personalVision, updateVision } = usePurposeStore();
  const [editingTimeframe, setEditingTimeframe] = useState(null);
  const [editedVision, setEditedVision] = useState('');

  const timeframes = [
    {
      key: 'oneYear',
      label: '1 Year Vision',
      description: 'Where do you see yourself in one year?',
      icon: Target,
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500/30',
      bgGlow: 'bg-blue-500/10',
    },
    {
      key: 'fiveYear',
      label: '5 Year Vision',
      description: 'Where do you see yourself in five years?',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-violet-500',
      borderColor: 'border-purple-500/30',
      bgGlow: 'bg-purple-500/10',
    },
    {
      key: 'tenYear',
      label: '10 Year Vision',
      description: 'Where do you see yourself in ten years?',
      icon: Star,
      gradient: 'from-pink-500 to-rose-500',
      borderColor: 'border-pink-500/30',
      bgGlow: 'bg-pink-500/10',
    },
    {
      key: 'ultimate',
      label: 'Ultimate Vision',
      description: 'What is your ultimate life vision?',
      icon: Compass,
      gradient: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-500/30',
      bgGlow: 'bg-amber-500/10',
    },
  ];

  const handleSave = (timeframe) => {
    updateVision(timeframe, editedVision);
    setEditingTimeframe(null);
    setEditedVision('');
  };

  return (
    <div className="space-y-6 p-4" data-tour="purpose-vision-section">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-800/50 to-purple-900/40 border border-blue-500/20 p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-blue-500/20 to-transparent blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-6 shadow-xl shadow-blue-500/30">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Your Life Vision</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Paint a picture of your future across different time horizons
          </p>
        </div>
      </div>

      {/* Vision Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeframes.map((timeframe) => {
          const Icon = timeframe.icon;
          const isEditing = editingTimeframe === timeframe.key;
          const currentVision = personalVision[timeframe.key];
          const hasVision = !!currentVision;

          return (
            <div
              key={timeframe.key}
              className={`relative overflow-hidden rounded-2xl bg-slate-800/30 border transition-all hover:border-opacity-60 ${timeframe.borderColor} ${hasVision ? 'border-opacity-50' : 'border-slate-700/50'}`}
            >
              {hasVision && (
                <div className={`absolute inset-0 ${timeframe.bgGlow} opacity-30`} />
              )}
              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${timeframe.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {timeframe.label}
                    </h3>
                    <p className="text-sm text-slate-400">{timeframe.description}</p>
                  </div>
                </div>

                {!isEditing ? (
                  <div>
                    {currentVision ? (
                      <div className="space-y-4">
                        <div className="relative pl-4 border-l-2 border-slate-600">
                          <p className="text-slate-300 leading-relaxed">{currentVision}</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingTimeframe(timeframe.key);
                            setEditedVision(currentVision);
                          }}
                          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit Vision
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTimeframe(timeframe.key)}
                        className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium border border-dashed border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300 transition-all bg-slate-900/30 hover:bg-slate-900/50`}
                      >
                        + Define Your {timeframe.label}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={editedVision}
                      onChange={(e) => setEditedVision(e.target.value)}
                      placeholder={`Describe your ${timeframe.label.toLowerCase()}...`}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none bg-slate-900/50 border border-slate-600/50 focus:border-purple-500/50 text-white placeholder:text-slate-500 transition-all"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTimeframe(null);
                          setEditedVision('');
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 border border-slate-600/50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(timeframe.key)}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${timeframe.gradient} hover:opacity-90 text-white shadow-lg transition-all`}
                      >
                        Save Vision
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// Value Card Component
function ValueCard({ value, rank }) {
  const { updateValue } = usePurposeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editImportance, setEditImportance] = useState(value.importance);

  // Gradient colors based on rank
  const rankColors = [
    'from-amber-500 to-orange-500', // 1st
    'from-slate-300 to-slate-400',  // 2nd
    'from-amber-600 to-amber-700',  // 3rd
    'from-purple-500 to-pink-500',  // 4th+
  ];
  const rankGradient = rank <= 3 ? rankColors[rank - 1] : rankColors[3];
  const isTop3 = rank <= 3;

  const handleSave = () => {
    updateValue(value.id, { importance: editImportance });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditImportance(value.importance);
    setIsEditing(false);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-800/30 border transition-all hover:border-purple-500/40 group ${isTop3 ? 'border-purple-500/30' : 'border-slate-700/50'}`}>
      {isTop3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5" />
      )}
      <div className="relative p-5">
        <div className="flex items-center gap-5">
          <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${rankGradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <span className="text-xl font-bold text-white">{rank}</span>
            {rank === 1 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors truncate">{value.name}</h4>
            <p className="text-sm text-slate-400 line-clamp-2">{value.description}</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all cursor-pointer"
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-xl text-white">{value.importance}</span>
              <span className="text-slate-500 text-sm">/10</span>
              <Edit2 className="w-4 h-4 text-slate-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:text-white hover:bg-purple-500/30 transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Edit Mode - Importance Slider */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 w-20">Importance:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={editImportance}
                onChange={(e) => setEditImportance(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 min-w-[100px] justify-center">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-xl text-white">{editImportance}</span>
                <span className="text-slate-500 text-sm">/10</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Value Modal
function AddValueModal({ onClose }) {
  const { addValue } = usePurposeStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    importance: 5,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a value name');
      return;
    }
    addValue(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full max-w-lg bg-slate-900/95 border border-pink-500/30">
        {/* Header Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-pink-500/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 border-b border-pink-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add Core Value</h2>
              <p className="text-sm text-slate-400">Define what matters most to you</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-pink-300 mb-2">
              Value Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Freedom, Growth, Impact..."
              className="w-full px-4 py-3.5 rounded-xl focus:outline-none bg-slate-800/50 border border-slate-600/50 focus:border-pink-500/50 text-white placeholder:text-slate-500 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-pink-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this value mean to you?"
              rows={3}
              className="w-full px-4 py-3.5 rounded-xl resize-none focus:outline-none bg-slate-800/50 border border-slate-600/50 focus:border-pink-500/50 text-white placeholder:text-slate-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-pink-300 mb-3">
              Importance
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.importance}
                onChange={(e) =>
                  setFormData({ ...formData, importance: parseInt(e.target.value) })
                }
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-600/50">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-xl text-white">{formData.importance}</span>
                <span className="text-slate-500 text-sm">/10</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3.5 rounded-xl font-medium bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 border border-slate-600/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3.5 rounded-xl font-semibold shadow-lg shadow-pink-500/30 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all"
            >
              Add Value
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default PurposeValues;
