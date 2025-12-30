import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

export function LiveBadge() {
  return (
    <Badge variant="live" className="flex items-center gap-1.5 px-3 py-1">
      <Circle className="h-2 w-2 fill-current" />
      <span>LIVE</span>
    </Badge>
  );
}
