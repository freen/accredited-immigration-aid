export function MapViewSkeleton() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
      <div className="h-[50vh] w-full animate-pulse bg-muted md:h-full md:w-2/3" />
      <div className="h-[50vh] w-full p-4 md:h-full md:w-1/3">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
