import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameMode, Direction } from '@/types/game';
import { createInitialState, moveSnake, getDirectionFromKey } from '@/lib/gameLogic';

export function useSnakeGame(initialMode: GameMode = 'walls') {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const gameLoopRef = useRef<number | null>(null);
  const directionQueueRef = useRef<Direction[]>([]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(prev.mode),
      status: 'playing'
    }));
    directionQueueRef.current = [];
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing'
    }));
  }, []);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    setGameState(createInitialState(gameState.mode));
    directionQueueRef.current = [];
  }, [gameState.mode]);

  const changeMode = useCallback((mode: GameMode) => {
    setGameState(createInitialState(mode));
    directionQueueRef.current = [];
  }, []);

  const changeDirection = useCallback((direction: Direction) => {
    directionQueueRef.current.push(direction);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore keyboard events when user is typing in input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      if (gameState.status === 'idle' || gameState.status === 'game-over') {
        startGame();
      } else {
        pauseGame();
      }
      return;
    }

    const direction = getDirectionFromKey(e.key);
    if (direction) {
      e.preventDefault();
      changeDirection(direction);
    }
  }, [gameState.status, startGame, pauseGame, changeDirection]);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    let lastTime = 0;
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTime >= gameState.speed) {
        lastTime = timestamp;

        const nextDirection = directionQueueRef.current.shift();
        setGameState(prev => moveSnake(prev, nextDirection));
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed]);

  // Keyboard controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    changeMode,
    changeDirection,
  };
}
