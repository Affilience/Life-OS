# Mobile App Blocking Research for LifeOS Focus Mode

## Executive Summary

Implementing a Focus Tab that blocks users from opening TikTok (and other distracting apps) on mobile is **technically feasible** but requires **native mobile development** and comes with significant platform-specific constraints.

### Quick Answer

| Platform | Feasibility | Method | Difficulty |
|----------|-------------|--------|------------|
| **iOS** | ✅ Possible | Screen Time API (FamilyControls + ManagedSettings) | Medium-High |
| **Android** | ✅ Possible | AccessibilityService + Overlay or UsageStats + Foreground Detection | Medium |
| **React Native** | ⚠️ Limited | Requires native modules, iOS restrictions remain | High |
| **Web/PWA** | ❌ Not Possible | Browser security prevents blocking other apps | N/A |

---

## iOS App Blocking

### The Technology: Screen Time API

Apple introduced the Screen Time API in iOS 15, consisting of three frameworks:

1. **FamilyControls** - Handles authorization and app selection
2. **ManagedSettings** - Applies the actual blocking/shielding
3. **DeviceActivity** - Controls scheduling (when blocks activate)

### How It Works

1. **Request Authorization**: User grants permission via `AuthorizationCenter`
2. **App Selection**: User picks apps to block using `FamilyActivityPicker`
3. **Shield Apps**: Selected apps are "shielded" with an overlay that prevents usage
4. **Scheduling**: Blocks can be time-based or manually triggered

### Implementation Example (Swift)

```swift
import FamilyControls
import ManagedSettings

class FocusModeManager: ObservableObject {
    @Published var blockedApps = FamilyActivitySelection()
    private let store = ManagedSettingsStore()

    // Request permission
    func requestAuthorization() async throws {
        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
    }

    // Enable blocking
    func startFocusSession() {
        store.shield.applications = blockedApps.applicationTokens
        store.shield.applicationCategories = .specific(blockedApps.categoryTokens)
    }

    // Disable blocking
    func endFocusSession() {
        store.clearAllSettings()
    }
}
```

### Critical Requirements

1. **Apple Entitlement Approval**
   - Must request FamilyControls entitlement from Apple
   - Submit via: https://developer.apple.com/contact/request/family-controls-distribution
   - Approval can take **2+ weeks** after app is already approved
   - Each extension (DeviceActivity, ShieldConfiguration) needs separate approval

2. **App Groups**
   - Required for data persistence between main app and extensions
   - Must be configured in Xcode capabilities

3. **Real Device Testing**
   - Screen Time API does not work in iOS Simulator
   - Must test on physical devices

### Limitations

- ❌ Cannot target specific apps by name (TikTok) - user must select from picker
- ❌ Apps are represented by opaque "tokens" for privacy
- ❌ Known bugs: tokens can randomly change, requiring re-selection
- ❌ Limited documentation from Apple
- ❌ Requires iOS 15+ (16+ for best features)

