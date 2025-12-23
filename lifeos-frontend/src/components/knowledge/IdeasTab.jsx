import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Lightbulb, Sprout, TreePine, Trophy, Clock, Tag, Star, Sparkles, TrendingUp, Zap, Target, ChevronRight, MoreHorizontal, Edit3, ArrowUpRight } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import AddIdeaModal from './AddIdeaModal';
import { EmptyState } from '../ui';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { triggerGamification } from '../../hooks/useGamification';
import './IdeasTab.css';

const IdeasTab = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');
  const [editingIdea, setEditingIdea] = useState(null);
  const [hoveredIdea, setHoveredIdea] = useState(null);

  // Get data from store
  const { notes, createNote, updateNote, initializeFromSupabase } = useKnowledgeStore();

  // Initialize data on mount
  useEffect(() => {
    initializeFromSupabase?.();
  }, []);

  // Transform notes with 'idea' tag into ideas format
  const { ideas, stats } = useMemo(() => {
    const ideaNotes = (notes || []).filter(note =>
      note.tags?.includes('idea') || note.tags?.includes('Idea')
    );

    const transformedIdeas = ideaNotes.map(note => {
      // Determine stage from tags
      let stage = 'seed';
      if (note.tags?.includes('mature') || note.tags?.includes('completed')) stage = 'mature';
      else if (note.tags?.includes('growing') || note.tags?.includes('in-progress')) stage = 'growing';
      else if (note.tags?.includes('sprouting')) stage = 'sprouting';

      // Determine priority from tags
      let priority = 'medium';
      if (note.tags?.includes('high-priority') || note.tags?.includes('urgent')) priority = 'high';
      else if (note.tags?.includes('low-priority')) priority = 'low';

      // Get category from first non-stage/priority tag
      const skipTags = ['idea', 'Idea', 'seed', 'sprouting', 'growing', 'mature', 'completed', 'in-progress', 'high-priority', 'low-priority', 'urgent'];
      const category = note.tags?.find(t => !skipTags.includes(t)) || 'General';

      // Parse content for description and notes
      const lines = (note.content || '').split('\n');
      const description = lines[0] || note.title;

      return {
        id: note.id,
        title: note.title || 'Untitled Idea',
        description,
        stage,
        category,
        priority,
        dateCreated: note.createdAt,
        lastUpdated: note.updatedAt,
        tags: note.tags?.filter(t => !skipTags.includes(t)) || [],
        rating: note.rating || 3,
        notes: lines.slice(1).join('\n').trim() || '',
        nextActions: []
      };
    });

    // Calculate stats
    const totalIdeas = transformedIdeas.length;
    const seedIdeas = transformedIdeas.filter(i => i.stage === 'seed').length;
    const sproutingIdeas = transformedIdeas.filter(i => i.stage === 'sprouting').length;
    const growingIdeas = transformedIdeas.filter(i => i.stage === 'growing').length;
    const matureIdeas = transformedIdeas.filter(i => i.stage === 'mature').length;

    return {
      ideas: transformedIdeas.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)),
      stats: {
        totalIdeas,
        seedIdeas,
        sproutingIdeas,
        growingIdeas,
        matureIdeas,
        activeGrowth: sproutingIdeas + growingIdeas
      }
    };
  }, [notes]);

  const handleIdeaSubmit = (ideaData) => {
    const tags = ['idea', ideaData.stage || 'seed'];
    if (ideaData.priority === 'high') tags.push('high-priority');
    if (ideaData.priority === 'low') tags.push('low-priority');
    if (ideaData.category) tags.push(ideaData.category);
    if (ideaData.tags) tags.push(...ideaData.tags);

    const content = [
      ideaData.description || '',
      ideaData.notes || '',
      ideaData.nextActions?.length > 0 ? '\n**Next Actions:**\n' + ideaData.nextActions.map(a => `- ${a}`).join('\n') : ''
    ].filter(Boolean).join('\n');

    createNote({
      title: ideaData.title,
      content,
      tags: [...new Set(tags)]
    });
  };

  const handleEditIdea = (idea) => {
    setEditingIdea(idea);
    setShowAddModal(true);
  };

  const handleUpdateIdea = (ideaData) => {
    if (!editingIdea) return;

    const updatedStage = ideaData.stage || editingIdea.stage || 'seed';
    const tags = ['idea', updatedStage];
    if (ideaData.priority === 'high') tags.push('high-priority');
    else if (ideaData.priority === 'low') tags.push('low-priority');
    if (ideaData.category) tags.push(ideaData.category);
    if (ideaData.tags) tags.push(...ideaData.tags);

    const content = [
      ideaData.description || '',
      ideaData.notes || '',
      ideaData.nextActions?.length > 0 ? '\n**Next Actions:**\n' + ideaData.nextActions.map(a => `- ${a}`).join('\n') : ''
    ].filter(Boolean).join('\n');

    updateNote(editingIdea.id, {
      title: ideaData.title,
      content,
      tags: [...new Set(tags)],
      rating: ideaData.rating
    });

    setEditingIdea(null);
  };

  const handleEvolveIdea = (idea, e) => {
    e?.stopPropagation();
    const stageOrder = ['seed', 'sprouting', 'growing', 'mature'];
    const currentIndex = stageOrder.indexOf(idea.stage);

    if (currentIndex >= stageOrder.length - 1) return;

    const nextStage = stageOrder[currentIndex + 1];
    const originalNote = notes.find(n => n.id === idea.id);
    if (!originalNote) return;

    const skipStageTags = ['seed', 'sprouting', 'growing', 'mature', 'completed', 'in-progress'];
    const newTags = [
      ...(originalNote.tags || []).filter(t => !skipStageTags.includes(t)),
      nextStage
    ];

    updateNote(idea.id, { tags: newTags });

    const xpRewards = { sprouting: 5, growing: 10, mature: 25 };
    triggerGamification('ideaEvolved', {
      xpOverride: xpRewards[nextStage] || 5,
      module: 'knowledge'
    });
  };

  const getStageIcon = (stage, size = 20) => {
    switch (stage) {
      case 'seed': return <Lightbulb size={size} />;
      case 'sprouting': return <Sprout size={size} />;
      case 'growing': return <TreePine size={size} />;
      case 'mature': return <Trophy size={size} />;
      default: return <Lightbulb size={size} />;
    }
  };

  const getStageLabel = (stage) => {
    const labels = { seed: 'Seed', sprouting: 'Sprouting', growing: 'Growing', mature: 'Mature' };
    return labels[stage] || stage;
  };

  const getStageProgress = (stage) => {
    const progress = { seed: 25, sprouting: 50, growing: 75, mature: 100 };
    return progress[stage] || 0;
  };

  const filteredIdeas = stageFilter === 'all'
    ? ideas
    : ideas.filter(idea => idea.stage === stageFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stageFilters = [
    { key: 'all', label: 'All Ideas', count: stats.totalIdeas, icon: Sparkles },
    { key: 'seed', label: 'Seeds', count: stats.seedIdeas, icon: Lightbulb },
    { key: 'sprouting', label: 'Sprouting', count: stats.sproutingIdeas, icon: Sprout },
    { key: 'growing', label: 'Growing', count: stats.growingIdeas, icon: TreePine },
    { key: 'mature', label: 'Mature', count: stats.matureIdeas, icon: Trophy },
  ];

  return (
    <div className="ideas-tab-v2">
      {/* Hero Stats Section */}
      <div className="ideas-hero">
        <div className="ideas-hero-content">
          <div className="ideas-hero-left">
            <div className="ideas-hero-icon">
              <Sparkles size={32} />
              <div className="hero-icon-glow" />
            </div>
            <div className="ideas-hero-text">
              <h2>Idea Garden</h2>
              <p>Watch your ideas grow from seeds to success</p>
            </div>
          </div>
          <button className="plant-idea-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            <span>Plant New Idea</span>
            <div className="btn-shimmer" />
          </button>
        </div>

        {/* Floating Stats */}
        <div className="ideas-stats-grid">
          <div className="idea-stat-card total">
            <div className="stat-card-bg" />
            <div className="stat-icon-wrapper">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalIdeas}</span>
              <span className="stat-label">Total Ideas</span>
            </div>
            <div className="stat-trend positive">
              <TrendingUp size={14} />
              <span>Growing</span>
            </div>
          </div>

          <div className="idea-stat-card seeds">
            <div className="stat-card-bg" />
            <div className="stat-icon-wrapper">
              <Lightbulb size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.seedIdeas}</span>
              <span className="stat-label">Seeds Planted</span>
            </div>
            <div className="stat-decoration seed-particles">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="particle" style={{ '--delay': `${i * 0.3}s` }} />
              ))}
            </div>
          </div>

          <div className="idea-stat-card active">
            <div className="stat-card-bg" />
            <div className="stat-icon-wrapper">
              <Zap size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.activeGrowth}</span>
              <span className="stat-label">Active Growth</span>
            </div>
            <div className="growth-indicator">
              <div className="growth-bar" style={{ '--progress': `${(stats.activeGrowth / Math.max(stats.totalIdeas, 1)) * 100}%` }} />
            </div>
          </div>

          <div className="idea-stat-card mature">
            <div className="stat-card-bg" />
            <div className="stat-icon-wrapper">
              <Trophy size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.matureIdeas}</span>
              <span className="stat-label">Harvested</span>
            </div>
            <div className="achievement-stars">
              {[...Array(Math.min(stats.matureIdeas, 5))].map((_, i) => (
                <Star key={i} size={12} fill="currentColor" style={{ '--delay': `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="stage-filter-section">
        <div className="stage-filter-pills">
          {stageFilters.map(filter => {
            const Icon = filter.icon;
            const isActive = stageFilter === filter.key;
            return (
              <button
                key={filter.key}
                className={`stage-pill ${filter.key} ${isActive ? 'active' : ''}`}
                onClick={() => setStageFilter(filter.key)}
              >
                <Icon size={16} />
                <span className="pill-label">{filter.label}</span>
                <span className="pill-count">{filter.count}</span>
                {isActive && <div className="pill-glow" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ideas Garden Grid */}
      <div className="ideas-garden">
        {filteredIdeas.length === 0 ? (
          <div className="empty-garden-state">
            <div className="empty-garden-visual">
              <div className="garden-pot">
                <Sprout size={48} />
                <div className="pot-glow" />
              </div>
              <div className="floating-seeds">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="floating-seed" style={{ '--i': i }}>
                    <Lightbulb size={16} />
                  </div>
                ))}
              </div>
            </div>
            <h3>Your garden awaits</h3>
            <p>
              {stageFilter !== 'all'
                ? `No ideas in the ${getStageLabel(stageFilter).toLowerCase()} stage yet`
                : "Plant your first idea seed and watch it grow into something amazing"}
            </p>
            <button className="plant-first-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Plant Your First Idea
            </button>
          </div>
        ) : (
          <div className="ideas-grid">
            {filteredIdeas.map((idea, index) => (
              <div
                key={idea.id}
                className={`idea-card-v2 ${idea.stage} ${hoveredIdea === idea.id ? 'hovered' : ''}`}
                style={{ '--index': index }}
                onMouseEnter={() => setHoveredIdea(idea.id)}
                onMouseLeave={() => setHoveredIdea(null)}
                onClick={() => handleEditIdea(idea)}
              >
                {/* Card Background Effects */}
                <div className="card-bg-gradient" />
                <div className="card-border-glow" />

                {/* Stage Progress Ring */}
                <div className="stage-progress-ring">
                  <svg viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity="0.1"
                    />
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${getStageProgress(idea.stage)} 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                      className="progress-circle"
                    />
                  </svg>
                  <div className="stage-icon-center">
                    {getStageIcon(idea.stage, 18)}
                  </div>
                </div>

                {/* Card Header */}
                <div className="card-header-v2">
                  <div className="stage-badge">
                    <span className="stage-name">{getStageLabel(idea.stage)}</span>
                  </div>
                  <div className="priority-indicator" data-priority={idea.priority}>
                    <span className="priority-dot" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="card-content-v2">
                  <h4 className="idea-title-v2">{idea.title}</h4>
                  <p className="idea-description-v2">{idea.description}</p>

                  {/* Category & Tags */}
                  <div className="idea-meta">
                    <span className="category-chip">
                      <Tag size={12} />
                      {idea.category}
                    </span>
                    {idea.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="meta-tag">{tag}</span>
                    ))}
                    {idea.tags.length > 2 && (
                      <span className="more-tags">+{idea.tags.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer-v2">
                  <div className="idea-timestamp">
                    <Clock size={12} />
                    <span>{formatDate(idea.lastUpdated)}</span>
                  </div>

                  <div className="idea-rating-v2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < idea.rating ? 'currentColor' : 'none'}
                        opacity={i < idea.rating ? 1 : 0.3}
                      />
                    ))}
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="card-hover-actions">
                  <button
                    className="action-btn edit"
                    onClick={(e) => { e.stopPropagation(); handleEditIdea(idea); }}
                  >
                    <Edit3 size={16} />
                  </button>
                  {idea.stage !== 'mature' && (
                    <button
                      className="action-btn evolve"
                      onClick={(e) => handleEvolveIdea(idea, e)}
                      title={`Evolve to ${getStageLabel(['seed', 'sprouting', 'growing', 'mature'][['seed', 'sprouting', 'growing', 'mature'].indexOf(idea.stage) + 1])}`}
                    >
                      <ArrowUpRight size={16} />
                      <span>Evolve</span>
                    </button>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="card-sparkles">
                  {idea.stage === 'mature' && [...Array(3)].map((_, i) => (
                    <Sparkles key={i} size={10} className="sparkle" style={{ '--i': i }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Idea Modal */}
      <AddIdeaModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingIdea(null);
        }}
        onSubmit={editingIdea ? handleUpdateIdea : handleIdeaSubmit}
        editIdea={editingIdea}
      />
    </div>
  );
};

export default IdeasTab;
