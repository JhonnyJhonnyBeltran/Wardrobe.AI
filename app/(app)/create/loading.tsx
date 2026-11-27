import React from 'react';

export default function CreateLoading() {
  return (
    <div className="w-full h-[100dvh] bg-white text-zinc-900 flex flex-col justify-between overflow-hidden select-none animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="h-14 border-b border-zinc-100 flex items-center justify-between px-4 sm:px-6">
        <div className="w-24 h-8 rounded-full bg-zinc-200/80" />
        <div className="w-32 h-6 rounded-md bg-zinc-200/60" />
        <div className="w-20 h-8 rounded-full bg-zinc-200/80" />
      </div>

      {/* Canvas Area Skeleton */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg aspect-[3/4] rounded-3xl bg-zinc-100 border border-zinc-200/60 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200/80" />
          <div className="w-36 h-3 rounded-full bg-zinc-200/60" />
        </div>
      </div>

      {/* Bottom Controls Skeleton */}
      <div className="h-28 border-t border-zinc-100 flex items-center justify-center gap-3 px-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-200/80" />
        <div className="w-16 h-16 rounded-2xl bg-zinc-200/80" />
        <div className="w-16 h-16 rounded-2xl bg-zinc-200/80" />
      </div>
    </div>
  );
}
