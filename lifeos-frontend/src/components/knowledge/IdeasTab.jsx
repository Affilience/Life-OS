import React, { useState } from 'react';
import { Plus, Lightbulb, Sprout, TreePine, Trophy, Clock, Tag, Star } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import AddIdeaModal from './AddIdeaModal';
import './IdeasTab.css';

const IdeasTab = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');

  const stats = {
    totalIdeas: 47,
    seedIdeas: 12,
    growingIdeas: 8,
    matureIdeas: 3
  };

  const [ideas, setIdeas] = useState([
    {
      id: 1,
      title: 'Personal AI Assistant for Learning',
      description: 'An AI that tracks learning patterns and suggests optimal study schedules',
      stage: 'growing',
      category: 'Technology',
      priority: 'high',
      dateCreated: '2025-10-15',
      lastUpdated: '2025-10-26',
      tags: ['AI', 'Education', 'Productivity'],
      rating: 4,
      notes: 'Research shows AI can improve learning efficiency by 40%. Need to explore implementation costs.',
      nextActions: [
        'Research existing AI learning platforms',
        'Prototype basic recommendation engine',
        'Survey potential users'
      ]
    },
    {
      id: 2,
      title: 'Sustainable Packaging for Local Restaurants',
      description: 'Biodegradable food packaging made from local agricultural waste',
      stage: 'mature',
      category: 'Business',
      priority: 'high',
      dateCreated: '2025-09-20',
      lastUpdated: '2025-10-25',
      tags: ['Sustainability', 'Business', 'Environment'],
      rating: 5,
      notes: 'Validated with 3 local restaurants. Material testing shows 90% decomposition in 6 months.',
      nextActions: [
        'Finalize manufacturing partnership',
        'Launch pilot program with 5 restaurants',
        'Develop marketing strategy'
      ]
    },
    {
      id: 3,
      title: 'Community Garden Network App',
      description: 'Platform connecting urban gardeners to share resources and knowledge',
      stage: 'sprouting',
      category: 'Social Impact',
      priority: 'medium',
      dateCreated: '2025-10-10',
      lastUpdated: '2025-10-20',
      tags: ['Community', 'Gardening', 'App'],
      rating: 3,
      notes: 'Initial user interviews show strong interest. Need to validate market size.',
      nextActions: [
        'Complete market research',
        'Create wireframes',
        'Find potential co-founder'
      ]
    },
    {
      id: 4,
      title: 'Quantum Computing for Weather Prediction',
      description: 'Using quantum algorithms to improve long-term weather forecasting accuracy',
      stage: 'seed',
      category: 'Science',
      priority: 'low',
      dateCreated: '2025-10-22',
      lastUpdated: '2025-10-22',
      tags: ['Quantum', 'Weather', 'Research'],
      rating: 2,
      notes: 'Interesting concept but requires deep technical expertise. Long-term research project.',
      nextActions: [
        'Read quantum computing fundamentals',
        'Connect with meteorology researchers',
        'Assess technical feasibility'
      ]
    },
    {
      id: 5,
      title: 'Micro-Learning Mobile Game',
      description: 'Educational game that teaches skills through 2-minute daily sessions',
      stage: 'growing',
      category: 'Education',
      priority: 'medium',
      dateCreated: '2025-09-28',
      lastUpdated: '2025-10-24',
      tags: ['Gaming', 'Education', 'Mobile'],
      rating: 4,
      notes: 'Prototype tested with 20 users. Average engagement: 15 days. Need better retention strategy.',
      nextActions: [
        'Improve game mechanics',
        'Add social features',
        'Seek educational partners'
      ]
    },
    {
      id: 6,
      title: 'Voice-Controlled Smart Mirror',
      description: 'Bathroom mirror with AI assistant for morning routines and health tracking',
      stage: 'seed',
      category: 'Technology',
      priority: 'low',
      dateCreated: '2025-10-18',
      lastUpdated: '2025-10-19',
      tags: ['IoT', 'Health', 'Smart Home'],
      rating: 3,
      notes: 'Cool concept but market might be saturated. Need unique value proposition.',
      nextActions: [
        'Analyze competitor products',
        'Identify unique features',
        'Estimate development costs'
      ]
    }
  ]);

  const handleIdeaSubmit = (ideaData) => {
    const newIdea = {
      ...ideaData,
      id: ideas.length + 1
    };
    setIdeas(prev => [newIdea, ...prev]);
    console.log('Idea planted:', newIdea);
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'seed': return <Lightbulb size={20} />;
      case 'sprouting': return <Sprout size={20} />;
      case 'growing': return <TreePine size={20} />;
      case 'mature': return <Trophy size={20} />;
      default: return <Lightbulb size={20} />;
    }
  };

  const getStageLabel = (stage) => {
    const labels = {
      seed: 'Seed',
      sprouting: 'Sprouting',
      growing: 'Growing',
      mature: 'Mature'
    };
    return labels[stage] || stage;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const filteredIdeas = stageFilter === 'all' 
    ? ideas 
    : ideas.filter(idea => idea.stage === stageFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="ideas-tab">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={Lightbulb}
          label="Total Ideas"
          value={stats.totalIdeas}
          module="knowledge"
        />
        <StatCard
          icon={Lightbulb}
          label="Seeds"
          value={stats.seedIdeas}
          module="knowledge"
        />
        <StatCard
          icon={TreePine}
          label="Growing"
          value={stats.growingIdeas}
          module="knowledge"
        />
        <StatCard
          icon={Trophy}
          label="Mature"
          value={stats.matureIdeas}
          module="knowledge"
        />
      </div>

      {/* Idea Garden */}
      <Card 
        title="Idea Garden"
        action="Plant New Idea"
        onActionClick={() => setShowAddModal(true)}
      >
        {/* Stage Filters */}
        <div className="stage-filters">
          <Button 
            variant={stageFilter === 'all' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setStageFilter('all')}
          >
            All Stages
          </Button>
          <Button 
            variant={stageFilter === 'seed' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setStageFilter('seed')}
            icon={Lightbulb}
          >
            Seeds
          </Button>
          <Button 
            variant={stageFilter === 'sprouting' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setStageFilter('sprouting')}
            icon={Sprout}
          >
            Sprouting
          </Button>
          <Button 
            variant={stageFilter === 'growing' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setStageFilter('growing')}
            icon={TreePine}
          >
            Growing
          </Button>
          <Button 
            variant={stageFilter === 'mature' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setStageFilter('mature')}
            icon={Trophy}
          >
            Mature
          </Button>
        </div>

        {/* Ideas List */}
        {filteredIdeas.length === 0 ? (
          <div className="empty-garden">
            <Lightbulb size={48} className="empty-icon" />
            <h3>No ideas in this stage</h3>
            <p>Plant a new seed or check other growth stages</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Plant First Idea
            </Button>
          </div>
        ) : (
          <div className="ideas-list">
            {filteredIdeas.map(idea => (
              <div key={idea.id} className={`idea-card ${idea.stage}`}>
                <div className="idea-header">
                  <div className="idea-stage-info">
                    <div className={`stage-icon ${idea.stage}`}>
                      {getStageIcon(idea.stage)}
                    </div>
                    <div className="stage-details">
                      <span className="stage-label">{getStageLabel(idea.stage)}</span>
                      <span className="idea-category">{idea.category}</span>
                    </div>
                  </div>
                  <div className="idea-priority-rating">
                    <div className={`priority-badge ${getPriorityColor(idea.priority)}`}>
                      {idea.priority}
                    </div>
                    <div className="idea-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < idea.rating ? 'var(--color-knowledge-500)' : 'none'}
                          color="var(--color-knowledge-500)"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="idea-content">
                  <h4 className="idea-title">{idea.title}</h4>
                  <p className="idea-description">{idea.description}</p>

                  {idea.notes && (
                    <div className="idea-notes">
                      <strong>Notes:</strong> {idea.notes}
                    </div>
                  )}

                  {idea.nextActions && idea.nextActions.length > 0 && (
                    <div className="next-actions">
                      <strong>Next Actions:</strong>
                      <ul>
                        {idea.nextActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="idea-tags">
                    {idea.tags.map(tag => (
                      <span key={tag} className="tag">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="idea-footer">
                  <div className="idea-dates">
                    <span className="date-info">
                      <Clock size={12} />
                      Created {formatDate(idea.dateCreated)}
                    </span>
                    {idea.lastUpdated !== idea.dateCreated && (
                      <span className="date-info">
                        Updated {formatDate(idea.lastUpdated)}
                      </span>
                    )}
                  </div>
                  <div className="idea-actions">
                    <Button variant="ghost" size="small">
                      Edit
                    </Button>
                    <Button variant="ghost" size="small">
                      Evolve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Idea Modal */}
      <AddIdeaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleIdeaSubmit}
      />
    </div>
  );
};

export default IdeasTab;