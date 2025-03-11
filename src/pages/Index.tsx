
import React from 'react';
import DifficultySelector from '../components/DifficultySelector';

const Index: React.FC = () => {
  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition pb-16">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-medium mb-2">Hashi Puzzle</h1>
        <p className="text-foreground/70">Connect the islands with bridges</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <DifficultySelector />
        </div>
      </div>
      
      {/* Added bottom padding/spacer */}
      <div className="h-16"></div>
    </div>
  );
};

export default Index;
