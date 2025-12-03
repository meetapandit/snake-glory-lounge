import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  getNextPosition,
  checkWallCollision,
  checkSelfCollision,
  checkFoodCollision,
  isOppositeDirection,
  moveSnake,
  getDirectionFromKey,
  GRID_SIZE,
} from './gameLogic';
import { Position, Direction, GameState } from '@/types/game';

describe('gameLogic', () => {
  describe('createInitialState', () => {
    it('creates initial state with correct mode', () => {
      const state = createInitialState('walls');
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
      expect(state.snake.length).toBe(3);
      expect(state.score).toBe(0);
    });

    it('creates pass-through mode correctly', () => {
      const state = createInitialState('pass-through');
      expect(state.mode).toBe('pass-through');
    });
  });

  describe('generateFood', () => {
    it('generates food position within grid', () => {
      const snake = [{ x: 10, y: 10 }];
      const food = generateFood(snake);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(GRID_SIZE);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(GRID_SIZE);
    });

    it('does not generate food on snake', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
        expect(isOnSnake).toBe(false);
      }
    });
  });

  describe('getNextPosition', () => {
    const head: Position = { x: 10, y: 10 };

    it('moves up correctly', () => {
      const next = getNextPosition(head, 'UP', 'walls');
      expect(next).toEqual({ x: 10, y: 9 });
    });

    it('moves down correctly', () => {
      const next = getNextPosition(head, 'DOWN', 'walls');
      expect(next).toEqual({ x: 10, y: 11 });
    });

    it('moves left correctly', () => {
      const next = getNextPosition(head, 'LEFT', 'walls');
      expect(next).toEqual({ x: 9, y: 10 });
    });

    it('moves right correctly', () => {
      const next = getNextPosition(head, 'RIGHT', 'walls');
      expect(next).toEqual({ x: 11, y: 10 });
    });

    it('wraps around in pass-through mode (left edge)', () => {
      const edgeHead: Position = { x: 0, y: 10 };
      const next = getNextPosition(edgeHead, 'LEFT', 'pass-through');
      expect(next).toEqual({ x: GRID_SIZE - 1, y: 10 });
    });

    it('wraps around in pass-through mode (right edge)', () => {
      const edgeHead: Position = { x: GRID_SIZE - 1, y: 10 };
      const next = getNextPosition(edgeHead, 'RIGHT', 'pass-through');
      expect(next).toEqual({ x: 0, y: 10 });
    });

    it('wraps around in pass-through mode (top edge)', () => {
      const edgeHead: Position = { x: 10, y: 0 };
      const next = getNextPosition(edgeHead, 'UP', 'pass-through');
      expect(next).toEqual({ x: 10, y: GRID_SIZE - 1 });
    });

    it('wraps around in pass-through mode (bottom edge)', () => {
      const edgeHead: Position = { x: 10, y: GRID_SIZE - 1 };
      const next = getNextPosition(edgeHead, 'DOWN', 'pass-through');
      expect(next).toEqual({ x: 10, y: 0 });
    });

    it('does not wrap in walls mode', () => {
      const edgeHead: Position = { x: 0, y: 10 };
      const next = getNextPosition(edgeHead, 'LEFT', 'walls');
      expect(next).toEqual({ x: -1, y: 10 });
    });
  });

  describe('checkWallCollision', () => {
    it('detects left wall collision', () => {
      expect(checkWallCollision({ x: -1, y: 10 })).toBe(true);
    });

    it('detects right wall collision', () => {
      expect(checkWallCollision({ x: GRID_SIZE, y: 10 })).toBe(true);
    });

    it('detects top wall collision', () => {
      expect(checkWallCollision({ x: 10, y: -1 })).toBe(true);
    });

    it('detects bottom wall collision', () => {
      expect(checkWallCollision({ x: 10, y: GRID_SIZE })).toBe(true);
    });

    it('returns false for valid position', () => {
      expect(checkWallCollision({ x: 10, y: 10 })).toBe(false);
    });
  });

  describe('checkSelfCollision', () => {
    it('detects self collision', () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 5, y: 5 }, // head collides with this
      ];
      // Actually the first element is head, so:
      const collidingSnake: Position[] = [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 5, y: 5 },
      ];
      expect(checkSelfCollision(collidingSnake)).toBe(true);
    });

    it('returns false for no collision', () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      expect(checkSelfCollision(snake)).toBe(false);
    });
  });

  describe('checkFoodCollision', () => {
    it('detects food collision', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 5, y: 5 };
      expect(checkFoodCollision(head, food)).toBe(true);
    });

    it('returns false when not colliding', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 10, y: 10 };
      expect(checkFoodCollision(head, food)).toBe(false);
    });
  });

  describe('isOppositeDirection', () => {
    it('UP and DOWN are opposite', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
    });

    it('LEFT and RIGHT are opposite', () => {
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('same directions are not opposite', () => {
      expect(isOppositeDirection('UP', 'UP')).toBe(false);
    });

    it('perpendicular directions are not opposite', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
    });
  });

  describe('moveSnake', () => {
    it('moves snake correctly', () => {
      const state = createInitialState('walls');
      state.status = 'playing';
      state.food = { x: 0, y: 0 }; // Far from snake
      
      const newState = moveSnake(state);
      expect(newState.snake[0].x).toBe(state.snake[0].x + 1);
      expect(newState.snake.length).toBe(state.snake.length);
    });

    it('grows snake when eating food', () => {
      const state = createInitialState('walls');
      state.status = 'playing';
      state.food = { x: 11, y: 10 }; // Right in front
      
      const newState = moveSnake(state);
      expect(newState.snake.length).toBe(state.snake.length + 1);
      expect(newState.score).toBe(10);
    });

    it('game over on wall collision in walls mode', () => {
      const state = createInitialState('walls');
      state.status = 'playing';
      state.snake = [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }];
      state.direction = 'RIGHT';
      
      const newState = moveSnake(state);
      expect(newState.status).toBe('game-over');
    });

    it('wraps around in pass-through mode', () => {
      const state = createInitialState('pass-through');
      state.status = 'playing';
      state.snake = [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }];
      state.direction = 'RIGHT';
      state.food = { x: 5, y: 5 };
      
      const newState = moveSnake(state);
      expect(newState.status).toBe('playing');
      expect(newState.snake[0].x).toBe(0);
    });

    it('does not move when not playing', () => {
      const state = createInitialState('walls');
      state.status = 'idle';
      
      const newState = moveSnake(state);
      expect(newState).toEqual(state);
    });

    it('prevents reversing direction', () => {
      const state = createInitialState('walls');
      state.status = 'playing';
      state.direction = 'RIGHT';
      state.food = { x: 0, y: 0 };
      
      const newState = moveSnake(state, 'LEFT');
      expect(newState.direction).toBe('RIGHT');
    });
  });

  describe('getDirectionFromKey', () => {
    it('maps arrow keys correctly', () => {
      expect(getDirectionFromKey('ArrowUp')).toBe('UP');
      expect(getDirectionFromKey('ArrowDown')).toBe('DOWN');
      expect(getDirectionFromKey('ArrowLeft')).toBe('LEFT');
      expect(getDirectionFromKey('ArrowRight')).toBe('RIGHT');
    });

    it('maps WASD keys correctly', () => {
      expect(getDirectionFromKey('w')).toBe('UP');
      expect(getDirectionFromKey('W')).toBe('UP');
      expect(getDirectionFromKey('s')).toBe('DOWN');
      expect(getDirectionFromKey('a')).toBe('LEFT');
      expect(getDirectionFromKey('d')).toBe('RIGHT');
    });

    it('returns null for unknown keys', () => {
      expect(getDirectionFromKey('x')).toBeNull();
      expect(getDirectionFromKey('Enter')).toBeNull();
    });
  });
});
