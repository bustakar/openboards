import { createCommentSchema } from '../validation';

describe('Comments Validation', () => {
  describe('createCommentSchema', () => {
    it('should validate a valid comment creation input', () => {
      const validInput = {
        body: 'This is a valid comment body',
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate a comment without authorName', () => {
      const validInput = {
        body: 'This is a valid comment body',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a comment without honeypot', () => {
      const validInput = {
        body: 'This is a valid comment body',
        authorName: 'John Doe',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a comment with empty authorName', () => {
      const validInput = {
        body: 'This is a valid comment body',
        authorName: '',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty body', () => {
      const invalidInput = {
        body: '',
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['body']);
      }
    });

    it('should reject missing body', () => {
      const invalidInput = {
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['body']);
      }
    });

    it('should reject body that is too long', () => {
      const invalidInput = {
        body: 'a'.repeat(10001), // More than 10,000 characters
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['body']);
      }
    });

    it('should reject authorName that is too long', () => {
      const invalidInput = {
        body: 'This is a valid comment body',
        authorName: 'a'.repeat(61), // More than 60 characters
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['authorName']);
      }
    });

    it('should accept minimum valid body length', () => {
      const validInput = {
        body: 'a', // Exactly 1 character
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid body length', () => {
      const validInput = {
        body: 'a'.repeat(10000), // Exactly 10,000 characters
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid authorName length', () => {
      const validInput = {
        body: 'This is a valid comment body',
        authorName: 'a'.repeat(60), // Exactly 60 characters
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept whitespace-only body', () => {
      const validInput = {
        body: '   ', // Whitespace only
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept body with special characters', () => {
      const validInput = {
        body: 'Comment with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept body with emojis', () => {
      const validInput = {
        body: 'Comment with emojis: 😀🎉🚀',
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept body with HTML-like content', () => {
      const validInput = {
        body: 'Comment with <b>HTML-like</b> content',
        authorName: 'John Doe',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept authorName with special characters', () => {
      const validInput = {
        body: 'This is a valid comment body',
        authorName: 'John-Doe_123',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept authorName with spaces', () => {
      const validInput = {
        body: 'This is a valid comment body',
        authorName: 'John Doe Smith',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept authorName with numbers', () => {
      const validInput = {
        body: 'This is a valid comment body',
        authorName: 'User123',
        _hpt: 'honeypot-value',
      };

      const result = createCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });
});
