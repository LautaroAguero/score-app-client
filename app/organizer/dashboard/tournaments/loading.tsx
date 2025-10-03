export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-11 w-48 bg-muted rounded animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="glass rounded-lg p-6">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />

          {/* Tournament Cards Skeleton */}
          <div className="space-y-4 mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-strong rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div
                          key={j}
                          className="h-4 w-24 bg-muted rounded animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-9 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-9 w-10 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
