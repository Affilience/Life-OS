import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeos.app',
  appName: 'LifeOS',
  webDir: 'dist',

  // Server configuration
  server: {
    // Uncomment for live reload during development:
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
  },

  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'lifeos',
    backgroundColor: '#0c0a10',
    // Handle safe areas properly
    scrollEnabled: true,
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#0c0a10',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0c0a10',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_lifeos',
      iconColor: '#8b5cf6',
      sound: 'notification.wav',
    },
  },
};

export default config;
