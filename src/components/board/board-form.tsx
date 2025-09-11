'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  createBoardAction,
  updateBoardAction,
} from '@/server/service/board-service';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Too long'),
  icon: z.string().min(1, 'Icon is required').max(16, 'Too long'),
});

type FormData = z.infer<typeof formSchema>;

export function BoardForm({
  orgSlug,
  mode,
  board,
  onSubmitted,
}: {
  orgSlug: string;
  mode: 'create' | 'edit';
  board?: { id: string; title: string; icon: string };
  onSubmitted?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: board?.title || '',
      icon: board?.icon || '💡',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'create') {
        await createBoardAction({ orgSlug, ...data });
      } else {
        await updateBoardAction({ orgSlug, id: board!.id, ...data });
      }
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save board');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Ideas" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (emoji or short text)</FormLabel>
              <FormControl>
                <Input placeholder="💡" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Board'
              : 'Save Board'}
        </Button>
      </form>
    </Form>
  );
}
