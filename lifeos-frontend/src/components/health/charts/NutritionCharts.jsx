import React, { useState, useMemo, useEffect } from 'react';
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
import { useHealthStore } from '../../../stores/healthStore';
import './NutritionCharts.css';

// Hook to get responsive chart dimensions
const useChartDimensions = () => {
  const [dimensions, setDimensions] = useState({ height: 300, pieRadius: 100 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      if (width <= 480) setDimensions({ height: 220, pieRadius: 60 });
      else if (width <= 768) setDimensions({ height: 250, pieRadius: 80 });
      else setDimensions({ height: 300, pieRadius: 100 });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return dimensions;
};

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
  const { height: chartHeight, pieRadius } = useChartDimensions();

  // Connect to store
  const { meals, dailyGoals } = useHealthStore();

  // Calculate chart data from real meals
  const chartData = useMemo(() => {
    const today = new Date();
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const targetCalories = dailyGoals?.calories || 2200;
    const targetProtein = dailyGoals?.protein || 150;
    const targetCarbs = dailyGoals?.carbs || 250;
    const targetFat = dailyGoals?.fat || 70;

    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Weekly data for calories trend
    const weeklyData = last7Days.map(date => {
      const dayMeals = (meals || []).filter(m => m.timestamp?.startsWith(date));
      const dayOfWeek = new Date(date).getDay();
      return {
        day: dayLabels[dayOfWeek],
        // Support both field naming conventions (totalCalories from store, calories from legacy)
        calories: dayMeals.reduce((sum, m) => sum + (m.totalCalories || m.calories || 0), 0),
        protein: dayMeals.reduce((sum, m) => sum + (m.totalProtein || m.protein || 0), 0),
        carbs: dayMeals.reduce((sum, m) => sum + (m.totalCarbs || m.carbs || 0), 0),
        fat: dayMeals.reduce((sum, m) => sum + (m.totalFat || m.fat || 0), 0),
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat
      };
    });

    // Calculate totals for macro split
    const todayStr = today.toISOString().split('T')[0];
    const todayMeals = (meals || []).filter(m => m.timestamp?.startsWith(todayStr));
    const totalProtein = todayMeals.reduce((sum, m) => sum + (m.totalProtein || m.protein || 0), 0);
    const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.totalCarbs || m.carbs || 0), 0);
    const totalFat = todayMeals.reduce((sum, m) => sum + (m.totalFat || m.fat || 0), 0);
    const totalMacros = totalProtein + totalCarbs + totalFat;

    const macroSplitData = totalMacros > 0 ? [
      { name: 'Protein', value: Math.round((totalProtein / totalMacros) * 100), color: '#8b5cf6' },
      { name: 'Carbs', value: Math.round((totalCarbs / totalMacros) * 100), color: '#3b82f6' },
      { name: 'Fat', value: Math.round((totalFat / totalMacros) * 100), color: '#f59e0b' }
    ] : [
      { name: 'Protein', value: 30, color: '#8b5cf6' },
      { name: 'Carbs', value: 50, color: '#3b82f6' },
      { name: 'Fat', value: 20, color: '#f59e0b' }
    ];

    // Group meals by type for meal breakdown
    const mealTypes = { breakfast: { meal: 'Breakfast', calories: 0, protein: 0, carbs: 0, fat: 0 },
                       lunch: { meal: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0 },
                       dinner: { meal: 'Dinner', calories: 0, protein: 0, carbs: 0, fat: 0 },
                       snack: { meal: 'Snacks', calories: 0, protein: 0, carbs: 0, fat: 0 } };

    todayMeals.forEach(m => {
      const type = (m.type || m.meal_type || m.mealType || 'snack').toLowerCase();
      const key = type === 'snacks' ? 'snack' : type;
      if (mealTypes[key]) {
        mealTypes[key].calories += m.totalCalories || m.calories || 0;
        mealTypes[key].protein += m.totalProtein || m.protein || 0;
        mealTypes[key].carbs += m.totalCarbs || m.carbs || 0;
        mealTypes[key].fat += m.totalFat || m.fat || 0;
      }
    });

    const mealData = Object.values(mealTypes);

    // Nutrient goals comparison
    const todayCalories = todayMeals.reduce((sum, m) => sum + (m.totalCalories || m.calories || 0), 0);
    const nutrientGoalsData = [
      { nutrient: 'Calories', actual: todayCalories, goal: targetCalories, fullMark: 3000 },
      { nutrient: 'Protein', actual: totalProtein, goal: targetProtein, fullMark: 200 },
      { nutrient: 'Carbs', actual: totalCarbs, goal: targetCarbs, fullMark: 350 },
      { nutrient: 'Fat', actual: totalFat, goal: targetFat, fullMark: 100 },
      { nutrient: 'Fiber', actual: todayMeals.reduce((sum, m) => sum + (m.totalFiber || m.fiber || 0), 0), goal: 30, fullMark: 50 }
    ];

    // Stats
    const daysTracked = weeklyData.filter(d => d.calories > 0).length;
    const avgDailyCalories = daysTracked > 0
      ? Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / daysTracked)
      : 0;
    const goalAchievement = targetCalories > 0 && avgDailyCalories > 0
      ? Math.round((Math.min(avgDailyCalories, targetCalories) / targetCalories) * 100)
      : 0;

    return {
      weeklyData,
      macroSplitData,
      mealData,
      nutrientGoalsData,
      stats: {
        avgDailyCalories,
        goalAchievement,
        daysTracked
      }
    };
  }, [meals, dailyGoals]);

  const { weeklyData, macroSplitData, mealData, nutrientGoalsData, stats } = chartData;

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
            <div className="chart-wrapper chart-wrapper-single-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
          </div>
        )}

        {/* Macro Split Pie Chart */}
        {activeChart === 'macro-split' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Macronutrient Distribution</h3>
              <p className="chart-subtitle">Daily macro breakdown</p>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={macroSplitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={pieRadius >= 80 ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                    outerRadius={pieRadius}
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
            </div>
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
            <div className="chart-wrapper chart-wrapper-single-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
          </div>
        )}

        {/* Nutrient Goals Radar Chart */}
        {activeChart === 'nutrient-goals' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Progress vs Goals</h3>
              <p className="chart-subtitle">How you're tracking against targets</p>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
            <div className="stat-value">{stats.avgDailyCalories.toLocaleString()}</div>
            <div className="stat-label">Avg Daily Calories</div>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <Target className="w-5 h-5" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.goalAchievement}%</div>
            <div className="stat-label">Goal Achievement</div>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
            <Activity className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.daysTracked}/7</div>
            <div className="stat-label">Days Tracked</div>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
            <Zap className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.daysTracked > 0 ? stats.daysTracked : '-'}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
