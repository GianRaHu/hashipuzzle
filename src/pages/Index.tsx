import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="content-container pb-24"> {/* Added more bottom padding */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Hashi Puzzle</h1>
        <p className="text-muted-foreground">Connect the islands with bridges!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="difficulty-card-easy">
          <CardHeader>
            <CardTitle>Easy</CardTitle>
            <CardDescription>Simple puzzles for beginners</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/game/easy">Play Easy</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="difficulty-card-medium">
          <CardHeader>
            <CardTitle>Medium</CardTitle>
            <CardDescription>A bit more challenging</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/game/medium">Play Medium</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="difficulty-card-hard">
          <CardHeader>
            <CardTitle>Hard</CardTitle>
            <CardDescription>For experienced players</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/game/hard">Play Hard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="difficulty-card-expert">
          <CardHeader>
            <CardTitle>Expert</CardTitle>
            <CardDescription>Difficult and complex puzzles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/game/expert">Play Expert</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="difficulty-card-master">
          <CardHeader>
            <CardTitle>Master</CardTitle>
            <CardDescription>The ultimate challenge</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/game/master">Play Master</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Challenge</CardTitle>
            <CardDescription>A new puzzle every day</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/daily">Play Daily</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          {isMobile ? "Tap" : "Click"} on islands to create bridges.
        </p>
      </div>
    </div>
  );
};

export default Index;
