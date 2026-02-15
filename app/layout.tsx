// app/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Aero-Drag Showdown',
  description: 'Physics-based racing simulation: Cars vs Fighter Jets',
  viewport: 'width=device-width, initial-scale=1.0',
  icons: {
    icon: '🏎️',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="bg-background-dark font-display text-slate-200 h-screen overflow-hidden flex flex-col selection:bg-primary selection:text-white">
        <Header />
        {children}
      </body>
    </html>
  );
}
