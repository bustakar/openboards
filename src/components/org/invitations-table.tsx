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
  const roles = ['owner', 'admin', 'member'];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead className="w-[220px]">Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expiry Date</TableHead>
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
