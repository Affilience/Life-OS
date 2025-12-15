import React, { useState, useEffect, useRef } from 'react';

// All equipment files from the actual asset folders
const EQUIPMENT_FILES = {
  helmets: [
    'archmage_diadem', 'basic', 'celestial_circlet', 'cloth_cap', 'dragon',
    'dragon_helm', 'eternal_crown', 'iron', 'iron_helmet', 'leather_hood',
    'mindguard_helmet', 'phoenix_crown', 'reinforced_coif', 'sage_crown',
    'scholar_circlet', 'steel_greathelm', 'titanium_helm', 'training_helmet'
  ],
  chests: [
    'aegis_titan', 'armor_chainmail', 'armor_cosmic', 'armor_leather', 'armor_plate',
    'chainmail_shirt', 'cloth_tunic', 'dragon_bone_cuirass', 'dragon_cuirass',
    'dragon_scale_chestplate', 'leather_vest', 'padded_armor', 'paladin_chestguard',
    'phoenix_battleplate', 'reinforced_breastplate', 'steel_plate', 'titanium_platemail'
  ],
  weapons: [
    'archmage_staff', 'basic_sword', 'battle_axe', 'bloodfang', 'crystal_wand',
    'dragon_blade', 'enchanted_blade', 'eternity_edge', 'executioner_axe',
    'focus_blade', 'godslayer', 'iron_dagger', 'iron_sword', 'quill_of_wisdom',
    'scholars_tome', 'steel_longsword', 'sword_celestial', 'sword_crystal',
    'sword_iron', 'sword_novice', 'sword_void', 'taskmaster_hammer',
    'thunder_hammer', 'training_sword', 'warlock_scepter', 'wizard_wand', 'wooden_staff'
  ],
  shields: [
    'aegis_of_mastery', 'basic', 'dragon_shield', 'fortress_shield',
    'guardian_bulwark', 'immortal_shield', 'iron', 'iron_shield',
    'phoenix_wing_shield', 'steel_kite', 'steel_tower_shield', 'tower_shield', 'wooden_buckler'
  ],
  capes: [
    'ancient_cloak', 'basic', 'cloak_shadows', 'enchanter_mantle', 'leather_cape',
    'memory_mantle', 'mystic_robe', 'oracle_shroud', 'sage_cloak', 'shadow',
    'shadow_cloak', 'storyteller_cloak', 'traveler_cloak'
  ],
  legs: [
    'chainmail_leggings', 'cloth_pants', 'dragon_legguards', 'iron_legguards',
    'leather_leggings', 'phoenix_legguards'
  ]
};

// Default positions for each slot type (on 256x256 display canvas)
// Character's right hand ≈ x:60 (viewer's left), left hand ≈ x:90 (viewer's right)
const DEFAULT_POSITIONS = {
  capes: { x: 75, y: 50, scale: 0.5 },
  legs: { x: 80, y: 140, scale: 0.45 },
  chests: { x: 70, y: 70, scale: 0.55 },
  shields_left: { x: 90, y: 80, scale: 0.4 },   // Shield on left hand (viewer's right)
  shields_right: { x: 60, y: 80, scale: 0.4 },  // Shield on right hand (viewer's left)
  helmets: { x: 80, y: 10, scale: 0.45 },
  weapons_left: { x: 90, y: 50, scale: 0.5 },   // Weapon in left hand (viewer's right)
  weapons_right: { x: 60, y: 50, scale: 0.5 },  // Weapon in right hand (viewer's left)
};

const LAYER_ORDER = ['capes', 'legs', 'chests', 'shields', 'helmets', 'weapons'];

// Local storage key for saved positions
const STORAGE_KEY = 'lifeos-equipment-positions';

// Base avatar for equipment positioning - Stage 10 Swordsman
const BASE_AVATAR_PATH = '/assets/avatar/base-evolution/hero_base_stage_10_swordsman.png';

