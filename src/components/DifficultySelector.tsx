
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface DifficultySelectorProps {
  onSelect?: (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  const navigate = useNavigate();
  const difficulties = [
    { id: 'easy', label: 'Easy', description: 'Perfect for beginners' },
    { id: 'medium', label: 'Medium', description: 'A balanced challenge' },
    { id: 'hard', label: 'Hard', description: 'For experienced players' },
    { id: 'expert', label: 'Expert', description: 'The ultimate challenge' },
  ] as const;

  const handleSelect = (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
    console.log(`Selected difficulty: ${difficulty}`);
    if (onSelect) {
      onSelect(difficulty);
    } else {
      // Generate a seed right here that will be used consistently
      const seed = Math.floor(Math.random() * 1000000);
      navigate(`/game/${difficulty}?seed=${seed}`);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-xl font-medium text-center mb-6">Select Difficulty</h2>
      
      <div className="grid gap-3">
        {difficulties.map((difficulty) => (
          <Button
            key={difficulty.id}
            variant="outline"
            className="flex items-center justify-between px-4 py-6 h-auto text-left hover:bg-secondary/50 transition-all group"
            onClick={() => handleSelect(difficulty.id)}
          >
            <div>
              <span className="font-medium block">{difficulty.label}</span>
              <span className="text-sm text-foreground/70">{difficulty.description}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-primary/50 group-hover:text-primary transition-colors" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
