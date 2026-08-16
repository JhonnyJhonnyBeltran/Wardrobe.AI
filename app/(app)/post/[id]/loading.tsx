/**
 * Loading skeleton for Post Detail page
 * Matches the new single-column layout with header
 */
export default function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="w-16 h-7 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Image Skeleton */}
      <div className="w-full aspect-[4/5] bg-gray-100 dark:bg-gray-800 animate-pulse" />

      {/* Action Bar Skeleton */}
      <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="w-14 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-full" />
        
        {/* Comments Section */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="h-5 w-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment Input Skeleton */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 items-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 h-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}
