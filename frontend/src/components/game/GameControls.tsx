import { Button } from '@/components/ui/button';
import { GameState, GameMode } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

export function GameControls({ 
  gameState, 
  onStart, 
  onPause, 
  onReset, 
  onModeChange 
}: GameControlsProps) {
  const { status, score, mode } = gameState;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score display */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground font-arcade mb-2">SCORE</div>
        <div className="text-4xl font-arcade text-primary text-glow-sm">
          {score.toString().padStart(5, '0')}
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'walls' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('walls')}
          disabled={status === 'playing'}
          className="font-arcade text-xs"
        >
          🧱 Walls
        </Button>
        <Button
          variant={mode === 'pass-through' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onModeChange('pass-through')}
          disabled={status === 'playing'}
          className="font-arcade text-xs"
        >
          🔄 Pass
        </Button>
      </div>

      {/* Game controls */}
      <div className="flex gap-3">
        {status === 'idle' || status === 'game-over' ? (
          <Button 
            onClick={onStart} 
            size="lg"
            className="font-arcade gap-2 box-glow"
          >
            <Play className="w-4 h-4" />
            {status === 'game-over' ? 'RETRY' : 'START'}
          </Button>
        ) : (
          <Button 
            onClick={onPause} 
            variant="secondary"
            size="lg"
            className="font-arcade gap-2"
          >
            {status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {status === 'paused' ? 'RESUME' : 'PAUSE'}
          </Button>
        )}
        <Button 
          onClick={onReset} 
          variant="outline"
          size="lg"
          className="font-arcade gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          RESET
        </Button>
      </div>

      {/* Status message */}
      {status === 'game-over' && (
        <div className="text-center animate-pulse">
          <div className="text-2xl font-arcade text-destructive text-glow mb-2">
            GAME OVER
          </div>
          <div className="text-sm text-muted-foreground">
            Press SPACE or START to play again
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div className="text-center text-muted-foreground text-sm">
          <p>Use ARROW KEYS or WASD to move</p>
          <p>Press SPACE to start/pause</p>
        </div>
      )}

      {status === 'paused' && (
        <div className="text-xl font-arcade text-secondary text-glow animate-pulse">
          PAUSED
        </div>
      )}
    </div>
  );
}
