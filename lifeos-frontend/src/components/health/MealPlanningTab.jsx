import React, { useState } from 'react';
import { Calendar, BookOpen, ShoppingCart } from 'lucide-react';
import { RecipeLibrary, WeeklyMealPlanner, GroceryList } from './meal-planning';

const SUB_TABS = [
  { id: 'planner', name: 'Week Planner', icon: Calendar },
  { id: 'recipes', name: 'Recipes', icon: BookOpen },
  { id: 'grocery', name: 'Grocery List', icon: ShoppingCart },
];

export default function MealPlanningTab() {
  const [activeSubTab, setActiveSubTab] = useState('planner');

  const handleGenerateGroceryList = () => {
    setActiveSubTab('grocery');
  };

  return (
    <div className="meal-planning-tab px-4 py-6">
      {/* Sub-tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeSubTab === 'planner' && (
          <WeeklyMealPlanner onGenerateGroceryList={handleGenerateGroceryList} />
        )}
        {activeSubTab === 'recipes' && <RecipeLibrary />}
        {activeSubTab === 'grocery' && <GroceryList />}
      </div>
    </div>
  );
}
