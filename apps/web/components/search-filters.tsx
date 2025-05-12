"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useProviders } from "@/context/providers-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { getStates, getCities } from "@/lib/core/services/providers-service"

export function SearchFilters() {
  const { filters, setFilters } = useProviders()
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(filters.query || "")

  // Load states on component mount
  useEffect(() => {
    async function loadStates() {
      const statesList = await getStates()
      setStates(statesList)
    }
    loadStates()
  }, [])

  // Load cities when state changes
  useEffect(() => {
    async function loadCities() {
      const citiesList = await getCities(filters.state)
      setCities(citiesList)
    }
    loadCities()
  }, [filters.state])

  const handleSearch = () => {
    setFilters({ ...filters, query: searchQuery })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setFilters({ query: "" })
  }

  const hasActiveFilters = filters.query || filters.state || filters.city || filters.organizationType

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <div className="relative flex-grow">
          <Input
            placeholder="Search by name, organization, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          <Button variant="ghost" size="icon" className="absolute right-0 top-0" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleSearch} className="sm:w-auto">
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select
          value={filters.state || ""}
          onValueChange={(value) => setFilters({ ...filters, state: value, city: undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city || ""}
          onValueChange={(value) => setFilters({ ...filters, city: value })}
          disabled={!filters.state}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.organizationType || "all"}
          onValueChange={(value: "all" | "principal" | "extension") =>
            setFilters({ ...filters, organizationType: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Office type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All offices</SelectItem>
            <SelectItem value="principal">Principal offices</SelectItem>
            <SelectItem value="extension">Extension offices</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
