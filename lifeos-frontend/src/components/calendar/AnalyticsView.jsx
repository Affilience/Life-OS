import React from 'react';
import Card from '../shared/Card';
import StatCard from '../shared/StatCard';
import { Clock, TrendingUp, Target, Calendar, PieChart, BarChart3 } from 'lucide-react';

const AnalyticsView = () => {
  return (
    <div className="analytics-view">
      {/* Stats Grid */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 'var(--space-4)', 
        marginBottom: 'var(--space-6)' 
      }}>
        <StatCard
          icon={Clock}
          label="Time Planned This Week"
          value="42"
          unit="hrs"
          module="calendar"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value="78"
          unit="%"
          subtext="Planned vs Actual"
          module="calendar"
        />
        <StatCard
          icon={Target}
          label="Most Productive Day"
          value="Tuesday"
          subtext="Based on time blocks"
          module="calendar"
        />
        <StatCard
          icon={Calendar}
          label="Events This Month"
          value="127"
          subtext="Across all categories"
          module="calendar"
        />
      </div>

      {/* Charts Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 'var(--space-4)', 
        marginBottom: 'var(--space-6)' 
      }}>
        {/* Time Allocation Chart */}
        <Card title="Time Allocation">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            How you spend your time by category
          </p>
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <PieChart size={80} style={{ color: 'var(--color-calendar-500)', marginBottom: 'var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Time allocation chart - coming soon
            </p>
          </div>
        </Card>

        {/* Productivity Trends */}
        <Card title="Productivity Trends">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            Weekly productivity patterns
          </p>
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <BarChart3 size={80} style={{ color: 'var(--color-calendar-500)', marginBottom: 'var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Productivity trends - coming soon
            </p>
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card title="Weekly Insights">
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          Key insights about your time management
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'var(--space-4)' 
        }}>
          <div style={{
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, var(--color-calendar-50) 0%, var(--color-calendar-100) 100%)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-calendar-500)'
          }}>
            <h4 style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: 'var(--font-weight-semibold)', 
              color: 'var(--color-text-primary)', 
              margin: '0 0 var(--space-2) 0' 
            }}>
              Peak Productivity
            </h4>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-calendar-600)', 
              fontWeight: 'var(--font-weight-medium)', 
              margin: 0 
            }}>
              Tuesday 10:00-12:00 AM shows highest completion rates
            </p>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, var(--color-calendar-50) 0%, var(--color-calendar-100) 100%)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-calendar-500)'
          }}>
            <h4 style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: 'var(--font-weight-semibold)', 
              color: 'var(--color-text-primary)', 
              margin: '0 0 var(--space-2) 0' 
            }}>
              Time Distribution
            </h4>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-calendar-600)', 
              fontWeight: 'var(--font-weight-medium)', 
              margin: 0 
            }}>
              65% work, 20% learning, 15% personal activities
            </p>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, var(--color-calendar-50) 0%, var(--color-calendar-100) 100%)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-calendar-500)'
          }}>
            <h4 style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: 'var(--font-weight-semibold)', 
              color: 'var(--color-text-primary)', 
              margin: '0 0 var(--space-2) 0' 
            }}>
              Scheduling Tip
            </h4>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-calendar-600)', 
              fontWeight: 'var(--font-weight-medium)', 
              margin: 0 
            }}>
              Consider blocking 2-hour focus sessions for better productivity
            </p>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, var(--color-calendar-50) 0%, var(--color-calendar-100) 100%)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-calendar-500)'
          }}>
            <h4 style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: 'var(--font-weight-semibold)', 
              color: 'var(--color-text-primary)', 
              margin: '0 0 var(--space-2) 0' 
            }}>
              Buffer Time
            </h4>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-calendar-600)', 
              fontWeight: 'var(--font-weight-medium)', 
              margin: 0 
            }}>
              Schedule 15-minute buffers between meetings for best results
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsView;