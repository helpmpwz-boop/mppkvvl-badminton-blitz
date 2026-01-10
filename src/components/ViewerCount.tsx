import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewerCountProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ViewerCount({ count, className, size = 'md' }: ViewerCountProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-primary/10 border border-primary/20 font-medium',
        sizeClasses[size],
        className
      )}
    >
      <Eye className={cn(iconSizes[size], 'text-primary')} />
      <span className="text-foreground">{count.toLocaleString()}</span>
      <span className="text-muted-foreground">watching</span>
    </div>
  );
}
