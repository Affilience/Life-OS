import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, Flame, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import Card from '../shared/Card';
import StatCard from '../shared/StatCard';
import './CalendarHeatmap.css';

const CalendarHeatmap = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredDate, setHoveredDate] = useState(null);

  // Fetch real journal entries from Supabase
  const { data: entries = [] } = useQuery({
    queryKey: ['journal-entries', selectedYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, entry_date, content, mood_rating')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: true });

      if (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
      return data || [];
    },
  });

  // Transform entries into heatmap data format
  const journalData = useMemo(() => {
    const data = {};
    entries.forEach(entry => {
      const dateStr = entry.entry_date;
      data[dateStr] = {
        hasEntry: true,
        mood: entry.mood_rating || 5,
        wordCount: entry.content?.length || 0,
        title: `Entry for ${new Date(dateStr).toLocaleDateString()}`
      };
    });
    return data;
  }, [entries]);

  // Get intensity level for heatmap (0-4)
  const getIntensity = (date) => {
    const data = journalData[date];
    if (!data || !data.hasEntry) return 0;
    
    // Base intensity on word count
    if (data.wordCount >= 400) return 4;
    if (data.wordCount >= 300) return 3;
    if (data.wordCount >= 200) return 2;
    return 1;
  };

  // Get mood color for the day
  const getMoodColor = (date) => {
    const data = journalData[date];
    if (!data || !data.hasEntry) return null;
    
    const mood = data.mood;
    if (mood >= 8) return '#10b981'; // Green
    if (mood >= 6) return '#84cc16'; // Light green
    if (mood >= 4) return '#eab308'; // Yellow
    if (mood >= 2) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  // Generate calendar weeks
  const generateCalendarWeeks = () => {
    const weeks = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    
    // Find the start of the first week (Sunday)
    const firstWeekStart = new Date(startDate);
    firstWeekStart.setDate(firstWeekStart.getDate() - firstWeekStart.getDay());
    
    // Find the end of the last week (Saturday)
    const lastWeekEnd = new Date(endDate);
    lastWeekEnd.setDate(lastWeekEnd.getDate() + (6 - lastWeekEnd.getDay()));
    
    for (let d = new Date(firstWeekStart); d <= lastWeekEnd; d.setDate(d.getDate() + 7)) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(d);
        date.setDate(date.getDate() + i);
        week.push(date);
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const weeks = generateCalendarWeeks();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Calculate stats
  const totalEntries = Object.values(journalData).filter(d => d.hasEntry).length;
  const currentStreak = calculateCurrentStreak();
  const longestStreak = calculateLongestStreak();
  const averageMood = calculateAverageMood();

  function calculateCurrentStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (journalData[dateStr]?.hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateLongestStreak() {
    let longest = 0;
    let current = 0;
    
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      if (journalData[dateStr]?.hasEntry) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    
    return longest;
  }

  function calculateAverageMood() {
    const entries = Object.values(journalData).filter(d => d.hasEntry);
    if (entries.length === 0) return 0;

    const sum = entries.reduce((acc, entry) => acc + entry.mood, 0);
    return (sum / entries.length).toFixed(1);
  }

  function getMostActiveMonth() {
    const monthCounts = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    Object.keys(journalData).forEach(dateStr => {
      if (journalData[dateStr].hasEntry) {
        const month = new Date(dateStr).getMonth();
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });

    const entries = Object.entries(monthCounts);
    if (entries.length === 0) return 'No entries yet';

    const [bestMonth, count] = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return `${months[bestMonth]} ${selectedYear} with ${count} entries`;
  }

  function getBestMoodMonth() {
    const monthMoods = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    Object.keys(journalData).forEach(dateStr => {
      if (journalData[dateStr].hasEntry) {
        const month = new Date(dateStr).getMonth();
        if (!monthMoods[month]) monthMoods[month] = [];
        monthMoods[month].push(journalData[dateStr].mood);
      }
    });

    const entries = Object.entries(monthMoods);
    if (entries.length === 0) return 'No entries yet';

    const avgByMonth = entries.map(([month, moods]) => [
      month,
      moods.reduce((a, b) => a + b, 0) / moods.length
    ]);

    const [bestMonth, avg] = avgByMonth.reduce((a, b) => a[1] > b[1] ? a : b);
    return `${months[bestMonth]} ${selectedYear} with ${avg.toFixed(1)}/10 average`;
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isCurrentYear = selectedYear === new Date().getFullYear();

  return (
    <div className="calendar-heatmap">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={Calendar}
          label="Total Entries"
          value={totalEntries}
          module="journal"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={currentStreak}
          unit="days"
          module="journal"
        />
        <StatCard
          icon={Target}
          label="Longest Streak"
          value={longestStreak}
          unit="days"
          module="journal"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Mood"
          value={averageMood}
          unit="/10"
          module="journal"
        />
      </div>

      {/* Heatmap */}
      <Card title="Journal Activity" className="heatmap-card">
        <div className="heatmap-controls">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="year-selector"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <div className="heatmap-legend">
            <span className="legend-label">Less</span>
            <div className="legend-colors">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`legend-square intensity-${level}`}
                />
              ))}
            </div>
            <span className="legend-label">More</span>
          </div>
        </div>

        <div className="heatmap-container">
          {/* Month labels */}
          <div className="month-labels">
            {months.map((month, index) => (
              <div key={month} className="month-label">
                {month}
              </div>
            ))}
          </div>

          {/* Weekday labels */}
          <div className="weekday-labels">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="weekday-label">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {week.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const intensity = getIntensity(dateStr);
                  const moodColor = getMoodColor(dateStr);
                  const isCurrentMonth = date.getFullYear() === selectedYear;
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`heatmap-day intensity-${intensity} ${!isCurrentMonth ? 'other-month' : ''}`}
                      style={{
                        backgroundColor: moodColor || undefined
                      }}
                      onMouseEnter={() => setHoveredDate(dateStr)}
                      onMouseLeave={() => setHoveredDate(null)}
                      title={
                        journalData[dateStr]?.hasEntry
                          ? `${formatDate(date)}: ${journalData[dateStr].wordCount} words, mood ${journalData[dateStr].mood}/10`
                          : `${formatDate(date)}: No entry`
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDate && journalData[hoveredDate] && (
          <div className="heatmap-tooltip">
            <div className="tooltip-date">
              {formatDate(new Date(hoveredDate))}
            </div>
            {journalData[hoveredDate].hasEntry ? (
              <div className="tooltip-data">
                <div className="tooltip-row">
                  <span>Words:</span>
                  <span>{journalData[hoveredDate].wordCount}</span>
                </div>
                <div className="tooltip-row">
                  <span>Mood:</span>
                  <span>{journalData[hoveredDate].mood}/10</span>
                </div>
              </div>
            ) : (
              <div className="tooltip-no-entry">No entry</div>
            )}
          </div>
        )}
      </Card>

      {/* Insights */}
      <Card title="Insights" className="insights-card">
        <div className="insights-grid">
          <div className="insight-item">
            <h4>Most Active Month</h4>
            <p>{getMostActiveMonth()}</p>
          </div>
          <div className="insight-item">
            <h4>Best Mood Month</h4>
            <p>{getBestMoodMonth()}</p>
          </div>
          <div className="insight-item">
            <h4>Writing Goal</h4>
            <p>{((totalEntries / 365) * 100).toFixed(1)}% of year covered</p>
          </div>
          <div className="insight-item">
            <h4>Consistency</h4>
            <p>{totalEntries > 100 ? 'Excellent' : totalEntries > 50 ? 'Good' : totalEntries > 0 ? 'Keep going!' : 'Start journaling!'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarHeatmap;