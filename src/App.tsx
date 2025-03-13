import React, { useEffect, useState } from 'react';
import './App.css';

interface AppProps {
  children?: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      {isOffline && (
        <div className="network-banner">
          You are currently offline. Some features may be unavailable.
        </div>
      )}
      <header className="app-header">
        <div className="app-meta">
          <span>Version: 1.0.0</span>
          <span>Last Updated: {new Date().toLocaleDateString()}</span>
        </div>
      </header>
      <main className="app-content">{children}</main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} The Hashi Puzzle. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
