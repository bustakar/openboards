import { cn, extractSubdomain } from '../utils';

describe('cn utility function', () => {
  it('should combine multiple class strings', () => {
    const result = cn('text-red-500', 'bg-blue-500', 'p-4');
    expect(result).toBe('text-red-500 bg-blue-500 p-4');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    );

    expect(result).toBe('base-class active-class');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['text-red-500', 'bg-blue-500'], 'p-4');
    expect(result).toBe('text-red-500 bg-blue-500 p-4');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': false,
      'p-4': true,
    });

    expect(result).toBe('text-red-500 p-4');
  });

  it('should handle mixed input types', () => {
    const isActive = true;
    const classes = ['text-red-500', 'bg-blue-500'];

    const result = cn('base-class', classes, isActive && 'active-class', {
      'conditional-class': true,
      'hidden-class': false,
    });

    expect(result).toBe(
      'base-class text-red-500 bg-blue-500 active-class conditional-class'
    );
  });

  it('should handle empty inputs', () => {
    const result = cn('', null, undefined, false);
    expect(result).toBe('');
  });

  it('should handle single class', () => {
    const result = cn('text-red-500');
    expect(result).toBe('text-red-500');
  });

  it('should handle Tailwind class conflicts and merge them', () => {
    const result = cn('p-4 p-8', 'text-red-500 text-blue-500');
    // tailwind-merge should resolve conflicts by keeping the last occurrence
    expect(result).toBe('p-8 text-blue-500');
  });

  it('should handle complex Tailwind class merging', () => {
    const result = cn(
      'px-4 py-2 text-sm',
      'px-6 py-3 text-lg',
      'bg-red-500 hover:bg-red-600',
      'bg-blue-500 hover:bg-blue-600'
    );

    // Should merge conflicting classes, keeping the last occurrence
    expect(result).toBe('px-6 py-3 text-lg bg-blue-500 hover:bg-blue-600');
  });

  it('should handle nested arrays', () => {
    const result = cn(['text-red-500', ['bg-blue-500', 'p-4'], 'border']);

    expect(result).toBe('text-red-500 bg-blue-500 p-4 border');
  });

  it('should handle deeply nested structures', () => {
    const result = cn(
      'base',
      [
        'nested-1',
        {
          'nested-2': true,
          'nested-3': false,
        },
        'nested-4',
      ],
      'final'
    );

    expect(result).toBe('base nested-1 nested-2 nested-4 final');
  });

  it('should handle whitespace in class names', () => {
    const result = cn('  text-red-500  ', '  bg-blue-500  ');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle numbers as class names', () => {
    const result = cn(123, 'text-red-500', 456);
    expect(result).toBe('123 text-red-500 456');
  });

  it('should handle function calls that return classes', () => {
    const getClasses = () => 'dynamic-class';
    const result = cn('static-class', getClasses());
    expect(result).toBe('static-class dynamic-class');
  });

  it('should handle complex conditional logic', () => {
    const user = { role: 'admin', isActive: true };
    const theme = 'dark';

    const result = cn(
      'base-button',
      user.role === 'admin' && 'admin-button',
      user.isActive && 'active-button',
      theme === 'dark' && 'dark-theme',
      'always-present'
    );

    expect(result).toBe(
      'base-button admin-button active-button dark-theme always-present'
    );
  });
});

describe('extractSubdomain utility function', () => {
  it('should extract subdomain from production domain', () => {
    expect(extractSubdomain('demo.openboards.co')).toBe('demo');
    expect(extractSubdomain('my-project.openboards.co')).toBe('my-project');
  });

  it('should extract subdomain from localhost development', () => {
    expect(extractSubdomain('demo.localhost:3000')).toBe('demo');
    expect(extractSubdomain('test.localhost:3000')).toBe('test');
  });

  it('should return null for localhost without subdomain', () => {
    expect(extractSubdomain('localhost:3000')).toBeNull();
  });

  it('should return null for root domain', () => {
    expect(extractSubdomain('openboards.co')).toBeNull();
  });

  it('should return null for invalid hostnames', () => {
    expect(extractSubdomain('invalid')).toBeNull();
    expect(extractSubdomain('')).toBeNull();
    expect(extractSubdomain('just.localhost')).toBe('just');
  });

  it('should return null for IP addresses', () => {
    expect(extractSubdomain('192.168.1.1')).toBeNull();
    expect(extractSubdomain('127.0.0.1:3000')).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(extractSubdomain('a.b.c')).toBe('a');
    expect(extractSubdomain('a.b')).toBeNull();
  });
});
