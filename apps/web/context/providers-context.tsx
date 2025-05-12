"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Office, SearchFilters } from "@/lib/core/models/office"
import { getProviders } from "@/lib/core/services/providers-service"
import { locationService } from "@/lib/core/services/location-service"

interface ProvidersContextType {
  providers: Office[]
  loading: boolean
  error: string | null
  filters: SearchFilters
  userLocation: { latitude: number; longitude: number } | null
  viewMode: "list" | "map"
  setFilters: (filters: SearchFilters) => void
  setViewMode: (mode: "list" | "map") => void
  refreshProviders: () => Promise<void>
  getUserLocation: () => Promise<void>
}

const ProvidersContext = createContext<ProvidersContextType | undefined>(undefined)

export function ProvidersContextProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({ query: "" })
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")

  const refreshProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProviders(filters, userLocation)
      setProviders(data)
    } catch (err) {
      setError("Failed to load providers. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getUserLocation = async () => {
    try {
      const position = await locationService.getCurrentPosition()
      setUserLocation(position)
      return position
    } catch (err) {
      console.error("Error getting user location:", err)
      return null
    }
  }

  useEffect(() => {
    refreshProviders()
  }, [filters, userLocation])

  return (
    <ProvidersContext.Provider
      value={{
        providers,
        loading,
        error,
        filters,
        userLocation,
        viewMode,
        setFilters,
        setViewMode,
        refreshProviders,
        getUserLocation,
      }}
    >
      {children}
    </ProvidersContext.Provider>
  )
}

export function useProviders() {
  const context = useContext(ProvidersContext)
  if (context === undefined) {
    throw new Error("useProviders must be used within a ProvidersContextProvider")
  }
  return context
}
