
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9464df3c5cea491997370a39aca6b984',
  appName: 'Hashi. The Bridge Game',
  webDir: 'dist',
  server: {
    url: 'https://9464df3c-5cea-4919-9737-0a39aca6b984.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Portrait-only smartphone configuration
  android: {
    backgroundColor: "#FFFFFF"
  },
  plugins: {
    ScreenOrientation: {
      orientation: "portrait"
    }
  }
};

export default config;
