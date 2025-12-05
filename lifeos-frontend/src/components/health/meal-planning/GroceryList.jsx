import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useHealthStore } from '../../../stores/healthStore';

const GROCERY_CATEGORIES = [
  { id: 'produce', name: 'Produce', emoji: '🥬' },
  { id: 'protein', name: 'Protein', emoji: '🥩' },
  { id: 'dairy', name: 'Dairy', emoji: '🥛' },
  { id: 'grains', name: 'Grains', emoji: '🍞' },
  { id: 'pantry', name: 'Pantry', emoji: '🥫' },
  { id: 'frozen', name: 'Frozen', emoji: '🧊' },
  { id: 'other', name: 'Other', emoji: '📦' },
];

export default function GroceryList() {
  const {
    groceryItems,
    addGroceryItem,
    toggleGroceryItem,
    deleteGroceryItem,
    clearCheckedGroceryItems,
    clearAllGroceryItems,
  } = useHealthStore();

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('unit');
  const [newItemCategory, setNewItemCategory] = useState('other');

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    groceryItems.forEach((item) => {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [groceryItems]);

  // Count stats
  const stats = useMemo(() => {
    const total = groceryItems.length;
    const checked = groceryItems.filter((i) => i.checked).length;
    return { total, checked, remaining: total - checked };
  }, [groceryItems]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addGroceryItem({
      name: newItemName.trim(),
      quantity: newItemQuantity,
      unit: newItemUnit,
      category: newItemCategory,
    });

    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemUnit('unit');
    setShowAddItem(false);
  };

  return (
    <div className="grocery-list">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Grocery List</h3>
          {stats.total > 0 && (
            <span className="text-sm text-white/50">
              ({stats.checked}/{stats.total})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stats.checked > 0 && (
            <button
              onClick={clearCheckedGroceryItems}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Clear Done
            </button>
          )}
          <button
            onClick={() => setShowAddItem(true)}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(stats.checked / stats.total) * 100}%` }}
            />
          </div>
          <div className="text-xs text-white/50 mt-1 text-right">
            {stats.remaining > 0
              ? `${stats.remaining} item${stats.remaining !== 1 ? 's' : ''} remaining`
              : 'All done!'}
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAddItem && (
        <form
          onSubmit={handleAddItem}
          className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Add Item</span>
            <button
              type="button"
              onClick={() => setShowAddItem(false)}
              className="p-1 rounded hover:bg-white/10 text-white/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-12 gap-2 mb-3">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              autoFocus
              className="col-span-5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(parseFloat(e.target.value) || 1)}
              min="0.25"
              step="0.25"
              className="col-span-2 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-emerald-500/50"
            />
            <select
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="col-span-2 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
            >
              <option value="unit">unit</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
              <option value="lb">lb</option>
              <option value="cup">cup</option>
              <option value="L">L</option>
            </select>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="col-span-3 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
            >
              {GROCERY_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add to List
          </button>
        </form>
      )}

      {/* Items by Category */}
      {stats.total > 0 ? (
        <div className="space-y-4">
          {GROCERY_CATEGORIES.map((category) => {
            const items = groupedItems[category.id];
            if (!items || items.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{category.emoji}</span>
                  <span className="text-sm font-medium text-white/70">{category.name}</span>
                  <span className="text-xs text-white/40">({items.length})</span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        item.checked
                          ? 'bg-white/5 opacity-60'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <button
                        onClick={() => toggleGroceryItem(item.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.checked
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-white/30 hover:border-emerald-500'
                        }`}
                      >
                        {item.checked && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <span
                          className={`text-sm ${
                            item.checked ? 'text-white/50 line-through' : 'text-white'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs text-white/50">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => deleteGroceryItem(item.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <ShoppingCart className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">Your grocery list is empty</p>
          <p className="text-white/30 text-xs mt-1">
            Generate from your meal plan or add items manually
          </p>
        </div>
      )}

      {/* Clear All */}
      {stats.total > 0 && (
        <button
          onClick={() => {
            if (confirm('Clear all items from the grocery list?')) {
              clearAllGroceryItems();
            }
          }}
          className="mt-4 w-full py-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg text-sm transition-colors"
        >
          Clear All Items
        </button>
      )}
    </div>
  );
}
