'use client';

import React from 'react';
import { Grid3x3, Bookmark } from 'lucide-react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base Skeleton with smooth Instagram wave shimmer
 */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton-wave ${className}`}
      style={style}
    />
  );
}

/**
 * Card skeleton with wave shimmer
 */
export function SkeletonCard({ className = '', height = 260 }: { className?: string; height?: number | string }) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl ${className}`}>
      <div 
        className="w-full skeleton-wave rounded-2xl" 
        style={{ height: typeof height === 'number' ? `${height}px` : height }} 
      />
    </div>
  );
}

/**
 * 3-Column Square Grid Skeleton (Instagram Profile style)
 */
export function SkeletonProfileGrid({ count = 9, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-0.5 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="aspect-square skeleton-wave rounded-none" />
      ))}
    </div>
  );
}

/**
 * Profile Skeleton adapted to Klozet UI (Avatar + Stats + Bio + Action button + Tabs + 3-Col Grid)
 */
export function SkeletonProfile({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full min-h-screen bg-[var(--background)] ${className}`}>
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]/50 w-full md:max-w-[70%] mx-auto">
        <div className="w-6 h-6 rounded-md skeleton-wave" />
        <div className="h-5 w-28 rounded-full skeleton-wave" />
        <div className="w-6 h-6 rounded-md skeleton-wave" />
      </div>

      <main className="w-full md:max-w-[70%] mx-auto">
        <div className="px-5 pt-6">
          {/* Avatar + Stats Header */}
          <div className="flex items-center gap-8 mb-6">
            <div className="w-24 h-24 rounded-full skeleton-wave shrink-0" />
            <div className="flex-1 flex justify-around">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-5 w-8 rounded skeleton-wave" />
                <div className="h-3 w-10 rounded skeleton-wave opacity-60" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-5 w-8 rounded skeleton-wave" />
                <div className="h-3 w-14 rounded skeleton-wave opacity-60" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-5 w-8 rounded skeleton-wave" />
                <div className="h-3 w-12 rounded skeleton-wave opacity-60" />
              </div>
            </div>
          </div>

          {/* User Name & Bio */}
          <div className="pb-6 border-b border-[var(--border-color)]">
            <div className="h-4 w-32 rounded skeleton-wave mb-2" />
            <div className="h-3.5 w-48 rounded skeleton-wave opacity-70 mb-4" />
            {/* Edit Profile / Action Button */}
            <div className="w-full h-9 rounded-lg skeleton-wave" />
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-[var(--border-color)]">
          <div className="flex-1 flex items-center justify-center py-3 border-b-2 border-[var(--brand-pink)] text-[var(--brand-pink)]">
            <Grid3x3 className="w-6 h-6 opacity-40" />
          </div>
          <div className="flex-1 flex items-center justify-center py-3 border-b-2 border-transparent text-[var(--foreground-tertiary)]">
            <Bookmark className="w-6 h-6 opacity-30" />
          </div>
        </div>

        {/* 3-Column Square Grid Posts */}
        <div className="p-0.5">
          <SkeletonProfileGrid count={9} />
        </div>
      </main>
    </div>
  );
}

/**
 * Feed Skeleton with Wave Animation (Mobile 2-col + Desktop Masonry)
 */
export function SkeletonFeed({ count = 8, className = '' }: { count?: number; className?: string }) {
  const heights = [240, 300, 210, 280, 260, 320, 220, 290];
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile 2-column layout */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        <div className="flex flex-col gap-2.5">
          {heights.filter((_, i) => i % 2 === 0).map((h, i) => (
            <div key={`m-l-${i}`} className="w-full rounded-2xl skeleton-wave" style={{ height: `${h}px` }} />
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {heights.filter((_, i) => i % 2 === 1).map((h, i) => (
            <div key={`m-r-${i}`} className="w-full rounded-2xl skeleton-wave" style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>

      {/* Desktop Masonry */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {heights.slice(0, count).map((h, i) => (
          <div key={`d-${i}`} className="w-full rounded-2xl skeleton-wave" style={{ height: `${h}px` }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Search Page Skeleton (Explore Masonry Grid + Top Header)
 */
export function SkeletonSearch({ count = 8, className = '' }: { count?: number; className?: string }) {
  const heights = [220, 280, 250, 300, 210, 290, 240, 310];
  return (
    <div className={`w-full ${className}`}>
      {/* Search Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
        {heights.slice(0, count).map((h, i) => (
          <div key={i} className="w-full rounded-2xl skeleton-wave" style={{ height: `${h}px` }} />
        ))}
      </div>
    </div>
  );
}

/**
 * User Search Results Skeleton (List of users with avatar, text, button)
 */
export function SkeletonUserList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)]/50"
        >
          <div className="w-12 h-12 rounded-full skeleton-wave shrink-0" />
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="h-4 w-32 rounded skeleton-wave" />
            <div className="h-3 w-20 rounded skeleton-wave opacity-60" />
          </div>
          <div className="w-20 h-8 rounded-full skeleton-wave shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * Notifications Skeleton List (Instagram-style activity list with wave shimmer)
 */
export function SkeletonNotifications({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2 w-full">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)]/40"
        >
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full skeleton-wave shrink-0" />
          
          {/* Text Content */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="h-3.5 w-4/5 rounded skeleton-wave" />
            <div className="h-3 w-1/4 rounded skeleton-wave opacity-60" />
          </div>

          {/* Right Post Thumbnail / Action Pill */}
          {i % 2 === 0 ? (
            <div className="w-10 h-10 rounded-md skeleton-wave shrink-0" />
          ) : (
            <div className="w-18 h-8 rounded-full skeleton-wave shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
