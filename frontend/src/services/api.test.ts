import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import api from './api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('sends correct request and handles success response', async () => {
      const mockResponse = {
        success: true,
        user: { id: '1', username: 'TestUser', email: 'test@test.com' }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await api.login('test@test.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
        })
      );

      expect(response.success).toBe(true);
      expect(response.user?.username).toBe('TestUser');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'snake_user',
        JSON.stringify(mockResponse.user)
      );
    });

    it('handles login failure', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid credentials'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await api.login('test@test.com', 'wrongpass');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const response = await api.login('test@test.com', 'password123');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to connect to server');
    });
  });

  describe('signup', () => {
    it('sends correct request and handles success response', async () => {
      const mockResponse = {
        success: true,
        user: { id: '2', username: 'NewUser', email: 'new@test.com' }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await api.signup('NewUser', 'new@test.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/signup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'NewUser',
            email: 'new@test.com',
            password: 'password123'
          }),
        })
      );

      expect(response.success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('calls logout endpoint and clears localStorage', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await api.logout();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/logout',
        expect.objectContaining({ method: 'POST' })
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_user');
    });

    it('clears localStorage even if request fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await api.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_user');
    });
  });

  describe('getCurrentUser', () => {
    it('fetches current user from backend', async () => {
      const mockUser = { id: '1', username: 'TestUser', email: 'test@test.com' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUser,
      });

      const user = await api.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/auth/me');
      expect(user).toEqual(mockUser);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('returns null for 401 response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const user = await api.getCurrentUser();

      expect(user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_user');
    });
  });

  describe('getLeaderboard', () => {
    it('fetches all leaderboard entries', async () => {
      const mockEntries = [
        { id: '1', username: 'Player1', score: 1000, mode: 'walls', date: '2024-01-01' },
        { id: '2', username: 'Player2', score: 900, mode: 'pass-through', date: '2024-01-02' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntries,
      });

      const entries = await api.getLeaderboard();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/leaderboard');
      expect(entries).toEqual(mockEntries);
    });

    it('filters by mode', async () => {
      const mockEntries = [
        { id: '1', username: 'Player1', score: 1000, mode: 'walls', date: '2024-01-01' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntries,
      });

      await api.getLeaderboard('walls');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/leaderboard?mode=walls');
    });
  });

  describe('submitScore', () => {
    it('submits score to backend', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => true,
      });

      const result = await api.submitScore(1500, 'walls');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/leaderboard',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ score: 1500, mode: 'walls' }),
        })
      );
      expect(result).toBe(true);
    });
  });

  describe('getActivePlayers', () => {
    it('fetches active players', async () => {
      const mockPlayers = [
        {
          id: '101',
          username: 'Player1',
          score: 500,
          mode: 'walls',
          gameState: {
            snake: [{ x: 5, y: 5 }],
            food: { x: 10, y: 10 },
            direction: 'RIGHT',
            score: 500,
            status: 'playing',
            mode: 'walls',
            speed: 150,
          },
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const players = await api.getActivePlayers();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/spectator/active');
      expect(players).toEqual(mockPlayers);
    });
  });

  describe('getPlayerGameState', () => {
    it('fetches specific player game state', async () => {
      const mockGameState = {
        snake: [{ x: 5, y: 5 }],
        food: { x: 10, y: 10 },
        direction: 'RIGHT',
        score: 500,
        status: 'playing',
        mode: 'walls',
        speed: 150,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockGameState,
      });

      const gameState = await api.getPlayerGameState('101');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/spectator/player/101');
      expect(gameState).toEqual(mockGameState);
    });

    it('returns null for 404 response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const gameState = await api.getPlayerGameState('nonexistent');

      expect(gameState).toBeNull();
    });
  });
});
