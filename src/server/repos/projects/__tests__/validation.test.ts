import { createProjectSchema, updateProjectSchema } from '../validation';

describe('Projects Validation', () => {
  describe('createProjectSchema', () => {
    it('should validate a valid project creation input', () => {
      const validInput = {
        name: 'My Project',
        subdomain: 'my-project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate a project without description', () => {
      const validInput = {
        name: 'My Project',
        subdomain: 'my-project',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a project with empty description', () => {
      const validInput = {
        name: 'My Project',
        subdomain: 'my-project',
        description: '',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for userId', () => {
      const invalidInput = {
        name: 'My Project',
        subdomain: 'my-project',
        description: 'A great project description',
        userId: 'invalid-uuid',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['userId']);
      }
    });

    it('should reject missing name', () => {
      const invalidInput = {
        subdomain: 'my-project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject empty name', () => {
      const invalidInput = {
        name: '',
        subdomain: 'my-project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject name that is too long', () => {
      const invalidInput = {
        name: 'a'.repeat(101), // More than 100 characters
        subdomain: 'my-project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject missing subdomain', () => {
      const invalidInput = {
        name: 'My Project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject empty subdomain', () => {
      const invalidInput = {
        name: 'My Project',
        subdomain: '',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject subdomain with uppercase letters', () => {
      const invalidInput = {
        name: 'My Project',
        subdomain: 'My-Project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject subdomain with special characters', () => {
      const invalidInput = {
        name: 'My Project',
        subdomain: 'my_project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject subdomain that is too long', () => {
      const invalidInput = {
        name: 'My Project',
        subdomain: 'a'.repeat(51), // More than 50 characters
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject description that is too long', () => {
      const invalidInput = {
        name: 'My Project',
        subdomain: 'my-project',
        description: 'a'.repeat(501), // More than 500 characters
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['description']);
      }
    });

    it('should accept valid subdomain with numbers', () => {
      const validInput = {
        name: 'My Project',
        subdomain: 'my-project-123',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept valid subdomain with hyphens', () => {
      const validInput = {
        name: 'My Project',
        subdomain: 'my-awesome-project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid name length', () => {
      const validInput = {
        name: 'a'.repeat(100), // Exactly 100 characters
        subdomain: 'my-project',
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid subdomain length', () => {
      const validInput = {
        name: 'My Project',
        subdomain: 'a'.repeat(50), // Exactly 50 characters
        description: 'A great project description',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid description length', () => {
      const validInput = {
        name: 'My Project',
        subdomain: 'my-project',
        description: 'a'.repeat(500), // Exactly 500 characters
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('updateProjectSchema', () => {
    it('should validate a valid project update input', () => {
      const validInput = {
        name: 'Updated Project Name',
        subdomain: 'updated-project',
        description: 'Updated project description',
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate a partial update with only name', () => {
      const validInput = {
        name: 'Updated Project Name',
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a partial update with only subdomain', () => {
      const validInput = {
        subdomain: 'updated-project',
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a partial update with only description', () => {
      const validInput = {
        description: 'Updated project description',
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate an empty update object', () => {
      const validInput = {};

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject name that is too long', () => {
      const invalidInput = {
        name: 'a'.repeat(101), // More than 100 characters
      };

      const result = updateProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject subdomain with uppercase letters', () => {
      const invalidInput = {
        subdomain: 'Updated-Project',
      };

      const result = updateProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject subdomain with special characters', () => {
      const invalidInput = {
        subdomain: 'updated_project',
      };

      const result = updateProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject subdomain that is too long', () => {
      const invalidInput = {
        subdomain: 'a'.repeat(51), // More than 50 characters
      };

      const result = updateProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['subdomain']);
      }
    });

    it('should reject description that is too long', () => {
      const invalidInput = {
        description: 'a'.repeat(501), // More than 500 characters
      };

      const result = updateProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['description']);
      }
    });

    it('should accept valid subdomain with numbers', () => {
      const validInput = {
        subdomain: 'updated-project-123',
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept valid subdomain with hyphens', () => {
      const validInput = {
        subdomain: 'updated-awesome-project',
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid name length', () => {
      const validInput = {
        name: 'a'.repeat(100), // Exactly 100 characters
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid subdomain length', () => {
      const validInput = {
        subdomain: 'a'.repeat(50), // Exactly 50 characters
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid description length', () => {
      const validInput = {
        description: 'a'.repeat(500), // Exactly 500 characters
      };

      const result = updateProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });
});
