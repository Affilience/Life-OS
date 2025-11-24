import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import './TimeBlock.css';

const TimeBlock = ({ event, startHour }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'work': return 'var(--color-productivity-500)';
      case 'workout': return 'var(--color-health-500)';
      case 'learning': return 'var(--color-knowledge-500)';
      case 'personal': return 'var(--color-journal-500)';
      default: return 'var(--color-calendar-500)';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'work': return 'Work';
      case 'workout': return 'Fitness';
      case 'learning': return 'Learning';
      case 'personal': return 'Personal';
      default: return 'Event';
    }
  };

  const top = (event.startHour - startHour) * 60;
  const height = event.duration * 60;

  const formatTime = (hour, duration) => {
    const endHour = hour + duration;
    const endMinutes = (duration % 1) * 60;
    const endHourInt = Math.floor(endHour);
    const endTime = `${endHourInt.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    return `${hour.toString().padStart(2, '0')}:00 - ${endTime}`;
  };

  return (
    <div 
      className={`time-block time-block-${event.type} ${event.status === 'completed' ? 'completed' : ''}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        borderLeftColor: getTypeColor(event.type)
      }}
    >
      <div className="time-block-content">
        <div className="time-block-header">
          <span className="time-block-time">
            {formatTime(event.startHour, event.duration)}
          </span>
          {event.status === 'completed' && (
            <CheckCircle size={14} className="status-icon" />
          )}
        </div>
        
        <div className="time-block-title">{event.title}</div>
        
        <div className="time-block-meta">
          <div className="time-block-duration">
            <Clock size={12} />
            <span>{event.duration}h</span>
          </div>
          <div className="time-block-type">
            {getTypeLabel(event.type)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBlock;