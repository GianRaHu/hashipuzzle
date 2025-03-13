import { APP_CONFIG } from '@/config/app.config';
import { initializeLovable } from './lovable';

interface AppInitOptions {
  enableServiceWorker?: boolean;
  enableLovable?: boolean;
}

export async function initializeApp(options: AppInitOptions = {}) {
  // Initialize service worker for PWA
  if (options.enableServiceWorker && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );
      console.log('SW registered:', registration);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }

  // Initialize Lovable integration
  if (options.enableLovable) {
    initializeLovable();
  }

  // Initialize storage
  initializeStorage();

  // Check device compatibility
  checkDeviceCompatibility();
}

function initializeStorage() {
  const currentVersion = localStorage.getItem(`${APP_CONFIG.storage.prefix}version`);
  
  if (!currentVersion || parseInt(currentVersion) < APP_CONFIG.storage.version) {
    // Clear old data and set new version
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(APP_CONFIG.storage.prefix)) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(
      `${APP_CONFIG.storage.prefix}version`,
      APP_CONFIG.storage.version.toString()
    );
  }
}

function checkDeviceCompatibility() {
  const requirements = {
    localStorage: !!window.localStorage,
    serviceWorker: 'serviceWorker' in navigator,
    touchEvents: 'ontouchstart' in window,
    webgl: !!document.createElement('canvas').getContext('webgl2'),
  };

  const missingFeatures = Object.entries(requirements)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  if (missingFeatures.length > 0) {
    console.warn('Missing features:', missingFeatures);
  }

  return missingFeatures.length === 0;
}
