import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { initializeLovable, LOVABLE_CONFIG } from './utils/lovable';
import Index from './pages/Index';
import Game from './pages/Game';
import CustomGame from './pages/CustomGame';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { platformManager } from './utils/platform';
import { registerServiceWorker } from './utils/registerSW';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/play',
    element: <Game />,
  },
  {
    path: '/custom',
    element: <CustomGame />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/stats',
    element: <Stats />,
  }
]);

function App() {
  useEffect(() => {
    // Initialize Lovable when the app starts
    initializeLovable();
    
    // Log configuration for verification
    console.log('Lovable Configuration:', {
      username: LOVABLE_CONFIG.username,
      timestamp: LOVABLE_CONFIG.timestamp,
      projectId: LOVABLE_CONFIG.projectId
    });
  }, []);

  return <RouterProvider router={router} />;
}

// Register service worker
registerServiceWorker({
  onSuccess: () => console.log('SW registration successful'),
  onUpdate: () => console.log('New content is available; please refresh'),
  onError: (error) => console.error('SW registration failed:', error)
});

export function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        {/* Your app content */}
      </div>
    </ErrorBoundary>
  );
}
export default App;
