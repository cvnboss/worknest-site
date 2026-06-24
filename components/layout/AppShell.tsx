'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const publicPaths = ['/login', '/register'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = publicPaths.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, loading, isPublicPage, router]);

  if (loading) {
    return (
      <div className="loading-overlay" data-testid="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
}
