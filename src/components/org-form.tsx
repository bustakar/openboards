'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

type FormData = z.infer<typeof formSchema>;

export function OrganizationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);

    try {
      const organization = await authClient.organization.create({
        name: data.name,
        slug: data.slug,
      });
      if (organization.data?.id) {
        await authClient.organization.setActive({
          organizationId: organization.data?.id,
        });
        router.push(`/dashboard`);
      }
      form.reset();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to create organization'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create Organization</CardTitle>
        <CardDescription>
          Create organization so you can add many members and get feedback for
          many projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Awesome Inc."
                        type="text"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="awesome-inc"
                        type="text"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
