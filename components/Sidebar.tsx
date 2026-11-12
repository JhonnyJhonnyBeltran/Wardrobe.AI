import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';

import NavbarKlozetLogo from './NavbarKlozetLogo';
import { Home, Search, UserRound, Heart } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useRealtimeStore, selectUnreadCount } from '@/store/realtimeStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import NotificationsPopover from './Notifications/NotificationsPopover';

interface NavItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'notifications';
  icon: React.ReactNode;
  isLogoMark?: boolean;
  action?: (e?: any) => void;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // State for popover
  const [showNotifications, setShowNotifications] = useState(false);

  // Notification count
  const notificationUnreadCount = useRealtimeStore(selectUnreadCount);

  const navItems: NavItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home /> },
    { href: '/search', labelKey: 'search', icon: <Search /> },
    { href: '/closet', labelKey: 'closet', icon: null, isLogoMark: true },
    {
      href: '#',
      labelKey: 'notifications',
      icon: <Heart />,
      action: (e) => {
        e?.preventDefault();
        setShowNotifications(prev => !prev);
      }
    },
    { href: '/profile', labelKey: 'profile', icon: <UserRound /> },
  ];

  // Helper to get badge count for each nav item
  const getBadgeCount = (labelKey: string): number => {
    if (labelKey === 'notifications') return notificationUnreadCount;
    return 0;
  };

  const { isTabBarHidden: storeTabBarHidden } = useUiStore();

  return (
    <>
      <aside className={`hidden md:flex flex-col w-[72px] min-w-[72px] max-w-[72px] shrink-0 h-screen sticky top-0 bg-[var(--background)]/90 backdrop-blur-md border-r border-[var(--border-color)] dark:border-[var(--brand-pink)]/50 z-[5001] items-center py-6 will-change-transform isolate transition-all duration-300 ${storeTabBarHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-5 w-full items-center">
          {navItems.map((item) => {
            const isActive = item.labelKey === 'notifications'
              ? showNotifications
              : (pathname === item.href || (item.href !== '/feed' && item.href !== '#' && pathname.startsWith(item.href + '/')));

            const badgeCount = getBadgeCount(item.labelKey);

            return (
              <div key={item.labelKey} className="relative group">
                {item.action ? (
                  <button
                    id={item.labelKey === 'notifications' ? 'notifications-nav-btn' : undefined}
                    aria-label={t.nav[item.labelKey]}
                    onClick={item.action}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 
                      ${isActive
                        ? 'text-[var(--brand-pink,#FF66C4)]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    <div className="relative flex items-center justify-center pointer-events-none">
                      {React.cloneElement(item.icon as React.ReactElement<any>, {
                        strokeWidth: isActive ? 2.6 : 1.8,
                        fill: 'none',
                        className: `w-[26px] h-[26px] transition-[stroke-width] duration-200 ${(item.icon as any).props.className || ''}`
                      })}

                      {badgeCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.3, 1] }}
                          transition={{ type: 'spring', stiffness: 550, damping: 20 }}
                          aria-hidden="true"
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--brand-pink,#FF66C4)] ring-2 ring-[var(--background)] shadow-[0_0_8px_rgba(255,102,196,0.55)]"
                        />
                      )}
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    aria-label={t.nav[item.labelKey]}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 
                      ${isActive
                        ? 'text-[var(--brand-pink,#FF66C4)]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {item.isLogoMark ? (
                        <motion.div
                          whileTap={{ scale: 0.86 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          className="relative w-[46px] h-[28px] flex items-center justify-center"
                        >
                          <NavbarKlozetLogo isActive={isActive} />
                        </motion.div>
                      ) : (
                        <>
                          {React.cloneElement(item.icon as React.ReactElement<any>, {
                            strokeWidth: isActive ? 2.6 : 1.8,
                            fill: 'none',
                            className: `w-[26px] h-[26px] transition-[stroke-width] duration-200 ${(item.icon as any).props.className || ''}`
                          })}

                          {badgeCount > 0 && item.labelKey !== 'search' && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.3, 1] }}
                              transition={{ type: 'spring', stiffness: 550, damping: 20 }}
                              aria-hidden="true"
                              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--brand-pink,#FF66C4)] ring-2 ring-[var(--background)] shadow-[0_0_8px_rgba(255,102,196,0.55)]"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border-color)] text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t.nav[item.labelKey]}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Notifications Popover */}
      <NotificationsPopover
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
