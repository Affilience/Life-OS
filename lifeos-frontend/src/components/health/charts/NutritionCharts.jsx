import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity, Target, Zap } from 'lucide-react';
import './NutritionCharts.css';

// Generate sample data for last 7 days
const generateSampleData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => ({
    day,
    calories: 1800 + Math.floor(Math.random() * 600),
    protein: 120 + Math.floor(Math.random() * 60),
    carbs: 180 + Math.floor(Math.random() * 100),
    fat: 50 + Math.floor(Math.random() * 40),
    targetCalories: 2200,
    targetProtein: 150,
    targetCarbs: 250,
    targetFat: 70,
  }));
};

const weeklyData = generateSampleData();

// Macro split data
const macroSplitData = [
  { name: 'Protein', value: 30, color: '#8b5cf6' },
  { name: 'Carbs', value: 50, color: '#3b82f6' },
  { name: 'Fat', value: 20, color: '#f59e0b' },
];

// Meal breakdown data
const mealData = [
  { meal: 'Breakfast', calories: 450, protein: 35, carbs: 45, fat: 12 },
  { meal: 'Lunch', calories: 650, protein: 45, carbs: 70, fat: 22 },
  { meal: 'Dinner', calories: 700, protein: 50, carbs: 65, fat: 25 },
  { meal: 'Snacks', calories: 300, protein: 20, carbs: 35, fat: 11 },
];

// Nutrient comparison to goals
const nutrientGoalsData = [
  { nutrient: 'Calories', actual: 2100, goal: 2200, fullMark: 3000 },
  { nutrient: 'Protein', actual: 150, goal: 150, fullMark: 200 },
  { nutrient: 'Carbs', actual: 215, goal: 250, fullMark: 350 },
  { nutrient: 'Fat', actual: 70, goal: 70, fullMark: 100 },
  { nutrient: 'Fiber', actual: 28, goal: 30, fullMark: 50 },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function NutritionCharts() {
  const [activeChart, setActiveChart] = useState('weekly-calories');

  const charts = [
    { id: 'weekly-calories', label: 'Weekly Calories', icon: TrendingUp },
    { id: 'macro-split', label: 'Macro Split', icon: Target },
    { id: 'meal-breakdown', label: 'Meal Breakdown', icon: Activity },
    { id: 'nutrient-goals', label: 'vs Goals', icon: Zap },
  ];

  return (
    <div className="nutrition-charts-container">
      {/* Chart Selector */}
      <div className="chart-selector">
        {charts.map(chart => {
          const Icon = chart.icon;
          return (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`chart-selector-btn ${activeChart === chart.id ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {chart.label}
            </button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="charts-display">
        {/* Weekly Calorie Trend */}
        {activeChart === 'weekly-calories' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Weekly Calorie Trend</h3>
              <p className="chart-subtitle">Daily calories vs target goal</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#calorieGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="targetCalories"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Macro Split Pie Chart */}
        {activeChart === 'macro-split' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Macronutrient Distribution</h3>
              <p className="chart-subtitle">Daily macro breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={macroSplitData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="macro-legend">
              {macroSplitData.map(macro => (
                <div key={macro.name} className="macro-legend-item">
                  <div className="macro-color" style={{ background: macro.color }} />
                  <span className="macro-name">{macro.name}</span>
                  <span className="macro-value">{macro.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meal Breakdown Bar Chart */}
        {activeChart === 'meal-breakdown' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Meal Breakdown</h3>
              <p className="chart-subtitle">Calories and macros per meal</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mealData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="meal" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                <Bar dataKey="protein" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="carbs" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="fat" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Nutrient Goals Radar Chart */}
        {activeChart === 'nutrient-goals' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Progress vs Goals</h3>
              <p className="chart-subtitle">How you're tracking against targets</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={nutrientGoalsData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="nutrient" stroke="rgba(255,255,255,0.6)" />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" />
                <Radar
                  name="Actual"
                  dataKey="actual"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                <Radar
                  name="Goal"
                  dataKey="goal"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional Stats Cards */}
      <div className="nutrition-stats-grid">
        <div className="nutrition-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">2,100</div>
            <div className="stat-label">Avg Daily Calories</div>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <Target className="w-5 h-5" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">95%</div>
            <div className="stat-label">Goal Achievement</div>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
            <Activity className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">7/7</div>
            <div className="stat-label">Days Tracked</div>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
            <Zap className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">14</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
