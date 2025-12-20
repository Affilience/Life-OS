import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
const DEFAULT_POSITIONS = {
  capes: { x: 75, y: 50, scale: 0.5 },
  legs: { x: 80, y: 140, scale: 0.45 },
  chests: { x: 70, y: 70, scale: 0.55 },
  shields_left: { x: 90, y: 80, scale: 0.4 },
  shields_right: { x: 60, y: 80, scale: 0.4 },
  helmets: { x: 80, y: 10, scale: 0.45 },
  weapons_left: { x: 90, y: 50, scale: 0.5 },
  weapons_right: { x: 60, y: 50, scale: 0.5 },
};

const LAYER_ORDER = ['capes', 'legs', 'chests', 'shields', 'helmets', 'weapons'];

// Local storage key for heroine positions
const STORAGE_KEY = 'lifeos-equipment-positions-heroine';

// Skin tone options for heroine
const SKIN_TONES = [
  { id: 'default', name: 'Light', path: '/assets/avatar/base-evolution/heroine_base_stage_20_veteran.png', color: '#f5d0c5' },
  { id: 'olive', name: 'Olive', path: '/assets/avatar/skin-tones/heroine_base_stage_20_veteran_olive.png', color: '#c8c870' },
  { id: 'brown', name: 'Brown', path: '/assets/avatar/skin-tones/heroine_base_stage_20_veteran_brown.png', color: '#8b5a3c' },
  { id: 'black', name: 'Black', path: '/assets/avatar/skin-tones/heroine_base_stage_20_veteran_black.png', color: '#4a3228' },
];

// Base avatar for equipment positioning - Stage 20 Veteran (heroine equivalent of hero's Stage 10 Swordsman)
const BASE_AVATAR_PATH = '/assets/avatar/base-evolution/heroine_base_stage_20_veteran.png';

