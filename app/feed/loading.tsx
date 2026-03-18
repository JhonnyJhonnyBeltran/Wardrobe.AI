/**
 * Loading skeleton for Feed page
 * Shows while data is being fetched
 */
export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="h-8 w-32 bg-[var(--background-secondary)] rounded-full" />
        <div className="h-10 w-10 rounded-full bg-[var(--background-secondary)]" />
      </div>

      {/* Masonry Grid Skeleton */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-[var(--card-bg)]"
          >
            <div 
              className="bg-[var(--background-secondary)] animate-pulse"
              style={{
                height: Math.random() * 100 + 200 + 'px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
