# Haptics Implementation Guide

## Overview
Haptic feedback has been implemented throughout the app using Capacitor's Haptics API. This provides physical vibration feedback on iOS and Android devices.

## Quick Start

### Import the haptics utility:
```javascript
import { haptics } from '../utils/haptics';
```

### Basic Usage:
```javascript
// Light tap (buttons, toggles)
await haptics.light();

// Medium tap (confirmations)
await haptics.medium();

// Heavy tap (major actions)
await haptics.heavy();

// Success notification (completed task)
await haptics.success();

// Warning notification
await haptics.warning();

// Error notification
await haptics.error();

// Epic achievement (level up, major milestone)
await haptics.epic();
```

## When to Use Each Haptic

### Light Impact
**Use for:**
- Button taps
- Toggle switches
- List item selections
- Navigation
- Minor UI interactions

**Example:**
```javascript
<button onClick={async () => {
  await haptics.light();
  navigate('/page');
}}>
  Go to Page
</button>
```

### Medium Impact
**Use for:**
- Confirmations
- Save actions
- Adding items
- Standard completions

**Example:**
```javascript
const handleSave = async () => {
  await haptics.medium();
  saveData();
};
```

### Heavy Impact
**Use for:**
- Major actions
- Deleting items
- Important confirmations
- Significant state changes

**Example:**
```javascript
const handleDelete = async () => {
  await haptics.heavy();
  deleteItem();
};
```

### Success Notification
**Use for:**
- Completed habits
- Finished tasks
- Saved successfully
- Goals achieved

**Example:**
```javascript
const completeHabit = async () => {
  await haptics.success();
  markComplete();
};
```

### Epic Haptic (Success + Heavy + Vibrate)
**Use for:**
- Level ups
- Major achievements
- Constellation unlocks
- Significant milestones

**Example:**
```javascript
const handleLevelUp = async () => {
  await haptics.epic(); // Heavy impact + 500ms vibration
  showLevelUpAnimation();
};
```

## Button Component Integration

The Button component now has built-in haptic support:

```javascript
// Default (light haptic)
<Button onClick={handleClick}>
  Click Me
</Button>

// Medium haptic
<Button onClick={handleClick} haptic="medium">
  Save
</Button>

// Heavy haptic for dangerous actions
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Disable haptics for specific button
<Button onClick={handleClick} haptic="none">
  No Haptic
</Button>
```

## User Settings

Users can disable haptics globally via the HapticsSettings component:

```javascript
import HapticsSettings from '../components/settings/HapticsSettings';

// In your settings page:
<HapticsSettings />
```

The setting is stored in localStorage and persists across sessions.

## Best Practices

### DO:
✅ Use haptics for every interactive element
✅ Match haptic intensity to action importance
✅ Test on real devices (simulator doesn't have haptics)
✅ Use `success` for positive completions
✅ Use `epic` sparingly for truly special moments

### DON'T:
❌ Overuse heavy or epic haptics (causes fatigue)
❌ Use haptics for every animation frame
❌ Forget to make haptics async with `await`
❌ Block UI waiting for haptics to complete

## Current Implementation

### ✅ Implemented:
- Button component (all variants)
- Habit toggles (success on complete, light on undo)
- Quest claim (success + heavy combo)
- Level up (epic haptic with 500ms vibration)
- XP gain (medium haptic)

### 🔄 Coming Soon:
- Skill practice logging
- Journal save
- Calendar events
- Financial transactions
- Settings toggles
- Modal opens/closes

## Testing

### Web Browser:
- Haptics will fail silently (no vibration support)
- Check console for "Haptics not available" debug messages

### iOS Simulator:
- No haptic feedback in simulator
- Must test on physical device (iPhone 8+ for Taptic Engine)

### Physical Device:
1. Build app with Capacitor
2. Deploy to device
3. Ensure haptics are enabled in Settings
4. Test each interaction

## Troubleshooting

**Haptics not working?**
1. Check if device supports haptics (iPhone 8+, most Android)
2. Verify haptics are enabled in app settings
3. Check device is not in silent mode (iOS)
4. Ensure `@capacitor/haptics` is installed
5. Check console for error messages

**Haptics feel too weak/strong?**
- Adjust haptic intensity in code (light/medium/heavy)
- Check device haptic settings (iOS Settings > Sounds & Haptics)

## File Structure

```
src/
  utils/
    haptics.js              # Main haptics utility
  components/
    ui/
      Button.jsx            # Button with haptic support
    settings/
      HapticsSettings.jsx   # Settings toggle component
  pages/
    DashboardNew.jsx        # Level up haptics
    HabitsNew.jsx           # Habit completion haptics
  features/
    quests/
      QuestClaimModal.tsx   # Quest claim haptics
```

## Further Reading

- [Capacitor Haptics API](https://capacitorjs.com/docs/apis/haptics)
- [iOS Human Interface Guidelines - Haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics)
- [Android Haptic Feedback](https://developer.android.com/develop/ui/views/haptics)
