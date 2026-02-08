'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function FloatingCreateButton() {
    const pathname = usePathname();

    // Only show on feed page
    if (pathname !== '/feed') return null;

    return (
        <div className="hidden md:block fixed bottom-8 right-8 z-50">
            <Link href="/create">
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
