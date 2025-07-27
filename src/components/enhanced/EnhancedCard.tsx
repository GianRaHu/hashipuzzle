import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  description,
  children,
  className,
  hover = false,
  gradient = false,
  glow = false,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        {
          "cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95": hover || onClick,
          "bg-gradient-to-br from-card to-accent/30 border-primary/20": gradient,
          "shadow-elegant hover:shadow-glow": glow,
        },
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className={title || description ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  );
};

export default EnhancedCard;