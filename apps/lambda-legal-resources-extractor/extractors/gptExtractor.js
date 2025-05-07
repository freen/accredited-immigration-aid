const { OpenAI } = require('openai');
const { logger } = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function improvedChunking(text, maxChunkSize = 6000, overlapSize = 1000) {
  // First, normalize line breaks for consistency
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Look for structural patterns that likely indicate organization boundaries
  // Such as consecutive blank lines followed by indentation patterns
  // This avoids trying to detect organization names directly
  const lines = normalizedText.split('\n');
  const potentialBreakPoints = [];
  
  // Identify likely break points based on structural patterns
  for (let i = 2; i < lines.length; i++) {
    // Check for patterns like:
    // 1. Empty line followed by a non-empty line that's likely a header
    // 2. Line with distinctive formatting (all caps, special characters, etc.)
    // 3. Lines that follow numbering or section patterns
    
    const prevLine = lines[i-1].trim();
    const currLine = lines[i].trim();
    
    // Look for empty line followed by a line that might be an organization header
    if (prevLine === '' && currLine !== '' && 
        // Avoid breaking in the middle of addresses or contact info
        !currLine.match(/^(Phone|Tel|Email|Fax|Website|http)/i) &&
        !currLine.match(/^[0-9]+\s/) && // Avoid street addresses
        !currLine.match(/^[A-Z]{2}\s+[0-9]{5}/) && // Avoid ZIP codes
        currLine.length > 5) { // Avoid very short lines
      potentialBreakPoints.push(i);
    }
  }
  
  // Create chunks based on identified break points
  const chunks = [];
  let startIndex = 0;
  let currentChunkText = '';
  
  // Process each break point
  for (let i = 0; i < potentialBreakPoints.length; i++) {
    const breakPoint = potentialBreakPoints[i];
    const lineStartIndex = lines.slice(0, breakPoint).join('\n').length;
    
    // If adding text up to this break would exceed max size, create a chunk
    if (currentChunkText.length + (lineStartIndex - startIndex) > maxChunkSize) {
      chunks.push(currentChunkText);
      
      // Start new chunk from last position, with some overlap if possible
      const overlapStartIndex = Math.max(startIndex, lineStartIndex - overlapSize);
      currentChunkText = normalizedText.substring(overlapStartIndex, lineStartIndex);
    } else {
      // Add text up to this break point
      currentChunkText += normalizedText.substring(startIndex, lineStartIndex);
    }
    
    // Update start index for next segment
    startIndex = lineStartIndex;
  }
  
  // Add final chunk
  if (startIndex < normalizedText.length) {
    currentChunkText += normalizedText.substring(startIndex);
    chunks.push(currentChunkText);
  }
  
  // Handle case where no good break points were found
  if (chunks.length === 0 && normalizedText.length > 0) {
    // Fall back to simple sliding window approach
    return slidingWindowChunking(normalizedText, maxChunkSize, overlapSize);
  }
  
  return chunks;
}

function slidingWindowChunking(text, maxChunkSize, overlapSize) {
  const chunks = [];
  
  for (let i = 0; i < text.length; i += (maxChunkSize - overlapSize)) {
    const end = Math.min(i + maxChunkSize, text.length);
    chunks.push(text.substring(i, end));
    if (end === text.length) break;
  }
  
  return chunks;
}

/**
 * Uses GPT to extract structured data from PDF text
 * @param {string} rawText - The raw text extracted from PDF
 * @returns {Promise<Object>} - Structured JSON data of legal resources
 */
