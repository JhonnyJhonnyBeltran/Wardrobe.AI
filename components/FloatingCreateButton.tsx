'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { triggerHaptic } from '@/lib/haptic';

export default function FloatingCreateButton() {
    const pathname = usePathname();

    // Show on feed and profile pages (removed closet as it has its own button)
    const showOnPages = ['/feed', '/profile'];
    if (!showOnPages.includes(pathname) && !pathname.startsWith('/profile')) return null;

    const handleClick = () => {
        triggerHaptic('medium');
    };

    // Hide on mobile if on feed (as per user request)
    const isFeed = pathname === '/feed';

    return (
        <div className={`fixed bottom-8 right-8 z-50 ${isFeed ? 'hidden md:block' : ''}`}>
            <Link href="/create-post" onClick={handleClick}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-[#FF69B4] flex items-center justify-center text-white shadow-2xl cursor-pointer hover:shadow-[0_0_30px_rgba(255,105,180,0.5)] transition-all"
                >
                    <Plus className="w-7 h-7" strokeWidth={2.5} />
                </motion.div>
            </Link>
        </div>
    );
}
