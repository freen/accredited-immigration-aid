const fs = require('fs').promises;
const path = require('path');
const { downloadPdf } = require('../utils/downloader');
const { parsePdf } = require('../extractors/pdfParser');
const { logger } = require('../utils/logger');

/**
 * Downloads a PDF from a URL, extracts its text, and saves it to a file
 * @param {string} url - URL of the PDF to process
 * @param {string} outputPath - Path to save the extracted text
 */
async function extractAndSaveText(url, outputPath) {
  try {
    logger.info(`Downloading PDF from ${url}...`);
    const tempFile = await downloadPdf(url);
    logger.info('PDF downloaded successfully');
    
    logger.info('Extracting text from PDF...');
    const extractedText = await parsePdf(tempFile.path);
    logger.info(`Text extracted successfully (${extractedText.length} characters)`);
    
    logger.info(`Saving text to ${outputPath}...`);
    await fs.writeFile(outputPath, extractedText);
    logger.info('Text saved successfully');
    
    return extractedText;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Main function that runs when script is executed directly
 */
async function main() {
  // Allow URL to be specified as command line argument
  const url = process.argv[2] || 'https://www.justice.gov/eoir/page/file/942306/dl';
  const outputFile = process.argv[3] || path.join(__dirname, '../mock-data/roster-pdf2html.html');
  
  // Ensure the directory exists
  const outputDir = path.dirname(outputFile);
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
  }
  
  try {
    await extractAndSaveText(url, outputFile);
  } catch (error) {
    console.error('Failed to process PDF:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly (not imported)
if (require.main === module) {
  main();
}

// Export for use in other scripts
module.exports = {
  extractAndSaveText
};