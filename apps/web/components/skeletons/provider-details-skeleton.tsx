export function ProviderDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      <div className="space-y-4 rounded-lg border p-6">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-1/3 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
          <div className="h-[300px] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
