import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';

import NavbarKlozetLogo from './NavbarKlozetLogo';
import { Home, Search, Send, UserRound, Heart } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useRealtimeStore, selectUnreadCount } from '@/store/realtimeStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import NotificationsPopover from './Notifications/NotificationsPopover';

interface NavItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'messages' | 'notifications';
  icon: React.ReactNode;
  isLogoMark?: boolean;
  action?: (e?: any) => void;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();
  const syncUnreadCount = useMessageStore(state => state.syncUnreadCount);

  // Sync unread count on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      syncUnreadCount(user.id);
    }
  }, [user?.id, syncUnreadCount]);

  // State for popover
  const [showNotifications, setShowNotifications] = useState(false);

  // Message notifications
  const messageUnreadCount = useMessageStore(selectTotalUnread);
  const messageBadgeVisible = useMessageStore(selectBadgeVisible);
  // Notification count
  const notificationUnreadCount = useRealtimeStore(selectUnreadCount);

  const navItems: NavItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home /> },
    { href: '/search', labelKey: 'search', icon: <Search /> },
    { href: '/messages', labelKey: 'messages', icon: <Send /> },
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
    if (labelKey === 'search') return 0;
    if (labelKey === 'messages') return messageBadgeVisible ? messageUnreadCount : 0;
    if (labelKey === 'notifications') return notificationUnreadCount;
    return 0;
  };

  const { isTabBarHidden: storeTabBarHidden } = useUiStore();

  return (
    <>
      <aside className={`hidden md:flex flex-col w-[82px] min-w-[82px] max-w-[82px] shrink-0 h-screen sticky top-0 bg-[var(--background)]/90 backdrop-blur-md border-r border-[var(--border-color)] z-[5001] items-center py-6 will-change-transform isolate transition-all duration-300 ${storeTabBarHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-3.5 w-full items-center px-1.5">
          {navItems.map((item) => {
            const isActive = item.labelKey === 'notifications'
              ? showNotifications
              : (pathname === item.href || (item.href !== '/feed' && item.href !== '#' && pathname.startsWith(item.href + '/')));

            const badgeCount = getBadgeCount(item.labelKey);
            const shortText =
              item.labelKey === 'notifications'
                ? 'Actividad'
                : t.nav[item.labelKey];

            return (
              <div key={item.labelKey} className="relative group w-full flex justify-center">
                {item.action ? (
                  <button
                    id={item.labelKey === 'notifications' ? 'notifications-nav-btn' : undefined}
                    aria-label={t.nav[item.labelKey]}
                    onClick={item.action}
                    className={`relative flex flex-col items-center justify-center gap-1 w-full py-2 rounded-[20px] transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'bg-[var(--brand-pink,#FF66C4)]/10 text-[var(--brand-pink,#FF66C4)]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-[var(--background-secondary)] hover:text-black dark:hover:text-white'
                      }`}
                  >
                    <div className="relative flex items-center justify-center pointer-events-none">
                      {React.cloneElement(item.icon as React.ReactElement<any>, {
                        strokeWidth: isActive ? 2.5 : 1.8,
                        fill: 'none',
                        className: `w-[22px] h-[22px] transition-[stroke-width] duration-200 ${(item.icon as any).props.className || ''}`
                      })}

                      {badgeCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[var(--brand-pink,#FF66C4)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)]">
                          {badgeCount > 99 ? '+99' : badgeCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] leading-none tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {shortText}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    aria-label={t.nav[item.labelKey]}
                    className={`relative flex flex-col items-center justify-center gap-1 w-full py-2 rounded-[20px] transition-all duration-200
                      ${isActive
                        ? 'bg-[var(--brand-pink,#FF66C4)]/10 text-[var(--brand-pink,#FF66C4)]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-[var(--background-secondary)] hover:text-black dark:hover:text-white'
                      }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {item.isLogoMark ? (
                        <motion.div
                          whileTap={{ scale: 0.86 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          className="relative w-[40px] h-[22px] flex items-center justify-center"
                        >
                          <NavbarKlozetLogo isActive={isActive} />
                        </motion.div>
                      ) : (
                        <>
                          {React.cloneElement(item.icon as React.ReactElement<any>, {
                            strokeWidth: isActive ? 2.5 : 1.8,
                            fill: 'none',
                            className: `w-[22px] h-[22px] transition-[stroke-width] duration-200 ${(item.icon as any).props.className || ''}`
                          })}

                          {badgeCount > 0 && item.labelKey !== 'search' && (
                            <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[var(--brand-pink,#FF66C4)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)]">
                              {badgeCount > 99 ? '+99' : badgeCount}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <span className={`text-[10px] leading-none tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {shortText}
                    </span>
                  </Link>
                )}
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
