import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DifficultyContinueCard from '@/components/DifficultyContinueCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hashi</h1>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => navigate('/stats')}>
            Stats
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DifficultyContinueCard
          difficulty="easy"
          title="Easy Mode"
          description="Perfect for beginners. 7x7 grid with simple connections."
        />

        <DifficultyContinueCard
          difficulty="medium"
          title="Medium Mode"
          description="A balanced challenge. 8x8 grid with moderate complexity."
        />

        <DifficultyContinueCard
          difficulty="hard"
          title="Hard Mode"
          description="For experienced players. 9x9 grid with complex patterns."
        />
      </div>
    </div>
  );
};

export default Home;
