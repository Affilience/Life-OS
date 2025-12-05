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
  Droplet,
  Plus,
  Minus,
  ScanBarcode,
  UtensilsCrossed,
  BookOpen,
  Settings,
  GlassWater,
  CupSoda,
  X,
} from 'lucide-react';
import NutritionCharts from './charts/NutritionCharts';
import SmartMealLogger from './SmartMealLogger';
import MicronutrientBreakdown from './MicronutrientBreakdown';
import MacroGoalsModal from './MacroGoalsModal';
import BarcodeScanner from './BarcodeScanner';
import { WeeklyMealPlanner, RecipeLibrary, GroceryList } from './meal-planning';
import { SupplementSchedule } from './supplements';
import { useHealthStore } from '../../stores/healthStore';
import { EmptyState } from '../ui';
import './NutritionTab.css';

const SUB_TABS = [
  { id: 'tracking', name: 'Tracking', icon: Target },
  { id: 'meal-plans', name: 'Meal Plans', icon: UtensilsCrossed },
  { id: 'supplements', name: 'Supplements', icon: Pill },
];

export default function NutritionTab() {
  const [activeSubTab, setActiveSubTab] = useState('tracking');
  const [mealPlanSubTab, setMealPlanSubTab] = useState('planner');
  const [showMicronutrients, setShowMicronutrients] = useState(false);
  const [showMacroGoals, setShowMacroGoals] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);

  // Use health store for meals and water
  const {
    meals,
    dailyGoals,
    selectedDate,
    addMeal,
    deleteMeal,
    getMealsForDate,
    getDailyTotals,
    addWater,
    removeWater,
    getWaterForDate,
    setWaterSettings,
    waterUnit,
    waterContainerMl,
  } = useHealthStore();

  const [showWaterSettings, setShowWaterSettings] = useState(false);

  // Get water intake for today - now with ml-based tracking
  const waterData = getWaterForDate(selectedDate);

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

  // Handle scanned product from barcode
  const handleProductScanned = (product) => {
    setScannedProduct(product);
    setShowBarcodeScanner(false);
  };

  // Log scanned product as a meal
  const handleLogScannedProduct = (servings = 1) => {
    if (!scannedProduct) return;

    const meal = {
      mealType: 'snack', // Default to snack, user can change
      description: scannedProduct.brand
        ? `${scannedProduct.food} (${scannedProduct.brand})`
        : scannedProduct.food,
      items: [{
        name: scannedProduct.food,
        calories: Math.round(scannedProduct.calories * servings),
        protein: Math.round(scannedProduct.protein * servings * 10) / 10,
        carbs: Math.round(scannedProduct.carbs * servings * 10) / 10,
        fat: Math.round(scannedProduct.fat * servings * 10) / 10,
        fiber: Math.round((scannedProduct.fiber || 0) * servings * 10) / 10,
        sugar: Math.round((scannedProduct.sugar || 0) * servings * 10) / 10,
        saturatedFat: Math.round((scannedProduct.saturatedFat || 0) * servings * 10) / 10,
        sodium: Math.round((scannedProduct.sodium || 0) * servings),
        amount: servings,
        unit: 'serving',
      }],
      totalCalories: Math.round(scannedProduct.calories * servings),
      totalProtein: Math.round(scannedProduct.protein * servings * 10) / 10,
      totalCarbs: Math.round(scannedProduct.carbs * servings * 10) / 10,
      totalFat: Math.round(scannedProduct.fat * servings * 10) / 10,
      totalFiber: Math.round((scannedProduct.fiber || 0) * servings * 10) / 10,
      totalSugar: Math.round((scannedProduct.sugar || 0) * servings * 10) / 10,
      totalSodium: Math.round((scannedProduct.sodium || 0) * servings),
    };

    addMeal(meal);
    setScannedProduct(null);
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

  const handleGenerateGroceryList = () => {
    setMealPlanSubTab('grocery');
  };

  return (
    <div className="nutrition-tab">
      {/* Sub-tab Navigation */}
      <div className="nutrition-sub-tabs">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`nutrition-sub-tab ${activeSubTab === tab.id ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tracking Tab Content */}
      {activeSubTab === 'tracking' && (
        <>
          {/* Smart Meal Logger with AI parsing */}
          <SmartMealLogger onMealLogged={handleMealLogged} />

      {/* Barcode Scan Button */}
      <button
        className="barcode-scan-btn"
        onClick={() => setShowBarcodeScanner(true)}
      >
        <ScanBarcode className="w-5 h-5" />
        <span>Scan Barcode</span>
        <span className="barcode-hint">for packaged foods</span>
      </button>

      {/* Scanned Product Preview */}
      {scannedProduct && (
        <div className="scanned-product-card">
          <div className="scanned-product-header">
            <div className="scanned-product-info">
              {scannedProduct.imageUrl && (
                <img
                  src={scannedProduct.imageUrl}
                  alt={scannedProduct.food}
                  className="scanned-product-image"
                />
              )}
              <div className="scanned-product-details">
                <h4 className="scanned-product-name">{scannedProduct.food}</h4>
                {scannedProduct.brand && (
                  <p className="scanned-product-brand">{scannedProduct.brand}</p>
                )}
                <p className="scanned-product-serving">
                  Per {scannedProduct.servingSize || 'serving'}
                </p>
              </div>
            </div>
            <button
              className="scanned-product-close"
              onClick={() => setScannedProduct(null)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="scanned-product-macros">
            <div className="scanned-macro">
              <span className="scanned-macro-value">{scannedProduct.calories}</span>
              <span className="scanned-macro-label">cal</span>
            </div>
            <div className="scanned-macro protein">
              <span className="scanned-macro-value">{scannedProduct.protein}g</span>
              <span className="scanned-macro-label">protein</span>
            </div>
            <div className="scanned-macro carbs">
              <span className="scanned-macro-value">{scannedProduct.carbs}g</span>
              <span className="scanned-macro-label">carbs</span>
            </div>
            <div className="scanned-macro fat">
              <span className="scanned-macro-value">{scannedProduct.fat}g</span>
              <span className="scanned-macro-label">fat</span>
            </div>
          </div>

          {scannedProduct.nutriScore && (
            <div className={`nutri-score nutri-score-${scannedProduct.nutriScore}`}>
              Nutri-Score: {scannedProduct.nutriScore.toUpperCase()}
            </div>
          )}

          <button
            className="log-scanned-btn"
            onClick={() => handleLogScannedProduct(1)}
          >
            <Plus className="w-4 h-4" />
            Log This Food
          </button>
        </div>
      )}

      {/* Today's Summary */}
      <div className="todays-summary-section">
        <div className="summary-header">
          <div className="summary-header-left">
            <Calendar className="w-4 h-4" />
            <h3 className="summary-title">Today - Monday, Jan 19</h3>
          </div>
          <button
            onClick={() => setShowMacroGoals(true)}
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors text-fg-tertiary hover:text-fg-secondary"
            title="Edit nutrition goals"
          >
            <Settings className="w-4 h-4" />
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

      {/* Water Intake Tracker - Flexible Units */}
      <div className="water-tracker-section">
        <div className="water-tracker-header">
          <div className="water-tracker-title">
            <Droplet className="w-5 h-5 text-blue-400" />
            <h3>Hydration</h3>
          </div>
          <div className="water-tracker-header-right">
            <div className="water-tracker-count">
              <span className="water-current">{waterData.displayAmount}</span>
              <span className="water-divider">/</span>
              <span className="water-goal">{waterData.displayGoal}</span>
              <span className="water-unit">{waterData.unit}</span>
            </div>
            <button
              className="water-settings-btn"
              onClick={() => setShowWaterSettings(!showWaterSettings)}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="water-progress-container">
          <div className="water-progress-bar">
            <div
              className="water-progress-fill"
              style={{ width: `${Math.min(waterData.percentage, 100)}%` }}
            />
          </div>
          <span className="water-progress-percent">{waterData.percentage}%</span>
        </div>

        {/* Quick Add Buttons */}
        <div className="water-quick-add">
          <button
            className="water-quick-btn"
            onClick={() => addWater(250)}
            title="Add 250ml"
          >
            <GlassWater className="w-4 h-4" />
            <span>250ml</span>
          </button>
          <button
            className="water-quick-btn"
            onClick={() => addWater(500)}
            title="Add 500ml"
          >
            <CupSoda className="w-4 h-4" />
            <span>500ml</span>
          </button>
          <button
            className="water-quick-btn primary"
            onClick={() => addWater()}
            title={`Add ${waterContainerMl}ml (your container)`}
          >
            <Plus className="w-4 h-4" />
            <span>+{waterContainerMl}ml</span>
          </button>
          <button
            className="water-quick-btn remove"
            onClick={() => removeWater()}
            disabled={waterData.amount === 0}
            title="Remove"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {waterData.percentage >= 100 && (
          <div className="water-goal-reached">
            Goal reached! Stay hydrated!
          </div>
        )}

        {/* Settings Panel */}
        {showWaterSettings && (
          <div className="water-settings-panel">
            <div className="water-settings-header">
              <h4>Water Tracking Settings</h4>
              <button onClick={() => setShowWaterSettings(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="water-setting">
              <label>Daily Goal (ml)</label>
              <input
                type="number"
                value={waterData.goal}
                onChange={(e) => setWaterSettings({ goalMl: parseInt(e.target.value) || 2000 })}
                min="500"
                max="5000"
                step="250"
              />
            </div>

            <div className="water-setting">
              <label>Your Container Size (ml)</label>
              <div className="container-presets">
                {[250, 500, 750, 1000].map((size) => (
                  <button
                    key={size}
                    onClick={() => setWaterSettings({ containerMl: size })}
                    className={waterContainerMl === size ? 'active' : ''}
                  >
                    {size}ml
                  </button>
                ))}
              </div>
            </div>

            <div className="water-setting">
              <label>Display Unit</label>
              <div className="unit-options">
                {[
                  { id: 'ml', label: 'Milliliters' },
                  { id: 'oz', label: 'Ounces' },
                  { id: 'glasses', label: 'Glasses' },
                  { id: 'bottles', label: 'Bottles' },
                ].map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setWaterSettings({ unit: unit.id })}
                    className={waterUnit === unit.id ? 'active' : ''}
                  >
                    {unit.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
          <EmptyState
            type="meals"
            title="No meals logged yet today"
            description="Track your nutrition by logging what you eat. Use the smart meal logger above to get started!"
            variant="emerald"
            size="sm"
          />
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

      {showMacroGoals && (
        <MacroGoalsModal onClose={() => setShowMacroGoals(false)} />
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onProductFound={handleProductScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
        </>
      )}

      {/* Meal Plans Tab Content */}
      {activeSubTab === 'meal-plans' && (
        <div className="meal-plans-content">
          {/* Meal Plans Sub-tabs */}
          <div className="meal-plans-sub-tabs">
            <button
              onClick={() => setMealPlanSubTab('planner')}
              className={`meal-plans-sub-tab ${mealPlanSubTab === 'planner' ? 'active' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              Week Planner
            </button>
            <button
              onClick={() => setMealPlanSubTab('recipes')}
              className={`meal-plans-sub-tab ${mealPlanSubTab === 'recipes' ? 'active' : ''}`}
            >
              <BookOpen className="w-4 h-4" />
              Recipes
            </button>
            <button
              onClick={() => setMealPlanSubTab('grocery')}
              className={`meal-plans-sub-tab ${mealPlanSubTab === 'grocery' ? 'active' : ''}`}
            >
              <Target className="w-4 h-4" />
              Grocery List
            </button>
          </div>

          {/* Meal Plans Sub-tab Content */}
          <div className="meal-plans-sub-content">
            {mealPlanSubTab === 'planner' && (
              <WeeklyMealPlanner onGenerateGroceryList={handleGenerateGroceryList} />
            )}
            {mealPlanSubTab === 'recipes' && <RecipeLibrary />}
            {mealPlanSubTab === 'grocery' && <GroceryList />}
          </div>
        </div>
      )}

      {/* Supplements Tab Content */}
      {activeSubTab === 'supplements' && (
        <div className="supplements-content">
          <SupplementSchedule />
        </div>
      )}
    </div>
  );
}
