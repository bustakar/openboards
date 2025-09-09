import { OrganizationSelectForm } from '@/components/organization/org-select-form';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OrganizationPage() {
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  if (organizations.length === 0) {
    redirect('/dashboard/organization/setup');
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          openboards
        </a>
        <OrganizationSelectForm organizations={organizations} />
      </div>
    </div>
  );
}
