import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import apiClient from '@/lib/api';

// Mock the apiClient to avoid real network calls
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock the router to avoid errors during redirection attempts
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
}));

describe('userStore', () => {
  // This function runs before each 'it' block, ensuring a clean state for every test
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia());
    // Reset any previous mock data
    vi.clearAllMocks();
  });

  it('should log in a user and set the user and token state', async () => {
    // 1. Arrange (Setup the test)
    const userStore = useUserStore();
    const fakeUser = { id: 1, username: 'testuser', roles: ['user'] };
    const fakeToken = 'fake-jwt-token';
    const credentials = { login: 'testuser', password: 'password' };

    // Tell our mock apiClient what to return when `post('/login', ...)` is called
    apiClient.post.mockResolvedValue({
      data: {
        user: fakeUser,
        token: fakeToken,
      },
    });

    // 2. Act (Call the function we are testing)
    await userStore.login(credentials);

    // 3. Assert (Check if the result is what we expect)
    expect(userStore.user).toEqual(fakeUser);
    expect(userStore.token).toBe(fakeToken);
    expect(userStore.isAuthenticated).toBe(true);

    // Also, assert that our API mock was called correctly
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith('/login', credentials);
  });

  it('should log out a user and clear the state', async () => {
    // 1. Arrange
    const userStore = useUserStore();
    
    // First, set an initial "logged in" state
    userStore.user = { id: 1, username: 'testuser' };
    userStore.token = 'fake-jwt-token';
    
    // Mock the logout endpoint
    apiClient.post.mockResolvedValue({});

    // 2. Act
    await userStore.logout();

    // 3. Assert
    expect(userStore.user).toBeNull();
    expect(userStore.token).toBeNull();
    expect(userStore.isAuthenticated).toBe(false);
    expect(apiClient.post).toHaveBeenCalledWith('/logout');
  });
});