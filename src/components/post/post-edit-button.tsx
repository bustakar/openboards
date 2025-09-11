'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { PostForm } from './post-form';

export function PostEditButton({
  orgSlug,
  boards,
  post,
}: {
  orgSlug: string;
  boards: { id: string; title: string; icon: string }[];
  post: {
    id: string;
    title: string;
    description: string;
    boardId: string;
  };
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <PencilIcon className="size-4 mr-2" />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <PostForm
          orgSlug={orgSlug}
          mode="edit"
          boards={boards}
          post={post}
          onSubmitted={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
