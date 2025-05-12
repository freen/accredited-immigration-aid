import { Suspense } from "react"
import { ProvidersList } from "@/components/providers-list"
import { SearchFilters } from "@/components/search-filters"
import { ViewToggle } from "@/components/view-toggle"
import { ProviderListSkeleton } from "@/components/skeletons/provider-list-skeleton"
import { ProvidersContextProvider } from "@/context/providers-context"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Accredited Immigration Aid</h1>
          <p className="text-muted-foreground">Find accredited immigration legal service providers near you</p>
        </header>

        <ProvidersContextProvider>
          <div className="mb-6 space-y-4">
            <SearchFilters />
            <ViewToggle />
          </div>

          <Suspense fallback={<ProviderListSkeleton />}>
            <ProvidersList />
          </Suspense>
        </ProvidersContextProvider>
      </div>
    </main>
  )
}
