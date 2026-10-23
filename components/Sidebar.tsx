// ... imports
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion, LayoutGroup } from 'framer-motion';

import NavbarKlozetLogo from './NavbarKlozetLogo';
import { Home, Search, Send, UserRound, Crown, Heart } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useRealtimeStore, selectUnreadCount } from '@/store/realtimeStore';
import NotificationsPopover from './Notifications/NotificationsPopover';

interface NavItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'messages' | 'notifications';
  icon: React.ReactNode;
  isLogoMark?: boolean;
  action?: (e?: any) => void; // Add action support
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isPremium, user } = useUser();
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
      href: '#', // Prevent navigation
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
    if (labelKey === 'search') return 0; // Explicitly 0 for search
    if (labelKey === 'messages') return messageBadgeVisible ? messageUnreadCount : 0;
    if (labelKey === 'notifications') return notificationUnreadCount;
    return 0;
  };

  const { isTabBarHidden: storeTabBarHidden } = useUiStore();

  return (
    <>
      <aside className={`hidden md:flex flex-col w-[72px] min-w-[72px] max-w-[72px] shrink-0 h-screen sticky top-0 bg-[var(--background)]/90 backdrop-blur-md border-r border-[var(--border-color)] z-[5001] items-center py-6 will-change-transform isolate transition-all duration-300 ${storeTabBarHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Nav Items */}
        <LayoutGroup id="desktopSidebarNav">
        <nav className="flex-1 flex flex-col gap-5 w-full items-center">
          {navItems.map((item, index) => {
            const isActive = item.labelKey === 'notifications'
              ? showNotifications
              : (pathname === item.href || (item.href !== '/feed' && item.href !== '#' && pathname.startsWith(item.href + '/')));

            const badgeCount = getBadgeCount(item.labelKey);

            return (
              <div key={item.labelKey} className="relative group">
                {item.action ? (
                  <button
                    id={item.labelKey === 'notifications' ? 'notifications-nav-btn' : undefined}
                    onClick={item.action}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 
                      ${isActive
                        ? 'text-[var(--brand-pink,#FF66C4)]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    {/* Desktop Active Glass Lens */}
                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveGlassPill"
                        className="absolute inset-0 rounded-2xl bg-black/[0.05] dark:bg-white/[0.12] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.16] shadow-xs pointer-events-none -z-10"
                        transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.65 }}
                      />
                    )}
                    <div className="relative flex items-center justify-center pointer-events-none">
                      {React.cloneElement(item.icon as React.ReactElement<any>, {
                        strokeWidth: isActive ? 2.6 : 1.8,
                        fill: 'none',
                        className: `w-[26px] h-[26px] transition-[stroke-width] duration-200 ${(item.icon as any).props.className || ''}`
                      })}

                      {badgeCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-[var(--brand-pink,#FF66C4)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)]">
                          {badgeCount > 99 ? '+99' : badgeCount}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 
                      ${isActive
                        ? 'text-[var(--brand-pink,#FF66C4)]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    {/* Desktop Active Glass Lens */}
                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveGlassPill"
                        className="absolute inset-0 rounded-2xl bg-black/[0.05] dark:bg-white/[0.12] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.16] shadow-xs pointer-events-none -z-10"
                        transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.65 }}
                      />
                    )}
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
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-[var(--brand-pink,#FF66C4)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)]">
                              {badgeCount > 99 ? '+99' : badgeCount}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border-color)] text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.labelKey.charAt(0).toUpperCase() + item.labelKey.slice(1)}
                </div>
              </div>
            );
          })}
        </nav>
      </LayoutGroup>
      </aside>

      {/* Desktop Notifications Popover */}
      <NotificationsPopover
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
