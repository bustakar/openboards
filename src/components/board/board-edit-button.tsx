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
import { BoardForm } from './board-form';

export function BoardEditButton({
  orgSlug,
  board,
}: {
  orgSlug: string;
  board: { id: string; title: string; icon: string };
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
          <DialogTitle>Edit board</DialogTitle>
        </DialogHeader>
        <BoardForm
          orgSlug={orgSlug}
          mode="edit"
          board={board}
          onSubmitted={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
