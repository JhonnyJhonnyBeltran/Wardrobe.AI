/**
 * Loading skeleton for Closet page
 * Shows while wardrobe data is being fetched
 */
export default function ClosetLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="h-8 w-24 bg-[var(--background-secondary)] rounded-full" />
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-lg bg-[var(--background-secondary)]" />
          <div className="h-10 w-10 rounded-lg bg-[var(--background-secondary)]" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 mb-6 animate-pulse">
        <div className="h-10 w-20 bg-[var(--background-secondary)] rounded-full" />
        <div className="h-10 w-20 bg-[var(--background-secondary)] rounded-full" />
        <div className="h-10 w-20 bg-[var(--background-secondary)] rounded-full" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-[var(--background-secondary)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
