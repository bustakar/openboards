import { checkAndRecordLimit } from '../rateLimit';

// Mock Date.now() to control time in tests
const mockDateNow = jest.fn();
global.Date.now = mockDateNow;

// Mock process.env.NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

describe('Rate Limit Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global store before each test
    (globalThis as unknown as { __rate__: Map<string, unknown> }).__rate__ = new Map();
    mockDateNow.mockReturnValue(1000); // Start at timestamp 1000
  });

  afterAll(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('checkAndRecordLimit', () => {
    describe('Development Environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should always allow requests in development', () => {
        const result = checkAndRecordLimit('test-key', 5, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 5,
          resetMs: 0,
        });
      });

      it('should always allow requests regardless of limit in development', () => {
        const result = checkAndRecordLimit('test-key', 0, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 0,
          resetMs: 0,
        });
      });

      it('should always allow requests regardless of window in development', () => {
        const result = checkAndRecordLimit('test-key', 5, 0);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 5,
          resetMs: 0,
        });
      });
    });

    describe('Production Environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should allow first request within limit', () => {
        const result = checkAndRecordLimit('test-key', 5, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: 1000,
        });
      });

      it('should allow multiple requests within limit', () => {
        // First request
        let result = checkAndRecordLimit('test-key', 3, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(2);

        // Second request
        result = checkAndRecordLimit('test-key', 3, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);

        // Third request
        result = checkAndRecordLimit('test-key', 3, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(0);
      });

      it('should block request when limit is exceeded', () => {
        // Make 3 requests to reach limit
        checkAndRecordLimit('test-key', 3, 1000);
        checkAndRecordLimit('test-key', 3, 1000);
        checkAndRecordLimit('test-key', 3, 1000);

        // Fourth request should be blocked
        const result = checkAndRecordLimit('test-key', 3, 1000);
        
        expect(result).toEqual({
          allowed: false,
          remaining: 0,
          resetMs: 1000, // Time until first hit expires
        });
      });

      it('should calculate correct reset time when limit exceeded', () => {
        // Make requests with different timestamps
        mockDateNow.mockReturnValue(1000);
        checkAndRecordLimit('test-key', 2, 1000);
        
        mockDateNow.mockReturnValue(1500);
        checkAndRecordLimit('test-key', 2, 1000);
        
        mockDateNow.mockReturnValue(1600);
        const result = checkAndRecordLimit('test-key', 2, 1000);
        
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
        // Reset time should be time until first hit (1000) expires
        // Current time: 1600, first hit: 1000, window: 1000
        // Reset time: 1000 - (1600 - 1000) = 400
        expect(result.resetMs).toBe(400);
      });

      it('should allow requests after window expires', () => {
        // Make requests up to limit
        checkAndRecordLimit('test-key', 2, 1000);
        checkAndRecordLimit('test-key', 2, 1000);

        // Advance time beyond window
        mockDateNow.mockReturnValue(2500); // 1500ms later

        const result = checkAndRecordLimit('test-key', 2, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 1,
          resetMs: 1000,
        });
      });

      it('should handle sliding window correctly', () => {
        // Make requests at different times
        mockDateNow.mockReturnValue(1000);
        checkAndRecordLimit('test-key', 3, 1000);
        
        mockDateNow.mockReturnValue(1200);
        checkAndRecordLimit('test-key', 3, 1000);
        
        mockDateNow.mockReturnValue(1400);
        checkAndRecordLimit('test-key', 3, 1000);
        
        // Should be at limit now
        mockDateNow.mockReturnValue(1600);
        let result = checkAndRecordLimit('test-key', 3, 1000);
        expect(result.allowed).toBe(false);
        
        // Advance time so first hit expires
        mockDateNow.mockReturnValue(2100);
        result = checkAndRecordLimit('test-key', 3, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(0); // Still 2 hits in window
      });

      it('should handle zero limit', () => {
        const result = checkAndRecordLimit('test-key', 0, 1000);
        
        expect(result).toEqual({
          allowed: false,
          remaining: 0,
          resetMs: NaN, // No hits in window, so resetMs is NaN
        });
      });

      it('should handle zero window', () => {
        const result = checkAndRecordLimit('test-key', 5, 0);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: 0,
        });
      });

      it('should handle negative limit', () => {
        const result = checkAndRecordLimit('test-key', -1, 1000);
        
        expect(result).toEqual({
          allowed: false,
          remaining: 0,
          resetMs: NaN, // No hits in window, so resetMs is NaN
        });
      });

      it('should handle negative window', () => {
        const result = checkAndRecordLimit('test-key', 5, -1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: -1000,
        });
      });

      it('should maintain separate windows for different keys', () => {
        // Use key1
        let result = checkAndRecordLimit('key1', 2, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);

        // Use key2
        result = checkAndRecordLimit('key2', 2, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);

        // Both should still have remaining requests
        result = checkAndRecordLimit('key1', 2, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(0);

        result = checkAndRecordLimit('key2', 2, 1000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(0);
      });

      it('should handle very large limits', () => {
        const result = checkAndRecordLimit('test-key', 1000000, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 999999,
          resetMs: 1000,
        });
      });

      it('should handle very large windows', () => {
        const result = checkAndRecordLimit('test-key', 5, 86400000); // 24 hours
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: 86400000,
        });
      });

      it('should handle edge case where all hits expire', () => {
        // Make a request
        checkAndRecordLimit('test-key', 1, 1000);
        
        // Advance time far beyond window
        mockDateNow.mockReturnValue(5000);
        
        const result = checkAndRecordLimit('test-key', 1, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 0,
          resetMs: 1000,
        });
      });

      it('should handle concurrent requests with same timestamp', () => {
        // Simulate multiple requests at the same time
        mockDateNow.mockReturnValue(1000);
        
        const result1 = checkAndRecordLimit('test-key', 2, 1000);
        const result2 = checkAndRecordLimit('test-key', 2, 1000);
        
        expect(result1.allowed).toBe(true);
        expect(result1.remaining).toBe(1);
        expect(result2.allowed).toBe(true);
        expect(result2.remaining).toBe(0);
      });

      it('should handle empty key', () => {
        const result = checkAndRecordLimit('', 5, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: 1000,
        });
      });

      it('should handle special characters in key', () => {
        const result = checkAndRecordLimit('test-key@#$%^&*()', 5, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: 1000,
        });
      });
    });

    describe('Edge Cases', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should handle floating point limits', () => {
        const result = checkAndRecordLimit('test-key', 2.5, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 1.5,
          resetMs: 1000,
        });
      });

      it('should handle floating point windows', () => {
        const result = checkAndRecordLimit('test-key', 5, 1000.5);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: 1000.5,
        });
      });

      it('should handle very small windows', () => {
        const result = checkAndRecordLimit('test-key', 5, 1);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 4,
          resetMs: 1,
        });
      });

      it('should handle very small limits', () => {
        const result = checkAndRecordLimit('test-key', 0.1, 1000);
        
        expect(result).toEqual({
          allowed: true,
          remaining: 0, // Math.max(0, 0.1 - 1) = 0
          resetMs: 1000,
        });
      });
    });
  });
});
