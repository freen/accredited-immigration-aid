const { logger } = require('./logger');

/**
 * Compares previous and current data to detect changes
 * @param {Object} previousData - Previous version of the data
 * @param {Object} currentData - Current version of the data
 * @returns {Object} - Object containing change information
 */
function detectChanges(previousData, currentData) {
  try {
    logger.info('Beginning change detection');
    
    const prevOrgs = previousData.organizations || [];
    const currOrgs = currentData.organizations || [];
    
    // Create maps for faster lookups
    const prevOrgMap = new Map(prevOrgs.map(org => [org.name, org]));
    const currOrgMap = new Map(currOrgs.map(org => [org.name, org]));
    
    const changes = {};
    
    // Find added and modified organizations
    for (const org of currOrgs) {
      const orgName = org.name;
      
      if (!prevOrgMap.has(orgName)) {
        // Organization was added
        changes[orgName] = {
          type: 'added',
          details: { newData: org }
        };
      } else {
        // Check if organization was modified
        const prevOrg = prevOrgMap.get(orgName);
        const diff = getObjectDifferences(prevOrg, org);
        
        if (Object.keys(diff).length > 0) {
          changes[orgName] = {
            type: 'modified',
            details: {
              changes: diff,
              previous: prevOrg,
              current: org
            }
          };
        }
      }
    }
    
    // Find removed organizations
    for (const org of prevOrgs) {
      const orgName = org.name;
      
      if (!currOrgMap.has(orgName)) {
        // Organization was removed
        changes[orgName] = {
          type: 'removed',
          details: { oldData: org }
        };
      }
    }
    
    const hasChanges = Object.keys(changes).length > 0;
    
    logger.info(`Change detection complete. Found ${Object.keys(changes).length} changes.`);
    if (hasChanges) {
      logger.info(`- Added: ${Object.values(changes).filter(c => c.type === 'added').length}`);
      logger.info(`- Modified: ${Object.values(changes).filter(c => c.type === 'modified').length}`);
      logger.info(`- Removed: ${Object.values(changes).filter(c => c.type === 'removed').length}`);
    }
    
    return {
      hasChanges,
      changeLog: {
        timestamp: new Date().toISOString(),
        source: "DOJ OLAP R&A Roster",
        changes
      }
    };
  } catch (error) {
    logger.error(`Error in change detection: ${error.message}`);
    throw new Error(`Failed to detect changes: ${error.message}`);
  }
}

/**
 * Helper function to find differences between two objects
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Object} - Object containing only the differences
 */
function getObjectDifferences(obj1, obj2) {
  const diff = {};
  
  // Check for changed values
  for (const key in obj2) {
    if (typeof obj2[key] === 'object' && obj2[key] !== null && obj1[key] !== undefined) {
      // Recursively check nested objects
      const nestedDiff = getObjectDifferences(obj1[key], obj2[key]);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diff[key] = {
        previous: obj1[key],
        current: obj2[key]
      };
    }
  }
  
  return diff;
}

module.exports = {
  detectChanges
};