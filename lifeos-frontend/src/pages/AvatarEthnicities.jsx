/**
 * Avatar Ethnicities Preview Page
 * View all diverse avatar skin tone variants
 */

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SKIN_TONES = ['white', 'asian', 'brown', 'black'];

const AvatarEthnicities = () => {
  const navigate = useNavigate();
  const [selectedTone, setSelectedTone] = useState(null);

  const getAvatarPath = (gender, tone) =>
    `/assets/avatar/diverse/${gender}_stage_10_${tone}.png`;

  return (
    <div className="min-h-screen bg-bg-0 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-bg-1 hover:bg-bg-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Avatar Ethnicities</h1>
      </div>

      {/* Skin Tone Selector */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedTone(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedTone === null
              ? 'bg-accent text-white'
              : 'bg-bg-1 text-text-secondary hover:bg-bg-2'
          }`}
        >
          All
        </button>
        {SKIN_TONES.map((tone) => (
          <button
            key={tone}
            onClick={() => setSelectedTone(tone)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              selectedTone === tone
                ? 'bg-accent text-white'
                : 'bg-bg-1 text-text-secondary hover:bg-bg-2'
            }`}
          >
            {tone}
          </button>
        ))}
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SKIN_TONES.filter(tone => !selectedTone || tone === selectedTone).map((tone) => (
          <div key={tone} className="bg-bg-1 rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4 capitalize text-center">
              {tone}
            </h3>

            <div className="flex justify-center gap-4">
              {/* Hero */}
              <div className="text-center">
                <div className="w-32 h-32 bg-bg-2 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                  <img
                    src={getAvatarPath('hero', tone)}
                    alt={`Hero ${tone}`}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-text-muted text-sm">Not found</span>';
                    }}
                  />
                </div>
                <span className="text-sm text-text-secondary">Male</span>
              </div>

              {/* Heroine */}
              <div className="text-center">
                <div className="w-32 h-32 bg-bg-2 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                  <img
                    src={getAvatarPath('heroine', tone)}
                    alt={`Heroine ${tone}`}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-text-muted text-sm">Not found</span>';
                    }}
                  />
                </div>
                <span className="text-sm text-text-secondary">Female</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison with Original */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-text-primary mb-6">Compare with Original</h2>
        <div className="bg-bg-1 rounded-2xl p-6 border border-border">
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-bg-2 rounded-xl flex items-center justify-center mb-2">
                <img
                  src="/assets/avatar/base-evolution/hero_base_stage_10_swordsman.png"
                  alt="Original Hero"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <span className="text-sm text-text-secondary">Original Hero</span>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-bg-2 rounded-xl flex items-center justify-center mb-2">
                <img
                  src="/assets/avatar/base-evolution/heroine_base_stage_10_swordsman.png"
                  alt="Original Heroine"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <span className="text-sm text-text-secondary">Original Heroine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEthnicities;
