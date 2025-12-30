import React, { useState } from 'react';
import { X, Plus, Trash2, ChefHat, Sparkles, Loader2 } from 'lucide-react';
import { useHealthStore } from '../../../stores/healthStore';
import { parseNutrition } from '../../../services/nutritionAI';

const RECIPE_CATEGORIES = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙' },
  { id: 'snack', name: 'Snack', emoji: '🍎' },
];

const INGREDIENT_CATEGORIES = [
  'produce',
  'protein',
  'dairy',
  'grains',
  'pantry',
  'frozen',
  'other',
];

export default function AddRecipeModal({ onClose, editRecipe = null }) {
  const { addRecipe, updateRecipe } = useHealthStore();

  const [formData, setFormData] = useState({
    name: editRecipe?.name || '',
    category: editRecipe?.category || 'lunch',
    prepTime: editRecipe?.prepTime || '',
    cookTime: editRecipe?.cookTime || '',
    servings: editRecipe?.servings || 2,
    calories: editRecipe?.calories || '',
    protein: editRecipe?.protein || '',
    carbs: editRecipe?.carbs || '',
    fat: editRecipe?.fat || '',
    instructions: editRecipe?.instructions || '',
  });

  const [ingredients, setIngredients] = useState(
    editRecipe?.ingredients || [{ name: '', quantity: 1, unit: 'unit', category: 'other' }]
  );

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculateError, setCalculateError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-calculate nutrition from ingredients using AI
  const calculateNutrition = async () => {
    const validIngredients = ingredients.filter(ing => ing.name.trim());
    if (validIngredients.length === 0) {
      setCalculateError('Add at least one ingredient first');
      return;
    }

    setIsCalculating(true);
    setCalculateError(null);

    try {
      // Format ingredients as a meal description
      const mealDescription = validIngredients
        .map(ing => {
          const qty = ing.quantity || 1;
          const unit = ing.unit !== 'unit' ? ing.unit : '';
          return `${qty}${unit ? ' ' + unit : ''} ${ing.name}`.trim();
        })
        .join(', ');

      const result = await parseNutrition(mealDescription);

      if (result.success && result.totals) {
        // Calculate per-serving values
        const servings = parseInt(formData.servings) || 1;
        setFormData(prev => ({
          ...prev,
          calories: Math.round(result.totals.calories / servings),
          protein: Math.round(result.totals.protein / servings),
          carbs: Math.round(result.totals.carbs / servings),
          fat: Math.round(result.totals.fat / servings),
        }));
      } else {
        setCalculateError('Could not calculate nutrition. Try being more specific with ingredients.');
      }
    } catch (err) {
      console.error('Nutrition calculation error:', err);
      setCalculateError(err.message || 'Failed to calculate nutrition');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { name: '', quantity: 1, unit: 'unit', category: 'other' },
    ]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const recipeData = {
      ...formData,
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      servings: parseInt(formData.servings) || 1,
      calories: parseInt(formData.calories) || 0,
      protein: parseInt(formData.protein) || 0,
      carbs: parseInt(formData.carbs) || 0,
      fat: parseInt(formData.fat) || 0,
      ingredients: ingredients.filter((ing) => ing.name.trim()),
    };

    if (editRecipe) {
      updateRecipe(editRecipe.id, recipeData);
    } else {
      addRecipe(recipeData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#1a1724] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {editRecipe ? 'Edit Recipe' : 'Add Recipe'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Recipe Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Recipe Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Grilled Chicken Salad"
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RECIPE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleChange('category', cat.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    formData.category === cat.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="block text-xs mt-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time and Servings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Prep (min)
              </label>
              <input
                type="number"
                value={formData.prepTime}
                onChange={(e) => handleChange('prepTime', e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Cook (min)
              </label>
              <input
                type="number"
                value={formData.cookTime}
                onChange={(e) => handleChange('cookTime', e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Servings
              </label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => handleChange('servings', e.target.value)}
                min="1"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Nutrition Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/70">
                Nutrition (per serving)
              </label>
              <button
                type="button"
                onClick={calculateNutrition}
                disabled={isCalculating || ingredients.filter(ing => ing.name.trim()).length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-white/5 disabled:cursor-not-allowed text-purple-400 disabled:text-white/30 rounded-lg text-xs font-medium transition-colors"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Calculate
                  </>
                )}
              </button>
            </div>
            {calculateError && (
              <p className="text-xs text-red-400 mb-2">{calculateError}</p>
            )}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleChange('calories', e.target.value)}
                  placeholder="kcal"
                  className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-orange-500/50"
                />
                <span className="text-xs text-white/40 mt-0.5 block">Calories</span>
              </div>
              <div>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => handleChange('protein', e.target.value)}
                  placeholder="g"
                  className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                />
                <span className="text-xs text-white/40 mt-0.5 block">Protein</span>
              </div>
              <div>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => handleChange('carbs', e.target.value)}
                  placeholder="g"
                  className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                />
                <span className="text-xs text-white/40 mt-0.5 block">Carbs</span>
              </div>
              <div>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => handleChange('fat', e.target.value)}
                  placeholder="g"
                  className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-rose-500/50"
                />
                <span className="text-xs text-white/40 mt-0.5 block">Fat</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Ingredients
            </label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    className="flex-1 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.25"
                    className="w-16 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-emerald-500/50"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="unit">unit</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="oz">oz</option>
                    <option value="lb">lb</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="cup">cup</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 w-full py-2 border border-dashed border-white/20 rounded-lg text-white/50 hover:border-emerald-500/50 hover:text-emerald-400 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Instructions (optional)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Step-by-step instructions..."
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            {editRecipe ? 'Save Changes' : 'Add Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
}
