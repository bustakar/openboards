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

export function MembersTable({ rows }: { rows: MemberData[] }) {
  const roles = ['owner', 'admin', 'member'];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[220px]">Role</TableHead>
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
                <div className="max-w-[200px]">
                  <Select value={member.role}>
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
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
