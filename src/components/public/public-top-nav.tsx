import { Button } from '@/components/ui/button';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import Link from 'next/link';

export async function PublicTopNav({
  organizationName,
  organizationSlug,
}: {
  organizationName: string;
  organizationSlug: string;
}) {
  let isDashboardButtonVisible = false;
  try {
    const orgs = await auth.api.listOrganizations({ headers: await headers() });
    isDashboardButtonVisible = !!orgs.find(
      (org) => org.slug === organizationSlug
    );
  } catch (error) {
    isDashboardButtonVisible = false;
    console.error(error);
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <Link
        href={`/${organizationSlug}/feedback`}
        className="text-base font-medium hover:underline"
      >
        {organizationName || organizationSlug}
      </Link>
      {isDashboardButtonVisible ? (
        <Link href={`/dashboard/${organizationSlug}/feedback`}>
          <Button variant="outline" size="sm">
            Dashboard
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
