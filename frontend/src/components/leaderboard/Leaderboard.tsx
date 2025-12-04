import { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getLeaderboard(filter === 'all' ? undefined : filter).then(data => {
      setEntries(data);
      setIsLoading(false);
    });
  }, [filter]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="font-arcade text-2xl text-secondary text-glow-sm mb-2">
          LEADERBOARD
        </h2>
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="font-arcade text-xs"
          >
            ALL
          </Button>
          <Button
            size="sm"
            variant={filter === 'walls' ? 'default' : 'outline'}
            onClick={() => setFilter('walls')}
            className="font-arcade text-xs"
          >
            🧱 WALLS
          </Button>
          <Button
            size="sm"
            variant={filter === 'pass-through' ? 'secondary' : 'outline'}
            onClick={() => setFilter('pass-through')}
            className="font-arcade text-xs"
          >
            🔄 PASS
          </Button>
        </div>
      </div>

      <div className="bg-card/50 rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No scores yet</div>
        ) : (
          <div className="divide-y divide-border">
            {entries.slice(0, 10).map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors hover:bg-muted/30",
                  index === 0 && "bg-yellow-500/5",
                  index === 1 && "bg-gray-300/5",
                  index === 2 && "bg-amber-600/5"
                )}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{entry.username}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{entry.mode === 'walls' ? '🧱' : '🔄'}</span>
                    <span>{entry.date}</span>
                  </div>
                </div>
                <div className={cn(
                  "font-arcade text-lg",
                  index === 0 ? "text-yellow-400" : "text-primary"
                )}>
                  {entry.score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
