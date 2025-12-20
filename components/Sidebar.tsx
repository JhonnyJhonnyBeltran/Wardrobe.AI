'use client';

/**
 * Sidebar - Desktop navigation component with Clean Girl aesthetic
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: '✨' },
  { href: '/closet', label: 'Closet', icon: '👗' },
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Wardrobe.AI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-3xl transition-all ${
                isActive
                  ? 'bg-pink-50 text-pink-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Upgrade to Premium
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Unlock unlimited outfit history
          </p>
          <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full py-2 text-sm font-medium hover:shadow-lg transition-all">
            Go Premium
          </button>
        </div>
      </div>
    </aside>
  );
}
