import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { authOptions } from '@/server/auth/options';
import { listProjectsByUser } from '@/server/repos/projects/projects';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect('/login');

  const projects = await listProjectsByUser(userId);

  if (projects.length === 0) {
    redirect('/setup');
  }

  const userData = {
    name: session.user.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    avatar: session.user.image || undefined,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={userData} projects={projects} />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
