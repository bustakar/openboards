import { AppSidebar } from '@/components/app-sidebar';
import { authOptions } from '@/server/auth/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  
  const userData = {
    name: session.user.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    avatar: session.user.image || undefined,
  };
  
  return (
    <div className="flex min-h-screen">
      <AppSidebar user={userData} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.email}
            </p>
          </div>
          
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Total Projects</h3>
                </div>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Active projects
                </p>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Total Boards</h3>
                </div>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Across all projects
                </p>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Total Posts</h3>
                </div>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  Feedback items
                </p>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Active Users</h3>
                </div>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
