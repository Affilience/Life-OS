# Capacitor.js iOS Deployment Guide for LifeOS

> **Purpose**: This is a comprehensive guide for wrapping the LifeOS React/Vite application as a native iOS app using Capacitor.js. It covers everything from initial setup to App Store submission, with a focus on getting approved on the first try.

> **Last Updated**: December 2025

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initial Capacitor Setup](#2-initial-capacitor-setup)
3. [iOS Project Configuration](#3-ios-project-configuration)
4. [Apple Developer Account Setup](#4-apple-developer-account-setup)
5. [Certificates and Provisioning Profiles](#5-certificates-and-provisioning-profiles)
6. [Native Integrations](#6-native-integrations)
   - [Push Notifications](#61-push-notifications)
   - [Local Notifications](#62-local-notifications)
   - [HealthKit Integration](#63-healthkit-integration)
   - [Calendar Integration](#64-calendar-integration)
   - [Biometric Authentication](#65-biometric-authentication)
   - [Secure Storage](#66-secure-storage)
   - [Haptics](#67-haptics)
   - [Status Bar & Safe Area](#68-status-bar--safe-area)
   - [App Badge](#69-app-badge)
   - [Deep Linking / Universal Links](#610-deep-linking--universal-links)
7. [App Assets](#7-app-assets)
8. [Privacy & Compliance](#8-privacy--compliance)
9. [Testing with TestFlight](#9-testing-with-testflight)
10. [App Store Submission](#10-app-store-submission)
11. [Common Rejection Reasons & Prevention](#11-common-rejection-reasons--prevention)
12. [Quick Reference Checklists](#12-quick-reference-checklists)

---

## 1. Prerequisites

### Hardware Requirements
- **Mac computer** (required for iOS development)
- Xcode 15+ installed from the Mac App Store
- macOS Sonoma 14.0+ recommended

### Software Requirements
```bash
# Verify Node.js (v18+ recommended)
node --version

# Verify npm
npm --version

# Install Xcode Command Line Tools
xcode-select --install

# Verify CocoaPods
sudo gem install cocoapods
pod --version
```

### Account Requirements
- **Apple Developer Account** ($99/year) - Required for:
  - App Store distribution
  - Push notifications
  - TestFlight beta testing
  - HealthKit integration
  - Signing certificates

### LifeOS-Specific Considerations
Since LifeOS is a productivity/health tracking app, you'll need:
- HealthKit entitlement (for health data)
- Calendar access (for time blocking features)
- Push notification capability
- Background refresh capability

---

## 2. Initial Capacitor Setup

### Step 1: Install Capacitor Core Packages

```bash
cd /home/taylor/projects/LifeOS/lifeos-frontend

# Install Capacitor core and CLI
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init
```

When prompted:
- **App name**: `LifeOS` (or `Quanta` if using that branding)
- **App ID**: `com.yourname.lifeos` (use reverse domain notation)

### Step 2: Configure capacitor.config.ts

Create or update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.lifeos',
  appName: 'LifeOS',
  webDir: 'dist',

  // Server configuration for development
  server: {
    // Enable this for live reload during development
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true,
    androidScheme: 'https',
  },

  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'LifeOS',
    // Enable this if you need to handle HTTP in development
    // allowsLinkPreview: true,
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#0c0a10', // LifeOS dark background
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0c0a10',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#8b5cf6', // LifeOS purple
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

### Step 3: Update Vite Configuration

Ensure `vite.config.js` is compatible with Capacitor:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Important: Set base to './' for Capacitor
  base: './',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure assets use relative paths
    assetsInlineLimit: 0,
  },

  server: {
    host: true, // Allow external access for device testing
    port: 5173,
  },
});
```

### Step 4: Build and Add iOS Platform

```bash
# Build the web app
npm run build

# Install iOS platform package
npm install @capacitor/ios

# Add iOS platform
npx cap add ios

# Sync web code to iOS
npx cap sync ios
```

### Step 5: Open in Xcode

```bash
npx cap open ios
```

---

## 3. iOS Project Configuration

### Bundle Identifier

In Xcode:
1. Select the project in the navigator
2. Select the App target
3. Go to **Signing & Capabilities**
4. Set Bundle Identifier: `com.yourname.lifeos`

### Deployment Target

Set minimum iOS version (recommended: iOS 14.5+):
1. Select project in navigator
2. Go to **Build Settings**
3. Find "iOS Deployment Target"
4. Set to `14.5` or higher

### Info.plist Configuration

Add these keys to `ios/App/App/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- App Transport Security (if needed for dev) -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
    </dict>

    <!-- Face ID Usage -->
    <key>NSFaceIDUsageDescription</key>
    <string>LifeOS uses Face ID to securely log you in and protect your personal data.</string>

    <!-- Health Kit -->
    <key>NSHealthShareUsageDescription</key>
    <string>LifeOS reads your health data to provide insights and track your fitness progress.</string>
    <key>NSHealthUpdateUsageDescription</key>
    <string>LifeOS writes workout and health data to help you track your fitness journey.</string>

    <!-- Calendar -->
    <key>NSCalendarsUsageDescription</key>
    <string>LifeOS accesses your calendar to sync events and help with time blocking.</string>

    <!-- Reminders (if using reminder features) -->
    <key>NSRemindersUsageDescription</key>
    <string>LifeOS uses reminders to help you stay on track with your goals.</string>

    <!-- Camera (if using for journal photos, etc.) -->
    <key>NSCameraUsageDescription</key>
    <string>LifeOS uses your camera to add photos to journal entries and track progress.</string>

    <!-- Photo Library -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>LifeOS accesses your photo library to add images to journal entries.</string>

    <!-- Notifications -->
    <key>NSUserNotificationsUsageDescription</key>
    <string>LifeOS sends notifications for reminders, habit tracking, and goal achievements.</string>

    <!-- Background Modes -->
    <key>UIBackgroundModes</key>
    <array>
        <string>remote-notification</string>
        <string>fetch</string>
    </array>

    <!-- Status Bar -->
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <true/>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
</dict>
</plist>
```

### Adding Capabilities in Xcode

In Xcode, go to **Signing & Capabilities** and add:

1. **Push Notifications** - For remote notifications
2. **HealthKit** - For health data access
3. **Background Modes** - Check:
   - Remote notifications
   - Background fetch
4. **Associated Domains** - For deep linking (add `applinks:yourdomain.com`)
5. **Keychain Sharing** - For secure credential storage (optional)

---

## 4. Apple Developer Account Setup

### Creating an Apple Developer Account

1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in with your Apple ID
3. Enroll in the Apple Developer Program ($99/year)
4. Complete identity verification (can take 24-48 hours)

### Setting Up App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: LifeOS
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.yourname.lifeos (must match Xcode)
   - **SKU**: lifeos-ios-001 (unique identifier)
   - **User Access**: Full Access

### App Information Required

Prepare these before submission:
- **App Name**: LifeOS (max 30 characters)
- **Subtitle**: Personal Operating System (max 30 characters)
- **Privacy Policy URL**: Required (must be hosted)
- **App Category**: Primary: Productivity, Secondary: Health & Fitness
- **Age Rating**: Complete the questionnaire
- **Copyright**: © 2025 Your Name
- **Support URL**: Required
- **Marketing URL**: Optional

---

## 5. Certificates and Provisioning Profiles

### Understanding Certificate Types

| Certificate Type | Purpose |
|-----------------|---------|
| Development | Testing on registered devices during development |
| Distribution | App Store and TestFlight distribution |
| APNs Key | Push notifications (recommended over certificates) |

### Creating Certificates via Xcode (Recommended)

1. In Xcode, go to **Preferences** → **Accounts**
2. Select your Apple ID
3. Click **Manage Certificates**
4. Click **+** and select:
   - **Apple Development** (for development)
   - **Apple Distribution** (for App Store)

### Creating APNs Key (for Push Notifications)

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Keys** → **+**
4. Name: "LifeOS Push Key"
5. Enable **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register**
7. **Download the key** (you can only download it once!)
8. Note the **Key ID** displayed

### Creating App ID

1. In Apple Developer Portal → **Identifiers**
2. Click **+** → **App IDs** → **App**
3. Description: "LifeOS"
4. Bundle ID: **Explicit** → `com.yourname.lifeos`
5. Enable capabilities:
   - HealthKit
   - Push Notifications
   - Associated Domains
6. Click **Continue** → **Register**

### Creating Provisioning Profiles

#### Development Profile:
1. **Profiles** → **+**
2. Select **iOS App Development**
3. Select your App ID
4. Select your development certificate
5. Select devices to test on
6. Name: "LifeOS Development"

#### Distribution Profile:
1. **Profiles** → **+**
2. Select **App Store**
3. Select your App ID
4. Select your distribution certificate
5. Name: "LifeOS Distribution"

### Automatic vs Manual Signing

**Recommended: Use Automatic Signing in Xcode**

In Xcode → Target → Signing & Capabilities:
- Check **Automatically manage signing**
- Select your Team

For production, you may want manual signing for more control.

---

## 6. Native Integrations

### 6.1 Push Notifications

#### Installation

```bash
npm install @capacitor/push-notifications
npx cap sync
```

#### iOS Setup

1. Ensure Push Notifications capability is added in Xcode
2. Configure in `capacitor.config.ts`:

```typescript
plugins: {
  PushNotifications: {
    presentationOptions: ['badge', 'sound', 'alert'],
  },
}
```

#### Implementation

```typescript
// src/services/pushNotifications.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initPushNotifications = async () => {
  if (Capacitor.getPlatform() !== 'web') {
    // Request permission
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // Register with APNs
      await PushNotifications.register();
    }

    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Send token to your backend
      sendTokenToServer(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration failed:', error);
    });

    // Listen for push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    // Listen for push notification action (user tapped)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action:', notification);
      // Handle deep linking based on notification data
    });
  }
};
```

#### Firebase Cloud Messaging Setup (Recommended for Backend)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add iOS app with your Bundle ID
3. Download `GoogleService-Info.plist`
4. Add to `ios/App/App/` directory
5. Upload your APNs key to Firebase:
   - Firebase Console → Project Settings → Cloud Messaging
   - iOS app configuration → Upload APNs key

### 6.2 Local Notifications

#### Installation

```bash
npm install @capacitor/local-notifications
npx cap sync
```

#### Implementation

```typescript
// src/services/localNotifications.ts
import { LocalNotifications } from '@capacitor/local-notifications';

export const scheduleHabitReminder = async (
  habitName: string,
  hour: number,
  minute: number
) => {
  // Request permission first
  const permStatus = await LocalNotifications.requestPermissions();

  if (permStatus.display === 'granted') {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Habit Reminder',
          body: `Time to ${habitName}!`,
          id: Date.now(),
          schedule: {
            on: {
              hour: hour,
              minute: minute,
            },
            repeats: true,
          },
          sound: 'default',
          actionTypeId: 'HABIT_REMINDER',
          extra: {
            habitName,
          },
        },
      ],
    });
  }
};

// Streak milestone notification
export const notifyStreakMilestone = async (
  streakName: string,
  days: number
) => {
  await LocalNotifications.schedule({
    notifications: [
      {
        title: '🔥 Streak Milestone!',
        body: `Congratulations! ${days} days of ${streakName}!`,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 1000) }, // Immediate
      },
    ],
  });
};
```

### 6.3 HealthKit Integration

#### Installation

```bash
npm install @perfood/capacitor-healthkit
# or
npm install capacitor-health
npx cap sync
```

#### Info.plist (Already covered above)

Ensure these keys are in Info.plist:
- `NSHealthShareUsageDescription`
- `NSHealthUpdateUsageDescription`

#### Enable HealthKit Capability in Xcode

1. Target → Signing & Capabilities
2. Add **HealthKit**
3. Check **Clinical Health Records** if needed

#### Implementation

```typescript
// src/services/healthKit.ts
import { HealthKit } from '@perfood/capacitor-healthkit';
import { Capacitor } from '@capacitor/core';

export const initHealthKit = async () => {
  if (Capacitor.getPlatform() !== 'ios') return;

  try {
    // Request permissions for read/write
    const result = await HealthKit.requestAuthorization({
      all: ['stepCount', 'workoutType', 'activeEnergyBurned', 'sleepAnalysis'],
      read: ['height', 'bodyMass', 'heartRate'],
      write: ['stepCount', 'workoutType'],
    });

    if (result.authorized) {
      console.log('HealthKit authorized');
    }
  } catch (error) {
    console.error('HealthKit authorization failed:', error);
  }
};

export const getTodaySteps = async (): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await HealthKit.queryQuantitySamples({
    sampleName: 'stepCount',
    startDate: today.toISOString(),
    endDate: new Date().toISOString(),
  });

  return result.data.reduce((sum, sample) => sum + sample.value, 0);
};

export const logWorkout = async (
  type: string,
  duration: number,
  calories: number
) => {
  await HealthKit.saveWorkout({
    workoutActivityType: type,
    duration: duration * 60, // seconds
    energyBurned: calories,
    startDate: new Date(Date.now() - duration * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });
};
```

### 6.4 Calendar Integration

#### Installation

```bash
npm install @ebarooni/capacitor-calendar
npx cap sync
```

#### Info.plist

```xml
<key>NSCalendarsUsageDescription</key>
<string>LifeOS accesses your calendar to sync events and help with time blocking.</string>
<key>NSRemindersUsageDescription</key>
<string>LifeOS uses reminders to help you stay on track with your goals.</string>
```

#### Implementation

```typescript
// src/services/calendar.ts
import { CapacitorCalendar } from '@ebarooni/capacitor-calendar';

export const requestCalendarPermissions = async () => {
  const result = await CapacitorCalendar.requestFullCalendarAccess();
  return result.result === 'granted';
};

export const createTimeBlockEvent = async (
  title: string,
  startDate: Date,
  endDate: Date,
  notes?: string
) => {
  const hasPermission = await requestCalendarPermissions();

  if (hasPermission) {
    await CapacitorCalendar.createEvent({
      title,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      notes,
      location: '',
    });
  }
};

export const getCalendarEvents = async (
  startDate: Date,
  endDate: Date
) => {
  const calendars = await CapacitorCalendar.listCalendars();
  // Filter and return events as needed
};
```

### 6.5 Biometric Authentication

#### Installation

```bash
npm install @aparajita/capacitor-biometric-auth
# or
npm install capacitor-native-biometric
npx cap sync
```

#### Info.plist

```xml
<key>NSFaceIDUsageDescription</key>
<string>LifeOS uses Face ID to securely log you in and protect your personal data.</string>
```

#### Implementation

```typescript
// src/services/biometrics.ts
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export const checkBiometricAvailability = async () => {
  if (Capacitor.getPlatform() === 'web') return false;

  const result = await BiometricAuth.checkBiometry();
  return result.isAvailable;
};

export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    await BiometricAuth.authenticate({
      reason: 'Please authenticate to access LifeOS',
      cancelTitle: 'Use Passcode',
      allowDeviceCredential: true,
    });
    return true;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};
```

### 6.6 Secure Storage

#### Installation

```bash
npm install @aparajita/capacitor-secure-storage
# or for simpler needs
npm install @capacitor/preferences
npx cap sync
```

#### Implementation

```typescript
// src/services/secureStorage.ts
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Preferences } from '@capacitor/preferences';

// For sensitive data (tokens, credentials)
export const saveSecureData = async (key: string, value: string) => {
  await SecureStorage.set({ key, value });
};

export const getSecureData = async (key: string): Promise<string | null> => {
  const result = await SecureStorage.get({ key });
  return result.value;
};

// For non-sensitive preferences
export const savePreference = async (key: string, value: string) => {
  await Preferences.set({ key, value });
};

export const getPreference = async (key: string): Promise<string | null> => {
  const result = await Preferences.get({ key });
  return result.value;
};
```

### 6.7 Haptics

#### Installation

```bash
npm install @capacitor/haptics
npx cap sync
```

#### Implementation

```typescript
// src/services/haptics.ts
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const hapticFeedback = {
  // Light tap for selections
  light: async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },

  // Medium tap for actions
  medium: async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },

  // Heavy tap for important actions
  heavy: async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },

  // Success notification (streak completed, achievement unlocked)
  success: async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.notification({ type: NotificationType.Success });
    }
  },

  // Warning notification
  warning: async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  },

  // Error notification
  error: async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.notification({ type: NotificationType.Error });
    }
  },
};
```

### 6.8 Status Bar & Safe Area

#### Installation

```bash
npm install @capacitor/status-bar
# Optional: For better safe area handling
npm install @capacitor-community/safe-area
npx cap sync
```

#### Implementation

```typescript
// src/services/statusBar.ts
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const configureStatusBar = async () => {
  if (Capacitor.getPlatform() === 'web') return;

  // Dark style for light text on dark background
  await StatusBar.setStyle({ style: Style.Dark });

  // Make status bar overlay content (for immersive UI)
  await StatusBar.setOverlaysWebView({ overlay: false });

  // Set background color
  await StatusBar.setBackgroundColor({ color: '#0c0a10' });
};
```

#### CSS Safe Area Handling

```css
/* In your global CSS */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

