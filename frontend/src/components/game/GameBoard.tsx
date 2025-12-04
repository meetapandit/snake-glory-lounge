import { GameState } from '@/types/game';
import { GRID_SIZE, CELL_SIZE } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  isSpectator?: boolean;
}

export function GameBoard({ gameState, isSpectator = false }: GameBoardProps) {
  const { snake, food, mode } = gameState;
  const boardSize = GRID_SIZE * CELL_SIZE;

  return (
    <div className="relative">
      {/* Grid container */}
      <div
        className={cn(
          "relative border-2 rounded-lg overflow-hidden",
          mode === 'walls' ? "border-destructive/50" : "border-secondary/50",
          isSpectator && "opacity-90"
        )}
        style={{
          width: boardSize,
          height: boardSize,
          background: 'hsl(var(--card))',
          boxShadow: mode === 'walls' 
            ? '0 0 30px hsl(var(--destructive) / 0.2), inset 0 0 30px hsl(var(--destructive) / 0.05)'
            : '0 0 30px hsl(var(--secondary) / 0.2), inset 0 0 30px hsl(var(--secondary) / 0.05)',
        }}
      >
        {/* Grid lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />

        {/* Food */}
        <div
          className="absolute rounded-full transition-all duration-100"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
            background: 'hsl(var(--food))',
            boxShadow: '0 0 15px hsl(var(--food) / 0.8), 0 0 30px hsl(var(--food) / 0.4)',
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={index}
              className="absolute transition-all duration-75"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
                background: isHead 
                  ? 'hsl(var(--snake-glow))' 
                  : `hsl(var(--snake) / ${1 - index * 0.02})`,
                borderRadius: isHead ? '4px' : '2px',
                boxShadow: isHead 
                  ? '0 0 15px hsl(var(--snake) / 0.8), 0 0 30px hsl(var(--snake) / 0.4)'
                  : '0 0 5px hsl(var(--snake) / 0.3)',
              }}
            />
          );
        })}

        {/* Scanlines effect */}
        <div className="absolute inset-0 scanlines pointer-events-none" />
      </div>

      {/* Mode indicator */}
      <div className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-arcade",
        mode === 'walls' 
          ? "bg-destructive/20 text-destructive border border-destructive/30" 
          : "bg-secondary/20 text-secondary border border-secondary/30"
      )}>
        {mode === 'walls' ? '🧱 WALLS' : '🔄 PASS-THROUGH'}
      </div>
    </div>
  );
}
