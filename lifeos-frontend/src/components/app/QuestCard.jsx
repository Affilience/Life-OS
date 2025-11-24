import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * ONYXOS QuestCard Component
 *
 * Interactive card for daily/weekly quests.
 * Shows XP value, difficulty, identity tag, and completion state.
 * Claiming triggers glow animation + toast notification.
 */

const QuestCard = ({
  title,
  description = '',
  xp = 0,
  difficulty = 'normal', // 'easy' | 'normal' | 'hard'
  identityTag = '',
  completed = false,
  onComplete = () => {},
  className = '',
  ...props
}) => {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsCompleted(true);
        onComplete();
        setIsAnimating(false);
      }, 300);
    }
  };

  const difficultyColors = {
    easy: 'success',
    normal: 'accent',
    hard: 'error',
  };

  return (
    <div
      className={`
        bg-bg-2 border border-border rounded-lg p-4
        transition-all duration-200
        ${isCompleted ? 'opacity-60' : 'hover:border-accent/30 hover:shadow-z1'}
        ${isAnimating ? 'animate-pulse-subtle scale-[1.02]' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isCompleted}
          className={`
            flex-shrink-0 mt-0.5 transition-all duration-fast
            ${isCompleted ? 'text-accent cursor-default' : 'text-text-dim hover:text-accent'}
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded
          `}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`
              font-semibold text-base
              ${isCompleted ? 'text-text-dim line-through' : 'text-text-high'}
            `}>
              {title}
            </h3>
            <span className="flex-shrink-0 text-accent font-bold text-sm font-mono">
              +{xp} XP
            </span>
          </div>

          {description && (
            <p className="text-text-med text-sm mb-2 line-clamp-2">
              {description}
            </p>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={difficultyColors[difficulty]} size="sm">
              {difficulty}
            </Badge>
            {identityTag && (
              <Badge variant="default" size="sm">
                {identityTag}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