/* Apply to main container */
.app-container {
  padding-top: var(--safe-area-inset-top);
  padding-bottom: var(--safe-area-inset-bottom);
  padding-left: var(--safe-area-inset-left);
  padding-right: var(--safe-area-inset-right);
}

/* For bottom navigation */
.bottom-nav {
  padding-bottom: calc(16px + var(--safe-area-inset-bottom));
}
```

### 6.9 App Badge

#### Installation

```bash
npm install @capawesome/capacitor-badge
npx cap sync
```

#### Implementation

```typescript
// src/services/badge.ts
import { Badge } from '@capawesome/capacitor-badge';

export const updateBadgeCount = async (count: number) => {
  const hasPermission = await Badge.isSupported();
  if (hasPermission.isSupported) {
    await Badge.set({ count });
  }
};

export const clearBadge = async () => {
  await Badge.clear();
};

export const incrementBadge = async () => {
  await Badge.increase();
};
```

### 6.10 Deep Linking / Universal Links

#### Step 1: Create AASA File

Create `apple-app-site-association` (no extension) for your website:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.yourname.lifeos",
        "paths": [
          "/app/*",
          "/habit/*",
          "/journal/*",
          "/workout/*"
        ]
      }
    ]
  }
}
```

Host this at `https://yourdomain.com/.well-known/apple-app-site-association`

