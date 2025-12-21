import React, { useMemo } from 'react';
import { Apple, TrendingUp, Target, Activity } from 'lucide-react';
import AnalyticsCard from '../shared/AnalyticsCard';
import TrendLineChart from '../charts/TrendLineChart';
import ComparisonBarChart from '../charts/ComparisonBarChart';
import { useHealthStore } from '../../stores/healthStore';
import './NutritionAnalytics.css';

export default function NutritionAnalytics() {
  const { meals, dailyGoals } = useHealthStore();

  // Calculate all analytics data from meals
  const { calorieData, proteinData, carbsData, adherenceData, summary } = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const targetCalories = dailyGoals?.calories || 2300;
    const targetProtein = dailyGoals?.protein || 150;
    const targetCarbs = dailyGoals?.carbs || 250;
    const targetFat = dailyGoals?.fat || 70;

    // Build last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push({
        dateStr: d.toISOString().split('T')[0],
        dayOfWeek: d.getDay()
      });
    }

    // Aggregate meals by day
    const dailyData = last7Days.map(({ dateStr, dayOfWeek }) => {
      const dayMeals = (meals || []).filter(m => m.timestamp?.startsWith(dateStr));
      const calories = dayMeals.reduce((sum, m) => sum + (m.totalCalories || m.calories || 0), 0);
      const protein = dayMeals.reduce((sum, m) => sum + (m.totalProtein || m.protein || 0), 0);
      const carbs = dayMeals.reduce((sum, m) => sum + (m.totalCarbs || m.carbs || 0), 0);
      const fat = dayMeals.reduce((sum, m) => sum + (m.totalFat || m.fat || 0), 0);

      // Calculate adherence as % of target (100% = perfect)
      const calorieAdherence = targetCalories > 0 ? Math.min(100, (calories / targetCalories) * 100) : 0;

      return {
        date: dayLabels[dayOfWeek],
        calories,
        protein,
        carbs,
        fat,
        adherence: Math.round(calorieAdherence)
      };
    });

    // Build separate data arrays for each chart
    const calorieDataArr = dailyData.map(d => ({ date: d.date, calories: d.calories }));
    const proteinDataArr = dailyData.map(d => ({ date: d.date, grams: d.protein }));
    const carbsDataArr = dailyData.map(d => ({ date: d.date, grams: d.carbs }));
    const adherenceDataArr = dailyData.map(d => ({ date: d.date, adherence: d.adherence }));

    // Calculate summary stats
    const daysWithData = dailyData.filter(d => d.calories > 0).length;
    const avgCalories = daysWithData > 0
      ? Math.round(dailyData.reduce((sum, d) => sum + d.calories, 0) / daysWithData)
      : 0;
    const avgProtein = daysWithData > 0
      ? Math.round(dailyData.reduce((sum, d) => sum + d.protein, 0) / daysWithData)
      : 0;
    const avgCarbs = daysWithData > 0
      ? Math.round(dailyData.reduce((sum, d) => sum + d.carbs, 0) / daysWithData)
      : 0;
    const avgFat = daysWithData > 0
      ? Math.round(dailyData.reduce((sum, d) => sum + d.fat, 0) / daysWithData)
      : 0;
    const avgAdherence = daysWithData > 0
      ? Math.round(dailyData.reduce((sum, d) => sum + d.adherence, 0) / daysWithData)
      : 0;

    return {
      calorieData: calorieDataArr,
      proteinData: proteinDataArr,
      carbsData: carbsDataArr,
      adherenceData: adherenceDataArr,
      summary: {
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFat,
        avgAdherence,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        calorieDiff: avgCalories - targetCalories,
        proteinDiff: avgProtein - targetProtein,
        carbsDiff: avgCarbs - targetCarbs,
        fatDiff: avgFat - targetFat
      }
    };
  }, [meals, dailyGoals]);
  return (
    <div className="nutrition-analytics">
      {/* Calorie Trends */}
      <AnalyticsCard
        title="Daily Calorie Intake"
        icon={Apple}
        metric={{
          value: `${summary.avgCalories.toLocaleString()} cal`,
          change: summary.calorieDiff !== 0 ? Math.round((summary.calorieDiff / summary.targetCalories) * 100) : 0
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
          value: `${summary.avgProtein}g`,
          change: summary.proteinDiff !== 0 ? Math.round((summary.proteinDiff / summary.targetProtein) * 100) : 0
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
          value: `${summary.avgCarbs}g`,
          change: summary.carbsDiff !== 0 ? Math.round((summary.carbsDiff / summary.targetCarbs) * 100) : 0
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
          value: `${summary.avgAdherence}%`,
          change: 0
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
            <div className="summary-value">{summary.avgCalories.toLocaleString()}</div>
            <div className="summary-detail">
              <span className="summary-target">Target: {summary.targetCalories.toLocaleString()}</span>
              <span className={`summary-diff ${summary.calorieDiff >= 0 ? 'positive' : 'negative'}`}>
                {summary.calorieDiff >= 0 ? '+' : ''}{summary.calorieDiff} cal
              </span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Protein</div>
            <div className="summary-value">{summary.avgProtein}g</div>
            <div className="summary-detail">
              <span className="summary-target">Target: {summary.targetProtein}g</span>
              <span className={`summary-diff ${summary.proteinDiff >= 0 ? 'positive' : 'negative'}`}>
                {summary.proteinDiff >= 0 ? '+' : ''}{summary.proteinDiff}g
              </span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Carbs</div>
            <div className="summary-value">{summary.avgCarbs}g</div>
            <div className="summary-detail">
              <span className="summary-target">Target: {summary.targetCarbs}g</span>
              <span className={`summary-diff ${summary.carbsDiff >= 0 ? 'positive' : 'negative'}`}>
                {summary.carbsDiff >= 0 ? '+' : ''}{summary.carbsDiff}g
              </span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Fats</div>
            <div className="summary-value">{summary.avgFat}g</div>
            <div className="summary-detail">
              <span className="summary-target">Target: {summary.targetFat}g</span>
              <span className={`summary-diff ${summary.fatDiff >= 0 ? 'positive' : 'negative'}`}>
                {summary.fatDiff >= 0 ? '+' : ''}{summary.fatDiff}g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
