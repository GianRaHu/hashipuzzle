import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gianrahu.hashipuzzle',
  appName: 'Hashi Puzzle',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'release'
    }
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;
