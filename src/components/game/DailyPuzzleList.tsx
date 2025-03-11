
import React from 'react';
import { Calendar, CheckCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isDailyCompleted, formatTime } from '@/utils/storage';
import { format, subDays } from 'date-fns';

interface DailyPuzzleListProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

const DailyPuzzleList: React.FC<DailyPuzzleListProps> = ({ onSelectDate, selectedDate }) => {
  const today = new Date();
  
  // Generate the list of dates (today and past 6 days)
  const dates = Array.from({ length: 7 }, (_, i) => 
    subDays(today, i)
  );
  
  return (
    <div className="max-w-md mx-auto">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="daily">This Week</TabsTrigger>
          <TabsTrigger value="recent">Previous Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2 text-center">
            Play today's challenge or catch up on this week's puzzles
          </p>
          
          <Card className="p-4">
            {dates.slice(0, 3).map((date) => (
              <ChallengeRow
                key={format(date, 'yyyy-MM-dd')}
                date={date}
                isToday={format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')}
                isSelected={format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')}
                isCompleted={isDailyCompleted(date)}
                onSelect={() => onSelectDate(date)}
              />
            ))}
          </Card>
          
          <Card className="p-4">
            {dates.slice(3, 7).map((date) => (
              <ChallengeRow
                key={format(date, 'yyyy-MM-dd')}
                date={date}
                isToday={format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')}
                isSelected={format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')}
                isCompleted={isDailyCompleted(date)}
                onSelect={() => onSelectDate(date)}
              />
            ))}
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Coming soon: Browse and play challenges from previous weeks
          </p>
          
          <div className="flex justify-center">
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <Trophy className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Previous challenges will be available soon!
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ChallengeRowProps {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}

const ChallengeRow: React.FC<ChallengeRowProps> = ({ 
  date, 
  isToday, 
  isSelected, 
  isCompleted, 
  onSelect 
}) => {
  return (
    <div 
      className={`flex justify-between items-center p-3 mb-2 last:mb-0 rounded-md transition-colors cursor-pointer
        ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
          ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/70'}`}
        >
          {format(date, 'dd')}
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium">{isToday ? "Today" : format(date, 'EEEE')}</span>
          <span className="text-xs text-muted-foreground">{format(date, 'MMMM d, yyyy')}</span>
        </div>
      </div>
      
      {isCompleted ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <Calendar className="h-5 w-5 text-muted-foreground/50" />
      )}
    </div>
  );
};

export default DailyPuzzleList;
