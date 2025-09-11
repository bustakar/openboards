import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Invitation } from 'better-auth/plugins';
import * as React from 'react';

export function InvitationsTable({
  invitations,
}: {
  invitations: Invitation[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead className="md:w-[160px]">Role</TableHead>
          <TableHead className="md:w-[160px]">Status</TableHead>
          <TableHead className="md:w-[160px]">Expiry Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => {
          return (
            <TableRow key={invitation.id}>
              <TableCell>
                <span className="font-medium">{invitation.email}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">{invitation.role}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">{invitation.status}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">
                  {invitation.expiresAt.toLocaleDateString()}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
