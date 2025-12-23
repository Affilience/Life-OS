/**
 * CollectionsView - Full Collections Management for Knowledge Module
 * Create, view, edit, and manage collections of books, media, and notes
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderOpen, Plus, MoreVertical, Edit2, Trash2, Book, FileText,
  Video, Headphones, GraduationCap, ChevronLeft, X, Check, Search
} from 'lucide-react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';

// Icon picker options
const COLLECTION_ICONS = [
  '📚', '📖', '🎓', '💡', '🧠', '🎯', '⭐', '🔥',
  '💪', '🏃', '🎨', '🎵', '💰', '📊', '🔬', '🌟',
  '🚀', '💎', '🏆', '🎮', '📝', '🔖', '📌', '🗂️'
];

// Color picker options
const COLLECTION_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

// Type icons for items
const TYPE_ICONS = {
  book: Book,
  note: FileText,
  video: Video,
  podcast: Headphones,
  course: GraduationCap,
  youtube: Video,
};

// Create/Edit Collection Modal
function CollectionModal({ isOpen, onClose, collection = null, onSave }) {
  const [name, setName] = useState(collection?.name || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [icon, setIcon] = useState(collection?.icon || '📚');
  const [color, setColor] = useState(collection?.color || '#8b5cf6');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            {collection ? 'Edit Collection' : 'New Collection'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Icon & Name Row */}
          <div className="flex gap-3">
            {/* Icon Picker */}
            <div className="relative">
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-14 h-14 rounded-xl bg-[#12101a] border border-white/10 flex items-center justify-center text-2xl hover:border-purple-500/50 transition-colors"
                style={{ borderColor: color + '40' }}
              >
                {icon}
              </button>
              {showIconPicker && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-[#12101a] border border-white/10 rounded-lg grid grid-cols-6 gap-1 z-10">
                  {COLLECTION_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setIcon(emoji);
                        setShowIconPicker(false);
                      }}
                      className={`w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-lg ${
                        icon === emoji ? 'bg-purple-500/30' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name Input */}
            <div className="flex-1">
              <label className="block text-xs text-white/40 mb-1">Collection Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Collection"
                className="w-full px-3 py-2 bg-[#12101a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-white/40 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection about?"
              rows={2}
              className="w-full px-3 py-2 bg-[#12101a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Color</label>
            <div className="flex gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white/50' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check size={16} />
            {collection ? 'Save Changes' : 'Create Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Items to Collection Modal
function AddItemsModal({ isOpen, onClose, collection, onAddItems }) {
  const { notes, books, media } = useKnowledgeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Combine all items
  const allItems = useMemo(() => {
    const items = [];

    notes.forEach(note => {
      items.push({ id: note.id, type: 'note', title: note.title, subtitle: note.tags?.slice(0, 2).join(', ') });
    });

    books.forEach(book => {
      items.push({ id: book.id, type: 'book', title: book.title, subtitle: book.author });
    });

    media.forEach(m => {
      items.push({ id: m.id, type: m.type || 'video', title: m.title, subtitle: m.author || m.creator });
    });

    return items;
  }, [notes, books, media]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!searchQuery) return allItems;
    const query = searchQuery.toLowerCase();
    return allItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  // Already in collection
  const existingItemIds = collection?.items || [];

  const toggleItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAdd = () => {
    onAddItems(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Add to Collection</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 bg-[#12101a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.length === 0 ? (
            <p className="text-center text-white/40 py-8">No items found</p>
          ) : (
            filteredItems.map(item => {
              const Icon = TYPE_ICONS[item.type] || FileText;
              const isExisting = existingItemIds.includes(item.id);
              const isSelected = selectedItems.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => !isExisting && toggleItem(item.id)}
                  disabled={isExisting}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isExisting
                      ? 'bg-white/5 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-[#12101a] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-purple-500/30' : 'bg-white/5'
                  }`}>
                    <Icon size={20} className={isSelected ? 'text-purple-300' : 'text-white/60'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-white/40 truncate">{item.subtitle || item.type}</p>
                  </div>
                  {isExisting && (
                    <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded">Already added</span>
                  )}
                  {isSelected && !isExisting && (
                    <Check size={18} className="text-purple-400" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-white/5">
          <span className="text-sm text-white/40">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-white/60 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Add Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collection Card
function CollectionCard({ collection, onClick, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="bg-[#12101a]/40 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-all duration-200 cursor-pointer group relative"
      style={{ borderLeftColor: collection.color, borderLeftWidth: '4px' }}
      onClick={onClick}
    >
      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
      >
        <MoreVertical size={16} className="text-white/60" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-12 right-3 bg-[#1a1724] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-4">
        <span className="text-4xl">{collection.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-white/50 mb-3 line-clamp-2">
              {collection.description}
            </p>
          )}
          <div className="text-xs text-white/40">
            {collection.items?.length || 0} item{(collection.items?.length || 0) !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

// Collection Detail View
function CollectionDetail({ collection, onBack, onEdit }) {
  const { notes, books, media, removeItemFromCollection } = useKnowledgeStore();
  const [showAddItems, setShowAddItems] = useState(false);
  const { addItemToCollection } = useKnowledgeStore();

  // Get full item details
  const items = useMemo(() => {
    if (!collection?.items) return [];

    return collection.items.map(itemId => {
      // Check notes
      const note = notes.find(n => n.id === itemId);
      if (note) return { ...note, itemType: 'note' };

      // Check books
      const book = books.find(b => b.id === itemId);
      if (book) return { ...book, itemType: 'book' };

      // Check media
      const mediaItem = media.find(m => m.id === itemId);
      if (mediaItem) return { ...mediaItem, itemType: mediaItem.type || 'video' };

      return null;
    }).filter(Boolean);
  }, [collection, notes, books, media]);

  const handleAddItems = (itemIds) => {
    itemIds.forEach(id => addItemToCollection(collection.id, id));
  };

  const handleRemoveItem = (itemId) => {
    removeItemFromCollection(collection.id, itemId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-white/60" />
        </button>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: collection.color + '20' }}
        >
          {collection.icon}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{collection.name}</h1>
          {collection.description && (
            <p className="text-white/50">{collection.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowAddItems(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Items
        </button>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Edit2 size={18} className="text-white/60" />
        </button>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-medium text-white/60 mb-2">No items yet</h3>
          <p className="text-sm text-white/40 mb-4">Add books, notes, or media to this collection</p>
          <button
            onClick={() => setShowAddItems(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
          >
            <Plus size={18} />
            Add Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const Icon = TYPE_ICONS[item.itemType] || FileText;
            return (
              <div
                key={item.id}
                className="bg-[#12101a]/40 border border-white/5 rounded-lg p-4 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                    <p className="text-xs text-white/40 truncate">
                      {item.author || item.creator || item.itemType}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Remove from collection"
                  >
                    <X size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Items Modal */}
      <AddItemsModal
        isOpen={showAddItems}
        onClose={() => setShowAddItems(false)}
        collection={collection}
        onAddItems={handleAddItems}
      />
    </div>
  );
}

// Main Collections View
export default function CollectionsView({ initialCollectionId = null }) {
  const { collections, createCollection, updateCollection, deleteCollection, setActiveView } = useKnowledgeStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(() => {
    // If initialCollectionId is provided, find and select that collection
    if (initialCollectionId) {
      return collections.find(c => c.id === initialCollectionId) || null;
    }
    return null;
  });

  // Handle navigation from sidebar (when initialCollectionId changes)
  useEffect(() => {
    if (initialCollectionId) {
      const collection = collections.find(c => c.id === initialCollectionId);
      if (collection) {
        setSelectedCollection(collection);
      }
    }
  }, [initialCollectionId, collections]);

  const handleCreate = (data) => {
    createCollection(data);
  };

  const handleUpdate = (data) => {
    if (editingCollection) {
      updateCollection(editingCollection.id, data);
      setEditingCollection(null);
      // Update selected if we're viewing it
      if (selectedCollection?.id === editingCollection.id) {
        setSelectedCollection({ ...selectedCollection, ...data });
      }
    }
  };

  const handleDelete = (collectionId) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(collectionId);
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
    }
  };

  // If viewing a collection detail
  if (selectedCollection) {
    const currentCollection = collections.find(c => c.id === selectedCollection.id) || selectedCollection;
    return (
      <CollectionDetail
        collection={currentCollection}
        onBack={() => setSelectedCollection(null)}
        onEdit={() => setEditingCollection(currentCollection)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Collections</h2>
          <p className="text-sm text-white/50">Organize your knowledge into themed collections</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Collection
        </button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={64} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-xl font-medium text-white/60 mb-2">No collections yet</h3>
          <p className="text-sm text-white/40 mb-6">
            Create collections to organize your books, notes, and media by topic or theme
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
          >
            <Plus size={20} />
            Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(collection => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => setSelectedCollection(collection)}
              onEdit={() => setEditingCollection(collection)}
              onDelete={() => handleDelete(collection.id)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
      />

      {/* Edit Modal */}
      <CollectionModal
        isOpen={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        collection={editingCollection}
        onSave={handleUpdate}
      />
    </div>
  );
}
