import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/server/auth/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FeedbackContent } from '@/components/dashboard/FeedbackContent';

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  
  const userData = {
    name: session.user.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    avatar: session.user.image || undefined,
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar user={userData} />
        <main className="flex-1">
          <FeedbackContent />
        </main>
      </div>
    </SidebarProvider>
  );
}