### References
- [Apple FamilyControls Documentation](https://developer.apple.com/documentation/familycontrols)
- [Screen Time API Developer Guide](https://medium.com/@juliusbrussee/a-developers-guide-to-apple-s-screen-time-apis-familycontrols-managedsettings-deviceactivity-e660147367d7)
- [iOS App Blocker Tutorial](https://medium.com/@jc_builds/building-a-powerful-ios-app-blocker-with-screen-time-apis-the-complete-guide-f6272bd00fc4)
- [Screen Time API Issues (2024)](https://riedel.wtf/state-of-the-screen-time-api-2024/)

---

## Android App Blocking

### Available Methods

#### Method 1: AccessibilityService (Recommended)

**How it works:**
1. User enables your Accessibility Service in Settings
2. Service monitors `TYPE_WINDOW_STATE_CHANGED` events
3. When a blocked app comes to foreground, redirect user away

**Pros:**
- Real-time detection
- No polling required
- Works on Android 2.2+ through 7.1+

**Cons:**
- User must manually enable in Settings
- Google Play scrutinizes accessibility permission usage
- Events can occasionally arrive out-of-order

**Implementation:**
```kotlin
class AppBlockerService : AccessibilityService() {
    private val blockedPackages = setOf("com.zhiliaoapp.musically") // TikTok

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString()
            if (packageName in blockedPackages) {
                // Launch blocking overlay or redirect to home
                redirectToBlockScreen()
            }
        }
    }

    private fun redirectToBlockScreen() {
        val intent = Intent(this, BlockedAppActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
    }
}
```

#### Method 2: UsageStatsManager + Polling

**How it works:**
1. Request `PACKAGE_USAGE_STATS` permission
2. Periodically query foreground app
3. Launch overlay when blocked app detected

**Pros:**
- More accepted by Google Play
- Simpler permission model

**Cons:**
- Data is delayed (not real-time)
- Requires background service with polling
- Battery impact from continuous monitoring

#### Method 3: Overlay Window

**How it works:**
- Use `TYPE_ACCESSIBILITY_OVERLAY` to draw on top of blocked apps
- Prevents interaction with the underlying app

```kotlin
val params = WindowManager.LayoutParams(
    WindowManager.LayoutParams.MATCH_PARENT,
    WindowManager.LayoutParams.MATCH_PARENT,
    WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
    PixelFormat.TRANSLUCENT
)
windowManager.addView(blockingView, params)
```

### Required Permissions

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
    tools:ignore="ProtectedPermissions"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

<service
    android:name=".AppBlockerService"
    android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
    <intent-filter>
        <action android:name="android.accessibilityservice.AccessibilityService"/>
    </intent-filter>
    <meta-data
        android:name="android.accessibilityservice"
        android:resource="@xml/accessibility_config"/>
</service>
```

### Google Play Considerations

- Accessibility services are heavily scrutinized
- Must clearly explain why the permission is needed
- Must only collect data relevant to the feature
- Misuse can result in app removal from Play Store

### References
- [Android UsageStatsManager](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- [Foreground Activity Detection](https://github.com/ngdathd/ForegroundActivity)
- [Stack Overflow: Blocking Apps Programmatically](https://stackoverflow.com/questions/19852069/blocking-android-apps-programmatically)

---

## How Popular Apps Do It

### Opal (iOS)
- Initially used VPN to block internet access to apps
- Now uses Apple's Screen Time API (ManagedSettings) since iOS 16
- Apps are removed from Home Screen during focus sessions
- Premium: $99/year or $399 lifetime

### Freedom (Cross-platform)
- Uses VPN profile to block apps and websites
- Syncs across iOS, Android, Windows, Mac, Chrome
- VPN approach has conflicts with other VPN services
- Premium: $39.99/year

### one sec (iOS)
- Uses Screen Time API for app blocking
- Adds "friction" (breathing exercises) before opening apps
- Developer has documented many API bugs

### AppBlock (Android)
- Uses AccessibilityService for app blocking
- Supports time, location, and Wi-Fi-based schedules
- Free with premium features

---

## Recommended Implementation for LifeOS

### Phase 1: Gamified Focus Mode (Web + Mobile)

Regardless of platform, implement a focus mode that:

1. **Tracks Focus Sessions**
   - User starts a focus session with duration
   - Earn XP/credits for completing sessions
   - Streak bonuses for consecutive days

2. **Distraction Logging**
   - User self-reports when they get distracted
   - Lose points for breaking focus
   - Analytics show distraction patterns

3. **Focus Challenges**
   - "Complete 4 deep work sessions today"
   - Weekly challenges with rewards

### Phase 2: Native Mobile Implementation

#### For iOS (Swift/SwiftUI)
1. Request FamilyControls entitlement from Apple early
2. Implement Screen Time API integration
3. Let users select apps to block during focus
4. Sync focus sessions with LifeOS backend

#### For Android (Kotlin)
1. Implement AccessibilityService for app detection
2. Create blocking overlay UI
3. Handle UsageStats permission flow
4. Sync with LifeOS backend

### Phase 3: React Native Integration

If using React Native:
1. Create native modules for iOS (Swift) and Android (Kotlin)
2. Expose unified JavaScript API
3. Handle platform-specific permission flows

```javascript
// Potential React Native API
import { FocusMode } from 'lifeos-focus';

// Start focus session
await FocusMode.startSession({
  duration: 60, // minutes
  blockedApps: ['tiktok', 'instagram', 'twitter'],
  difficulty: 'deep', // can't exit early
});

// Check if app blocking is available
const canBlock = await FocusMode.isAppBlockingSupported();
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LifeOS Mobile App                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Focus Tab   │────│ Focus Store  │────│   Backend    │  │
│  │   (React)    │    │   (Zustand)  │    │  (Supabase)  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│          │                   │                              │
│          ▼                   ▼                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Native Bridge (React Native)             │  │
│  └──────────────────────────────────────────────────────┘  │
│          │                               │                  │
│          ▼                               ▼                  │
│  ┌──────────────────┐          ┌──────────────────┐       │
│  │   iOS Native     │          │  Android Native  │       │
│  │                  │          │                  │       │
│  │  FamilyControls  │          │ AccessibilityService│    │
│  │  ManagedSettings │          │ UsageStatsManager│       │
│  │  DeviceActivity  │          │ Overlay Window   │       │
│  └──────────────────┘          └──────────────────┘       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Timeline & Effort Estimate

| Task | Effort | Notes |
|------|--------|-------|
| Gamified Focus Tab (Web) | 1-2 weeks | Timer, XP rewards, analytics |
| iOS Screen Time Integration | 2-3 weeks | Plus Apple approval time |
| Android App Blocking | 2-3 weeks | AccessibilityService setup |
| React Native Bridge | 1-2 weeks | If using RN |
| Testing & Polish | 1-2 weeks | Real device testing required |

**Total: 7-12 weeks** for full native app blocking on both platforms

---

## Conclusion

Implementing a Focus Tab with app blocking for LifeOS is achievable but requires:

1. **Native development** - Cannot be done in web/PWA alone
2. **Platform-specific code** - iOS and Android use completely different APIs
3. **Special permissions** - Both platforms require user consent for these features
4. **Apple approval** - iOS requires entitlement approval that can take weeks

**Recommendation**: Start with Phase 1 (gamified focus mode) as it works everywhere and provides immediate value. Then add native app blocking as the mobile app matures.

---

## Sources

### iOS
- [Apple FamilyControls Documentation](https://developer.apple.com/documentation/familycontrols)
- [iOS App Blocker Tutorial (Medium)](https://medium.com/@jc_builds/building-a-powerful-ios-app-blocker-with-screen-time-apis-the-complete-guide-f6272bd00fc4)
- [Developer Guide to Screen Time APIs](https://medium.com/@juliusbrussee/a-developers-guide-to-apple-s-screen-time-apis-familycontrols-managedsettings-deviceactivity-e660147367d7)
- [State of Screen Time API 2024](https://riedel.wtf/state-of-the-screen-time-api-2024/)
- [Using Screen Time API (pedroesli.com)](http://pedroesli.com/2023-11-13-screen-time-api/)

### Android
- [Android UsageStatsManager Reference](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- [Foreground Activity Detection GitHub](https://github.com/ngdathd/ForegroundActivity)
- [Stack Overflow: Blocking Apps](https://stackoverflow.com/questions/19852069/blocking-android-apps-programmatically)
- [Stack Overflow: Foreground Activity from Service](https://stackoverflow.com/questions/3873659/android-how-can-i-get-the-current-foreground-activity-from-a-service)

### Industry Apps
- [Opal - Screen Time App](https://www.opal.so/)
- [Freedom vs Opal vs BlockSite Comparison](https://freedom.to/blog/freedom-vs-opal-vs-blocksite-which-one-should-you-choose/)
- [AppBlock for Android](https://play.google.com/store/apps/details?id=cz.mobilesoft.appblock)
- [TechCrunch: Opal Screen Time App](https://techcrunch.com/2022/09/15/opal-revamps-its-screen-time-app-to-help-anyone-not-just-parents-with-kids-focus-and-avoid-distractions/)
