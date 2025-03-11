import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Support = () => {
  return (
    <div className="content-container max-w-4xl">
      <h1 className="text-3xl font-medium mb-6">Support</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you have any questions or need assistance, please contact us at:
            <a href="mailto:support@example.com" className="text-primary hover:underline block">support@example.com</a>
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Here are some frequently asked questions:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>How do I play the game?</li>
            <li>What are the different difficulty levels?</li>
            <li>Can I save my progress?</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Why Support Us?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your support helps us to improve the app and build new puzzle games.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Follow Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Stay up to date with the latest news and updates:
          </p>
          <ul className="list-none pl-0 mt-2">
            <li><a href="#" className="text-primary hover:underline">Twitter</a></li>
            <li><a href="#" className="text-primary hover:underline">Facebook</a></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
