'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Button from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  actionIcon?: LucideIcon;
  fullHeight?: boolean;
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
}: EmptyStateProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center p-6 ${fullHeight ? 'min-h-[50vh] py-16' : 'py-12'}`}
    >
      <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Icon className="w-10 h-10 text-[var(--foreground-tertiary)] opacity-80" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-[var(--foreground)]">{title}</h3>
      <p className="text-[var(--foreground-secondary)] max-w-sm mx-auto mb-8 text-base leading-relaxed">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="px-8 h-12 text-lg rounded-full font-bold shadow-lg shadow-[var(--brand-pink)]/20 hover:shadow-[var(--brand-pink)]/40 transition-all hover:scale-105 active:scale-95">
            {ActionIcon && <ActionIcon className="w-5 h-5 mr-2" />}
            {actionLabel}
          </Button>
        </Link>
      )}

      {actionLabel && actionOnClick && (
        <Button 
          onClick={actionOnClick}
          className="px-8 h-12 text-lg rounded-full font-bold shadow-lg shadow-[var(--brand-pink)]/20 hover:shadow-[var(--brand-pink)]/40 transition-all hover:scale-105 active:scale-95"
        >
          {ActionIcon && <ActionIcon className="w-5 h-5 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );

  return content;
}
