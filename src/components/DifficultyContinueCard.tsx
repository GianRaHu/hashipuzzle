
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentGame } from '@/utils/storage';
import { formatTimeAgo } from '@/lib/utils';

interface DifficultyContinueCardProps {
  difficulty: string;
  title: string;
  description: string;
}

const DifficultyContinueCard: React.FC<DifficultyContinueCardProps> = ({
  difficulty,
  title,
  description,
}) => {
  const savedGame = getCurrentGame(difficulty);
  const lastPlayed = savedGame?.lastPlayed ? new Date(savedGame.lastPlayed) : null;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        {savedGame ? (
          <>
            <Button asChild>
              <Link to={`/game/${difficulty}`}>
                Continue Game
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {lastPlayed && `Last played ${formatTimeAgo(lastPlayed)}`}
            </p>
          </>
        ) : (
          <Button asChild>
            <Link to={`/game/${difficulty}`}>
              Start Game
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DifficultyContinueCard;
