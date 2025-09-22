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
  title: 'OpenBoards — Open-source Product Feedback Platform',
  description:
    'Collect, prioritize, and act on product feedback. Open-source, self-hostable, and ready for teams.',
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : process.env.VERCEL_URL
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : undefined,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'OpenBoards — Open-source Product Feedback Platform',
    description:
      'Collect, prioritize, and act on product feedback. Open-source, self-hostable, and ready for teams.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenBoards — Open-source Product Feedback Platform',
    description:
      'Collect, prioritize, and act on product feedback. Open-source, self-hostable, and ready for teams.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
