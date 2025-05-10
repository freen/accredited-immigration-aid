import { ProcessedRosterData } from '../models/office';

export const mockProcessedRoster: ProcessedRosterData = {
  offices: {
    "office-1": {
      id: "office-1",
      name: "Principal Office",
      organizationName: "Hispanic Catholic Social Services",
      isPrincipal: true,
      address: {
        street: "92 Oxmoor Road",
        city: "Birmingham",
        state: "AL",
        zipCode: "35209",
        formattedAddress: [
          "92 Oxmoor Road",
          "Birmingham, AL 35209"
        ]
      },
      phone: "(205) 987-4771"
    },
    "office-2": {
      id: "office-2",
      name: "Principal Office",
      organizationName: "Hispanic Interest Coalition of Alabama",
      isPrincipal: true,
      address: {
        street: "117 South Crest Drive",
        city: "Birmingham",
        state: "AL",
        zipCode: "35209",
        formattedAddress: [
          "117 South Crest Drive",
          "Birmingham, AL 35209"
        ]
      },
      phone: "(205) 942-5505"
    },
    "office-3": {
      id: "office-3",
      name: "Principal Office",
      organizationName: "Catholic Social Services Archdiocese of Mobile",
      isPrincipal: true,
      address: {
        street: "188 South Florida St.",
        city: "Mobile",
        state: "AL",
        zipCode: "36606",
        formattedAddress: [
          "188 South Florida St.",
          "Mobile, AL 36606"
        ]
      },
      phone: "(251) 434-1550"
    },
    "office-4": {
      id: "office-4",
      name: "Dothan Extension Office",
      organizationName: "Catholic Social Services Archdiocese of Mobile",
      isPrincipal: false,
      address: {
        street: "557 West Main Street",
        city: "Dothan",
        state: "AL",
        zipCode: "36302",
        formattedAddress: [
          "557 West Main Street",
          "Dothan, AL 36302"
        ]
      },
      phone: "(334) 793-3601"
    },
    "office-5": {
      id: "office-5",
      name: "Montgomery Extension Office",
      organizationName: "Catholic Social Services Archdiocese of Mobile",
      isPrincipal: false,
      address: {
        street: "4455 Narrow Lane Road",
        city: "Montgomery",
        state: "AL",
        zipCode: "36116",
        formattedAddress: [
          "4455 Narrow Lane Road",
          "Montgomery, AL 36116"
        ]
      },
      phone: "(334) 288-8890"
    },
    "office-6": {
      id: "office-6",
      name: "Principal Office",
      organizationName: "Gulf States Immigration Services",
      isPrincipal: true,
      address: {
        street: "126 Mobile Street",
        city: "Mobile",
        state: "AL",
        zipCode: "36607",
        formattedAddress: [
          "126 Mobile Street",
          "Mobile, AL 36607"
        ]
      },
      phone: "(251) 455-6328"
    },
    "office-7": {
      id: "office-7",
      name: "Principal Office",
      organizationName: "Catholic Social Services Refugee Assistance and Immigration Services",
      isPrincipal: true,
      address: {
        street: "3710 E. 20th Avenue",
        city: "Anchorage",
        state: "AK",
        zipCode: "99508",
        formattedAddress: [
          "3710 E. 20th Avenue",
          "Anchorage, AK 99508"
        ]
      },
      phone: "(907) 222-7341"
    },
    "office-8": {
      id: "office-8",
      name: "IRC - Phoenix Extension Office",
      organizationName: "International Rescue Committee, Inc.",
      isPrincipal: false,
      address: {
        street: "4425 West Olive Avenue, Suite 400",
        city: "Glendale",
        state: "AZ",
        zipCode: "85302",
        formattedAddress: [
          "4425 West Olive Avenue, Suite 400",
          "Glendale, AZ 85302"
        ]
      },
      phone: "(602) 433-2440"
    }
  },
  locations: {
    "AL": {
      "Birmingham": ["office-1", "office-2"],
      "Dothan": ["office-4"],
      "Mobile": ["office-3", "office-6"],
      "Montgomery": ["office-5"]
    },
    "AK": {
      "Anchorage": ["office-7"]
    },
    "AZ": {
      "Glendale": ["office-8"]
    }
  },
  metadata: {
    lastUpdated: "2025-05-09T12:00:00Z",
    source: "DOJ OLAP R&A Roster",
    version: "1.0.0"
  }
};