export default function EquipmentTestHeroine() {
  const canvasRef = useRef(null);
  const [baseAvatar, setBaseAvatar] = useState(null);
  const [loadedEquipment, setLoadedEquipment] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [loadingStatus, setLoadingStatus] = useState('Loading...');
  const [syncStatus, setSyncStatus] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Skin tone selection
  const [selectedSkinTone, setSelectedSkinTone] = useState(SKIN_TONES[0]);

  // Saved positions - start empty, will be populated from cloud only
  const [savedPositions, setSavedPositions] = useState({});
  const [cloudLoaded, setCloudLoaded] = useState(false);

  // Current working positions
  const [currentPositions, setCurrentPositions] = useState({});

  // Shield hand state
  const [editingShieldHand, setEditingShieldHand] = useState('left');

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [hoverTarget, setHoverTarget] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load global positions from Supabase on mount
  useEffect(() => {
    const loadFromCloud = async () => {
      try {
        setSyncStatus('Loading heroine positions...');

        const { data, error } = await supabase
          .from('equipment_default_positions')
          .select('position_key, x, y, scale')
          .like('position_key', 'heroine_%');

        if (error) {
          console.error('[EquipmentTestHeroine] Failed to load from cloud:', error);
          setSyncStatus('Cloud load failed - using local');
          return;
        }

        if (data && data.length > 0) {
          const cloudPositions = {};
          data.forEach(row => {
            // Remove 'heroine_' prefix for local use
            const key = row.position_key.replace('heroine_', '');
            cloudPositions[key] = {
              x: parseFloat(row.x),
              y: parseFloat(row.y),
              scale: parseFloat(row.scale)
            };
          });

          console.log('[EquipmentTestHeroine] Loaded HEROINE positions:', Object.keys(cloudPositions));
          setSavedPositions(cloudPositions);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudPositions));
          setSyncStatus(`Loaded ${Object.keys(cloudPositions).length} heroine positions`);
          setLastSyncTime(new Date());
        } else {
          console.log('[EquipmentTestHeroine] No heroine positions found in cloud');
          setSavedPositions({});
          localStorage.removeItem(STORAGE_KEY);
          setSyncStatus('No heroine positions yet - start configuring!');
        }
        setCloudLoaded(true);
      } catch (err) {
        console.error('[EquipmentTestHeroine] Cloud sync error:', err);
        setSyncStatus('Sync error - using local');
      }
    };

    loadFromCloud();
  }, []);

  // Save to Supabase with heroine_ prefix
  const syncToCloud = useCallback(async (positions) => {
    try {
      setSyncStatus('Saving heroine positions...');

      const upsertData = Object.entries(positions).map(([key, pos]) => ({
        position_key: `heroine_${key}`,
        x: pos.x,
        y: pos.y,
        scale: pos.scale,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('equipment_default_positions')
        .upsert(upsertData, { onConflict: 'position_key' });

      if (error) {
        console.error('[EquipmentTestHeroine] Failed to save:', error);
        setSyncStatus('Cloud save failed - saved locally');
        return false;
      }

      console.log('[EquipmentTestHeroine] Saved positions:', Object.keys(positions).length);
      setSyncStatus(`Saved ${Object.keys(positions).length} HEROINE positions (applies to all users!)`);
      setLastSyncTime(new Date());
      return true;
    } catch (err) {
      console.error('[EquipmentTestHeroine] Cloud sync error:', err);
      setSyncStatus('Sync error - saved locally');
      return false;
    }
  }, []);

  // Load base avatar (Stage 20 Veteran) - reloads when skin tone changes
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBaseAvatar(img);
    img.onerror = () => console.error('Failed to load base avatar:', selectedSkinTone.path);
    img.src = selectedSkinTone.path;
  }, [selectedSkinTone]);

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

  // Get weapon/shield hand detection
  const getWeaponHand = () => {
    const weapon = selectedEquipment.weapons;
    if (!weapon) return null;
    const pos = currentPositions[`weapons/${weapon}`] || savedPositions[`weapons/${weapon}`];
    if (!pos) return 'right';
    return pos.x < 75 ? 'right' : 'left';
  };

  const getShieldHand = () => {
    const weaponHand = getWeaponHand();
    return !weaponHand ? 'left' : (weaponHand === 'right' ? 'left' : 'right');
  };

  // Get position for an item
  const getPosition = (folder, item, forceHand = null) => {
    const key = `${folder}/${item}`;

    if (folder === 'shields') {
      const hand = forceHand || getShieldHand();
      const handKey = `${key}_${hand}`;
      return currentPositions[handKey] || savedPositions[handKey] || DEFAULT_POSITIONS[`shields_${hand}`];
    }

    return currentPositions[key] || savedPositions[key] || DEFAULT_POSITIONS[folder] || DEFAULT_POSITIONS.weapons_right;
  };

  // Canvas drag & drop handlers
  const findEquipmentAtPosition = (canvasX, canvasY) => {
    const reversedLayers = [...LAYER_ORDER].reverse();

    for (const folder of reversedLayers) {
      const item = selectedEquipment[folder];
      if (!item) continue;

      const equipment = loadedEquipment[folder]?.[item];
      if (!equipment) continue;

      const pos = getPosition(folder, item);
      const width = equipment.width * pos.scale;
      const height = equipment.height * pos.scale;

      if (canvasX >= pos.x && canvasX <= pos.x + width &&
          canvasY >= pos.y && canvasY <= pos.y + height) {
        return { folder, item, pos, width, height };
      }
    }
    return null;
  };

  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 256 / rect.width;
    const scaleY = 256 / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const target = findEquipmentAtPosition(canvasX, canvasY);
    if (target) {
      setIsDragging(true);
      setDragTarget({
        folder: target.folder,
        item: target.item,
        startX: canvasX,
        startY: canvasY,
        startPosX: target.pos.x,
        startPosY: target.pos.y,
      });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 256 / rect.width;
    const scaleY = 256 / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    setMousePos({ x: Math.round(canvasX), y: Math.round(canvasY) });

    if (isDragging && dragTarget) {
      const deltaX = canvasX - dragTarget.startX;
      const deltaY = canvasY - dragTarget.startY;

      const newX = Math.round(dragTarget.startPosX + deltaX);
      const newY = Math.round(dragTarget.startPosY + deltaY);

      let key = `${dragTarget.folder}/${dragTarget.item}`;
      if (dragTarget.folder === 'shields') {
        key = `${key}_${editingShieldHand}`;
      }

      const currentPos = getPosition(dragTarget.folder, dragTarget.item,
        dragTarget.folder === 'shields' ? editingShieldHand : null);

      setCurrentPositions(prev => ({
        ...prev,
        [key]: { ...currentPos, x: newX, y: newY }
      }));
    } else {
      const hover = findEquipmentAtPosition(canvasX, canvasY);
      setHoverTarget(hover ? { folder: hover.folder, item: hover.item } : null);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
    setDragTarget(null);
    setHoverTarget(null);
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

    // Draw capes first (behind character)
    LAYER_ORDER.forEach(folder => {
      const selectedItem = selectedEquipment[folder];
      if (!selectedItem || folder !== 'capes') return;

      const equipment = loadedEquipment[folder]?.[selectedItem];
      if (equipment) {
        const pos = getPosition(folder, selectedItem);
        const width = equipment.width * pos.scale;
        const height = equipment.height * pos.scale;
        ctx.drawImage(equipment, pos.x, pos.y, width, height);

        const isDragTarget = dragTarget && dragTarget.folder === folder && dragTarget.item === selectedItem;
        const isHoverTarget = !isDragTarget && hoverTarget && hoverTarget.folder === folder && hoverTarget.item === selectedItem;

        if (isDragTarget) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(pos.x - 2, pos.y - 2, width + 4, height + 4);
          ctx.setLineDash([]);
        } else if (isHoverTarget) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.7;
          ctx.strokeRect(pos.x - 1, pos.y - 1, width + 2, height + 2);
          ctx.globalAlpha = 1;
        }
      }
    });

    // Draw base character (Stage 20 Veteran)
    if (baseAvatar) {
      ctx.drawImage(baseAvatar, 0, 0, 256, 256);
    } else {
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

      const isDragTarget = dragTarget && dragTarget.folder === folder && dragTarget.item === selectedItem;
      const isHoverTarget = !isDragTarget && hoverTarget && hoverTarget.folder === folder && hoverTarget.item === selectedItem;

      if (isDragTarget) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(pos.x - 2, pos.y - 2, width + 4, height + 4);
        ctx.setLineDash([]);
      } else if (isHoverTarget) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.7;
        ctx.strokeRect(pos.x - 1, pos.y - 1, width + 2, height + 2);
        ctx.globalAlpha = 1;
      }
    });

  }, [baseAvatar, loadedEquipment, selectedEquipment, currentPositions, savedPositions, dragTarget, hoverTarget]);

  const toggleEquipment = (folder, item) => {
    setSelectedEquipment(prev => {
      if (prev[folder] === item) {
        const { [folder]: _, ...rest } = prev;
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
    if (folder === 'shields') {
      key = `${key}_${editingShieldHand}`;
    }

    const current = getPosition(folder, item, folder === 'shields' ? editingShieldHand : null);
    setCurrentPositions(prev => ({
      ...prev,
      [key]: { ...current, [prop]: parseFloat(value) || 0 }
    }));
  };

  const savePosition = async (folder, item) => {
    let key = `${folder}/${item}`;
    if (folder === 'shields') {
      key = `${key}_${editingShieldHand}`;
    }

    const pos = getPosition(folder, item, folder === 'shields' ? editingShieldHand : null);
    const newSaved = { ...savedPositions, [key]: pos };
    setSavedPositions(newSaved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaved));
    await syncToCloud(newSaved);
  };

  const saveAllPositions = async () => {
    const allPositions = { ...savedPositions };
    Object.entries(currentPositions).forEach(([key, pos]) => {
      allPositions[key] = pos;
    });
    setSavedPositions(allPositions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPositions));

    const success = await syncToCloud(allPositions);
    if (success) {
      alert(`Saved ${Object.keys(allPositions).length} heroine positions to cloud!`);
    } else {
      alert(`Saved ${Object.keys(allPositions).length} positions locally. Cloud sync may have failed.`);
    }
  };

  const forceCloudSync = async () => {
    const allPositions = { ...savedPositions, ...currentPositions };
    await syncToCloud(allPositions);
  };

  const clearAll = () => {
    setSelectedEquipment({});
    setCurrentPositions({});
  };

  const exportPositions = () => {
    const allPositions = { ...savedPositions, ...currentPositions };
    const blob = new Blob([JSON.stringify(allPositions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment-positions-heroine.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPositions = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setSavedPositions(imported);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
        const success = await syncToCloud(imported);
        if (success) {
          alert(`Imported and synced ${Object.keys(imported).length} positions!`);
        } else {
          alert(`Imported ${Object.keys(imported).length} positions locally.`);
        }
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Heroine Equipment Position Editor</h1>
        <p className="text-pink-400 text-sm mb-2">Changes here apply to ALL users!</p>
        <div className="flex items-center gap-4 mb-4">
          <p className="text-slate-400 text-sm">{loadingStatus}</p>
          <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
            {syncStatus}
          </span>
          {lastSyncTime && (
            <span className="text-xs text-slate-500">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex gap-6">
          {/* Left Panel */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Avatar Preview */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-sm font-semibold text-white mb-2">
                Base Avatar: Stage 20 Veteran
              </h2>

              {/* Skin Tone Selector */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-400">Skin:</span>
                <div className="flex gap-1">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedSkinTone(tone)}
                      className={`
                        w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center
                        ${selectedSkinTone.id === tone.id
                          ? 'border-pink-400 ring-2 ring-pink-400/50 scale-110'
                          : 'border-slate-600 hover:border-slate-400'}
                      `}
                      style={{ backgroundColor: tone.color }}
                      title={`${tone.name} skin tone`}
                    >
                      {selectedSkinTone.id === tone.id && (
                        <span className="text-white text-xs font-bold drop-shadow-lg">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 ml-1">{selectedSkinTone.name}</span>
              </div>

              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="rounded-lg border border-slate-600 w-full"
                style={{
                  imageRendering: 'pixelated',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
              />

              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>Mouse: ({mousePos.x}, {mousePos.y})</span>
                {dragTarget ? (
                  <span className="text-green-400">Dragging: {dragTarget.folder}/{dragTarget.item}</span>
                ) : hoverTarget ? (
                  <span className="text-blue-400">{hoverTarget.folder}/{hoverTarget.item}</span>
                ) : (
                  <span className="text-slate-600">Drag equipment to move</span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={clearAll} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-500">
                  Clear
                </button>
                <button onClick={saveAllPositions} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-500">
                  Save All
                </button>
                <button onClick={forceCloudSync} className="px-3 py-1 bg-cyan-600 text-white rounded text-xs hover:bg-cyan-500">
                  Sync to Cloud
                </button>
                <button onClick={exportPositions} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500">
                  Export
                </button>
                <label className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-500 cursor-pointer">
                  Import
                  <input type="file" accept=".json" onChange={importPositions} className="hidden" />
                </label>
              </div>
            </div>

            {/* Position Controls */}
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
                  const weaponHand = folder === 'weapons' ? (pos.x < 128 ? 'LEFT' : 'RIGHT') : null;

                  return (
                    <div key={folder} className="mb-4 pb-3 border-b border-slate-700 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white font-medium capitalize">
                          {folder}: {item.replace(/_/g, ' ')}
                          {weaponHand && <span className="ml-1 text-yellow-400">({weaponHand})</span>}
                        </span>
                        {isSaved && <span className="text-green-400 text-xs">Saved</span>}
                      </div>

                      {isShield && (
                        <div className="flex gap-1 mb-2">
                          <button
                            onClick={() => setEditingShieldHand('left')}
                            className={`flex-1 px-2 py-1 text-xs rounded ${editingShieldHand === 'left' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                          >
                            Left Hand
                          </button>
                          <button
                            onClick={() => setEditingShieldHand('right')}
                            className={`flex-1 px-2 py-1 text-xs rounded ${editingShieldHand === 'right' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-400'}`}
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

            {/* Saved count */}
            <div className="bg-pink-900/30 border border-pink-600/50 rounded-lg p-3 text-center space-y-1">
              <div className="text-pink-300 text-xs font-semibold">
                {Object.keys(savedPositions).length} HEROINE positions saved
              </div>
              <div className="text-xs text-cyan-400">
                {cloudLoaded ? 'Loaded from Supabase (heroine_ prefix)' : 'Loading from cloud...'}
              </div>
              <div className="text-xs text-pink-200">
                These apply to ALL users who equip this gear!
              </div>
              {Object.keys(savedPositions).length > 0 && (
                <details className="text-left mt-2">
                  <summary className="text-xs text-slate-400 cursor-pointer">Show saved items</summary>
                  <ul className="text-xs text-slate-500 mt-1 max-h-32 overflow-y-auto">
                    {Object.keys(savedPositions).map(key => (
                      <li key={key}>✓ {key}</li>
                    ))}
                  </ul>
                </details>
              )}
              <button
                onClick={async () => {
                  if (confirm('Clear ALL heroine positions from database?')) {
                    const { error } = await supabase
                      .from('equipment_default_positions')
                      .delete()
                      .like('position_key', 'heroine_%');
                    if (!error) {
                      setSavedPositions({});
                      localStorage.removeItem(STORAGE_KEY);
                      setSyncStatus('Cleared all heroine positions');
                    }
                  }
                }}
                className="mt-2 px-2 py-1 bg-red-600/50 text-red-300 rounded text-xs hover:bg-red-600"
              >
                Clear All Heroine Positions
              </button>
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
                    // Check if HEROINE position is saved (only after cloud loaded)
                    const key = `${folder}/${item}`;
                    const isSaved = cloudLoaded && (folder === 'shields'
                      ? (!!savedPositions[`${key}_left`] || !!savedPositions[`${key}_right`])
                      : !!savedPositions[key]);

                    return (
                      <button
                        key={item}
                        onClick={() => isLoaded && toggleEquipment(folder, item)}
                        disabled={!isLoaded}
                        className={`
                          relative p-1 rounded border-2 transition-all
                          ${isSelected
                            ? 'border-pink-500 bg-pink-500/20 ring-2 ring-pink-400'
                            : isSaved
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-slate-600 hover:border-slate-500'}
                          ${!isLoaded ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title={`${item}${isSaved ? ' ✓ SAVED' : ' (not positioned yet)'}`}
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
                          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                            ✓
                          </span>
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
