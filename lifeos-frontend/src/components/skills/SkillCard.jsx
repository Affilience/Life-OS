import React, { memo } from 'react';
import { Clock, TrendingUp, Target } from 'lucide-react';
import './SkillCard.css';

const SkillCard = memo(({ skill, onClick }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'var(--color-skills-200)';
      case 'intermediate':
        return 'var(--color-skills-400)';
      case 'advanced':
        return 'var(--color-skills-600)';
      case 'expert':
        return 'var(--color-skills-800)';
      default:
        return 'var(--color-skills-500)';
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      practical: 'Practical Life',
      communication: 'Communication',
      physical: 'Physical',
      cognitive: 'Cognitive',
      creative: 'Creative',
      professional: 'Professional',
      digital: 'Digital'
    };
    return categories[category] || category;
  };

  const getTimeSinceLastPractice = (lastPracticed) => {
    const lastDate = new Date(lastPracticed);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="skill-card" onClick={() => onClick && onClick(skill)}>
      <div className="skill-card-header">
        <div className="skill-name-section">
          <h3 className="skill-name">{skill.name}</h3>
          <span className="skill-category">{getCategoryLabel(skill.category)}</span>
        </div>
        <div className="skill-level" style={{ 
          backgroundColor: getLevelColor(skill.level),
          color: 'white'
        }}>
          {skill.level}
        </div>
      </div>

      <div className="skill-progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${skill.progress}%`,
                backgroundColor: 'var(--color-skills-500)'
              }}
            />
          </div>
          <span className="progress-percentage">{skill.progress}%</span>
        </div>
      </div>

      <div className="skill-stats">
        <div className="skill-stat">
          <Clock size={16} />
          <span>{skill.timeInvested}h invested</span>
        </div>
        <div className="skill-stat">
          <TrendingUp size={16} />
          <span>{getTimeSinceLastPractice(skill.lastPracticed)}</span>
        </div>
      </div>

      {skill.nextGoal && (
        <div className="skill-goal">
          <Target size={14} />
          <span className="goal-text">{skill.nextGoal}</span>
        </div>
      )}

      {skill.milestones && skill.milestones.length > 0 && (
        <div className="skill-milestones">
          <div className="milestones-count">
            {skill.milestones.length} milestone{skill.milestones.length !== 1 ? 's' : ''} achieved
          </div>
        </div>
      )}
    </div>
  );
});

SkillCard.displayName = 'SkillCard';

export default SkillCard;