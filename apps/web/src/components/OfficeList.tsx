"use client";

import { useState, useMemo } from 'react';
import { officeService } from '@libs/core/src/services/office-service';

export default function OfficeList() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const states = officeService.getAllStates();
  const cities = selectedState ? officeService.getCitiesInState(selectedState) : [];
  const organizations = officeService.getAllOrganizationNames();
  
  // Get filtered offices based on selections
  const offices = useMemo(() => {
    let filteredOffices = [];
    
    // Filter by location if selected
    if (selectedCity) {
      filteredOffices = officeService.getOfficesByCity(selectedState, selectedCity);
    } else if (selectedState) {
      filteredOffices = officeService.getOfficesByState(selectedState);
    } else {
      filteredOffices = officeService.getAllOffices();
    }
    
    // Filter by organization if selected
    if (selectedOrg) {
      filteredOffices = filteredOffices.filter(
        office => office.organizationName === selectedOrg
      );
    }
    
    // Apply search filter if needed
    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      filteredOffices = filteredOffices.filter(
        office => office.organizationName.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filteredOffices;
  }, [selectedState, selectedCity, selectedOrg, searchTerm]);
  
  // Get metadata
  const metadata = officeService.getMetadata();
  
  return (
    <div>
      <h1>Immigration Legal Services Offices</h1>
      <p className="metadata">
        Data source: {metadata.source} | Last updated: {new Date(metadata.lastUpdated).toLocaleDateString()}
      </p>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          value={selectedOrg} 
          onChange={(e) => setSelectedOrg(e.target.value)}
        >
          <option value="">All Organizations</option>
          {organizations.map(org => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>
        
        <select 
          value={selectedState} 
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedCity('');
          }}
        >
          <option value="">All States</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        
        {selectedState && (
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
      </div>
      
      {/* Office list */}
      <div className="results-count">
        Found {offices.length} offices
      </div>
      
      <ul className="office-list">
        {offices.map((office) => (
          <li key={office.id} className="office-item">
            <h2>{office.organizationName}</h2>
            <h3>{office.name}</h3>
            
            <div className="address">
              {office.address.formattedAddress.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
            
            <p className="phone">Phone: {office.phone}</p>
            {office.email && <p className="email">Email: {office.email}</p>}
            {office.website && (
              <p className="website">
                <a href={office.website} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}