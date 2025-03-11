
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDailyCompleted, formatDate } from '@/utils/storage';
import { format, subDays } from 'date-fns';

interface DailyPuzzleListProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

const DailyPuzzleList: React.FC<DailyPuzzleListProps> = ({ onSelectDate, selectedDate }) => {
  const navigate = useNavigate();
  const today = new Date();
  
  // Generate the list of dates (today and past 6 days)
  const dates = Array.from({ length: 7 }, (_, i) => 
    subDays(today, i)
  );
  
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Daily Challenges</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">
        Choose a daily challenge from today or the past week
      </p>
      
      <div className="space-y-3">
        {dates.map((date) => {
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isCompleted = isDailyCompleted(date);
          
          return (
            <Button
              key={format(date, 'yyyy-MM-dd')}
              variant={isSelected ? "default" : "outline"}
              className="w-full justify-between group relative overflow-hidden"
              onClick={() => onSelectDate(date)}
            >
              <span className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{isToday ? "Today" : format(date, 'EEEE, MMMM do')}</span>
              </span>
              
              <div className="flex items-center space-x-2">
                {isCompleted && (
                  <span className="flex items-center text-green-500 text-xs">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                )}
              </div>
              
              {isSelected && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyPuzzleList;
