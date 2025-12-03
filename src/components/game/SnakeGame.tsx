import { useSnakeGame } from '@/hooks/useSnakeGame';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useEffect } from 'react';

export function SnakeGame() {
  const { gameState, startGame, pauseGame, resetGame, changeMode } = useSnakeGame('walls');
  const { isAuthenticated, user } = useAuthContext();

  // Submit score when game ends
  useEffect(() => {
    if (gameState.status === 'game-over' && gameState.score > 0 && isAuthenticated) {
      api.submitScore(gameState.score, gameState.mode);
    }
  }, [gameState.status, gameState.score, gameState.mode, isAuthenticated]);

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
      <GameBoard gameState={gameState} />
      <div className="flex flex-col items-center gap-6">
        {isAuthenticated && user && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Playing as</div>
            <div className="text-primary font-arcade text-sm">{user.username}</div>
          </div>
        )}
        <GameControls
          gameState={gameState}
          onStart={startGame}
          onPause={pauseGame}
          onReset={resetGame}
          onModeChange={changeMode}
        />
      </div>
    </div>
  );
}
