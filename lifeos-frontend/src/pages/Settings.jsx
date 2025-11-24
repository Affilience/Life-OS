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
  Settings as SettingsIcon
} from 'lucide-react';

const SETTINGS_SECTIONS = [
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
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
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
              <p className="text-sm text-gray-400 mb-3">
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
              className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden"
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
                    <p className="text-xs text-gray-500">{section.items.length} options</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="border-t border-white/10">
                  {section.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`px-5 py-4 hover:bg-white/5 transition-colors ${
                        index < section.items.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.label}</div>
                          <div className="text-sm text-gray-400 mt-0.5">{item.description}</div>
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
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Danger Zone */}
        <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-red-500/20 bg-red-500/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Danger Zone
            </h3>
            <p className="text-xs text-gray-400 mt-1">
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
                        <div className="text-sm text-gray-400 mt-0.5">{item.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Quanta v1.0.0 Beta</p>
          <p className="text-xs mt-1">Personal Operating System</p>
        </div>
      </div>
    </div>
  );
}
