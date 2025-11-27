import React, { useState } from 'react';
import {
  User,
  Palette,
  Bell,
  Lock,
  Database,
  Zap,
  Globe,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Download,
  Trash2,
  Shield,
  Smartphone,
  Cloud,
  Key,
  Settings as SettingsIcon,
  Sparkles,
  Briefcase,
  BarChart2,
  Gamepad2,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  useGamificationModeStore,
  GAMIFICATION_MODES,
  VISIBILITY,
} from '../stores/gamificationModeStore';

const SETTINGS_SECTIONS = [
  {
    id: 'gamification',
    title: 'Gamification Mode',
    icon: Gamepad2,
    color: 'from-violet-500 to-purple-500',
    isCustom: true, // Special handling for this section
    items: [] // Rendered custom
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: User,
    color: 'from-purple-500 to-pink-500',
    items: [
      { id: 'profile', label: 'Edit Profile', description: 'Name, email, photo' },
      { id: 'password', label: 'Change Password', description: 'Update your password' },
      { id: 'security', label: 'Security & 2FA', description: 'Two-factor authentication' },
      { id: 'sessions', label: 'Active Sessions', description: 'Manage logged-in devices' },
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Palette,
    color: 'from-blue-500 to-cyan-500',
    items: [
      { id: 'theme', label: 'Theme', description: 'Dark mode (currently enabled)', toggle: true, value: true },
      { id: 'colors', label: 'Module Colors', description: 'Customize module accent colors' },
      { id: 'font', label: 'Font Size', description: 'Adjust text size' },
      { id: 'density', label: 'UI Density', description: 'Compact, Normal, or Spacious' },
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications & Reminders',
    icon: Bell,
    color: 'from-yellow-500 to-orange-500',
    items: [
      { id: 'push', label: 'Push Notifications', description: 'Mobile & desktop alerts', toggle: true, value: true },
      { id: 'email', label: 'Email Notifications', description: 'Daily summaries & updates', toggle: true, value: false },
      { id: 'reminders', label: 'Task Reminders', description: 'Default reminder times' },
      { id: 'quiet', label: 'Quiet Hours', description: 'Set do-not-disturb schedule' },
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & Data',
    icon: Lock,
    color: 'from-green-500 to-emerald-500',
    items: [
      { id: 'visibility', label: 'Profile Visibility', description: 'Public, Friends, or Private' },
      { id: 'tracking', label: 'Usage Analytics', description: 'Anonymous usage data', toggle: true, value: false },
      { id: 'location', label: 'Location Services', description: 'For fitness tracking', toggle: true, value: false },
      { id: 'data-retention', label: 'Data Retention', description: 'Auto-delete old data' },
    ]
  },
  {
    id: 'sync',
    title: 'Sync & Backup',
    icon: Cloud,
    color: 'from-cyan-500 to-blue-500',
    items: [
      { id: 'cloud-sync', label: 'Cloud Sync', description: 'Real-time data sync', toggle: true, value: true },
      { id: 'devices', label: 'Synced Devices', description: 'Manage connected devices' },
      { id: 'backup', label: 'Backup & Export', description: 'Download all your data' },
      { id: 'import', label: 'Import Data', description: 'Restore from backup' },
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    items: [
      { id: 'health', label: 'Health Apps', description: 'Apple Health, Google Fit, Strava' },
      { id: 'calendar', label: 'Calendar Sync', description: 'Google, Outlook, Apple' },
      { id: 'finance', label: 'Financial Apps', description: 'Banking & payment integrations' },
      { id: 'api', label: 'API Access', description: 'Developer settings & webhooks' },
    ]
  },
  {
    id: 'modules',
    title: 'Module Preferences',
    icon: SettingsIcon,
    color: 'from-pink-500 to-purple-500',
    items: [
      { id: 'productivity', label: 'Productivity Settings', description: 'Work hours, time tracking' },
      { id: 'fitness', label: 'Fitness Settings', description: 'Goals, units, metrics' },
      { id: 'knowledge', label: 'Knowledge Settings', description: 'Capture format, tagging' },
      { id: 'journal', label: 'Journal Settings', description: 'Prompts, privacy, templates' },
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: Database,
    color: 'from-indigo-500 to-purple-500',
    items: [
      { id: 'correlations', label: 'Data Correlations', description: 'Cross-module insights', toggle: true, value: true },
      { id: 'performance', label: 'Performance', description: 'Cache, storage, optimization' },
      { id: 'shortcuts', label: 'Keyboard Shortcuts', description: 'View & customize shortcuts' },
      { id: 'accessibility', label: 'Accessibility', description: 'Screen reader, contrast, motion' },
    ]
  },
  {
    id: 'about',
    title: 'About & Support',
    icon: HelpCircle,
    color: 'from-gray-500 to-gray-400',
    items: [
      { id: 'help', label: 'Help & Tutorials', description: 'User guide, FAQs, videos' },
      { id: 'feedback', label: 'Send Feedback', description: 'Bug reports, feature requests' },
      { id: 'version', label: 'Version', description: 'v1.0.0 Beta' },
      { id: 'legal', label: 'Legal', description: 'Privacy policy, terms of service' },
    ]
  },
];

const DANGER_ZONE = [
  {
    id: 'export-data',
    label: 'Export All Data',
    description: 'Download your complete data archive (JSON/CSV)',
    icon: Download,
    color: 'blue',
    action: 'export'
  },
  {
    id: 'delete-account',
    label: 'Delete Account',
    description: 'Permanently delete your account and all data',
    icon: Trash2,
    color: 'red',
    action: 'delete'
  },
];

// Mode icons mapping
const MODE_ICONS = {
  cosmic: Sparkles,
  professional: Briefcase,
  minimal: BarChart2,
};

// Visibility setting labels
const VISIBILITY_LABELS = {
  showAvatar: { label: 'Avatar Display', description: 'Show character avatar' },
  showAvatarEffects: { label: 'Avatar Effects', description: 'Particle effects and animations' },
  showPets: { label: 'Companions/Boosters', description: 'Show pet companions' },
  showPetSprites: { label: 'Pet Sprites', description: 'Show pixel art pet images' },
  showEquipment: { label: 'Equipment/Boosters', description: 'Show equipment system' },
  showEquipmentEffects: { label: 'Equipment Effects', description: 'Glow and rarity effects' },
  showSkillTree: { label: 'Skill Tree', description: 'Show skill constellation' },
  showConstellationEffects: { label: 'Constellation Effects', description: 'Visual effects on skill tree' },
  showXPBar: { label: 'Progress Bar', description: 'Show XP/progress bar' },
  showLevel: { label: 'Level Display', description: 'Show current level' },
  showStreaks: { label: 'Streak Tracking', description: 'Show streak counters' },
  showStreakFlame: { label: 'Streak Flame', description: 'Animated flame icon for streaks' },
  showAchievementPopups: { label: 'Achievement Popups', description: 'Toast notifications for achievements' },
  showLevelUpAnimation: { label: 'Level Up Animation', description: 'Celebration when leveling up' },
  showParticleEffects: { label: 'Particle Effects', description: 'Floating particles and effects' },
  showRarityGlow: { label: 'Rarity Glow', description: 'Color glow based on item rarity' },
};

// Gamification Mode Selector Component
function GamificationModeSelector() {
  const {
    mode,
    setMode,
    getVisibilitySettings,
    toggleVisibility,
    resetVisibility,
  } = useGamificationModeStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const visibilitySettings = getVisibilitySettings();

  return (
    <div className="space-y-6">
      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(GAMIFICATION_MODES).map(([modeId, modeData]) => {
          const Icon = MODE_ICONS[modeId];
          const isActive = mode === modeId;

          return (
            <button
              key={modeId}
              onClick={() => setMode(modeId)}
              className={`
                relative p-5 rounded-xl text-left transition-all
                ${isActive
                  ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/50'
                  : 'bg-[#1a1724]/50 border-white/10 hover:border-white/20'
                }
                border-2
              `}
            >
              {/* Selected Indicator */}
              {isActive && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4
                  ${isActive
                    ? 'bg-purple-500'
                    : 'bg-white/5'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/60'}`} />
              </div>

              {/* Content */}
              <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-white' : 'text-white/80'}`}>
                {modeData.name}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {modeData.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Mode Preview */}
      <div className="bg-[#1a1724] border border-white/10 rounded-xl p-5">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          Mode Preview
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mode === 'cosmic' && (
            <>
              <PreviewItem label="Level 42" subLabel="Blade Master" />
              <PreviewItem label="1,250 XP" subLabel="Cosmic Credits" />
              <PreviewItem label="Phoenix" subLabel="Active Companion" />
              <PreviewItem label="Epic Helmet" subLabel="Neural Interface" />
            </>
          )}
          {mode === 'professional' && (
            <>
              <PreviewItem label="Milestone 42" subLabel="Specialist" />
              <PreviewItem label="1,250 Points" subLabel="Progress Points" />
              <PreviewItem label="+10% All" subLabel="Universal Boost" />
              <PreviewItem label="Premium" subLabel="Cognitive Enhancer" />
            </>
          )}
          {mode === 'minimal' && (
            <>
              <PreviewItem label="Level 42" subLabel="Stage 21" />
              <PreviewItem label="1,250 pts" subLabel="Points" />
              <PreviewItem label="+10% All" subLabel="Active Bonus" />
              <PreviewItem label="Focus +4" subLabel="Active" />
            </>
          )}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
        Advanced Visibility Settings
      </button>

      {/* Advanced Visibility Settings */}
      {showAdvanced && (
        <div className="bg-[#1a1724] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold">Visibility Overrides</h4>
              <p className="text-xs text-white/50 mt-1">
                Customize which elements are visible regardless of mode
              </p>
            </div>
            <button
              onClick={resetVisibility}
              className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {Object.entries(VISIBILITY_LABELS).map(([key, { label, description }]) => {
              const isEnabled = visibilitySettings[key];
              const defaultValue = VISIBILITY[mode][key];
              const isOverridden = isEnabled !== defaultValue;

              return (
                <div
                  key={key}
                  className="px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{label}</span>
                      {isOverridden && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                          Modified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/60 mt-0.5">{description}</div>
                  </div>

                  <button
                    onClick={() => toggleVisibility(key)}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${isEnabled ? 'bg-purple-500' : 'bg-gray-600'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform
                        ${isEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                      `}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Preview Item Component
function PreviewItem({ label, subLabel }) {
  return (
    <div className="bg-white/5 rounded-lg p-3">
      <div className="text-white font-semibold text-sm">{label}</div>
      <div className="text-white/50 text-xs">{subLabel}</div>
    </div>
  );
}

export default function Settings() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleToggle = (itemId, currentValue) => {
    console.log(`Toggle ${itemId}:`, !currentValue);
    // Implement actual toggle logic here
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          Settings
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Access Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Privacy First</h3>
              <p className="text-sm text-white/60 mb-3">
                All data is encrypted and stored locally. You own everything.
              </p>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors">
                  View Privacy Policy
                </button>
                <button className="text-xs px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors">
                  Export My Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <div
              key={section.id}
              className="bg-[#1a1724] border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{section.title}</h3>
                    <p className="text-xs text-white/50">{section.items.length} options</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-white/60 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="border-t border-white/10">
                  {/* Custom Gamification Section */}
                  {section.isCustom && section.id === 'gamification' ? (
                    <div className="p-5">
                      <GamificationModeSelector />
                    </div>
                  ) : (
                    /* Standard Items */
                    section.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`px-5 py-4 hover:bg-white/5 transition-colors ${
                          index < section.items.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium">{item.label}</div>
                            <div className="text-sm text-white/60 mt-0.5">{item.description}</div>
                          </div>

                          {item.toggle ? (
                            <button
                              onClick={() => handleToggle(item.id, item.value)}
                              className={`
                                relative w-12 h-6 rounded-full transition-colors
                                ${item.value ? 'bg-purple-500' : 'bg-gray-600'}
                              `}
                            >
                              <div
                                className={`
                                  absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform
                                  ${item.value ? 'translate-x-6' : 'translate-x-0.5'}
                                `}
                              />
                            </button>
                          ) : (
                            <ChevronRight className="w-5 h-5 text-white/50" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Danger Zone */}
        <div className="bg-[#1a1724] border border-red-500/20 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-red-500/20 bg-red-500/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Danger Zone
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Irreversible actions - proceed with caution
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {DANGER_ZONE.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  className="w-full px-5 py-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className={`w-5 h-5 text-${item.color}-400`} />
                      <div>
                        <div className={`text-white font-medium`}>{item.label}</div>
                        <div className="text-sm text-white/60 mt-0.5">{item.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-sm text-white/50 pt-4">
          <p>Quanta v1.0.0 Beta</p>
          <p className="text-xs mt-1">Personal Operating System</p>
        </div>
      </div>
    </div>
  );
}
