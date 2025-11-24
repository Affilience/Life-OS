import React from 'react';
import Card from '../shared/Card';
import TimeBlock from './TimeBlock';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../shared/Button';
import './DayView.css';

const DayView = ({ selectedDate, onDateChange }) => {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

  // Mock events for the selected day
  const mockEvents = [
    {
      id: 1,
      title: 'Morning Workout',
      startTime: 7,
      duration: 1,
      type: 'workout',
      completed: true
    },
    {
      id: 2,
      title: 'Deep Work Session',
      startTime: 9,
      duration: 3,
      type: 'work',
      completed: true
    },
    {
      id: 3,
      title: 'Lunch Break',
      startTime: 12,
      duration: 1,
      type: 'personal',
      completed: true
    },
    {
      id: 4,
      title: 'Learning: React Advanced',
      startTime: 14,
      duration: 2,
      type: 'learning',
      completed: false
    },
    {
      id: 5,
      title: 'Client Call',
      startTime: 16,
      duration: 1,
      type: 'work',
      completed: false
    },
    {
      id: 6,
      title: 'Evening Run',
      startTime: 18,
      duration: 1,
      type: 'workout',
      completed: false
    }
  ];

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange && onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange && onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange && onDateChange(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <Card>
      <div className="day-view">
        {/* Day Header */}
        <div className="day-header">
          <div className="day-info">
            <h2 className="day-title">
              {selectedDate.toLocaleDateString('en-GB', { weekday: 'long' })}
            </h2>
            <p className="day-date">
              {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="day-nav">
            <Button
              variant="ghost"
              size="small"
              icon={ChevronLeft}
              onClick={goToPreviousDay}
            />
            {!isToday && (
              <Button
                variant="secondary"
                size="small"
                onClick={goToToday}
              >
                Today
              </Button>
            )}
            <Button
              variant="ghost"
              size="small"
              icon={ChevronRight}
              onClick={goToNextDay}
            />
            <Button
              variant="primary"
              size="small"
              icon={Plus}
            >
              Add Event
            </Button>
          </div>
        </div>

        {/* Time Grid */}
        <div className="day-timeline">
          <div className="time-column">
            {hours.map(hour => (
              <div key={hour} className="time-label">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="schedule-column">
            {/* Hour dividers */}
            {hours.map(hour => (
              <div key={hour} className="hour-slot">
                <div className="hour-divider" />
              </div>
            ))}

            {/* Events */}
            <div className="events-container">
              {mockEvents.map(event => (
                <TimeBlock
                  key={event.id}
                  title={event.title}
                  startTime={event.startTime}
                  duration={event.duration}
                  type={event.type}
                  completed={event.completed}
                  dayIndex={0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Day Summary */}
        <div className="day-summary">
          <div className="summary-stat">
            <span className="summary-label">Total Events:</span>
            <span className="summary-value">{mockEvents.length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Completed:</span>
            <span className="summary-value">{mockEvents.filter(e => e.completed).length}/{mockEvents.length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Total Hours:</span>
            <span className="summary-value">{mockEvents.reduce((sum, e) => sum + e.duration, 0)}h</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DayView;