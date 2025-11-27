import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  TrendingUp,
  Target,
  Mic,
  Star,
  Copy,
  Calendar,
  ChevronRight,
  Pill,
  BarChart3,
  Trash2,
} from 'lucide-react';
import NutritionCharts from './charts/NutritionCharts';
import SmartMealLogger from './SmartMealLogger';
import MicronutrientBreakdown from './MicronutrientBreakdown';
import { useHealthStore } from '../../stores/healthStore';
import './NutritionTab.css';

export default function NutritionTab() {
  const [showSupplements, setShowSupplements] = useState(false);
  const [showMicronutrients, setShowMicronutrients] = useState(false);

  // Use health store for meals
  const {
    meals,
    dailyGoals,
    selectedDate,
    addMeal,
    deleteMeal,
    getMealsForDate,
    getDailyTotals,
  } = useHealthStore();

  // Get meals and totals for selected date
  const todayMeals = getMealsForDate(selectedDate);
  const dailyTotals = getDailyTotals(selectedDate);

  // Calculate today's stats
  const todayStats = {
    calories: { current: dailyTotals.calories, goal: dailyGoals.calories },
    protein: { current: dailyTotals.protein, goal: dailyGoals.protein },
    carbs: { current: dailyTotals.carbs, goal: dailyGoals.carbs },
    fat: { current: dailyTotals.fat, goal: dailyGoals.fat },
  };

  const handleMealLogged = (mealData) => {
    addMeal(mealData);
  };

  const handleDeleteMeal = (mealId) => {
    deleteMeal(mealId);
  };

  // Meal type icons
  const mealTypeIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  };

  // Convert meals to display format
  const recentMeals = todayMeals.map((meal) => {
    const date = new Date(meal.timestamp);

    return {
      id: meal.id,
      type: meal.mealType ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1) : 'Meal',
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      description: meal.description || (meal.items ? meal.items.map(i => i.name).join(', ') : 'Logged meal'),
      calories: Math.round(meal.totalCalories || 0),
      protein: Math.round((meal.totalProtein || 0) * 10) / 10,
      carbs: Math.round((meal.totalCarbs || 0) * 10) / 10,
      fat: Math.round((meal.totalFat || 0) * 10) / 10,
      icon: mealTypeIcons[meal.mealType] || '🍽️',
    };
  });

  const caloriesPercentage = (todayStats.calories.current / todayStats.calories.goal) * 100;
  const proteinPercentage = (todayStats.protein.current / todayStats.protein.goal) * 100;

  return (
    <div className="nutrition-tab">
      {/* Smart Meal Logger with AI parsing */}
      <SmartMealLogger onMealLogged={handleMealLogged} />

      {/* Today's Summary */}
      <div className="todays-summary-section">
        <div className="summary-header">
          <div className="summary-header-left">
            <Calendar className="w-4 h-4" />
            <h3 className="summary-title">Today - Monday, Jan 19</h3>
          </div>
          <button
            className="supplements-toggle"
            onClick={() => setShowSupplements(!showSupplements)}
          >
            <Pill className="w-4 h-4" />
            Supplements
            <ChevronRight
              className={`w-4 h-4 transition-transform ${showSupplements ? 'rotate-90' : ''}`}
            />
          </button>
        </div>

        <div className="nutrition-stats-grid">
          {/* Calories */}
          <div className="nutrition-stat-card primary">
            <div className="stat-icon calories">
              <Target className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <div className="stat-values">
                <span className="stat-current">{todayStats.calories.current}</span>
                <span className="stat-divider">/</span>
                <span className="stat-goal">{todayStats.calories.goal}</span>
                <span className="stat-unit">kcal</span>
              </div>
              <div className="stat-label">Calories</div>
              <div className="stat-progress-bar">
                <div
                  className="stat-progress-fill"
                  style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
                />
              </div>
              <div className="stat-percentage">{Math.round(caloriesPercentage)}%</div>
            </div>
          </div>

          {/* Protein */}
          <div className="nutrition-stat-card">
            <div className="stat-icon protein">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <div className="stat-values">
                <span className="stat-current">{todayStats.protein.current}g</span>
                <span className="stat-divider">/</span>
                <span className="stat-goal">{todayStats.protein.goal}g</span>
              </div>
              <div className="stat-label">Protein</div>
              <div className="stat-progress-bar">
                <div
                  className="stat-progress-fill protein"
                  style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                />
              </div>
              <div className="stat-percentage">{Math.round(proteinPercentage)}%</div>
            </div>
          </div>

          {/* Carbs */}
          <div className="nutrition-stat-card">
            <div className="stat-icon carbs">
              <div className="stat-icon-text">C</div>
            </div>
            <div className="stat-content">
              <div className="stat-values">
                <span className="stat-current">{todayStats.carbs.current}g</span>
                <span className="stat-divider">/</span>
                <span className="stat-goal">{todayStats.carbs.goal}g</span>
              </div>
              <div className="stat-label">Carbs</div>
            </div>
          </div>

          {/* Fat */}
          <div className="nutrition-stat-card">
            <div className="stat-icon fat">
              <div className="stat-icon-text">F</div>
            </div>
            <div className="stat-content">
              <div className="stat-values">
                <span className="stat-current">{todayStats.fat.current}g</span>
                <span className="stat-divider">/</span>
                <span className="stat-goal">{todayStats.fat.goal}g</span>
              </div>
              <div className="stat-label">Fat</div>
            </div>
          </div>
        </div>

        <button
          className="view-micronutrients-btn"
          onClick={() => setShowMicronutrients(true)}
        >
          View Micronutrients
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Supplements Section */}
      {showSupplements && (
        <div className="supplements-section">
          <div className="supplements-header">
            <h3 className="section-title">Your Daily Stack</h3>
            <button className="add-supplement-btn">+ Add Supplement</button>
          </div>

          <div className="supplements-list">
            <div className="supplement-time-group">
              <h4 className="supplement-time-label">Morning (with breakfast)</h4>
              <div className="supplement-items">
                <div className="supplement-item taken">
                  <div className="supplement-checkbox checked">✓</div>
                  <div className="supplement-content">
                    <div className="supplement-name">Vitamin D3 (5000 IU)</div>
                    <div className="supplement-meta">Taken at 8:00am</div>
                  </div>
                </div>

                <div className="supplement-item taken">
                  <div className="supplement-checkbox checked">✓</div>
                  <div className="supplement-content">
                    <div className="supplement-name">Omega-3 Fish Oil (1000mg)</div>
                    <div className="supplement-meta">Taken at 8:00am</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="supplement-time-group">
              <h4 className="supplement-time-label">Evening (before bed)</h4>
              <div className="supplement-items">
                <div className="supplement-item">
                  <div className="supplement-checkbox"></div>
                  <div className="supplement-content">
                    <div className="supplement-name">Magnesium Glycinate (400mg)</div>
                    <div className="supplement-meta">Not taken yet</div>
                  </div>
                </div>

                <div className="supplement-item">
                  <div className="supplement-checkbox"></div>
                  <div className="supplement-content">
                    <div className="supplement-name">Zinc (30mg)</div>
                    <div className="supplement-meta">Not taken yet</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Charts & Analytics */}
      <div className="nutrition-analytics-section">
        <div className="section-header">
          <div className="header-icon">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="header-text">
            <h2 className="section-title">Nutrition Analytics</h2>
            <p className="section-description">
              Track trends, patterns, and progress toward your goals
            </p>
          </div>
        </div>
        <NutritionCharts />
      </div>

      {/* Recent Meals */}
      <div className="recent-meals-section">
        <h3 className="section-title">Your Meals Today</h3>

        {recentMeals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p className="empty-text">No meals logged yet today</p>
            <p className="empty-hint">Type what you ate above to get started</p>
          </div>
        ) : (
          <div className="meals-list">
            {recentMeals.map((meal) => (
              <div key={meal.id} className="meal-card">
                <div className="meal-header">
                  <div className="meal-icon">{meal.icon}</div>
                  <div className="meal-title-section">
                    <h4 className="meal-type">{meal.type}</h4>
                    <div className="meal-time">
                      <Clock className="w-3 h-3" />
                      {meal.time}
                    </div>
                  </div>
                  <div className="meal-calories">{meal.calories} kcal</div>
                </div>

                <p className="meal-description">{meal.description}</p>

                <div className="meal-macros">
                  <div className="macro">
                    <span className="macro-label">P:</span>
                    <span className="macro-value">{meal.protein}g</span>
                  </div>
                  <div className="macro">
                    <span className="macro-label">C:</span>
                    <span className="macro-value">{meal.carbs}g</span>
                  </div>
                  <div className="macro">
                    <span className="macro-label">F:</span>
                    <span className="macro-value">{meal.fat}g</span>
                  </div>
                  <button
                    className="meal-delete-btn"
                    onClick={() => handleDeleteMeal(meal.id)}
                    title="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Micronutrient Breakdown Modal */}
      {showMicronutrients && (
        <MicronutrientBreakdown
          totals={dailyTotals}
          onClose={() => setShowMicronutrients(false)}
        />
      )}
    </div>
  );
}