async function structureWithGpt(rawText) {
  try {
    logger.info('Starting GPT-based data extraction');
    
    // Use our improved chunking approach
    const textChunks = improvedChunking(rawText);
    logger.info(`Text split into ${textChunks.length} chunks for processing`);
    
    let allOrganizations = [];
    
    // Process each chunk
    for (const [index, chunk] of textChunks.entries()) {
      logger.info(`Processing chunk ${index + 1} of ${textChunks.length}`);
      
      const systemPrompt = `You are a data extraction specialist extracting organization information from the DOJ OLAP R&A roster.
      
IMPORTANT: Only extract COMPLETE organization entries. If an organization entry appears to be cut off or incomplete at the beginning or end of the text, DO NOT include it.

Format each organization as a JSON object with these fields:
- name: Full organization name
- address: Complete address
- phone: Phone number
- email: Email address (if available)
- website: Website URL (if available)
- services: Array of services offered
- languages: Array of languages supported
- states: Array of state abbreviations where they operate

Return ONLY a JSON array of organization objects like this:
[
  {
    "name": "Organization Name",
    "address": "Full address",
    "phone": "Phone number",
    "email": "email@example.com",
    "website": "https://example.com",
    "services": ["Service 1", "Service 2"],
    "languages": ["Language 1", "Language 2"],
    "states": ["NY", "NJ"]
  }
]

If a field is missing, include it with an empty string or empty array as appropriate.`;
      
      const userPrompt = `This is chunk ${index + 1} of ${textChunks.length} from the DOJ OLAP R&A Roster. Extract ONLY COMPLETE organization entries, skipping any that appear to be cut off at the beginning or end.

${chunk}`;
      
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });
        
        const result = completion.choices[0].message.content;
        
        try {
          // Try to parse the JSON response
          const parsedData = JSON.parse(result);
          
          // Add to our organizations list
          if (Array.isArray(parsedData)) {
            allOrganizations = [...allOrganizations, ...parsedData];
          } else if (parsedData.organizations && Array.isArray(parsedData.organizations)) {
            allOrganizations = [...allOrganizations, ...parsedData.organizations];
          } else {
            logger.warn(`Unexpected format in chunk ${index + 1}, skipping`);
          }
        } catch (parseError) {
          logger.error(`Failed to parse GPT response for chunk ${index + 1}: ${parseError.message}`);
          // Continue with other chunks even if one fails
        }
      } catch (apiError) {
        logger.error(`API error for chunk ${index + 1}: ${apiError.message}`);
        // Add retry logic if needed
      }
    }
    
    logger.info(`Extracted ${allOrganizations.length} organizations successfully`);
    
    // Remove duplicates based on organization name and merge fields
    const orgMap = new Map();
    for (const org of allOrganizations) {
      if (!org.name) continue;
      
      if (orgMap.has(org.name)) {
        // Merge fields if org appears in multiple chunks (potential overlaps)
        const existingOrg = orgMap.get(org.name);
        const mergedOrg = mergeOrganizations(existingOrg, org);
        orgMap.set(org.name, mergedOrg);
      } else {
        orgMap.set(org.name, org);
      }
    }
    
    const uniqueOrgs = Array.from(orgMap.values());
    logger.info(`Reduced to ${uniqueOrgs.length} unique organizations after merging`);
    
    return {
      organizations: uniqueOrgs,
      metadata: {
        source: "DOJ OLAP R&A Roster",
        extractedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error(`GPT extraction failed: ${error.message}`);
    throw new Error(`Failed to structure data with GPT: ${error.message}`);
  }
}

// Helper function to merge organization data from overlapping chunks
function mergeOrganizations(org1, org2) {
  const merged = { ...org1 };
  
  // For simple fields, use non-empty value
  ['address', 'phone', 'email', 'website'].forEach(field => {
    if (!merged[field] && org2[field]) {
      merged[field] = org2[field];
    }
  });
  
  // For array fields, combine unique values
  ['services', 'languages', 'states'].forEach(field => {
    if (Array.isArray(org2[field])) {
      if (!Array.isArray(merged[field])) {
        merged[field] = [];
      }
      
      // Add unique values from org2
      org2[field].forEach(item => {
        if (!merged[field].includes(item)) {
          merged[field].push(item);
        }
      });
    }
  });
  
  return merged;
}

module.exports = {
  structureWithGpt
};