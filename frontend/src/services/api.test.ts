import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from './api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('login', () => {
    it('returns success for valid credentials', async () => {
      const response = await api.login('player1@test.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.username).toBe('SnakeMaster');
    });

    it('returns error for invalid email', async () => {
      const response = await api.login('invalid@test.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toBe('User not found');
    });

    it('returns error for invalid password', async () => {
      const response = await api.login('player1@test.com', 'wrongpassword');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid password');
    });
  });

  describe('signup', () => {
    it('creates new user successfully', async () => {
      const response = await api.signup('TestUser', 'testuser@test.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user?.username).toBe('TestUser');
    });

    it('returns error for existing email', async () => {
      const response = await api.signup('AnotherUser', 'player1@test.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Email already registered');
    });
  });

  describe('getLeaderboard', () => {
    it('returns all leaderboard entries', async () => {
      const entries = await api.getLeaderboard();
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].score).toBeGreaterThanOrEqual(entries[1].score);
    });

    it('filters by mode', async () => {
      const wallsEntries = await api.getLeaderboard('walls');
      expect(wallsEntries.every(e => e.mode === 'walls')).toBe(true);

      const passThroughEntries = await api.getLeaderboard('pass-through');
      expect(passThroughEntries.every(e => e.mode === 'pass-through')).toBe(true);
    });
  });

  describe('getActivePlayers', () => {
    it('returns active players with game states', async () => {
      const players = await api.getActivePlayers();
      expect(players.length).toBeGreaterThan(0);
      expect(players[0].gameState).toBeDefined();
      expect(players[0].gameState.snake.length).toBeGreaterThan(0);
    });
  });

  describe('submitScore', () => {
    it('submits score when logged in', async () => {
      // Login first
      await api.login('player1@test.com', 'password123');
      
      const result = await api.submitScore(500, 'walls');
      expect(result).toBe(true);

      // Verify score was added
      const leaderboard = await api.getLeaderboard();
      const hasScore = leaderboard.some(e => e.score === 500 && e.username === 'SnakeMaster');
      expect(hasScore).toBe(true);
    });
  });
});
