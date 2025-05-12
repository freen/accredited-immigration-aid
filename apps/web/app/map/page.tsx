import { Suspense } from "react"
import { MapView } from "@/components/map-view"
import { MapViewSkeleton } from "@/components/skeletons/map-view-skeleton"
import { ProvidersContextProvider } from "@/context/providers-context"

export default function MapPage() {
  return (
    <main className="min-h-screen">
      <ProvidersContextProvider>
        <Suspense fallback={<MapViewSkeleton />}>
          <MapView />
        </Suspense>
      </ProvidersContextProvider>
    </main>
  )
}
