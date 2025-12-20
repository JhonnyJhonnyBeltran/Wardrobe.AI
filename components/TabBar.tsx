'use client';

/**
 * TabBar - Mobile navigation component with Clean Girl aesthetic
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  href: string;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { href: '/', label: 'Home', icon: '✨' },
  { href: '/closet', label: 'Closet', icon: '👗' },
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 gap-1 rounded-3xl py-2 transition-all ${
                isActive
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
