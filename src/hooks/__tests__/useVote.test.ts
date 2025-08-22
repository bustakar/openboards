import { act, renderHook, waitFor } from '@testing-library/react';
import { useVote } from '../useVote';

// Mock fetch globally
global.fetch = jest.fn();

describe('useVote', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should initialize with provided initial count and not voted', () => {
    const { result } = renderHook(() => useVote('post-123', 5));

    expect(result.current.count).toBe(5);
    expect(result.current.voted).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should load vote state from API on mount', async () => {
    const mockResponse = { voted: true, voteCount: 10 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useVote('post-123', 5));

    await waitFor(() => {
      expect(result.current.count).toBe(10);
      expect(result.current.voted).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/posts/post-123/vote', {
      method: 'GET',
    });
  });

  it('should handle API error on initial load gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useVote('post-123', 5));

    // Should keep initial state on error
    await waitFor(() => {
      expect(result.current.count).toBe(5);
      expect(result.current.voted).toBe(false);
    });
  });

  it('should handle non-ok response on initial load', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useVote('post-123', 5));

    // Should keep initial state on error
    await waitFor(() => {
      expect(result.current.count).toBe(5);
      expect(result.current.voted).toBe(false);
    });
  });

  it('should toggle vote successfully', async () => {
    // Mock initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: false, voteCount: 5 }),
    } as Response);

    // Mock toggle response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: true, voteCount: 6 }),
    } as Response);

    const { result } = renderHook(() => useVote('post-123', 5));

    await waitFor(() => {
      expect(result.current.voted).toBe(false);
    });

    await act(async () => {
      await result.current.toggle();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/posts/post-123/vote', {
      method: 'POST',
    });

    await waitFor(() => {
      expect(result.current.voted).toBe(true);
      expect(result.current.count).toBe(6);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle toggle error gracefully', async () => {
    // Mock initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: false, voteCount: 5 }),
    } as Response);

    // Mock toggle error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useVote('post-123', 5));

    await waitFor(() => {
      expect(result.current.voted).toBe(false);
    });

    await act(async () => {
      await result.current.toggle();
    });

    // Should keep previous state and stop loading
    await waitFor(() => {
      expect(result.current.voted).toBe(false);
      expect(result.current.count).toBe(5);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle non-ok response on toggle', async () => {
    // Mock initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: false, voteCount: 5 }),
    } as Response);

    // Mock toggle error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useVote('post-123', 5));

    await waitFor(() => {
      expect(result.current.voted).toBe(false);
    });

    await act(async () => {
      await result.current.toggle();
    });

    // Should keep previous state and stop loading
    await waitFor(() => {
      expect(result.current.voted).toBe(false);
      expect(result.current.count).toBe(5);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should prevent multiple simultaneous toggles', async () => {
    // Mock initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: false, voteCount: 5 }),
    } as Response);

    // Mock slow toggle response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ voted: true, voteCount: 6 }),
              } as Response),
            100
          )
        )
    );

    const { result } = renderHook(() => useVote('post-123', 5));

    await waitFor(() => {
      expect(result.current.voted).toBe(false);
    });

    // Start first toggle
    act(() => {
      result.current.toggle();
    });

    // Try to start second toggle immediately
    act(() => {
      result.current.toggle();
    });

    // Should only make one API call
    expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + 1 toggle
  });

  it('should update state correctly when removing vote', async () => {
    // Mock initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: true, voteCount: 6 }),
    } as Response);

    // Mock toggle response (removing vote)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: false, voteCount: 5 }),
    } as Response);

    const { result } = renderHook(() => useVote('post-123', 5));

    await waitFor(() => {
      expect(result.current.voted).toBe(true);
    });

    await act(async () => {
      await result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.voted).toBe(false);
      expect(result.current.count).toBe(5);
    });
  });
});
