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
import { deleteBoardAction } from '@/server/service/board-service';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

export function BoardDeleteButton({
  orgSlug,
  boardId,
  boardTitle,
}: {
  orgSlug: string;
  boardId: string;
  boardTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await deleteBoardAction({ orgSlug, id: boardId });
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete board');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
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
          <DialogTitle>Delete board</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          Are you sure you want to delete “{boardTitle}”? Posts will be
          unassigned.
        </p>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
