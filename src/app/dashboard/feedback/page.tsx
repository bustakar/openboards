import { AppSidebar } from '@/components/app-sidebar';
import { FeedbackContent } from '@/components/dashboard/FeedbackContent';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/server/auth/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { listProjectsByUser } from '@/server/repos/projects';

export default async function FeedbackPage() {
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
        <main className="flex-1">
          <FeedbackContent />
        </main>
      </div>
    </SidebarProvider>
  );
}
