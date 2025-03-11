
import React from 'react';
import { 
  HeartHandshake, 
  Coffee, 
  DollarSign, 
  ArrowRight, 
  CreditCard, 
  BadgeCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const Support: React.FC = () => {
  const handleSupport = (amount: string) => {
    // In a real app, this would open a payment provider
    alert(`Thank you for your support! You selected: ${amount}`);
  };

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition scrollable-container">
      <div className="text-center mb-8">
        <HeartHandshake className="h-12 w-12 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-medium mb-2">Support Hashi Puzzle</h1>
        <p className="text-foreground/70 max-w-md mx-auto">
          Our puzzle game is completely free without ads. If you enjoy playing, consider supporting our work.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coffee className="h-5 w-5 mr-2" />
              Coffee
            </CardTitle>
            <CardDescription>
              A small token of appreciation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$3</div>
            <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSupport('Coffee ($3)')} 
              className="w-full"
              variant="outline"
            >
              Buy me a coffee
            </Button>
          </CardFooter>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-primary/10 rounded-full h-24 w-24 blur-xl" />
        </Card>
        
        <Card className="relative overflow-hidden border-primary">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg">
            Popular
          </div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Fan
            </CardTitle>
            <CardDescription>
              Support continued development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$10</div>
            <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSupport('Fan ($10)')} 
              className="w-full"
            >
              Become a fan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-primary/20 rounded-full h-32 w-32 blur-xl" />
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgeCheck className="h-5 w-5 mr-2" />
              Sponsor
            </CardTitle>
            <CardDescription>
              For our biggest supporters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$25</div>
            <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSupport('Sponsor ($25)')} 
              className="w-full"
              variant="outline"
            >
              Become a sponsor
            </Button>
          </CardFooter>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-primary/10 rounded-full h-24 w-24 blur-xl" />
        </Card>
      </div>
      
      <div className="mt-10 bg-secondary/50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Why Support Us?</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="bg-primary/20 rounded-full p-1 mr-3 mt-1">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <span>We don't have ads or in-app purchases</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 rounded-full p-1 mr-3 mt-1">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <span>Your support helps us to improve the app and build new puzzle games</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 rounded-full p-1 mr-3 mt-1">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <span>We're a small independent team creating puzzles we love</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Support;
