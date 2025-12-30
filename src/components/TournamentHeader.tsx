import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trophy, ClipboardList, LayoutDashboard, UserPlus, Monitor } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Live Dashboard', icon: LayoutDashboard },
  { path: '/register', label: 'Register', icon: UserPlus },
  { path: '/scoreboard', label: 'Scoreboard', icon: Monitor },
  { path: '/admin', label: 'Admin', icon: ClipboardList },
];

export function TournamentHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-primary p-2 rounded-full">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold text-gradient leading-none">
                MPPKVVCL INDORE
              </h1>
              <p className="text-xs text-muted-foreground font-body tracking-wider">
                BADMINTON TOURNAMENT
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
