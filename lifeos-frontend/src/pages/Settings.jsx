import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Lock,
  ChevronRight,
  Download,
  Trash2,
  Shield,
  Gamepad2,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  Save,
  Volume2,
  VolumeX,
  Mail,
  Clock,
  AtSign,
  X,
  Sparkles,
  BarChart2,
  Settings as SettingsIcon,
  GraduationCap,
  Play,
  RotateCcw,
  Vibrate,
  PartyPopper,
  Music,
  Cog,
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import {
  downloadLocalStorageBackup,
} from '../utils/dataMigration';
import {
  useGamificationModeStore,
  GAMIFICATION_MODES,
  VISIBILITY,
} from '../stores/gamificationModeStore';
import useSettingsStore, { initializeSettingsStore } from '../stores/settingsStore';
import useOnboardingStore from '../stores/onboardingStore';
import { useNewOnboardingStore } from '../stores/newOnboardingStore';
import { useSocialStore } from '../stores/socialStore';
import { useTourStore, TOUR_IDS } from '../stores/tourStore';
import { getAllTours } from '../components/tours/tourDefinitions';
import {
  haptics,
  sounds,
  celebrations,
  getMicroInteractionSettings,
  setMicroInteractionSettings,
} from '../services/microInteractions';
import { useSignOut } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    id: 'gamification',
    title: 'Gamification Mode',
    icon: Gamepad2,
    color: 'from-violet-500 to-purple-500',
    description: 'Choose your experience style',
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: User,
    color: 'from-purple-500 to-pink-500',
    description: 'Username, display name, preferences',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    color: 'from-yellow-500 to-orange-500',
    description: 'Reminders and alerts',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    icon: Lock,
    color: 'from-green-500 to-emerald-500',
    description: 'Profile visibility and social settings',
  },
  {
    id: 'tours',
    title: 'Feature Tours',
    icon: GraduationCap,
    color: 'from-cyan-500 to-blue-500',
    description: 'Nova-guided tutorials and help',
  },
  {
    id: 'feedback',
    title: 'Feedback & Sounds',
    icon: Vibrate,
    color: 'from-pink-500 to-rose-500',
    description: 'Haptics, sounds, and celebrations',
  },
];

const DANGER_ZONE = [
  {
    id: 'export-data',
    label: 'Export All Data',
    description: 'Download your complete data archive',
    icon: Download,
    color: 'blue',
    action: 'export'
  },
  {
    id: 'reset-onboarding',
    label: 'Reset Onboarding',
    description: 'Start the setup flow again',
    icon: RefreshCw,
    color: 'yellow',
    action: 'reset-onboarding'
  },
  {
    id: 'delete-account',
    label: 'Delete Account',
    description: 'Permanently delete all data',
    icon: Trash2,
    color: 'red',
    action: 'delete'
  },
];

// Mode icons mapping
const MODE_ICONS = {
  cosmic: Sparkles,
  minimal: BarChart2,
};

