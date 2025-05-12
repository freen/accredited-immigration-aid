export interface Office {
  id: string
  name: string
  organizationName: string
  isPrincipal: boolean
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    formattedAddress: string[]
  }
  location?: {
    latitude: number
    longitude: number
  }
  phone: string
  email?: string
  website?: string
  distance?: number // Calculated field
}

export interface SearchFilters {
  query: string
  state?: string
  city?: string
  organizationType?: "all" | "principal" | "extension"
}
