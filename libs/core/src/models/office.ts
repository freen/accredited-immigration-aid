export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string[]; // For display purposes
}

export interface Office {
  id: string; // Unique identifier
  name: string;
  organizationName: string; // The parent organization name
  isPrincipal: boolean;
  address: Address;
  phone: string;
  email?: string;
  website?: string;
}

// For location-based lookups
export interface LocationHierarchy {
  [state: string]: {
    [city: string]: string[]; // Array of office IDs
  };
}

// The complete processed data structure
export interface ProcessedRosterData {
  offices: { [id: string]: Office };
  locations: LocationHierarchy;
  metadata: {
    lastUpdated: string;
    source: string;
    version: string;
  };
}