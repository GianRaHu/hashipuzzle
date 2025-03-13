import { toast } from '../components/Toast';

interface ServiceWorkerConfig {
  onSuccess?: () => void;
  onUpdate?: () => void;
  onError?: (error: Error) => void;
}

export async function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if ('serviceWorker' in navigator) {
    const swUrl = '/service-worker.js';
    
    try {
      const registration = await navigator.serviceWorker.register(swUrl, { 
        scope: '/' 
      });

      // Successfully registered
      registration.addEventListener('activate', () => {
        config.onSuccess?.();
        console.log('Service Worker activated');
      });

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            const updateAvailable = () => {
              toast.show({
                title: 'Update Available',
                message: 'A new version is available. Refresh to update.',
                action: {
                  label: 'Refresh',
                  onClick: () => window.location.reload()
                }
              });
            };

            config.onUpdate?.() || updateAvailable();
          }
        });
      });

      // Periodic updates check
      setInterval(async () => {
        try {
          await registration.update();
        } catch (error) {
          console.error('SW update failed:', error);
        }
      }, 1000 * 60 * 60); // Check every hour

    } catch (error) {
      console.error('SW registration failed:', error);
      config.onError?.(error as Error);
      handleSWRegistrationFailure();
    }
  }
}

function handleSWRegistrationFailure() {
  // Set fallback flag
  localStorage.setItem('swFallback', 'true');
  
  // Implement offline fallback
  if (!navigator.onLine) {
    toast.show({
      title: 'Offline Mode Limited',
      message: 'Some features may not work properly offline.',
      type: 'warning'
    });
  }

  // Setup basic offline detection
  window.addEventListener('online', () => {
    toast.show({
      title: 'Connected',
      message: 'Back online',
      type: 'success'
    });
  });

  window.addEventListener('offline', () => {
    toast.show({
      title: 'Disconnected',
      message: 'You are offline',
      type: 'warning'
    });
  });
}
