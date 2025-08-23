import { renderHook, act, waitFor } from '@testing-library/react';
import { useVote } from '../useVote';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useVote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with provided count and not voted state', () => {
    const { result } = renderHook(() => useVote('post-123', 5));

    expect(result.current.count).toBe(5);
    expect(result.current.voted).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should toggle vote successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: true, voteCount: 6 }),
    });

    const { result } = renderHook(() => useVote('post-123', 5));

    await act(async () => {
      await result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.voted).toBe(true);
      expect(result.current.count).toBe(6);
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/posts/post-123/vote', {
      method: 'POST',
    });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useVote('post-123', 5));

    await act(async () => {
      await result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // State should remain unchanged on error
    expect(result.current.count).toBe(5);
    expect(result.current.voted).toBe(false);
  });

  it('should handle non-ok responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useVote('post-123', 5));

    await act(async () => {
      await result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // State should remain unchanged on error
    expect(result.current.count).toBe(5);
    expect(result.current.voted).toBe(false);
  });



  it('should update state correctly when removing vote', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voted: false, voteCount: 4 }),
    });

    const { result } = renderHook(() => useVote('post-123', 5));

    await act(async () => {
      await result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.voted).toBe(false);
      expect(result.current.count).toBe(4);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle JSON parsing errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useVote('post-123', 5));

    await act(async () => {
      await result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // State should remain unchanged on error
    expect(result.current.count).toBe(5);
    expect(result.current.voted).toBe(false);
  });
});
