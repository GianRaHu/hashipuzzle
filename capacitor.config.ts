import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gianrahu.hashipuzzle',
  appName: 'The Hashi Puzzle',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#3880ff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
