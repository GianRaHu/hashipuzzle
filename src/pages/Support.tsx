
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Mail, MessageSquare, CreditCard } from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="content-container animate-fade-in page-transition">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium mb-2">Support</h1>
        <p className="text-muted-foreground">Help us make Hashi even better</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Why Support Us?
            </CardTitle>
            <CardDescription>
              Your support helps us to improve the app and build new puzzle games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As an independent team, we rely on our community to continue creating high-quality puzzles and experiences. Every contribution helps us dedicate more time to improving Hashi.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Support Options
            </CardTitle>
            <CardDescription>
              Choose how you'd like to support Hashi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              disabled
            >
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Tip Jar (Coming Soon)</span>
              </span>
              <span className="text-sm text-muted-foreground">$2+</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              disabled
            >
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Premium (Coming Soon)</span>
              </span>
              <span className="text-sm text-muted-foreground">$4.99</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Have questions or feedback?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We'd love to hear from you! Reach out with your questions, feature requests, or just to say hello.
            </p>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled
            >
              <Mail className="h-4 w-4" />
              <span>Contact (Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-16"></div>
    </div>
  );
};

export default Support;
