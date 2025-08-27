import { createBoardSchema, updateBoardSchema } from '../validation';

describe('Boards Validation', () => {
  describe('createBoardSchema', () => {
    it('should validate a valid board creation input', () => {
      const validInput = {
        name: 'My Board',
        slug: 'my-board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate a board without description', () => {
      const validInput = {
        name: 'My Board',
        slug: 'my-board',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a board with empty description', () => {
      const validInput = {
        name: 'My Board',
        slug: 'my-board',
        description: '',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for projectId', () => {
      const invalidInput = {
        name: 'My Board',
        slug: 'my-board',
        description: 'A great board description',
        projectId: 'invalid-uuid',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['projectId']);
      }
    });

    it('should reject missing name', () => {
      const invalidInput = {
        slug: 'my-board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject empty name', () => {
      const invalidInput = {
        name: '',
        slug: 'my-board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject name that is too long', () => {
      const invalidInput = {
        name: 'a'.repeat(101), // More than 100 characters
        slug: 'my-board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject missing slug', () => {
      const invalidInput = {
        name: 'My Board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject empty slug', () => {
      const invalidInput = {
        name: 'My Board',
        slug: '',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject slug with uppercase letters', () => {
      const invalidInput = {
        name: 'My Board',
        slug: 'My-Board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject slug with special characters', () => {
      const invalidInput = {
        name: 'My Board',
        slug: 'my_board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject slug that is too long', () => {
      const invalidInput = {
        name: 'My Board',
        slug: 'a'.repeat(101), // More than 100 characters
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject description that is too long', () => {
      const invalidInput = {
        name: 'My Board',
        slug: 'my-board',
        description: 'a'.repeat(501), // More than 500 characters
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['description']);
      }
    });

    it('should accept valid slug with numbers', () => {
      const validInput = {
        name: 'My Board',
        slug: 'my-board-123',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept valid slug with hyphens', () => {
      const validInput = {
        name: 'My Board',
        slug: 'my-awesome-board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid name length', () => {
      const validInput = {
        name: 'a'.repeat(100), // Exactly 100 characters
        slug: 'my-board',
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid slug length', () => {
      const validInput = {
        name: 'My Board',
        slug: 'a'.repeat(100), // Exactly 100 characters
        description: 'A great board description',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid description length', () => {
      const validInput = {
        name: 'My Board',
        slug: 'my-board',
        description: 'a'.repeat(500), // Exactly 500 characters
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('updateBoardSchema', () => {
    it('should validate a valid board update input', () => {
      const validInput = {
        name: 'Updated Board Name',
        slug: 'updated-board',
        description: 'Updated board description',
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate a partial update with only name', () => {
      const validInput = {
        name: 'Updated Board Name',
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a partial update with only slug', () => {
      const validInput = {
        slug: 'updated-board',
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a partial update with only description', () => {
      const validInput = {
        description: 'Updated board description',
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate an empty update object', () => {
      const validInput = {};

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject name that is too long', () => {
      const invalidInput = {
        name: 'a'.repeat(101), // More than 100 characters
      };

      const result = updateBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject slug with uppercase letters', () => {
      const invalidInput = {
        slug: 'Updated-Board',
      };

      const result = updateBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject slug with special characters', () => {
      const invalidInput = {
        slug: 'updated_board',
      };

      const result = updateBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject slug that is too long', () => {
      const invalidInput = {
        slug: 'a'.repeat(101), // More than 100 characters
      };

      const result = updateBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject description that is too long', () => {
      const invalidInput = {
        description: 'a'.repeat(501), // More than 500 characters
      };

      const result = updateBoardSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['description']);
      }
    });

    it('should accept valid slug with numbers', () => {
      const validInput = {
        slug: 'updated-board-123',
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept valid slug with hyphens', () => {
      const validInput = {
        slug: 'updated-awesome-board',
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid name length', () => {
      const validInput = {
        name: 'a'.repeat(100), // Exactly 100 characters
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid slug length', () => {
      const validInput = {
        slug: 'a'.repeat(100), // Exactly 100 characters
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid description length', () => {
      const validInput = {
        description: 'a'.repeat(500), // Exactly 500 characters
      };

      const result = updateBoardSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });
});
