'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Organization } from 'better-auth/plugins';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

const formSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

type FormData = z.infer<typeof formSchema>;

export function OrganizationDeleteButton({ org }: { org: Organization }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);

    try {
      if (org.slug !== data.slug) {
        setError('Invalid slug');
        return;
      }
      await authClient.organization.delete({
        organizationId: org.id,
      });
      router.push(`/dashboard`);
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Organization</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
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
              <Button
                variant="destructive"
                disabled={isLoading}
                type="submit"
                className="w-full"
              >
                {isLoading ? 'Deleting...' : 'Confirm deletion'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
