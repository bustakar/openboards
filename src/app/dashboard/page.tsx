import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/server/auth/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { listProjectsByUser } from '@/server/repos/projects';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect('/login');

  // Check if user has any projects
  const projects = await listProjectsByUser(userId);
  
  // If no projects, redirect to setup
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
      <div className="flex min-h-screen">
        <AppSidebar user={userData} projects={projects} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {session.user.email}
              </p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
