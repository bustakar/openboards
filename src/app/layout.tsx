import { Nav } from '@/components/Nav';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OpenBoards',
  description: 'Open source feedback boards',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const project = await getCurrentProjectFromHeaders();
  const title = project?.name ?? 'OpenBoards';
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Nav title={title} />
        <main>{children}</main>
      </body>
    </html>
  );
}
