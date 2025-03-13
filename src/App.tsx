import React, { useEffect, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { BuildInfo } from './components/BuildInfo';
import './App.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate initial loading
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
        <BuildInfo buildTime="2025-03-13 14:42:51" author="GianRaHu" />
      </header>
      <main className="app-content">
        <GameBoard />
      </main>
      <footer className="app-footer">
        <p>© 2025 The Hashi Puzzle. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
