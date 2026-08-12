'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--background-secondary)] rounded-xl ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
    </div>
  );
}

export function SkeletonProfile({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-4 p-4 ${className}`}>
      <Skeleton className="w-24 h-24 rounded-full shrink-0" />
      <div className="flex flex-col items-center gap-2 w-full">
        <Skeleton className="h-6 w-1/3 rounded" />
        <Skeleton className="h-4 w-1/4 rounded" />
      </div>
      <div className="flex justify-center gap-6 w-full mt-2">
        <Skeleton className="h-10 w-1/4 rounded" />
        <Skeleton className="h-10 w-1/4 rounded" />
        <Skeleton className="h-10 w-1/4 rounded" />
      </div>
    </div>
  );
}
