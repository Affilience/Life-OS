import React from 'react';
import { Apple, TrendingUp, Target, Activity } from 'lucide-react';
import AnalyticsCard from '../shared/AnalyticsCard';
import TrendLineChart from '../charts/TrendLineChart';
import ComparisonBarChart from '../charts/ComparisonBarChart';
import './NutritionAnalytics.css';

// Mock data - would come from API in production
const calorieData = [
  { date: 'Mon', calories: 2150 },
  { date: 'Tue', calories: 2300 },
  { date: 'Wed', calories: 2050 },
  { date: 'Thu', calories: 2400 },
  { date: 'Fri', calories: 2200 },
  { date: 'Sat', calories: 2500 },
  { date: 'Sun', calories: 2250 }
];

const proteinData = [
  { date: 'Mon', grams: 145 },
  { date: 'Tue', grams: 160 },
  { date: 'Wed', grams: 135 },
  { date: 'Thu', grams: 170 },
  { date: 'Fri', grams: 155 },
  { date: 'Sat', grams: 165 },
  { date: 'Sun', grams: 150 }
];

const carbsData = [
  { date: 'Mon', grams: 220 },
  { date: 'Tue', grams: 250 },
  { date: 'Wed', grams: 210 },
  { date: 'Thu', grams: 260 },
  { date: 'Fri', grams: 230 },
  { date: 'Sat', grams: 270 },
  { date: 'Sun', grams: 240 }
];

const adherenceData = [
  { date: 'Mon', adherence: 92 },
  { date: 'Tue', adherence: 88 },
  { date: 'Wed', adherence: 95 },
  { date: 'Thu', adherence: 85 },
  { date: 'Fri', adherence: 90 },
  { date: 'Sat', adherence: 78 },
  { date: 'Sun', adherence: 93 }
];

export default function NutritionAnalytics() {
  return (
    <div className="nutrition-analytics">
      {/* Calorie Trends */}
      <AnalyticsCard
        title="Daily Calorie Intake"
        icon={Apple}
        metric={{
          value: '2,264 cal',
          change: 5.3
        }}
        defaultRange="7d"
      >
        <TrendLineChart
          data={calorieData}
          dataKey="calories"
          name="Calories"
          color="#10b981"
          goal={2300}
          showArea={true}
        />
      </AnalyticsCard>

      {/* Protein Tracking */}
      <AnalyticsCard
        title="Protein Intake"
        icon={Activity}
        metric={{
          value: '154g',
          change: 8.2
        }}
        defaultRange="7d"
      >
        <TrendLineChart
          data={proteinData}
          dataKey="grams"
          name="Protein"
          color="#10b981"
          goal={150}
          showArea={true}
        />
      </AnalyticsCard>

      {/* Carbs Tracking */}
      <AnalyticsCard
        title="Carbohydrate Intake"
        icon={TrendingUp}
        metric={{
          value: '240g',
          change: 6.5
        }}
        defaultRange="7d"
      >
        <ComparisonBarChart
          data={carbsData}
          dataKey="grams"
          name="Carbs"
          color="#10b981"
        />
      </AnalyticsCard>

      {/* Adherence Percentage */}
      <AnalyticsCard
        title="Diet Adherence"
        icon={Target}
        metric={{
          value: '89%',
          change: 3.5
        }}
        defaultRange="7d"
      >
        <ComparisonBarChart
          data={adherenceData}
          dataKey="adherence"
          name="Adherence"
          color="#10b981"
        />
      </AnalyticsCard>

      {/* Macro Distribution Summary */}
      <div className="macro-summary">
        <div className="summary-header">
          <Apple size={24} className="summary-icon" />
          <h3 className="summary-title">Weekly Macro Summary</h3>
        </div>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Avg Daily Calories</div>
            <div className="summary-value">2,264</div>
            <div className="summary-detail">
              <span className="summary-target">Target: 2,300</span>
              <span className="summary-diff negative">-36 cal</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Protein</div>
            <div className="summary-value">154g</div>
            <div className="summary-detail">
              <span className="summary-target">Target: 150g</span>
              <span className="summary-diff positive">+4g</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Carbs</div>
            <div className="summary-value">240g</div>
            <div className="summary-detail">
              <span className="summary-target">Target: 250g</span>
              <span className="summary-diff negative">-10g</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Fats</div>
            <div className="summary-value">72g</div>
            <div className="summary-detail">
              <span className="summary-target">Target: 70g</span>
              <span className="summary-diff positive">+2g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
