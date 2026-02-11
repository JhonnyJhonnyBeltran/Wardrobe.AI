'use client';

/**
 * BubbleToggle — Animated circle-to-panel toggle
 *
 * Renders a circular FAB-style button (collapsed) that expands into
 * panel content with a spring "bubble" animation. Designed for reuse
 * across any collapsible UI pattern: filters, menus, action panels, etc.
 *
 * Features:
 * - Spring-based bubble animation (scale 0 → 1)
 * - Active count badge on collapsed circle
 * - Configurable icon, size, and transform origin
 * - Accessible ARIA attributes
 *
 * @example
 * <BubbleToggle
 *   isOpen={showFilters}
 *   onToggle={() => setShowFilters(v => !v)}
 *   icon={Filter}
 *   activeCount={2}
 *   ariaLabel="Filtros"
 * >
 *   <FilterPanel />
 * </BubbleToggle>
 */

import { memo, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// ─── Animation Configuration ──────────────────────────────────────

const SPRING = { type: 'spring', stiffness: 300, damping: 25 } as const;

const triggerVariants: Variants = {
  hidden:  { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: SPRING },
  exit:    { scale: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

const panelVariants: Variants = {
  hidden:  { scale: 0.3, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: SPRING },
  exit:    { scale: 0.3, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const badgeVariants: Variants = {
  hidden:  { scale: 0 },
  visible: { scale: 1, transition: { ...SPRING, delay: 0.1 } },
};

// ─── Types ────────────────────────────────────────────────────────

export interface BubbleToggleProps {
  /** Controlled open/closed state */
  isOpen: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Lucide icon rendered inside the collapsed circle */
  icon: LucideIcon;
  /** Content rendered when expanded */
  children: ReactNode;
  /** Badge count on the circle (hidden when 0) */
  activeCount?: number;
  /** Accessible label for the trigger button */
  ariaLabel?: string;
  /** Circle diameter in px (default: 56 — matches w-14) */
  size?: number;
  /** CSS class for the root wrapper (use for positioning) */
  className?: string;
  /** CSS transform-origin for the expand animation */
  origin?: string;
}

// ─── Component ────────────────────────────────────────────────────

const BubbleToggle = memo(function BubbleToggle({
  isOpen,
  onToggle,
  icon: Icon,
  children,
  activeCount = 0,
  ariaLabel = 'Toggle',
  size = 56,
  className = '',
  origin = 'bottom left',
}: BubbleToggleProps) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ── Collapsed: Circle Trigger ── */
          <motion.button
            key="bubble-trigger"
            variants={triggerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            style={{ width: size, height: size }}
            className="rounded-full bg-[var(--brand-pink)] shadow-lg shadow-[var(--brand-pink)]/40 flex items-center justify-center text-white hover:bg-[var(--brand-pink-dark)] transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--brand-pink)]/30 relative"
            aria-label={ariaLabel}
            aria-expanded={false}
          >
            <Icon className="w-7 h-7" />

            {activeCount > 0 && (
              <motion.span
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-white text-[var(--brand-pink)] text-xs font-bold rounded-full flex items-center justify-center shadow-sm"
              >
                {activeCount}
              </motion.span>
            )}
          </motion.button>
        ) : (
          /* ── Expanded: Panel Content ── */
          <motion.div
            key="bubble-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: origin }}
            aria-expanded={true}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default BubbleToggle;
