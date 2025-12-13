import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Lightbulb, Sprout, TreePine, Trophy, Clock, Tag, Star } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import AddIdeaModal from './AddIdeaModal';
import { EmptyState } from '../ui';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import './IdeasTab.css';

const IdeasTab = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');

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
    const growingIdeas = transformedIdeas.filter(i => i.stage === 'growing' || i.stage === 'sprouting').length;
    const matureIdeas = transformedIdeas.filter(i => i.stage === 'mature').length;

    return {
      ideas: transformedIdeas.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)),
      stats: {
        totalIdeas,
        seedIdeas,
        growingIdeas,
        matureIdeas
      }
    };
  }, [notes]);

  const handleIdeaSubmit = (ideaData) => {
    // Create a note with 'idea' tag
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
    console.log('Idea planted:', ideaData);
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
          <EmptyState
            type="ideas"
            title="No ideas in this stage"
            description={stageFilter !== 'all'
              ? "Try checking other growth stages to see your ideas"
              : "Plant your first idea seed and watch it grow into something amazing!"}
            actionLabel="Plant First Idea"
            onAction={() => setShowAddModal(true)}
            variant="amber"
            size="md"
          />
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