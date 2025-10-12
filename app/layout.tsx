import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ben Redmond - Building with AI",
  description: "Software engineer exploring frontier AI coding techniques and building real products. Writing about what I learn along the way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
