import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/lib/toast-context';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-var',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display-var',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WorkNest - Company Internal Portal',
  description: 'WorkNest is a modern company internal portal for managing employees, leave requests, meeting rooms, tasks, and announcements.',
  keywords: ['worknest', 'internal portal', 'HR', 'employee management', 'task board'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakarta.variable}`} style={{ fontFamily: 'var(--font-body)' } as React.CSSProperties}>
        <AuthProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
