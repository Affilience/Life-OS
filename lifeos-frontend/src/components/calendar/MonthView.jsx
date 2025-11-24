import React from 'react';
import Card from '../shared/Card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Button from '../shared/Button';
import './MonthView.css';

const MonthView = ({ selectedDate, onDateChange }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Adjust so week starts on Monday (0 = Monday, 6 = Sunday)
  const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Build calendar grid
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < adjustedStartDay; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Mock events for the month (just a few sample days)
  const monthEvents = {
    10: 3,  // 3 events on the 10th
    15: 5,  // 5 events on the 15th
    20: 2,  // 2 events on the 20th
    25: 4,  // 4 events on the 25th
    28: 1   // 1 event on the 28th
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onDateChange && onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onDateChange && onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange && onDateChange(new Date());
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day;
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthName = selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <div className="month-view">
        {/* Month Header */}
        <div className="month-header">
          <div className="month-info">
            <h2 className="month-title">{monthName}</h2>
          </div>

          <div className="month-nav">
            <Button
              variant="ghost"
              size="small"
              icon={ChevronLeft}
              onClick={goToPreviousMonth}
            />
            {!isCurrentMonth() && (
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
              onClick={goToNextMonth}
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

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''}`}
            >
              {day && (
                <>
                  <div className="day-number">{day}</div>
                  {monthEvents[day] && (
                    <div className="day-events">
                      <div className="event-dots">
                        {Array.from({ length: Math.min(monthEvents[day], 3) }).map((_, i) => (
                          <div key={i} className="event-dot" />
                        ))}
                        {monthEvents[day] > 3 && (
                          <div className="event-more">+{monthEvents[day] - 3}</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Month Summary */}
        <div className="month-summary">
          <div className="summary-stat">
            <span className="summary-label">Total Events:</span>
            <span className="summary-value">{Object.values(monthEvents).reduce((a, b) => a + b, 0)}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Days with Events:</span>
            <span className="summary-value">{Object.keys(monthEvents).length}/{daysInMonth}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Avg Events/Day:</span>
            <span className="summary-value">{(Object.values(monthEvents).reduce((a, b) => a + b, 0) / daysInMonth).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MonthView;