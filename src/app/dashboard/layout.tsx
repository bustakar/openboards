import { Nav } from '@/components/Nav';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav title="Dashboard" />
      <main className="bg-gray-50 min-h-screen">{children}</main>
    </>
  );
}
