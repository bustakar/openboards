'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Organization } from 'better-auth/plugins';
import { useRouter } from 'next/navigation';

export function OrganizationSelectForm({
  organizations,
}: {
  organizations: Organization[];
}) {
  const router = useRouter();

  const onSelect = async (organization: Organization) => {
    router.push(`/dashboard/${organization.slug}/feedback`);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Select Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {organizations.map((org) => (
            <Button
              key={org.id}
              className="w-full flex flex-col items-start"
              variant="outline"
              onClick={() => onSelect(org)}
              size="lg"
            >
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{org.name}</span>
                <span className="text-xs text-muted-foreground">
                  {org.slug}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
