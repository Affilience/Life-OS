'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Equipment files available
const EQUIPMENT_FILES = {
  helmets: ['dragon_helm', 'celestial_circlet'],
  chests: ['aegis_titan'],
  weapons: ['dragon_blade', 'archmage_staff'],
  shields: ['aegis_of_mastery'],
  capes: ['shadow_cloak'],
  legs: ['cloth_pants'],
};

// Default positions (will be adjusted)
const DEFAULT_POSITIONS: Record<string, { x: number; y: number; scale: number }> = {
  capes: { x: 75, y: 50, scale: 0.5 },
  legs: { x: 80, y: 140, scale: 0.45 },
  chests: { x: 70, y: 70, scale: 0.55 },
  shields: { x: 60, y: 80, scale: 0.4 },
  helmets: { x: 80, y: 10, scale: 0.45 },
  weapons: { x: 60, y: 50, scale: 0.5 },
};

const LAYER_ORDER = ['capes', 'legs', 'chests', 'shields', 'helmets', 'weapons'];

const CANVAS_SIZE = 256;

export default function EquipmentTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; scale: number }>>(DEFAULT_POSITIONS);
  const [selectedSlot, setSelectedSlot] = useState<string>('helmets');
  const [enabledSlots, setEnabledSlots] = useState<Record<string, boolean>>({
    capes: true,
    legs: true,
    chests: true,
    shields: true,
    helmets: true,
    weapons: true,
  });
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const [displayScale, setDisplayScale] = useState(2);

  // Load all images
  useEffect(() => {
    const loadImages = async () => {
      const images: Record<string, HTMLImageElement> = {};

      // Load avatar
      const avatar = new window.Image();
      avatar.src = '/assets/avatar/base-evolution/hero_base_stage_10_swordsman.png';
      await new Promise(resolve => { avatar.onload = resolve; });
      images['avatar'] = avatar;

      // Load equipment
      for (const [slot, files] of Object.entries(EQUIPMENT_FILES)) {
        const file = files[0]; // Use first file for each slot
        const img = new window.Image();
        img.src = `/assets/equipment/${slot}/${file}.png`;
        await new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        if (img.complete && img.naturalWidth > 0) {
          images[slot] = img;
        }
      }

      setLoadedImages(images);
    };

    loadImages();
  }, []);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImages['avatar']) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw checkerboard background
    const size = 16;
    for (let y = 0; y < CANVAS_SIZE; y += size) {
      for (let x = 0; x < CANVAS_SIZE; x += size) {
        ctx.fillStyle = ((x + y) / size) % 2 === 0 ? '#1e293b' : '#0f172a';
        ctx.fillRect(x, y, size, size);
      }
    }

    // Draw cape (behind avatar)
    if (enabledSlots['capes'] && loadedImages['capes']) {
      const pos = positions['capes'];
      const img = loadedImages['capes'];
      const width = img.width * pos.scale;
      const height = img.height * pos.scale;
      ctx.drawImage(img, pos.x, pos.y, width, height);
    }

    // Draw avatar
    ctx.drawImage(loadedImages['avatar'], 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw other equipment (in front of avatar)
    for (const slot of LAYER_ORDER) {
      if (slot === 'capes') continue;
      if (!enabledSlots[slot] || !loadedImages[slot]) continue;

      const pos = positions[slot];
      const img = loadedImages[slot];
      const width = img.width * pos.scale;
      const height = img.height * pos.scale;
      ctx.drawImage(img, pos.x, pos.y, width, height);
    }

    // Draw crosshairs at current position
    const currentPos = positions[selectedSlot];
    if (currentPos) {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentPos.x - 10, currentPos.y);
      ctx.lineTo(currentPos.x + 10, currentPos.y);
      ctx.moveTo(currentPos.x, currentPos.y - 10);
      ctx.lineTo(currentPos.x, currentPos.y + 10);
      ctx.stroke();
    }

  }, [loadedImages, positions, enabledSlots, selectedSlot]);

  const updatePosition = (prop: 'x' | 'y' | 'scale', value: number) => {
    setPositions(prev => ({
      ...prev,
      [selectedSlot]: {
        ...prev[selectedSlot],
        [prop]: value,
      },
    }));
  };

  const exportPositions = () => {
    const code = `const DEFAULT_POSITIONS = ${JSON.stringify(positions, null, 2)};`;
    navigator.clipboard.writeText(code);
    alert('Positions copied to clipboard!');
  };

  const currentPos = positions[selectedSlot];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Equipment Position Editor</h1>

        <div className="flex gap-8">
          {/* Canvas Preview */}
          <div className="flex-shrink-0">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="rounded-lg border border-slate-600"
                style={{
                  width: CANVAS_SIZE * displayScale,
                  height: CANVAS_SIZE * displayScale,
                  imageRendering: 'pixelated',
                }}
              />

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setDisplayScale(1)}
                  className={`px-3 py-1 rounded text-sm ${displayScale === 1 ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setDisplayScale(2)}
                  className={`px-3 py-1 rounded text-sm ${displayScale === 2 ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  2x
                </button>
                <button
                  onClick={() => setDisplayScale(3)}
                  className={`px-3 py-1 rounded text-sm ${displayScale === 3 ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  3x
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-6">
            {/* Slot Selection */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-sm font-semibold text-white mb-3">Select Equipment Slot</h2>
              <div className="flex flex-wrap gap-2">
                {LAYER_ORDER.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      selectedSlot === slot
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Visibility */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-sm font-semibold text-white mb-3">Toggle Visibility</h2>
              <div className="flex flex-wrap gap-2">
                {LAYER_ORDER.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setEnabledSlots(prev => ({ ...prev, [slot]: !prev[slot] }))}
                    className={`px-3 py-1 rounded text-sm capitalize ${
                      enabledSlots[slot]
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Controls */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-sm font-semibold text-white mb-3">
                Position: <span className="text-purple-400 capitalize">{selectedSlot}</span>
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">X Position</label>
                  <input
                    type="range"
                    min="0"
                    max="256"
                    value={currentPos?.x || 0}
                    onChange={(e) => updatePosition('x', Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={currentPos?.x || 0}
                    onChange={(e) => updatePosition('x', Number(e.target.value))}
                    className="w-full mt-1 px-2 py-1 bg-slate-700 text-white rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Y Position</label>
                  <input
                    type="range"
                    min="0"
                    max="256"
                    value={currentPos?.y || 0}
                    onChange={(e) => updatePosition('y', Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={currentPos?.y || 0}
                    onChange={(e) => updatePosition('y', Number(e.target.value))}
                    className="w-full mt-1 px-2 py-1 bg-slate-700 text-white rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Scale</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.05"
                    value={currentPos?.scale || 0.5}
                    onChange={(e) => updatePosition('scale', Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    step="0.05"
                    value={currentPos?.scale || 0.5}
                    onChange={(e) => updatePosition('scale', Number(e.target.value))}
                    className="w-full mt-1 px-2 py-1 bg-slate-700 text-white rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-sm font-semibold text-white mb-3">Export</h2>
              <button
                onClick={exportPositions}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500"
              >
                Copy Positions to Clipboard
              </button>

              <pre className="mt-4 p-3 bg-slate-900 rounded-lg text-xs text-slate-300 overflow-auto max-h-48">
                {JSON.stringify(positions, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
