import { 
    ProcessedRosterData,
    Office
  } from '../models/office';
  import { mockProcessedRoster } from '../data/mock-roster';
  
  export class OfficeService {
    private data: ProcessedRosterData;
    
    constructor(initialData?: ProcessedRosterData) {
      this.data = initialData || {
        offices: {},
        locations: {},
        metadata: {
          lastUpdated: new Date().toISOString(),
          source: "Empty Dataset",
          version: "1.0.0"
        }
      };
    }
  
    // Get all states
    getAllStates(): string[] {
      return Object.keys(this.data.locations);
    }
  
    // Get all cities in a state
    getCitiesInState(state: string): string[] {
      return Object.keys(this.data.locations[state] || {});
    }
  
    // Get all offices
    getAllOffices(): Office[] {
      return Object.values(this.data.offices);
    }
  
    // Get office by ID
    getOfficeById(id: string): Office | undefined {
      return this.data.offices[id];
    }
  
    // Get offices by state
    getOfficesByState(state: string): Office[] {
      const stateData = this.data.locations[state];
      if (!stateData) return [];
      
      const officeIds = new Set<string>();
      Object.values(stateData).forEach(cityOfficeIds => {
        cityOfficeIds.forEach(id => officeIds.add(id));
      });
      
      return Array.from(officeIds).map(id => this.data.offices[id]);
    }
  
    // Get offices by city
    getOfficesByCity(state: string, city: string): Office[] {
      const officeIds = this.data.locations[state]?.[city] || [];
      return officeIds.map(id => this.data.offices[id]);
    }
  
    // Search offices by organization name
    searchByOrganization(query: string): Office[] {
      const lowerQuery = query.toLowerCase();
      return this.getAllOffices().filter(office => 
        office.organizationName.toLowerCase().includes(lowerQuery)
      );
    }
  
    // Get all unique organization names
    getAllOrganizationNames(): string[] {
      const orgNames = new Set<string>();
      this.getAllOffices().forEach(office => {
        orgNames.add(office.organizationName);
      });
      return Array.from(orgNames).sort();
    }
  
    // Get offices by organization name
    getOfficesByOrganization(name: string): Office[] {
      return this.getAllOffices().filter(office => 
        office.organizationName === name
      );
    }
  
    // Get metadata
    getMetadata() {
      return this.data.metadata;
    }
  }
  
  // Export a singleton instance initialized with mock data
  export const officeService = new OfficeService(mockProcessedRoster);
  
  // For testing or reinitialization
  export function initializeWithData(data: ProcessedRosterData): OfficeService {
    return new OfficeService(data);
  }