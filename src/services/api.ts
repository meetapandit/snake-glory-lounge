import { User, LeaderboardEntry, ActivePlayer, AuthResponse, GameMode, GameState } from '@/types/game';

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let currentUser: User | null = null;
const mockUsers: Map<string, { user: User; password: string }> = new Map();

// Initialize with some mock users
mockUsers.set('player1@test.com', {
  user: { id: '1', username: 'SnakeMaster', email: 'player1@test.com' },
  password: 'password123'
});
mockUsers.set('player2@test.com', {
  user: { id: '2', username: 'VenomStrike', email: 'player2@test.com' },
  password: 'password123'
});

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 2450, mode: 'walls', date: '2024-01-15' },
  { id: '2', username: 'VenomStrike', score: 2100, mode: 'pass-through', date: '2024-01-14' },
  { id: '3', username: 'CobraKing', score: 1890, mode: 'walls', date: '2024-01-13' },
  { id: '4', username: 'PythonPro', score: 1750, mode: 'pass-through', date: '2024-01-12' },
  { id: '5', username: 'Slither99', score: 1620, mode: 'walls', date: '2024-01-11' },
  { id: '6', username: 'ViperVenom', score: 1500, mode: 'pass-through', date: '2024-01-10' },
  { id: '7', username: 'Anaconda', score: 1350, mode: 'walls', date: '2024-01-09' },
  { id: '8', username: 'RattleSnake', score: 1200, mode: 'pass-through', date: '2024-01-08' },
  { id: '9', username: 'BlackMamba', score: 1100, mode: 'walls', date: '2024-01-07' },
  { id: '10', username: 'Sidewinder', score: 950, mode: 'pass-through', date: '2024-01-06' },
];

// API Service - All backend calls centralized here
export const api = {
  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    const userData = mockUsers.get(email);
    
    if (!userData) {
      return { success: false, error: 'User not found' };
    }
    
    if (userData.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    currentUser = userData.user;
    localStorage.setItem('snake_user', JSON.stringify(currentUser));
    return { success: true, user: currentUser };
  },

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    
    if (mockUsers.has(email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email
    };
    
    mockUsers.set(email, { user: newUser, password });
    currentUser = newUser;
    localStorage.setItem('snake_user', JSON.stringify(currentUser));
    return { success: true, user: newUser };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_user');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
    await delay(300);
    if (mode) {
      return mockLeaderboard.filter(entry => entry.mode === mode);
    }
    return mockLeaderboard;
  },

  async submitScore(score: number, mode: GameMode): Promise<boolean> {
    await delay(300);
    if (!currentUser) return false;
    
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      username: currentUser.username,
      score,
      mode,
      date: new Date().toISOString().split('T')[0]
    };
    
    mockLeaderboard.push(newEntry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    return true;
  },

  // Active Players (for spectator mode)
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(200);
    // Generate mock active players with simulated game states
    return [
      {
        id: '101',
        username: 'LiveSnaker',
        score: 340,
        mode: 'walls',
        gameState: generateMockGameState('walls', 340)
      },
      {
        id: '102',
        username: 'ProGamer99',
        score: 520,
        mode: 'pass-through',
        gameState: generateMockGameState('pass-through', 520)
      },
      {
        id: '103',
        username: 'NightCrawler',
        score: 180,
        mode: 'walls',
        gameState: generateMockGameState('walls', 180)
      },
    ];
  },

  async getPlayerGameState(playerId: string): Promise<GameState | null> {
    await delay(100);
    const players = await this.getActivePlayers();
    const player = players.find(p => p.id === playerId);
    return player?.gameState || null;
  }
};

// Helper to generate mock game state
function generateMockGameState(mode: GameMode, score: number): GameState {
  const snakeLength = Math.floor(score / 10) + 3;
  const snake: { x: number; y: number }[] = [];
  const startX = Math.floor(Math.random() * 10) + 5;
  const startY = Math.floor(Math.random() * 10) + 5;
  
  for (let i = 0; i < snakeLength; i++) {
    snake.push({ x: startX - i, y: startY });
  }
  
  return {
    snake,
    food: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
    direction: 'RIGHT',
    score,
    status: 'playing',
    mode,
    speed: 150
  };
}

export default api;
