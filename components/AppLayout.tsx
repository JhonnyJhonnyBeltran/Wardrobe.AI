'use client';

/**
 * AppLayout - Responsive layout with TabBar and Sidebar
 */

import React, { ReactNode } from 'react';
import TabBar from './TabBar';
import Sidebar from './Sidebar';
import AuthGuard from './AuthGuard';
import FloatingCreateButton from './FloatingCreateButton';


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 pb-28 md:pb-0">
        <AuthGuard>
          {children}
        </AuthGuard>
      </main>

      {/* Mobile TabBar */}
      <TabBar />

      {/* Floating Create Button (Desktop only) */}
      <FloatingCreateButton />

      {/* Onboarding Modal (Global) */}

    </div>
  );
}
