import { useState } from 'react';
import { SnakeGame } from '@/components/game/SnakeGame';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SpectatorMode } from '@/components/spectator/SpectatorMode';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

type View = 'game' | 'leaderboard' | 'spectate';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('game');
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleSwitchToSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLoginClick={() => setLoginOpen(true)} 
        onSignupClick={() => setSignupOpen(true)} 
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Navigation tabs */}
        <nav className="flex justify-center gap-2 mb-8">
          <Button
            variant={currentView === 'game' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('game')}
            className={cn(
              "font-arcade text-xs gap-2",
              currentView === 'game' && "box-glow"
            )}
          >
            <Gamepad2 className="w-4 h-4" />
            PLAY
          </Button>
          <Button
            variant={currentView === 'leaderboard' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentView('leaderboard')}
            className={cn(
              "font-arcade text-xs gap-2",
              currentView === 'leaderboard' && "box-glow-cyan"
            )}
          >
            <Trophy className="w-4 h-4" />
            LEADERBOARD
          </Button>
          <Button
            variant={currentView === 'spectate' ? 'outline' : 'ghost'}
            onClick={() => setCurrentView('spectate')}
            className="font-arcade text-xs gap-2"
          >
            <Eye className="w-4 h-4" />
            SPECTATE
          </Button>
        </nav>

        {/* Content area */}
        <div className="flex justify-center">
          {currentView === 'game' && <SnakeGame />}
          {currentView === 'leaderboard' && <Leaderboard />}
          {currentView === 'spectate' && (
            <SpectatorMode onBack={() => setCurrentView('game')} />
          )}
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>Use ARROW KEYS or WASD to control • SPACE to pause</p>
          <p className="mt-1">🐍 Snake Game - Multiplayer Ready</p>
        </div>
      </footer>

      {/* Auth modals */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupModal
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default Index;
