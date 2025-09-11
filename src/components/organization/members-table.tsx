import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import * as React from 'react';
import { MemberData } from './org-settings';

export function MembersTable({
  editAllowed,
  rows,
}: {
  editAllowed: boolean;
  rows: MemberData[];
}) {
  const roles = ['owner', 'admin', 'member'];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead className="md:w-[160px]">Role</TableHead>
          <TableHead className="md:w-[160px]">Status</TableHead>
          <TableHead className="md:w-[160px]">Joined At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((member) => {
          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {member.name || member.email}
                    {member.isCurrentUser ? ' (you)' : ''}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {member.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs">member</span>
              </TableCell>
              <TableCell>
                <Select value={member.role} disabled={!editAllowed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <span className="text-xs">
                  {member.createdAt.toLocaleDateString()}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
