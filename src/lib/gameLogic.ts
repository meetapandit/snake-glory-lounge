import { Position, Direction, GameMode, GameState } from '@/types/game';

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_SPEED = 150;

export function createInitialState(mode: GameMode): GameState {
  const initialSnake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  return {
    snake: initialSnake,
    food: generateFood(initialSnake),
    direction: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    speed: INITIAL_SPEED,
  };
}

export function generateFood(snake: Position[]): Position {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

export function getNextPosition(head: Position, direction: Direction, mode: GameMode): Position {
  let newHead = { ...head };

  switch (direction) {
    case 'UP':
      newHead.y -= 1;
      break;
    case 'DOWN':
      newHead.y += 1;
      break;
    case 'LEFT':
      newHead.x -= 1;
      break;
    case 'RIGHT':
      newHead.x += 1;
      break;
  }

  // Handle pass-through mode (wrap around)
  if (mode === 'pass-through') {
    if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
    if (newHead.x >= GRID_SIZE) newHead.x = 0;
    if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
    if (newHead.y >= GRID_SIZE) newHead.y = 0;
  }

  return newHead;
}

export function checkWallCollision(position: Position): boolean {
  return position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE;
}

export function checkSelfCollision(snake: Position[]): boolean {
  const [head, ...body] = snake;
  return body.some(segment => segment.x === head.x && segment.y === head.y);
}

export function checkFoodCollision(head: Position, food: Position): boolean {
  return head.x === food.x && head.y === food.y;
}

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[current] === next;
}

export function moveSnake(state: GameState, newDirection?: Direction): GameState {
  if (state.status !== 'playing') return state;

  const direction = newDirection && !isOppositeDirection(state.direction, newDirection) 
    ? newDirection 
    : state.direction;

  const head = state.snake[0];
  const newHead = getNextPosition(head, direction, state.mode);

  // Check wall collision in walls mode
  if (state.mode === 'walls' && checkWallCollision(newHead)) {
    return { ...state, status: 'game-over' };
  }

  const newSnake = [newHead, ...state.snake];
  
  // Check if food is eaten
  const ateFood = checkFoodCollision(newHead, state.food);
  
  if (!ateFood) {
    newSnake.pop();
  }

  // Check self collision after moving
  if (checkSelfCollision(newSnake)) {
    return { ...state, status: 'game-over' };
  }

  return {
    ...state,
    snake: newSnake,
    food: ateFood ? generateFood(newSnake) : state.food,
    score: ateFood ? state.score + 10 : state.score,
    direction,
    speed: ateFood ? Math.max(50, state.speed - 2) : state.speed,
  };
}

export function getDirectionFromKey(key: string): Direction | null {
  const keyMap: Record<string, Direction> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    w: 'UP',
    W: 'UP',
    s: 'DOWN',
    S: 'DOWN',
    a: 'LEFT',
    A: 'LEFT',
    d: 'RIGHT',
    D: 'RIGHT',
  };
  return keyMap[key] || null;
}
