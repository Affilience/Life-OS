/**
 * Level Up Modal Test Page
 *
 * A development page for testing and iterating on the level-up modal.
 * Allows triggering the modal with various configurations.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LevelUpModal from '../components/gamification/LevelUpModal';
import { PERK_TREES } from '../data/perkTrees';
import { SKILL_POINTS_PER_LEVEL } from '../utils/statsSystem';
import { getLevelTitle, getMilestoneForLevel } from '../data/levelProgression';

// Helper to get perks available at a level range
function getNewlyAvailablePerks(oldLevel, newLevel) {
  const newPerks = [];
  Object.entries(PERK_TREES).forEach(([treeId, tree]) => {
    tree.perks.forEach(perk => {
      if (perk.level > oldLevel && perk.level <= newLevel) {
        newPerks.push({
          id: perk.id,
          name: perk.name,
          tree: treeId,
          treeName: tree.name,
          treeColor: tree.color,
          level: perk.level,
          tier: perk.tier,
          description: perk.description,
        });
      }
    });
  });
  return newPerks.sort((a, b) => a.level - b.level || a.tree.localeCompare(b.tree));
}

// Preset level-up scenarios
const PRESETS = [
  { name: 'Basic (1→2)', oldLevel: 1, newLevel: 2 },
  { name: 'Early Game (4→5)', oldLevel: 4, newLevel: 5 },
  { name: 'Tier Up (9→10)', oldLevel: 9, newLevel: 10 },
  { name: 'Title Change (14→15)', oldLevel: 14, newLevel: 15 },
  { name: 'Mid Game (24→25)', oldLevel: 24, newLevel: 25 },
  { name: 'Many Perks (29→30)', oldLevel: 29, newLevel: 30 },
  { name: 'High Level (49→50)', oldLevel: 49, newLevel: 50 },
  { name: 'Epic (74→75)', oldLevel: 74, newLevel: 75 },
  { name: 'Legendary (99→100)', oldLevel: 99, newLevel: 100 },
  { name: 'Multi-Level (1→10)', oldLevel: 1, newLevel: 10 },
];

export default function LevelUpTest() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Custom level inputs
  const [customOldLevel, setCustomOldLevel] = useState(4);
  const [customNewLevel, setCustomNewLevel] = useState(5);

  const triggerLevelUp = (oldLevel, newLevel) => {
    const oldTitle = getLevelTitle(oldLevel);
    const newTitle = getLevelTitle(newLevel);
    const milestone = getMilestoneForLevel(newLevel);
    const newlyAvailablePerks = getNewlyAvailablePerks(oldLevel, newLevel);
    const tierUp = newLevel % 10 === 0;
    const stageTransition = Math.floor(newLevel / 10) > Math.floor(oldLevel / 10);

    const data = {
      newLevel,
      oldLevel,
      tierUp,
      stageTransition,
      newStage: Math.floor(newLevel / 10) + 1,
      oldStage: Math.floor(oldLevel / 10) + 1,
      xpBeforeLevelUp: 0,
      xpToNextLevel: 100,
      xpGained: 100,
      skillPointsAwarded: SKILL_POINTS_PER_LEVEL * (newLevel - oldLevel),
      newlyAvailablePerks,
      unlocksAvailable: milestone?.equipment ? ['New Equipment Available!'] : [],
    };

    setModalData(data);
    setIsModalOpen(true);
  };

  // Get preview info for current custom levels
  const previewPerks = getNewlyAvailablePerks(customOldLevel, customNewLevel);
  const previewOldTitle = getLevelTitle(customOldLevel);
  const previewNewTitle = getLevelTitle(customNewLevel);
  const previewMilestone = getMilestoneForLevel(customNewLevel);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Level-Up Modal Test Page
          </h1>
          <p className="text-white/60 mt-2">
            Test and iterate on the level-up celebration modal
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white/80">Quick Presets</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => triggerLevelUp(preset.oldLevel, preset.newLevel)}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg text-sm transition-colors"
              >
                {preset.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Level Selector */}
        <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4 text-white/80">Custom Level Range</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-2">Old Level</label>
              <input
                type="number"
                min="1"
                max="99"
                value={customOldLevel}
                onChange={(e) => setCustomOldLevel(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="text-2xl text-white/40 pt-6">→</div>

            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-2">New Level</label>
              <input
                type="number"
                min="2"
                max="100"
                value={customNewLevel}
                onChange={(e) => setCustomNewLevel(Math.max(customOldLevel + 1, Math.min(100, parseInt(e.target.value) || 2)))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => triggerLevelUp(customOldLevel, customNewLevel)}
              className="px-6 py-2 mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-colors"
            >
              Test Level Up
            </motion.button>
          </div>

          {/* Preview Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/50 mb-1">Title Change</div>
              <div className="text-white">
                {previewOldTitle.title === previewNewTitle.title ? (
                  <span className="text-white/40">No change</span>
                ) : (
                  <>
                    <span style={{ color: previewOldTitle.color }}>{previewOldTitle.title}</span>
                    <span className="text-white/40"> → </span>
                    <span style={{ color: previewNewTitle.color }}>{previewNewTitle.title}</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/50 mb-1">Skill Points</div>
              <div className="text-cyan-400 font-semibold">
                +{SKILL_POINTS_PER_LEVEL * (customNewLevel - customOldLevel)}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/50 mb-1">New Perks</div>
              <div className="text-indigo-400 font-semibold">
                {previewPerks.length} available
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/50 mb-1">Milestone</div>
              <div className={previewMilestone ? 'text-amber-400' : 'text-white/40'}>
                {previewMilestone ? `${previewMilestone.credits} credits` : 'None'}
              </div>
            </div>
          </div>
        </div>

        {/* Perks Preview */}
        <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4 text-white/80">
            Perks Unlocked ({previewPerks.length})
          </h2>

          {previewPerks.length === 0 ? (
            <p className="text-white/40">No new perks in this level range</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {previewPerks.map((perk) => (
                <div
                  key={perk.id}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: perk.treeColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 text-sm truncate">{perk.name}</div>
                    <div className="text-white/40 text-xs">
                      {perk.treeName} • Level {perk.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Perk Level Distribution */}
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4 text-white/80">Perk Level Distribution</h2>
          <p className="text-white/50 text-sm mb-4">
            Shows how many perks unlock at each level across all trees
          </p>

          <div className="flex flex-wrap gap-2">
            {[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90].map((level) => {
              const perksAtLevel = getNewlyAvailablePerks(level - 1, level);
              return (
                <div
                  key={level}
                  className="px-3 py-2 bg-white/5 rounded-lg text-center min-w-[60px]"
                >
                  <div className="text-white/50 text-xs">Lv {level}</div>
                  <div className={`font-semibold ${perksAtLevel.length > 0 ? 'text-purple-400' : 'text-white/30'}`}>
                    {perksAtLevel.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
      />
    </div>
  );
}
