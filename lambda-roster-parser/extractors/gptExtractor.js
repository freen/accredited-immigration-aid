const { OpenAI } = require('openai');
const { logger } = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Chunks text into segments of specified size for API processing
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Maximum size of each chunk
 * @returns {Array<string>} - Array of text chunks
 */
function chunkText(text, chunkSize = 6000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
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
    
    // Check if we need to chunk the text
    const textChunks = chunkText(rawText);
    logger.info(`Text split into ${textChunks.length} chunks for processing`);
    
    let allOrganizations = [];
    
    // Process each chunk
    for (const [index, chunk] of textChunks.entries()) {
      logger.info(`Processing chunk ${index + 1} of ${textChunks.length}`);
      
      const systemPrompt = 
        "You are a data extraction specialist. Extract organizations from the DOJ OLAP R&A roster into structured data. " +
        "Format as an array of objects with fields: name, address, phone, email, website, services, languages, states. " +
        "If a field is missing, include it with an empty value. Make sure the output is valid JSON.";
      
      const userPrompt = 
        "This is text from the DOJ OLAP Recognized Organizations and Accredited Representatives roster. " +
        "Extract all organizations with their details into a JSON array. " +
        `Text chunk ${index + 1}/${textChunks.length}: ${chunk}`;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
      });
      
      const result = completion.choices[0].message.content;
      
      try {
        // Parse the JSON response
        const parsedResult = JSON.parse(result);
        
        // If the response is an array, extend our results
        if (Array.isArray(parsedResult)) {
          allOrganizations = [...allOrganizations, ...parsedResult];
        } else if (parsedResult.organizations && Array.isArray(parsedResult.organizations)) {
          // Some models return { organizations: [...] }
          allOrganizations = [...allOrganizations, ...parsedResult.organizations];
        } else {
          logger.warn(`Unexpected format in chunk ${index + 1}, skipping`);
        }
      } catch (parseError) {
        logger.error(`Failed to parse GPT response for chunk ${index + 1}: ${parseError.message}`);
        // Continue with other chunks even if one fails
      }
    }
    
    logger.info(`Extracted ${allOrganizations.length} organizations successfully`);
    
    // Remove duplicates based on organization name
    const uniqueOrgs = [...new Map(allOrganizations.map(org => [org.name, org])).values()];
    logger.info(`Reduced to ${uniqueOrgs.length} unique organizations`);
    
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

module.exports = {
  structureWithGpt
};