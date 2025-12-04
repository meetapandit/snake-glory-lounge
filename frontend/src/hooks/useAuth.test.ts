import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper to wait for async updates
const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 200));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it('logs in successfully with correct credentials', async () => {
    const { result } = renderHook(() => useAuth());
    
    await waitForNextTick();

    await act(async () => {
      const response = await result.current.login('player1@test.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user?.username).toBe('SnakeMaster');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('SnakeMaster');
  });

  it('fails login with incorrect credentials', async () => {
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
    const { result } = renderHook(() => useAuth());
    
    await waitForNextTick();

    await act(async () => {
      const response = await result.current.signup('NewPlayer', 'newuser@test.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user?.username).toBe('NewPlayer');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logs out successfully', async () => {
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
  });
});
