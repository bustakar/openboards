'use client';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createPostAction,
  updatePostAction,
} from '@/server/service/post-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(140, 'Too long'),
  description: z.string().max(2000, 'Too long'),
  boardId: z.string({ error: 'Board is required' }).min(1, 'Board is required'),
});

type FormData = z.infer<typeof formSchema>;

export function PostForm({
  orgSlug,
  mode,
  boards,
  post,
  onSubmitted,
}: {
  orgSlug: string;
  mode: 'create' | 'edit';
  boards: { id: string; title: string; icon: string }[];
  post?: {
    id: string;
    title: string;
    description: string;
    boardId: string;
  };
  onSubmitted?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || '',
      description: post?.description || '',
      boardId: post?.boardId ?? boards[0]?.id ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'create') {
        await createPostAction({
          orgSlug,
          title: data.title,
          description: data.description,
          boardId: data.boardId,
        });
      } else {
        await updatePostAction({
          orgSlug,
          id: post!.id,
          title: data.title,
          description: data.description,
          boardId: data.boardId,
        });
      }
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  const noBoards = boards.length === 0;

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
                <Input
                  placeholder="Improve onboarding flow"
                  disabled={isLoading || noBoards}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the idea or issue..."
                  disabled={isLoading || noBoards}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="boardId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Board</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading || noBoards}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {boards.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <span className="mr-2">{b.icon}</span> {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {noBoards && (
          <p className="text-muted-foreground text-sm">
            Create a board first to add posts.
          </p>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={isLoading || noBoards}
          className="w-full"
        >
          {isLoading
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Post'
              : 'Save Post'}
        </Button>
      </form>
    </Form>
  );
}
