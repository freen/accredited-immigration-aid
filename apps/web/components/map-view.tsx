"use client"

import { useEffect } from "react"
import { useProviders } from "@/context/providers-context"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { MapContainer } from "./map-container"
import { ProvidersList } from "./providers-list"

export function MapView() {
  const { providers, loading, error, userLocation, getUserLocation, setViewMode } = useProviders()

  useEffect(() => {
    setViewMode("map")
    return () => setViewMode("list")
  }, [setViewMode])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  const defaultCenter = { latitude: 39.8283, longitude: -98.5795 } // Center of US
  const center = userLocation || (providers[0]?.location ? providers[0].location : defaultCenter)

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
      <div className="h-[50vh] w-full md:h-full md:w-2/3">
        <div className="relative h-full w-full">
          <MapContainer providers={providers} center={center} zoom={userLocation ? 10 : 4} />

          {!userLocation && (
            <div className="absolute bottom-4 left-0 right-0 mx-auto w-fit">
              <Button onClick={() => getUserLocation()} size="sm" variant="default">
                <MapPin className="mr-2 h-4 w-4" />
                Use my location
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="h-[50vh] w-full overflow-y-auto p-4 md:h-full md:w-1/3">
        <ProvidersList />
      </div>
    </div>
  )
}
