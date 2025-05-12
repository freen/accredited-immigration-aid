"use client"

import { useProviders } from "@/context/providers-context"
import { ProviderCard } from "./provider-card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export function ProvidersList() {
  const { providers, loading, error, userLocation, getUserLocation } = useProviders()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  if (providers.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium">No providers found</h3>
        <p className="text-muted-foreground">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!userLocation && (
        <div className="mb-4 rounded-lg border p-4">
          <p className="mb-2">Enable location services to see providers near you</p>
          <Button onClick={() => getUserLocation()} size="sm" variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Use my location
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  )
}
