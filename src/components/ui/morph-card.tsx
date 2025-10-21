import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface MorphCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function MorphCard({ children, className, ...props }: MorphCardProps) {
  return (
    <Card 
      className={cn(
        'transition-all duration-300 hover:shadow-lg hover:shadow-red-50',
        'border-2 border-gray-100 hover:border-red-200 group',
        'h-full flex flex-col',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

MorphCard.Header = CardHeader;
MorphCard.Title = CardTitle;
MorphCard.Content = CardContent;
