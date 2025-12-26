import React, { useState } from 'react';
import { Search, Plus, BookOpen, Filter } from 'lucide-react';
import { useHealthStore } from '../../../stores/healthStore';
import { EmptyState } from '../../ui';
import RecipeCard from './RecipeCard';
import AddRecipeModal from './AddRecipeModal';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'snack', name: 'Snack' },
];

export default function RecipeLibrary({ selectable = false, onSelectRecipe }) {
  const { recipes, deleteRecipe } = useHealthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      !searchQuery ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients?.some((ing) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'all' || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowAddModal(true);
  };

  const handleDelete = (recipeId) => {
    if (confirm('Delete this recipe?')) {
      deleteRecipe(recipeId);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRecipe(null);
  };

  return (
    <div className="recipe-library">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Recipe Library</h3>
          <span className="text-sm text-white/50">({recipes.length})</span>
        </div>
        {!selectable && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Recipe
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes or ingredients..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              selectable={selectable}
              onSelect={onSelectRecipe}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          type="recipes"
          title="No recipes yet"
          description="Build your recipe library to make meal planning easy. Add your favourite meals and we'll help you plan your week."
          variant="emerald"
          size="sm"
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Recipe
            </button>
          }
        />
      ) : (
        <div className="text-center py-8 text-white/50">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No recipes match your search</p>
        </div>
      )}

      {/* Add/Edit Recipe Modal */}
      {showAddModal && (
        <AddRecipeModal onClose={handleCloseModal} editRecipe={editingRecipe} />
      )}
    </div>
  );
}
