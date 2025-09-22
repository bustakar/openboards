'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deletePostAction } from '@/server/service/post-service';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

export function PostDeleteButton({
  orgSlug,
  postId,
  postTitle,
}: {
  orgSlug: string;
  postId: string;
  postTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onDelete = async () => {
    setBusy(true);
    try {
      await deletePostAction({ orgSlug, id: postId });
      setOpen(false);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete post');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:text-destructive"
        >
          <Trash2Icon className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete post</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          Are you sure you want to delete “{postTitle}”?
        </p>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
