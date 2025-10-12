import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/metadata';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Ben Redmond',
  description:
    'Software engineer exploring frontier AI coding techniques and building real products. Writing about what I learn along the way.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
