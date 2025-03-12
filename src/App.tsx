import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Game from '@/pages/Game';
import DailyChallenge from '@/pages/DailyChallenge';
import Stats from '@/pages/Stats';
import History from '@/pages/History';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:difficulty" element={<Game />} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/history" element={<History />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
