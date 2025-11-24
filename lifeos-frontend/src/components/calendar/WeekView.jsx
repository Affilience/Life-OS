import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import TimeBlock from './TimeBlock';
import './WeekView.css';

const WeekView = ({ selectedDate, setSelectedDate }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Get start of week (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(selectedDate);
  
  // Generate 7 days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Time slots (6am to 11pm)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Mock events with different activity types
  const events = [
    {
      id: 1,
      title: 'Deep Work - Project Alpha',
      day: 1, // Monday
      startHour: 9,
      duration: 2,
      type: 'work',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Gym - Upper Body',
      day: 1,
      startHour: 13,
      duration: 1.5,
      type: 'workout',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Learning - React Advanced',
      day: 2, // Tuesday
      startHour: 10,
      duration: 2,
      type: 'learning',
      status: 'planned'
    },
    {
      id: 4,
      title: 'Gym - Lower Body',
      day: 3, // Wednesday
      startHour: 7,
      duration: 1.5,
      type: 'workout',
      status: 'planned'
    },
    {
      id: 5,
      title: 'Team Meeting',
      day: 3,
      startHour: 14,
      duration: 1,
      type: 'work',
      status: 'planned'
    },
    {
      id: 6,
      title: 'Journal Writing',
      day: 4, // Thursday
      startHour: 8,
      duration: 0.5,
      type: 'personal',
      status: 'completed'
    },
    {
      id: 7,
      title: 'Code Review',
      day: 4,
      startHour: 15,
      duration: 1,
      type: 'work',
      status: 'planned'
    },
    {
      id: 8,
      title: 'Book Reading',
      day: 5, // Friday
      startHour: 20,
      duration: 1,
      type: 'learning',
      status: 'planned'
    }
  ];

  const getEventsByDay = (dayIndex) => {
    return events.filter(e => e.day === dayIndex);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  return (
    <div className="week-view">
      {/* Week Navigation */}
      <Card className="week-navigation">
        <div className="nav-controls">
          <Button 
            variant="ghost" 
            icon={ChevronLeft}
            onClick={() => navigateWeek(-1)}
          />
          <div className="week-info">
            <h3 className="week-range">{formatWeekRange()}</h3>
            <span className="week-number">Week {getWeekNumber(weekStart)}</span>
          </div>
          <Button 
            variant="ghost" 
            icon={ChevronRight}
            onClick={() => navigateWeek(1)}
          />
        </div>
        <div className="nav-actions">
          <Button variant="secondary" size="small" onClick={goToToday}>
            Today
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Event
          </Button>
        </div>
      </Card>

      {/* Week Grid */}
      <Card className="week-grid-card">
        <div className="week-grid">
          {/* Time column */}
          <div className="time-column">
            <div className="time-header"></div>
            {hours.map(hour => (
              <div key={hour} className="time-label">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((date, dayIndex) => {
            const dayEvents = getEventsByDay(dayIndex);
            return (
              <div key={dayIndex} className="day-column">
                <div className={`day-header ${isToday(date) ? 'today' : ''}`}>
                  <div className="day-name">
                    {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </div>
                  <div className="day-date">
                    {date.getDate()}
                  </div>
                </div>

                <div className="day-events">
                  {hours.map(hour => (
                    <div key={hour} className="time-slot" />
                  ))}

                  {/* Render events */}
                  {dayEvents.map(event => (
                    <TimeBlock
                      key={event.id}
                      event={event}
                      startHour={hours[0]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default WeekView;