// Visibility setting labels
const VISIBILITY_LABELS = {
  showAvatar: { label: 'Avatar Display', description: 'Show character avatar' },
  showAvatarEffects: { label: 'Avatar Effects', description: 'Particle effects and animations' },
  showPets: { label: 'Companions', description: 'Show pet companions' },
  showEquipment: { label: 'Equipment', description: 'Show equipment system' },
  showSkillTree: { label: 'Skill Tree', description: 'Show skill constellation' },
  showXPBar: { label: 'Progress Bar', description: 'Show XP/progress bar' },
  showLevel: { label: 'Level Display', description: 'Show current level' },
  showStreaks: { label: 'Streak Tracking', description: 'Show streak counters' },
  showStreakFlame: { label: 'Streak Flame', description: 'Animated flame icon' },
  showAchievementPopups: { label: 'Achievement Popups', description: 'Toast notifications' },
  showLevelUpAnimation: { label: 'Level Up Animation', description: 'Celebration effects' },
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  ? 'bg-gradient-to-br from-primary-500/20 to-secondary/20 border-primary-500/50'
                  : 'bg-bg-1/50 border-border hover:border-border-hover'
                }
                border-2
              `}
            >
              {isActive && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-text-primary" />
                  </div>
                </div>
              )}

              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4
                  ${isActive ? 'bg-primary-500' : 'bg-bg-hover'}
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-text-primary' : 'text-text-muted'}`} />
              </div>

              <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                {modeData.name}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {modeData.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
        Advanced Visibility Settings
      </button>

      {/* Advanced Visibility Settings */}
      {showAdvanced && (
        <div className="bg-bg-1 border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h4 className="text-text-primary font-semibold">Visibility Overrides</h4>
              <p className="text-xs text-text-muted mt-1">
                Customize which elements are visible
              </p>
            </div>
            <button
              onClick={resetVisibility}
              className="text-xs px-3 py-1.5 bg-bg-hover border border-border rounded-lg text-text-muted hover:bg-bg-2 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="divide-y divide-border-subtle">
            {Object.entries(VISIBILITY_LABELS).map(([key, { label, description }]) => {
              const isEnabled = visibilitySettings[key];
              const defaultValue = VISIBILITY[mode][key];
              const isOverridden = isEnabled !== defaultValue;

              return (
                <div
                  key={key}
                  className="px-5 py-4 flex items-center justify-between hover:bg-bg-hover transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-medium">{label}</span>
                      {isOverridden && (
                        <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded">
                          Modified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-muted mt-0.5">{description}</div>
                  </div>

                  <button
                    onClick={() => toggleVisibility(key)}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${isEnabled ? 'bg-primary-500' : 'bg-bg-3'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-0.5 w-5 h-5 rounded-full bg-text-primary transition-transform
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

// Reusable Toggle Component
function SettingToggle({ enabled, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative w-12 h-6 rounded-full transition-colors
        ${enabled ? 'bg-primary-500' : 'bg-bg-3'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div
        className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-text-primary transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
}

// Reusable Select Component
function SettingSelect({ value, onChange, options, disabled = false }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="bg-bg-0 border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary-500 focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Account & Profile Settings Panel
function AccountSettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const { socialProfile, updateUsername, checkUsernameAvailable, fetchSocialProfile } = useSocialStore();
  const [localState, setLocalState] = useState({
    displayName: settings.account.displayName || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Username editing state
  const [usernameInput, setUsernameInput] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, error: null });
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    fetchSocialProfile();
  }, []);

  // Check username availability with debounce
  useEffect(() => {
    if (!isEditingUsername || !usernameInput || usernameInput.length < 3) {
      setUsernameStatus({ checking: false, available: null, error: usernameInput && usernameInput.length < 3 ? 'Min 3 characters' : null });
      return;
    }

    if (usernameInput.toLowerCase() === socialProfile?.username?.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true, error: null });
      return;
    }

    setUsernameStatus({ checking: true, available: null, error: null });

    const timeoutId = setTimeout(async () => {
      const result = await checkUsernameAvailable(usernameInput);
      setUsernameStatus({ checking: false, available: result.available, error: result.error });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [usernameInput, isEditingUsername, socialProfile?.username, checkUsernameAvailable]);

  const handleSaveUsername = async () => {
    if (!usernameStatus.available || savingUsername) return;

    setSavingUsername(true);
    const result = await updateUsername(usernameInput);
    setSavingUsername(false);

    if (!result.error) {
      setIsEditingUsername(false);
    } else {
      setUsernameStatus({ checking: false, available: false, error: result.error });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    updateSettings('account', {
      displayName: localState.displayName,
    });
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="p-5 space-y-4">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
          <AtSign className="w-4 h-4 text-blue-400" />
          Username
        </label>
        {isEditingUsername ? (
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">@</span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30))}
                placeholder="username"
                className={`w-full pl-8 pr-10 bg-bg-0 border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none ${
                  usernameStatus.error
                    ? 'border-red-500/50 focus:border-red-500'
                    : usernameStatus.available
                      ? 'border-green-500/50 focus:border-green-500'
                      : 'border-border focus:border-primary-500'
                }`}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus.checking ? (
                  <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
                ) : usernameStatus.available ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : usernameStatus.error ? (
                  <X className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            </div>
            {usernameStatus.error && (
              <p className="text-sm text-red-400">{usernameStatus.error}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveUsername}
                disabled={!usernameStatus.available || savingUsername}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${
                  usernameStatus.available && !savingUsername
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-bg-2 text-text-muted cursor-not-allowed'
                }`}
              >
                {savingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingUsername(false);
                  setUsernameInput('');
                  setUsernameStatus({ checking: false, available: null, error: null });
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-bg-2 text-text-muted hover:bg-bg-hover transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-bg-0 border border-border rounded-lg px-4 py-3">
            <span className="text-text-primary">
              {socialProfile?.username ? `@${socialProfile.username}` : 'Not set'}
            </span>
            <button
              onClick={() => {
                setUsernameInput(socialProfile?.username || '');
                setIsEditingUsername(true);
              }}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              {socialProfile?.username ? 'Change' : 'Set Username'}
            </button>
          </div>
        )}
        <p className="text-xs text-text-muted mt-1">
          Friends can find you by your username
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Display Name</label>
        <input
          type="text"
          value={localState.displayName}
          onChange={(e) => setLocalState({ ...localState, displayName: e.target.value })}
          placeholder="Enter your name"
          className="w-full bg-bg-0 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none"
        />
      </div>

      {/* Timezone */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-text-primary font-medium">Timezone</div>
          <div className="text-sm text-text-muted">{settings.account.timezone}</div>
        </div>
        <SettingSelect
          value={settings.account.timezone}
          onChange={(val) => updateSettings('account', { timezone: val })}
          options={(() => {
            const autoTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const baseOptions = [
              { value: 'UTC', label: 'UTC' },
              { value: 'America/New_York', label: 'Eastern (US)' },
              { value: 'America/Los_Angeles', label: 'Pacific (US)' },
              { value: 'Europe/London', label: 'London' },
              { value: 'Europe/Paris', label: 'Paris' },
              { value: 'Asia/Tokyo', label: 'Tokyo' },
            ];
            if (!baseOptions.some(opt => opt.value === autoTz)) {
              baseOptions.push({ value: autoTz, label: `Auto (${autoTz})` });
            }
            return baseOptions;
          })()}
        />
      </div>

      {/* Date Format */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-text-primary font-medium">Date Format</div>
        </div>
        <SettingSelect
          value={settings.account.dateFormat}
          onChange={(val) => updateSettings('account', { dateFormat: val })}
          options={[
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
          ]}
        />
      </div>

      {/* Time Format */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-text-primary font-medium">Time Format</div>
        </div>
        <SettingSelect
          value={settings.account.timeFormat}
          onChange={(val) => updateSettings('account', { timeFormat: val })}
          options={[
            { value: '12h', label: '12-hour' },
            { value: '24h', label: '24-hour' },
          ]}
        />
      </div>

      {/* Week Starts On */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-text-primary font-medium">Week Starts On</div>
        </div>
        <SettingSelect
          value={settings.account.weekStartsOn}
          onChange={(val) => updateSettings('account', { weekStartsOn: val })}
          options={[
            { value: 'sunday', label: 'Sunday' },
            { value: 'monday', label: 'Monday' },
          ]}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-text-primary font-medium transition-colors disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

// Notifications Settings Panel
function NotificationsSettingsPanel() {
  const { settings, updateSettings, toggleSetting } = useSettingsStore();

  return (
    <div className="divide-y divide-border-subtle">
      {/* Push Notifications */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" />
            Push Notifications
          </div>
          <div className="text-sm text-text-muted mt-0.5">Receive push notifications</div>
        </div>
        <SettingToggle
          enabled={settings.notifications.pushEnabled}
          onToggle={() => toggleSetting('notifications.pushEnabled')}
        />
      </div>

      {/* Task Reminders */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium">Task Reminders</div>
          <div className="text-sm text-text-muted mt-0.5">Remind about upcoming tasks</div>
        </div>
        <SettingToggle
          enabled={settings.notifications.taskReminders}
          onToggle={() => toggleSetting('notifications.taskReminders')}
        />
      </div>

      {/* Habit Reminders */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium">Habit Reminders</div>
          <div className="text-sm text-text-muted mt-0.5">Daily habit check-in reminders</div>
        </div>
        <SettingToggle
          enabled={settings.notifications.habitReminders}
          onToggle={() => toggleSetting('notifications.habitReminders')}
        />
      </div>

      {/* Streak Alerts */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium">Streak Alerts</div>
          <div className="text-sm text-text-muted mt-0.5">Alert when streaks are at risk</div>
        </div>
        <SettingToggle
          enabled={settings.notifications.streakAlerts}
          onToggle={() => toggleSetting('notifications.streakAlerts')}
        />
      </div>

      {/* Achievement Alerts */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium">Achievement Alerts</div>
          <div className="text-sm text-text-muted mt-0.5">Celebrate achievements</div>
        </div>
        <SettingToggle
          enabled={settings.notifications.achievementAlerts}
          onToggle={() => toggleSetting('notifications.achievementAlerts')}
        />
      </div>

      {/* Sound */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            {settings.notifications.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-green-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" />
            )}
            Sound Effects
          </div>
          <div className="text-sm text-text-muted mt-0.5">Play sounds for notifications</div>
        </div>
        <SettingToggle
          enabled={settings.notifications.soundEnabled}
          onToggle={() => toggleSetting('notifications.soundEnabled')}
        />
      </div>

      {/* Quiet Hours */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            Quiet Hours
          </div>
          <div className="text-sm text-text-muted mt-0.5">Pause notifications during set times</div>
        </div>
        <SettingToggle
          enabled={settings.notifications.quietHoursEnabled}
          onToggle={() => toggleSetting('notifications.quietHoursEnabled')}
        />
      </div>

      {/* Quiet Hours Times */}
      {settings.notifications.quietHoursEnabled && (
        <div className="px-5 py-4 bg-bg-hover flex items-center justify-between">
          <div className="flex-1">
            <div className="text-text-primary font-medium">Schedule</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={settings.notifications.quietHoursStart}
              onChange={(e) => updateSettings('notifications', { quietHoursStart: e.target.value })}
              className="bg-bg-0 border border-border rounded px-2 py-1 text-white text-sm"
            />
            <span className="text-text-muted">to</span>
            <input
              type="time"
              value={settings.notifications.quietHoursEnd}
              onChange={(e) => updateSettings('notifications', { quietHoursEnd: e.target.value })}
              className="bg-bg-0 border border-border rounded px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Privacy Settings Panel
function PrivacySettingsPanel() {
  const { settings, updateSettings, toggleSetting } = useSettingsStore();

  return (
    <div className="divide-y divide-border-subtle">
      {/* Profile Visibility */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            Profile Visibility
          </div>
          <div className="text-sm text-text-muted mt-0.5">Who can see your profile</div>
        </div>
        <SettingSelect
          value={settings.privacy.profileVisibility}
          onChange={(val) => updateSettings('privacy', { profileVisibility: val })}
          options={[
            { value: 'public', label: 'Public' },
            { value: 'friends', label: 'Friends Only' },
            { value: 'private', label: 'Private' },
          ]}
        />
      </div>

      {/* Show Activity Status */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium">Show Activity Status</div>
          <div className="text-sm text-text-muted mt-0.5">Let others see when you're online</div>
        </div>
        <SettingToggle
          enabled={settings.privacy.showActivityStatus}
          onToggle={() => toggleSetting('privacy.showActivityStatus')}
        />
      </div>

      {/* Allow Friend Requests */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium">Allow Friend Requests</div>
          <div className="text-sm text-text-muted mt-0.5">Let others send you friend requests</div>
        </div>
        <SettingToggle
          enabled={settings.privacy.allowFriendRequests}
          onToggle={() => toggleSetting('privacy.allowFriendRequests')}
        />
      </div>

      {/* Show on Leaderboards */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            {settings.privacy.showOnLeaderboards ? (
              <Eye className="w-4 h-4 text-purple-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-text-muted" />
            )}
            Show on Leaderboards
          </div>
          <div className="text-sm text-text-muted mt-0.5">Appear in public rankings</div>
        </div>
        <SettingToggle
          enabled={settings.privacy.showOnLeaderboards}
          onToggle={() => toggleSetting('privacy.showOnLeaderboards')}
        />
      </div>
    </div>
  );
}

// Feedback & Sounds Settings Panel
function FeedbackSettingsPanel() {
  const [settings, setSettings] = useState(() => getMicroInteractionSettings());
  const [testPlaying, setTestPlaying] = useState(false);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setMicroInteractionSettings({ [key]: value });
  };

  const testSound = () => {
    if (testPlaying) return;
    setTestPlaying(true);
    sounds.success();
    setTimeout(() => setTestPlaying(false), 500);
  };

  const testHaptic = async () => {
    await haptics.notification('success');
  };

  const testCelebration = () => {
    celebrations.burst({ particleCount: 30 });
  };

  return (
    <div className="divide-y divide-border-subtle">
      {/* Haptic Feedback */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-pink-400" />
            Haptic Feedback
          </div>
          <div className="text-sm text-text-muted mt-0.5">Vibration feedback on interactions</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testHaptic}
            className="text-xs px-3 py-1.5 bg-bg-hover border border-border rounded-lg text-text-muted hover:bg-bg-2 transition-colors"
          >
            Test
          </button>
          <SettingToggle
            enabled={settings.haptics}
            onToggle={() => updateSetting('haptics', !settings.haptics)}
          />
        </div>
      </div>

      {/* Sound Effects */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            Sound Effects
          </div>
          <div className="text-sm text-text-muted mt-0.5">Audio feedback for actions</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testSound}
            disabled={testPlaying}
            className="text-xs px-3 py-1.5 bg-bg-hover border border-border rounded-lg text-text-muted hover:bg-bg-2 transition-colors disabled:opacity-50"
          >
            Test
          </button>
          <SettingToggle
            enabled={settings.sounds}
            onToggle={() => updateSetting('sounds', !settings.sounds)}
          />
        </div>
      </div>

      {/* Sound Volume */}
      {settings.sounds && (
        <div className="px-5 py-4 bg-bg-hover flex items-center justify-between">
          <div className="flex-1">
            <div className="text-text-primary font-medium">Volume</div>
            <div className="text-sm text-text-muted mt-0.5">{Math.round(settings.soundVolume * 100)}%</div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.soundVolume * 100}
            onChange={(e) => updateSetting('soundVolume', parseInt(e.target.value) / 100)}
            className="w-32 accent-primary-500"
          />
        </div>
      )}

      {/* Celebrations */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            <PartyPopper className="w-4 h-4 text-yellow-400" />
            Celebration Effects
          </div>
          <div className="text-sm text-text-muted mt-0.5">Confetti and particles for achievements</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testCelebration}
            className="text-xs px-3 py-1.5 bg-bg-hover border border-border rounded-lg text-text-muted hover:bg-bg-2 transition-colors"
          >
            Test
          </button>
          <SettingToggle
            enabled={settings.celebrations}
            onToggle={() => updateSetting('celebrations', !settings.celebrations)}
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-5 py-4 bg-primary-500/5 border-t border-primary-500/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-text-primary font-medium text-sm">Satisfying Interactions</div>
            <div className="text-xs text-text-muted mt-1">
              These settings control the micro-interactions throughout the app. Haptics work best on mobile devices, while sounds and celebrations work on all platforms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Tours Settings Panel
function FeatureToursSettingsPanel() {
  const {
    toursEnabled,
    completedTours,
    skippedTours,
    setToursEnabled,
    resetTour,
    resetAllTours,
    startTour,
    getCompletionStats,
  } = useTourStore();

  const allTours = getAllTours();
  const stats = getCompletionStats();

  const handleReplayTour = (tourId) => {
    resetTour(tourId);
    // Navigate to the tour's route and start it
    const tour = allTours.find(t => t.id === tourId);
    if (tour) {
      window.location.href = tour.route;
    }
  };

  const getTourStatus = (tourId) => {
    if (completedTours.includes(tourId)) return 'completed';
    if (skippedTours.includes(tourId)) return 'skipped';
    return 'available';
  };

  return (
    <div className="divide-y divide-border-subtle" data-tour="tour-settings">
      {/* Auto-start Tours Toggle */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-text-primary font-medium flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            Auto-start Tours
          </div>
          <div className="text-sm text-text-muted mt-0.5">
            Show Nova's feature tours when visiting new pages
          </div>
        </div>
        <SettingToggle
          enabled={toursEnabled}
          onToggle={() => setToursEnabled(!toursEnabled)}
        />
      </div>

      {/* Progress Overview */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-text-primary font-medium">Tour Progress</div>
          <span className="text-sm text-primary-400">{stats.percentage}% Complete</span>
        </div>
        <div className="h-2 bg-bg-0 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>{stats.completed} completed</span>
          <span>{stats.skipped} skipped</span>
          <span>{stats.remaining} remaining</span>
        </div>
      </div>

      {/* Tour List */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-text-primary font-medium">Available Tours</div>
          <button
            onClick={() => {
              if (window.confirm('Reset all tour progress? You can retake all tours.')) {
                resetAllTours();
              }
            }}
            className="text-xs px-3 py-1.5 bg-bg-hover border border-border rounded-lg text-text-muted hover:bg-bg-2 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>

        <div className="space-y-2">
          {allTours.map((tour) => {
            const status = getTourStatus(tour.id);
            const Icon = tour.icon;

            return (
              <div
                key={tour.id}
                className="flex items-center justify-between p-3 bg-bg-0 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg
                    ${status === 'completed' ? 'bg-green-500/20' :
                      status === 'skipped' ? 'bg-yellow-500/20' : 'bg-bg-hover'}
                  `}>
                    <Icon className={`w-4 h-4 ${
                      status === 'completed' ? 'text-green-400' :
                      status === 'skipped' ? 'text-yellow-400' : 'text-text-muted'
                    }`} />
                  </div>
                  <div>
                    <div className="text-text-primary font-medium text-sm">{tour.name}</div>
                    <div className="text-xs text-text-muted flex items-center gap-2">
                      <span>{tour.estimatedTime}</span>
                      {status === 'completed' && (
                        <span className="text-green-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                      {status === 'skipped' && (
                        <span className="text-yellow-400">Skipped</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleReplayTour(tour.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all
                    ${status === 'available'
                      ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                      : 'bg-bg-hover text-text-muted hover:bg-bg-2'}
                  `}
                >
                  <Play className="w-3 h-3" />
                  {status === 'available' ? 'Start' : 'Replay'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [expandedSection, setExpandedSection] = useState(null);
  const { signOut, loading: signOutLoading } = useSignOut();

  // Initialize settings store on mount
  useEffect(() => {
    initializeSettingsStore();
  }, []);

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (confirmed) {
      await signOut();
      window.location.href = '/auth';
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Render the appropriate settings panel based on section ID
  const renderSettingsPanel = (sectionId) => {
    switch (sectionId) {
      case 'gamification':
        return <GamificationModeSelector />;
      case 'account':
        return <AccountSettingsPanel />;
      case 'notifications':
        return <NotificationsSettingsPanel />;
      case 'privacy':
        return <PrivacySettingsPanel />;
      case 'tours':
        return <FeatureToursSettingsPanel />;
      case 'feedback':
        return <FeedbackSettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-0 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-0/95 backdrop-blur-md border-b border-border-subtle px-6 py-4">
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences"
          icon={Cog}
          module="default"
          variant="elevated"
        />
      </div>

      <div className="px-4 pt-6 pb-4 space-y-4">
        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section, index) => {
          // Add data-tour attributes to specific sections
          const sectionTourId = section.id === 'gamification' ? 'theme-settings' :
                                section.id === 'account' ? 'goal-settings' : null;
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <div
              key={section.id}
              className="bg-bg-1 border border-border rounded-xl overflow-hidden"
              {...(sectionTourId ? { 'data-tour': sectionTourId } : {})}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color}`}>
                    <Icon className="w-5 h-5 text-text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-text-primary font-semibold">{section.title}</h3>
                    <p className="text-xs text-text-muted">{section.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-text-muted transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="border-t border-border">
                  {section.id === 'gamification' ? (
                    <div className="p-5">
                      <GamificationModeSelector />
                    </div>
                  ) : (
                    renderSettingsPanel(section.id)
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Danger Zone */}
        <div className="bg-bg-1 border border-error/20 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-error/20 bg-error/5">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-error" />
              Danger Zone
            </h3>
          </div>

          <div className="divide-y divide-border-subtle">
            {DANGER_ZONE.map((item) => {
              const Icon = item.icon;

              const handleDangerAction = () => {
                if (item.action === 'export') {
                  try {
                    downloadLocalStorageBackup();
                  } catch (error) {
                    console.error('Export failed:', error);
                    alert('Export failed. Please try again.');
                  }
                } else if (item.action === 'reset-onboarding') {
                  const confirmed = window.confirm('Reset the onboarding flow?\n\nThis will restart the setup experience. Your data will not be deleted.');
                  if (confirmed) {
                    useNewOnboardingStore.getState().resetOnboarding();
                    useOnboardingStore.getState().resetOnboarding();
                    window.location.href = '/';
                  }
                } else if (item.action === 'delete') {
                  const confirmed = window.confirm('Delete your account?\n\nThis action is irreversible and will permanently delete all your data.');
                  if (confirmed) {
                    alert('Account deletion coming soon.');
                  }
                }
              };

              return (
                <button
                  key={item.id}
                  onClick={handleDangerAction}
                  className="w-full px-5 py-4 hover:bg-bg-hover transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className={`w-5 h-5 ${item.color === 'red' ? 'text-error' : item.color === 'yellow' ? 'text-warning' : 'text-info'}`} />
                      <div>
                        <div className="text-text-primary font-medium">{item.label}</div>
                        <div className="text-sm text-text-muted mt-0.5">{item.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={signOutLoading}
          className="w-full bg-bg-1 border border-border hover:border-red-500/50 rounded-xl p-4 flex items-center justify-center gap-3 transition-all group"
        >
          <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
          <span className="text-red-400 font-medium group-hover:text-red-300">
            {signOutLoading ? 'Signing Out...' : 'Sign Out'}
          </span>
        </button>

        {/* Version Info */}
        <div className="text-center text-sm text-text-muted pt-4">
          <p>LifeOS v1.0.0 Beta</p>
        </div>
      </div>
    </div>
  );
}
