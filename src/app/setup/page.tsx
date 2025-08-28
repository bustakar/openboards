'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProjectSchema } from '@/server/repos/projects/validation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface ValidationErrors {
  name?: string;
  subdomain?: string;
  description?: string;
}

export default function SetupPage() {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<
    boolean | null
  >(null);
  const router = useRouter();

  // Validate form data using the schema
  const validateForm = useCallback(() => {
    const errors: ValidationErrors = {};

    try {
      // Validate fields except userId (auth removed for now)
      createProjectSchema.omit({ userId: true }).parse({
        name,
        subdomain,
        description: description || undefined,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as {
          errors: Array<{ path: string[]; message: string }>;
        };
        zodError.errors.forEach((err) => {
          if (err.path[0] === 'name') errors.name = err.message;
          if (err.path[0] === 'subdomain') errors.subdomain = err.message;
          if (err.path[0] === 'description') errors.description = err.message;
        });
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, subdomain, description]);

  // Check subdomain availability
  const checkSubdomainAvailability = useCallback(async (subdomain: string) => {
    if (!subdomain || subdomain.length < 1) {
      setIsSubdomainAvailable(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/check-subdomain?subdomain=${encodeURIComponent(
          subdomain
        )}`
      );
      const data = await response.json();
      setIsSubdomainAvailable(data.available);
    } catch {
      setIsSubdomainAvailable(null);
    }
  }, []);

  // Debounced subdomain check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (subdomain && !validationErrors.subdomain) {
        checkSubdomainAvailability(subdomain);
      } else {
        setIsSubdomainAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain, validationErrors.subdomain, checkSubdomainAvailability]);

  // Validate on input changes
  useEffect(() => {
    if (name || subdomain || description) {
      validateForm();
    }
  }, [name, subdomain, description, validateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    if (isSubdomainAvailable === false) {
      setError('This subdomain is already taken');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          subdomain,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name.length > 0 &&
      subdomain.length > 0 &&
      Object.keys(validationErrors).length === 0 &&
      isSubdomainAvailable !== false
    );
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          openboards.co
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create Your First Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Awesome Project"
                  disabled={isLoading}
                  className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {name.length}/100 characters
                </p>
              </div>

              <div>
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center">
                  <Input
                    id="subdomain"
                    type="text"
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    required
                    placeholder="myproject"
                    disabled={isLoading}
                    className={`rounded-r-none ${
                      validationErrors.subdomain ||
                      isSubdomainAvailable === false
                        ? 'border-red-500'
                        : isSubdomainAvailable === true
                        ? 'border-green-500'
                        : ''
                    }`}
                  />
                  <span className="bg-gray-100 px-3 py-2 text-sm text-gray-600 border border-l-0 rounded-r-md">
                    .openboards.co
                  </span>
                </div>
                {validationErrors.subdomain && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.subdomain}
                  </p>
                )}
                {isSubdomainAvailable === true && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Subdomain available
                  </p>
                )}
                {isSubdomainAvailable === false && (
                  <p className="text-xs text-red-600 mt-1">
                    ✗ Subdomain already taken
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {subdomain.length}/50 characters • Only letters, numbers, and
                  hyphens allowed
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this project about?"
                  disabled={isLoading}
                  className={
                    validationErrors.description ? 'border-red-500' : ''
                  }
                />
                {validationErrors.description && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? 'Creating Project...' : 'Create Project'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
