
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameBoard } from './components/GameBoard';
import { BuildInfo } from './components/BuildInfo';
import Toaster from './components/Toaster';
import Index from './pages/Index';
import Game from './components/Game';
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
    <BrowserRouter>
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<GameBoard />} />
            <Route path="/game/:difficulty" element={<Game />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© 2025 The Hashi Puzzle. All rights reserved.</p>
        </footer>
        <Toaster />
      </div>
    </BrowserRouter>
  );
};

export default App;
