/**
 * Loading state for Feed page (Desktop only minimal layout)
 */
export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4 hidden md:block">
      {/* Desktop subtle placeholder */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-[var(--background-secondary)] rounded-full" />
        <div className="h-10 w-10 rounded-full bg-[var(--background-secondary)]" />
      </div>

      <div className="columns-3 lg:columns-4 gap-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-[var(--background-secondary)]"
            style={{ height: [200, 240, 220][i % 3] + 'px' }}
          />
        ))}
      </div>
    </div>
  );
}
