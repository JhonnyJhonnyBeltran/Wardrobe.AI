import React from 'react';

export default function CreatePostLoading() {
  return (
    <div className="w-full min-h-[100dvh] bg-[var(--background)] flex flex-col justify-between p-4 max-w-lg mx-auto animate-pulse">
      <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between mb-4">
        <div className="w-20 h-6 rounded-full bg-zinc-200/80" />
        <div className="w-24 h-6 rounded-md bg-zinc-200/60" />
        <div className="w-16 h-8 rounded-full bg-zinc-200/80" />
      </div>

      <div className="flex-1 space-y-4">
        <div className="w-full aspect-[4/5] rounded-3xl bg-zinc-100 border border-zinc-200/60" />
        <div className="w-full h-12 rounded-2xl bg-zinc-100" />
        <div className="w-3/4 h-8 rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}
