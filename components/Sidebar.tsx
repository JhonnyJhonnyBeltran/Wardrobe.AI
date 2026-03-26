// ... imports
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
  action?: () => void; // Add action support
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
      action: () => setShowNotifications(!showNotifications)
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

  return (
    <>
      <aside className="hidden md:flex flex-col w-[72px] h-screen sticky top-0 bg-[var(--background)] border-r border-[var(--border-color)] z-50 items-center py-6">
        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-6 w-full items-center">
          {navItems.map((item, index) => {
            const isActive = item.labelKey === 'notifications'
              ? showNotifications
              : (pathname === item.href || (item.href !== '/feed' && item.href !== '#' && pathname.startsWith(item.href + '/')));

            const badgeCount = getBadgeCount(item.labelKey);

            return (
              <div key={item.labelKey} className="relative group">
                {item.action ? (
                  <button
                    onClick={item.action}
                    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 
                            ${isActive
                        ? 'text-[var(--brand-pink)]'
                        : 'text-black dark:text-white'
                      }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {React.cloneElement(item.icon as React.ReactElement<any>, {
                        strokeWidth: isActive ? 3 : 2,
                        className: `w-[30px] h-[30px] ${(item.icon as any).props.className || ''}`
                      })}

                      {badgeCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-[var(--brand-pink)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)]">
                          {badgeCount > 99 ? '+99' : badgeCount}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 
                        ${(isActive || item.labelKey === 'messages')
                        ? 'text-[var(--brand-pink)]'
                        : 'text-black dark:text-white'
                      }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {item.isLogoMark ? (
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className={`
                                w-[24px] h-[24px] transition-colors duration-200
                                ${isActive ? 'bg-[var(--brand-pink)]' : 'bg-black dark:bg-white'}
                            `}
                          style={{
                            maskImage: `url(/klozet-logo-dark.png)`,
                            WebkitMaskImage: `url(/klozet-logo-dark.png)`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center',
                          }}
                        />
                      ) : (
                        <>
                          {/* Clone element to apply specific styling logic matching Mobile TabBar */}
                          {React.cloneElement(item.icon as React.ReactElement<any>, {
                            strokeWidth: isActive ? (['profile', 'home'].includes(item.labelKey) ? 3.5 : 3) : 2,
                            className: `w-[30px] h-[30px] ${(item.icon as any).props.className || ''}`
                          })}

                          {badgeCount > 0 && item.labelKey !== 'search' && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-[var(--brand-pink)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)]">
                              {badgeCount > 99 ? '+99' : badgeCount}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.labelKey.charAt(0).toUpperCase() + item.labelKey.slice(1)}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Premium Button */}
        <div className="pb-4">
          {!isPremium() ? (
            <Link href="/premium">
              <div className="w-12 h-12 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all group relative cursor-pointer">
                <Crown className="w-5 h-5" />
                <div className="absolute left-full ml-3 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Get Premium
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--brand-pink)] cursor-default">
              <Crown className="w-5 h-5" />
            </div>
          )}
        </div>
      </aside>

      {/* Desktop Notifications Popover */}
      <NotificationsPopover
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
