import { createPostSchema, sanitizeBody, sanitizeTitle } from '../validation';

describe('Posts Validation', () => {
  describe('createPostSchema', () => {
    it('should validate a valid post creation input', () => {
      const validInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Valid Post Title',
        body: 'This is a valid post body',
        _hpt: 'honeypot-value',
      };

      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate a post with empty body', () => {
      const validInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Valid Post Title',
        body: '',
        _hpt: 'honeypot-value',
      };

      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a post without body', () => {
      const validInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Valid Post Title',
        _hpt: 'honeypot-value',
      };

      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate a post without honeypot', () => {
      const validInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Valid Post Title',
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for boardId', () => {
      const invalidInput = {
        boardId: 'invalid-uuid',
        title: 'Valid Post Title',
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['boardId']);
      }
    });

    it('should reject title that is too short', () => {
      const invalidInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'ab', // Less than 3 characters
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
      }
    });

    it('should reject title that is too long', () => {
      const invalidInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'a'.repeat(121), // More than 120 characters
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
      }
    });

    it('should reject body that is too long', () => {
      const invalidInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Valid Post Title',
        body: 'a'.repeat(10001), // More than 10,000 characters
      };

      const result = createPostSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['body']);
      }
    });

    it('should reject missing boardId', () => {
      const invalidInput = {
        title: 'Valid Post Title',
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['boardId']);
      }
    });

    it('should reject missing title', () => {
      const invalidInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
      }
    });

    it('should accept minimum valid title length', () => {
      const validInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'abc', // Exactly 3 characters
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid title length', () => {
      const validInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'a'.repeat(120), // Exactly 120 characters
        body: 'This is a valid post body',
      };

      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid body length', () => {
      const validInput = {
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Valid Post Title',
        body: 'a'.repeat(10000), // Exactly 10,000 characters
      };

      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('sanitizeTitle', () => {
    it('should remove HTML tags from title', () => {
      const input = '<script>alert("xss")</script>My Title<b>Bold</b>';
      const result = sanitizeTitle(input);
      expect(result).toBe('alert("xss")My TitleBold');
    });

    it('should trim whitespace', () => {
      const input = '  My Title  ';
      const result = sanitizeTitle(input);
      expect(result).toBe('My Title');
    });

    it('should handle empty string', () => {
      const input = '';
      const result = sanitizeTitle(input);
      expect(result).toBe('');
    });

    it('should handle string with only HTML tags', () => {
      const input = '<div><span>content</span></div>';
      const result = sanitizeTitle(input);
      expect(result).toBe('content');
    });

    it('should handle string with only whitespace', () => {
      const input = '   \n\t  ';
      const result = sanitizeTitle(input);
      expect(result).toBe('');
    });

    it('should preserve plain text', () => {
      const input = 'Plain Text Title';
      const result = sanitizeTitle(input);
      expect(result).toBe('Plain Text Title');
    });
  });

  describe('sanitizeBody', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Content<script>more</script>';
      const result = sanitizeBody(input);
      expect(result).toBe('Content');
    });

    it('should remove style tags', () => {
      const input =
        '<style>body { color: red; }</style>Content<style>more</style>';
      const result = sanitizeBody(input);
      expect(result).toBe('Content');
    });

    it('should remove on* event handlers', () => {
      const input =
        '<div onclick="alert(\'xss\')" onmouseover="evil()">Content</div>';
      const result = sanitizeBody(input);
      expect(result).toBe('<divxss\')">Content</div>');
    });

    it('should handle multiple event handlers', () => {
      const input =
        '<button onclick="alert(\'xss\')" onmouseover="evil()" onfocus="bad()">Click</button>';
      const result = sanitizeBody(input);
      expect(result).toBe('<buttonxss\')">Click</button>');
    });

    it('should preserve other HTML tags', () => {
      const input = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
      const result = sanitizeBody(input);
      expect(result).toBe(
        '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>'
      );
    });

    it('should trim whitespace', () => {
      const input = '  Content  ';
      const result = sanitizeBody(input);
      expect(result).toBe('Content');
    });

    it('should handle empty string', () => {
      const input = '';
      const result = sanitizeBody(input);
      expect(result).toBe('');
    });

    it('should handle string with only script/style tags', () => {
      const input =
        '<script>alert("xss")</script><style>body { color: red; }</style>';
      const result = sanitizeBody(input);
      expect(result).toBe('');
    });

    it('should handle complex HTML with mixed content', () => {
      const input = `
        <div onclick="alert('xss')">
          <script>alert("xss")</script>
          <p>Valid content</p>
          <style>body { color: red; }</style>
          <strong>More content</strong>
        </div>
      `;
      const result = sanitizeBody(input);
      expect(result).toBe(
        '<divxss\')">\n          \n          <p>Valid content</p>\n          \n          <strong>More content</strong>\n        </div>'
      );
    });

    it('should handle case insensitive event handlers', () => {
      const input =
        '<div OnClick="alert(\'xss\')" ONMOUSEOVER="evil()">Content</div>';
      const result = sanitizeBody(input);
      expect(result).toBe('<divxss\')">Content</div>');
    });

    it('should preserve plain text', () => {
      const input = 'Plain text content';
      const result = sanitizeBody(input);
      expect(result).toBe('Plain text content');
    });
  });
});
