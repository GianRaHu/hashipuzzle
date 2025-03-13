
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Index from './pages/Index';
import Game from './pages/Game';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import DailyChallenge from './pages/DailyChallenge';
import CustomGame from './pages/CustomGame';
import CustomGamePlay from './pages/CustomGamePlay';
import Navbar from './components/Navbar';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

// Define all application routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/play/:difficulty',
    element: <Game />,
  },
  {
    path: '/stats',
    element: <Stats />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/support',
    element: <Support />,
  },
  {
    path: '/daily',
    element: <DailyChallenge />,
  },
  {
    path: '/custom',
    element: <CustomGame />,
  },
  {
    path: '/custom-play',
    element: <CustomGamePlay />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-0 md:pt-14 pb-16 md:pb-0 min-h-screen">
          <RouterProvider router={router} />
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