export default function EquipmentTest() {
  const canvasRef = useRef(null);
  const [baseAvatar, setBaseAvatar] = useState(null);
  const [loadedEquipment, setLoadedEquipment] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [loadingStatus, setLoadingStatus] = useState('Loading...');

  // Saved positions: { itemName: { x, y, scale } }
  // For shields, save both: shields/basic_left and shields/basic_right
  const [savedPositions, setSavedPositions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Current working positions (for live adjustment)
  const [currentPositions, setCurrentPositions] = useState({});

  // For shields: which hand position are we currently editing?
  const [editingShieldHand, setEditingShieldHand] = useState('left');

  // Auto-detect which hand the equipped weapon is in based on X position
  // Right hand ≈ x:60 (viewer's left), Left hand ≈ x:90 (viewer's right)
  const getWeaponHand = () => {
    const weapon = selectedEquipment.weapons;
    if (!weapon) return null;

    // Check currentPositions first (live edits), then savedPositions
    const pos = currentPositions[`weapons/${weapon}`] || savedPositions[`weapons/${weapon}`];
    if (!pos) return 'right'; // Default

    // x < 75 = right hand (viewer's left), x >= 75 = left hand (viewer's right)
    return pos.x < 75 ? 'right' : 'left';
  };

  // Shield goes in opposite hand from weapon
  const getShieldHand = () => {
    const weaponHand = getWeaponHand();
    const shieldHand = !weaponHand ? 'left' : (weaponHand === 'right' ? 'left' : 'right');
    return shieldHand;
  };

  // Load base avatar (Stage 10 Swordsman)
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBaseAvatar(img);
    img.onerror = () => console.error('Failed to load base avatar');
    img.src = BASE_AVATAR_PATH;
  }, []);

  // Load all equipment sprites
  useEffect(() => {
    const loadAllEquipment = async () => {
      const equipment = {};
      let loaded = 0;
      let failed = 0;
      const total = Object.values(EQUIPMENT_FILES).flat().length;

      for (const [folder, items] of Object.entries(EQUIPMENT_FILES)) {
        equipment[folder] = {};
        for (const item of items) {
          const path = `/assets/equipment/${folder}/${item}.png`;
          try {
            const img = await new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.onerror = () => reject(new Error(`Failed: ${path}`));
              image.src = path;
            });
            equipment[folder][item] = img;
            loaded++;
          } catch (err) {
            console.warn(err.message);
            failed++;
          }
          setLoadingStatus(`Loading: ${loaded}/${total}`);
        }
      }

      setLoadedEquipment(equipment);
      setLoadingStatus(`Ready - ${loaded} items (${failed} missing)`);
    };

    loadAllEquipment();
  }, []);

  // Get position for an item (saved > current > default)
  // Shields use hand-specific positions based on weapon location
  const getPosition = (folder, item, forceHand = null) => {
    const key = `${folder}/${item}`;

    // For shields, check which hand to use
    if (folder === 'shields') {
      const hand = forceHand || getShieldHand();
      const handKey = `${key}_${hand}`;
      const pos = currentPositions[handKey] || savedPositions[handKey] || DEFAULT_POSITIONS[`shields_${hand}`];
      console.log('[EquipmentTest] Shield position lookup:', {
        item, hand, handKey,
        hasCurrent: !!currentPositions[handKey],
        hasSaved: !!savedPositions[handKey],
        usingDefault: !currentPositions[handKey] && !savedPositions[handKey],
        finalPos: pos
      });
      return pos;
    }

    return currentPositions[key] || savedPositions[key] || DEFAULT_POSITIONS[folder] || DEFAULT_POSITIONS.weapons_right;
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 256, 256);

    // Draw checkerboard background
    const size = 16;
    for (let y = 0; y < 256; y += size) {
      for (let x = 0; x < 256; x += size) {
        ctx.fillStyle = ((x + y) / size) % 2 === 0 ? '#1e293b' : '#0f172a';
        ctx.fillRect(x, y, size, size);
      }
    }

    // Draw equipment in layer order
    LAYER_ORDER.forEach(folder => {
      const selectedItem = selectedEquipment[folder];
      if (!selectedItem) return;

      // Draw cape BEFORE character
      if (folder === 'capes') {
        const equipment = loadedEquipment[folder]?.[selectedItem];
        if (equipment) {
          const pos = getPosition(folder, selectedItem);
          const width = equipment.width * pos.scale;
          const height = equipment.height * pos.scale;
          ctx.drawImage(equipment, pos.x, pos.y, width, height);
        }
      }
    });

    // Draw base character (Stage 10 Swordsman)
    if (baseAvatar) {
      ctx.drawImage(baseAvatar, 0, 0, 256, 256);
    } else {
      // Loading placeholder
      ctx.fillStyle = '#334155';
      ctx.fillRect(60, 60, 136, 136);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading avatar...', 128, 128);
    }

    // Draw equipment layers (except cape)
    LAYER_ORDER.forEach(folder => {
      if (folder === 'capes') return;

      const selectedItem = selectedEquipment[folder];
      if (!selectedItem) return;

      const equipment = loadedEquipment[folder]?.[selectedItem];
      if (!equipment) return;

      const pos = getPosition(folder, selectedItem);
      const width = equipment.width * pos.scale;
      const height = equipment.height * pos.scale;
      ctx.drawImage(equipment, pos.x, pos.y, width, height);
    });

  }, [baseAvatar, loadedEquipment, selectedEquipment, currentPositions, savedPositions]);

  const toggleEquipment = (folder, item) => {
    setSelectedEquipment(prev => {
      if (prev[folder] === item) {
        const { [folder]: _, ...rest } = prev;
        // Clear current position when deselecting
        const key = `${folder}/${item}`;
        setCurrentPositions(p => {
          const { [key]: _, ...remaining } = p;
          return remaining;
        });
        return rest;
      }
      return { ...prev, [folder]: item };
    });
  };

  const updatePosition = (folder, item, prop, value) => {
    let key = `${folder}/${item}`;

    // For shields, use hand-specific key
    if (folder === 'shields') {
      key = `${key}_${editingShieldHand}`;
    }

    const current = getPosition(folder, item, folder === 'shields' ? editingShieldHand : null);
    setCurrentPositions(prev => ({
      ...prev,
      [key]: { ...current, [prop]: parseFloat(value) || 0 }
    }));
  };

  const savePosition = (folder, item) => {
    let key = `${folder}/${item}`;
    let displayHand = '';

    // For shields, save with hand-specific key
    if (folder === 'shields') {
      key = `${key}_${editingShieldHand}`;
      displayHand = ` (${editingShieldHand} hand)`;
    }

    const pos = getPosition(folder, item, folder === 'shields' ? editingShieldHand : null);
    const newSaved = { ...savedPositions, [key]: pos };
    setSavedPositions(newSaved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaved));
    alert(`Saved position for ${item}${displayHand}!`);
  };

  const saveAllPositions = () => {
    const allPositions = { ...savedPositions };
    Object.entries(currentPositions).forEach(([key, pos]) => {
      allPositions[key] = pos;
    });
    setSavedPositions(allPositions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPositions));
    alert(`Saved ${Object.keys(allPositions).length} positions!`);
  };

  const exportPositions = () => {
    const allPositions = { ...savedPositions, ...currentPositions };
    const blob = new Blob([JSON.stringify(allPositions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment-positions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPositions = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setSavedPositions(imported);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
        alert(`Imported ${Object.keys(imported).length} positions!`);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setSelectedEquipment({});
    setCurrentPositions({});
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Equipment Position Editor</h1>
        <p className="text-slate-400 mb-4 text-sm">{loadingStatus}</p>

        <div className="flex gap-6">
          {/* Left Panel: Avatar Preview & Controls */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Avatar Preview */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-sm font-semibold text-white mb-2">
                Base Avatar: Stage 10 Swordsman
              </h2>
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="rounded-lg border border-slate-600 w-full"
                style={{ imageRendering: 'pixelated' }}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-500"
                >
                  Clear
                </button>
                <button
                  onClick={saveAllPositions}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-500"
                >
                  Save All
                </button>
                <button
                  onClick={exportPositions}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500"
                >
                  Export JSON
                </button>
                <label className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-500 cursor-pointer">
                  Import
                  <input type="file" accept=".json" onChange={importPositions} className="hidden" />
                </label>
              </div>
            </div>

            {/* Position Controls for Selected Items */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 max-h-96 overflow-y-auto">
              <h3 className="text-sm font-semibold text-white mb-2">Position Controls</h3>
              {Object.entries(selectedEquipment).length === 0 ? (
                <p className="text-slate-500 text-xs">Select equipment to adjust positions</p>
              ) : (
                Object.entries(selectedEquipment).map(([folder, item]) => {
                  const isShield = folder === 'shields';
                  const pos = getPosition(folder, item, isShield ? editingShieldHand : null);
                  const key = isShield ? `${folder}/${item}_${editingShieldHand}` : `${folder}/${item}`;
                  const isSaved = !!savedPositions[key];

                  // For weapons, show which hand it's detected as
                  const weaponHand = folder === 'weapons' ? (pos.x < 128 ? 'LEFT' : 'RIGHT') : null;

                  return (
                    <div key={folder} className="mb-4 pb-3 border-b border-slate-700 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white font-medium capitalize">
                          {folder}: {item.replace(/_/g, ' ')}
                          {weaponHand && <span className="ml-1 text-yellow-400">({weaponHand})</span>}
                        </span>
                        {isSaved && <span className="text-green-400 text-xs">✓ Saved</span>}
                      </div>

                      {/* Shield hand selector */}
                      {isShield && (
                        <div className="flex gap-1 mb-2">
                          <button
                            onClick={() => setEditingShieldHand('left')}
                            className={`flex-1 px-2 py-1 text-xs rounded ${editingShieldHand === 'left' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                          >
                            Left Hand
                          </button>
                          <button
                            onClick={() => setEditingShieldHand('right')}
                            className={`flex-1 px-2 py-1 text-xs rounded ${editingShieldHand === 'right' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                          >
                            Right Hand
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <label className="text-slate-400">
                          X
                          <input
                            type="number"
                            value={pos.x}
                            onChange={(e) => updatePosition(folder, item, 'x', e.target.value)}
                            className="w-full mt-1 px-2 py-1 bg-slate-700 text-white rounded"
                          />
                        </label>
                        <label className="text-slate-400">
                          Y
                          <input
                            type="number"
                            value={pos.y}
                            onChange={(e) => updatePosition(folder, item, 'y', e.target.value)}
                            className="w-full mt-1 px-2 py-1 bg-slate-700 text-white rounded"
                          />
                        </label>
                        <label className="text-slate-400">
                          Scale
                          <input
                            type="number"
                            step="0.05"
                            value={pos.scale}
                            onChange={(e) => updatePosition(folder, item, 'scale', e.target.value)}
                            className="w-full mt-1 px-2 py-1 bg-slate-700 text-white rounded"
                          />
                        </label>
                      </div>
                      <button
                        onClick={() => savePosition(folder, item)}
                        className="mt-2 w-full px-2 py-1 bg-green-600/50 text-green-300 rounded text-xs hover:bg-green-600"
                      >
                        {isShield ? `Save ${editingShieldHand.toUpperCase()} Hand Position` : 'Save This Position'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Saved Positions Count */}
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <span className="text-slate-400 text-xs">
                {Object.keys(savedPositions).length} positions saved
              </span>
            </div>
          </div>

          {/* Right Panel: Equipment Grid */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[85vh]">
            {Object.entries(EQUIPMENT_FILES).map(([folder, items]) => (
              <div key={folder} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <h3 className="text-sm font-semibold text-white mb-2 capitalize">
                  {folder} ({items.length})
                </h3>
                <div className="flex flex-wrap gap-1">
                  {items.map(item => {
                    const equipment = loadedEquipment[folder]?.[item];
                    const isSelected = selectedEquipment[folder] === item;
                    const isLoaded = !!equipment;
                    const key = `${folder}/${item}`;
                    const isSaved = !!savedPositions[key];

                    return (
                      <button
                        key={item}
                        onClick={() => isLoaded && toggleEquipment(folder, item)}
                        disabled={!isLoaded}
                        className={`
                          relative p-1 rounded border transition-all
                          ${isSelected
                            ? 'border-green-500 bg-green-500/20 ring-1 ring-green-400'
                            : isSaved
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-slate-600 hover:border-slate-500'}
                          ${!isLoaded ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title={`${item}${isSaved ? ' (position saved)' : ''}`}
                      >
                        {equipment ? (
                          <img
                            src={equipment.src}
                            alt={item}
                            className="w-10 h-10 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-red-400 text-xs">
                            ✗
                          </div>
                        )}
                        {isSaved && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