#### Step 2: Configure Xcode

1. Target → Signing & Capabilities
2. Add **Associated Domains**
3. Add domain: `applinks:yourdomain.com`

#### Step 3: Handle in App

```typescript
// src/App.tsx or main entry
import { App as CapApp } from '@capacitor/app';

// Set up listener for deep links
CapApp.addListener('appUrlOpen', (event) => {
  // Example: https://yourdomain.com/habit/daily-workout
  const slug = event.url.split('yourdomain.com').pop();

  if (slug) {
    // Route to appropriate screen
    if (slug.startsWith('/habit/')) {
      const habitId = slug.replace('/habit/', '');
      // Navigate to habit
      router.push(`/habits/${habitId}`);
    } else if (slug.startsWith('/journal/')) {
      // Navigate to journal entry
    }
  }
});
```

---

## 7. App Assets

### App Icon

#### Requirements
- **Size**: 1024x1024 pixels (single image, Xcode generates all sizes)
- **Format**: PNG
- **No transparency** (Apple will fill with black if transparent)
- **No rounded corners** (iOS adds these automatically)

#### Location
Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

#### Generating All Sizes

Use a tool like:
- [App Icon Generator](https://appicon.co/)
- [makeappicon.com](https://makeappicon.com/)
- Xcode's built-in icon set management

### Launch Screen / Splash Screen

#### Option 1: LaunchScreen.storyboard (Recommended)

1. In Xcode, open `ios/App/App/LaunchScreen.storyboard`
2. Design your splash screen using Interface Builder
3. Add any images to `Assets.xcassets`

#### Option 2: Simple Color Background

In `ios/App/App/Info.plist`:

```xml
<key>UILaunchScreen</key>
<dict>
    <key>UIColorName</key>
    <string>LaunchBackground</string>
    <key>UIImageName</key>
    <string>LaunchLogo</string>
</dict>
```

Then add `LaunchBackground` color and `LaunchLogo` image to Assets.xcassets.

### App Store Screenshots

#### Required Sizes (2025)

| Device | Size (Portrait) |
|--------|-----------------|
| iPhone 6.9" (required) | 1320 x 2868 or 1290 x 2796 |
| iPhone 6.7" | 1290 x 2796 |
| iPhone 6.5" | 1284 x 2778 or 1242 x 2688 |
| iPad 13" (required if universal) | 2064 x 2752 |

#### Screenshot Guidelines
- Minimum 1, maximum 10 screenshots
- Show actual app UI (no external photos)
- Can include device frames and text overlays
- First 3 screenshots most important (visible in search)

### App Preview Videos (Optional)

- 15-30 seconds
- Formats: .mov, .m4v, .mp4
- Up to 3 videos per device size
- Must show actual app footage

---

## 8. Privacy & Compliance

### Privacy Manifest (Required for 2025)

Create `PrivacyInfo.xcprivacy` in `ios/App/App/`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- User Defaults API (for @capacitor/preferences) -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
        <!-- Add other APIs as needed -->
    </array>
    <key>NSPrivacyTrackingDomains</key>
    <array>
        <!-- List any tracking domains, or leave empty -->
    </array>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <!-- List collected data types -->
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeHealthAndFitness</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

### Privacy Policy

You **must** have a privacy policy URL. Create one covering:
- What data you collect
- How you use it
- Third-party services (Supabase, Firebase, etc.)
- Data retention
- User rights (deletion, export)

### App Tracking Transparency (If Applicable)

If you track users for advertising:

```typescript
import { AppTrackingTransparency } from 'capacitor-plugin-app-tracking-transparency';

const requestTracking = async () => {
  const status = await AppTrackingTransparency.requestPermission();
  // 'authorized', 'denied', 'notDetermined', 'restricted'
};
```

Add to Info.plist:
```xml
<key>NSUserTrackingUsageDescription</key>
<string>This allows us to provide you with a personalized experience.</string>
```

### Data Protection

For LifeOS (health/productivity app), consider:
- End-to-end encryption for sensitive data
- Local-first storage with optional sync
- Clear data deletion option
- Export user data feature

---

## 9. Testing with TestFlight

### Step 1: Archive Your App

1. In Xcode, select **Product** → **Archive**
2. Wait for build to complete
3. Organizer window opens automatically

### Step 2: Upload to App Store Connect

1. In Organizer, select archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Choose **Upload**
5. Enable/disable options:
   - ✅ Upload your app's symbols
   - ✅ Manage Version and Build Number
6. Select signing method (automatic or manual)
7. Click **Upload**

### Step 3: Configure TestFlight

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **TestFlight** tab
4. Wait for build to finish processing

### Step 4: Set Up Test Information

Under TestFlight → Test Information:
- **Beta App Description**: Describe what to test
- **Feedback Email**: Where testers send feedback
- **Privacy Policy URL**: Required
- **License Agreement**: Use standard or custom

### Step 5: Add Internal Testers

1. **App Store Connect Users** section
2. Add team members (max 100)
3. They get immediate access, no review needed

### Step 6: Add External Testers

1. Create a **Group** under External Testing
2. Add build to group
3. Submit for **Beta App Review** (required first time)
4. Once approved, invite testers:
   - Via email (up to 10,000 testers)
   - Via public link

### TestFlight Expiration

- Builds expire after **90 days**
- Upload new builds before expiration
- Users auto-update to latest available build

---

## 10. App Store Submission

### Step 1: Prepare App Store Listing

In App Store Connect → App Information:

#### Required Information
- **App Name**: LifeOS (max 30 characters)
- **Subtitle**: Your Personal Operating System
- **Description**: 4,000 character max, describe features
- **Keywords**: 100 characters, comma-separated
- **Support URL**: Your support page
- **Privacy Policy URL**: Required
- **Category**: Primary + Secondary

#### Version Information
- **What's New**: Changes in this version (for updates)
- **Screenshots**: All required sizes
- **App Preview**: Optional video

#### App Review Information
- **Contact Info**: Name, phone, email for reviewer
- **Demo Account**: Login credentials for testing
- **Notes**: Special instructions for reviewers

### Step 2: Submit for Review

1. Go to your app version
2. Click **Add for Review**
3. Answer compliance questions:
   - Export compliance (encryption)
   - Content rights
   - Advertising identifier
4. Click **Submit for Review**

### Review Timeline

- **Average**: 24-48 hours
- **First submission**: May take longer
- Submit Monday-Wednesday for fastest response

### Review Outcomes

1. **Approved**: Goes live (or scheduled release)
2. **Rejected**: Review rejection reasons, fix, resubmit
3. **Metadata Rejected**: Only marketing info needs fixing

---

## 11. Common Rejection Reasons & Prevention

### 1. Privacy Violations (~36% of rejections)

**Prevention:**
- ✅ Include all required Info.plist usage descriptions
- ✅ Create complete PrivacyInfo.xcprivacy manifest
- ✅ Request permissions only when needed, with clear explanations
- ✅ Accurate App Store privacy labels
- ✅ Link to privacy policy in app and App Store

### 2. App Completeness Issues

**Prevention:**
- ✅ Remove all placeholder/lorem ipsum content
- ✅ Ensure all links work
- ✅ Don't use "beta", "demo", "test" in version numbers
- ✅ Test every feature before submission
- ✅ Provide demo account in review notes

### 3. Bugs and Crashes

**Prevention:**
- ✅ Test on multiple iOS versions
- ✅ Test on physical devices, not just simulator
- ✅ Handle network failures gracefully
- ✅ Fix memory leaks
- ✅ Test all edge cases

### 4. Design Issues

**Prevention:**
- ✅ Follow iOS Human Interface Guidelines
- ✅ Support all screen sizes
- ✅ Proper safe area handling
- ✅ Don't mimic system UI deceptively
- ✅ Consistent UI patterns

### 5. Metadata Problems

**Prevention:**
- ✅ Screenshots show actual app
- ✅ Description matches functionality
- ✅ No misleading claims
- ✅ Correct app category
- ✅ Complete age rating questionnaire accurately

### 6. In-App Purchase Issues (If Applicable)

**Prevention:**
- ✅ Use Apple's IAP for digital goods
- ✅ Clear pricing visible before purchase
- ✅ Restore purchases functionality
- ✅ Don't mention external payment methods

### 7. HealthKit Rejection (Specific to LifeOS)

**Prevention:**
- ✅ Only request health permissions you actually use
- ✅ Clear explanation of how health data is used
- ✅ Health features must add value
- ✅ Handle permission denial gracefully
- ✅ Don't share health data with third parties without consent

### 8. Performance Issues

**Prevention:**
- ✅ App launches in reasonable time
- ✅ No excessive battery drain
- ✅ Reasonable memory usage
- ✅ Works offline where appropriate

---

## 12. Quick Reference Checklists

### Pre-Submission Checklist

#### Code & Build
- [ ] Build succeeds with no errors
- [ ] All Capacitor plugins synced (`npx cap sync`)
- [ ] Production configuration (no debug flags)
- [ ] Correct version and build numbers
- [ ] All API endpoints pointing to production

#### iOS Configuration
- [ ] Correct Bundle ID
- [ ] All capabilities added
- [ ] Info.plist complete with all usage descriptions
- [ ] PrivacyInfo.xcprivacy created
- [ ] Correct deployment target

#### App Store Connect
- [ ] App created in App Store Connect
- [ ] All metadata complete
- [ ] Screenshots uploaded for all required sizes
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Age rating questionnaire complete
- [ ] Demo account credentials in review notes

#### Testing
- [ ] Tested on physical devices
- [ ] Tested on multiple iOS versions
- [ ] All features working
- [ ] No crashes or ANRs
- [ ] Network error handling tested
- [ ] Permission denial handling tested

#### Native Features
- [ ] Push notifications working
- [ ] Local notifications working
- [ ] HealthKit integration tested (if used)
- [ ] Biometrics tested
- [ ] Deep links tested

### Post-Launch Checklist

- [ ] Monitor crash reports in App Store Connect
- [ ] Respond to user reviews
- [ ] Monitor TestFlight feedback
- [ ] Plan next version
- [ ] Update screenshots for new features
- [ ] Refresh keywords periodically

---

## Commands Quick Reference

```bash
# Development workflow
npm run build && npx cap sync ios && npx cap open ios

# Just sync changes
npx cap sync ios

# Copy web assets only (faster)
npx cap copy ios

# Live reload for development
npx cap run ios --livereload --external

# Update Capacitor plugins
npm update @capacitor/core @capacitor/ios
npx cap sync

# Check for plugin updates
npm outdated

# Clean and rebuild iOS
rm -rf ios/App/Pods
rm ios/App/Podfile.lock
npx cap sync ios
```

---

## Resources

### Official Documentation
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Developer Documentation](https://developer.apple.com/documentation)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### Capacitor Plugins
- [Official Plugins](https://capacitorjs.com/docs/apis)
- [Community Plugins](https://github.com/capacitor-community)
- [Capawesome Plugins](https://capawesome.io/plugins/)

### Useful Tools
- [App Icon Generator](https://appicon.co/)
- [TestFlight](https://developer.apple.com/testflight/)
- [App Store Connect](https://appstoreconnect.apple.com)

---

## Troubleshooting

### Common Issues

#### "No signing certificate found"
```bash
# In Xcode: Preferences → Accounts → Manage Certificates
# Add or download certificates
```

#### Pod install fails
```bash
cd ios/App
pod deintegrate
pod install
```

#### Build fails after Capacitor update
```bash
npx cap sync ios --force
cd ios/App && pod update
```

#### White screen on launch
- Check `webDir` in `capacitor.config.ts` matches build output
- Verify `npm run build` completed successfully
- Check browser console in Safari dev tools

---

*This guide will be updated as Apple requirements and Capacitor features evolve.*
