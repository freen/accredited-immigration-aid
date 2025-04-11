const pdfParse = require('pdf-parse');
const { logger } = require('../utils/logger');

/**
 * Extracts text from a PDF buffer
 * @param {Buffer} pdfBuffer - Buffer containing PDF data
 * @returns {Promise<string>} - Extracted text from the PDF
 */
async function parsePdf(pdfBuffer) {
  try {
    logger.info('Beginning PDF text extraction');
    const data = await pdfParse(pdfBuffer);
    
    // Clean up text - remove excessive whitespace and normalize
    const cleanedText = data.text
      .replace(/\s+/g, ' ')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .trim();
    
    logger.info(`PDF text extracted successfully. Character count: ${cleanedText.length}`);
    return cleanedText;
  } catch (error) {
    logger.error(`PDF parsing failed: ${error.message}`);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

module.exports = {
  parsePdf
};