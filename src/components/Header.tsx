import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthContext();

  return (
    <header className="w-full border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐍</span>
          <h1 className="font-arcade text-xl md:text-2xl text-primary text-glow-sm">
            SNAKE
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{user.username}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoginClick}
                className="font-arcade text-xs"
              >
                <LogIn className="w-4 h-4 mr-2" />
                LOG IN
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onSignupClick}
                className="font-arcade text-xs"
              >
                SIGN UP
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
