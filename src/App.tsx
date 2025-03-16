
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameBoard } from './components/game/GameBoard';
import { BuildInfo } from './components/BuildInfo';
import Toaster from './components/Toaster';
import Index from './pages/Index';
import Game from './pages/Game';
import Home from './pages/Home';
import Custom from './pages/Custom';
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
      
      <Router>
        <header className="app-header">
          <BuildInfo buildTime="2025-03-13 14:42:51" author="GianRaHu" />
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/game" element={<GameBoard />} />
            <Route path="/game/:difficulty" element={<Game />} />
            <Route path="/daily" element={<Game />} />
            <Route path="/custom" element={<Custom />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>© 2025 The Hashi Puzzle. All rights reserved.</p>
        </footer>
        
        <Toaster />
      </Router>
    </div>
  );
};

export default App;
