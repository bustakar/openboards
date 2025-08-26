import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/server/auth/options';
import { listProjectsByUser } from '@/server/repos/projects/projects';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect('/login');

  // Get user's projects
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Roadmap</h1>
            <div className="bg-white rounded-lg border p-6">
              <p className="text-gray-600">
                Roadmap functionality coming soon. This will show planned features and development timeline.
              </p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
