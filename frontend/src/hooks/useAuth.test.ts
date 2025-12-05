import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import api from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  default: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper to wait for async updates
const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Default mock implementations using type assertions
    (api.getCurrentUser as Mock).mockResolvedValue(null);
    (api.login as Mock).mockResolvedValue({ success: false, error: 'Invalid credentials' });
    (api.signup as Mock).mockResolvedValue({ success: false, error: 'Signup failed' });
    (api.logout as Mock).mockResolvedValue(undefined);
  });

  it('initializes with loading state', async () => {
    // Delay resolution of getCurrentUser to verify loading state
    let resolveUser: (value: any) => void;
    const userPromise = new Promise(resolve => {
      resolveUser = resolve;
    });
    (api.getCurrentUser as Mock).mockReturnValue(userPromise);

    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveUser!(null);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('logs in successfully with correct credentials', async () => {
    const mockUser = { username: 'SnakeMaster', email: 'player1@test.com' };
    (api.login as Mock).mockResolvedValue({ success: true, user: mockUser });

    const { result } = renderHook(() => useAuth());

    await waitForNextTick(); // Wait for initial check

    await act(async () => {
      const response = await result.current.login('player1@test.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user?.username).toBe('SnakeMaster');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('SnakeMaster');
    expect(api.login).toHaveBeenCalledWith('player1@test.com', 'password123');
  });

  it('fails login with incorrect credentials', async () => {
    (api.login as Mock).mockResolvedValue({ success: false, error: 'Invalid password' });

    const { result } = renderHook(() => useAuth());

    await waitForNextTick();

    await act(async () => {
      const response = await result.current.login('player1@test.com', 'wrongpassword');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid password');
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('signs up successfully', async () => {
    const mockUser = { username: 'NewPlayer', email: 'newuser@test.com' };
    (api.signup as Mock).mockResolvedValue({ success: true, user: mockUser });

    const { result } = renderHook(() => useAuth());

    await waitForNextTick();

    await act(async () => {
      const response = await result.current.signup('NewPlayer', 'newuser@test.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user?.username).toBe('NewPlayer');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(api.signup).toHaveBeenCalledWith('NewPlayer', 'newuser@test.com', 'password123');
  });

  it('logs out successfully', async () => {
    const mockUser = { username: 'SnakeMaster', email: 'player1@test.com' };
    (api.login as Mock).mockResolvedValue({ success: true, user: mockUser });

    const { result } = renderHook(() => useAuth());

    await waitForNextTick();

    // Login first
    await act(async () => {
      await result.current.login('player1@test.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(api.logout).toHaveBeenCalled();
  });
});
