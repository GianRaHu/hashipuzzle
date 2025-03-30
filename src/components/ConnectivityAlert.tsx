
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { NetworkIcon } from 'lucide-react';

interface ConnectivityAlertProps {
  onContinue: () => void;
  onContinueToPlay: () => void;
}

const ConnectivityAlert: React.FC<ConnectivityAlertProps> = ({ onContinue, onContinueToPlay }) => {
  return (
    <Alert className="w-full max-w-md mx-auto my-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" variant="default">
      <NetworkIcon className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-700 dark:text-yellow-400">All islands must be connected</AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground">
        <p className="mb-3">
          In Hashi, all islands must be connected to each other through bridges. Currently, you have the correct number
          of bridges on each island, but some islands are isolated from others.
        </p>
        <div className="flex space-x-2 mt-2">
          <Button variant="outline" size="sm" onClick={onContinueToPlay}>
            Continue playing
          </Button>
          <Button variant="default" size="sm" onClick={onContinue}>
            Continue anyway
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectivityAlert;
