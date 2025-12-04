import { useState, useEffect, useRef } from 'react';
import { ActivePlayer, GameState } from '@/types/game';
import api from '@/services/api';
import { GameBoard } from '@/components/game/GameBoard';
import { Button } from '@/components/ui/button';
import { Eye, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moveSnake } from '@/lib/gameLogic';

interface SpectatorModeProps {
  onBack: () => void;
}

export function SpectatorMode({ onBack }: SpectatorModeProps) {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [simulatedState, setSimulatedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const simulationRef = useRef<number | null>(null);

  // Fetch active players
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const players = await api.getActivePlayers();
      setActivePlayers(players);
      setIsLoading(false);
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate gameplay when watching a player
  useEffect(() => {
    if (!selectedPlayer) {
      setSimulatedState(null);
      return;
    }

    setSimulatedState(selectedPlayer.gameState);

    // Simulate the player's game
    const simulate = () => {
      setSimulatedState(prev => {
        if (!prev || prev.status !== 'playing') return prev;
        
        // Randomly change direction occasionally
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const;
        const shouldTurn = Math.random() < 0.1;
        const newDirection = shouldTurn 
          ? directions[Math.floor(Math.random() * 4)]
          : undefined;
        
        const newState = moveSnake(prev, newDirection);
        
        // If game over, restart with new state
        if (newState.status === 'game-over') {
          return {
            ...selectedPlayer.gameState,
            status: 'playing',
          };
        }
        
        return newState;
      });
    };

    simulationRef.current = window.setInterval(simulate, 150);

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [selectedPlayer]);

  if (selectedPlayer && simulatedState) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </Button>
          <div className="text-center">
            <div className="flex items-center gap-2 text-secondary">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Watching</span>
            </div>
            <div className="font-arcade text-lg text-primary">{selectedPlayer.username}</div>
          </div>
        </div>

        <GameBoard gameState={simulatedState} isSpectator />

        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="text-xs text-muted-foreground">SCORE</div>
            <div className="font-arcade text-2xl text-primary">{simulatedState.score}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">MODE</div>
            <div className="text-lg">
              {simulatedState.mode === 'walls' ? '🧱 Walls' : '🔄 Pass-Through'}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground animate-pulse">
          📺 Live spectating (simulated)
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="font-arcade text-xl text-accent text-glow-sm flex items-center gap-2">
            <Eye className="w-5 h-5" />
            SPECTATE
          </h2>
        </div>
        <div className="w-20" />
      </div>

      <div className="bg-card/50 rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Finding active players...
          </div>
        ) : activePlayers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No active players right now</p>
            <p className="text-xs text-muted-foreground mt-2">Check back later!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 transition-colors hover:bg-muted/30 text-left"
                )}
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{player.username}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{player.mode === 'walls' ? '🧱 Walls' : '🔄 Pass-Through'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-arcade text-primary">{player.score}</div>
                  <div className="text-xs text-muted-foreground">pts</div>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Click on a player to watch their game live
      </p>
    </div>
  );
}
