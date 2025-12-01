/**
 * North Star - Purpose & Values
 * Define mission, vision, values, and track important decisions
 * Identity evolution and values alignment
 */

import React, { useState } from 'react';
import { usePurposeStore } from '../stores/purposeStore';
import {
  Compass,
  Target,
  Heart,
  Brain,
  TrendingUp,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
  Lightbulb,
  Activity,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Stat from '../components/ui/Stat';
import Badge from '../components/ui/Badge';
import CosmicBackground from '../components/ui/CosmicBackground';
import IkigaiDiagram from '../components/purpose/IkigaiDiagram';
import ValuesAssessment from '../components/purpose/ValuesAssessment';

const PurposeValues = () => {
  const [activeView, setActiveView] = useState('overview'); // overview, mission, values, vision, decisions

  const views = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'ikigai', label: 'Ikigai', icon: Activity },
    { id: 'mission', label: 'Mission', icon: Target },
    { id: 'values', label: 'Values', icon: Heart },
    { id: 'vision', label: 'Vision', icon: TrendingUp },
    { id: 'decisions', label: 'Decisions', icon: Brain },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'ikigai':
        return <IkigaiView />;
      case 'mission':
        return <MissionView />;
      case 'values':
        return <ValuesView />;
      case 'vision':
        return <VisionView />;
      case 'decisions':
        return <DecisionsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="relative space-y-6 animate-fade-in">
      <CosmicBackground variant="purple" />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Compass size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              North Star
            </h1>
            <p className="mt-1" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              Define who you are, what you stand for, and where you're going
            </p>
          </div>
        </div>
      </div>

      {/* View Navigation */}
      <Card padding="none">
        <div className="flex" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px`}
                style={{
                  borderColor: isActive ? '#8b5cf6' : 'transparent',
                  color: isActive ? 'rgba(255, 255, 255, 0.87)' : 'rgba(255, 255, 255, 0.60)',
                  background: isActive ? 'rgba(39, 39, 42, 0.4)' : 'transparent',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.87)';
                    e.currentTarget.style.background = 'rgba(39, 39, 42, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.60)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={18} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">{renderView()}</div>
      </Card>
    </div>
  );
};

// Ikigai View
function IkigaiView() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          Find Your Ikigai
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
          Discover your life's purpose at the intersection of passion, mission, vocation, and profession
        </p>
      </div>
      <IkigaiDiagram />
    </div>
  );
}

// Overview View
function OverviewView() {
  const { missionStatement, coreValues, decisions, getDecisionQuality, getTopValues } =
    usePurposeStore();

  const topValues = getTopValues(3);
  const decisionQuality = getDecisionQuality();
  const recentDecisions = decisions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" hover>
          <Stat
            label="Core Values"
            value={coreValues.length}
            icon={Heart}
          />
        </Card>
        <Card padding="md" hover>
          <Stat
            label="Decisions Logged"
            value={decisions.length}
            icon={Brain}
          />
        </Card>
        <Card padding="md" hover>
          <Stat
            label="Decision Quality"
            value={`${Math.round(decisionQuality)}%`}
            delta={decisionQuality > 70 ? '+5%' : '-3%'}
            deltaType={decisionQuality > 70 ? 'positive' : 'negative'}
            icon={TrendingUp}
          />
        </Card>
        <Card padding="md" hover>
          <Stat
            label="Mission Defined"
            value={missionStatement ? 'Yes' : 'No'}
            icon={Target}
          />
        </Card>
      </div>

      {/* Mission Statement */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            <Target className="w-5 h-5 text-purple-400" />
            Personal Mission
          </h3>
        </div>
        {missionStatement ? (
          <p className="text-lg font-medium italic leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            "{missionStatement}"
          </p>
        ) : (
          <p className="italic" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
            Your mission statement is not yet defined.
          </p>
        )}
      </Card>

      {/* Top Values */}
      <Card padding="md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          <Heart className="w-5 h-5 text-purple-400" />
          Top Values
        </h3>
        {topValues.length === 0 ? (
          <p className="italic" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>No values defined yet.</p>
        ) : (
          <div className="space-y-2">
            {topValues.map((value, idx) => (
              <div
                key={value.id}
                className="flex items-center gap-3 rounded-lg p-3"
                style={{
                  background: 'rgba(39, 39, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{value.name}</h4>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>{value.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{value.importance}/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Decisions */}
      <Card padding="md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          <Brain className="w-5 h-5 text-purple-400" />
          Recent Decisions
        </h3>
        {recentDecisions.length === 0 ? (
          <p className="italic" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>No decisions logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} compact />
            ))}
          </div>
        )}
      </Card>
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
          <Target className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>Your Personal Mission</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
          What is your purpose? What impact do you want to make?
        </p>
      </div>

      <Card padding="md">
        {!isEditing ? (
          <div>
            {missionStatement ? (
              <div className="space-y-4">
                <p className="text-xl font-medium italic leading-relaxed text-center" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                  "{missionStatement}"
                </p>
                <button
                  onClick={() => {
                    setEditedMission(missionStatement);
                    setIsEditing(true);
                  }}
                  className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg flex items-center justify-center gap-2"
                  style={{ transition: 'all 150ms' }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Mission
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                  You haven't defined your mission statement yet.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 rounded-lg shadow-lg shadow-purple-500/30"
                  style={{
                    background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
                    color: 'rgba(255, 255, 255, 0.87)',
                    transition: 'all 250ms'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #2563eb)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #3b82f6)';
                  }}
                >
                  Define Your Mission
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
                Mission Statement
              </label>
              <textarea
                value={editedMission}
                onChange={(e) => setEditedMission(e.target.value)}
                placeholder="e.g., To build products that empower people to live intentionally and achieve their full potential..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none"
                style={{
                  background: 'rgba(39, 39, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: 'rgba(255, 255, 255, 0.87)',
                  transition: 'all 150ms'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedMission(missionStatement);
                }}
                className="flex-1 px-4 py-3 rounded-lg font-medium"
                style={{
                  background: 'rgba(39, 39, 42, 0.4)',
                  color: 'rgba(255, 255, 255, 0.70)',
                  transition: 'all 150ms'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.4)'}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 rounded-lg font-medium shadow-lg shadow-purple-500/30"
                style={{
                  background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
                  color: 'rgba(255, 255, 255, 0.87)',
                  transition: 'all 250ms'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #2563eb)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #3b82f6)'}
              >
                Save Mission
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Mission Examples */}
      <Card padding="md">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          Examples for Inspiration
        </h3>
        <div className="space-y-3">
          <div className="rounded-lg p-3" style={{ background: 'rgba(39, 39, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <p className="text-sm italic" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              "To create businesses that solve real problems while maintaining complete
              freedom and control over my time and decisions."
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'rgba(39, 39, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <p className="text-sm italic" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              "To master my craft, build exceptional products, and help others achieve
              financial and creative independence."
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'rgba(39, 39, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <p className="text-sm italic" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              "To live with intention, continuously learn and grow, and create value that
              outlasts me."
            </p>
          </div>
        </div>
      </Card>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>Your Core Values</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
            What principles guide your decisions and actions?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAssessment(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              transition: 'all 250ms'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
          >
            <Lightbulb className="w-4 h-4" />
            Take Assessment
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/30"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
              color: 'rgba(255, 255, 255, 0.87)',
              transition: 'all 250ms'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #db2777)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #ec4899)'}
          >
            <Plus className="w-4 h-4" />
            Add Value
          </button>
        </div>
      </div>

      {coreValues.length === 0 ? (
        <Card padding="md">
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.38)' }} />
            <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>No values defined yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg"
              style={{ transition: 'all 150ms' }}
            >
              Add Your First Value
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
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
      color: '#3b82f6',
    },
    {
      key: 'fiveYear',
      label: '5 Year Vision',
      description: 'Where do you see yourself in five years?',
      icon: TrendingUp,
      color: '#8b5cf6',
    },
    {
      key: 'tenYear',
      label: '10 Year Vision',
      description: 'Where do you see yourself in ten years?',
      icon: Star,
      color: '#ec4899',
    },
    {
      key: 'ultimate',
      label: 'Ultimate Vision',
      description: 'What is your ultimate life vision?',
      icon: Compass,
      color: '#f59e0b',
    },
  ];

  const handleSave = (timeframe) => {
    updateVision(timeframe, editedVision);
    setEditingTimeframe(null);
    setEditedVision('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>Your Life Vision</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.60)' }}>Paint a picture of your future across different time horizons</p>
      </div>

      <div className="space-y-4">
        {timeframes.map((timeframe) => {
          const Icon = timeframe.icon;
          const isEditing = editingTimeframe === timeframe.key;
          const currentVision = personalVision[timeframe.key];

          return (
            <Card key={timeframe.key} padding="md">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${timeframe.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: timeframe.color }} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                    {timeframe.label}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>{timeframe.description}</p>

                  {!isEditing ? (
                    <div>
                      {currentVision ? (
                        <div className="space-y-3">
                          <p className="leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{currentVision}</p>
                          <button
                            onClick={() => {
                              setEditingTimeframe(timeframe.key);
                              setEditedVision(currentVision);
                            }}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            style={{ transition: 'all 150ms' }}
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingTimeframe(timeframe.key)}
                          className="px-4 py-2 rounded-lg text-sm"
                          style={{
                            background: 'rgba(39, 39, 42, 0.4)',
                            color: 'rgba(255, 255, 255, 0.70)',
                            transition: 'all 150ms'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.6)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.4)'}
                        >
                          Define Vision
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={editedVision}
                        onChange={(e) => setEditedVision(e.target.value)}
                        placeholder={`Describe your ${timeframe.label.toLowerCase()}...`}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none"
                        style={{
                          background: 'rgba(39, 39, 42, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          color: 'rgba(255, 255, 255, 0.87)',
                          transition: 'all 150ms'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTimeframe(null);
                            setEditedVision('');
                          }}
                          className="px-3 py-2 rounded text-sm"
                          style={{
                            background: 'rgba(39, 39, 42, 0.4)',
                            color: 'rgba(255, 255, 255, 0.70)',
                            transition: 'all 150ms'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.6)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.4)'}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(timeframe.key)}
                          className="px-3 py-2 rounded text-sm"
                          style={{
                            background: '#8b5cf6',
                            color: 'rgba(255, 255, 255, 0.87)',
                            transition: 'all 150ms'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#7c3aed'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#8b5cf6'}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Decisions View
function DecisionsView() {
  const { decisions, addDecision } = usePurposeStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const pendingDecisions = decisions.filter((d) => d.outcome === 'pending');
  const completedDecisions = decisions.filter((d) => d.outcome !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>Decision Journal</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
            Track important decisions, learn from outcomes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/30"
          style={{
            background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
            color: 'rgba(255, 255, 255, 0.87)',
            transition: 'all 250ms'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #2563eb)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #3b82f6)'}
        >
          <Plus className="w-4 h-4" />
          Log Decision
        </button>
      </div>

      {/* Pending Decisions */}
      {pendingDecisions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Pending Review ({pendingDecisions.length})
          </h3>
          <div className="space-y-3">
            {pendingDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        </div>
      )}

      {/* All Decisions */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          All Decisions ({decisions.length})
        </h3>
        {decisions.length === 0 ? (
          <Card padding="md">
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.38)' }} />
              <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>No decisions logged yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg"
                style={{ transition: 'all 150ms' }}
              >
                Log Your First Decision
              </button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        )}
      </div>

      {showAddModal && <AddDecisionModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

// Decision Card Component
function DecisionCard({ decision, compact = false }) {
  const outcomeColors = {
    pending: { bg: 'zinc', text: 'zinc-400', icon: AlertCircle },
    good: { bg: 'green', text: 'green-400', icon: CheckCircle2 },
    neutral: { bg: 'blue', text: 'blue-400', icon: Target },
    bad: { bg: 'red', text: 'red-400', icon: AlertCircle },
  };

  const importanceColors = {
    low: 'zinc',
    medium: 'blue',
    high: 'orange',
    critical: 'red',
  };

  const outcomeInfo = outcomeColors[decision.outcome] || outcomeColors.pending;
  const OutcomeIcon = outcomeInfo.icon;

  return (
    <Card padding="md" hover>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{decision.title}</h4>
              <Badge variant={importanceColors[decision.importance]} className="text-xs">
                {decision.importance}
              </Badge>
            </div>
            {!compact && decision.context && (
              <p className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>{decision.context}</p>
            )}
            <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
              <span>{new Date(decision.date).toLocaleDateString()}</span>
              <span>•</span>
              <span className="capitalize">{decision.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OutcomeIcon className={`w-5 h-5 text-${outcomeInfo.text}`} />
          </div>
        </div>

        {!compact && decision.chosenOption && (
          <div className="rounded p-3" style={{ background: 'rgba(39, 39, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>Chosen:</p>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{decision.chosenOption}</p>
          </div>
        )}

        {!compact && decision.actualOutcome && (
          <div className="rounded p-3" style={{ background: 'rgba(39, 39, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>Outcome:</p>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{decision.actualOutcome}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Value Card Component
function ValueCard({ value, rank }) {
  return (
    <Card padding="md" hover>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex-shrink-0">
          {rank}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{value.name}</h4>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>{value.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="font-bold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{value.importance}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.38)' }}>/10</span>
        </div>
      </div>
    </Card>
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
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-xl shadow-2xl w-full max-w-lg" style={{ background: 'rgba(24, 24, 27, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div className="p-6" style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>Add Core Value</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
              Value Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Freedom, Growth, Impact..."
              className="w-full px-4 py-3 rounded-lg focus:outline-none"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 150ms'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this value mean to you?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 150ms'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
              Importance: {formData.importance}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.importance}
              onChange={(e) =>
                setFormData({ ...formData, importance: parseInt(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-medium"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                color: 'rgba(255, 255, 255, 0.70)',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.4)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg font-medium shadow-lg shadow-purple-500/30"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 250ms'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #db2777)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #ec4899)'}
            >
              Add Value
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Decision Modal
function AddDecisionModal({ onClose }) {
  const { addDecision } = usePurposeStore();
  const [formData, setFormData] = useState({
    title: '',
    context: '',
    chosenOption: '',
    expectedOutcome: '',
    category: 'personal',
    importance: 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a decision title');
      return;
    }
    addDecision(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-xl shadow-2xl w-full max-w-2xl" style={{ background: 'rgba(24, 24, 27, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div className="p-6" style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>Log Decision</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
              Decision Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Accept job offer at Startup X"
              className="w-full px-4 py-3 rounded-lg focus:outline-none"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 150ms'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
              Context
            </label>
            <textarea
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="What led to this decision? What factors are at play?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 150ms'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:outline-none"
                style={{
                  background: 'rgba(39, 39, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: 'rgba(255, 255, 255, 0.87)',
                  transition: 'all 150ms'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="relationship">Relationship</option>
                <option value="health">Health</option>
                <option value="financial">Financial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
                Importance
              </label>
              <select
                value={formData.importance}
                onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:outline-none"
                style={{
                  background: 'rgba(39, 39, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: 'rgba(255, 255, 255, 0.87)',
                  transition: 'all 150ms'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
              What did you choose?
            </label>
            <input
              type="text"
              value={formData.chosenOption}
              onChange={(e) => setFormData({ ...formData, chosenOption: e.target.value })}
              placeholder="Your decision..."
              className="w-full px-4 py-3 rounded-lg focus:outline-none"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 150ms'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
              Expected Outcome
            </label>
            <textarea
              value={formData.expectedOutcome}
              onChange={(e) =>
                setFormData({ ...formData, expectedOutcome: e.target.value })
              }
              placeholder="What do you expect will happen?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 150ms'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-medium"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                color: 'rgba(255, 255, 255, 0.70)',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(39, 39, 42, 0.4)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg font-medium shadow-lg shadow-purple-500/30"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
                color: 'rgba(255, 255, 255, 0.87)',
                transition: 'all 250ms'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #2563eb)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #3b82f6)'}
            >
              Log Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurposeValues;
