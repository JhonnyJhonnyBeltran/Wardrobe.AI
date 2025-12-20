'use client';

/**
 * AppLayout - Responsive layout with TabBar and Sidebar
 */

import React, { ReactNode } from 'react';
import TabBar from './TabBar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
      
      {/* Mobile TabBar */}
      <TabBar />
    </div>
  );
}
