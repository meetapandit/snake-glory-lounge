import { User, LeaderboardEntry, ActivePlayer, AuthResponse, GameMode, GameState } from '@/types/game';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// API Service - All backend calls centralized here
export const api = {
  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleResponse<AuthResponse>(response);

      // Store user in localStorage if login successful
      if (data.success && data.user) {
        localStorage.setItem('snake_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  },

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await handleResponse<AuthResponse>(response);

      // Store user in localStorage if signup successful
      if (data.success && data.user) {
        localStorage.setItem('snake_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });

      localStorage.removeItem('snake_user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove from localStorage even if server call fails
      localStorage.removeItem('snake_user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`);

      if (response.status === 401) {
        // Not authenticated
        localStorage.removeItem('snake_user');
        return null;
      }

      const user = await handleResponse<User>(response);
      localStorage.setItem('snake_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('snake_user');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    }
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
    try {
      const url = mode
        ? `${API_BASE_URL}/leaderboard?mode=${mode}`
        : `${API_BASE_URL}/leaderboard`;

      const response = await fetch(url);
      return handleResponse<LeaderboardEntry[]>(response);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return [];
    }
  },

  async submitScore(score: number, mode: GameMode): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score, mode }),
      });

      return handleResponse<boolean>(response);
    } catch (error) {
      console.error('Submit score error:', error);
      return false;
    }
  },

  // Active Players (for spectator mode)
  async getActivePlayers(): Promise<ActivePlayer[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/spectator/active`);
      return handleResponse<ActivePlayer[]>(response);
    } catch (error) {
      console.error('Get active players error:', error);
      return [];
    }
  },

  async getPlayerGameState(playerId: string): Promise<GameState | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/spectator/player/${playerId}`);

      if (response.status === 404) {
        return null;
      }

      return handleResponse<GameState>(response);
    } catch (error) {
      console.error('Get player game state error:', error);
      return null;
    }
  }
};

export default api;
