/**
 * Loading skeleton for Profile page
 * Shows while user profile data is being fetched
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center mb-8 animate-pulse">
        <div className="w-24 h-24 rounded-full bg-[var(--background-secondary)] mb-4" />
        <div className="h-6 w-32 bg-[var(--background-secondary)] rounded-full mb-2" />
        <div className="h-4 w-48 bg-[var(--background-secondary)] rounded-full" />
      </div>

      {/* Stats Skeleton */}
      <div className="flex justify-center gap-8 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-6 w-12 bg-[var(--background-secondary)] rounded-full mx-auto mb-1" />
            <div className="h-3 w-16 bg-[var(--background-secondary)] rounded-full" />
          </div>
        ))}
      </div>

      {/* Actions Skeleton */}
      <div className="flex justify-center gap-4 mb-8">
        <div className="h-10 w-28 bg-[var(--background-secondary)] rounded-full" />
        <div className="h-10 w-28 bg-[var(--background-secondary)] rounded-full" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex border-b border-[var(--border-color)] mb-4 animate-pulse">
        <div className="h-10 w-20 bg-[var(--background-secondary)] rounded-t-lg mx-1" />
        <div className="h-10 w-20 bg-[var(--background-secondary)] rounded-t-lg mx-1" />
        <div className="h-10 w-20 bg-[var(--background-secondary)] rounded-t-lg mx-1" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-[var(--background-secondary)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
