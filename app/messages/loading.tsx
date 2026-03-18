/**
 * Loading skeleton for Messages page
 * Shows while conversations are being fetched
 */
export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-[var(--border-color)] animate-pulse">
        <div className="h-7 w-32 bg-[var(--background-secondary)] rounded-full" />
      </div>

      {/* Conversations List Skeleton */}
      <div className="flex-1 overflow-y-auto">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 border-b border-[var(--border-color)] animate-pulse"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--background-secondary)]" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-[var(--background-secondary)] rounded-full mb-2" />
              <div className="h-3 w-40 bg-[var(--background-secondary)] rounded-full" />
            </div>
            {i % 3 === 0 && (
              <div className="w-5 h-5 rounded-full bg-[var(--background-secondary)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
