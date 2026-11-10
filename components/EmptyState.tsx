'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Button from './Button';
import KloeMascot, { KloeMood } from './KloeMascot';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  actionIcon?: LucideIcon;
  fullHeight?: boolean;
  showMascot?: boolean;
  mascotMood?: KloeMood;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  actionIcon: ActionIcon,
  fullHeight = true,
  showMascot = true,
  mascotMood = 'curious',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className={`flex flex-col items-center justify-center text-center p-6 ${fullHeight ? 'min-h-[50vh] py-16' : 'py-12'}`}
    >
      {/* Living Kloe Emblem + Context Icon Badge */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-24 h-24 rounded-[20px] kz-kloe-hero flex items-center justify-center shadow-[var(--shadow-card)]">
          {showMascot ? (
            <KloeMascot mood={mascotMood} size="lg" interactive />
          ) : (
            <Icon className="w-10 h-10 text-[var(--brand-pink)]" strokeWidth={1.75} />
          )}
        </div>
        {showMascot && (
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full kz-surface-card flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--foreground)]" strokeWidth={2} />
          </div>
        )}
      </div>

      <h3 className="kz-title text-[var(--foreground)] mb-2 max-w-sm">
        {title}
      </h3>
      <p className="kz-body text-[var(--foreground-secondary)] max-w-xs mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="px-8 h-12 text-[15px] rounded-full font-semibold kz-pink-surface text-white border-0 hover:scale-[1.03] active:scale-[0.97] transition-transform">
            {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
            {actionLabel}
          </Button>
        </Link>
      )}

      {actionLabel && actionOnClick && (
        <Button
          onClick={actionOnClick}
          className="px-8 h-12 text-[15px] rounded-full font-semibold kz-pink-surface text-white border-0 hover:scale-[1.03] active:scale-[0.97] transition-transform"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
