import type { Office, SearchFilters } from "../models/office"
import { locationService } from "./location-service"

// Mock data for demonstration
const mockProviders: Office[] = [
  {
    id: "1",
    name: "Immigration Legal Services",
    organizationName: "Catholic Charities",
    isPrincipal: true,
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      formattedAddress: ["123 Main St", "New York, NY 10001"],
    },
    location: {
      latitude: 40.7128,
      longitude: -74.006,
    },
    phone: "(212) 555-1234",
    email: "info@ccils.org",
    website: "https://catholiccharities.org/immigration",
  },
  {
    id: "2",
    name: "Refugee Assistance Program",
    organizationName: "Lutheran Immigration and Refugee Service",
    isPrincipal: false,
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      formattedAddress: ["456 Oak Ave", "Los Angeles, CA 90001"],
    },
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
    },
    phone: "(323) 555-6789",
    email: "help@lirs.org",
    website: "https://lirs.org",
  },
  {
    id: "3",
    name: "Immigration Law Center",
    organizationName: "ACLU Foundation",
    isPrincipal: true,
    address: {
      street: "789 Pine Blvd",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      formattedAddress: ["789 Pine Blvd", "Chicago, IL 60601"],
    },
    location: {
      latitude: 41.8781,
      longitude: -87.6298,
    },
    phone: "(312) 555-9012",
    website: "https://aclu.org/immigration",
  },
  {
    id: "4",
    name: "Asylum Seeker Advocacy",
    organizationName: "Human Rights First",
    isPrincipal: true,
    address: {
      street: "101 Liberty St",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      formattedAddress: ["101 Liberty St", "Miami, FL 33101"],
    },
    location: {
      latitude: 25.7617,
      longitude: -80.1918,
    },
    phone: "(305) 555-3456",
    email: "asylum@hrf.org",
    website: "https://humanrightsfirst.org",
  },
  {
    id: "5",
    name: "Immigrant Justice Project",
    organizationName: "Legal Aid Society",
    isPrincipal: false,
    address: {
      street: "202 Freedom Ave",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      formattedAddress: ["202 Freedom Ave", "Houston, TX 77001"],
    },
    location: {
      latitude: 29.7604,
      longitude: -95.3698,
    },
    phone: "(713) 555-7890",
    email: "justice@legalaid.org",
    website: "https://legalaid.org/immigration",
  },
]

export async function getProviders(
  filters?: SearchFilters,
  userLocation?: { latitude: number; longitude: number },
): Promise<Office[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredProviders = [...mockProviders]

  // Apply filters
  if (filters) {
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filteredProviders = filteredProviders.filter(
        (provider) =>
          provider.name.toLowerCase().includes(query) ||
          provider.organizationName.toLowerCase().includes(query) ||
          provider.address.city.toLowerCase().includes(query) ||
          provider.address.state.toLowerCase().includes(query),
      )
    }

    if (filters.state) {
      filteredProviders = filteredProviders.filter((provider) => provider.address.state === filters.state)
    }

    if (filters.city) {
      filteredProviders = filteredProviders.filter((provider) => provider.address.city === filters.city)
    }

    if (filters.organizationType && filters.organizationType !== "all") {
      filteredProviders = filteredProviders.filter(
        (provider) =>
          (filters.organizationType === "principal" && provider.isPrincipal) ||
          (filters.organizationType === "extension" && !provider.isPrincipal),
      )
    }
  }

  // Calculate distance if user location is provided
  if (userLocation) {
    filteredProviders = filteredProviders.map((provider) => {
      if (provider.location) {
        return {
          ...provider,
          distance: locationService.getDistance(
            userLocation.latitude,
            userLocation.longitude,
            provider.location.latitude,
            provider.location.longitude,
          ),
        }
      }
      return provider
    })

    // Sort by distance
    filteredProviders.sort(
      (a, b) => (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY),
    )
  }

  return filteredProviders
}

export async function getProviderById(id: string): Promise<Office | null> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const provider = mockProviders.find((p) => p.id === id)
  return provider || null
}

export async function getStates(): Promise<string[]> {
  // Get unique states from providers
  const states = [...new Set(mockProviders.map((p) => p.address.state))]
  return states.sort()
}

export async function getCities(state?: string): Promise<string[]> {
  // Get unique cities, optionally filtered by state
  let providers = mockProviders
  if (state) {
    providers = providers.filter((p) => p.address.state === state)
  }

  const cities = [...new Set(providers.map((p) => p.address.city))]
  return cities.sort()
}
