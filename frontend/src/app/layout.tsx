import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import InstallAppButton from '@/components/InstallAppButton';

export const metadata: Metadata = {
  title: 'SmartReunion',
  description: 'Gestion intelligente de réunions',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SmartReunion',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <ThemeToggle />
          <InstallAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
